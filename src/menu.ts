import { LitElement, html, nothing } from "lit";
import { menuStyles } from "./menu.styles.js";
import {
  flattenMenu,
  isAction,
  isGroup,
  type MenuEntry,
  type MenuAction,
  type MenuSelectDetail,
  type SelectionMode,
} from "./menu.types.js";

let menuId = 0;

export class BubbleMenu extends LitElement {
  static properties = {
    items: { attribute: false },
    variant: { reflect: true },
    colorScheme: { attribute: "color-scheme", reflect: true },
    selectionMode: { attribute: "selection-mode" },
    menuLabel: { attribute: "menu-label" },
    quick: { type: Boolean, reflect: true },
    density: { type: Number, reflect: true },
    inactive: { type: Boolean, reflect: true },
    _active: { state: true },
    _selected: { state: true },
    _childItems: { state: true },
  };

  static styles = menuStyles;
  items: MenuEntry[] = [];
  variant: "vertical" | "baseline" = "vertical";
  colorScheme: "standard" | "vibrant" = "standard";
  selectionMode: SelectionMode = "none";
  menuLabel = "";
  quick = false;
  density = 0;
  inactive = false;
  private _active = 0;
  private _selected: Set<string> | undefined;
  private _childItems: MenuEntry[] = [];
  private anchor?: HTMLElement;
  private point?: { x: number; y: number };
  private listeners?: AbortController;
  private resize?: ResizeObserver;
  private buffer = "";
  private typedAt = 0;
  private hoverTimer?: ReturnType<typeof setTimeout>;
  private previousControls: string | null = null;
  private previousExpanded: string | null = null;
  private readonly surfaceId = `bubble-menu-${++menuId}`;

  get open(): boolean {
    return this.surface?.matches(":popover-open") ?? false;
  }
  private get surface() {
    return this.renderRoot.querySelector<HTMLDivElement>("[popover]");
  }
  private get controls() {
    return [...this.renderRoot.querySelectorAll<HTMLElement>("[data-item]")];
  }
  private get actions() {
    return flattenMenu(this.items);
  }
  private get child() {
    return this.renderRoot.querySelector<BubbleMenu>("bubble-menu");
  }
  get selectedIds(): string[] {
    return [
      ...(this._selected ??
        new Set(
          this.actions.filter((item) => item.selected).map((item) => item.id),
        )),
    ];
  }
  setSelection(ids: string[]) {
    this._selected = new Set(ids);
    this.requestUpdate();
  }

  async show(
    anchor: HTMLElement,
    options: { last?: boolean; x?: number; y?: number } = {},
  ) {
    if (this.open) this.close(false);
    if (!this.menuLabel.trim())
      throw new Error("bubble-menu requires a localized menu-label.");
    if (this.variant === "baseline" && this.colorScheme === "vibrant")
      throw new Error("Vibrant colours require the vertical menu variant.");
    this.validateItems(this.items);
    this.anchor = anchor;
    this.point =
      options.x !== undefined && options.y !== undefined
        ? { x: options.x, y: options.y }
        : undefined;
    this._active = options.last
      ? Math.max(0, this.actions.length - 1)
      : Math.max(
          0,
          this.actions.findIndex((item) => this.selectedIds.includes(item.id)),
        );
    await this.updateComplete;
    const surface = this.surface!;
    if (typeof surface.showPopover !== "function")
      throw new Error("This browser does not support the Popover API.");
    this.previousControls = anchor.getAttribute("aria-controls");
    this.previousExpanded = anchor.getAttribute("aria-expanded");
    anchor.setAttribute("aria-expanded", "true");
    // Element references preserve the relationship across shadow-root boundaries.
    anchor.ariaControlsElements = [surface];
    surface.showPopover();
    surface.dir = getComputedStyle(anchor).direction;
    this.reposition();
    this.controls[this._active]?.focus();
    this.listeners = new AbortController();
    const signal = this.listeners.signal;
    document.addEventListener("pointerdown", this.onOutside, {
      capture: true,
      signal,
    });
    document.addEventListener("focusin", this.onDocumentFocus, { signal });
    window.addEventListener("resize", this.reposition, { signal });
    document.addEventListener("scroll", this.reposition, {
      capture: true,
      signal,
    });
    this.resize = new ResizeObserver(this.reposition);
    this.resize.observe(anchor);
    this.resize.observe(surface);
    this.dispatchEvent(
      new CustomEvent("menu-open", { bubbles: true, composed: true }),
    );
  }

  close(restoreFocus = true) {
    clearTimeout(this.hoverTimer);
    this.child?.close(false);
    this.inactive = false;
    this._childItems = [];
    this.listeners?.abort();
    this.resize?.disconnect();
    if (!this.open) return;
    this.surface!.hidePopover();
    if (this.anchor) {
      this.anchor.ariaControlsElements = [];
      for (const [name, value] of [
        ["aria-controls", this.previousControls],
        ["aria-expanded", this.previousExpanded],
      ] as const) {
        if (value === null) this.anchor.removeAttribute(name);
        else this.anchor.setAttribute(name, value);
      }
      if (restoreFocus && this.anchor.isConnected) this.anchor.focus();
    }
    this.dispatchEvent(
      new CustomEvent("menu-close", { bubbles: true, composed: true }),
    );
  }

  disconnectedCallback() {
    this.close(false);
    super.disconnectedCallback();
  }

  private validateItems(items: MenuEntry[], ids = new Set<string>()) {
    for (const entry of items) {
      if (isGroup(entry)) {
        if (!entry.label) throw new Error("Menu groups require a label.");
        this.validateItems(entry.items, ids);
        continue;
      }
      const item = entry;
      if (!isAction(item)) continue;
      if (!item.id || !item.label || ids.has(item.id))
        throw new Error("Menu items require unique non-empty ids and labels.");
      if (item.href && (item.children || this.selectionMode !== "none"))
        throw new Error(
          "Navigation items cannot also select or open a submenu.",
        );
      if (
        item.href &&
        !["http:", "https:", "mailto:", "tel:"].includes(
          new URL(item.href, document.baseURI).protocol,
        )
      )
        throw new Error("Unsupported menu link protocol.");
      ids.add(item.id);
      if (item.children) this.validateItems(item.children, ids);
    }
  }

  private containsPath(path: EventTarget[]): boolean {
    return (
      path.includes(this) ||
      path.includes(this.anchor!) ||
      !!this.child?.containsPath(path)
    );
  }
  private onOutside = (event: PointerEvent) => {
    if (!this.containsPath(event.composedPath())) this.close(false);
  };
  private onDocumentFocus = (event: FocusEvent) => {
    if (!this.containsPath(event.composedPath())) this.close(false);
  };

  private reposition = () => {
    if (!this.open || !this.anchor) return;
    const surface = this.surface!;
    const rect = this.anchor.getBoundingClientRect();
    if (
      !this.anchor.isConnected ||
      rect.bottom < 0 ||
      rect.top > innerHeight ||
      rect.right < 0 ||
      rect.left > innerWidth
    ) {
      this.close(false);
      return;
    }
    const box = surface.getBoundingClientRect();
    const rtl = getComputedStyle(this.anchor).direction === "rtl";
    const submenu =
      this.parentElement instanceof BubbleMenu ||
      (this.getRootNode() instanceof ShadowRoot &&
        (this.getRootNode() as ShadowRoot).host instanceof BubbleMenu);
    let left =
      this.point?.x ??
      (submenu
        ? rtl
          ? rect.left - box.width
          : rect.right
        : rtl
          ? rect.right - box.width
          : rect.left);
    let top = this.point?.y ?? (submenu ? rect.top : rect.bottom);
    if (submenu && (left < 0 || left + box.width > innerWidth))
      left = rtl ? rect.right : rect.left - box.width;
    if (top + box.height > innerHeight)
      top =
        submenu || this.point
          ? innerHeight - box.height
          : rect.top - box.height;
    surface.style.left = `${Math.max(0, Math.min(left, innerWidth - box.width))}px`;
    surface.style.top = `${Math.max(0, Math.min(top, innerHeight - box.height))}px`;
  };

  private async focusItem(index: number) {
    if (!this.actions.length) return;
    this._active = (index + this.actions.length) % this.actions.length;
    this.child?.close(false);
    this._childItems = [];
    this.inactive = false;
    await this.updateComplete;
    this.controls[this._active]?.focus();
  }

  private async openChild(item: MenuAction, anchor: HTMLElement) {
    if (item.disabled || !item.children?.length) return;
    this.child?.close(false);
    this._active = this.actions.indexOf(item);
    this._childItems = item.children;
    this.inactive = true;
    await this.updateComplete;
    await this.child!.show(anchor);
  }

  private onKey = (event: KeyboardEvent) => {
    const rtl = this.surface?.dir === "rtl";
    const index = this._active;
    if (event.key === "Tab") {
      event.stopPropagation();
      this.close();
      return;
    }
    if (
      [
        "ArrowDown",
        "ArrowUp",
        "Home",
        "End",
        "Escape",
        "Tab",
        "ArrowLeft",
        "ArrowRight",
      ].includes(event.key)
    ) {
      event.preventDefault();
      event.stopPropagation();
      if (event.key === "ArrowDown") void this.focusItem(index + 1);
      if (event.key === "ArrowUp") void this.focusItem(index - 1);
      if (event.key === "Home") void this.focusItem(0);
      if (event.key === "End") void this.focusItem(this.actions.length - 1);
      if (
        event.key === "Escape" ||
        event.key === (rtl ? "ArrowRight" : "ArrowLeft")
      )
        this.close();
      if (event.key === (rtl ? "ArrowLeft" : "ArrowRight")) {
        const item = this.actions[index];
        if (item) void this.openChild(item, this.controls[index]);
      }
    } else if (
      event.key.length === 1 &&
      event.key !== " " &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      event.preventDefault();
      this.buffer =
        performance.now() - this.typedAt > 200
          ? event.key
          : this.buffer + event.key;
      this.typedAt = performance.now();
      const match = this.actions.findIndex((_, offset, items) => {
        const candidate = items[(index + offset + 1) % items.length];
        return (
          !candidate.disabled &&
          candidate.label
            .toLocaleLowerCase()
            .startsWith(this.buffer.toLocaleLowerCase())
        );
      });
      if (match >= 0) void this.focusItem(index + match + 1);
    }
  };

  private activate(event: MouseEvent, item: MenuAction) {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    if (item.children) {
      event.preventDefault();
      void this.openChild(item, event.currentTarget as HTMLElement);
      return;
    }
    if (this.selectionMode !== "none") {
      const selected = new Set(this.selectedIds);
      if (this.selectionMode === "single") {
        selected.clear();
        selected.add(item.id);
      } else if (selected.has(item.id)) selected.delete(item.id);
      else selected.add(item.id);
      this._selected = selected;
    }
    this.dispatchEvent(
      new CustomEvent<MenuSelectDetail>("menu-select", {
        detail: { item, selectedIds: this.selectedIds },
        bubbles: true,
        composed: true,
      }),
    );
    if (this.selectionMode !== "multi") this.close();
  }

  private renderItem(item: MenuAction, index: number) {
    const selected = this.selectedIds.includes(item.id);
    const showsIndicator =
      this.selectionMode !== "none" || this.actions.some((action) => action.icon);
    const role =
      this.selectionMode === "single"
        ? "menuitemradio"
        : this.selectionMode === "multi"
          ? "menuitemcheckbox"
          : "menuitem";
    const content = html` ${showsIndicator
        ? html`<span
            class=${selected ? "indicator" : "indicator icon"}
            aria-hidden="true"
            >${selected ? "✓" : (item.icon ?? "")}</span
          >`
        : nothing}
      <span class="content"
        >${item.label}${item.supportingText ? html`<span class="supporting">${item.supportingText}</span>` : nothing}</span
      >
      ${item.trailingText ? html`<span class="trailing">${item.trailingText}</span>` : nothing}
      ${item.badge ? html`<span>${item.badge}</span>` : nothing}
      ${item.children ? html`<span aria-hidden="true">${this.surface?.dir === "rtl" ? "‹" : "›"}</span>` : nothing}`;
    const click = (event: MouseEvent) => this.activate(event, item);
    const enter = () => {
      clearTimeout(this.hoverTimer);
      if (item.children && !item.disabled)
        this.hoverTimer = setTimeout(() => {
          const anchor = this.controls[index];
          if (anchor) void this.openChild(item, anchor);
        }, 200);
      else {
        this.child?.close(false);
        this.inactive = false;
      }
    };
    if (item.href)
      return html`<a
        data-item
        href=${item.href}
        role=${role}
        tabindex=${index === this._active ? 0 : -1}
        aria-disabled=${item.disabled ? "true" : nothing}
        @focus=${() => {
          this._active = index;
        }}
        @click=${click}
        @pointerenter=${enter}
        >${content}</a
      >`;
    return html`<button
      data-item
      type="button"
      role=${role}
      tabindex=${index === this._active ? 0 : -1}
      aria-checked=${this.selectionMode === "none" ? nothing : String(selected)}
      aria-disabled=${item.disabled ? "true" : nothing}
      aria-haspopup=${item.children ? "menu" : nothing}
      aria-expanded=${item.children ? String(this.inactive && this._childItems === item.children) : nothing}
      @focus=${() => {
        this._active = index;
      }}
      @click=${click}
      @pointerenter=${enter}
    >
      ${content}
    </button>`;
  }

  private renderEntry(entry: MenuEntry, next: () => number) {
    if (isGroup(entry))
      return html`<div class="group" role="group" aria-label=${entry.label}>
        <div class="group-label" aria-hidden="true">${entry.label}</div>
        ${entry.items.map((item) => this.renderItem(item, next()))}
      </div>`;
    if (isAction(entry)) return this.renderItem(entry, next());
    return html`<div role="separator"></div>`;
  }

  render() {
    let index = 0;
    const next = () => index++;
    return html` <div
        id=${this.surfaceId}
        part="surface"
        popover="manual"
        role="menu"
        aria-label=${this.menuLabel}
        style=${
          this.density
            ? `--md-comp-menu-item-target-height: calc(48px + ${this.density * 4}px)`
            : nothing
        }
        @keydown=${this.onKey}
        @pointerleave=${() => clearTimeout(this.hoverTimer)}
      >
        ${this.items.map((entry) => this.renderEntry(entry, next))}
      </div>
      ${
        this._childItems.length
          ? html`<bubble-menu
              .items=${this._childItems}
              .variant=${this.variant}
              .colorScheme=${this.colorScheme}
              .selectionMode=${this.selectionMode}
              .menuLabel=${this.actions[this._active]?.label ?? this.menuLabel}
              .quick=${this.quick}
              @menu-close=${(event: Event) => {
                if (event.target === this.child) this.inactive = false;
              }}
              @menu-select=${() => {
                if (this.selectionMode !== "multi") this.close();
              }}
            ></bubble-menu>`
          : nothing
      }`;
  }
}

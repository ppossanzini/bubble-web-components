import { html, nothing, type PropertyValues } from "lit";
import { BubbleElement, moveFocus, type BubbleItem } from "./shared.js";
import { commonStyles } from "./shared.styles.js";
import { overlayStyles } from "./overlays.styles.js";
import type { BubbleMenu } from "./menu.js";
import type { MenuEntry } from "./menu.types.js";

export class BubbleDialog extends BubbleElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    label: {},
    variant: { reflect: true },
    modal: { type: Boolean },
    closeLabel: { attribute: "close-label" },
  };
  static styles = [commonStyles, overlayStyles];
  open = false;
  label = "";
  variant = "basic";
  modal = true;
  closeLabel = "";
  private opener?: HTMLElement;
  get dialog() {
    return this.renderRoot.querySelector("dialog")!;
  }
  async show(opener?: HTMLElement) {
    this.opener = opener ?? (document.activeElement as HTMLElement);
    this.open = true;
    await this.updateComplete;
  }
  close(returnValue = "") {
    if (this.dialog?.open) this.dialog.close(returnValue);
    else if (this.open) this.closed(returnValue);
    this.open = false;
  }
  protected updated(changed: PropertyValues) {
    if (!changed.has("open") && !changed.has("modal")) return;
    if (this.open && !this.dialog.open) {
      this.opener ??= document.activeElement as HTMLElement;
      if (this.modal) {
        this.dialog.showModal();
        void this.focusInside();
      } else this.dialog.show();
    } else if (!this.open && this.dialog.open) this.dialog.close();
  }
  private async focusInside() {
    await this.updateComplete;
    const candidates = this.querySelectorAll<HTMLElement>(
      "[autofocus], bubble-button, bubble-icon-button, button, a, input, textarea, select",
    );
    for (const candidate of candidates) {
      const target =
        candidate.shadowRoot?.querySelector<HTMLElement>(
          "button, a, input, textarea, select",
        ) ?? candidate;
      if (target.matches(":disabled")) continue;
      target.focus();
      return;
    }
    this.dialog.tabIndex = -1;
    this.dialog.focus();
  }
  disconnectedCallback() {
    if (this.dialog?.open) this.dialog.close();
    super.disconnectedCallback();
  }
  private closed(value?: string | Event) {
    this.open = false;
    this.opener?.focus();
    this.opener = undefined;
    this.emit("closed", {
      returnValue:
        typeof value === "string" ? value : (this.dialog?.returnValue ?? ""),
    });
  }
  protected renderContent() {
    return html`<header>${this.label}</header>
      <div><slot></slot></div>
      <footer>
        ${this.closeLabel ? html`<bubble-button variant="text" @click=${() => this.close()}>${this.closeLabel}</bubble-button>` : nothing}<slot
          name="actions"
        ></slot>
      </footer>`;
  }
  private onKeydown = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || event.defaultPrevented || !this.open) return;
    if (!this.emit("before-close", { reason: "escape" })) return;
    event.preventDefault();
    this.close();
  };
  protected render() {
    return html`<dialog
      aria-label=${this.label}
      @close=${this.closed}
      @keydown=${this.onKeydown}
      @cancel=${(event: Event) => {
        if (!this.emit("before-close", { reason: "escape" }))
          event.preventDefault();
      }}
    >
      ${this.renderContent()}
    </dialog>`;
  }
}
export class BubbleBottomSheet extends BubbleDialog {
  static properties = {
    ...BubbleDialog.properties,
    dragHandle: { type: Boolean, attribute: "drag-handle" },
  };
  variant = "modal";
  dragHandle = false;
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("placement", "bottom");
  }
  protected renderContent() {
    return html`${this.dragHandle ? html`<div class="drag-handle" aria-hidden="true"></div>` : nothing}${super.renderContent()}`;
  }
  protected render() {
    return this.variant === "standard"
      ? html`<section
          class="standard"
          aria-label=${this.label}
          ?hidden=${!this.open}
        >
          ${this.renderContent()}
        </section>`
      : super.render();
  }
  protected updated(changed: PropertyValues) {
    if (this.variant !== "standard") super.updated(changed);
  }
}
export class BubbleSideSheet extends BubbleDialog {
  static properties = {
    ...BubbleDialog.properties,
    detached: { type: Boolean, reflect: true },
  };
  variant = "modal";
  detached = false;
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("placement", "side");
  }
  protected renderContent() {
    return html`<header class="sheet-header">
        <span>${this.label}</span>
        ${this.closeLabel
          ? html`<bubble-icon-button
              variant="standard"
              size="small"
              label=${this.closeLabel}
              @click=${() => this.close()}
              ><span aria-hidden="true" style="font-size:24px;line-height:1"
                >✕</span
              ></bubble-icon-button
            >`
          : nothing}
      </header>
      <div class="sheet-content"><slot></slot></div>
      <slot name="actions"></slot>`;
  }
  protected render() {
    return this.variant === "standard"
      ? html`<aside
          class="standard"
          aria-label=${this.label}
          ?hidden=${!this.open}
        >
          ${this.renderContent()}
        </aside>`
      : super.render();
  }
  protected updated(changed: PropertyValues) {
    if (this.variant !== "standard") super.updated(changed);
  }
}
export class BubbleNavigationDrawer extends BubbleSideSheet {
  static properties = {
    ...BubbleSideSheet.properties,
    items: { attribute: false },
    value: {},
  };
  items: BubbleItem[] = [];
  value = "";
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("placement", "start");
  }
  protected renderContent() {
    return html`<header class="drawer-header">${this.label}</header>
      <nav class="drawer-nav" aria-label=${this.label}>
        ${this.items.map((item) => {
          const active = this.value === item.id;
          const select = () => {
            this.value = item.id;
            if (this.variant !== "standard") this.close();
            this.emit("navigate", { id: item.id });
          };
          const content = html`${item.icon
              ? html`<span class="drawer-icon icon" aria-hidden="true"
                  >${item.icon}</span
                >`
              : nothing}<span class="drawer-label">${item.label}</span>${item.badge
              ? html`<span class="drawer-badge">${item.badge}</span>`
              : nothing}`;
          return item.href && !item.disabled
            ? html`<a
                class="drawer-item"
                href=${item.href}
                aria-current=${active ? "page" : nothing}
                @click=${select}
                >${content}</a
              >`
            : html`<button
                class="drawer-item"
                type="button"
                ?disabled=${item.disabled}
                aria-current=${active ? "page" : nothing}
                @click=${select}
              >
                ${content}
              </button>`;
        })}
      </nav>
      <slot></slot>
      <footer>
        ${this.closeLabel ? html`<bubble-button variant="text" @click=${() => this.close()}>${this.closeLabel}</bubble-button>` : nothing}
      </footer>`;
  }
}

export class BubbleSnackbar extends BubbleElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    message: {},
    actionLabel: { attribute: "action-label" },
    closeLabel: { attribute: "close-label" },
    duration: { type: Number },
  };
  static styles = [commonStyles, overlayStyles];
  open = false;
  message = "";
  actionLabel = "";
  closeLabel = "";
  duration = 5000;
  private timer?: ReturnType<typeof setTimeout>;
  private exitTimer?: ReturnType<typeof setTimeout>;
  private queue: string[] = [];
  show(message = this.message) {
    if (this.open) {
      this.queue.push(message);
      this.emit("queued", { pending: this.queue.length });
      return;
    }
    this.message = message;
    this.open = true;
    this.restart();
  }
  close(reason = "dismiss") {
    clearTimeout(this.timer);
    this.open = false;
    const next = this.queue.shift();
    if (next !== undefined) {
      this.exitTimer = setTimeout(() => this.show(next), 160);
    }
    this.emit("closed", { reason });
  }
  private restart() {
    clearTimeout(this.timer);
    if (this.open && this.duration > 0)
      this.timer = setTimeout(
        () => this.close("timeout"),
        Math.max(4000, this.duration),
      );
  }
  protected updated(changed: PropertyValues) {
    const surface = this.renderRoot.querySelector<HTMLElement>(".snackbar");
    if (this.open && surface && !surface.matches(":popover-open"))
      surface.showPopover();
    if (changed.has("open") || changed.has("duration")) this.restart();
  }
  disconnectedCallback() {
    clearTimeout(this.timer);
    clearTimeout(this.exitTimer);
    this.queue = [];
    super.disconnectedCallback();
  }
  protected render() {
    return html`<div role="status" aria-live="polite" aria-atomic="true">
      ${
        this.open
          ? html`<div
              class="snackbar"
              popover="manual"
              @pointerenter=${() => clearTimeout(this.timer)}
              @pointerleave=${this.restart}
              @focusin=${() => clearTimeout(this.timer)}
              @focusout=${this.restart}
            >
              <span>${this.message}</span>${
                this.actionLabel
                  ? html`<button
                      @click=${() => {
                        this.emit("action", {});
                        this.close("action");
                      }}
                    >
                      ${this.actionLabel}
                    </button>`
                  : nothing
              }${this.closeLabel ? html`<button @click=${() => this.close()}>${this.closeLabel}</button>` : nothing}
            </div>`
          : nothing
      }
    </div>`;
  }
}

export class BubbleTooltip extends BubbleElement {
  static properties = {
    label: {},
    variant: { reflect: true },
    supportingText: { attribute: "supporting-text" },
    persistent: { type: Boolean, reflect: true },
  };
  static styles = [commonStyles, overlayStyles];
  label = "";
  variant = "plain";
  supportingText = "";
  persistent = false;
  private trigger?: HTMLElement;
  private previousDescription: string | null = null;
  private controller?: AbortController;
  private hideTimer?: ReturnType<typeof setTimeout>;
  private dismissController?: AbortController;
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("tooltip", "");
  }
  disconnectedCallback() {
    this.cleanup();
    super.disconnectedCallback();
  }
  private cleanup() {
    clearTimeout(this.hideTimer);
    this.controller?.abort();
    this.dismissController?.abort();
    if (this.trigger) {
      if (this.previousDescription === null)
        this.trigger.removeAttribute("aria-description");
      else
        this.trigger.setAttribute("aria-description", this.previousDescription);
    }
  }
  private async setup() {
    this.cleanup();
    const host =
      this.querySelector<HTMLElement>(
        "button,a,input,[tabindex],bubble-button,bubble-icon-button",
      ) ?? undefined;
    if (host && "updateComplete" in host)
      await (host as BubbleElement).updateComplete;
    this.trigger =
      host?.shadowRoot?.querySelector<HTMLElement>("button,a,input") ?? host;
    if (!this.trigger) return;
    this.previousDescription = this.trigger.getAttribute("aria-description");
    this.trigger.setAttribute("aria-description", this.label);
    this.controller = new AbortController();
    const options = { signal: this.controller.signal };
    for (const event of ["pointerenter", "focusin"])
      this.trigger.addEventListener(event, () => this.show(), options);
    for (const event of ["pointerleave", "focusout"])
      this.trigger.addEventListener(
        event,
        () => {
          if (!this.persistent && this.variant !== "rich") this.scheduleHide();
        },
        options,
      );
    this.trigger.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape") this.hide();
      },
      options,
    );
  }
  show() {
    clearTimeout(this.hideTimer);
    const tip = this.renderRoot.querySelector<HTMLElement>(".tooltip")!;
    if (!this.trigger || !tip) return;
    tip.showPopover();
    const gap = this.variant === "rich" ? 8 : 4;
    const anchor = this.trigger.getBoundingClientRect();
    const rect = tip.getBoundingClientRect();
    tip.style.left = `${Math.max(4, Math.min(innerWidth - rect.width - 4, anchor.left + (anchor.width - rect.width) / 2))}px`;
    tip.style.top = `${Math.max(4, anchor.bottom + rect.height + gap < innerHeight ? anchor.bottom + gap : anchor.top - rect.height - gap)}px`;
    if (this.variant === "rich") {
      this.dismissController?.abort();
      this.dismissController = new AbortController();
      const signal = this.dismissController.signal;
      document.addEventListener(
        "pointerdown",
        (event) => {
          const path = event.composedPath();
          if (!path.includes(this) && !path.includes(tip)) this.hide();
        },
        { capture: true, signal },
      );
      window.addEventListener("resize", () => this.hide(), { signal });
    }
  }
  hide() {
    clearTimeout(this.hideTimer);
    this.renderRoot.querySelector<HTMLElement>(".tooltip")?.hidePopover();
  }
  private scheduleHide() {
    if (this.persistent || this.variant === "rich") return;
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => {
      if (!this.matches(":focus-within") && !this.matches(":hover"))
        this.hide();
    }, 200);
  }
  protected render() {
    return html`<slot @slotchange=${this.setup}></slot>
      <div
        class="tooltip"
        popover="manual"
        role=${this.variant === "rich" ? "dialog" : "tooltip"}
        aria-label=${this.variant === "rich" ? this.label : nothing}
        @pointerenter=${() => clearTimeout(this.hideTimer)}
        @pointerleave=${this.scheduleHide}
        @focusin=${() => clearTimeout(this.hideTimer)}
        @focusout=${this.scheduleHide}
        @keydown=${(event: KeyboardEvent) => {
          if (event.key === "Escape") this.hide();
        }}
      >
        ${this.label}${
          this.variant === "rich"
            ? html`<p>${this.supportingText}</p>
                <slot name="content"></slot>
                <footer>
                  <slot name="actions"></slot>
                  <button
                    type="button"
                    class="tooltip-dismiss"
                    aria-label="Dismiss"
                    @click=${() => this.hide()}
                  >
                    ✕
                  </button>
                </footer>`
            : nothing
        }
      </div>`;
  }
}

export class BubbleFabMenu extends BubbleElement {
  static properties = {
    label: {},
    items: { attribute: false },
    color: { reflect: true },
    open: { type: Boolean, reflect: true },
  };
  static styles = [commonStyles, overlayStyles];
  label = "";
  items: BubbleItem[] = [];
  color: "primary" | "secondary" | "tertiary" = "primary";
  open = false;
  private get trigger() {
    return this.renderRoot.querySelector<HTMLButtonElement>(".fab-trigger")!;
  }
  private get surface() {
    return this.renderRoot.querySelector<HTMLElement>(".fab-actions")!;
  }
  protected updated() {
    if (this.open && !this.surface.matches(":popover-open")) {
      this.surface.showPopover();
      const rect = this.trigger.getBoundingClientRect();
      const above = Math.max(0, rect.top - 20);
      const below = Math.max(0, innerHeight - rect.bottom - 20);
      const placeAbove = above >= below;
      this.surface.style.maxBlockSize = `${placeAbove ? above : below}px`;
      const menu = this.surface.getBoundingClientRect();
      this.surface.style.left = `${Math.max(16, Math.min(innerWidth - menu.width - 16, rect.right - menu.width))}px`;
      this.surface.style.top = `${placeAbove ? Math.max(16, rect.top - menu.height - 4) : rect.bottom + 4}px`;
    } else if (!this.open && this.surface.matches(":popover-open"))
      this.surface.hidePopover();
  }
  private dismiss(restore = true) {
    if (this.surface.matches(":popover-open")) this.surface.hidePopover();
    this.open = false;
    if (restore) this.trigger.focus();
  }
  private async triggerKey(event: KeyboardEvent) {
    if (event.key === "Escape") this.dismiss();
    if (!["ArrowDown", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    this.open = true;
    await this.updateComplete;
    const buttons = this.surface.querySelectorAll<HTMLElement>(
      '[role="menuitem"]:not(:disabled)',
    );
    buttons[event.key === "ArrowDown" ? 0 : buttons.length - 1]?.focus();
  }
  protected render() {
    return html`<div class="fab-menu">
      <div
        class="fab-actions"
        id="actions"
        popover="auto"
        role="menu"
        aria-label=${this.label}
        @toggle=${(event: ToggleEvent) => {
          this.open = event.newState === "open";
        }}
        @keydown=${(event: KeyboardEvent) => {
          const controls = Array.from(
            this.surface.querySelectorAll<HTMLElement>(
              '[role="menuitem"]:not(:disabled)',
            ),
          );
          moveFocus(event, controls, true);
          if (event.key === "Escape") this.dismiss();
          if (event.key === "Tab") this.dismiss();
          if (
            event.key.length === 1 &&
            !event.ctrlKey &&
            !event.altKey &&
            event.key !== " "
          ) {
            const start = controls.indexOf(
              this.shadowRoot?.activeElement as HTMLElement,
            );
            const ordered = [
              ...controls.slice(start + 1),
              ...controls.slice(0, start + 1),
            ];
            ordered
              .find((control) =>
                control.textContent
                  ?.trim()
                  .toLocaleLowerCase()
                  .startsWith(event.key.toLocaleLowerCase()),
              )
              ?.focus();
          }
        }}
      >
        ${this.items.map(
          (item) =>
            html`<button
              class="fab-item"
              role="menuitem"
              tabindex="-1"
              ?disabled=${item.disabled}
              @click=${() => {
                this.dismiss();
                this.emit("action", { id: item.id });
              }}
            >
              ${item.icon ? html`<span class="icon" aria-hidden="true">${item.icon}</span>` : nothing}${item.label}
            </button>`,
        )}
      </div>
      <button
        class="fab-trigger"
        id="trigger"
        aria-label=${this.label}
        aria-expanded=${String(this.open)}
        aria-controls="actions"
        aria-haspopup="menu"
        @keydown=${this.triggerKey}
        @click=${() => {
          this.open = !this.open;
        }}
      >
        ${this.open ? "×" : html`<slot name="icon">+</slot>`}
      </button>
    </div>`;
  }
}

export class BubbleSplitButton extends BubbleElement {
  static properties = {
    label: {},
    menuLabel: { attribute: "menu-label" },
    items: { attribute: false },
    disabled: { type: Boolean },
    icon: { type: Boolean, reflect: true },
    variant: { reflect: true },
    size: { reflect: true },
  };
  static styles = [commonStyles, overlayStyles];
  label = "";
  menuLabel = "";
  items: MenuEntry[] = [];
  disabled = false;
  icon = false;
  variant = "filled";
  size = "small";
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("split", "");
  }
  protected render() {
    return html`<bubble-button
        variant=${this.variant}
        size=${this.size}
        ?disabled=${this.disabled}
        @click=${() => this.emit("action", {})}
        >${this.icon
          ? html`<slot name="icon" slot="icon" aria-hidden="true"></slot>`
          : nothing}${this.label}</bubble-button
      ><bubble-icon-button
        variant=${this.variant}
        size=${this.size}
        label=${this.menuLabel}
        ?disabled=${this.disabled}
        @click=${(event: Event) => {
          const menu =
            this.renderRoot.querySelector<BubbleMenu>("bubble-menu")!;
          const host = event.currentTarget as HTMLElement;
          menu.show(
            host.shadowRoot?.querySelector<HTMLElement>("button") ?? host,
          );
        }}
        >▾</bubble-icon-button
      ><bubble-menu
        .items=${this.items}
        menu-label=${this.menuLabel}
      ></bubble-menu>`;
  }
}

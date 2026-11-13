import { html, nothing } from "lit";
import {
  BubbleElement,
  BubbleFormElement,
  moveFocus,
  type BubbleItem,
} from "./shared.js";
import { commonStyles } from "./shared.styles.js";
import { listLabels } from "./localization.js";
import { surfaceStyles } from "./surfaces.styles.js";

export class BubbleAppBar extends BubbleElement {
  static properties = {
    label: {},
    variant: { reflect: true },
    sticky: { type: Boolean, reflect: true },
    scrolled: { type: Boolean, reflect: true },
    subtitle: { reflect: true },
    alignment: { reflect: true },
    collapsed: { type: Boolean, reflect: true },
  };
  static styles = [commonStyles, surfaceStyles];
  label = "";
  variant = "small";
  sticky = false;
  scrolled = false;
  subtitle = "";
  alignment = "leading";
  collapsed = false;
  protected render() {
    return html`<header class="bar">
      <slot name="leading"></slot>
      ${
        this.variant === "search"
          ? html`<div class="title-group"><slot></slot></div>`
          : html`<div class="title-group">
              <h1 class="title"><slot>${this.label}</slot></h1>
              ${this.subtitle ? html`<p class="subtitle">${this.subtitle}</p>` : nothing}
            </div>`
      }
      <slot name="trailing"></slot>
    </header>`;
  }
}
export class BubbleToolbar extends BubbleElement {
  static properties = {
    label: {},
    variant: { reflect: true },
    orientation: { reflect: true },
    color: { reflect: true },
  };
  static styles = [commonStyles, surfaceStyles];
  label = "";
  variant = "docked";
  orientation = "horizontal";
  color = "standard";
  private controls() {
    return Array.from(
      this.querySelectorAll<HTMLElement>(
        "button,a,bubble-button,bubble-icon-button",
      ),
    )
      .map(
        (host) =>
          host.shadowRoot?.querySelector<HTMLElement>(".button") ?? host,
      )
      .filter((control) => !(control as HTMLButtonElement).disabled);
  }
  protected render() {
    return html`<div
      class="toolbar"
      role="toolbar"
      aria-label=${this.label}
      aria-orientation=${this.orientation}
      @keydown=${(event: KeyboardEvent) => moveFocus(event, this.controls(), this.orientation === "vertical")}
    >
      <slot
        @slotchange=${() => {
          Promise.all(
            Array.from(this.children).map(
              (child) => (child as BubbleElement).updateComplete,
            ),
          ).then(() =>
            this.controls().forEach(
              (control, index) => (control.tabIndex = index === 0 ? 0 : -1),
            ),
          );
        }}
      ></slot>
    </div>`;
  }
}
export class BubbleCard extends BubbleElement {
  static properties = {
    variant: { reflect: true },
    orientation: { reflect: true },
    href: {},
    label: {},
  };
  static styles = [commonStyles, surfaceStyles];
  variant = "filled";
  orientation = "vertical";
  href = "";
  label = "";
  protected render() {
    return html`<article class="card" aria-label=${this.label || nothing}>
      <slot name="media"></slot>
      ${this.href ? html`<a href=${this.href}><slot></slot></a>` : html`<div class="card-content"><slot></slot></div>`}
    </article>`;
  }
}
export class BubbleBadge extends BubbleElement {
  static properties = {
    value: {},
    label: {},
    small: { type: Boolean, reflect: true },
    max: { type: Number },
  };
  static styles = [commonStyles, surfaceStyles];
  value = "";
  label = "";
  small = false;
  max = 999;
  protected render() {
    return html`<span
      class="badge"
      role=${this.label ? "status" : nothing}
      aria-label=${this.label || nothing}
      aria-hidden=${this.label ? nothing : "true"}
      >${this.small ? nothing : Number(this.value) > this.max ? `${this.max}+` : this.value}</span
    >`;
  }
}
export class BubbleDivider extends BubbleElement {
  static properties = {
    vertical: { type: Boolean, reflect: true },
    inset: { type: Boolean, reflect: true },
    variant: { reflect: true },
    decorative: { type: Boolean },
  };
  static styles = [commonStyles, surfaceStyles];
  vertical = false;
  inset = false;
  variant = "full";
  decorative = false;
  private get mode() {
    return this.variant || (this.inset ? "inset" : "full");
  }
  protected render() {
    if (!this.vertical && this.mode === "full")
      return html`<hr
        class="divider"
        role=${this.decorative ? "none" : nothing}
      />`;
    return html`<div
      class="divider"
      data-mode=${this.mode}
      role=${this.decorative ? "none" : "separator"}
      aria-orientation=${this.decorative ? nothing : this.vertical ? "vertical" : "horizontal"}
    ></div>`;
  }
}
export class BubbleList extends BubbleElement {
  static properties = {
    items: { attribute: false },
    label: {},
    variant: { reflect: true },
    interactive: { type: Boolean },
    selection: { reflect: true },
    value: { attribute: false },
    expanded: { attribute: false },
  };
  static styles = [commonStyles, surfaceStyles];
  items: BubbleItem[] = [];
  label = "";
  variant = "standard";
  interactive = false;
  selection: "none" | "single" | "multiple" = "none";
  value: string | string[] = "";
  expanded: string[] = [];
  private selectedIds() {
    if (Array.isArray(this.value)) return [...this.value];
    return this.value ? [this.value] : [];
  }
  private isSelected(item: BubbleItem) {
    return (
      this.selectedIds().includes(item.id) ||
      (this.selection === "none" && Boolean(item.selected))
    );
  }
  private toggle(item: BubbleItem) {
    if (item.items) {
      const open = this.expanded.includes(item.id);
      this.expanded = open
        ? this.expanded.filter((id) => id !== item.id)
        : [...this.expanded, item.id];
      this.emit("expand", { id: item.id, expanded: !open });
      this.requestUpdate();
    }
    if (this.selection === "none") {
      this.emit("action", { id: item.id });
      return;
    }
    if (this.selection === "single") {
      this.value = item.id;
    } else {
      const current = this.selectedIds();
      this.value = current.includes(item.id)
        ? current.filter((id) => id !== item.id)
        : [...current, item.id];
    }
    this.emit("change", {
      value: this.value,
      id: item.id,
      selected: this.isSelected(item),
    });
  }
  private content(item: BubbleItem) {
    return html`${item.icon ? html`<span class="icon" aria-hidden="true">${item.icon}</span>` : nothing}<span
        class="list-text"
        ><span>${item.label}</span
        >${item.supportingText ? html`<span class="support">${item.supportingText}</span>` : nothing}</span
      >${item.badge
        ? html`<span class="list-badge">${item.badge}</span>`
        : nothing}`;
  }
  private listRole() {
    return this.selection === "single" ? "listbox" : nothing;
  }
  private state(item: BubbleItem) {
    return this.isSelected(item) ? "true" : nothing;
  }
  private disclosure(item: BubbleItem) {
    if (!item.items) return nothing;
    const open = this.expanded.includes(item.id);
    return html`<button
      class="list-disclosure"
      type="button"
      aria-expanded=${String(open)}
      aria-label=${`${open ? listLabels(document.documentElement.lang).collapse : listLabels(document.documentElement.lang).expand} ${item.label}`}
      @click=${(event: Event) => {
        event.stopPropagation();
        this.toggle(item);
      }}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d=${open ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"}></path>
      </svg>
    </button>`;
  }
  private nested(item: BubbleItem) {
    if (!item.items || !this.expanded.includes(item.id)) return nothing;
    return html`<ul class="list-sublist">
      ${item.items.map(
        (child) =>
          html`<li>
            <button
              class="list-item"
              type="button"
              role=${this.selection === "single" ? "option" : nothing}
              aria-selected=${this.selection === "single" ? (this.state(child) ?? "false") : nothing}
              aria-current=${this.selection === "single" ? nothing : this.state(child)}
              ?disabled=${child.disabled}
              @click=${() => this.toggle(child)}
            >
              ${this.content(child)}
            </button>
          </li>`,
      )}
    </ul>`;
  }
  protected render() {
    const selectable = this.selection !== "none";
    return html`<ul
      role=${this.listRole()}
      aria-label=${this.label || nothing}
      aria-multiselectable=${this.selection === "multiple" ? "true" : nothing}
    >
      ${this.items.map((item) => {
        const selected =
          this.selection === "single" ? this.state(item) : nothing;
        const current =
          this.selection === "single" ? nothing : this.state(item);
        const role = this.selection === "single" ? "option" : nothing;
        const expanded = item.items
          ? String(this.expanded.includes(item.id))
          : nothing;
        return html`<li>
          <div class="list-row">
            ${
              item.href && !item.disabled
                ? html`<a
                    class="list-item"
                    href=${item.href}
                    role=${role}
                    aria-selected=${selected}
                    aria-current=${current}
                    aria-expanded=${expanded}
                    >${this.content(item)}</a
                  >`
                : !this.interactive && !selectable
                  ? html`<div
                      class="list-item"
                      role=${role}
                      aria-selected=${selected}
                      aria-current=${current}
                      aria-disabled=${item.disabled ? "true" : nothing}
                      aria-expanded=${expanded}
                    >
                      ${this.content(item)}
                    </div>`
                  : html`<button
                      class="list-item"
                      type="button"
                      role=${role}
                      aria-selected=${selected}
                      aria-current=${current}
                      aria-expanded=${expanded}
                      ?disabled=${item.disabled}
                      @click=${() => this.toggle(item)}
                    >
                      ${this.content(item)}
                    </button>`
            }
            ${this.disclosure(item)}
          </div>
          ${this.nested(item)}
        </li>`;
      })}<slot
      ></slot>
    </ul>`;
  }
}
export class BubbleChip extends BubbleFormElement {
  static properties = {
    ...BubbleFormElement.properties,
    variant: { reflect: true },
    label: {},
    selected: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    elevated: { type: Boolean, reflect: true },
    removable: { type: Boolean },
    removeLabel: { attribute: "remove-label" },
    href: {},
  };
  static styles = [commonStyles, surfaceStyles];
  variant = "assist";
  label = "";
  selected = false;
  disabled = false;
  elevated = false;
  removable = false;
  removeLabel = "";
  href = "";
  private initialSelected = false;
  protected firstUpdated() {
    super.firstUpdated();
    this.initialSelected = this.selected;
  }
  formResetCallback() {
    super.formResetCallback();
    this.selected = this.initialSelected;
  }
  formStateRestoreCallback(state: string | File | FormData | null) {
    this.selected = state === "selected";
  }
  protected syncForm() {
    super.syncForm();
    this.internals.setFormValue(
      this.variant === "filter" && this.selected && !this.isDisabled
        ? this.value || "on"
        : null,
      this.selected ? "selected" : "unselected",
    );
  }
  private activate() {
    this.emit("action", {});
  }
  protected render() {
    return html`<span class="chip"
      >${
        this.variant === "filter"
          ? html`<label
              ><input
                type="checkbox"
                .checked=${this.selected}
                ?disabled=${this.isDisabled}
                ?required=${this.required}
                @change=${(event: Event) => {
                  this.selected = (event.target as HTMLInputElement).checked;
                  this.syncForm();
                  this.emit("change", { selected: this.selected });
                }} /><slot name="avatar"></slot
              ><slot name="icon"></slot>${this.label}<slot></slot
            ></label>`
          : this.href && !this.isDisabled
            ? html`<a href=${this.href}
                ><slot name="avatar"></slot
                ><slot name="icon"></slot>${this.label}</a
              >`
            : html`<button ?disabled=${this.isDisabled} @click=${this.activate}>
                <slot name="avatar"></slot
                ><slot name="icon"></slot>${this.label}<slot></slot>
              </button>`
      }${this.removable ? html`<button class="remove" ?disabled=${this.isDisabled} aria-label=${this.removeLabel} @click=${() => this.emit("remove", {})}>×</button>` : nothing}</span
    >`;
  }
}

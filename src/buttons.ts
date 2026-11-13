import { html, nothing } from "lit";
import { BolleElement, moveFocus } from "./shared.js";
import { commonStyles } from "./shared.styles.js";
import { buttonStyles, groupStyles } from "./buttons.styles.js";
import type {
  ActionVariant,
  ActionSize,
  ActionShape,
  FabColor,
} from "./catalogue.types.js";

export class BolleButton extends BolleElement {
  static formAssociated = true;
  static properties = {
    variant: { reflect: true },
    size: { reflect: true },
    shape: { reflect: true },
    disabled: { type: Boolean, reflect: true },
    selected: { type: Boolean, reflect: true },
    toggle: { type: Boolean, reflect: true },
    label: {},
    href: {},
    target: {},
    type: {},
    expanded: { type: Boolean },
    controls: {},
    haspopup: {},
    name: {},
    value: {},
    _formDisabled: { state: true },
    width: { reflect: true },
    color: { reflect: true },
  };
  static styles = [commonStyles, buttonStyles];
  variant: ActionVariant = "filled";
  size: ActionSize = "small";
  shape: ActionShape = "round";
  disabled = false;
  selected = false;
  toggle = false;
  label = "";
  href = "";
  target = "";
  type: "button" | "submit" | "reset" = "button";
  expanded?: boolean;
  controls = "";
  haspopup = "";
  name = "";
  value = "";
  width: "default" | "narrow" | "wide" = "default";
  color: FabColor = "primary-container";
  private _formDisabled = false;
  private internals = this.attachInternals();
  formDisabledCallback(disabled: boolean) {
    this._formDisabled = disabled;
  }
  override focus(options?: FocusOptions) {
    this.renderRoot.querySelector<HTMLElement>(".button")?.focus(options);
  }
  private activate(event: Event) {
    if (this.disabled || this._formDisabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (this.toggle) {
      this.selected = !this.selected;
      this.emit("change", { selected: this.selected });
    }
    const form = this.internals.form;
    if (this.type === "submit" && form) {
      const submitter = document.createElement("button");
      submitter.type = "submit";
      submitter.name = this.name;
      submitter.value = this.value;
      submitter.hidden = true;
      form.append(submitter);
      form.requestSubmit(submitter);
      submitter.remove();
    }
    if (this.type === "reset" && form) form.reset();
  }
  protected render() {
    const content = html`<slot name="icon" aria-hidden="true"></slot
      ><slot>${this.label}</slot>`;
    if (this.href && !this.disabled && !this._formDisabled)
      return html`<a
        class="button"
        href=${this.href}
        target=${this.target || nothing}
        rel=${this.target === "_blank" ? "noopener noreferrer" : nothing}
        aria-label=${this.label || nothing}
        @click=${this.activate}
        >${content}</a
      >`;
    return html`<button
      class="button"
      type="button"
      ?disabled=${this.disabled || this._formDisabled}
      aria-label=${this.label || nothing}
      aria-pressed=${this.toggle ? String(this.selected) : nothing}
      aria-expanded=${this.expanded === undefined ? nothing : String(this.expanded)}
      aria-controls=${this.controls || nothing}
      aria-haspopup=${this.haspopup || nothing}
      @click=${this.activate}
    >
      ${content}
    </button>`;
  }
}

export class BolleIconButton extends BolleButton {
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("icon-only", "");
  }
}
export class BolleFloatingActionButton extends BolleButton {
  size: ActionSize = "fab";
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("fab", "");
  }
}
export class BolleExtendedFab extends BolleFloatingActionButton {
  size: ActionSize = "small";
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("extended", "");
  }
}

export class BolleButtonGroup extends BolleElement {
  static properties = {
    label: {},
    variant: { reflect: true },
    selection: {},
    required: { type: Boolean },
    size: {},
    shape: {},
  };
  static styles = [commonStyles, groupStyles];
  label = "";
  variant = "standard";
  selection: "none" | "single" | "multiple" = "none";
  required = false;
  size: ActionSize = "small";
  shape: ActionShape = "round";
  private observer?: MutationObserver;
  connectedCallback() {
    super.connectedCallback();
    this.observer = new MutationObserver(() => this.prepare());
    this.observer.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["disabled"],
    });
  }
  disconnectedCallback() {
    this.observer?.disconnect();
    super.disconnectedCallback();
  }
  protected updated() {
    this.prepare();
  }
  protected render() {
    return html`<div
      role="group"
      aria-label=${this.label}
      @keydown=${(event: KeyboardEvent) => moveFocus(event, this.buttons())}
      @click=${(event: Event) => {
        if (this.selection === "none") return;
        const button = event
          .composedPath()
          .find((node) => this.hosts().includes(node as BolleButton)) as
          BolleButton | undefined;
        if (!button || button.disabled) return;
        if (this.selection === "single")
          this.hosts().forEach((other) => {
            if (other !== button) other.selected = false;
          });
        if (this.required && !this.hosts().some((other) => other.selected))
          button.selected = true;
        this.emit("selection-change", {
          values: this.hosts()
            .filter((other) => other.selected)
            .map((other) => other.value),
        });
      }}
    >
      <slot @slotchange=${this.prepare}></slot>
    </div>`;
  }
  private hosts() {
    return Array.from(
      this.querySelectorAll<BolleButton>("bolle-button,bolle-icon-button"),
    );
  }
  private buttons() {
    return this.hosts()
      .map((button) => button.shadowRoot?.querySelector<HTMLElement>(".button"))
      .filter(
        (control): control is HTMLElement =>
          !!control && !(control as HTMLButtonElement).disabled,
      );
  }
  private prepare() {
    const first = this.hosts().find((button) => !button.disabled);
    this.hosts().forEach((button) => {
      button.size = this.size;
      button.shape = this.shape;
      button.setAttribute("grouped", "");
      if (this.selection !== "none") button.toggle = true;
      button.updateComplete.then(() => {
        const control =
          button.shadowRoot?.querySelector<HTMLElement>(".button");
        if (control) control.tabIndex = button === first ? 0 : -1;
      });
    });
  }
}

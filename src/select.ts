import { html, nothing } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { BolleFormElement } from "./shared.js";
import { commonStyles } from "./shared.styles.js";
import { formStyles } from "./forms.styles.js";
import { selectStyles } from "./select.styles.js";
import { BolleMenu } from "./menu.js";
import type { MenuAction, MenuEntry } from "./menu.types.js";
import { messages } from "./localization.js";

interface SelectOption {
  value: string;
  label: string;
  disabled: boolean;
}

/** Single choice over the `<option>` and `<optgroup>` children, rendered as a Material field. */
export class BolleSelect extends BolleFormElement {
  static properties = {
    variant: { reflect: true },
    placeholder: {},
    supportingText: { attribute: "supporting-text" },
    error: { type: Boolean, reflect: true },
    open: { type: Boolean, reflect: true },
    _revision: { state: true },
    ...BolleFormElement.properties,
  };
  static styles = [commonStyles, formStyles, selectStyles];
  variant = "filled";
  placeholder = "";
  supportingText = "";
  error = false;
  open = false;
  private _revision = 0;
  private menuRef = createRef<BolleMenu>();
  private observer?: MutationObserver;

  connectedCallback() {
    super.connectedCallback();
    this.observer = new MutationObserver(() => {
      this._revision += 1;
      this.syncForm();
    });
    this.observer.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["disabled", "label", "value", "selected"],
    });
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    super.disconnectedCallback();
  }

  private readOptions() {
    const flat: SelectOption[] = [];
    const entries: MenuEntry[] = [];
    const action = (option: HTMLOptionElement): MenuAction => {
      const label = (option.label || option.textContent || "").trim();
      const value = option.value || label;
      flat.push({ value, label, disabled: option.disabled });
      return { id: value, label, disabled: option.disabled };
    };
    for (const child of Array.from(this.children)) {
      if (child instanceof HTMLOptionElement) entries.push(action(child));
      else if (child instanceof HTMLOptGroupElement)
        entries.push({
          group: true,
          label: child.label,
          items: Array.from(child.querySelectorAll("option")).map(action),
        });
    }
    return { entries, flat };
  }

  private get selectedOption() {
    return this.readOptions().flat.find(
      (option) => option.value === this.value,
    );
  }

  private get menu() {
    return this.menuRef.value;
  }

  private toggle = () => {
    if (this.isDisabled) return;
    if (this.menu?.open) this.menu.close();
    else this.show();
  };

  private show() {
    const control = this.renderRoot.querySelector<HTMLElement>(".control");
    if (!control || this.isDisabled) return;
    this.open = true;
    this.menu?.style.setProperty(
      "--md-comp-menu-min-width",
      `${Math.min(control.offsetWidth, 280)}px`,
    );
    void this.menu?.show(control);
  }

  private keydown = (event: KeyboardEvent) => {
    if (this.isDisabled) return;
    if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      this.show();
    }
  };

  private choose = (event: Event) => {
    const { item } = (event as CustomEvent<{ item: MenuAction }>).detail;
    if (item.disabled) return;
    this.value = item.id;
    this.open = false;
    this.syncForm();
    this.emit("change", { value: this.value });
  };

  private closed = () => {
    this.open = false;
  };

  protected syncForm() {
    super.syncForm();
    const control = this.renderRoot.querySelector<HTMLElement>(".control");
    this.internals.setFormValue(
      this.isDisabled || !this.value ? null : this.value,
      this.value,
    );
    const missing = this.required && !this.isDisabled && !this.value;
    this.internals.setValidity(
      missing ? { valueMissing: true } : {},
      missing
        ? (messages(this.lang || document.documentElement.lang, {}).required ??
          "")
        : "",
      control ?? undefined,
    );
  }

  protected updated() {
    super.updated();
    const ids = this.value ? [this.value] : [];
    this.menu?.setSelection(ids);
  }

  protected render() {
    const { entries } = this.readOptions();
    const selected = this.selectedOption;
    return html`<div class="field">
      <button
        type="button"
        class="control"
        aria-haspopup="menu"
        aria-expanded=${String(this.open)}
        aria-invalid=${this.error ? "true" : nothing}
        aria-describedby=${this.supportingText ? "support" : nothing}
        ?disabled=${this.isDisabled}
        @click=${this.toggle}
        @keydown=${this.keydown}
      >
        <span class="field-label"
          >${this.label}${this.required
            ? html`<span class="required" aria-hidden="true"> *</span>`
            : nothing}</span
        >
        <span class="field-body">
          <span class="value ${selected ? "" : "placeholder"}"
            >${selected ? selected.label : this.placeholder}</span
          >
          <span class="chevron" aria-hidden="true"
            ><svg viewBox="0 0 24 24" focusable="false"
              ><path
                fill="currentColor"
                d="M12 15.4 6.6 10 8 8.6l4 4 4-4L17.4 10Z"
              /></svg
            ></span
          >
        </span>
      </button>
      <span class="support-row">
        <span class="support" id="support">${this.supportingText}</span>
      </span>
      <bolle-menu
        ${ref(this.menuRef)}
        menu-label=${this.label || this.placeholder || "Select"}
        selection-mode="single"
        .items=${entries}
        @menu-select=${this.choose}
        @menu-close=${this.closed}
      ></bolle-menu>
    </div>`;
  }
}

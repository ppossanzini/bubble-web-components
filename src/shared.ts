import { LitElement } from "lit";
import type { TemplateResult } from "lit";

export interface BubbleItem {
  id: string;
  label: string;
  icon?: string | TemplateResult;
  supportingText?: string;
  badge?: string;
  href?: string;
  selected?: boolean;
  disabled?: boolean;
  items?: BubbleItem[];
  expanded?: boolean;
}

export class BubbleElement extends LitElement {
  emit<T>(name: string, detail: T) {
    return this.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
  }
}

/** Form-associated hosts submit values without hidden inputs or duplicate names. */
export abstract class BubbleFormElement extends BubbleElement {
  static formAssociated = true;
  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };
  static properties = {
    name: { reflect: true },
    disabled: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
    label: {},
    value: {},
    _formDisabled: { state: true },
  };
  name = "";
  disabled = false;
  required = false;
  label = "";
  value = "";
  protected _formDisabled = false;
  protected internals = this.attachInternals();
  protected initialValue?: string;
  get form() {
    return this.internals.form;
  }
  get validity() {
    return this.internals.validity;
  }
  get validationMessage() {
    return this.internals.validationMessage;
  }
  get willValidate() {
    return this.internals.willValidate;
  }
  checkValidity() {
    return this.internals.checkValidity();
  }
  reportValidity() {
    return this.internals.reportValidity();
  }
  override focus(options?: FocusOptions) {
    this.renderRoot
      .querySelector<HTMLElement>("input,textarea,button")
      ?.focus(options);
  }
  get isDisabled() {
    return this.disabled || this._formDisabled;
  }
  formDisabledCallback(disabled: boolean) {
    this._formDisabled = disabled;
  }
  formResetCallback() {
    this.value = this.initialValue ?? "";
  }
  formStateRestoreCallback(state: string | File | FormData | null) {
    if (typeof state === "string") this.value = state;
  }
  protected firstUpdated() {
    this.initialValue = this.value;
  }
  protected updated() {
    const input = this.renderRoot.querySelector("input,textarea") as
      HTMLInputElement | HTMLTextAreaElement | null;
    if (
      input &&
      !input.readOnly &&
      !["checkbox", "radio"].includes(input.type) &&
      input.value !== this.value
    )
      this.value = input.value;
    this.syncForm();
  }
  protected syncForm() {
    const input = this.renderRoot.querySelector("input,textarea") as
      HTMLInputElement | HTMLTextAreaElement | null;
    this.internals.setFormValue(
      this.isDisabled ? null : this.value,
      this.value,
    );
    if (input) {
      this.internals.setValidity(
        this.isDisabled ? {} : input.validity,
        this.isDisabled || input.validity.valid ? "" : input.validationMessage,
        input,
      );
    }
  }
}

export function moveFocus(
  event: KeyboardEvent,
  elements: HTMLElement[],
  vertical = false,
) {
  const forward = vertical ? "ArrowDown" : "ArrowRight";
  const back = vertical ? "ArrowUp" : "ArrowLeft";
  if (![forward, back, "Home", "End"].includes(event.key) || !elements.length)
    return;
  event.preventDefault();
  const current = elements.findIndex(
    (e) =>
      e.matches(":focus") ||
      (e.getRootNode() instanceof ShadowRoot &&
        (e.getRootNode() as ShadowRoot).activeElement === e),
  );
  const rtl = getComputedStyle(elements[0]).direction === "rtl" && !vertical;
  let delta = event.key === forward ? 1 : -1;
  if (rtl) delta *= -1;
  const index =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? elements.length - 1
        : (current + delta + elements.length) % elements.length;
  elements.forEach((element, i) => {
    element.tabIndex = i === index ? 0 : -1;
  });
  elements[index].focus();
}

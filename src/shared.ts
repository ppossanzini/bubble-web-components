import { LitElement } from "lit";
import type { PropertyDeclarations, TemplateResult } from "lit";

export interface BolleItem {
  id: string;
  label: string;
  icon?: string | TemplateResult;
  supportingText?: string;
  badge?: string;
  href?: string;
  selected?: boolean;
  disabled?: boolean;
  items?: BolleItem[];
  expanded?: boolean;
}

/** Points the narrow corner of a floating surface toward the element it came from. */
export function placeTail(surface: HTMLElement, anchor: DOMRect) {
  const box = surface.getBoundingClientRect();
  const vertical =
    box.top + box.height / 2 >= anchor.top + anchor.height / 2
      ? "top"
      : "bottom";
  // 2px tolerance keeps centred surfaces (tooltips) on the left corner.
  const horizontal =
    box.left + box.width / 2 >= anchor.left + anchor.width / 2 - 2
      ? "left"
      : "right";
  surface.dataset.tail = `${vertical}-${horizontal}`;
}

const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]';
const shortcutHosts = new Set<BolleElement>();

function matchesShortcut(event: KeyboardEvent, shortcut: string) {
  const parts = shortcut.split("+");
  const key = parts.pop()!.toLowerCase();
  const mods = new Set(parts.map((p) => p.toLowerCase()));
  if (
    mods.has("alt") !== event.altKey ||
    mods.has("control") !== event.ctrlKey ||
    mods.has("meta") !== event.metaKey ||
    mods.has("shift") !== event.shiftKey
  )
    return false;
  // event.code keeps Alt/Option combinations matchable on macOS layouts.
  return (
    event.key.toLowerCase() === key ||
    event.code.toLowerCase() === `key${key}` ||
    event.code.toLowerCase() === `digit${key}`
  );
}

function isEditable(event: KeyboardEvent) {
  const target = event.composedPath()[0];
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.matches("input, textarea, select"))
  );
}

function onShortcutKey(event: KeyboardEvent) {
  if (event.defaultPrevented || event.repeat) return;
  const bare = !event.altKey && !event.ctrlKey && !event.metaKey;
  if (bare && isEditable(event)) return;
  for (const host of shortcutHosts) {
    const target = host.shortcutTarget();
    if (
      !target ||
      host.hasAttribute("disabled") ||
      !host.checkVisibility() ||
      !host.shortcut.split(/\s+/).some((s) => s && matchesShortcut(event, s))
    )
      continue;
    event.preventDefault();
    target.focus();
    if (
      target.matches("button, a, input[type=checkbox], input[type=radio]")
    )
      target.click();
    return;
  }
}

export class BolleElement extends LitElement {
  static properties: PropertyDeclarations = { shortcut: { reflect: true } };
  /** ARIA `aria-keyshortcuts` syntax, e.g. "Alt+S" or "Control+Shift+K Meta+K". */
  shortcut = "";

  constructor() {
    super();
    this.addController({
      hostConnected: () => {
        if (!shortcutHosts.size)
          document.addEventListener("keydown", onShortcutKey);
        shortcutHosts.add(this);
      },
      hostDisconnected: () => {
        shortcutHosts.delete(this);
        if (!shortcutHosts.size)
          document.removeEventListener("keydown", onShortcutKey);
      },
      hostUpdated: () => {
        const target = this.renderRoot.querySelector<HTMLElement>(FOCUSABLE);
        const value = this.shortcut.trim();
        if (value) target?.setAttribute("aria-keyshortcuts", value);
        else target?.removeAttribute("aria-keyshortcuts");
      },
    });
  }

  /** The control a shortcut focuses or activates; null when the host is not focusable. */
  shortcutTarget(): HTMLElement | null {
    if (!this.shortcut.trim()) return null;
    return this.renderRoot?.querySelector<HTMLElement>(FOCUSABLE) ?? null;
  }

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
export abstract class BolleFormElement extends BolleElement {
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

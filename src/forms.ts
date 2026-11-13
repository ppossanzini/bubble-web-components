import { html, nothing, type TemplateResult } from "lit";
import { BolleFormElement, type BolleItem } from "./shared.js";
import { commonStyles } from "./shared.styles.js";
import { formStyles } from "./forms.styles.js";
import { messages } from "./localization.js";

export class BolleCheckbox extends BolleFormElement {
  static properties = {
    checked: { type: Boolean, reflect: true },
    indeterminate: { type: Boolean },
    supportingText: { attribute: "supporting-text" },
    error: { type: Boolean, reflect: true },
    ...BolleFormElement.properties,
  };
  static styles = [commonStyles, formStyles];
  checked = false;
  indeterminate = false;
  supportingText = "";
  error = false;
  protected inputType = "checkbox";
  private initialChecked = false;
  protected firstUpdated() {
    super.firstUpdated();
    this.initialChecked = this.checked;
  }
  protected syncForm() {
    super.syncForm();
    this.internals.setFormValue(
      this.checked && !this.isDisabled ? this.value || "on" : null,
      this.checked ? "checked" : "unchecked",
    );
    const input = this.renderRoot.querySelector("input");
    if (input)
      this.internals.setValidity(
        this.required && !this.checked && !this.isDisabled
          ? { valueMissing: true }
          : {},
        this.required && !this.checked
          ? input.validationMessage ||
              messages(this.lang || document.documentElement.lang, {}).required
          : "",
        input,
      );
  }
  formResetCallback() {
    super.formResetCallback();
    this.checked = this.initialChecked;
    this.indeterminate = false;
  }
  formStateRestoreCallback(state: string | File | FormData | null) {
    this.checked = state === "checked";
  }
  protected change(event: Event) {
    const input = event.target as HTMLInputElement;
    this.checked = input.checked;
    this.indeterminate = false;
    this.syncForm();
    this.emit("change", { checked: this.checked, value: this.value });
  }
  protected render() {
    return html`<span class="choice">
      <label
        ><input
          type=${this.inputType}
          role=${this.hasAttribute("switch") ? "switch" : nothing}
          .checked=${this.checked}
          .indeterminate=${this.indeterminate}
          ?disabled=${this.isDisabled}
          ?required=${this.required}
          aria-invalid=${this.error ? "true" : nothing}
          aria-describedby=${this.supportingText ? "choice-support" : nothing}
          @change=${this.change}
        /><span><slot>${this.label}</slot></span></label
      >
      ${this.supportingText ? html`<span class="choice-support" id="choice-support">${this.supportingText}</span>` : nothing}
    </span>`;
  }
}

export class BolleSwitch extends BolleCheckbox {
  static properties = {
    ...BolleCheckbox.properties,
    icon: { attribute: false },
    iconSelected: { attribute: false },
  };
  icon?: string | TemplateResult;
  iconSelected?: string | TemplateResult;
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("switch", "");
  }
  protected render() {
    return html`<span class="choice">
      <label
        ><input
          type="checkbox"
          role="switch"
          .checked=${this.checked}
          ?disabled=${this.isDisabled}
          ?required=${this.required}
          aria-invalid=${this.error ? "true" : nothing}
          aria-describedby=${this.supportingText ? "choice-support" : nothing}
          @change=${this.change}
        /><span class="switch-ui" aria-hidden="true"
          ><span class="switch-handle"
            ><span class="switch-icon switch-icon-off"
              >${this.icon ?? nothing}</span
            ><span class="switch-icon switch-icon-on"
              >${this.iconSelected ?? nothing}</span
            ></span
          ></span
        ><span><slot>${this.label}</slot></span></label
      >
      ${this.supportingText ? html`<span class="choice-support" id="choice-support">${this.supportingText}</span>` : nothing}
    </span>`;
  }
}

export class BolleRadioButton extends BolleCheckbox {
  protected inputType = "radio";
  private peers() {
    if (!this.name) return [this];
    return Array.from(
      (
        this.getRootNode() as Document | ShadowRoot
      ).querySelectorAll<BolleRadioButton>("bolle-radio-button"),
    ).filter(
      (radio) =>
        radio.name === this.name &&
        radio.form === this.form &&
        !radio.isDisabled,
    );
  }
  private syncGroup() {
    const peers = this.peers();
    const missing =
      !this.isDisabled &&
      peers.some((radio) => radio.required) &&
      !peers.some((radio) => radio.checked);
    const input = this.renderRoot.querySelector("input");
    if (input) {
      input.tabIndex =
        !this.name ||
        (peers.find((radio) => radio.checked) ?? peers[0]) === this
          ? 0
          : -1;
      this.internals.setValidity(
        missing ? { valueMissing: true } : {},
        missing
          ? messages(this.lang || document.documentElement.lang, {}).required
          : "",
        input,
      );
    }
  }
  protected syncForm() {
    super.syncForm();
    this.syncGroup();
  }
  protected updated() {
    super.updated();
    if (this.checked && this.name)
      this.peers().forEach((radio) => {
        if (radio !== this && radio.checked) radio.checked = false;
      });
    const peers = this.peers();
    peers.forEach((radio) => radio.syncGroup());
  }
  protected render() {
    return html`<label
      ><input
        type="radio"
        .checked=${this.checked}
        ?disabled=${this.isDisabled}
        aria-required=${String(this.required)}
        @change=${this.change}
        @keydown=${this.keydown}
      /><span><slot>${this.label}</slot></span></label
    >`;
  }
  private keydown(event: KeyboardEvent) {
    if (!this.name) return;
    if (
      ![
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ].includes(event.key)
    )
      return;
    event.preventDefault();
    const peers = this.peers();
    const direction = getComputedStyle(this).direction === "rtl" ? -1 : 1;
    const delta =
      event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowUp"
          ? -1
          : event.key === "ArrowRight"
            ? direction
            : -direction;
    const next =
      peers[
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? peers.length - 1
            : (peers.indexOf(this) + delta + peers.length) % peers.length
      ];
    if (next) {
      next.checked = true;
      next.updateComplete.then(() =>
        next.shadowRoot?.querySelector("input")?.focus(),
      );
      next.emit("change", { checked: true, value: next.value });
    }
  }
}

export class BolleTextField extends BolleFormElement {
  static properties = {
    ...BolleFormElement.properties,
    variant: { reflect: true },
    type: {},
    placeholder: {},
    supportingText: { attribute: "supporting-text" },
    error: { type: Boolean, reflect: true },
    multiline: { type: Boolean },
    readonly: { type: Boolean },
    min: {},
    max: {},
    step: {},
    pattern: {},
    autocomplete: {},
    rows: { type: Number },
    maxlength: { type: Number },
    prefix: {},
    suffix: {},
    counter: { type: Boolean },
  };
  static styles = [commonStyles, formStyles];
  variant = "filled";
  type = "text";
  placeholder = "";
  supportingText = "";
  error = false;
  multiline = false;
  readonly = false;
  min = "";
  max = "";
  step = "";
  pattern = "";
  autocomplete = "";
  rows = 3;
  maxlength = -1;
  prefix = "";
  suffix = "";
  counter = false;
  protected onInput(event: Event) {
    this.value = (event.target as HTMLInputElement).value;
    this.syncForm();
    this.emit("value-input", { value: this.value });
  }
  protected onChange() {
    this.emit("change", { value: this.value });
  }
  protected renderInput() {
    if (this.multiline)
      return html`<textarea
        .value=${this.value}
        placeholder=${this.placeholder}
        rows=${this.rows}
        maxlength=${this.maxlength < 0 ? nothing : this.maxlength}
        ?required=${this.required}
        ?readonly=${this.readonly}
        ?disabled=${this.isDisabled}
        aria-describedby="support"
        aria-invalid=${this.error ? "true" : nothing}
        @input=${this.onInput}
        @change=${this.onChange}
      ></textarea>`;
    return html`<input
      type=${this.type}
      .value=${this.value}
      placeholder=${this.placeholder}
      min=${this.min || nothing}
      max=${this.max || nothing}
      step=${this.step || nothing}
      pattern=${this.pattern || nothing}
      maxlength=${this.maxlength < 0 ? nothing : this.maxlength}
      autocomplete=${this.autocomplete || nothing}
      ?required=${this.required}
      ?readonly=${this.readonly}
      ?disabled=${this.isDisabled}
      aria-describedby="support"
      aria-invalid=${this.error ? "true" : nothing}
      @input=${this.onInput}
      @change=${this.onChange}
    />`;
  }
  private get counterText() {
    return this.maxlength > 0
      ? `${String(this.value).length} / ${this.maxlength}`
      : "";
  }
  protected renderPopup(): TemplateResult | typeof nothing {
    return nothing;
  }
  protected render() {
    return html`<div class="field">
      <label>
        <span class="field-label"
          >${this.label}${this.required ? html`<span class="required" aria-hidden="true"> *</span>` : nothing}</span
        >
        <span class="field-body">
          <slot name="leading"></slot>
          ${this.prefix ? html`<span class="affix">${this.prefix}</span>` : nothing}
          ${this.renderInput()}
          ${this.suffix ? html`<span class="affix">${this.suffix}</span>` : nothing}
          <slot name="trailing"></slot>
        </span>
      </label>
      <span class="support-row">
        <span class="support" id="support">${this.supportingText}</span>
        ${this.counter ? html`<span class="counter">${this.counterText}</span>` : nothing}
      </span>
      ${this.renderPopup()}
    </div>`;
  }
}

export class BolleSearch extends BolleTextField {
  static properties = {
    ...BolleTextField.properties,
    appearance: { reflect: true },
    layout: { reflect: true },
    suggestions: { attribute: false },
    suggestionsLabel: { attribute: "suggestions-label" },
    filter: { type: Boolean, reflect: true },
    suggestionDelay: { type: Number, attribute: "suggestion-delay" },
    _active: { state: true },
  };
  type = "search";
  appearance = "contained";
  layout = "docked";
  suggestions: string[] = [];
  suggestionsLabel = "";
  filter = false;
  suggestionDelay = 0;
  private _active = -1;
  private suggestTimer?: ReturnType<typeof setTimeout>;
  private get visibleSuggestions() {
    const query = this.value.trim().toLocaleLowerCase();
    if (!this.filter || !query) return this.suggestions;
    return this.suggestions.filter((item) =>
      item.toLocaleLowerCase().includes(query),
    );
  }
  private get suggestionOpen() {
    return this._active >= 0 || this.visibleSuggestions.length > 0;
  }
  private accept(index: number) {
    const suggestion = this.visibleSuggestions[index];
    if (suggestion === undefined) return;
    this.value = suggestion;
    this._active = -1;
    this.emit("change", { value: this.value });
    this.emit("search", { value: this.value });
  }
  private scheduleSuggest() {
    clearTimeout(this.suggestTimer);
    const value = this.value;
    if (this.suggestionDelay > 0)
      this.suggestTimer = setTimeout(
        () => this.emit("suggest", { value }),
        this.suggestionDelay,
      );
    else this.emit("suggest", { value });
  }
  private onSuggestionKeys(event: KeyboardEvent) {
    const total = this.visibleSuggestions.length;
    if (!total) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      this._active = (this._active + step + total) % total;
      this.requestUpdate();
    } else if (event.key === "Enter" && this._active >= 0) {
      event.preventDefault();
      this.accept(this._active);
    } else if (event.key === "Escape") {
      this._active = -1;
      this.requestUpdate();
    }
  }
  protected updated() {
    super.updated();
    const input = this.renderRoot.querySelector("input");
    if (!input) return;
    if (this.suggestions.length) {
      input.setAttribute("role", "combobox");
      input.setAttribute("aria-autocomplete", "list");
      input.setAttribute("aria-expanded", String(this.suggestionOpen));
      input.setAttribute("aria-controls", "search-suggestions");
      input.setAttribute(
        "aria-activedescendant",
        this._active >= 0 ? `search-suggestion-${this._active}` : "",
      );
    }
  }
  disconnectedCallback() {
    clearTimeout(this.suggestTimer);
    super.disconnectedCallback();
  }
  protected render() {
    const items = this.visibleSuggestions;
    return html`<search class="search" data-layout=${this.layout}>
      <form
        @submit=${(event: SubmitEvent) => {
          event.preventDefault();
          this.emit("search", { value: this.value });
        }}
      >
        <slot name="leading"></slot>
        <div
          @input=${this.scheduleSuggest}
          @keydown=${this.onSuggestionKeys}
          @focusout=${(event: FocusEvent) => {
            if (!this.contains(event.relatedTarget as Node)) this._active = -1;
          }}
        >
          ${super.render()}
        </div>
        <slot name="trailing"></slot>
      </form>
      ${
        items.length
          ? html`<ul
              id="search-suggestions"
              class="search-suggestions"
              role="listbox"
              aria-label=${this.suggestionsLabel || nothing}
              ?hidden=${!this.suggestionOpen}
            >
              ${items.map(
                (item, index) =>
                  html`<li
                    id=${`search-suggestion-${index}`}
                    role="option"
                    aria-selected=${String(index === this._active)}
                    @pointerdown=${(event: Event) => event.preventDefault()}
                    @click=${() => this.accept(index)}
                  >
                    ${item}
                  </li>`,
              )}
            </ul>`
          : nothing
      }
      <div class="search-results" ?hidden=${this.layout !== "docked"}>
        <slot name="results"></slot>
      </div>
    </search>`;
  }
}
export class BolleSegmentedButtons extends BolleFormElement {
  static properties = {
    ...BolleFormElement.properties,
    items: { attribute: false },
    multiple: { type: Boolean },
    values: { attribute: false },
  };
  static styles = [commonStyles, formStyles];
  items: BolleItem[] = [];
  multiple = false;
  values: string[] = [];
  private initialValues: string[] = [];
  protected firstUpdated() {
    super.firstUpdated();
    this.initialValues = [...this.values];
  }
  protected syncForm() {
    super.syncForm();
    const enabled = this.items
      .filter((item) => !item.disabled)
      .map((item) => item.id);
    const selected = this.multiple
      ? this.values.filter((value) => enabled.includes(value))
      : enabled.includes(this.value)
        ? [this.value]
        : [];
    if (this.multiple && !this.isDisabled) {
      const data = new FormData();
      selected.forEach((value) => data.append(this.name, value));
      this.internals.setFormValue(
        this.name ? data : null,
        JSON.stringify(this.values),
      );
    }
    if (!this.multiple && !this.isDisabled)
      this.internals.setFormValue(
        selected.length ? this.value : null,
        this.value,
      );
    const missing = this.required && !this.isDisabled && !selected.length;
    this.internals.setValidity(
      missing ? { valueMissing: true } : {},
      missing
        ? messages(this.lang || document.documentElement.lang, {}).required
        : "",
    );
  }
  formResetCallback() {
    super.formResetCallback();
    this.values = [...this.initialValues];
  }
  formStateRestoreCallback(state: string | File | FormData | null) {
    if (typeof state === "string" && this.multiple)
      this.values = JSON.parse(state);
    else super.formStateRestoreCallback(state);
  }
  protected updated() {
    super.updated();
    this.placeDrop();
  }
  /** Moves the single-selection indicator under the checked segment. */
  private placeDrop() {
    const set = this.renderRoot.querySelector<HTMLElement>("fieldset");
    const checked = this.renderRoot.querySelector<HTMLElement>(
      "label:has(input:checked)",
    );
    if (!set) return;
    set.toggleAttribute("data-drop", !this.multiple && !!checked);
    if (this.multiple || !checked) return;
    const drop = this.renderRoot.querySelector<HTMLElement>(".drop")!;
    // Rect minus the live translate gives the abspos origin, which a fieldset legend shifts.
    const [tx = 0, ty = 0] = getComputedStyle(drop)
      .translate.split(" ")
      .map((part) => parseFloat(part) || 0);
    const origin = drop.getBoundingClientRect();
    const box = checked.getBoundingClientRect();
    set.style.setProperty("--drop-x", `${box.left - (origin.left - tx)}px`);
    set.style.setProperty("--drop-y", `${box.top - (origin.top - ty)}px`);
    set.style.setProperty("--drop-w", `${checked.offsetWidth}px`);
    set.style.setProperty("--drop-h", `${checked.offsetHeight}px`);
  }
  protected render() {
    return html`<fieldset ?disabled=${this.isDisabled}>
      <legend>${this.label}</legend>
      <span class="segments"><span class="drop" aria-hidden="true"></span>
      ${this.items.map(
        (item) =>
          html`<label
            ><input
              type=${this.multiple ? "checkbox" : "radio"}
              name="segments"
              .checked=${this.multiple ? this.values.includes(item.id) : this.value === item.id}
              ?disabled=${item.disabled}
              @change=${(event: Event) => {
                const checked = (event.target as HTMLInputElement).checked;
                if (this.multiple)
                  this.values = checked
                    ? [...this.values, item.id]
                    : this.values.filter((value) => value !== item.id);
                else this.value = item.id;
                this.syncForm();
                this.emit("change", { value: this.value, values: this.values });
              }}
            />${item.icon ? html`<span aria-hidden="true">${item.icon}</span>` : nothing}${item.label}</label
          >`,
      )}</span>
    </fieldset>`;
  }
}

interface AutocompleteEntry {
  value: string;
  label: string;
  disabled: boolean;
}

/** Text field with a filtered list of suggestions, the Material form of an input with a datalist. */
export class BolleAutocomplete extends BolleTextField {
  static properties = {
    ...BolleTextField.properties,
    options: { attribute: false },
    _active: { state: true },
    _open: { state: true },
    _revision: { state: true },
  };
  options: (string | { value: string; label?: string; disabled?: boolean })[] =
    [];
  private _active = -1;
  private _open = false;
  private _revision = 0;
  private boundInput?: HTMLInputElement;
  private listeners?: AbortController;
  private observer?: MutationObserver;

  connectedCallback() {
    super.connectedCallback();
    this.observer = new MutationObserver(() => {
      this._revision += 1;
      this.requestUpdate();
    });
    this.observer.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["value", "disabled", "label"],
    });
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.listeners?.abort();
    super.disconnectedCallback();
  }

  private get entries(): AutocompleteEntry[] {
    const declared = this.options.map((entry) =>
      typeof entry === "string"
        ? { value: entry, label: entry, disabled: false }
        : {
            value: entry.value,
            label: entry.label ?? entry.value,
            disabled: entry.disabled ?? false,
          },
    );
    const children = Array.from(this.querySelectorAll("option")).map(
      (option) => ({
        value: option.value || (option.textContent ?? "").trim(),
        label: (
          option.label ||
          option.textContent ||
          option.value ||
          ""
        ).trim(),
        disabled: option.disabled,
      }),
    );
    return [...declared, ...children];
  }

  private get visible(): AutocompleteEntry[] {
    const query = this.value.trim().toLocaleLowerCase();
    const entries = this.entries;
    if (!query) return entries;
    return entries.filter((entry) =>
      entry.label.toLocaleLowerCase().includes(query),
    );
  }

  private bindInput() {
    const input = this.renderRoot.querySelector<HTMLInputElement>("input");
    if (!input || input === this.boundInput) return;
    this.listeners?.abort();
    this.listeners = new AbortController();
    const { signal } = this.listeners;
    this.boundInput = input;
    input.addEventListener("keydown", this.keydown, { signal });
    input.addEventListener("focus", this.onFocus, { signal });
    input.addEventListener("blur", this.onBlur, { signal });
    input.addEventListener("input", this.refresh, { signal });
    window.addEventListener("resize", this.reposition, { signal });
    window.addEventListener("scroll", this.reposition, {
      capture: true,
      signal,
    });
  }

  private reposition = () => {
    const list = this.renderRoot.querySelector<HTMLElement>(
      ".autocomplete-list",
    );
    if (list?.matches(":popover-open")) this.positionList(list);
  };

  private positionList(list: HTMLElement) {
    const field = this.renderRoot.querySelector<HTMLElement>(".field");
    if (!field) return;
    const rect = field.getBoundingClientRect();
    list.style.inlineSize = `${rect.width}px`;
    list.style.left = `${rect.left}px`;
    const height = list.offsetHeight;
    const below = rect.bottom + 4;
    const fitsBelow = below + height <= innerHeight - 8;
    const fitsAbove = rect.top - height - 4 >= 8;
    list.style.top = fitsBelow || !fitsAbove
      ? `${below}px`
      : `${rect.top - height - 4}px`;
  }

  private open() {
    if (this.visible.length) this._open = true;
  }

  private close() {
    this._open = false;
    this._active = -1;
  }

  private move(delta: number) {
    const total = this.visible.length;
    if (!total) return;
    this._open = true;
    this._active = (this._active + delta + total) % total;
  }

  private accept(index: number) {
    const entry = this.visible[index];
    if (!entry || entry.disabled) return;
    this.value = entry.value;
    this.close();
    this.syncForm();
    this.emit("change", { value: this.value });
    this.boundInput?.focus();
  }

  private keydown = (event: KeyboardEvent) => {
    if (this.isDisabled || this.readonly) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (this._open) this.move(1);
      else this.open();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (this._open) this.move(-1);
      else this.open();
    } else if (event.key === "Enter" && this._open && this._active >= 0) {
      event.preventDefault();
      this.accept(this._active);
    } else if (event.key === "Escape" && this._open) {
      event.preventDefault();
      this.close();
    } else if (event.key === "Tab") this.close();
  };

  private onFocus = () => {
    if (!this.isDisabled) this.open();
  };

  private onBlur = () => {
    setTimeout(() => {
      if (!this.matches(":focus-within")) this.close();
    }, 120);
  };

  private refresh = () => {
    this._active = -1;
    this._open = this.visible.length > 0;
  };

  protected updated() {
    super.updated();
    this.bindInput();
    const list = this.renderRoot.querySelector<HTMLElement>(
      ".autocomplete-list",
    );
    if (list) {
      if (!list.matches(":popover-open")) {
        if (typeof list.showPopover === "function") list.showPopover();
      }
      this.positionList(list);
    }
    const input = this.boundInput;
    if (!input) return;
    const open = this._open && this.visible.length > 0;
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", String(open));
    if (open) {
      input.setAttribute("aria-controls", "autocomplete-list");
      if (this._active >= 0)
        input.setAttribute(
          "aria-activedescendant",
          `autocomplete-${this._active}`,
        );
      else input.removeAttribute("aria-activedescendant");
    } else {
      input.removeAttribute("aria-controls");
      input.removeAttribute("aria-activedescendant");
    }
  }

  protected renderPopup() {
    const items = this.visible;
    if (!this._open || !items.length) return nothing;
    return html`<ul
      class="autocomplete-list"
      id="autocomplete-list"
      role="listbox"
      popover="manual"
      aria-label=${this.label || nothing}
    >
      ${items.map(
        (entry, index) =>
          html`<li
            id=${`autocomplete-${index}`}
            role="option"
            aria-selected=${String(index === this._active)}
            aria-disabled=${entry.disabled ? "true" : nothing}
            @pointerdown=${(event: Event) => event.preventDefault()}
            @click=${() => this.accept(index)}
          >
            ${entry.label}
          </li>`,
      )}
    </ul>`;
  }
}

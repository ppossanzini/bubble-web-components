import { html, nothing, type TemplateResult } from "lit";
import { BubbleFormElement, type BubbleItem } from "./shared.js";
import { commonStyles } from "./shared.styles.js";
import { formStyles } from "./forms.styles.js";
import { messages } from "./localization.js";

export class BubbleCheckbox extends BubbleFormElement {
  static properties = {
    checked: { type: Boolean, reflect: true },
    indeterminate: { type: Boolean },
    supportingText: { attribute: "supporting-text" },
    error: { type: Boolean, reflect: true },
    ...BubbleFormElement.properties,
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

export class BubbleSwitch extends BubbleCheckbox {
  static properties = {
    ...BubbleCheckbox.properties,
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

export class BubbleRadioButton extends BubbleCheckbox {
  protected inputType = "radio";
  private peers() {
    if (!this.name) return [this];
    return Array.from(
      (
        this.getRootNode() as Document | ShadowRoot
      ).querySelectorAll<BubbleRadioButton>("bubble-radio-button"),
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

export class BubbleTextField extends BubbleFormElement {
  static properties = {
    ...BubbleFormElement.properties,
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

export class BubbleSearch extends BubbleTextField {
  static properties = {
    ...BubbleTextField.properties,
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
export class BubbleSlider extends BubbleFormElement {
  static properties = {
    ...BubbleFormElement.properties,
    min: { type: Number },
    max: { type: Number },
    step: { type: Number },
    variant: { reflect: true },
    size: { reflect: true },
    upperValue: { type: Number, attribute: "upper-value" },
    upperLabel: { attribute: "upper-label" },
    orientation: { reflect: true },
    showValue: { type: Boolean, attribute: "show-value" },
    stops: { type: Boolean },
    iconStart: { attribute: false },
    iconEnd: { attribute: false },
  };
  static styles = [commonStyles, formStyles];
  value = "0";
  min = 0;
  max = 100;
  step = 1;
  variant = "continuous";
  size = "xs";
  upperValue = 100;
  upperLabel = "";
  orientation = "horizontal";
  showValue = false;
  stops = false;
  iconStart?: string | TemplateResult;
  iconEnd?: string | TemplateResult;
  private initialUpper = 100;
  protected firstUpdated() {
    super.firstUpdated();
    this.initialUpper = this.upperValue;
  }
  formResetCallback() {
    super.formResetCallback();
    this.upperValue = this.initialUpper;
  }
  formStateRestoreCallback(state: string | File | FormData | null) {
    if (typeof state === "string" && state.startsWith("[")) {
      const values = JSON.parse(state);
      this.value = values[0];
      this.upperValue = Number(values[1]);
    } else super.formStateRestoreCallback(state);
  }
  protected syncForm() {
    super.syncForm();
    if (this.variant === "range" && !this.isDisabled) {
      const data = new FormData();
      data.append(this.name, this.value);
      data.append(this.name, String(this.upperValue));
      this.internals.setFormValue(
        this.name ? data : null,
        JSON.stringify([this.value, this.upperValue]),
      );
    }
  }
  protected updated() {
    const upper = this.renderRoot.querySelectorAll("input")[1];
    if (this.variant === "range" && upper)
      this.upperValue = Number(upper.value);
    super.updated();
  }
  private get inset() {
    return (
      Boolean(this.iconStart || this.iconEnd) &&
      (this.variant === "continuous" || this.variant === "centered")
    );
  }
  private get percentValue() {
    return this.max > this.min
      ? Math.max(
          0,
          Math.min(
            100,
            ((Number(this.value) - this.min) / (this.max - this.min)) * 100,
          ),
        )
      : 0;
  }
  private get percentUpper() {
    return this.max > this.min
      ? Math.max(
          0,
          Math.min(
            100,
            ((this.upperValue - this.min) / (this.max - this.min)) * 100,
          ),
        )
      : 100;
  }
  private sliderInput(
    which: "value" | "upper",
    label: string,
    min: number,
    max: number,
    current: number,
    onInput: (input: HTMLInputElement) => void,
  ) {
    return html`<input
      class=${`slider slider-${which}`}
      type="range"
      aria-label=${label}
      aria-orientation=${this.orientation}
      min=${min}
      max=${max}
      step=${this.step}
      .value=${String(current)}
      ?disabled=${this.isDisabled}
      list=${this.stops && which === "value" ? "stops" : nothing}
      @input=${(event: Event) => onInput(event.target as HTMLInputElement)}
      @change=${() =>
        this.emit("change", {
          value: this.value,
          upperValue: this.upperValue,
        })}
    />`;
  }
  protected render() {
    const start =
      this.variant === "range"
        ? Math.min(this.percentValue, this.percentUpper)
        : this.variant === "centered"
          ? Math.min(50, this.percentValue)
          : 0;
    const end =
      this.variant === "range"
        ? Math.max(this.percentValue, this.percentUpper)
        : this.variant === "centered"
          ? Math.max(50, this.percentValue)
          : this.percentValue;
    return html`<div
      class="range"
      data-variant=${this.variant}
      data-orientation=${this.orientation}
      style=${`--bubble-slider-start:${start}%;--bubble-slider-end:${end}%`}
    >
      <div class="range-head">
        <label for=${this.rangeId}>${this.label}</label>
        ${
          this.showValue &&
          (this.variant === "range" || this.orientation === "vertical")
            ? html`<output class="range-value" for=${this.rangeId}
                >${
                  this.variant === "range"
                    ? `${this.value} – ${this.upperValue}`
                    : this.value
                }</output
              >`
            : nothing
        }
      </div>
      <div class="range-area" data-inset=${this.inset ? "true" : nothing}>
        ${
          this.inset
            ? html`<span
                class="range-inset range-inset--start"
                aria-hidden="true"
                >${this.iconStart}</span
              >`
            : nothing
        }
        ${
          this.showValue &&
          this.variant !== "range" &&
          this.orientation === "horizontal"
            ? html`<span
                class="range-bubble"
                aria-hidden="true"
                style=${
                  this.inset
                    ? `--pos:calc(var(--bubble-inset) + (100% - 2 * var(--bubble-inset)) * ${this.percentValue / 100})`
                    : `--pos:${this.percentValue}%`
                }
                >${this.value}</span
              >`
            : nothing
        }
        <span class="range-track" aria-hidden="true"
          ><span class="range-fill"></span
        ></span>
        ${
          this.stops
            ? html`<span class="stop-marks" aria-hidden="true"
                >${Array.from(
                  { length: Math.floor((this.max - this.min) / this.step) + 1 },
                  () => html`<span></span>`,
                )}</span
              >`
            : nothing
        }
        ${
          this.inset
            ? html`<span class="range-inset range-inset--end" aria-hidden="true"
                >${this.iconEnd}</span
              >`
            : nothing
        }
        ${this.sliderInput(
          "value",
          this.variant === "range" ? this.label : this.label,
          this.min,
          this.variant === "range" ? this.max : this.max,
          Number(this.value),
          (input) => {
            this.value = input.value;
            if (
              this.variant === "range" &&
              Number(this.value) > this.upperValue
            )
              this.upperValue = Number(this.value);
            this.syncForm();
            this.emit("value-input", {
              value: this.value,
              upperValue: this.upperValue,
            });
          },
        )}
        ${
          this.variant === "range"
            ? this.sliderInput(
                "upper",
                this.upperLabel,
                this.min,
                this.max,
                this.upperValue,
                (input) => {
                  this.upperValue = Number(input.value);
                  if (this.upperValue < Number(this.value))
                    this.value = String(this.upperValue);
                  this.syncForm();
                  this.emit("value-input", {
                    value: this.value,
                    upperValue: this.upperValue,
                  });
                },
              )
            : nothing
        }
        ${
          this.stops
            ? html`<datalist id="stops">
                ${Array.from(
                  { length: Math.floor((this.max - this.min) / this.step) + 1 },
                  (_, index) =>
                    html`<option
                      value=${this.min + index * this.step}
                    ></option>`,
                )}
              </datalist>`
            : nothing
        }
      </div>
    </div>`;
  }
  private readonly rangeId = `bubble-slider-${Math.random().toString(36).slice(2, 9)}`;
}

export class BubbleSegmentedButtons extends BubbleFormElement {
  static properties = {
    ...BubbleFormElement.properties,
    items: { attribute: false },
    multiple: { type: Boolean },
    values: { attribute: false },
  };
  static styles = [commonStyles, formStyles];
  items: BubbleItem[] = [];
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
  protected render() {
    return html`<fieldset ?disabled=${this.isDisabled}>
      <legend>${this.label}</legend>
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
      )}
    </fieldset>`;
  }
}

interface AutocompleteEntry {
  value: string;
  label: string;
  disabled: boolean;
}

/** Text field with a filtered list of suggestions, the Material form of an input with a datalist. */
export class BubbleAutocomplete extends BubbleTextField {
  static properties = {
    ...BubbleTextField.properties,
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

import { html, nothing, svg, type TemplateResult } from "lit";
import { BolleFormElement } from "./shared.js";
import { bolleStyles } from "./shared.styles.js";
import { sliderStyles } from "./slider.styles.js";

const clampPercent = (value: number, min: number, max: number) =>
  max > min ? Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100)) : 0;
const reducedMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches;

export type SliderVariant = "bubble" | "liquid" | "membrane" | "range";

/** Continuous slider (bubble, liquid, membrane) or a two-drop range. */
export class BolleSlider extends BolleFormElement {
  static properties = {
    ...BolleFormElement.properties,
    min: { type: Number },
    max: { type: Number },
    step: { type: Number },
    variant: { reflect: true },
    upperValue: { type: Number, attribute: "upper-value" },
    upperLabel: { attribute: "upper-label" },
    minGap: { type: Number, attribute: "min-gap" },
    suffix: {},
    icon: { attribute: false },
    _pressed: { state: true },
    _pointer: { state: true },
    _width: { state: true },
  };
  static styles = [bolleStyles, sliderStyles];
  value = "50";
  min = 0;
  max = 100;
  step = 1;
  variant: SliderVariant = "bubble";
  upperValue = 100;
  upperLabel = "";
  minGap = 4;
  suffix = "";
  icon?: string | TemplateResult;
  protected _pressed = false;
  protected _pointer = false;
  protected _width = 340;
  private initialUpper = 100;
  private observed: Element | null = null;
  private resize = new ResizeObserver(([entry]) => {
    this._width = Math.max(56, entry.contentRect.width);
  });

  private observeMembrane() {
    const box = this.renderRoot?.querySelector(".membrane") ?? null;
    if (box === this.observed) return;
    this.resize.disconnect();
    this.observed = box;
    if (box) this.resize.observe(box);
  }
  connectedCallback() {
    super.connectedCallback();
    this.observeMembrane();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.resize.disconnect();
    this.observed = null;
  }
  protected firstUpdated() {
    super.firstUpdated();
    this.initialUpper = this.upperValue;
  }
  protected updated() {
    super.updated();
    this.observeMembrane();
  }
  formResetCallback() {
    super.formResetCallback();
    this.upperValue = this.initialUpper;
  }
  formStateRestoreCallback(state: string | File | FormData | null) {
    if (typeof state === "string" && state.startsWith("[")) {
      const [lo, hi] = JSON.parse(state);
      this.value = String(lo);
      this.upperValue = Number(hi);
    } else super.formStateRestoreCallback(state);
  }
  protected syncForm() {
    super.syncForm();
    if (this.variant !== "range" || this.isDisabled) return;
    const data = new FormData();
    data.append(this.name, this.value);
    data.append(this.name, String(this.upperValue));
    this.internals.setFormValue(
      this.name ? data : null,
      JSON.stringify([this.value, this.upperValue]),
    );
  }

  private input(
    current: number,
    label: string,
    onInput: (input: HTMLInputElement) => void,
    end?: "lo" | "hi",
  ) {
    return html`<input
      type="range"
      data-end=${end ?? nothing}
      aria-label=${label}
      aria-valuetext=${`${current}${this.suffix}`}
      min=${this.min}
      max=${this.max}
      step=${this.step}
      .value=${String(current)}
      ?disabled=${this.isDisabled}
      @input=${(event: Event) => {
        onInput(event.target as HTMLInputElement);
        this.syncForm();
        this.emit("value-input", {
          value: this.value,
          upperValue: this.upperValue,
        });
      }}
      @change=${() =>
        this.emit("change", { value: this.value, upperValue: this.upperValue })}
    />`;
  }

  private head(output: string | typeof nothing) {
    return html`<p class="label">
      <span>${this.label}</span>${output === nothing
        ? nothing
        : html`<strong>${output}</strong>`}
    </p>`;
  }

  private onPointerDown = () => {
    this._pointer = true;
    this._pressed = true;
  };
  private onPointerUp = () => {
    this._pressed = false;
  };
  private onKeyDown = () => {
    this._pointer = false;
  };

  protected render() {
    const v = Number(this.value);
    const p = clampPercent(v, this.min, this.max);
    const single = this.input(v, this.label, (input) => {
      this.value = input.value;
    });

    if (this.variant === "range") return this.renderRange();

    if (this.variant === "liquid")
      return html`${this.head(`${v}${this.suffix}`)}
        <div class="slider liquid" style=${`--v:${p}`}>
          <span class="icon-slot" aria-hidden="true">${this.icon ?? nothing}</span
          >${single}
        </div>`;

    if (this.variant === "membrane") {
      const w = this._width;
      const base = 70;
      const x = 14 + (p * (w - 28)) / 100;
      const dip = reducedMotion() ? 0 : this._pressed ? 22 : 9;
      const d =
        `M14 ${base} L${Math.max(14, x - 70)} ${base} ` +
        `C${x - 35} ${base} ${x - 28} ${base + dip} ${x} ${base + dip} ` +
        `C${x + 28} ${base + dip} ${x + 35} ${base} ${Math.min(w - 14, x + 70)} ${base} L${w - 14} ${base}`;
      return html`${this.head(nothing)}
        <div
          class="slider membrane"
          ?data-pointer=${this._pointer}
          @pointerdown=${this.onPointerDown}
          @pointerup=${this.onPointerUp}
          @pointercancel=${this.onPointerUp}
          @focusout=${this.onPointerUp}
          @keydown=${this.onKeyDown}
        >
          <svg viewBox=${`0 0 ${w} 110`} aria-hidden="true">
            ${svg`<defs><linearGradient id="membrane-fill" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2=${w} y2="0">
              <stop class="membrane-on" offset=${x / w}></stop><stop class="membrane-off" offset=${x / w}></stop>
            </linearGradient></defs>
            <text class="membrane-value" text-anchor="middle" x=${x} y=${base + dip - 26}>${v}${this.suffix}</text>
            <path d=${d} fill="none" stroke="url(#membrane-fill)" stroke-width="8" stroke-linecap="round"></path>
            <circle class="membrane-thumb" cx=${x} cy=${base + dip} r=${this._pressed ? 16 : 13}></circle>`}
          </svg>
          ${single}
        </div>`;
    }

    return html`${this.head(nothing)}
      <div class="slider" style=${`--v:${p}`}>
        <div class="track"></div>
        <div class="thumb"></div>
        <output class="bubble" aria-hidden="true"
          ><span>${v}${this.suffix}</span></output
        >${single}
      </div>`;
  }

  private renderRange() {
    const lo = Number(this.value);
    const hi = this.upperValue;
    const pl = clampPercent(lo, this.min, this.max);
    const ph = clampPercent(hi, this.min, this.max);
    return html`${this.head(`${lo} – ${hi}${this.suffix}`)}
      <div
        class=${ph - pl < 16 ? "range merged" : "range"}
        style=${`--lo:${pl};--hi:${ph}`}
        ?data-pointer=${this._pointer}
        @pointerdown=${() => (this._pointer = true)}
        @keydown=${this.onKeyDown}
      >
        <div class="bridge"></div>
        <div class="drop thumb-lo"></div>
        <div class="drop thumb-hi"></div>
        ${this.input(
          lo,
          this.label,
          (input) => {
            const next = Math.min(Number(input.value), hi - this.minGap);
            input.value = String(next);
            this.value = String(next);
          },
          "lo",
        )}
        ${this.input(
          hi,
          this.upperLabel || this.label,
          (input) => {
            const next = Math.max(Number(input.value), lo + this.minGap);
            input.value = String(next);
            this.upperValue = next;
          },
          "hi",
        )}
      </div>`;
  }
}

/** Three to seven named discrete levels drawn as growing bubbles. */
export class BolleSteps extends BolleFormElement {
  static properties = {
    ...BolleFormElement.properties,
    options: {
      converter: (value: string | null) =>
        (value ?? "").split(",").map((option) => option.trim()).filter(Boolean),
    },
  };
  static styles = [bolleStyles, sliderStyles];
  options: string[] = [];
  value = "0";

  protected syncForm() {
    const label = this.options[Number(this.value)];
    this.internals.setFormValue(
      this.isDisabled || label === undefined ? null : label,
      this.value,
    );
  }
  override focus(options?: FocusOptions) {
    this.renderRoot
      .querySelector<HTMLElement>('[aria-checked="true"]')
      ?.focus(options);
  }
  private select(index: number) {
    if (this.isDisabled) return;
    this.value = String(index);
    this.emit("change", { index, label: this.options[index] });
  }
  private onKey(event: KeyboardEvent, index: number) {
    const last = this.options.length - 1;
    const next =
      event.key === "ArrowRight" || event.key === "ArrowUp"
        ? Math.min(last, index + 1)
        : event.key === "ArrowLeft" || event.key === "ArrowDown"
          ? Math.max(0, index - 1)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    this.select(next);
    this.updateComplete.then(() =>
      this.renderRoot.querySelectorAll<HTMLElement>(".step")[next]?.focus(),
    );
  }
  protected render() {
    const current = Number(this.value);
    const count = this.options.length;
    return html`<p class="label">
        <span>${this.label}: <strong>${this.options[current] ?? ""}</strong></span>
      </p>
      <div class="steps" role="radiogroup" aria-label=${this.label}>
        ${this.options.map((option, index) => {
          const size = Math.round(16 + 30 * (count === 1 ? 1 : index / (count - 1)));
          return html`<button
            type="button"
            class="step"
            role="radio"
            aria-label=${option}
            aria-checked=${String(index === current)}
            tabindex=${index === current ? 0 : -1}
            ?disabled=${this.isDisabled}
            @click=${() => this.select(index)}
            @keydown=${(event: KeyboardEvent) => this.onKey(event, index)}
          >
            <span class="dot" style=${`--size:${size}px`}></span>
          </button>`;
        })}
      </div>`;
  }
}

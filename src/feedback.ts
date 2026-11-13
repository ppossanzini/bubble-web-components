import { html, nothing } from "lit";
import { BubbleElement } from "./shared.js";
import { commonStyles } from "./shared.styles.js";
import { feedbackStyles } from "./feedback.styles.js";

export class BubbleProgressIndicator extends BubbleElement {
  static properties = {
    label: {},
    value: { type: Number },
    max: { type: Number },
    indeterminate: { type: Boolean },
    variant: { reflect: true },
    wavy: { type: Boolean, reflect: true },
  };
  static styles = [commonStyles, feedbackStyles];
  label = "";
  value = 0;
  max = 100;
  indeterminate = false;
  variant = "linear";
  wavy = false;
  private static wavyId = 0;
  private readonly clipId = `bubble-wavy-${++BubbleProgressIndicator.wavyId}`;
  private wavyPath(length: number) {
    const amplitude = 3;
    const period = 16;
    const middle = 8;
    let path = `M0 ${middle}`;
    for (let x = 0; x < length; x += period) {
      path += ` q ${period / 4} ${-amplitude * 2} ${period / 2} 0 q ${period / 4} ${amplitude * 2} ${period / 2} 0`;
    }
    return path;
  }
  protected render() {
    const max = Number.isFinite(this.max) && this.max > 0 ? this.max : 100;
    const value = Math.max(
      0,
      Math.min(max, Number.isFinite(this.value) ? this.value : 0),
    );
    if (this.variant === "circular")
      return html`<svg
        class=${this.indeterminate ? "circle indeterminate" : "circle"}
        viewBox="0 0 48 48"
        role="progressbar"
        aria-label=${this.label}
        aria-valuemin="0"
        aria-valuemax=${max}
        aria-valuenow=${this.indeterminate ? nothing : value}
      >
        <circle class="track" cx="24" cy="24" r="20"></circle>
        <circle
          class="value"
          cx="24"
          cy="24"
          r="20"
          pathLength="100"
          stroke-dasharray=${`${this.indeterminate ? 25 : (value / max) * 100} 100`}
        ></circle>
      </svg>`;
    if (this.indeterminate)
      return html`<div
        class="linear indeterminate"
        role="progressbar"
        aria-label=${this.label}
      >
        <span class="linear-value"></span>
      </div>`;
    if (this.wavy)
      return html`<svg
        class="wavy"
        viewBox="0 0 240 16"
        preserveAspectRatio="none"
        role="progressbar"
        aria-label=${this.label}
        aria-valuemin="0"
        aria-valuemax=${max}
        aria-valuenow=${value}
      >
        <defs>
          <clipPath id=${this.clipId}>
            <rect
              x="0"
              y="0"
              width=${this.indeterminate ? 240 : (value / max) * 240}
              height="16"
            ></rect>
          </clipPath>
        </defs>
        <path class="wavy-track" d=${this.wavyPath(240)}></path>
        <path
          class=${this.indeterminate ? "wavy-value wavy-indeterminate" : "wavy-value"}
          d=${this.wavyPath(240)}
          clip-path=${`url(#${this.clipId})`}
        ></path>
      </svg>`;
    return html`<div
      class="linear"
      role="progressbar"
      aria-label=${this.label}
      aria-valuemin="0"
      aria-valuemax=${max}
      aria-valuenow=${value}
    >
      <span
        class="linear-value"
        style=${`inline-size:${(value / max) * 100}%`}
      ></span>
      <span class="linear-stop" aria-hidden="true"></span>
    </div>`;
  }
}
export class BubbleLoadingIndicator extends BubbleElement {
  static properties = { label: {}, variant: { reflect: true } };
  static styles = [commonStyles, feedbackStyles];
  label = "";
  variant = "default";
  protected render() {
    return html`<div
      class="loading"
      role="progressbar"
      aria-label=${this.label}
    ></div>`;
  }
}

export class BubbleCarousel extends BubbleElement {
  static properties = {
    label: {},
    variant: { reflect: true },
    previousLabel: { attribute: "previous-label" },
    nextLabel: { attribute: "next-label" },
    index: { type: Number },
    _count: { state: true },
  };
  static styles = [commonStyles, feedbackStyles];
  label = "";
  variant = "hero";
  previousLabel = "";
  nextLabel = "";
  index = 0;
  private _count = 0;
  goTo(index: number) {
    const items = Array.from(this.children) as HTMLElement[];
    if (!items.length) return;
    this.index = Math.max(
      0,
      Math.min(
        items.length - 1,
        Number.isFinite(index) ? Math.trunc(index) : 0,
      ),
    );
    const target = items[this.index];
    const viewport = this.renderRoot.querySelector<HTMLElement>(".viewport")!;
    const rect = target.getBoundingClientRect();
    const view = viewport.getBoundingClientRect();
    const rtl = getComputedStyle(this).direction === "rtl";
    viewport.scrollBy({
      left:
        this.variant === "full-screen"
          ? 0
          : rtl
            ? rect.right - view.right
            : rect.left - view.left,
      top: this.variant === "full-screen" ? rect.top - view.top : 0,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    this.emit("change", { index: this.index });
  }
  private slotsChanged() {
    this._count = this.children.length;
  }
  private scrolled() {
    const viewport = this.renderRoot.querySelector<HTMLElement>(".viewport")!;
    const edge =
      this.variant === "full-screen"
        ? viewport.getBoundingClientRect().top
        : getComputedStyle(this).direction === "rtl"
          ? viewport.getBoundingClientRect().right
          : viewport.getBoundingClientRect().left;
    const distances = Array.from(this.children).map((child) =>
      Math.abs(
        this.variant === "full-screen"
          ? child.getBoundingClientRect().top - edge
          : (getComputedStyle(this).direction === "rtl"
              ? child.getBoundingClientRect().right
              : child.getBoundingClientRect().left) - edge,
      ),
    );
    const index = distances.indexOf(Math.min(...distances));
    if (index >= 0 && this.index !== index) {
      this.index = index;
      this.emit("change", { index });
    }
  }
  protected render() {
    return html`<section
      class="carousel"
      aria-label=${this.label}
      aria-roledescription="carousel"
    >
      <div
        class="viewport"
        tabindex="0"
        @scrollend=${this.scrolled}
        @keydown=${(event: KeyboardEvent) => {
          if (
            event.target !== event.currentTarget ||
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
          const direction = getComputedStyle(this).direction === "rtl" ? -1 : 1;
          this.goTo(
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? this._count - 1
                : this.index +
                  (event.key === "ArrowDown"
                    ? 1
                    : event.key === "ArrowUp"
                      ? -1
                      : event.key === "ArrowRight"
                        ? direction
                        : -direction),
          );
        }}
      >
        <slot @slotchange=${this.slotsChanged}></slot>
      </div>
      <div class="controls">
        <span aria-live="polite"
          >${this._count ? `${this.index + 1} / ${this._count}` : ""}</span
        ><button
          aria-label=${this.previousLabel}
          ?disabled=${this.index <= 0}
          @click=${() => this.goTo(this.index - 1)}
        >
          ‹</button
        ><button
          aria-label=${this.nextLabel}
          ?disabled=${this.index >= this._count - 1}
          @click=${() => this.goTo(this.index + 1)}
        >
          ›
        </button>
      </div>
    </section>`;
  }
}

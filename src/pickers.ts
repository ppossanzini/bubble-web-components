import { html, nothing } from "lit";
import { BubbleTextField } from "./forms.js";
import { commonStyles } from "./shared.styles.js";
import { formStyles } from "./forms.styles.js";
import { pickerStyles } from "./pickers.styles.js";
import {
  calendarDays,
  dateValue,
  parseDate,
  shiftMonth,
} from "./calendar.logic.js";
import { messages, type PickerLabels } from "./localization.js";

class BubblePicker extends BubbleTextField {
  static properties = {
    ...BubbleTextField.properties,
    locale: {},
    labels: { attribute: false },
    _open: { state: true },
  };
  static styles = [commonStyles, formStyles, pickerStyles];
  locale = document.documentElement.lang || "en";
  labels: Partial<PickerLabels> = {};
  protected _open = false;
  protected get text() {
    return messages(this.locale, this.labels);
  }
  protected get surface() {
    return this.renderRoot.querySelector<HTMLDialogElement>("dialog")!;
  }
  protected get displayValue(): string {
    return this.value;
  }
  protected renderInput() {
    return html`<input
      type="text"
      readonly
      .value=${this.displayValue}
      aria-haspopup="dialog"
      aria-expanded=${String(this._open)}
      @click=${() => this.openPicker()}
      @keydown=${(event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.openPicker();
        }
      }}
    />`;
  }
  protected get triggerIcon() {
    return html`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2Zm12 8v9H5v-9Zm-3.6 1.4L13 14l-2-2-3 3 1.4 1.4L11 15l2 2 5.9-5.9Z"
      />
    </svg>`;
  }
  protected openPicker() {}
  protected keydownDialog = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || event.defaultPrevented) return;
    event.preventDefault();
    this.closePicker();
  };
  protected closePicker() {
    this.surface.close();
    this._open = false;
    this.renderRoot
      .querySelector<HTMLButtonElement>(".picker-trigger")
      ?.focus();
  }
  disconnectedCallback() {
    if (this.surface?.open) this.surface.close();
    super.disconnectedCallback();
  }
  protected field() {
    return html`<div class="picker-field">
      ${super.render()}<button
        type="button"
        class="picker-trigger"
        ?disabled=${this.isDisabled || this.readonly}
        aria-label=${this.text.open}
        aria-haspopup="dialog"
        aria-expanded=${String(this._open)}
        @click=${this.openPicker}
      >
        ${this.triggerIcon}
      </button>
    </div>`;
  }
}

export class BubbleDatePicker extends BubblePicker {
  static properties = {
    ...BubblePicker.properties,
    selectionMode: { attribute: "selection-mode" },
    endValue: { attribute: "end-value" },
    weekStartsOn: { type: Number, attribute: "week-starts-on" },
    _month: { state: true },
    _focused: { state: true },
    _draft: { state: true },
    _endDraft: { state: true },
  };
  type = "date";
  variant = "modal";
  protected get displayValue() {
    const date = this.value ? parseDate(this.value) : undefined;
    return date
      ? new Intl.DateTimeFormat(this.locale, { dateStyle: "short" }).format(
          date,
        )
      : "";
  }
  selectionMode: "single" | "range" = "single";
  endValue = "";
  weekStartsOn = 1;
  private _month = new Date();
  private _focused = "";
  private _draft = "";
  private _endDraft = "";
  private firstEndValue = "";
  protected firstUpdated() {
    super.firstUpdated();
    this.firstEndValue = this.endValue;
    if (this.variant !== "docked") return;
    this._draft = this.value;
    this._endDraft = this.endValue;
    this._focused = this.allowed(this.value)
      ? this.value
      : this.min || dateValue(new Date());
    this._month = parseDate(this._focused) ?? new Date();
  }
  formResetCallback() {
    super.formResetCallback();
    this.endValue = this.firstEndValue;
  }
  protected syncForm() {
    super.syncForm();
    if (this.selectionMode === "range" && !this.isDisabled) {
      const data = new FormData();
      data.append(this.name, this.value);
      data.append(this.name, this.endValue);
      this.internals.setFormValue(
        this.name ? data : null,
        JSON.stringify([this.value, this.endValue]),
      );
      if (this.required && (!this.value || !this.endValue))
        this.internals.setValidity({ valueMissing: true }, this.text.end);
      else if (
        this.endValue &&
        (this.endValue < this.value || (this.max && this.endValue > this.max))
      )
        this.internals.setValidity({ rangeOverflow: true }, this.text.end);
    }
  }
  formStateRestoreCallback(state: string | File | FormData | null) {
    if (typeof state === "string" && state.startsWith("[")) {
      const values = JSON.parse(state);
      this.value = values[0];
      this.endValue = values[1];
    } else super.formStateRestoreCallback(state);
  }
  protected async openPicker() {
    this._draft = this.value;
    this._endDraft = this.endValue;
    const today = dateValue(new Date());
    this._focused = this.allowed(this.value)
      ? this.value
      : this.allowed(today)
        ? today
        : this.min || this.max || today;
    this._month = parseDate(this._focused) ?? new Date();
    this._open = true;
    await this.updateComplete;
    this.surface.showModal();
    this.focusDay();
  }
  private allowed(value: string) {
    return (
      !!parseDate(value) &&
      (!this.min || value >= this.min) &&
      (!this.max || value <= this.max)
    );
  }
  private async focusDay() {
    await this.updateComplete;
    this.renderRoot
      .querySelector<HTMLElement>(`[data-date="${this._focused}"]`)
      ?.focus();
  }
  private changeMonth(amount: number) {
    this._month = shiftMonth(this._month, amount);
    this._focused = dateValue(this._month);
  }
  private keyday(event: KeyboardEvent) {
    const date = parseDate(this._focused);
    if (!date) return;
    const rtl = getComputedStyle(this).direction === "rtl" ? -1 : 1;
    let next = new Date(date);
    switch (event.key) {
      case "Enter":
        event.preventDefault();
        this.selectDay(this._focused);
        if (this.selectionMode === "single" || this._endDraft) this.confirm();
        return;
      case "ArrowLeft":
        next.setDate(next.getDate() - rtl);
        break;
      case "ArrowRight":
        next.setDate(next.getDate() + rtl);
        break;
      case "ArrowUp":
        next.setDate(next.getDate() - 7);
        break;
      case "ArrowDown":
        next.setDate(next.getDate() + 7);
        break;
      case "Home":
        next.setDate(1);
        break;
      case "End":
        next.setMonth(next.getMonth() + 1, 0);
        break;
      case "PageUp":
        next = shiftMonth(next, event.shiftKey ? -12 : -1);
        break;
      case "PageDown":
        next = shiftMonth(next, event.shiftKey ? 12 : 1);
        break;
      default:
        return;
    }
    event.preventDefault();
    const value = dateValue(next);
    this._focused =
      this.min && value < this.min
        ? this.min
        : this.max && value > this.max
          ? this.max
          : value;
    this._month = parseDate(this._focused)!;
    this.focusDay();
  }
  private selectDay(value: string) {
    if (!this.allowed(value)) return;
    this._focused = value;
    if (this.selectionMode !== "range" || !this._draft || this._endDraft) {
      this._draft = value;
      this._endDraft = "";
    } else if (value < this._draft) {
      this._endDraft = this._draft;
      this._draft = value;
    } else this._endDraft = value;
  }
  private confirm() {
    if (
      !this.allowed(this._draft) ||
      (this.selectionMode === "range" && !this.allowed(this._endDraft))
    )
      return;
    this.value = this._draft;
    this.endValue = this._endDraft;
    this.syncForm();
    this.emit("change", { value: this.value, endValue: this.endValue });
    this.closePicker();
  }
  private calendarView() {
    const month = this._month;
    const today = dateValue(new Date());
    const full = new Intl.DateTimeFormat(this.locale, { dateStyle: "full" });
    const monthFormat = new Intl.DateTimeFormat(this.locale, { month: "long" });
    const weekStart = ((this.weekStartsOn % 7) + 7) % 7;
    const weekdays = Array.from(
      { length: 7 },
      (_, index) => new Date(2026, 10, 1 + ((weekStart + index) % 7)),
    );
    return html`<div class="calendar">

          <div class="picker-title">${this.label}</div>
          <div class="calendar-header">
            <button
              aria-label=${this.text.previous}
              @click=${() => this.changeMonth(-1)}
            >
              ‹</button
            ><label
              >${this.text.month}<select
                aria-label=${this.text.month}
                .value=${String(month.getMonth())}
                @change=${(event: Event) => {
                  const date = new Date(month);
                  date.setDate(1);
                  date.setMonth(
                    Number((event.target as HTMLSelectElement).value),
                  );
                  this._month = date;
                  this._focused = dateValue(date);
                }}
              >
                ${Array.from(
                  { length: 12 },
                  (_, index) =>
                    html`<option
                      value=${index}
                      ?selected=${index === month.getMonth()}
                    >
                      ${monthFormat.format(new Date(2026, index, 1))}
                    </option>`,
                )}
              </select></label
            ><label
              >${this.text.year}<input
                type="number"
                aria-label=${this.text.year}
                min="100"
                max="9999"
                .value=${String(month.getFullYear())}
                @change=${(event: Event) => {
                  const year = Number((event.target as HTMLInputElement).value);
                  if (year >= 100 && year <= 9999) {
                    const date = new Date(month);
                    date.setFullYear(year, date.getMonth(), 1);
                    this._month = date;
                    this._focused = dateValue(date);
                  }
                }} /></label
            ><button
              aria-label=${this.text.next}
              @click=${() => this.changeMonth(1)}
            >
              ›
            </button>
          </div>
          <div id="month-title" aria-live="polite">
            ${new Intl.DateTimeFormat(this.locale, { month: "long", year: "numeric" }).format(month)}
          </div>
          <table role="grid" aria-labelledby="month-title">
            <thead>
              <tr>
                ${weekdays.map((day) => html`<th scope="col" abbr=${new Intl.DateTimeFormat(this.locale, { weekday: "long" }).format(day)}>${new Intl.DateTimeFormat(this.locale, { weekday: "narrow" }).format(day)}</th>`)}
              </tr>
            </thead>
            <tbody>
              ${calendarDays(month, weekStart).map(
                (week) =>
                  html`<tr>
                    ${week.map((date) => {
                      if (!date) return html`<td role="gridcell"></td>`;
                      const value = dateValue(date);
                      const selected =
                        value === this._draft ||
                        value === this._endDraft ||
                        (!!this._endDraft &&
                          value > this._draft &&
                          value < this._endDraft);
                      return html`<td
                        role="gridcell"
                        aria-selected=${String(selected)}
                      >
                        <button
                          type="button"
                          data-date=${value}
                          ?data-endpoint=${value === this._draft || value === this._endDraft}
                          aria-label=${full.format(date)}
                          aria-current=${value === today ? "date" : nothing}
                          ?disabled=${!this.allowed(value)}
                          tabindex=${value === this._focused ? 0 : -1}
                          @keydown=${this.keyday}
                          @click=${() => this.selectDay(value)}
                        >
                          ${date.getDate()}
                        </button>
                      </td>`;
                    })}
                  </tr>`,
              )}
            </tbody>
          </table>
          <footer>
            <button @click=${this.closePicker}>${this.text.cancel}</button
            ><button
              ?disabled=${!this.allowed(this._draft) || (this.selectionMode === "range" && !this.allowed(this._endDraft))}
              @click=${this.confirm}
            >
              ${this.text.confirm}
            </button>
          </footer>
        </div>
    </div>`;
  }
  protected render() {
    if (this.variant === "docked") return html`${this.calendarView()}`;
    return html`${this.field()}${
        this.selectionMode === "range"
          ? html`<div class="picker-field picker-field--end">
              <div class="field">
                <label
                  ><span>${this.text.end}</span
                  ><input
                    type="text"
                    readonly
                    .value=${
                      this.endValue
                        ? new Intl.DateTimeFormat(this.locale, {
                            dateStyle: "short",
                          }).format(parseDate(this.endValue)!)
                        : ""
                    }
                    aria-haspopup="dialog"
                    ?disabled=${this.isDisabled}
                    @click=${() => this.openPicker()}
                /></label>
              </div>
            </div>`
          : nothing
      }
      <dialog
        aria-label=${this.label}
        @keydown=${this.keydownDialog}
        @close=${() => {
          this._open = false;
        }}
      >
        ${this.calendarView()}
      </dialog>`;
  }
}

export class BubbleTimePicker extends BubblePicker {
  protected get triggerIcon() {
    return html`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm.5-13H11v6l5.2 3.1.8-1.3-4.5-2.7Z"
      />
    </svg>`;
  }
  static properties = {
    ...BubblePicker.properties,
    hourCycle: { type: Number, attribute: "hour-cycle" },
    _hour: { state: true },
    _minute: { state: true },
    _part: { state: true },
    _mode: { state: true },
  };
  type = "time";
  variant = "dial";
  hourCycle = 24;
  protected get displayValue() {
    const match = /^(\d{2}):(\d{2})/.exec(this.value);
    if (!match) return "";
    const date = new Date();
    date.setHours(Number(match[1]), Number(match[2]), 0, 0);
    return new Intl.DateTimeFormat(this.locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: this.hourCycle === 12,
    }).format(date);
  }
  private _hour = 0;
  private _minute = 0;
  private _part: "hour" | "minute" = "hour";
  private _mode = "dial";
  protected async openPicker() {
    const [hour, minute] = (this.value || "00:00").split(":").map(Number);
    this._hour = hour;
    this._minute = minute;
    this._part = "hour";
    this._mode = this.variant === "input" ? "input" : "dial";
    this._open = true;
    await this.updateComplete;
    this.surface.showModal();
    this.renderRoot
      .querySelector<HTMLElement>(
        '.dial [aria-selected="true"],.time-selectors input',
      )
      ?.focus();
  }
  private get draft() {
    return `${String(this._hour).padStart(2, "0")}:${String(this._minute).padStart(2, "0")}`;
  }
  private validDraft() {
    if (
      this._mode === "input" &&
      Array.from(
        this.renderRoot.querySelectorAll<HTMLInputElement>(
          ".time-selectors input",
        ),
      ).some((input) => !input.validity.valid || !input.value)
    )
      return false;
    const input =
      this.renderRoot.querySelector<HTMLInputElement>(".field input");
    if (!input) return true;
    const candidate = input.cloneNode() as HTMLInputElement;
    candidate.value = this.draft;
    return candidate.validity.valid;
  }
  private select(value: number) {
    if (this._part === "hour") {
      this._hour =
        this.hourCycle === 12
          ? (value % 12) + (this._hour >= 12 ? 12 : 0)
          : value;
      this._part = "minute";
    } else this._minute = value;
  }
  private confirm() {
    if (!this.validDraft()) return;
    this.value = this.draft;
    this.syncForm();
    this.emit("change", { value: this.value });
    this.closePicker();
  }
  private dragHandler?: AbortController;
  private valueFromPoint(event: PointerEvent) {
    const dial = this.renderRoot.querySelector<HTMLElement>(".dial");
    if (!dial) return undefined;
    const box = dial.getBoundingClientRect();
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);
    const distance = Math.hypot(dx, dy) / (box.width / 2);
    if (distance > 1.05) return undefined;
    const angle = (Math.atan2(dx, -dy) + 2 * Math.PI) % (2 * Math.PI);
    const index = Math.round(angle / (Math.PI / 6)) % 12;
    if (this._part === "minute") return index * 5;
    if (this.hourCycle === 12) return index || 12;
    return distance < 0.62 ? (index + 12) % 24 : index;
  }
  private startDialDrag(event: PointerEvent) {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("button")) return;
    const dial = event.currentTarget as HTMLElement;
    const part = this._part;
    dial.setPointerCapture(event.pointerId);
    const apply = (pointer: PointerEvent) => {
      const value = this.valueFromPoint(pointer);
      if (value === undefined) return;
      this._part = part;
      this.select(value);
      this.requestUpdate();
    };
    apply(event);
    this.dragHandler?.abort();
    this.dragHandler = new AbortController();
    const signal = this.dragHandler.signal;
    dial.addEventListener("pointermove", apply, { signal });
    for (const type of ["pointerup", "pointercancel"] as const)
      dial.addEventListener(
        type,
        () => {
          this.dragHandler?.abort();
          this.dragHandler = undefined;
        },
        { signal, once: true },
      );
  }
  protected render() {
    const displayedHour =
      this.hourCycle === 12 ? this._hour % 12 || 12 : this._hour;
    const count =
      this._part === "minute" ? 12 : this.hourCycle === 12 ? 12 : 24;
    const values = Array.from({ length: count }, (_, index) =>
      this._part === "minute"
        ? index * 5
        : this.hourCycle === 12
          ? index || 12
          : index,
    );
    return html`${this.field()}
      <dialog
        aria-label=${this.label}
        @keydown=${this.keydownDialog}
        @close=${() => (this._open = false)}
      >
        <div class="picker-title">${this.label}</div>
        <div class="time-selectors">
          ${
            this._mode === "input"
              ? html`<label class="support"
                    >${this.text.hour}<input
                      type="number"
                      required
                      aria-label=${this.text.hour}
                      min=${this.hourCycle === 12 ? 1 : 0}
                      max=${this.hourCycle === 12 ? 12 : 23}
                      .value=${String(displayedHour)}
                      @input=${(event: Event) => {
                        const input = event.target as HTMLInputElement;
                        if (input.validity.valid && input.value)
                          this._hour =
                            this.hourCycle === 12
                              ? (Number(input.value) % 12) +
                                (this._hour >= 12 ? 12 : 0)
                              : Number(input.value);
                        this.requestUpdate();
                      }} /></label
                  ><span>:</span
                  ><label class="support"
                    >${this.text.minute}<input
                      type="number"
                      required
                      aria-label=${this.text.minute}
                      min="0"
                      max="59"
                      .value=${String(this._minute)}
                      @input=${(event: Event) => {
                        const input = event.target as HTMLInputElement;
                        if (input.validity.valid && input.value)
                          this._minute = Number(input.value);
                        this.requestUpdate();
                      }}
                  /></label>`
              : html`<button
                    aria-label=${this.text.hour}
                    aria-pressed=${String(this._part === "hour")}
                    @click=${() => (this._part = "hour")}
                  >
                    ${String(displayedHour).padStart(2, "0")}</button
                  ><span>:</span
                  ><button
                    aria-label=${this.text.minute}
                    aria-pressed=${String(this._part === "minute")}
                    @click=${() => (this._part = "minute")}
                  >
                    ${String(this._minute).padStart(2, "0")}
                  </button>`
          }
        </div>
        ${
          this.hourCycle === 12
            ? html`<div
                class="period"
                role="radiogroup"
                aria-label=${this.text.period}
              >
                <label
                  ><input
                    type="radio"
                    name="period"
                    .checked=${this._hour < 12}
                    @change=${() => (this._hour %= 12)}
                  />AM</label
                ><label
                  ><input
                    type="radio"
                    name="period"
                    .checked=${this._hour >= 12}
                    @change=${() => (this._hour = (this._hour % 12) + 12)}
                  />PM</label
                >
              </div>`
            : nothing
        }
        ${
          this._mode === "dial"
            ? html`<div
                class="dial"
                role="listbox"
                aria-label=${this._part === "hour" ? this.text.hour : this.text.minute}
                @pointerdown=${this.startDialDrag}
                @keydown=${(event: KeyboardEvent) => {
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
                  const buttons = Array.from(
                    this.renderRoot.querySelectorAll<HTMLButtonElement>(
                      ".dial button",
                    ),
                  );
                  const index = buttons.indexOf(
                    this.shadowRoot?.activeElement as HTMLButtonElement,
                  );
                  const next =
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? buttons.length - 1
                        : (index +
                            (["ArrowRight", "ArrowDown"].includes(event.key)
                              ? 1
                              : -1) +
                            buttons.length) %
                          buttons.length;
                  buttons[next]?.focus();
                }}
              >
                ${values.map((value, index) => {
                  const angle = ((index % 12) * Math.PI) / 6;
                  const radius = count === 24 && index >= 12 ? 26 : 40;
                  const selected =
                    this._part === "hour"
                      ? this.hourCycle === 12
                        ? displayedHour === value
                        : this._hour === value
                      : this._minute === value;
                  return html`<button
                    role="option"
                    aria-selected=${String(selected)}
                    aria-label=${`${value} ${this._part === "hour" ? this.text.hours : this.text.minutes}`}
                    style=${`left:${50 + Math.sin(angle) * radius}%;top:${50 - Math.cos(angle) * radius}%`}
                    @click=${() => this.select(value)}
                  >
                    ${value}
                  </button>`;
                })}
              </div>`
            : nothing
        }
        <footer>
          <button
            aria-label=${this._mode === "input" ? this.text.dial : this.text.input}
            @click=${() => (this._mode = this._mode === "input" ? "dial" : "input")}
          >
            ${
              this._mode === "input"
                ? html`<svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    aria-hidden="true"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3 2"
                    />
                  </svg>`
                : html`<svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    aria-hidden="true"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M4 6h16v10H4zM7 10h.01M11 10h.01M15 10h.01M7 13h10M8 19h8"
                    />
                  </svg>`
            }</button
          ><button @click=${this.closePicker}>${this.text.cancel}</button
          ><button ?disabled=${!this.validDraft()} @click=${this.confirm}>
            ${this.text.confirm}
          </button>
        </footer>
      </dialog>`;
  }
}

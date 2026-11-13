import { html, nothing } from "lit";
import { BolleElement, moveFocus, type BolleItem } from "./shared.js";
import { commonStyles } from "./shared.styles.js";
import { navigationStyles } from "./navigation.styles.js";

export class BolleNavigationBar extends BolleElement {
  static properties = {
    items: { attribute: false },
    value: {},
    label: {},
    variant: { reflect: true },
    layout: { reflect: true },
  };
  static styles = [commonStyles, navigationStyles];
  items: BolleItem[] = [];
  value = "";
  label = "";
  variant = "standard";
  layout = "vertical";
  protected content(item: BolleItem) {
    return html`<span class="indicator"
        >${item.icon ? html`<span class="icon" aria-hidden="true">${item.icon}</span>` : nothing}</span
      ><span>${item.label}</span>`;
  }
  protected select(item: BolleItem) {
    this.value = item.id;
    this.emit("navigate", { id: item.id });
  }
  protected render() {
    return html`<nav aria-label=${this.label}>
      <ul class="destinations">
        ${this.items.map((item) => html`<li>${item.href && !item.disabled ? html`<a class="destination" href=${item.href} aria-current=${this.value === item.id ? "page" : nothing} @click=${() => this.select(item)}>${this.content(item)}</a>` : html`<button class="destination" ?disabled=${item.disabled} aria-current=${this.value === item.id ? "page" : nothing} @click=${() => this.select(item)}>${this.content(item)}</button>`}</li>`)}
      </ul>
    </nav>`;
  }
}
export class BolleNavigationRail extends BolleNavigationBar {
  static properties = {
    ...BolleNavigationBar.properties,
    expanded: { type: Boolean, reflect: true },
  };
  expanded = false;
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("rail", "");
  }
}

export class BolleTabs extends BolleElement {
  static properties = {
    items: { attribute: false },
    value: {},
    label: {},
    variant: { reflect: true },
    activation: {},
    scrollable: { type: Boolean, reflect: true },
  };
  static styles = [commonStyles, navigationStyles];
  items: BolleItem[] = [];
  value = "";
  label = "";
  variant = "primary";
  activation: "automatic" | "manual" = "automatic";
  scrollable = false;
  private atStart = true;
  private atEnd = true;
  private onScroll = () => this.syncScrollState();
  private syncScrollState() {
    const list = this.renderRoot.querySelector<HTMLElement>(".tab-scroll");
    if (!list) return;
    const max = list.scrollWidth - list.clientWidth;
    const atStart = list.scrollLeft <= 1;
    const atEnd = list.scrollLeft >= max - 1;
    if (atStart === this.atStart && atEnd === this.atEnd) return;
    this.atStart = atStart;
    this.atEnd = atEnd;
    this.requestUpdate();
  }
  private scrollTabs(direction: -1 | 1) {
    const list = this.renderRoot.querySelector<HTMLElement>(".tab-scroll");
    if (!list) return;
    list.scrollBy({
      left: direction * Math.max(120, list.clientWidth * 0.6),
      behavior: "smooth",
    });
  }
  private scrollerObserver?: ResizeObserver;
  protected updated() {
    if (!this.scrollable) return;
    const list = this.renderRoot.querySelector<HTMLElement>(".tab-scroll");
    if (!list) return;
    list.addEventListener("scroll", this.onScroll, { passive: true });
    if (this.scrollerObserver?.observe) {
      this.scrollerObserver.disconnect();
      this.scrollerObserver.observe(list);
    } else {
      this.scrollerObserver = new ResizeObserver(() => this.syncScrollState());
      this.scrollerObserver.observe(list);
      this.scrollerObserver.observe(this);
    }
    this.syncScrollState();
  }
  disconnectedCallback() {
    this.scrollerObserver?.disconnect();
    this.scrollerObserver = undefined;
    this.renderRoot
      .querySelector<HTMLElement>(".tab-scroll")
      ?.removeEventListener("scroll", this.onScroll);
    super.disconnectedCallback();
  }
  private selectedId() {
    return this.items.some((item) => item.id === this.value && !item.disabled)
      ? this.value
      : (this.items.find((item) => !item.disabled)?.id ?? "");
  }
  private select(id: string) {
    this.value = id;
    this.emit("change", { value: id });
  }
  private chevron(direction: -1 | 1) {
    return html`<svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d=${direction === -1 ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}></path>
    </svg>`;
  }
  protected render() {
    const active = this.selectedId();
    const list = html`<div
      class=${this.scrollable ? "tab-scroll" : nothing}
      role="tablist"
      aria-label=${this.label}
      @keydown=${(event: KeyboardEvent) => {
        moveFocus(
          event,
          Array.from(
            this.renderRoot.querySelectorAll<HTMLElement>(
              '[role="tab"]:not(:disabled)',
            ),
          ),
        );
        if (
          this.activation === "automatic" &&
          ["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)
        ) {
          const tab = this.shadowRoot?.activeElement as HTMLElement | null;
          if (tab?.dataset.id) this.select(tab.dataset.id);
        }
      }}
    >
      ${this.items.map((item, index) => html`<button class="destination" role="tab" id=${`tab-${index}`} data-id=${item.id} aria-selected=${String(active === item.id)} aria-controls=${`panel-${index}`} tabindex=${active === item.id ? 0 : -1} ?disabled=${item.disabled} @click=${() => this.select(item.id)}>${item.icon ? html`<span class="tab-icon icon" aria-hidden="true">${item.icon}</span>` : nothing}<span>${item.label}</span>${item.badge ? html`<span class="tab-badge">${item.badge}</span>` : nothing}</button>`)}
    </div>`;
    return html`${
      this.scrollable
        ? html`<div class="tab-scroller">
            <button
              class="tab-scroll-button"
              type="button"
              aria-label="Previous tabs"
              ?disabled=${this.atStart}
              @click=${() => this.scrollTabs(-1)}
            >
              ${this.chevron(-1)}
            </button>
            ${list}
            <button
              class="tab-scroll-button"
              type="button"
              aria-label="Next tabs"
              ?disabled=${this.atEnd}
              @click=${() => this.scrollTabs(1)}
            >
              ${this.chevron(1)}
            </button>
          </div>`
        : list
    }
    ${this.items.map((item, index) => html`<section role="tabpanel" id=${`panel-${index}`} aria-labelledby=${`tab-${index}`} tabindex="0" ?hidden=${active !== item.id}><slot name=${item.id}></slot></section>`)}`;
  }
}

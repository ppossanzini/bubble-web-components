import { LitElement, html } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import type { BolleMenu } from "../src/index.js";
import { ti } from "../demo/icons.js";

/** Compact single-select built from bolle-button + bolle-menu. */
export class DocsSelect extends LitElement {
  static properties = {
    label: {},
    value: {},
    options: { attribute: false },
  };
  declare label: string;
  declare value: string;
  declare options: string[];
  private menu = createRef<BolleMenu>();

  constructor() {
    super();
    this.label = "";
    this.value = "";
    this.options = [];
  }

  createRenderRoot() {
    return this;
  }

  private open = (event: Event) => {
    this.menu.value?.show(event.currentTarget as HTMLElement);
  };

  private select = (event: Event) => {
    const item = (event as CustomEvent<{ item: { id: string } }>).detail.item;
    this.value = item.id;
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: item.id },
        bubbles: true,
        composed: true,
      }),
    );
  };

  protected render() {
    return html`
      <bolle-button
        variant="outlined"
        haspopup="menu"
        .label=${`${this.label}: ${this.value}`}
        @click=${this.open}
      >
        ${this.value} ${ti("chevron-down")}
      </bolle-button>
      <bolle-menu
        ${ref(this.menu)}
        menu-label=${this.label}
        selection-mode="single"
        .items=${this.options.map((id) => ({
          id,
          label: id,
          selected: id === this.value,
        }))}
        @menu-select=${this.select}
      ></bolle-menu>
    `;
  }
}

if (!customElements.get("docs-select"))
  customElements.define("docs-select", DocsSelect);

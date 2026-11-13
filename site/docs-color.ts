import { LitElement, html } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import type { BolleDialog } from "../src/index.js";
import {
  BLACK,
  MATERIAL_FAMILIES,
  WHITE,
  familyOf,
  readableOn,
} from "./palette.js";

const baseShade = (name: string) => {
  const family = MATERIAL_FAMILIES.find((item) => item.name === name);
  return (
    family?.shades.find((shade) => shade.name === "500") ??
    family?.shades[family.shades.length - 1]
  );
};

/** Material palette picker used by the token editor. */
export class DocsColor extends LitElement {
  static properties = {
    label: {},
    value: {},
    family: { state: true },
  };

  declare label: string;
  declare value: string;
  declare family: string;
  private dialog = createRef<BolleDialog>();

  constructor() {
    super();
    this.label = "";
    this.value = "#6750A4";
    this.family = MATERIAL_FAMILIES[0].name;
  }

  createRenderRoot() {
    return this;
  }

  private open = () => {
    this.family = familyOf(this.value);
    this.dialog.value?.show();
  };

  private choose = (hex: string) => {
    this.value = hex;
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: hex },
        bubbles: true,
        composed: true,
      }),
    );
    this.dialog.value?.close();
  };

  private swatch(hex: string, name: string, selected: boolean) {
    return html`<button
      type="button"
      class=${`shade ${selected ? "is-selected" : ""}`}
      style=${`background:${hex};color:${readableOn(hex)}`}
      title=${`${name} · ${hex}`}
      aria-label=${`${name}, ${hex}`}
      aria-pressed=${String(selected)}
      @click=${() => this.choose(hex)}
    >
      ${name}
    </button>`;
  }

  protected render() {
    const family =
      MATERIAL_FAMILIES.find((item) => item.name === this.family) ??
      MATERIAL_FAMILIES[0];
    const current = this.value.toUpperCase();
    return html`
      <button
        type="button"
        class="color-trigger"
        aria-haspopup="dialog"
        aria-label=${`${this.label}: ${this.value}`}
        @click=${this.open}
      >
        <span class="color-swatch" style=${`background:${this.value}`}></span>
        <span class="color-value">${this.value}</span>
      </button>

      <bolle-dialog
        ${ref(this.dialog)}
        class="palette-dialog"
        label=${`Colore · ${this.label}`}
        close-label="Chiudi"
      >
        <div class="palette-content">
          <div class="palette-head">
            <span class="palette-caption">Colore selezionato · ${family.name}</span>
            <span class="palette-current">
              <span class="color-swatch" style=${`background:${this.value}`}></span>
              <code>${this.value}</code>
            </span>
          </div>

          <p class="palette-caption">Colori di base</p>
          <div class="base-grid" role="group" aria-label="Colori di base">
            ${MATERIAL_FAMILIES.map((item) => {
              const base = baseShade(item.name);
              if (!base) return null;
              const selected = item.name === family.name;
              return html`<button
                type="button"
                class=${`base-color ${selected ? "is-selected" : ""}`}
                style=${`background:${base.hex};color:${readableOn(base.hex)}`}
                title=${`${item.name} · ${base.hex}`}
                aria-label=${`${item.name}, ${base.hex}`}
                aria-pressed=${String(selected)}
                @click=${() => (this.family = item.name)}
              >
                ${item.name}
              </button>`;
            })}
          </div>

          <p class="palette-caption">Toni ${family.name}</p>
          <div class="shade-grid" role="group" aria-label=${`Toni ${family.name}`}>
            ${family.shades.map((shade) =>
              this.swatch(
                shade.hex,
                `${family.name} ${shade.name}`,
                shade.hex === current,
              ),
            )}
          </div>

          <div class="palette-neutrals">
            ${this.swatch(WHITE, "Bianco", WHITE === current)}
            ${this.swatch(BLACK, "Nero", BLACK === current)}
          </div>
        </div>
      </bolle-dialog>
    `;
  }
}

if (!customElements.get("docs-color"))
  customElements.define("docs-color", DocsColor);

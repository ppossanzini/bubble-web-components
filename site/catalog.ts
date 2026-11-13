import { html, nothing, type TemplateResult } from "lit";
import { ti } from "../demo/icons.js";
import type { BolleItem, MenuEntry } from "../src/index.js";
import type { AttrSpec, SnippetSpec } from "./codegen.js";
import { code } from "./codegen.js";

export type Group =
  | "App bars"
  | "Badges"
  | "Buttons"
  | "Cards"
  | "Carousel"
  | "Checkbox"
  | "Chips"
  | "Date & time pickers"
  | "Dialogs"
  | "Divider"
  | "HTML controls"
  | "Lists"
  | "Loading indicator"
  | "Menus"
  | "Navigation bar"
  | "Navigation drawer"
  | "Navigation rail"
  | "Progress indicators"
  | "Radio button"
  | "Search"
  | "Sheets"
  | "Sliders"
  | "Snackbar"
  | "Switch"
  | "Tabs"
  | "Text fields"
  | "Toolbars"
  | "Tooltips";

export type State = Record<string, unknown>;

export interface PreviewContext {
  show(id: string, event: Event): void;
  close(id: string, value?: string): void;
  snackbar(id: string, message?: string): void;
}

interface ControlBase {
  prop: string;
  label: string;
}
export type Control =
  | (ControlBase & {
      kind: "enum";
      options: string[];
      default: string;
    })
  | (ControlBase & { kind: "bool"; default: boolean })
  | (ControlBase & {
      kind: "range";
      min: number;
      max: number;
      step?: number;
      default: number;
    })
  | (ControlBase & { kind: "text"; default: string; placeholder?: string })
  | (ControlBase & { kind: "longtext"; default: string; rows?: number });

export interface Entry {
  tag: string;
  title: string;
  /** Label used inside a multi-component family in the navigation. */
  navLabel?: string;
  group: Group;
  summary: string;
  note?: string;
  controls: Control[];
  render: (state: State, ctx: PreviewContext) => TemplateResult;
  code: (state: State) => SnippetSpec;
}

const en = (
  prop: string,
  label: string,
  options: string[],
  fallback: string,
): Control => ({ kind: "enum", prop, label, options, default: fallback });
const fl = (prop: string, label: string, fallback: boolean): Control => ({
  kind: "bool",
  prop,
  label,
  default: fallback,
});
const rg = (
  prop: string,
  label: string,
  min: number,
  max: number,
  fallback: number,
  step = 1,
): Control => ({ kind: "range", prop, label, min, max, step, default: fallback });
const tx = (
  prop: string,
  label: string,
  fallback: string,
  placeholder?: string,
): Control => ({ kind: "text", prop, label, default: fallback, placeholder });
const lt = (
  prop: string,
  label: string,
  fallback: string,
  rows = 3,
): Control => ({ kind: "longtext", prop, label, default: fallback, rows });

const s = (state: State, prop: string) => String(state[prop] ?? "");
const b = (state: State, prop: string) => Boolean(state[prop]);
const n = (state: State, prop: string) => Number(state[prop] ?? 0);
const a = (name: string, value: unknown): AttrSpec => ({
  name,
  value: value as string | number | boolean,
});

const ICON_ITEMS = [
  { id: "inbox", label: "Posta", icon: "inbox" },
  { id: "archive", label: "Archivio", icon: "archive" },
  { id: "settings", label: "Impostazioni", icon: "settings" },
];
const sixItems = [
  ...ICON_ITEMS,
  { id: "trash", label: "Cestino", icon: "trash" },
  { id: "help", label: "Aiuto", icon: "help" },
];
const navItems = (source = ICON_ITEMS): BolleItem[] =>
  source.map((item) => ({ ...item, icon: ti(item.icon) }));

const LIST_CODE = [
  {
    id: "inbox",
    label: "Posta",
    icon: "inbox",
    supportingText: "Messaggi ricevuti",
    badge: "3",
  },
  { id: "archive", label: "Archivio", icon: "archive", href: "/archivio" },
  {
    id: "folders",
    label: "Cartelle",
    icon: "folder",
    items: [
      { id: "work", label: "Lavoro", badge: "12" },
      { id: "home", label: "Casa" },
    ],
  },
  { id: "trash", label: "Cestino", icon: "trash", disabled: true },
];
const listItems = (): BolleItem[] =>
  LIST_CODE.map((item) => ({
    ...item,
    icon: item.icon ? ti(item.icon) : undefined,
    items: item.items ? item.items.map((child) => ({ ...child })) : undefined,
  }));

const MENU_GROUPS: MenuEntry[] = [
  {
    group: true,
    label: "Modifica",
    items: [
      { id: "undo", label: "Annulla", trailingText: "⌘Z" },
      { id: "redo", label: "Ripeti", trailingText: "⇧⌘Z", disabled: true },
    ],
  },
  { separator: true },
  {
    id: "share",
    label: "Condividi",
    children: [
      { id: "link", label: "Copia collegamento" },
      { id: "email", label: "Invia per email" },
    ],
  },
];
const menuEntries = (selection: string): MenuEntry[] => [
  ...MENU_GROUPS,
  ...(selection === "none"
    ? [{ id: "open", label: "Apri in nuova scheda", href: "https://example.com" } as MenuEntry]
    : []),
  { id: "download", label: "Scarica", trailingText: "PDF" },
];

const SPLIT_ITEMS: MenuEntry[] = [
  { id: "later", label: "Invia più tardi" },
  { id: "draft", label: "Salva bozza" },
  { separator: true },
  { id: "template", label: "Usa modello" },
];

const SUGGESTIONS = ["Bologna", "Bolzano", "Firenze", "Genova", "Milano", "Napoli", "Roma", "Torino"];
const CITY_OPTIONS = [
  "Bari",
  "Bologna",
  "Firenze",
  "Genova",
  "Milano",
  "Napoli",
  "Palermo",
  "Roma",
  "Torino",
  "Venezia",
];

const TAB_CODE = [
  { id: "inbox", label: "Posta", icon: "inbox", badge: "3" },
  { id: "archive", label: "Archivio", icon: "archive" },
  { id: "settings", label: "Preferenze", icon: "settings" },
];
const tabItems = (): BolleItem[] =>
  TAB_CODE.map((item) => ({ ...item, icon: ti(item.icon) }));

const snippets = (items: unknown, name = "items") => ({
  vuePreamble: [`const ${name} = ${code(items)}`],
  reactPreamble: [`const ${name} = ${code(items)}`],
});

export const entries: Entry[] = [
  {
    tag: "bolle-button",
    title: "Button",
    navLabel: "Buttons",
    group: "Buttons",
    summary:
      "Azione principale o secondaria, con stati di toggle, link e invio form.",
    controls: [
      en("variant", "Variante", ["filled", "tonal", "outlined", "elevated", "text", "accent"], "filled"),
      en("size", "Dimensione", ["xs", "small", "medium", "large", "xl"], "small"),
      en("shape", "Forma", ["round", "square"], "round"),
      fl("icon", "Icona iniziale", false),
      fl("toggle", "Toggle", false),
      fl("selected", "Selezionato", false),
      fl("disabled", "Disabilitato", false),
      tx("label", "Etichetta accessibile", "Azione"),
    ],
    render: (state) => html`<bolle-button
      .variant=${s(state, "variant")}
      .size=${s(state, "size")}
      .shape=${s(state, "shape")}
      ?toggle=${b(state, "toggle") && s(state, "variant") !== "text"}
      ?selected=${b(state, "selected")}
      ?disabled=${b(state, "disabled")}
      .label=${s(state, "label")}
      >${b(state, "icon")
        ? html`<span slot="icon" aria-hidden="true">${ti("plus")}</span>`
        : nothing}${s(state, "label") || "Azione"}</bolle-button
    >`,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("size", s(state, "size")),
        a("shape", s(state, "shape")),
        a("toggle", b(state, "toggle") && s(state, "variant") !== "text"),
        a("selected", b(state, "selected")),
        a("disabled", b(state, "disabled")),
        a("label", s(state, "label")),
      ],
      content: `${b(state, "icon") ? '<span slot="icon" aria-hidden="true">plus</span>' : ""}${s(state, "label") || "Azione"}`,
    }),
  },
  {
    tag: "bolle-icon-button",
    title: "Icon button",
    navLabel: "Icon buttons",
    group: "Buttons",
    summary: "Bottone con sola icona; l'etichetta accessibile è obbligatoria.",
    controls: [
      en("variant", "Variante", ["filled", "tonal", "outlined", "standard"], "tonal"),
      en("size", "Dimensione", ["xs", "small", "medium", "large", "xl"], "small"),
      en("shape", "Forma", ["round", "square"], "round"),
      en("width", "Larghezza", ["default", "narrow", "wide"], "default"),
      fl("toggle", "Toggle", false),
      fl("selected", "Selezionato", false),
      fl("disabled", "Disabilitato", false),
      tx("label", "Etichetta accessibile", "Notifiche"),
    ],
    render: (state) => html`<bolle-icon-button
      .variant=${s(state, "variant")}
      .size=${s(state, "size")}
      .shape=${s(state, "shape")}
      .width=${s(state, "width")}
      ?toggle=${b(state, "toggle")}
      ?selected=${b(state, "selected")}
      ?disabled=${b(state, "disabled")}
      .label=${s(state, "label")}
      >${ti("star")}</bolle-icon-button
    >`,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("size", s(state, "size")),
        a("shape", s(state, "shape")),
        a("width", s(state, "width")),
        a("toggle", b(state, "toggle")),
        a("selected", b(state, "selected")),
        a("disabled", b(state, "disabled")),
        a("label", s(state, "label")),
      ],
      content: "star",
    }),
  },
  {
    tag: "bolle-floating-action-button",
    title: "FAB",
    navLabel: "FABs",
    group: "Buttons",
    summary: "Azione flottante con taglie e sei mappature di colore.",
    controls: [
      en("size", "Dimensione", ["fab", "small", "medium", "large"], "medium"),
      en("color", "Colore", ["primary-container", "secondary-container", "tertiary-container", "primary", "secondary", "tertiary", "surface"], "primary-container"),
      fl("disabled", "Disabilitato", false),
      tx("label", "Etichetta accessibile", "Crea"),
    ],
    render: (state) => html`<bolle-floating-action-button
      .size=${s(state, "size")}
      .color=${s(state, "color")}
      ?disabled=${b(state, "disabled")}
      .label=${s(state, "label")}
      >${ti("plus")}</bolle-floating-action-button
    >`,
    code: (state) => ({
      attrs: [
        a("size", s(state, "size")),
        a("color", s(state, "color")),
        a("disabled", b(state, "disabled")),
        a("label", s(state, "label")),
      ],
      content: "add",
    }),
  },
  {
    tag: "bolle-extended-fab",
    title: "Extended FAB",
    navLabel: "Extended FABs",
    group: "Buttons",
    summary: "FAB esteso con testo visibile e icona opzionale.",
    controls: [
      en("size", "Dimensione", ["small", "medium", "large"], "small"),
      en("color", "Colore", ["primary-container", "secondary-container", "tertiary-container", "primary", "secondary", "tertiary", "surface"], "primary-container"),
      fl("icon", "Icona iniziale", true),
      fl("disabled", "Disabilitato", false),
      tx("label", "Etichetta", "Crea documento"),
    ],
    render: (state) => html`<bolle-extended-fab
      .size=${s(state, "size")}
      .color=${s(state, "color")}
      ?disabled=${b(state, "disabled")}
      .label=${s(state, "label")}
      >${b(state, "icon")
        ? html`<span slot="icon" aria-hidden="true">${ti("plus")}</span>`
        : nothing}${s(state, "label")}</bolle-extended-fab
    >`,
    code: (state) => ({
      attrs: [
        a("size", s(state, "size")),
        a("color", s(state, "color")),
        a("disabled", b(state, "disabled")),
        a("label", s(state, "label")),
      ],
      content: `${b(state, "icon") ? '<span slot="icon" aria-hidden="true">add</span>\n' : ""}${s(state, "label")}`,
    }),
  },
  {
    tag: "bolle-button-group",
    title: "Button group",
    navLabel: "Button groups",
    group: "Buttons",
    summary:
      "Gruppo con selezione singola o multipla, navigazione da tastiera e geometria connessa.",
    controls: [
      en("variant", "Variante", ["standard", "connected"], "connected"),
      en("selection", "Selezione", ["none", "single", "multiple"], "single"),
      en("buttonVariant", "Stile bottoni", ["filled", "tonal", "outlined", "elevated"], "filled"),
      en("size", "Dimensione", ["xs", "small", "medium", "large", "xl"], "small"),
      en("shape", "Forma", ["round", "square"], "round"),
      fl("icons", "Icone", false),
      fl("required", "Obbligatorio", false),
      tx("label", "Etichetta del gruppo", "Allineamento"),
    ],
    render: (state) => html`<bolle-button-group
      .variant=${s(state, "variant")}
      .selection=${s(state, "selection")}
      .size=${s(state, "size")}
      .shape=${s(state, "shape")}
      ?required=${b(state, "required")}
      .label=${s(state, "label")}
    >
      <bolle-button
        value="left"
        variant=${s(state, "buttonVariant")}
        selected
        >${b(state, "icons")
          ? html`<span slot="icon" aria-hidden="true">${ti("bold")}</span>`
          : nothing}Sinistra</bolle-button
      >
      <bolle-button value="center" variant=${s(state, "buttonVariant")}
        >${b(state, "icons")
          ? html`<span slot="icon" aria-hidden="true">${ti("italic")}</span>`
          : nothing}Centro</bolle-button
      >
      <bolle-button value="right" variant=${s(state, "buttonVariant")}
        >${b(state, "icons")
          ? html`<span slot="icon" aria-hidden="true">${ti("underline")}</span>`
          : nothing}Destra</bolle-button
      >
    </bolle-button-group>`,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("selection", s(state, "selection")),
        a("size", s(state, "size")),
        a("shape", s(state, "shape")),
        a("required", b(state, "required")),
        a("label", s(state, "label")),
      ],
      content: ["left", "center", "right"]
        .map((value, index) => {
          const text = ["Sinistra", "Centro", "Destra"][index];
          const icon = ["bold", "italic", "underline"][index];
          const attrs = `value="${value}" variant="${s(state, "buttonVariant")}"${index === 0 ? " selected" : ""}`;
          const leading = b(state, "icons")
            ? `<span slot="icon" aria-hidden="true">${icon}</span>`
            : "";
          return `<bolle-button ${attrs}>${leading}${text}</bolle-button>`;
        })
        .join("\n"),
    }),
  },
  {
    tag: "bolle-badge",
    title: "Badge",
    group: "Badges",
    summary: "Contatore o punto di notifica; con etichetta diventa uno stato annunciato.",
    controls: [
      tx("value", "Valore", "12"),
      rg("max", "Massimo", 0, 999, 999),
      fl("small", "Solo punto", false),
      tx("label", "Etichetta accessibile", "Notifiche"),
    ],
    render: (state) => html`<bolle-badge
      .value=${s(state, "value")}
      .max=${n(state, "max")}
      ?small=${b(state, "small")}
      .label=${s(state, "label")}
    ></bolle-badge>`,
    code: (state) => ({
      attrs: [
        a("value", s(state, "value")),
        a("max", n(state, "max")),
        a("small", b(state, "small")),
        a("label", s(state, "label")),
      ],
    }),
  },
  {
    tag: "bolle-progress-indicator",
    title: "Progress indicator",
    group: "Progress indicators",
    summary: "Avanzamento lineare o circolare, determinato o indeterminato, anche ondulato.",
    controls: [
      en("variant", "Variante", ["linear", "circular"], "linear"),
      rg("value", "Valore", 0, 100, 65),
      fl("indeterminate", "Indeterminato", false),
      fl("wavy", "Ondulato", false),
      tx("label", "Etichetta accessibile", "Avanzamento"),
    ],
    render: (state) => html`<bolle-progress-indicator
      .variant=${s(state, "variant")}
      .value=${n(state, "value")}
      ?indeterminate=${b(state, "indeterminate")}
      ?wavy=${b(state, "wavy")}
      .label=${s(state, "label")}
    ></bolle-progress-indicator>`,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("value", n(state, "value")),
        a("indeterminate", b(state, "indeterminate")),
        a("wavy", b(state, "wavy")),
        a("label", s(state, "label")),
      ],
    }),
  },
  {
    tag: "bolle-loading-indicator",
    title: "Loading indicator",
    group: "Loading indicator",
    summary: "Indicatore Morph, libero o dentro un contenitore.",
    controls: [
      en("variant", "Variante", ["default", "contained"], "default"),
      tx("label", "Etichetta accessibile", "Caricamento"),
    ],
    render: (state) => html`<bolle-loading-indicator
      .variant=${s(state, "variant")}
      .label=${s(state, "label")}
    ></bolle-loading-indicator>`,
    code: (state) => ({
      attrs: [a("variant", s(state, "variant")), a("label", s(state, "label"))],
    }),
  },
  {
    tag: "bolle-snackbar",
    title: "Snackbar",
    group: "Snackbar",
    summary: "Messaggio temporaneo con azione, chiusura e coda di messaggi.",
    controls: [
      tx("message", "Messaggio", "Documento eliminato"),
      tx("actionLabel", "Etichetta azione", "Annulla"),
      tx("closeLabel", "Etichetta chiusura", "Chiudi"),
      rg("duration", "Durata (ms)", 0, 10000, 5000, 1000),
    ],
    render: (state, ctx) => html`
      <bolle-button variant="tonal" @click=${() => ctx.snackbar("pv-snackbar", s(state, "message"))}>
        Mostra snackbar
      </bolle-button>
      <bolle-snackbar
        id="pv-snackbar"
        .message=${s(state, "message")}
        .actionLabel=${s(state, "actionLabel")}
        .closeLabel=${s(state, "closeLabel")}
        .duration=${n(state, "duration")}
      ></bolle-snackbar>
    `,
    code: (state) => ({
      attrs: [
        a("message", s(state, "message")),
        a("actionLabel", s(state, "actionLabel")),
        a("closeLabel", s(state, "closeLabel")),
        a("duration", n(state, "duration")),
      ],
    }),
  },
  {
    tag: "bolle-tooltip",
    title: "Tooltip",
    group: "Tooltips",
    summary: "Testo di aiuto su hover e focus, semplice o con contenuto ricco.",
    controls: [
      en("variant", "Variante", ["plain", "rich"], "plain"),
      fl("persistent", "Persistente", false),
      tx("label", "Etichetta", "Salva una copia"),
      tx("supportingText", "Testo di supporto", "La copia resta nel tuo spazio personale."),
    ],
    render: (state) => html`<bolle-tooltip
      .variant=${s(state, "variant")}
      ?persistent=${b(state, "persistent")}
      .label=${s(state, "label")}
      .supportingText=${s(state, "supportingText")}
    >
      <bolle-button variant="tonal">Salva una copia</bolle-button>
    </bolle-tooltip>`,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("persistent", b(state, "persistent")),
        a("label", s(state, "label")),
        a("supportingText", s(state, "supportingText")),
      ],
      content: '<bolle-button variant="tonal">Salva una copia</bolle-button>',
    }),
  },
  {
    tag: "bolle-carousel",
    title: "Carousel",
    group: "Carousel",
    summary: "Sequenza di slide con controlli, contatore e varianti hero, multi-browse e full-screen.",
    controls: [
      en("variant", "Variante", ["hero", "multi-browse", "uncontained", "uncontained-multi-aspect-ratio", "center-aligned-hero", "full-screen"], "hero"),
      tx("label", "Etichetta", "Documenti recenti"),
      tx("previousLabel", "Etichetta precedente", "Precedente"),
      tx("nextLabel", "Etichetta successivo", "Successivo"),
    ],
    render: (state) => html`<bolle-carousel
      .variant=${s(state, "variant")}
      .label=${s(state, "label")}
      .previousLabel=${s(state, "previousLabel")}
      .nextLabel=${s(state, "nextLabel")}
    >
      <article><h3>Posta</h3><p>Messaggi ricevuti</p></article>
      <article><h3>Archivio</h3><p>Documenti salvati</p></article>
      <article><h3>Impostazioni</h3><p>Preferenze personali</p></article>
    </bolle-carousel>`,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("label", s(state, "label")),
        a("previousLabel", s(state, "previousLabel")),
        a("nextLabel", s(state, "nextLabel")),
      ],
      content:
        "<article><h3>Posta</h3><p>Messaggi ricevuti</p></article>\n" +
        "<article><h3>Archivio</h3><p>Documenti salvati</p></article>\n" +
        "<article><h3>Impostazioni</h3><p>Preferenze personali</p></article>",
    }),
  },
  {
    tag: "bolle-card",
    title: "Card",
    group: "Cards",
    summary: "Superficie per contenuto correlato, con media, orientamento e varianti di elevazione.",
    controls: [
      en("variant", "Variante", ["filled", "elevated", "outlined"], "filled"),
      en("orientation", "Orientamento", ["vertical", "horizontal"], "vertical"),
      tx("href", "Collegamento", ""),
      tx("label", "Etichetta accessibile", "Documento"),
    ],
    render: (state) => html`<bolle-card
      .variant=${s(state, "variant")}
      .orientation=${s(state, "orientation")}
      .href=${s(state, "href")}
      .label=${s(state, "label")}
    >
      <h3>Documento</h3>
      <p>Contenuto indipendente con un'azione interna.</p>
      ${s(state, "href")
        ? nothing
        : html`<bolle-button variant="text">Apri</bolle-button>`}
    </bolle-card>`,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("orientation", s(state, "orientation")),
        a("href", s(state, "href")),
        a("label", s(state, "label")),
      ],
      content:
        "<h3>Documento</h3>\n<p>Contenuto indipendente con un'azione interna.</p>",
    }),
  },
  {
    tag: "bolle-dialog",
    title: "Dialog",
    group: "Dialogs",
    summary: "Finestra modale o non modale, con azioni e variante a schermo intero.",
    controls: [
      en("variant", "Variante", ["basic", "full-screen"], "basic"),
      fl("modal", "Modale", true),
      tx("closeLabel", "Etichetta chiusura", "Annulla"),
      tx("label", "Etichetta accessibile", "Eliminare il documento?"),
    ],
    render: (state, ctx) => html`
      <bolle-button variant="filled" @click=${(event: Event) => ctx.show("pv-dialog", event)}>
        Apri dialog
      </bolle-button>
      <bolle-dialog
        id="pv-dialog"
        .variant=${s(state, "variant")}
        ?modal=${b(state, "modal")}
        .closeLabel=${s(state, "closeLabel")}
        .label=${s(state, "label")}
      >
        <p>L'operazione non può essere annullata.</p>
        <bolle-button
          slot="actions"
          variant="text"
          @click=${() => ctx.close("pv-dialog", "elimina")}
          >Elimina</bolle-button
        >
      </bolle-dialog>
    `,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("modal", b(state, "modal")),
        a("closeLabel", s(state, "closeLabel")),
        a("label", s(state, "label")),
      ],
      content:
        "<p>L'operazione non può essere annullata.</p>\n" +
        '<bolle-button slot="actions" variant="text">Elimina</bolle-button>',
    }),
  },
  {
    tag: "bolle-bottom-sheet",
    title: "Bottom sheet",
    group: "Sheets",
    summary: "Foglio ancorato in basso, modale o standard, con maniglia di trascinamento.",
    controls: [
      en("variant", "Variante", ["modal", "standard"], "modal"),
      fl("dragHandle", "Maniglia", true),
      tx("closeLabel", "Etichetta chiusura", "Chiudi"),
      tx("label", "Etichetta accessibile", "Filtri"),
    ],
    render: (state, ctx) => html`
      ${s(state, "variant") === "modal"
        ? html`<bolle-button variant="filled" @click=${(event: Event) => ctx.show("pv-sheet", event)}>
            Apri foglio
          </bolle-button>`
        : nothing}
      <bolle-bottom-sheet
        id="pv-sheet"
        .variant=${s(state, "variant")}
        ?dragHandle=${b(state, "dragHandle")}
        .open=${s(state, "variant") === "standard"}
        .closeLabel=${s(state, "closeLabel")}
        .label=${s(state, "label")}
      >
        <p>Scegli i filtri da applicare.</p>
        <bolle-button slot="actions" @click=${() => ctx.close("pv-sheet", "applica")}>
          Applica
        </bolle-button>
      </bolle-bottom-sheet>
    `,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("dragHandle", b(state, "dragHandle")),
        a("open", s(state, "variant") === "standard"),
        a("closeLabel", s(state, "closeLabel")),
        a("label", s(state, "label")),
      ],
      content:
        "<p>Scegli i filtri da applicare.</p>\n" +
        '<bolle-button slot="actions">Applica</bolle-button>',
    }),
  },
  {
    tag: "bolle-side-sheet",
    title: "Side sheet",
    group: "Sheets",
    summary: "Pannello laterale modale o standard, con variante staccata dal bordo.",
    controls: [
      en("variant", "Variante", ["modal", "standard"], "modal"),
      fl("detached", "Staccato", false),
      tx("closeLabel", "Etichetta chiusura", "Chiudi"),
      tx("label", "Etichetta accessibile", "Dettagli"),
    ],
    render: (state, ctx) => html`
      ${s(state, "variant") === "modal"
        ? html`<bolle-button variant="filled" @click=${(event: Event) => ctx.show("pv-side", event)}>
            Apri pannello
          </bolle-button>`
        : nothing}
      <bolle-side-sheet
        id="pv-side"
        .variant=${s(state, "variant")}
        ?detached=${b(state, "detached")}
        .open=${s(state, "variant") === "standard"}
        .closeLabel=${s(state, "closeLabel")}
        .label=${s(state, "label")}
      >
        <p>Dettagli del documento selezionato.</p>
        <bolle-button slot="actions" @click=${() => ctx.close("pv-side", "salvato")}>
          Salva
        </bolle-button>
      </bolle-side-sheet>
    `,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("detached", b(state, "detached")),
        a("open", s(state, "variant") === "standard"),
        a("closeLabel", s(state, "closeLabel")),
        a("label", s(state, "label")),
      ],
      content:
        "<p>Dettagli del documento selezionato.</p>\n" +
        '<bolle-button slot="actions">Salva</bolle-button>',
    }),
  },
  {
    tag: "bolle-divider",
    title: "Divider",
    group: "Divider",
    summary: "Separatore orizzontale o verticale, con inset e modalità decorativa.",
    controls: [
      en("variant", "Variante", ["full", "inset", "inset-start", "inset-end"], "full"),
      fl("vertical", "Verticale", false),
      fl("inset", "Inset", false),
      fl("decorative", "Decorativo", false),
    ],
    render: (state) => html`<div class="divider-row">
      ${b(state, "vertical") ? html`<span>Prima</span>` : nothing}
      <bolle-divider
        .variant=${s(state, "variant")}
        ?vertical=${b(state, "vertical")}
        ?inset=${b(state, "inset")}
        ?decorative=${b(state, "decorative")}
      ></bolle-divider>
      ${b(state, "vertical") ? html`<span>Dopo</span>` : nothing}
    </div>`,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("vertical", b(state, "vertical")),
        a("inset", b(state, "inset")),
        a("decorative", b(state, "decorative")),
      ],
    }),
  },
  {
    tag: "bolle-app-bar",
    title: "App bar",
    group: "App bars",
    summary: "Barra superiore con sette layout, sottotitolo, slot e stato di scorrimento.",
    controls: [
      en("variant", "Variante", ["small", "center-aligned", "medium", "medium-flexible", "large", "large-flexible", "search"], "small"),
      tx("subtitle", "Sottotitolo", "12 non letti"),
      en("alignment", "Allineamento", ["leading", "center"], "leading"),
      fl("sticky", "Sticky", false),
      fl("scrolled", "Scorso", false),
      fl("collapsed", "Compresso", false),
      tx("label", "Titolo", "Posta"),
    ],
    render: (state) => html`<bolle-app-bar
      .variant=${s(state, "variant")}
      .subtitle=${s(state, "subtitle")}
      .alignment=${s(state, "alignment")}
      ?sticky=${b(state, "sticky")}
      ?scrolled=${b(state, "scrolled")}
      ?collapsed=${b(state, "collapsed")}
      .label=${s(state, "label")}
    >
      ${s(state, "variant") === "search"
        ? nothing
        : html`<span class="preview-app-title">${s(state, "label")}</span>`}
      <bolle-icon-button slot="leading" label="Menu">${ti("menu-2")}</bolle-icon-button>
      ${s(state, "variant") === "search"
        ? html`<bolle-search label="Cerca" placeholder="Cerca nella posta">
            <span slot="leading" aria-hidden="true">${ti("search")}</span>
          </bolle-search>`
        : nothing}
      <bolle-icon-button slot="trailing" label="Cerca">${ti("search")}</bolle-icon-button>
    </bolle-app-bar>`,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("subtitle", s(state, "subtitle")),
        a("alignment", s(state, "alignment")),
        a("sticky", b(state, "sticky")),
        a("scrolled", b(state, "scrolled")),
        a("collapsed", b(state, "collapsed")),
        a("label", s(state, "label")),
      ],
      content:
        '<bolle-icon-button slot="leading" label="Menu">menu</bolle-icon-button>\n' +
        '<bolle-icon-button slot="trailing" label="Cerca">search</bolle-icon-button>',
    }),
  },
  {
    tag: "bolle-toolbar",
    title: "Toolbar",
    group: "Toolbars",
    summary: "Raggruppa azioni correlate con roving tabindex, orizzontale o verticale.",
    controls: [
      en("variant", "Variante", ["docked", "floating"], "docked"),
      en("orientation", "Orientamento", ["horizontal", "vertical"], "horizontal"),
      en("color", "Colore", ["standard", "vibrant"], "standard"),
      tx("label", "Etichetta", "Formato"),
    ],
    render: (state) => html`<bolle-toolbar
      .variant=${s(state, "variant")}
      .orientation=${s(state, "orientation")}
      .color=${s(state, "color")}
      .label=${s(state, "label")}
    >
      <bolle-icon-button label="Grassetto" toggle>${ti("bold")}</bolle-icon-button>
      <bolle-icon-button label="Corsivo" toggle>${ti("italic")}</bolle-icon-button>
      <bolle-icon-button label="Sottolineato" toggle>${ti("underline")}</bolle-icon-button>
    </bolle-toolbar>`,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("orientation", s(state, "orientation")),
        a("color", s(state, "color")),
        a("label", s(state, "label")),
      ],
      content:
        '<bolle-icon-button label="Grassetto" toggle>format_bold</bolle-icon-button>\n' +
        '<bolle-icon-button label="Corsivo" toggle>format_italic</bolle-icon-button>\n' +
        '<bolle-icon-button label="Sottolineato" toggle>format_underline</bolle-icon-button>',
    }),
  },
  {
    tag: "bolle-navigation-bar",
    title: "Navigation bar",
    group: "Navigation bar",
    summary: "Da tre a cinque destinazioni, baseline o flexible, con layout orizzontale.",
    controls: [
      en("variant", "Variante", ["standard", "flexible"], "standard"),
      en("layout", "Layout", ["vertical", "horizontal"], "vertical"),
      tx("label", "Etichetta", "Navigazione principale"),
    ],
    render: (state) => html`<bolle-navigation-bar
      .variant=${s(state, "variant")}
      .layout=${s(state, "layout")}
      .label=${s(state, "label")}
      .items=${navItems()}
      value="inbox"
    ></bolle-navigation-bar>`,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("layout", s(state, "layout")),
        a("label", s(state, "label")),
        { name: "items", raw: "items" },
        a("value", "inbox"),
      ],
      ...snippets(ICON_ITEMS),
    }),
  },
  {
    tag: "bolle-navigation-rail",
    title: "Navigation rail",
    group: "Navigation rail",
    summary: "Rail compresso o espanso per la navigazione laterale.",
    controls: [
      fl("expanded", "Espanso", true),
      en("variant", "Variante", ["standard", "flexible"], "standard"),
      en("layout", "Layout", ["vertical", "horizontal"], "vertical"),
      tx("label", "Etichetta", "Navigazione laterale"),
    ],
    render: (state) => html`<bolle-navigation-rail
      ?expanded=${b(state, "expanded")}
      .variant=${s(state, "variant")}
      .layout=${s(state, "layout")}
      .label=${s(state, "label")}
      .items=${navItems()}
      value="inbox"
    ></bolle-navigation-rail>`,
    code: (state) => ({
      attrs: [
        a("expanded", b(state, "expanded")),
        a("variant", s(state, "variant")),
        a("layout", s(state, "layout")),
        a("label", s(state, "label")),
        { name: "items", raw: "items" },
        a("value", "inbox"),
      ],
      ...snippets(ICON_ITEMS),
    }),
  },
  {
    tag: "bolle-navigation-drawer",
    title: "Navigation drawer",
    group: "Navigation drawer",
    summary: "Drawer di sezioni modale o standard, con contenuto aggiuntivo.",
    controls: [
      en("variant", "Variante", ["modal", "standard"], "modal"),
      fl("detached", "Staccato", false),
      tx("closeLabel", "Etichetta chiusura", "Chiudi"),
      tx("label", "Etichetta", "Sezioni"),
    ],
    render: (state, ctx) => html`
      ${s(state, "variant") === "modal"
        ? html`<bolle-button variant="filled" @click=${(event: Event) => ctx.show("pv-drawer", event)}>
            Apri drawer
          </bolle-button>`
        : nothing}
      <bolle-navigation-drawer
        id="pv-drawer"
        .variant=${s(state, "variant")}
        ?detached=${b(state, "detached")}
        .open=${s(state, "variant") === "standard"}
        .closeLabel=${s(state, "closeLabel")}
        .label=${s(state, "label")}
        .items=${navItems()}
        value="inbox"
      >
        <p>Contenuto aggiuntivo del drawer.</p>
      </bolle-navigation-drawer>
    `,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("detached", b(state, "detached")),
        a("open", s(state, "variant") === "standard"),
        a("closeLabel", s(state, "closeLabel")),
        a("label", s(state, "label")),
        { name: "items", raw: "items" },
        a("value", "inbox"),
      ],
      content: "<p>Contenuto aggiuntivo del drawer.</p>",
      ...snippets(ICON_ITEMS),
    }),
  },
  {
    tag: "bolle-tabs",
    title: "Tabs",
    group: "Tabs",
    summary: "Tab primari o secondari, attivazione automatica o manuale, anche scorrevoli.",
    controls: [
      en("variant", "Variante", ["primary", "secondary"], "primary"),
      en("activation", "Attivazione", ["automatic", "manual"], "automatic"),
      fl("scrollable", "Scorrevoli", false),
      fl("icons", "Icone", true),
      fl("badges", "Badge", true),
      tx("label", "Etichetta", "Categorie"),
    ],
    render: (state) => {
      const items = TAB_CODE.map((item, index) => ({
        id: item.id,
        label: item.label,
        icon: b(state, "icons") ? ti(item.icon) : undefined,
        badge: b(state, "badges") && index === 0 ? item.badge : undefined,
      }));
      return html`<bolle-tabs
        .variant=${s(state, "variant")}
        .activation=${s(state, "activation")}
        ?scrollable=${b(state, "scrollable")}
        .label=${s(state, "label")}
        .items=${items}
        value="inbox"
      >
        <p slot="inbox">Messaggi ricevuti.</p>
        <p slot="archive">Documenti salvati.</p>
        <p slot="settings">Preferenze personali.</p>
      </bolle-tabs>`;
    },
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("activation", s(state, "activation")),
        a("scrollable", b(state, "scrollable")),
        a("label", s(state, "label")),
        { name: "items", raw: "items" },
        a("value", "inbox"),
      ],
      content:
        '<p slot="inbox">Messaggi ricevuti.</p>\n' +
        '<p slot="archive">Documenti salvati.</p>\n' +
        '<p slot="settings">Preferenze personali.</p>',
      ...snippets(
        TAB_CODE.map((item, index) => ({
          id: item.id,
          label: item.label,
          ...(b(state, "icons") ? { icon: item.icon } : {}),
          ...(b(state, "badges") && index === 0 ? { badge: item.badge } : {}),
        })),
      ),
    }),
  },
  {
    tag: "bolle-checkbox",
    title: "Checkbox",
    group: "Checkbox",
    summary: "Selezione binaria con stato indeterminato, errore e testo di supporto.",
    controls: [
      fl("checked", "Selezionata", true),
      fl("indeterminate", "Indeterminata", false),
      fl("required", "Obbligatoria", false),
      fl("disabled", "Disabilitata", false),
      fl("error", "Errore", false),
      tx("label", "Etichetta", "Accetto i termini"),
      tx("supportingText", "Testo di supporto", "Puoi revocare il consenso."),
    ],
    render: (state) => html`<bolle-checkbox
      ?checked=${b(state, "checked")}
      ?indeterminate=${b(state, "indeterminate")}
      ?required=${b(state, "required")}
      ?disabled=${b(state, "disabled")}
      ?error=${b(state, "error")}
      .label=${s(state, "label")}
      .supportingText=${s(state, "supportingText")}
    ></bolle-checkbox>`,
    code: (state) => ({
      attrs: [
        a("checked", b(state, "checked")),
        a("indeterminate", b(state, "indeterminate")),
        a("required", b(state, "required")),
        a("disabled", b(state, "disabled")),
        a("error", b(state, "error")),
        a("label", s(state, "label")),
        a("supportingText", s(state, "supportingText")),
      ],
    }),
  },
  {
    tag: "bolle-switch",
    title: "Switch",
    group: "Switch",
    summary: "Interruttore immediato con icone di stato opzionali.",
    controls: [
      fl("checked", "Attivo", true),
      en("icons", "Icone", ["none", "selected", "both"], "both"),
      fl("required", "Obbligatorio", false),
      fl("disabled", "Disabilitato", false),
      fl("error", "Errore", false),
      tx("label", "Etichetta", "Wi-Fi"),
      tx("supportingText", "Testo di supporto", "Rete senza fili."),
    ],
    render: (state) => html`<bolle-switch
      ?checked=${b(state, "checked")}
      ?required=${b(state, "required")}
      ?disabled=${b(state, "disabled")}
      ?error=${b(state, "error")}
      .label=${s(state, "label")}
      .supportingText=${s(state, "supportingText")}
      .icon=${s(state, "icons") === "both" ? ti("wifi-off") : nothing}
      .iconSelected=${s(state, "icons") === "none" ? nothing : ti("wifi")}
    ></bolle-switch>`,
    code: (state) => ({
      attrs: [
        a("checked", b(state, "checked")),
        a("required", b(state, "required")),
        a("disabled", b(state, "disabled")),
        a("error", b(state, "error")),
        a("label", s(state, "label")),
        a("supportingText", s(state, "supportingText")),
      ],
    }),
  },
  {
    tag: "bolle-radio-button",
    title: "Radio button",
    group: "Radio button",
    summary: "Scelta singola in un gruppo con navigazione da tastiera.",
    controls: [
      fl("checked", "Selezionato", true),
      fl("required", "Obbligatorio", false),
      fl("disabled", "Disabilitato", false),
      tx("label", "Etichetta", "Standard"),
    ],
    render: (state) => html`<div class="radio-group">
      ${["standard", "plus", "enterprise"].map(
        (value, index) => html`<bolle-radio-button
          name="plan"
          value=${value}
          .label=${index === 0 ? s(state, "label") : value}
          ?checked=${index === 0 && b(state, "checked")}
          ?required=${b(state, "required")}
          ?disabled=${b(state, "disabled")}
        ></bolle-radio-button>`,
      )}
    </div>`,
    code: (state) => ({
      attrs: [
        a("name", "plan"),
        a("value", "standard"),
        a("label", s(state, "label")),
        a("checked", b(state, "checked")),
        a("required", b(state, "required")),
        a("disabled", b(state, "disabled")),
      ],
    }),
  },
  {
    tag: "bolle-chip",
    title: "Chip",
    group: "Chips",
    summary: "Assist, filter, input e suggestion, con elevazione, rimozione e avatar.",
    controls: [
      en("variant", "Variante", ["assist", "filter", "input", "suggestion"], "assist"),
      fl("selected", "Selezionata", false),
      fl("elevated", "Elevata", false),
      fl("disabled", "Disabilitata", false),
      fl("removable", "Rimovibile", false),
      tx("label", "Etichetta", "Preferiti"),
      tx("removeLabel", "Etichetta rimozione", "Rimuovi Preferiti"),
    ],
    render: (state) => html`<bolle-chip
      .variant=${s(state, "variant")}
      ?selected=${b(state, "selected")}
      ?elevated=${b(state, "elevated")}
      ?disabled=${b(state, "disabled")}
      ?removable=${b(state, "removable")}
      .label=${s(state, "label")}
      .removeLabel=${s(state, "removeLabel")}
    ></bolle-chip>`,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("selected", b(state, "selected")),
        a("elevated", b(state, "elevated")),
        a("disabled", b(state, "disabled")),
        a("removable", b(state, "removable")),
        a("label", s(state, "label")),
        a("removeLabel", s(state, "removeLabel")),
      ],
    }),
  },
  {
    tag: "bolle-list",
    title: "List",
    group: "Lists",
    summary: "Righe con icone, testo di supporto, link, espansione e selezione singola o multipla.",
    controls: [
      en("variant", "Variante", ["standard", "segmented"], "standard"),
      en("selection", "Selezione", ["none", "single", "multiple"], "single"),
      fl("interactive", "Interattiva", true),
      tx("label", "Etichetta", "Documenti"),
    ],
    render: (state) => html`<bolle-list
      .variant=${s(state, "variant")}
      .selection=${s(state, "selection")}
      ?interactive=${b(state, "interactive")}
      .label=${s(state, "label")}
      .items=${listItems()}
      .value=${s(state, "selection") === "multiple" ? ["inbox"] : "inbox"}
      .expanded=${["folders"]}
    ></bolle-list>`,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("selection", s(state, "selection")),
        a("interactive", b(state, "interactive")),
        a("label", s(state, "label")),
        { name: "items", raw: "items" },
        { name: "value", raw: s(state, "selection") === "multiple" ? "['inbox']" : "'inbox'" },
        { name: "expanded", raw: "['folders']" },
      ],
      ...snippets(LIST_CODE),
    }),
  },
  {
    tag: "bolle-segmented-buttons",
    title: "Segmented buttons",
    group: "Buttons",
    summary: "Da due a cinque segmenti con selezione singola o multipla.",
    controls: [
      fl("multiple", "Selezione multipla", false),
      fl("required", "Obbligatorio", false),
      fl("disabled", "Disabilitato", false),
      rg("count", "Segmenti", 2, 5, 3),
      en("content", "Contenuto", ["label", "icon-label"], "icon-label"),
      tx("label", "Etichetta", "Vista"),
    ],
    render: (state) => {
      const pool = [
        { id: "inbox", label: "Posta", icon: "inbox" },
        { id: "archive", label: "Archivio", icon: "archive" },
        { id: "settings", label: "Impostazioni", icon: "settings" },
        { id: "star", label: "Preferiti", icon: "star" },
        { id: "trash", label: "Cestino", icon: "trash" },
      ];
      const items = pool.slice(0, n(state, "count")).map((item) => ({
        ...item,
        icon: s(state, "content") === "label" ? undefined : ti(item.icon),
      }));
      return html`<bolle-segmented-buttons
        ?multiple=${b(state, "multiple")}
        ?required=${b(state, "required")}
        ?disabled=${b(state, "disabled")}
        .label=${s(state, "label")}
        .items=${items}
        .value=${items[0]?.id}
        .values=${items.slice(0, 2).map((item) => item.id)}
      ></bolle-segmented-buttons>`;
    },
    code: (state) => {
      const pool = [
        { id: "inbox", label: "Posta", icon: "inbox" },
        { id: "archive", label: "Archivio", icon: "archive" },
        { id: "settings", label: "Impostazioni", icon: "settings" },
        { id: "star", label: "Preferiti", icon: "star" },
        { id: "trash", label: "Cestino", icon: "trash" },
      ];
      const items = pool.slice(0, n(state, "count"));
      return {
        attrs: [
          a("multiple", b(state, "multiple")),
          a("required", b(state, "required")),
          a("disabled", b(state, "disabled")),
          a("label", s(state, "label")),
          { name: "items", raw: "items" },
          { name: "value", raw: `'${items[0]?.id}'` },
          ...(b(state, "multiple")
            ? [{ name: "values", raw: `[${items.slice(0, 2).map((item) => `'${item.id}'`).join(", ")}]` }]
            : []),
        ],
        ...snippets(
          items.map((item) =>
            s(state, "content") === "label"
              ? { id: item.id, label: item.label }
              : item,
          ),
        ),
      };
    },
  },
  {
    tag: "bolle-slider",
    title: "Slider",
    group: "Sliders",
    summary: "Bolla-valore, livello liquido, membrana o intervallo a gocce che si fondono.",
    controls: [
      en("variant", "Variante", ["bubble", "liquid", "membrane", "range"], "bubble"),
      rg("min", "Minimo", 0, 100, 0),
      rg("max", "Massimo", 0, 100, 100),
      rg("step", "Passo", 1, 10, 1),
      rg("value", "Valore", 0, 100, 40),
      rg("upperValue", "Valore massimo (range)", 0, 100, 70),
      tx("suffix", "Suffisso", ""),
      fl("disabled", "Disabilitato", false),
      tx("label", "Etichetta", "Volume"),
    ],
    render: (state) => html`<bolle-slider
      .variant=${s(state, "variant")}
      .min=${n(state, "min")}
      .max=${n(state, "max")}
      .step=${n(state, "step")}
      .value=${String(n(state, "value"))}
      .upperValue=${n(state, "upperValue")}
      .suffix=${s(state, "suffix")}
      .icon=${s(state, "variant") === "liquid" ? ti("volume") : undefined}
      ?disabled=${b(state, "disabled")}
      .label=${s(state, "label")}
    ></bolle-slider>`,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("min", n(state, "min")),
        a("max", n(state, "max")),
        a("step", n(state, "step")),
        a("value", String(n(state, "value"))),
        a("upper-value", s(state, "variant") === "range" ? n(state, "upperValue") : undefined),
        a("suffix", s(state, "suffix")),
        a("disabled", b(state, "disabled")),
        a("label", s(state, "label")),
      ],
    }),
  },
  {
    tag: "bolle-steps",
    title: "Steps",
    group: "Sliders",
    summary: "Da tre a sette livelli con nome, disegnati come bolle che crescono.",
    controls: [
      tx("options", "Opzioni", "Leggera,Morbida,Media,Forte,Intensa"),
      rg("value", "Indice", 0, 6, 2),
      fl("disabled", "Disabilitato", false),
      tx("label", "Etichetta", "Intensità"),
    ],
    render: (state) => html`<bolle-steps
      options=${s(state, "options")}
      .value=${String(n(state, "value"))}
      ?disabled=${b(state, "disabled")}
      .label=${s(state, "label")}
    ></bolle-steps>`,
    code: (state) => ({
      attrs: [
        a("options", s(state, "options")),
        a("value", String(n(state, "value"))),
        a("disabled", b(state, "disabled")),
        a("label", s(state, "label")),
      ],
    }),
  },
  {
    tag: "bolle-text-field",
    title: "Text field",
    group: "Text fields",
    summary: "Campo a riga singola o multilinea, con affissi, contatore, errore e slot icona.",
    controls: [
      en("variant", "Variante", ["filled", "outlined"], "filled"),
      en("type", "Tipo", ["text", "email", "password", "number", "search", "date"], "text"),
      fl("multiline", "Multilinea", false),
      rg("rows", "Righe", 2, 8, 3),
      fl("leadingIcon", "Icona iniziale", false),
      fl("trailingIcon", "Icona finale", false),
      tx("prefix", "Prefisso", ""),
      tx("suffix", "Suffisso", ""),
      fl("error", "Errore", false),
      fl("readonly", "Sola lettura", false),
      fl("required", "Obbligatorio", false),
      fl("disabled", "Disabilitato", false),
      fl("counter", "Contatore", false),
      rg("maxlength", "Lunghezza massima", 0, 200, 120),
      tx("label", "Etichetta", "Email"),
      tx("value", "Valore", ""),
      tx("supportingText", "Testo di supporto", "Useremo questo indirizzo per le notifiche."),
    ],
    render: (state) => html`<bolle-text-field
      .variant=${s(state, "variant")}
      .type=${s(state, "type")}
      ?multiline=${b(state, "multiline")}
      .rows=${n(state, "rows")}
      ?error=${b(state, "error")}
      ?readonly=${b(state, "readonly")}
      ?required=${b(state, "required")}
      ?disabled=${b(state, "disabled")}
      ?counter=${b(state, "counter")}
      .maxlength=${n(state, "maxlength")}
      .label=${s(state, "label")}
      .value=${s(state, "value")}
      .prefix=${s(state, "prefix")}
      .suffix=${s(state, "suffix")}
      .supportingText=${s(state, "supportingText")}
      >${b(state, "leadingIcon")
        ? html`<span slot="leading" aria-hidden="true">${ti("inbox")}</span>`
        : nothing}${b(state, "trailingIcon")
        ? html`<span slot="trailing" aria-hidden="true">${ti("help")}</span>`
        : nothing}</bolle-text-field
    >`,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("type", s(state, "type")),
        a("multiline", b(state, "multiline")),
        a("rows", b(state, "multiline") ? n(state, "rows") : undefined),
        a("error", b(state, "error")),
        a("readonly", b(state, "readonly")),
        a("required", b(state, "required")),
        a("disabled", b(state, "disabled")),
        a("counter", b(state, "counter")),
        a("maxlength", n(state, "maxlength")),
        a("label", s(state, "label")),
        a("value", s(state, "value")),
        a("prefix", s(state, "prefix")),
        a("suffix", s(state, "suffix")),
        a("supportingText", s(state, "supportingText")),
      ],
      content:
        (b(state, "leadingIcon")
          ? '<span slot="leading" aria-hidden="true">inbox</span>\n'
          : "") +
        (b(state, "trailingIcon")
          ? '<span slot="trailing" aria-hidden="true">help</span>'
          : "") || undefined,
    }),
  },
  {
    tag: "bolle-search",
    title: "Search",
    group: "Search",
    summary: "Ricerca con suggerimenti filtrabili, combobox ARIA e area risultati.",
    controls: [
      en("appearance", "Aspetto", ["contained", "divided"], "contained"),
      en("layout", "Layout", ["docked", "full-screen"], "docked"),
      fl("filter", "Filtra suggerimenti", true),
      rg("suggestionDelay", "Ritardo suggerimenti (ms)", 0, 1000, 0, 50),
      tx("label", "Etichetta", "Cerca città"),
      tx("placeholder", "Placeholder", "Scrivi una città"),
    ],
    render: (state) => html`<bolle-search
      .appearance=${s(state, "appearance")}
      .layout=${s(state, "layout")}
      ?filter=${b(state, "filter")}
      .suggestionDelay=${n(state, "suggestionDelay")}
      .label=${s(state, "label")}
      .placeholder=${s(state, "placeholder")}
      .suggestions=${SUGGESTIONS}
      suggestions-label="Suggerimenti"
    ></bolle-search>`,
    code: (state) => ({
      attrs: [
        a("appearance", s(state, "appearance")),
        a("layout", s(state, "layout")),
        a("filter", b(state, "filter")),
        a("suggestionDelay", n(state, "suggestionDelay")),
        a("label", s(state, "label")),
        a("placeholder", s(state, "placeholder")),
        { name: "suggestions", raw: "suggestions" },
        a("suggestionsLabel", "Suggerimenti"),
      ],
      ...snippets(SUGGESTIONS, "suggestions"),
    }),
  },
  {
    tag: "bolle-date-picker",
    title: "Date picker",
    group: "Date & time pickers",
    summary: "Data singola o intervallo, con selettore modale o calendario docked.",
    controls: [
      en("variant", "Variante", ["modal", "docked"], "modal"),
      en("selectionMode", "Selezione", ["single", "range"], "single"),
      en("weekStartsOn", "Inizio settimana", ["1", "0"], "1"),
      en("locale", "Lingua", ["it", "en", "fr"], "it"),
      tx("label", "Etichetta", "Data appuntamento"),
      tx("value", "Data iniziale", "2026-11-11"),
      tx("endValue", "Data finale", "2026-11-20"),
      fl("required", "Obbligatorio", false),
      fl("disabled", "Disabilitato", false),
    ],
    render: (state) => html`<bolle-date-picker
      .variant=${s(state, "variant")}
      .selectionMode=${s(state, "selectionMode")}
      .weekStartsOn=${Number(s(state, "weekStartsOn"))}
      .locale=${s(state, "locale")}
      .label=${s(state, "label")}
      .value=${s(state, "value")}
      .endValue=${s(state, "endValue")}
      ?required=${b(state, "required")}
      ?disabled=${b(state, "disabled")}
    ></bolle-date-picker>`,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("selectionMode", s(state, "selectionMode")),
        a("weekStartsOn", Number(s(state, "weekStartsOn"))),
        a("locale", s(state, "locale")),
        a("label", s(state, "label")),
        a("value", s(state, "value")),
        a("endValue", s(state, "selectionMode") === "range" ? s(state, "endValue") : ""),
        a("required", b(state, "required")),
        a("disabled", b(state, "disabled")),
      ],
    }),
  },
  {
    tag: "bolle-time-picker",
    title: "Time picker",
    group: "Date & time pickers",
    summary: "Ora con quadrante o inserimento numerico, ciclo 12 o 24 ore.",
    controls: [
      en("variant", "Variante", ["dial", "input"], "dial"),
      en("hourCycle", "Ciclo orario", ["24", "12"], "24"),
      en("locale", "Lingua", ["it", "en", "fr"], "it"),
      tx("label", "Etichetta", "Ora promemoria"),
      tx("value", "Valore", "09:30"),
      fl("required", "Obbligatorio", false),
      fl("disabled", "Disabilitato", false),
    ],
    render: (state) => html`<bolle-time-picker
      .variant=${s(state, "variant")}
      .hourCycle=${Number(s(state, "hourCycle"))}
      .locale=${s(state, "locale")}
      .label=${s(state, "label")}
      .value=${s(state, "value")}
      ?required=${b(state, "required")}
      ?disabled=${b(state, "disabled")}
    ></bolle-time-picker>`,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("hourCycle", Number(s(state, "hourCycle"))),
        a("locale", s(state, "locale")),
        a("label", s(state, "label")),
        a("value", s(state, "value")),
        a("required", b(state, "required")),
        a("disabled", b(state, "disabled")),
      ],
    }),
  },
  {
    tag: "bolle-menu",
    title: "Menu",
    group: "Menus",
    summary: "Menu baseline o verticale, con gruppi, sottomenu e selezione.",
    note: "Vibrant è disponibile solo con menu verticale. Il menu si apre con show(anchor).",
    controls: [
      en("variant", "Variante", ["vertical", "baseline"], "vertical"),
      en("colorScheme", "Schema colore", ["standard", "vibrant"], "standard"),
      en("selectionMode", "Selezione", ["none", "single", "multi"], "none"),
      fl("quick", "Senza animazione", false),
      rg("density", "Densità", -3, 1, 0),
      fl("inactive", "Inattivo", false),
      tx("menuLabel", "Etichetta accessibile", "Azioni documento"),
    ],
    render: (state, ctx) => html`
      <bolle-button
        variant="tonal"
        haspopup="menu"
        @click=${(event: Event) => ctx.show("pv-menu", event)}
        >Azioni</bolle-button
      >
      <bolle-menu
        id="pv-menu"
        .variant=${s(state, "variant")}
        .colorScheme=${s(state, "variant") === "baseline" ? "standard" : s(state, "colorScheme")}
        .selectionMode=${s(state, "selectionMode")}
        ?quick=${b(state, "quick")}
        .density=${n(state, "density")}
        ?inactive=${b(state, "inactive")}
        .menuLabel=${s(state, "menuLabel")}
        .items=${menuEntries(s(state, "selectionMode"))}
      ></bolle-menu>
    `,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("colorScheme", s(state, "variant") === "baseline" ? "standard" : s(state, "colorScheme")),
        a("selectionMode", s(state, "selectionMode")),
        a("quick", b(state, "quick")),
        a("density", n(state, "density")),
        a("inactive", b(state, "inactive")),
        a("menuLabel", s(state, "menuLabel")),
        { name: "items", raw: "items" },
      ],
      ...snippets(menuEntries(s(state, "selectionMode"))),
    }),
  },
  {
    tag: "bolle-fab-menu",
    title: "FAB menu",
    group: "Buttons",
    summary: "Da due a sei azioni correlate aperte da un FAB.",
    controls: [
      en("color", "Set colore", ["primary", "secondary", "tertiary"], "primary"),
      tx("label", "Etichetta accessibile", "Crea"),
    ],
    render: (state) => html`<bolle-fab-menu
      .color=${s(state, "color")}
      .label=${s(state, "label")}
      .items=${ICON_ITEMS.map((item) => ({ ...item, icon: ti(item.icon) }))}
    >
      <span slot="icon" aria-hidden="true">${ti("plus")}</span>
    </bolle-fab-menu>`,
    code: (state) => ({
      attrs: [
        a("color", s(state, "color")),
        a("label", s(state, "label")),
        { name: "items", raw: "items" },
      ],
      content: '<span slot="icon" aria-hidden="true">add</span>',
      ...snippets(ICON_ITEMS),
    }),
  },
  {
    tag: "bolle-split-button",
    title: "Split button",
    group: "Buttons",
    summary: "Azione principale affiancata da un menu di azioni alternative.",
    controls: [
      en("variant", "Variante", ["filled", "tonal", "outlined", "elevated"], "filled"),
      en("size", "Dimensione", ["xs", "small", "medium", "large", "xl"], "small"),
      fl("icon", "Icona iniziale", false),
      fl("disabled", "Disabilitato", false),
      tx("label", "Etichetta", "Invia"),
      tx("menuLabel", "Etichetta menu", "Altre opzioni"),
    ],
    render: (state) => html`<bolle-split-button
      .variant=${s(state, "variant")}
      .size=${s(state, "size")}
      ?icon=${b(state, "icon")}
      ?disabled=${b(state, "disabled")}
      .label=${s(state, "label")}
      .menuLabel=${s(state, "menuLabel")}
      .items=${SPLIT_ITEMS}
      >${b(state, "icon")
        ? html`<span slot="icon" aria-hidden="true">${ti("plane")}</span>`
        : nothing}</bolle-split-button
    >`,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("size", s(state, "size")),
        a("icon", b(state, "icon")),
        a("disabled", b(state, "disabled")),
        a("label", s(state, "label")),
        a("menuLabel", s(state, "menuLabel")),
        { name: "items", raw: "items" },
      ],
      content: b(state, "icon")
        ? '<span slot="icon" aria-hidden="true">plane</span>'
        : undefined,
      ...snippets(SPLIT_ITEMS),
    }),
  },
  {
    tag: "bolle-select",
    title: "Select",
    group: "HTML controls",
    summary:
      "Scelta singola su option e optgroup native, con menu Material, stato di errore e campo filled o outlined.",
    controls: [
      en("variant", "Variante", ["filled", "outlined"], "filled"),
      fl("error", "Errore", false),
      fl("required", "Obbligatorio", false),
      fl("disabled", "Disabilitato", false),
      tx("label", "Etichetta", "Regione"),
      tx("placeholder", "Segnaposto", "Scegli una regione"),
      tx("value", "Valore", "lazio"),
      tx(
        "supportingText",
        "Testo di supporto",
        "Determina il fuso orario della spedizione.",
      ),
    ],
    render: (state) => html`<bolle-select
      .variant=${s(state, "variant")}
      ?error=${b(state, "error")}
      ?required=${b(state, "required")}
      ?disabled=${b(state, "disabled")}
      .label=${s(state, "label")}
      .placeholder=${s(state, "placeholder")}
      .value=${s(state, "value")}
      .supportingText=${s(state, "supportingText")}
    >
      <optgroup label="Nord">
        <option value="lombardia">Lombardia</option>
        <option value="veneto">Veneto</option>
      </optgroup>
      <optgroup label="Centro">
        <option value="lazio">Lazio</option>
        <option value="toscana">Toscana</option>
      </optgroup>
      <option value="sicilia" disabled>Sicilia (non disponibile)</option>
    </bolle-select>`,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("error", b(state, "error")),
        a("required", b(state, "required")),
        a("disabled", b(state, "disabled")),
        a("label", s(state, "label")),
        a("placeholder", s(state, "placeholder")),
        a("value", s(state, "value")),
        a("supportingText", s(state, "supportingText")),
      ],
      content: `<optgroup label="Nord">
  <option value="lombardia">Lombardia</option>
  <option value="veneto">Veneto</option>
</optgroup>
<optgroup label="Centro">
  <option value="lazio">Lazio</option>
  <option value="toscana">Toscana</option>
</optgroup>
<option value="sicilia" disabled>Sicilia (non disponibile)</option>`,
    }),
  },
  {
    tag: "bolle-autocomplete",
    title: "Autocomplete",
    group: "HTML controls",
    summary:
      "Campo di testo con suggerimenti da option native, filtro durante la digitazione e ruolo combobox.",
    controls: [
      en("variant", "Variante", ["filled", "outlined"], "filled"),
      fl("error", "Errore", false),
      fl("required", "Obbligatorio", false),
      fl("readonly", "Sola lettura", false),
      fl("disabled", "Disabilitato", false),
      tx("label", "Etichetta", "Città di consegna"),
      tx("placeholder", "Segnaposto", "Scrivi una città"),
      tx("value", "Valore", ""),
      tx(
        "supportingText",
        "Testo di supporto",
        "Suggerimenti fra le città servite.",
      ),
    ],
    render: (state) => html`<bolle-autocomplete
      .variant=${s(state, "variant")}
      ?error=${b(state, "error")}
      ?required=${b(state, "required")}
      ?readonly=${b(state, "readonly")}
      ?disabled=${b(state, "disabled")}
      .label=${s(state, "label")}
      .placeholder=${s(state, "placeholder")}
      .value=${s(state, "value")}
      .supportingText=${s(state, "supportingText")}
    >
      ${CITY_OPTIONS.map(
        (city) => html`<option value=${city}></option>`,
      )}
    </bolle-autocomplete>`,
    code: (state) => ({
      attrs: [
        a("variant", s(state, "variant")),
        a("error", b(state, "error")),
        a("required", b(state, "required")),
        a("readonly", b(state, "readonly")),
        a("disabled", b(state, "disabled")),
        a("label", s(state, "label")),
        a("placeholder", s(state, "placeholder")),
        a("value", s(state, "value")),
        a("supportingText", s(state, "supportingText")),
      ],
      content: CITY_OPTIONS.map((city) => `<option value="${city}"></option>`).join(
        "\n",
      ),
    }),
  },
];

export const groups: Group[] = [
  "App bars",
  "Badges",
  "Buttons",
  "Cards",
  "Carousel",
  "Checkbox",
  "Chips",
  "Date & time pickers",
  "Dialogs",
  "Divider",
  "HTML controls",
  "Lists",
  "Loading indicator",
  "Menus",
  "Navigation bar",
  "Navigation drawer",
  "Navigation rail",
  "Progress indicators",
  "Radio button",
  "Search",
  "Sheets",
  "Sliders",
  "Snackbar",
  "Switch",
  "Tabs",
  "Text fields",
  "Toolbars",
  "Tooltips",
];

export const entryByTag = (tag: string) =>
  entries.find((entry) => entry.tag === tag);

export const initialState = (entry: Entry): State =>
  Object.fromEntries(entry.controls.map((control) => [control.prop, control.default]));

export { MENU_GROUPS, menuEntries, SPLIT_ITEMS, SUGGESTIONS, TAB_CODE, tabItems, navItems, listItems, LIST_CODE, ICON_ITEMS, sixItems, snippets };
export type { MenuEntry };

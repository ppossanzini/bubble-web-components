import { html, render, type TemplateResult } from "lit";
import { ti } from "./icons.js";
import type {
  BubbleDialog,
  BubbleItem,
  BubbleMenu,
  BubbleSnackbar,
} from "../src/index.js";

const destinations: BubbleItem[] = [
  {
    id: "inbox",
    label: "Posta",
    icon: ti("inbox"),
    supportingText: "Messaggi ricevuti",
  },
  {
    id: "archive",
    label: "Archivio",
    icon: ti("archive"),
    supportingText: "Documenti salvati",
  },
  { id: "settings", label: "Impostazioni", icon: ti("settings") },
];
const fiveDestinations: BubbleItem[] = [
  ...destinations,
  { id: "trash", label: "Cestino", icon: ti("trash") },
  { id: "help", label: "Aiuto", icon: ti("help") },
];

const specimen = (label: string, ...content: unknown[]): TemplateResult =>
  html`<div class="variant">
    <span class="variant-label">${label}</span>
    <div class="variant-body">${content}</div>
  </div>`;

const component = (
  id: string,
  title: string,
  note: string,
  ...variants: TemplateResult[]
): TemplateResult =>
  html`<article class="component" id=${`c-${id}`}>
    <h3>${title}</h3>
    <p class="note">${note}</p>
    <div class="variants">${variants}</div>
  </article>`;

const group = (
  id: string,
  title: string,
  description: string,
  ...components: TemplateResult[]
): TemplateResult =>
  html`<section class="component-group" id=${id}>
    <div class="group-header">
      <h2>${title}</h2>
      <p>${description}</p>
    </div>
    ${components}
  </section>`;

const dialog = (id: string, event: Event) =>
  document
    .querySelector<BubbleDialog>(`#${id}`)
    ?.show(event.currentTarget as HTMLElement);

const snackbar = () =>
  document.querySelector<BubbleSnackbar>("#demo-snackbar")?.show();

const menu = (id: string, event: Event) =>
  document
    .querySelector<BubbleMenu>(`#${id}`)
    ?.show(event.currentTarget as HTMLElement);

const cards = (variant: string) =>
  html`<bubble-card>
    <h4>Documento</h4>
    <p>Contenuto indipendente con un'azione interna.</p>
    <bubble-button variant="text">Apri</bubble-button>
  </bubble-card>`;

const carouselItem = (label: string, text: string) =>
  html`<bubble-card>
    <h4>${label}</h4>
    <p>${text}</p>
  </bubble-card>`;

const container = document.getElementById("components")!;

render(
  html`
    ${group(
      "azioni",
      "Azioni",
      "Gerarchia dell'azione espressa dal tipo di pulsante, non dal colore applicato a mano.",
      component(
        "buttons",
        "Buttons",
        "Cinque stili di colore, cinque dimensioni Expressive, forma rotonda o quadrata, toggle e stato disabilitato.",
        specimen(
          "Elevated · Filled · Tonal · Outlined · Text",
          html`<div class="inline">
            ${["elevated", "filled", "tonal", "outlined", "text"].map(
              (variant) =>
                html`<bubble-button variant=${variant} @click=${snackbar}
                  >${variant}</bubble-button
                >`,
            )}
          </div>`,
        ),
        specimen(
          "Toggle non selezionato / selezionato",
          html`<bubble-button toggle>Salva</bubble-button>
            <bubble-button toggle selected>Salvato</bubble-button>`,
        ),
        specimen(
          "Disabilitato",
          html`<bubble-button variant="filled" disabled>Filled</bubble-button>
            <bubble-button variant="tonal" disabled>Tonal</bubble-button>
            <bubble-button variant="outlined" disabled
              >Outlined</bubble-button
            >`,
        ),
        specimen(
          "Dimensioni XS · S · M · L · XL",
          html`<div class="inline">
            ${["xs", "small", "medium", "large", "xl"].map(
              (size) =>
                html`<bubble-button size=${size}>${size}</bubble-button>`,
            )}
          </div>`,
        ),
        specimen(
          "Forma quadrata",
          html`<bubble-button shape="square">Quadrato</bubble-button>
            <bubble-button shape="square" variant="outlined"
              >Outline</bubble-button
            >`,
        ),
        specimen(
          "Con icona e collegamento",
          html`<bubble-button
              ><span slot="icon" class="md-icon" aria-hidden="true">add</span
              >Crea</bubble-button
            ><bubble-button
              variant="text"
              href="https://m3.material.io/components/buttons"
              >Linee guida</bubble-button
            >`,
        ),
      ),
      component(
        "icon-buttons",
        "Icon buttons",
        "Stili standard, filled, tonal e outlined; toggle, dimensioni, forma e larghezza.",
        specimen(
          "Standard · Filled · Tonal · Outlined",
          html`<div class="inline">
            ${["standard", "filled", "tonal", "outlined"].map(
              (variant) =>
                html`<bubble-icon-button
                  variant=${variant}
                  label=${variant}
                  @click=${snackbar}
                  >${ti("star")}</bubble-icon-button
                >`,
            )}
          </div>`,
        ),
        specimen(
          "Toggle off / on",
          html`<bubble-icon-button label="Preferito" toggle
              >${ti("star")}</bubble-icon-button
            >
            <bubble-icon-button label="Preferito attivo" toggle selected
              >${ti("star")}</bubble-icon-button
            >`,
        ),
        specimen(
          "Dimensioni e forma",
          html`<bubble-icon-button size="xs" label="XS"
              >${ti("star")}</bubble-icon-button
            >
            <bubble-icon-button size="small" label="S"
              >${ti("star")}</bubble-icon-button
            >
            <bubble-icon-button size="medium" label="M"
              >${ti("star")}</bubble-icon-button
            >
            <bubble-icon-button size="large" label="L"
              >${ti("star")}</bubble-icon-button
            >
            <bubble-icon-button size="xl" label="XL"
              >${ti("star")}</bubble-icon-button
            >
            <bubble-icon-button shape="square" label="Quadrato"
              >${ti("star")}</bubble-icon-button
            >`,
        ),
        specimen(
          "Larghezza narrow · default · wide",
          html`<bubble-icon-button
              variant="filled"
              width="narrow"
              label="Stretta"
              >${ti("star")}</bubble-icon-button
            ><bubble-icon-button variant="filled" label="Normale"
              >${ti("star")}</bubble-icon-button
            ><bubble-icon-button variant="filled" width="wide" label="Larga"
              >${ti("star")}</bubble-icon-button
            >`,
        ),
      ),
      component(
        "button-groups",
        "Button groups",
        "Gruppo standard e connesso; selezione singola o multipla con toggle.",
        specimen(
          "Standard",
          html`<bubble-button-group label="Azioni documento"
            ><bubble-button>Salva</bubble-button
            ><bubble-button variant="tonal">Copia</bubble-button
            ><bubble-button variant="outlined"
              >Condividi</bubble-button
            ></bubble-button-group
          >`,
        ),
        specimen(
          "Connected",
          html`<bubble-button-group variant="connected" label="Allineamento"
            ><bubble-button variant="outlined">Sinistra</bubble-button
            ><bubble-button variant="outlined">Centro</bubble-button
            ><bubble-button variant="outlined"
              >Destra</bubble-button
            ></bubble-button-group
          >`,
        ),
        specimen(
          "Selezione singola · multipla",
          html`<bubble-button-group label="Vista" selection="single" required
              ><bubble-button value="grid" selected>Griglia</bubble-button
              ><bubble-button value="list"
                >Elenco</bubble-button
              ></bubble-button-group
            ><bubble-button-group label="Filtri" selection="multiple"
              ><bubble-button value="mine" toggle>Miei</bubble-button
              ><bubble-button value="shared" toggle
                >Condivisi</bubble-button
              ></bubble-button-group
            >`,
        ),
        specimen(
          "Dimensioni del gruppo",
          html`<bubble-button-group label="Compatte" size="xs"
              ><bubble-button>A</bubble-button
              ><bubble-button>B</bubble-button></bubble-button-group
            ><bubble-button-group label="Grandi" size="large"
              ><bubble-button>A</bubble-button
              ><bubble-button>B</bubble-button></bubble-button-group
            >`,
        ),
      ),
      component(
        "split-button",
        "Split button",
        "Azione principale e menu di azioni alternative; quattro stili di colore.",
        specimen(
          "Filled · Tonal · Outlined · Elevated",
          html`${["filled", "tonal", "outlined", "elevated"].map(
            (variant) =>
              html`<bubble-split-button
                variant=${variant}
                label="Invia"
                menu-label=${`Altre opzioni ${variant}`}
                .items=${[
                  { id: "later", label: "Invia più tardi" },
                  { id: "draft", label: "Salva bozza" },
                ]}
                @action=${snackbar}
              ></bubble-split-button>`,
          )}`,
        ),
        specimen(
          "Taglie xs · small · medium · large · xl",
          html`${["xs", "small", "medium", "large", "xl"].map(
            (size) =>
              html`<bubble-split-button
                size=${size}
                label=${size}
                menu-label=${`Altre opzioni ${size}`}
                .items=${[{ id: "later", label: "Invia più tardi" }]}
              ></bubble-split-button>`,
          )}`,
        ),
        specimen(
          "Disabilitato",
          html`<bubble-split-button
            label="Invia"
            menu-label="Altre opzioni"
            disabled
            .items=${[{ id: "later", label: "Invia più tardi" }]}
          ></bubble-split-button>`,
        ),
      ),
      component(
        "floating-action-button",
        "FAB",
        "Taglie small, medium e large; sei mappature di colore.",
        specimen(
          "Small · Medium · Large",
          html`<bubble-floating-action-button size="small" label="Crea"
              >+</bubble-floating-action-button
            >
            <bubble-floating-action-button label="Crea"
              >+</bubble-floating-action-button
            >
            <bubble-floating-action-button size="large" label="Crea"
              >+</bubble-floating-action-button
            >`,
        ),
        specimen(
          "Colori",
          html`${[
            "primary-container",
            "secondary-container",
            "tertiary-container",
            "primary",
            "secondary",
            "tertiary",
          ].map(
            (color) =>
              html`<bubble-floating-action-button color=${color} label=${color}
                >+</bubble-floating-action-button
              >`,
          )}`,
        ),
      ),
      component(
        "extended-fab",
        "Extended FAB",
        "Taglie small, medium e large con icona iniziale e etichetta.",
        specimen(
          "Small · Medium · Large",
          html`<bubble-extended-fab size="small"
              ><span slot="icon" aria-hidden="true">+</span
              >Crea</bubble-extended-fab
            ><bubble-extended-fab size="medium"
              ><span slot="icon" aria-hidden="true">+</span
              >Crea</bubble-extended-fab
            ><bubble-extended-fab size="large"
              ><span slot="icon" aria-hidden="true">+</span
              >Crea</bubble-extended-fab
            >`,
        ),
        specimen(
          "Solo etichetta · colori",
          html`<bubble-extended-fab color="secondary-container"
              >Condividi</bubble-extended-fab
            ><bubble-extended-fab color="tertiary" size="small"
              >Condividi</bubble-extended-fab
            >`,
        ),
      ),
      component(
        "fab-menu",
        "FAB menu",
        "Da due a sei azioni correlate sotto un'azione principale.",
        specimen(
          "Aperto da FAB",
          html`<bubble-fab-menu
            label="Crea"
            .items=${destinations}
          ></bubble-fab-menu>`,
        ),
      ),
    )}
    ${group(
      "comunicazione",
      "Comunicazione",
      "Indicatori e messaggi che riportano stato o avanzamento.",
      component(
        "badges",
        "Badges",
        "Badge piccolo senza testo e badge grande con etichetta fino a quattro caratteri.",
        specimen(
          "Grande · massimo · piccolo",
          html`<span class="badge-anchor"
              >Posta<bubble-badge
                value="12"
                label="12 messaggi non letti"
              ></bubble-badge
            ></span>
            <span class="badge-anchor"
              >Avvisi<bubble-badge
                value="1200"
                max="999"
                label="Oltre 999 avvisi"
              ></bubble-badge
            ></span>
            <span class="badge-anchor"
              >Aggiornamenti<bubble-badge
                small
                label="Nuovi contenuti"
              ></bubble-badge
            ></span>`,
        ),
      ),
      component(
        "progress-indicators",
        "Progress indicators",
        "Lineare e circolare, determinato e indeterminato, con indicatore di arresto e forma ondulata.",
        specimen(
          "Lineare determinato · indeterminato",
          html`<bubble-progress-indicator
              value="65"
              label="Download"
            ></bubble-progress-indicator>
            <bubble-progress-indicator
              indeterminate
              label="Connessione"
            ></bubble-progress-indicator>`,
        ),
        specimen(
          "Determinato con stop · wavy",
          html`<bubble-progress-indicator
              value="35"
              label="Avanzamento con stop"
            ></bubble-progress-indicator>
            <bubble-progress-indicator
              wavy
              value="60"
              label="Avanzamento ondulato"
            ></bubble-progress-indicator>
            <bubble-progress-indicator
              wavy
              indeterminate
              label="Attesa ondulata"
            ></bubble-progress-indicator>`,
        ),
        specimen(
          "Circolare determinato · indeterminato",
          html`<bubble-progress-indicator
              variant="circular"
              value="65"
              label="Caricamento file"
            ></bubble-progress-indicator>
            <bubble-progress-indicator
              variant="circular"
              indeterminate
              label="Attesa"
            ></bubble-progress-indicator>`,
        ),
      ),
      component(
        "loading-indicator",
        "Loading indicator",
        "Indicatore Morph Expressive; configurazione libera e contenuta.",
        specimen(
          "Default · contenuto",
          html`<bubble-loading-indicator
              label="Caricamento"
            ></bubble-loading-indicator>
            <bubble-loading-indicator
              variant="contained"
              label="Caricamento allegati"
            ></bubble-loading-indicator>`,
        ),
      ),
      component(
        "snackbar",
        "Snackbar",
        "Una o due righe; con azione resta finché non viene chiusa.",
        specimen(
          "Riga singola · con azione · due righe",
          html`<bubble-button
              @click=${() =>
                document
                  .querySelector<BubbleSnackbar>("#demo-snackbar")
                  ?.show("Documento salvato")}
              >Mostra</bubble-button
            ><bubble-button
              @click=${() =>
                document
                  .querySelector<BubbleSnackbar>("#demo-snackbar")
                  ?.show("Documento spostato nel cestino")}
              >Spostato</bubble-button
            >`,
        ),
        specimen(
          "Con azione (annulla)",
          html`<bubble-snackbar
            id="demo-snackbar"
            action-label="Annulla"
            close-label="Chiudi"
            message="Documento eliminato"
          ></bubble-snackbar>`,
        ),
        specimen(
          "Coda di messaggi",
          html`<bubble-button
            variant="tonal"
            @click=${() => {
              const bar =
                document.querySelector<BubbleSnackbar>("#demo-snackbar")!;
              bar.show("Primo messaggio");
              bar.show("Secondo messaggio");
              bar.show("Terzo messaggio");
            }}
            >Accoda tre messaggi</bubble-button
          >`,
        ),
      ),
    )}
    ${group(
      "contenimento",
      "Contenimento",
      "Superfici che raccolgono contenuto e azioni.",
      component(
        "cards",
        "Cards",
        "Tre varianti di contenitore e orientamento verticale o orizzontale.",
        specimen(
          "Filled · Outlined · Elevated",
          html`<div class="card-row">
            ${["filled", "outlined", "elevated"].map(
              (variant) =>
                html`<bubble-card variant=${variant}>
                  <h4>${variant}</h4>
                  <p>Un contenuto indipendente.</p>
                </bubble-card>`,
            )}
          </div>`,
        ),
        specimen(
          "Orizzontale",
          html`<bubble-card orientation="horizontal">
            <div slot="media" class="card-media">IMG</div>
            <div>
              <h4>Documento condiviso</h4>
              <p>Media a sinistra, contenuto a destra.</p>
            </div>
          </bubble-card>`,
        ),
      ),
      component(
        "carousel",
        "Carousel",
        "Layout hero, multi-browse, uncontained e center-aligned hero. Il layout full-screen è disponibile nel componente ma non è mostrato in pagina.",
        specimen(
          "Hero · multi-browse · uncontained · center-aligned hero",
          html`${[
            "hero",
            "multi-browse",
            "uncontained",
            "center-aligned-hero",
          ].map(
            (variant) =>
              html`<bubble-carousel
                variant=${variant}
                label=${`Carousel ${variant}`}
                previous-label="Precedente"
                next-label="Successivo"
                >${carouselItem("Posta", "Messaggi ricevuti")}${carouselItem(
                  "Archivio",
                  "Documenti salvati",
                )}${carouselItem("Impostazioni", "Preferenze personali")}</bubble-carousel
              >`,
          )}`,
        ),
      ),
      component(
        "dialogs",
        "Dialogs",
        "Dialogo base e dialogo a schermo intero.",
        specimen(
          "Basic · full-screen",
          html`<bubble-button
              @click=${(event: Event) => dialog("demo-dialog", event)}
              >Dialogo base</bubble-button
            ><bubble-button
              variant="tonal"
              @click=${(event: Event) => dialog("demo-dialog-full", event)}
              >Dialogo a schermo intero</bubble-button
            >`,
        ),
        html`<bubble-dialog
            id="demo-dialog"
            label="Nuovo documento"
            close-label="Annulla"
          >
            <bubble-text-field label="Titolo" required></bubble-text-field>
          </bubble-dialog>
          <bubble-dialog
            id="demo-dialog-full"
            variant="full-screen"
            label="Nuovo documento"
            close-label="Chiudi"
          >
            <bubble-text-field label="Titolo" required></bubble-text-field>
            <bubble-text-field
              label="Descrizione"
              multiline
            ></bubble-text-field>
          </bubble-dialog> `,
      ),
      component(
        "bottom-sheets",
        "Bottom sheets",
        "Foglio modale con maniglia di trascinamento e foglio standard.",
        specimen(
          "Modale · standard",
          html`<bubble-button
              @click=${(event: Event) => dialog("demo-bottom-modal", event)}
              >Modale</bubble-button
            ><bubble-button
              variant="outlined"
              @click=${(event: Event) => dialog("demo-bottom-standard", event)}
              >Standard</bubble-button
            ><bubble-bottom-sheet
              id="demo-bottom-modal"
              drag-handle
              label="Azioni documento"
              close-label="Chiudi"
              ><bubble-list .items=${destinations}></bubble-list
            ></bubble-bottom-sheet>
            <bubble-bottom-sheet
              id="demo-bottom-standard"
              variant="standard"
              label="Azioni documento"
              ><bubble-list .items=${destinations}></bubble-list
            ></bubble-bottom-sheet>`,
        ),
      ),
      component(
        "side-sheets",
        "Side sheets",
        "Foglio modale, standard e staccato dal bordo.",
        specimen(
          "Modale · standard · detached",
          html`<bubble-button
              @click=${(event: Event) => dialog("demo-side-modal", event)}
              >Modale</bubble-button
            ><bubble-button
              variant="outlined"
              @click=${(event: Event) => dialog("demo-side-standard", event)}
              >Standard</bubble-button
            ><bubble-button
              variant="tonal"
              @click=${(event: Event) => dialog("demo-side-detached", event)}
              >Detached</bubble-button
            ><bubble-side-sheet
              id="demo-side-modal"
              label="Dettagli"
              close-label="Chiudi"
              ><p>Informazioni sul documento.</p></bubble-side-sheet
            ><bubble-side-sheet
              id="demo-side-standard"
              variant="standard"
              label="Dettagli"
              ><p>Foglio standard.</p></bubble-side-sheet
            ><bubble-side-sheet
              id="demo-side-detached"
              detached
              label="Dettagli"
              close-label="Chiudi"
              ><p>Foglio staccato dal bordo.</p></bubble-side-sheet
            >`,
        ),
      ),
      component(
        "divider",
        "Divider",
        "Larghezza completa, inset su entrambi i lati, solo iniziale, solo finale e verticale.",
        specimen(
          "Full width",
          html`<div class="divider-demo">
            <p>Sopra</p>
            <bubble-divider></bubble-divider>
            <p>Sotto</p>
          </div>`,
        ),
        specimen(
          "Inset su entrambi i lati",
          html`<div class="divider-demo">
            <p>Sopra</p>
            <bubble-divider variant="inset"></bubble-divider>
            <p>Sotto</p>
          </div>`,
        ),
        specimen(
          "Inset solo iniziale",
          html`<div class="divider-demo">
            <p>Sopra</p>
            <bubble-divider variant="inset-start"></bubble-divider>
            <p>Sotto</p>
          </div>`,
        ),
        specimen(
          "Inset solo finale",
          html`<div class="divider-demo">
            <p>Sopra</p>
            <bubble-divider variant="inset-end"></bubble-divider>
            <p>Sotto</p>
          </div>`,
        ),
        specimen(
          "Verticale",
          html`<div class="divider-horizontal">
            <span>Testo</span><bubble-divider vertical></bubble-divider
            ><span>Media</span>
          </div>`,
        ),
      ),
    )}
    ${group(
      "navigazione",
      "Navigazione",
      "Barre, rail, drawer, tab e toolbar.",
      component(
        "app-bars",
        "App bars",
        "Small, center-aligned, medium, medium flexible, large, large flexible e search.",
        specimen(
          "Small · center-aligned",
          html`<bubble-app-bar label="Posta"
              ><bubble-icon-button slot="leading" label="Menu"
                >${ti("menu-2")}</bubble-icon-button
              ></bubble-app-bar
            ><bubble-app-bar variant="center-aligned" label="Posta"
              ><bubble-icon-button slot="leading" label="Menu"
                >${ti("menu-2")}</bubble-icon-button
              ></bubble-app-bar
            >`,
        ),
        specimen(
          "Medium · medium flexible · large · large flexible",
          html`<bubble-app-bar variant="medium" label="Posta"></bubble-app-bar>
            <bubble-app-bar
              variant="medium-flexible"
              label="Posta"
              subtitle="12 non letti"
            ></bubble-app-bar>
            <bubble-app-bar variant="large" label="Posta"></bubble-app-bar>
            <bubble-app-bar
              variant="large-flexible"
              label="Posta"
              subtitle="12 non letti"
            ></bubble-app-bar>`,
        ),
        specimen(
          "Search",
          html`<bubble-app-bar variant="search">
            <bubble-search label="Cerca" placeholder="Cerca nella posta"
              ><span slot="leading" class="md-icon" aria-hidden="true"
                >search</span
              ></bubble-search
            >
          </bubble-app-bar>`,
        ),
      ),
      component(
        "navigation-bar",
        "Navigation bar",
        "Da tre a cinque destinazioni; variante baseline e flexible con layout orizzontale.",
        specimen(
          "Baseline 3 · 5 destinazioni",
          html`<bubble-navigation-bar
              label="Navigazione principale"
              .items=${destinations}
              value="inbox"
            ></bubble-navigation-bar>
            <bubble-navigation-bar
              label="Navigazione cinque"
              .items=${fiveDestinations}
              value="inbox"
            ></bubble-navigation-bar>`,
        ),
        specimen(
          "Flexible · layout orizzontale",
          html`<bubble-navigation-bar
            variant="flexible"
            layout="horizontal"
            label="Navigazione flessibile"
            .items=${destinations}
            value="archive"
          ></bubble-navigation-bar>`,
        ),
        specimen(
          "Destinazioni non supportate",
          html`<p class="note">
            Due destinazioni richiedono tab; sei o più richiedono tab o un rail
            espanso modale.
          </p>`,
        ),
      ),
      component(
        "navigation-rail",
        "Navigation rail",
        "Rail compresso ed espanso.",
        specimen(
          "Collapsed · expanded",
          html`<div class="inline align-start">
            <bubble-navigation-rail
              label="Rail compresso"
              .items=${destinations}
              value="inbox"
            ></bubble-navigation-rail>
            <bubble-navigation-rail
              expanded
              label="Rail espanso"
              .items=${destinations}
              value="inbox"
            ></bubble-navigation-rail>
          </div>`,
        ),
      ),
      component(
        "navigation-drawer",
        "Navigation drawer",
        "Drawer modale e standard, con etichette di sezione opzionali.",
        specimen(
          "Modale · standard",
          html`<bubble-button
              @click=${(event: Event) => dialog("demo-drawer", event)}
              >Apri drawer</bubble-button
            ><bubble-navigation-drawer
              id="demo-drawer"
              label="Sezioni"
              close-label="Chiudi"
              .items=${destinations}
              value="inbox"
            ></bubble-navigation-drawer>
            <bubble-button
              variant="outlined"
              @click=${(event: Event) => dialog("demo-drawer-standard", event)}
              >Apri drawer standard</bubble-button
            >
            <bubble-navigation-drawer
              id="demo-drawer-standard"
              variant="standard"
              label="Sezioni standard"
              .items=${destinations}
              value="archive"
            ></bubble-navigation-drawer>`,
        ),
      ),
      component(
        "tabs",
        "Tabs",
        "Tab primari e secondari, con icona e badge; attivazione automatica o manuale.",
        specimen(
          "Primary · secondary",
          html`<bubble-tabs
              label="Categorie"
              .items=${destinations}
              value="inbox"
              ><p slot="inbox">Messaggi ricevuti.</p>
              <p slot="archive">Documenti salvati.</p>
              <p slot="settings">Preferenze personali.</p></bubble-tabs
            ><bubble-tabs
              variant="secondary"
              label="Dettagli"
              .items=${destinations}
              value="settings"
              ><p slot="settings">Scheda secondaria.</p></bubble-tabs
            >`,
        ),
        specimen(
          "Con icona e badge",
          html`<bubble-tabs
            label="Viste"
            .items=${[
              { id: "a", label: "Posta", icon: ti("inbox"), badge: "3" },
              { id: "b", label: "Archivio", icon: ti("archive") },
              { id: "c", label: "Preferenze", icon: ti("settings") },
              { id: "d", label: "Cestino", icon: ti("trash") },
            ]}
            value="a"
          ></bubble-tabs>`,
        ),
        specimen(
          "Scrollable con pulsanti di scorrimento",
          html`<bubble-tabs
            scrollable
            label="Viste scorrevoli"
            .items=${[
              "Posta in arrivo",
              "Inviati",
              "Bozze",
              "Archivio",
              "Spam",
              "Cestino",
              "Etichette",
              "Promemoria",
            ].map((label, index) => ({ id: `s${index}`, label }))}
            value="s0"
          ></bubble-tabs>`,
        ),
      ),
      component(
        "toolbars",
        "Toolbars",
        "Docked standard e vibrant, floating orizzontale e verticale.",
        specimen(
          "Docked standard · vibrant",
          html`<bubble-toolbar label="Formato"
              ><bubble-icon-button label="Grassetto" toggle
                >${ti("bold")}</bubble-icon-button
              ><bubble-icon-button label="Corsivo" toggle
                >${ti("italic")}</bubble-icon-button
              ><bubble-icon-button label="Sottolineato" toggle
                ><span class="md-icon"
                  >format_underlined</span
                ></bubble-icon-button
              ></bubble-toolbar
            ><bubble-toolbar label="Modifica" color="vibrant"
              ><bubble-icon-button label="Taglia" variant="standard"
                >${ti("scissors")}</bubble-icon-button
              ><bubble-icon-button label="Copia" variant="standard"
                >${ti("copy")}</bubble-icon-button
              ><bubble-icon-button label="Incolla" variant="standard"
                >${ti("clipboard")}</bubble-icon-button
              ></bubble-toolbar
            >`,
        ),
        specimen(
          "Floating orizzontale · verticale",
          html`<div class="inline align-start">
            <bubble-toolbar label="Formato" variant="floating"
              ><bubble-icon-button label="Grassetto" toggle
                >${ti("bold")}</bubble-icon-button
              ><bubble-icon-button label="Corsivo" toggle
                >${ti("italic")}</bubble-icon-button
              ></bubble-toolbar
            ><bubble-toolbar
              label="Allineamento"
              variant="floating"
              orientation="vertical"
              ><bubble-icon-button label="Su"
                >${ti("arrow-up")}</bubble-icon-button
              ><bubble-icon-button label="Giù"
                >${ti("arrow-down")}</bubble-icon-button
              ></bubble-toolbar
            >
          </div>`,
        ),
      ),
    )}
    ${group(
      "selezione",
      "Selezione",
      "Controlli che registrano una scelta.",
      component(
        "checkbox",
        "Checkbox",
        "Non selezionata, selezionata, indeterminata, disabilitata ed errore con testo di supporto.",
        specimen(
          "Stati",
          html`<bubble-checkbox label="Non selezionata"></bubble-checkbox>
            <bubble-checkbox label="Selezionata" checked></bubble-checkbox>
            <bubble-checkbox
              label="Indeterminata"
              indeterminate
            ></bubble-checkbox>
            <bubble-checkbox label="Disabilitata" disabled></bubble-checkbox>
            <bubble-checkbox
              label="Accetto i termini"
              required
              error
              supporting-text="Devi accettare per continuare"
            ></bubble-checkbox>`,
        ),
      ),
      component(
        "radio-button",
        "Radio button",
        "Un solo elemento selezionato per gruppo; stato iniziale selezionato o vuoto.",
        specimen(
          "Gruppo",
          html`<fieldset class="plain-fieldset">
            <legend>Frequenza</legend>
            <bubble-radio-button
              name="freq"
              value="daily"
              label="Giornaliera"
              checked
            ></bubble-radio-button>
            <bubble-radio-button
              name="freq"
              value="weekly"
              label="Settimanale"
            ></bubble-radio-button>
            <bubble-radio-button
              name="freq"
              value="never"
              label="Mai"
              disabled
            ></bubble-radio-button>
          </fieldset>`,
        ),
      ),
      component(
        "switch",
        "Switch",
        "Spento e acceso, con icona dentro la maniglia, disabilitato ed errore.",
        specimen(
          "Off · on · disabilitato",
          html`<bubble-switch label="Notifiche"></bubble-switch>
            <bubble-switch label="Sincronizzazione" checked></bubble-switch>
            <bubble-switch label="Bloccato" disabled checked></bubble-switch>`,
        ),
        specimen(
          "Con icona · errore",
          html`<bubble-switch
              label="Wi-Fi"
              .icon=${ti("wifi-off")}
              .iconSelected=${ti("wifi")}
            ></bubble-switch>
            <bubble-switch
              label="Modalità aereo"
              checked
              .icon=${ti("plane-off")}
              .iconSelected=${ti("plane")}
            ></bubble-switch>
            <bubble-switch
              label="Accetto le condizioni"
              error
              supporting-text="Devi attivare il consenso"
            ></bubble-switch>`,
        ),
      ),
      component(
        "chips",
        "Chips",
        "Assist, filter, input e suggestion; stile flat ed elevated.",
        specimen(
          "Assist · filter non selezionata / selezionata",
          html`<bubble-chip
              variant="assist"
              label="Aggiungi al calendario"
            ></bubble-chip>
            <bubble-chip variant="filter" label="Solo non letti"></bubble-chip>
            <bubble-chip
              variant="filter"
              label="Preferiti"
              selected
            ></bubble-chip>`,
        ),
        specimen(
          "Input rimovibile con avatar · suggestion · elevated",
          html`<bubble-chip
              variant="input"
              label="Mario Rossi"
              removable
              remove-label="Rimuovi Mario Rossi"
              ><span slot="avatar" class="avatar">MR</span></bubble-chip
            ><bubble-chip variant="suggestion" label="Grazie!"></bubble-chip>
            <bubble-chip
              variant="filter"
              label="Elevata"
              elevated
            ></bubble-chip>`,
        ),
      ),
      component(
        "segmented-buttons",
        "Segmented buttons",
        "Selezione singola e multipla, da due a cinque segmenti, con icona.",
        specimen(
          "Single-select · multi-select",
          html`<bubble-segmented-buttons
              label="Vista"
              name="view"
              value="inbox"
              .items=${destinations}
            ></bubble-segmented-buttons>
            <bubble-segmented-buttons
              label="Filtri"
              name="filters"
              multiple
              .values=${["inbox", "archive"]}
              .items=${destinations}
            ></bubble-segmented-buttons>`,
        ),
        specimen(
          "Limiti",
          html`<p class="note">
            Due-cinque segmenti; oltre cinque usare le chip. Non mescolare
            segmenti con sola icona e con solo testo.
          </p>`,
        ),
      ),
      component(
        "sliders",
        "Sliders",
        "Continuo, centrato, intervallo, discreto, dimensioni, verticale e valore visibile.",
        specimen(
          "Continuous · centered · range",
          html`<bubble-slider label="Volume" value="40"></bubble-slider>
            <bubble-slider
              label="Bilanciamento"
              variant="centered"
              value="60"
              show-value
            ></bubble-slider>
            <bubble-slider
              label="Prezzo"
              variant="range"
              value="20"
              upper-value="80"
              upper-label="Massimo"
            ></bubble-slider>`,
        ),
        specimen(
          "Icone inserite nel binario",
          html`<bubble-slider
            label="Luminosità"
            value="40"
            show-value
            .iconStart=${ti("sun")}
            .iconEnd=${ti("sun-high")}
          ></bubble-slider>`,
        ),
        specimen(
          "Discreto · dimensioni · verticale",
          html`<bubble-slider
              label="Passo 10 con indicatori"
              step="10"
              value="40"
              show-value
              stops
            ></bubble-slider>
            <bubble-slider
              label="Small"
              size="small"
              value="30"
            ></bubble-slider>
            <bubble-slider
              label="Large"
              size="large"
              value="70"
            ></bubble-slider>
            <bubble-slider
              label="Verticale"
              orientation="vertical"
              value="50"
            ></bubble-slider>`,
        ),
      ),
      component(
        "lists",
        "Lists",
        "Una e due righe, stile standard e segmentato, azione singola.",
        specimen(
          "Una riga · due righe",
          html`<bubble-list
              label="Una riga"
              .items=${[
                { id: "a", label: "Posta", icon: ti("inbox") },
                { id: "b", label: "Archivio", icon: ti("archive") },
              ]}
            ></bubble-list>
            <bubble-list
              label="Due righe"
              .items=${destinations}
            ></bubble-list>`,
        ),
        specimen(
          "Segmented · azione",
          html`<bubble-list
              variant="segmented"
              label="Segmentata"
              .items=${[
                { ...destinations[0], selected: true },
                ...destinations.slice(1),
              ]}
            ></bubble-list>
            <bubble-list
              label="Azioni"
              interactive
              .items=${destinations}
            ></bubble-list>`,
        ),
        specimen(
          "Selezione singola · multipla · espandibile",
          html`<bubble-list
              label="Selezione singola"
              selection="single"
              .value=${"inbox"}
              .items=${destinations}
            ></bubble-list>
            <bubble-list
              label="Selezione multipla"
              selection="multiple"
              .value=${["inbox"]}
              .items=${destinations}
            ></bubble-list>
            <bubble-list
              label="Gerarchia"
              .items=${[
                {
                  id: "mail",
                  label: "Posta",
                  icon: ti("inbox"),
                  items: [
                    { id: "mail-in", label: "Ricevuti" },
                    { id: "mail-out", label: "Inviati" },
                  ],
                },
                {
                  id: "files",
                  label: "File",
                  icon: ti("folder"),
                  items: [{ id: "files-a", label: "Documenti" }],
                },
              ]}
              .expanded=${["mail"]}
            ></bubble-list>`,
        ),
      ),
    )}
    ${group(
      "testo",
      "Testo e input",
      "Campi, ricerca, selettori di data e ora, tooltip.",
      component(
        "text-fields",
        "Text fields",
        "Filled e outlined, multilinea, testo di supporto, errore, contatore, icone, prefisso e suffisso.",
        specimen(
          "Filled · outlined · multilinea",
          html`<bubble-text-field
              label="Nome"
              supporting-text="Testo di supporto"
            ></bubble-text-field>
            <bubble-text-field
              label="Email"
              variant="outlined"
              type="email"
            ></bubble-text-field>
            <bubble-text-field
              label="Note"
              multiline
              rows="3"
            ></bubble-text-field>`,
        ),
        specimen(
          "Errore · contatore · readonly",
          html`<bubble-text-field
              label="Email"
              variant="outlined"
              value="mario"
              error
              supporting-text="Inserisci un indirizzo valido"
            ></bubble-text-field>
            <bubble-text-field
              label="Titolo"
              maxlength="40"
              counter
              value="Rapporto"
            ></bubble-text-field>
            <bubble-text-field
              label="Identificativo"
              value="DOC-1024"
              readonly
            ></bubble-text-field>`,
        ),
        specimen(
          "Icone · prefisso · suffisso · obbligatorio",
          html`<bubble-text-field label="Cerca" type="search"
              ><span slot="leading" aria-hidden="true"
                >🔍</span
              ></bubble-text-field
            ><bubble-text-field
              label="Importo"
              prefix="€"
              suffix="EUR"
            ></bubble-text-field>
            <bubble-text-field label="Nome" required></bubble-text-field>`,
        ),
      ),
      component(
        "search",
        "Search",
        "Stile contenuto e diviso; layout docked e full-screen.",
        specimen(
          "Contained · divided",
          html`<bubble-search
              label="Cerca documenti"
              placeholder="Titolo o autore"
            >
              <bubble-list
                slot="results"
                label="Risultati"
                .items=${destinations}
              ></bubble-list>
            </bubble-search>
            <bubble-search
              appearance="divided"
              label="Cerca nel testo"
              placeholder="Parola chiave"
            ></bubble-search>`,
        ),
        specimen(
          "Full-screen",
          html`<bubble-search
            layout="full-screen"
            label="Cerca a schermo intero"
            placeholder="Cerca ovunque"
          ></bubble-search>`,
        ),
        specimen(
          "Suggerimenti con combobox filtrata",
          html`<bubble-search
            filter
            label="Cerca città"
            placeholder="Scrivi una città"
            suggestions-label="Suggerimenti"
            .suggestions=${[
              "Bologna",
              "Bolzano",
              "Firenze",
              "Genova",
              "Milano",
              "Napoli",
              "Roma",
              "Torino",
            ]}
          ></bubble-search>`,
        ),
      ),
      component(
        "date-pickers",
        "Date pickers",
        "Data singola, intervallo e calendario docked; l'inserimento numerico non è implementato.",
        specimen(
          "Singola · intervallo",
          html`<bubble-date-picker
              label="Data appuntamento"
              name="date"
              value="2026-11-10"
            ></bubble-date-picker>
            <bubble-date-picker
              label="Periodo"
              selection-mode="range"
              value="2026-11-01"
              end-value="2026-11-15"
            ></bubble-date-picker>`,
        ),
        specimen(
          "Docked",
          html`<bubble-date-picker
            variant="docked"
            label="Data docked"
            value="2026-11-10"
          ></bubble-date-picker>`,
        ),
      ),
      component(
        "time-pickers",
        "Time pickers",
        "Quadrante a 24 ore, quadrante a 12 ore e inserimento da tastiera.",
        specimen(
          "Dial 24h · dial 12h · input",
          html`<bubble-time-picker
              label="Ora appuntamento"
              value="14:30"
            ></bubble-time-picker>
            <bubble-time-picker
              label="Ora 12h"
              value="14:30"
              hour-cycle="12"
            ></bubble-time-picker>
            <bubble-time-picker
              label="Ora da tastiera"
              variant="input"
              value="09:15"
            ></bubble-time-picker>`,
        ),
      ),
      component(
        "tooltips",
        "Tooltips",
        "Testo semplice e contenuto ricco con sottotitolo.",
        specimen(
          "Plain · rich",
          html`<bubble-tooltip label="Conserva una copia del documento"
              ><bubble-button variant="tonal"
                >Salva una copia</bubble-button
              ></bubble-tooltip
            ><bubble-tooltip
              variant="rich"
              persistent
              label="Salva una copia"
              supporting-text="La copia resta nel tuo spazio personale e resta aperta finché non la chiudi."
              ><bubble-button variant="outlined"
                >Copia</bubble-button
              ></bubble-tooltip
            >`,
        ),
      ),
    )}
    ${group(
      "menu",
      "Menu",
      "Baseline e verticale Expressive, colori standard e vibrant, selezione e sottomenu.",
      component(
        "menus",
        "Menus",
        "Baseline, verticale standard, verticale vibrant, selezione singola e multipla, sottomenu.",
        specimen(
          "Baseline · vertical standard",
          html`<bubble-button
              aria-haspopup="menu"
              @click=${(event: Event) => menu("demo-menu-baseline", event)}
              >Azioni</bubble-button
            ><bubble-menu
              id="demo-menu-baseline"
              variant="baseline"
              menu-label="Azioni documento"
            ></bubble-menu>
            <bubble-button
              variant="tonal"
              aria-haspopup="menu"
              @click=${(event: Event) => menu("demo-menu-standard", event)}
              >Ordinamento</bubble-button
            ><bubble-menu
              id="demo-menu-standard"
              selection-mode="single"
              menu-label="Ordinamento"
            ></bubble-menu>`,
        ),
        specimen(
          "Raggruppati · densità compatta",
          html`<bubble-button
              variant="outlined"
              aria-haspopup="menu"
              @click=${(event: Event) => menu("demo-menu-groups", event)}
              >Formato</bubble-button
            ><bubble-menu
              id="demo-menu-groups"
              density="-1"
              menu-label="Formato"
            ></bubble-menu>`,
        ),
        specimen(
          "Vibrant · multipla · sottomenu",
          html`<bubble-button
              variant="tonal"
              aria-haspopup="menu"
              @click=${(event: Event) => menu("demo-menu-vibrant", event)}
              >Filtri</bubble-button
            ><bubble-menu
              id="demo-menu-vibrant"
              color-scheme="vibrant"
              selection-mode="multi"
              menu-label="Filtri contenuti"
            ></bubble-menu>
            <bubble-button
              variant="outlined"
              aria-haspopup="menu"
              @click=${(event: Event) => menu("demo-menu-nested", event)}
              >Altre opzioni</bubble-button
            ><bubble-menu
              id="demo-menu-nested"
              menu-label="Altre opzioni"
            ></bubble-menu>`,
        ),
        specimen(
          "Stato della selezione",
          html`<output id="result" aria-live="polite"
            >Nessuna azione selezionata.</output
          >`,
        ),
      ),
    )}
  `,
  container,
);

document.querySelector<BubbleMenu>("#demo-menu-baseline")!.items = [
  { id: "open", label: "Apri", trailingText: "Ctrl+O" },
  { id: "rename", label: "Rinomina", supportingText: "Modifica il nome" },
  { separator: true },
  { id: "archive", label: "Archivia", disabled: true },
  { id: "docs", label: "Documentazione", href: "https://m3.material.io/" },
];
document.querySelector<BubbleMenu>("#demo-menu-standard")!.items = [
  { id: "name", label: "Nome", selected: true },
  { id: "date", label: "Data di modifica" },
  { id: "size", label: "Dimensione" },
];
document.querySelector<BubbleMenu>("#demo-menu-vibrant")!.items = [
  { id: "documents", label: "Documenti", selected: true, badge: "12" },
  { id: "images", label: "Immagini", badge: "8" },
  { id: "video", label: "Video", disabled: true },
];
document.querySelector<BubbleMenu>("#demo-menu-groups")!.items = [
  {
    group: true,
    label: "Testo",
    items: [
      { id: "bold", label: "Grassetto", trailingText: "Ctrl+B" },
      { id: "italic", label: "Corsivo", trailingText: "Ctrl+I" },
    ],
  },
  {
    group: true,
    label: "Paragrafo",
    items: [
      { id: "left", label: "Allinea a sinistra" },
      { id: "right", label: "Allinea a destra" },
    ],
  },
];
document.querySelector<BubbleMenu>("#demo-menu-nested")!.items = [
  {
    id: "share",
    label: "Condividi",
    children: [
      { id: "link", label: "Copia collegamento" },
      { id: "email", label: "Invia per email" },
    ],
  },
  { separator: true },
  {
    id: "download",
    label: "Scarica",
    children: [
      { id: "pdf", label: "Documento PDF" },
      { id: "text", label: "Testo semplice" },
    ],
  },
];

document.querySelectorAll("bubble-menu").forEach((element) =>
  element.addEventListener("menu-select", (event) => {
    const detail = (event as CustomEvent<{ item: { label: string } }>).detail;
    document.getElementById("result")!.textContent =
      `Selezione: ${detail.item.label}`;
  }),
);

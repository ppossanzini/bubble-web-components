import { html, render, type TemplateResult } from "lit";
import { ti } from "./icons.js";
import type {
  BolleDialog,
  BolleItem,
  BolleMenu,
  BolleSnackbar,
} from "../src/index.js";

const destinations: BolleItem[] = [
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
const fiveDestinations: BolleItem[] = [
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
    .querySelector<BolleDialog>(`#${id}`)
    ?.show(event.currentTarget as HTMLElement);

const snackbar = () =>
  document.querySelector<BolleSnackbar>("#demo-snackbar")?.show();

const menu = (id: string, event: Event) =>
  document
    .querySelector<BolleMenu>(`#${id}`)
    ?.show(event.currentTarget as HTMLElement);

const cards = (variant: string) =>
  html`<bolle-card>
    <h4>Documento</h4>
    <p>Contenuto indipendente con un'azione interna.</p>
    <bolle-button variant="text">Apri</bolle-button>
  </bolle-card>`;

const carouselItem = (label: string, text: string) =>
  html`<bolle-card>
    <h4>${label}</h4>
    <p>${text}</p>
  </bolle-card>`;

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
                html`<bolle-button variant=${variant} @click=${snackbar}
                  >${variant}</bolle-button
                >`,
            )}
          </div>`,
        ),
        specimen(
          "Toggle non selezionato / selezionato",
          html`<bolle-button toggle>Salva</bolle-button>
            <bolle-button toggle selected>Salvato</bolle-button>`,
        ),
        specimen(
          "Disabilitato",
          html`<bolle-button variant="filled" disabled>Filled</bolle-button>
            <bolle-button variant="tonal" disabled>Tonal</bolle-button>
            <bolle-button variant="outlined" disabled
              >Outlined</bolle-button
            >`,
        ),
        specimen(
          "Dimensioni XS · S · M · L · XL",
          html`<div class="inline">
            ${["xs", "small", "medium", "large", "xl"].map(
              (size) =>
                html`<bolle-button size=${size}>${size}</bolle-button>`,
            )}
          </div>`,
        ),
        specimen(
          "Forma quadrata",
          html`<bolle-button shape="square">Quadrato</bolle-button>
            <bolle-button shape="square" variant="outlined"
              >Outline</bolle-button
            >`,
        ),
        specimen(
          "Con icona e collegamento",
          html`<bolle-button
              ><span slot="icon" class="md-icon" aria-hidden="true">add</span
              >Crea</bolle-button
            ><bolle-button
              variant="text"
              href="https://m3.material.io/components/buttons"
              >Linee guida</bolle-button
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
                html`<bolle-icon-button
                  variant=${variant}
                  label=${variant}
                  @click=${snackbar}
                  >${ti("star")}</bolle-icon-button
                >`,
            )}
          </div>`,
        ),
        specimen(
          "Toggle off / on",
          html`<bolle-icon-button label="Preferito" toggle
              >${ti("star")}</bolle-icon-button
            >
            <bolle-icon-button label="Preferito attivo" toggle selected
              >${ti("star")}</bolle-icon-button
            >`,
        ),
        specimen(
          "Dimensioni e forma",
          html`<bolle-icon-button size="xs" label="XS"
              >${ti("star")}</bolle-icon-button
            >
            <bolle-icon-button size="small" label="S"
              >${ti("star")}</bolle-icon-button
            >
            <bolle-icon-button size="medium" label="M"
              >${ti("star")}</bolle-icon-button
            >
            <bolle-icon-button size="large" label="L"
              >${ti("star")}</bolle-icon-button
            >
            <bolle-icon-button size="xl" label="XL"
              >${ti("star")}</bolle-icon-button
            >
            <bolle-icon-button shape="square" label="Quadrato"
              >${ti("star")}</bolle-icon-button
            >`,
        ),
        specimen(
          "Larghezza narrow · default · wide",
          html`<bolle-icon-button
              variant="filled"
              width="narrow"
              label="Stretta"
              >${ti("star")}</bolle-icon-button
            ><bolle-icon-button variant="filled" label="Normale"
              >${ti("star")}</bolle-icon-button
            ><bolle-icon-button variant="filled" width="wide" label="Larga"
              >${ti("star")}</bolle-icon-button
            >`,
        ),
      ),
      component(
        "button-groups",
        "Button groups",
        "Gruppo standard e connesso; selezione singola o multipla con toggle.",
        specimen(
          "Standard",
          html`<bolle-button-group label="Azioni documento"
            ><bolle-button>Salva</bolle-button
            ><bolle-button variant="tonal">Copia</bolle-button
            ><bolle-button variant="outlined"
              >Condividi</bolle-button
            ></bolle-button-group
          >`,
        ),
        specimen(
          "Connected",
          html`<bolle-button-group variant="connected" label="Allineamento"
            ><bolle-button variant="outlined">Sinistra</bolle-button
            ><bolle-button variant="outlined">Centro</bolle-button
            ><bolle-button variant="outlined"
              >Destra</bolle-button
            ></bolle-button-group
          >`,
        ),
        specimen(
          "Selezione singola · multipla",
          html`<bolle-button-group label="Vista" selection="single" required
              ><bolle-button value="grid" selected>Griglia</bolle-button
              ><bolle-button value="list"
                >Elenco</bolle-button
              ></bolle-button-group
            ><bolle-button-group label="Filtri" selection="multiple"
              ><bolle-button value="mine" toggle>Miei</bolle-button
              ><bolle-button value="shared" toggle
                >Condivisi</bolle-button
              ></bolle-button-group
            >`,
        ),
        specimen(
          "Dimensioni del gruppo",
          html`<bolle-button-group label="Compatte" size="xs"
              ><bolle-button>A</bolle-button
              ><bolle-button>B</bolle-button></bolle-button-group
            ><bolle-button-group label="Grandi" size="large"
              ><bolle-button>A</bolle-button
              ><bolle-button>B</bolle-button></bolle-button-group
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
              html`<bolle-split-button
                variant=${variant}
                label="Invia"
                menu-label=${`Altre opzioni ${variant}`}
                .items=${[
                  { id: "later", label: "Invia più tardi" },
                  { id: "draft", label: "Salva bozza" },
                ]}
                @action=${snackbar}
              ></bolle-split-button>`,
          )}`,
        ),
        specimen(
          "Taglie xs · small · medium · large · xl",
          html`${["xs", "small", "medium", "large", "xl"].map(
            (size) =>
              html`<bolle-split-button
                size=${size}
                label=${size}
                menu-label=${`Altre opzioni ${size}`}
                .items=${[{ id: "later", label: "Invia più tardi" }]}
              ></bolle-split-button>`,
          )}`,
        ),
        specimen(
          "Disabilitato",
          html`<bolle-split-button
            label="Invia"
            menu-label="Altre opzioni"
            disabled
            .items=${[{ id: "later", label: "Invia più tardi" }]}
          ></bolle-split-button>`,
        ),
      ),
      component(
        "floating-action-button",
        "FAB",
        "Taglie small, medium e large; sei mappature di colore.",
        specimen(
          "Small · Medium · Large",
          html`<bolle-floating-action-button size="small" label="Crea"
              >+</bolle-floating-action-button
            >
            <bolle-floating-action-button label="Crea"
              >+</bolle-floating-action-button
            >
            <bolle-floating-action-button size="large" label="Crea"
              >+</bolle-floating-action-button
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
              html`<bolle-floating-action-button color=${color} label=${color}
                >+</bolle-floating-action-button
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
          html`<bolle-extended-fab size="small"
              ><span slot="icon" aria-hidden="true">+</span
              >Crea</bolle-extended-fab
            ><bolle-extended-fab size="medium"
              ><span slot="icon" aria-hidden="true">+</span
              >Crea</bolle-extended-fab
            ><bolle-extended-fab size="large"
              ><span slot="icon" aria-hidden="true">+</span
              >Crea</bolle-extended-fab
            >`,
        ),
        specimen(
          "Solo etichetta · colori",
          html`<bolle-extended-fab color="secondary-container"
              >Condividi</bolle-extended-fab
            ><bolle-extended-fab color="tertiary" size="small"
              >Condividi</bolle-extended-fab
            >`,
        ),
      ),
      component(
        "fab-menu",
        "FAB menu",
        "Da due a sei azioni correlate sotto un'azione principale.",
        specimen(
          "Aperto da FAB",
          html`<bolle-fab-menu
            label="Crea"
            .items=${destinations}
          ></bolle-fab-menu>`,
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
              >Posta<bolle-badge
                value="12"
                label="12 messaggi non letti"
              ></bolle-badge
            ></span>
            <span class="badge-anchor"
              >Avvisi<bolle-badge
                value="1200"
                max="999"
                label="Oltre 999 avvisi"
              ></bolle-badge
            ></span>
            <span class="badge-anchor"
              >Aggiornamenti<bolle-badge
                small
                label="Nuovi contenuti"
              ></bolle-badge
            ></span>`,
        ),
      ),
      component(
        "progress-indicators",
        "Progress indicators",
        "Lineare e circolare, determinato e indeterminato, con indicatore di arresto e forma ondulata.",
        specimen(
          "Lineare determinato · indeterminato",
          html`<bolle-progress-indicator
              value="65"
              label="Download"
            ></bolle-progress-indicator>
            <bolle-progress-indicator
              indeterminate
              label="Connessione"
            ></bolle-progress-indicator>`,
        ),
        specimen(
          "Determinato con stop · wavy",
          html`<bolle-progress-indicator
              value="35"
              label="Avanzamento con stop"
            ></bolle-progress-indicator>
            <bolle-progress-indicator
              wavy
              value="60"
              label="Avanzamento ondulato"
            ></bolle-progress-indicator>
            <bolle-progress-indicator
              wavy
              indeterminate
              label="Attesa ondulata"
            ></bolle-progress-indicator>`,
        ),
        specimen(
          "Circolare determinato · indeterminato",
          html`<bolle-progress-indicator
              variant="circular"
              value="65"
              label="Caricamento file"
            ></bolle-progress-indicator>
            <bolle-progress-indicator
              variant="circular"
              indeterminate
              label="Attesa"
            ></bolle-progress-indicator>`,
        ),
      ),
      component(
        "loading-indicator",
        "Loading indicator",
        "Indicatore Morph Expressive; configurazione libera e contenuta.",
        specimen(
          "Default · contenuto",
          html`<bolle-loading-indicator
              label="Caricamento"
            ></bolle-loading-indicator>
            <bolle-loading-indicator
              variant="contained"
              label="Caricamento allegati"
            ></bolle-loading-indicator>`,
        ),
      ),
      component(
        "snackbar",
        "Snackbar",
        "Una o due righe; con azione resta finché non viene chiusa.",
        specimen(
          "Riga singola · con azione · due righe",
          html`<bolle-button
              @click=${() =>
                document
                  .querySelector<BolleSnackbar>("#demo-snackbar")
                  ?.show("Documento salvato")}
              >Mostra</bolle-button
            ><bolle-button
              @click=${() =>
                document
                  .querySelector<BolleSnackbar>("#demo-snackbar")
                  ?.show("Documento spostato nel cestino")}
              >Spostato</bolle-button
            >`,
        ),
        specimen(
          "Con azione (annulla)",
          html`<bolle-snackbar
            id="demo-snackbar"
            action-label="Annulla"
            close-label="Chiudi"
            message="Documento eliminato"
          ></bolle-snackbar>`,
        ),
        specimen(
          "Coda di messaggi",
          html`<bolle-button
            variant="tonal"
            @click=${() => {
              const bar =
                document.querySelector<BolleSnackbar>("#demo-snackbar")!;
              bar.show("Primo messaggio");
              bar.show("Secondo messaggio");
              bar.show("Terzo messaggio");
            }}
            >Accoda tre messaggi</bolle-button
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
                html`<bolle-card variant=${variant}>
                  <h4>${variant}</h4>
                  <p>Un contenuto indipendente.</p>
                </bolle-card>`,
            )}
          </div>`,
        ),
        specimen(
          "Orizzontale",
          html`<bolle-card orientation="horizontal">
            <div slot="media" class="card-media">IMG</div>
            <div>
              <h4>Documento condiviso</h4>
              <p>Media a sinistra, contenuto a destra.</p>
            </div>
          </bolle-card>`,
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
              html`<bolle-carousel
                variant=${variant}
                label=${`Carousel ${variant}`}
                previous-label="Precedente"
                next-label="Successivo"
                >${carouselItem("Posta", "Messaggi ricevuti")}${carouselItem(
                  "Archivio",
                  "Documenti salvati",
                )}${carouselItem("Impostazioni", "Preferenze personali")}</bolle-carousel
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
          html`<bolle-button
              @click=${(event: Event) => dialog("demo-dialog", event)}
              >Dialogo base</bolle-button
            ><bolle-button
              variant="tonal"
              @click=${(event: Event) => dialog("demo-dialog-full", event)}
              >Dialogo a schermo intero</bolle-button
            >`,
        ),
        html`<bolle-dialog
            id="demo-dialog"
            label="Nuovo documento"
            close-label="Annulla"
          >
            <bolle-text-field label="Titolo" required></bolle-text-field>
          </bolle-dialog>
          <bolle-dialog
            id="demo-dialog-full"
            variant="full-screen"
            label="Nuovo documento"
            close-label="Chiudi"
          >
            <bolle-text-field label="Titolo" required></bolle-text-field>
            <bolle-text-field
              label="Descrizione"
              multiline
            ></bolle-text-field>
          </bolle-dialog> `,
      ),
      component(
        "bottom-sheets",
        "Bottom sheets",
        "Foglio modale con maniglia di trascinamento e foglio standard.",
        specimen(
          "Modale · standard",
          html`<bolle-button
              @click=${(event: Event) => dialog("demo-bottom-modal", event)}
              >Modale</bolle-button
            ><bolle-button
              variant="outlined"
              @click=${(event: Event) => dialog("demo-bottom-standard", event)}
              >Standard</bolle-button
            ><bolle-bottom-sheet
              id="demo-bottom-modal"
              drag-handle
              label="Azioni documento"
              close-label="Chiudi"
              ><bolle-list .items=${destinations}></bolle-list
            ></bolle-bottom-sheet>
            <bolle-bottom-sheet
              id="demo-bottom-standard"
              variant="standard"
              label="Azioni documento"
              ><bolle-list .items=${destinations}></bolle-list
            ></bolle-bottom-sheet>`,
        ),
      ),
      component(
        "side-sheets",
        "Side sheets",
        "Foglio modale, standard e staccato dal bordo.",
        specimen(
          "Modale · standard · detached",
          html`<bolle-button
              @click=${(event: Event) => dialog("demo-side-modal", event)}
              >Modale</bolle-button
            ><bolle-button
              variant="outlined"
              @click=${(event: Event) => dialog("demo-side-standard", event)}
              >Standard</bolle-button
            ><bolle-button
              variant="tonal"
              @click=${(event: Event) => dialog("demo-side-detached", event)}
              >Detached</bolle-button
            ><bolle-side-sheet
              id="demo-side-modal"
              label="Dettagli"
              close-label="Chiudi"
              ><p>Informazioni sul documento.</p></bolle-side-sheet
            ><bolle-side-sheet
              id="demo-side-standard"
              variant="standard"
              label="Dettagli"
              ><p>Foglio standard.</p></bolle-side-sheet
            ><bolle-side-sheet
              id="demo-side-detached"
              detached
              label="Dettagli"
              close-label="Chiudi"
              ><p>Foglio staccato dal bordo.</p></bolle-side-sheet
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
            <bolle-divider></bolle-divider>
            <p>Sotto</p>
          </div>`,
        ),
        specimen(
          "Inset su entrambi i lati",
          html`<div class="divider-demo">
            <p>Sopra</p>
            <bolle-divider variant="inset"></bolle-divider>
            <p>Sotto</p>
          </div>`,
        ),
        specimen(
          "Inset solo iniziale",
          html`<div class="divider-demo">
            <p>Sopra</p>
            <bolle-divider variant="inset-start"></bolle-divider>
            <p>Sotto</p>
          </div>`,
        ),
        specimen(
          "Inset solo finale",
          html`<div class="divider-demo">
            <p>Sopra</p>
            <bolle-divider variant="inset-end"></bolle-divider>
            <p>Sotto</p>
          </div>`,
        ),
        specimen(
          "Verticale",
          html`<div class="divider-horizontal">
            <span>Testo</span><bolle-divider vertical></bolle-divider
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
          html`<bolle-app-bar label="Posta"
              ><bolle-icon-button slot="leading" label="Menu"
                >${ti("menu-2")}</bolle-icon-button
              ></bolle-app-bar
            ><bolle-app-bar variant="center-aligned" label="Posta"
              ><bolle-icon-button slot="leading" label="Menu"
                >${ti("menu-2")}</bolle-icon-button
              ></bolle-app-bar
            >`,
        ),
        specimen(
          "Medium · medium flexible · large · large flexible",
          html`<bolle-app-bar variant="medium" label="Posta"></bolle-app-bar>
            <bolle-app-bar
              variant="medium-flexible"
              label="Posta"
              subtitle="12 non letti"
            ></bolle-app-bar>
            <bolle-app-bar variant="large" label="Posta"></bolle-app-bar>
            <bolle-app-bar
              variant="large-flexible"
              label="Posta"
              subtitle="12 non letti"
            ></bolle-app-bar>`,
        ),
        specimen(
          "Search",
          html`<bolle-app-bar variant="search">
            <bolle-search label="Cerca" placeholder="Cerca nella posta"
              ><span slot="leading" class="md-icon" aria-hidden="true"
                >search</span
              ></bolle-search
            >
          </bolle-app-bar>`,
        ),
      ),
      component(
        "navigation-bar",
        "Navigation bar",
        "Da tre a cinque destinazioni; variante baseline e flexible con layout orizzontale.",
        specimen(
          "Baseline 3 · 5 destinazioni",
          html`<bolle-navigation-bar
              label="Navigazione principale"
              .items=${destinations}
              value="inbox"
            ></bolle-navigation-bar>
            <bolle-navigation-bar
              label="Navigazione cinque"
              .items=${fiveDestinations}
              value="inbox"
            ></bolle-navigation-bar>`,
        ),
        specimen(
          "Flexible · layout orizzontale",
          html`<bolle-navigation-bar
            variant="flexible"
            layout="horizontal"
            label="Navigazione flessibile"
            .items=${destinations}
            value="archive"
          ></bolle-navigation-bar>`,
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
            <bolle-navigation-rail
              label="Rail compresso"
              .items=${destinations}
              value="inbox"
            ></bolle-navigation-rail>
            <bolle-navigation-rail
              expanded
              label="Rail espanso"
              .items=${destinations}
              value="inbox"
            ></bolle-navigation-rail>
          </div>`,
        ),
      ),
      component(
        "navigation-drawer",
        "Navigation drawer",
        "Drawer modale e standard, con etichette di sezione opzionali.",
        specimen(
          "Modale · standard",
          html`<bolle-button
              @click=${(event: Event) => dialog("demo-drawer", event)}
              >Apri drawer</bolle-button
            ><bolle-navigation-drawer
              id="demo-drawer"
              label="Sezioni"
              close-label="Chiudi"
              .items=${destinations}
              value="inbox"
            ></bolle-navigation-drawer>
            <bolle-button
              variant="outlined"
              @click=${(event: Event) => dialog("demo-drawer-standard", event)}
              >Apri drawer standard</bolle-button
            >
            <bolle-navigation-drawer
              id="demo-drawer-standard"
              variant="standard"
              label="Sezioni standard"
              .items=${destinations}
              value="archive"
            ></bolle-navigation-drawer>`,
        ),
      ),
      component(
        "tabs",
        "Tabs",
        "Tab primari e secondari, con icona e badge; attivazione automatica o manuale.",
        specimen(
          "Primary · secondary",
          html`<bolle-tabs
              label="Categorie"
              .items=${destinations}
              value="inbox"
              ><p slot="inbox">Messaggi ricevuti.</p>
              <p slot="archive">Documenti salvati.</p>
              <p slot="settings">Preferenze personali.</p></bolle-tabs
            ><bolle-tabs
              variant="secondary"
              label="Dettagli"
              .items=${destinations}
              value="settings"
              ><p slot="settings">Scheda secondaria.</p></bolle-tabs
            >`,
        ),
        specimen(
          "Con icona e badge",
          html`<bolle-tabs
            label="Viste"
            .items=${[
              { id: "a", label: "Posta", icon: ti("inbox"), badge: "3" },
              { id: "b", label: "Archivio", icon: ti("archive") },
              { id: "c", label: "Preferenze", icon: ti("settings") },
              { id: "d", label: "Cestino", icon: ti("trash") },
            ]}
            value="a"
          ></bolle-tabs>`,
        ),
        specimen(
          "Scrollable con pulsanti di scorrimento",
          html`<bolle-tabs
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
          ></bolle-tabs>`,
        ),
      ),
      component(
        "toolbars",
        "Toolbars",
        "Docked standard e vibrant, floating orizzontale e verticale.",
        specimen(
          "Docked standard · vibrant",
          html`<bolle-toolbar label="Formato"
              ><bolle-icon-button label="Grassetto" toggle
                >${ti("bold")}</bolle-icon-button
              ><bolle-icon-button label="Corsivo" toggle
                >${ti("italic")}</bolle-icon-button
              ><bolle-icon-button label="Sottolineato" toggle
                ><span class="md-icon"
                  >format_underlined</span
                ></bolle-icon-button
              ></bolle-toolbar
            ><bolle-toolbar label="Modifica" color="vibrant"
              ><bolle-icon-button label="Taglia" variant="standard"
                >${ti("scissors")}</bolle-icon-button
              ><bolle-icon-button label="Copia" variant="standard"
                >${ti("copy")}</bolle-icon-button
              ><bolle-icon-button label="Incolla" variant="standard"
                >${ti("clipboard")}</bolle-icon-button
              ></bolle-toolbar
            >`,
        ),
        specimen(
          "Floating orizzontale · verticale",
          html`<div class="inline align-start">
            <bolle-toolbar label="Formato" variant="floating"
              ><bolle-icon-button label="Grassetto" toggle
                >${ti("bold")}</bolle-icon-button
              ><bolle-icon-button label="Corsivo" toggle
                >${ti("italic")}</bolle-icon-button
              ></bolle-toolbar
            ><bolle-toolbar
              label="Allineamento"
              variant="floating"
              orientation="vertical"
              ><bolle-icon-button label="Su"
                >${ti("arrow-up")}</bolle-icon-button
              ><bolle-icon-button label="Giù"
                >${ti("arrow-down")}</bolle-icon-button
              ></bolle-toolbar
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
          html`<bolle-checkbox label="Non selezionata"></bolle-checkbox>
            <bolle-checkbox label="Selezionata" checked></bolle-checkbox>
            <bolle-checkbox
              label="Indeterminata"
              indeterminate
            ></bolle-checkbox>
            <bolle-checkbox label="Disabilitata" disabled></bolle-checkbox>
            <bolle-checkbox
              label="Accetto i termini"
              required
              error
              supporting-text="Devi accettare per continuare"
            ></bolle-checkbox>`,
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
            <bolle-radio-button
              name="freq"
              value="daily"
              label="Giornaliera"
              checked
            ></bolle-radio-button>
            <bolle-radio-button
              name="freq"
              value="weekly"
              label="Settimanale"
            ></bolle-radio-button>
            <bolle-radio-button
              name="freq"
              value="never"
              label="Mai"
              disabled
            ></bolle-radio-button>
          </fieldset>`,
        ),
      ),
      component(
        "switch",
        "Switch",
        "Spento e acceso, con icona dentro la maniglia, disabilitato ed errore.",
        specimen(
          "Off · on · disabilitato",
          html`<bolle-switch label="Notifiche"></bolle-switch>
            <bolle-switch label="Sincronizzazione" checked></bolle-switch>
            <bolle-switch label="Bloccato" disabled checked></bolle-switch>`,
        ),
        specimen(
          "Con icona · errore",
          html`<bolle-switch
              label="Wi-Fi"
              .icon=${ti("wifi-off")}
              .iconSelected=${ti("wifi")}
            ></bolle-switch>
            <bolle-switch
              label="Modalità aereo"
              checked
              .icon=${ti("plane-off")}
              .iconSelected=${ti("plane")}
            ></bolle-switch>
            <bolle-switch
              label="Accetto le condizioni"
              error
              supporting-text="Devi attivare il consenso"
            ></bolle-switch>`,
        ),
      ),
      component(
        "chips",
        "Chips",
        "Assist, filter, input e suggestion; stile flat ed elevated.",
        specimen(
          "Assist · filter non selezionata / selezionata",
          html`<bolle-chip
              variant="assist"
              label="Aggiungi al calendario"
            ></bolle-chip>
            <bolle-chip variant="filter" label="Solo non letti"></bolle-chip>
            <bolle-chip
              variant="filter"
              label="Preferiti"
              selected
            ></bolle-chip>`,
        ),
        specimen(
          "Input rimovibile con avatar · suggestion · elevated",
          html`<bolle-chip
              variant="input"
              label="Mario Rossi"
              removable
              remove-label="Rimuovi Mario Rossi"
              ><span slot="avatar" class="avatar">MR</span></bolle-chip
            ><bolle-chip variant="suggestion" label="Grazie!"></bolle-chip>
            <bolle-chip
              variant="filter"
              label="Elevata"
              elevated
            ></bolle-chip>`,
        ),
      ),
      component(
        "segmented-buttons",
        "Segmented buttons",
        "Selezione singola e multipla, da due a cinque segmenti, con icona.",
        specimen(
          "Single-select · multi-select",
          html`<bolle-segmented-buttons
              label="Vista"
              name="view"
              value="inbox"
              .items=${destinations}
            ></bolle-segmented-buttons>
            <bolle-segmented-buttons
              label="Filtri"
              name="filters"
              multiple
              .values=${["inbox", "archive"]}
              .items=${destinations}
            ></bolle-segmented-buttons>`,
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
        "Bolla-valore, livello liquido, bolle in fila, membrana e intervallo a gocce.",
        specimen(
          "A · Bolla-valore · B · Livello liquido",
          html`<bolle-slider label="Luminosità" value="40"></bolle-slider>
            <bolle-slider
              label="Volume"
              variant="liquid"
              value="65"
              suffix="%"
              .icon=${ti("volume")}
            ></bolle-slider>`,
        ),
        specimen(
          "C · Bolle in fila",
          html`<bolle-steps
            label="Intensità"
            options="Leggera,Morbida,Media,Forte,Intensa"
            value="2"
          ></bolle-steps>`,
        ),
        specimen(
          "D · Membrana · E · Gocce che si fondono",
          html`<bolle-slider
              label="Tensione"
              variant="membrane"
              value="55"
            ></bolle-slider>
            <bolle-slider
              label="Prezzo"
              variant="range"
              value="20"
              upper-value="70"
              upper-label="Prezzo massimo"
              suffix=" €"
            ></bolle-slider>`,
        ),
      ),
      ),
      component(
        "lists",
        "Lists",
        "Una e due righe, stile standard e segmentato, azione singola.",
        specimen(
          "Una riga · due righe",
          html`<bolle-list
              label="Una riga"
              .items=${[
                { id: "a", label: "Posta", icon: ti("inbox") },
                { id: "b", label: "Archivio", icon: ti("archive") },
              ]}
            ></bolle-list>
            <bolle-list
              label="Due righe"
              .items=${destinations}
            ></bolle-list>`,
        ),
        specimen(
          "Segmented · azione",
          html`<bolle-list
              variant="segmented"
              label="Segmentata"
              .items=${[
                { ...destinations[0], selected: true },
                ...destinations.slice(1),
              ]}
            ></bolle-list>
            <bolle-list
              label="Azioni"
              interactive
              .items=${destinations}
            ></bolle-list>`,
        ),
        specimen(
          "Selezione singola · multipla · espandibile",
          html`<bolle-list
              label="Selezione singola"
              selection="single"
              .value=${"inbox"}
              .items=${destinations}
            ></bolle-list>
            <bolle-list
              label="Selezione multipla"
              selection="multiple"
              .value=${["inbox"]}
              .items=${destinations}
            ></bolle-list>
            <bolle-list
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
            ></bolle-list>`,
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
          html`<bolle-text-field
              label="Nome"
              supporting-text="Testo di supporto"
            ></bolle-text-field>
            <bolle-text-field
              label="Email"
              variant="outlined"
              type="email"
            ></bolle-text-field>
            <bolle-text-field
              label="Note"
              multiline
              rows="3"
            ></bolle-text-field>`,
        ),
        specimen(
          "Errore · contatore · readonly",
          html`<bolle-text-field
              label="Email"
              variant="outlined"
              value="mario"
              error
              supporting-text="Inserisci un indirizzo valido"
            ></bolle-text-field>
            <bolle-text-field
              label="Titolo"
              maxlength="40"
              counter
              value="Rapporto"
            ></bolle-text-field>
            <bolle-text-field
              label="Identificativo"
              value="DOC-1024"
              readonly
            ></bolle-text-field>`,
        ),
        specimen(
          "Icone · prefisso · suffisso · obbligatorio",
          html`<bolle-text-field label="Cerca" type="search"
              ><span slot="leading" aria-hidden="true"
                >🔍</span
              ></bolle-text-field
            ><bolle-text-field
              label="Importo"
              prefix="€"
              suffix="EUR"
            ></bolle-text-field>
            <bolle-text-field label="Nome" required></bolle-text-field>`,
        ),
      ),
      component(
        "search",
        "Search",
        "Stile contenuto e diviso; layout docked e full-screen.",
        specimen(
          "Contained · divided",
          html`<bolle-search
              label="Cerca documenti"
              placeholder="Titolo o autore"
            >
              <bolle-list
                slot="results"
                label="Risultati"
                .items=${destinations}
              ></bolle-list>
            </bolle-search>
            <bolle-search
              appearance="divided"
              label="Cerca nel testo"
              placeholder="Parola chiave"
            ></bolle-search>`,
        ),
        specimen(
          "Full-screen",
          html`<bolle-search
            layout="full-screen"
            label="Cerca a schermo intero"
            placeholder="Cerca ovunque"
          ></bolle-search>`,
        ),
        specimen(
          "Suggerimenti con combobox filtrata",
          html`<bolle-search
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
          ></bolle-search>`,
        ),
      ),
      component(
        "date-pickers",
        "Date pickers",
        "Data singola, intervallo e calendario docked; l'inserimento numerico non è implementato.",
        specimen(
          "Singola · intervallo",
          html`<bolle-date-picker
              label="Data appuntamento"
              name="date"
              value="2026-11-10"
            ></bolle-date-picker>
            <bolle-date-picker
              label="Periodo"
              selection-mode="range"
              value="2026-11-01"
              end-value="2026-11-15"
            ></bolle-date-picker>`,
        ),
        specimen(
          "Docked",
          html`<bolle-date-picker
            variant="docked"
            label="Data docked"
            value="2026-11-10"
          ></bolle-date-picker>`,
        ),
      ),
      component(
        "time-pickers",
        "Time pickers",
        "Quadrante a 24 ore, quadrante a 12 ore e inserimento da tastiera.",
        specimen(
          "Dial 24h · dial 12h · input",
          html`<bolle-time-picker
              label="Ora appuntamento"
              value="14:30"
            ></bolle-time-picker>
            <bolle-time-picker
              label="Ora 12h"
              value="14:30"
              hour-cycle="12"
            ></bolle-time-picker>
            <bolle-time-picker
              label="Ora da tastiera"
              variant="input"
              value="09:15"
            ></bolle-time-picker>`,
        ),
      ),
      component(
        "tooltips",
        "Tooltips",
        "Testo semplice e contenuto ricco con sottotitolo.",
        specimen(
          "Plain · rich",
          html`<bolle-tooltip label="Conserva una copia del documento"
              ><bolle-button variant="tonal"
                >Salva una copia</bolle-button
              ></bolle-tooltip
            ><bolle-tooltip
              variant="rich"
              persistent
              label="Salva una copia"
              supporting-text="La copia resta nel tuo spazio personale e resta aperta finché non la chiudi."
              ><bolle-button variant="outlined"
                >Copia</bolle-button
              ></bolle-tooltip
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
          html`<bolle-button
              aria-haspopup="menu"
              @click=${(event: Event) => menu("demo-menu-baseline", event)}
              >Azioni</bolle-button
            ><bolle-menu
              id="demo-menu-baseline"
              variant="baseline"
              menu-label="Azioni documento"
            ></bolle-menu>
            <bolle-button
              variant="tonal"
              aria-haspopup="menu"
              @click=${(event: Event) => menu("demo-menu-standard", event)}
              >Ordinamento</bolle-button
            ><bolle-menu
              id="demo-menu-standard"
              selection-mode="single"
              menu-label="Ordinamento"
            ></bolle-menu>`,
        ),
        specimen(
          "Raggruppati · densità compatta",
          html`<bolle-button
              variant="outlined"
              aria-haspopup="menu"
              @click=${(event: Event) => menu("demo-menu-groups", event)}
              >Formato</bolle-button
            ><bolle-menu
              id="demo-menu-groups"
              density="-1"
              menu-label="Formato"
            ></bolle-menu>`,
        ),
        specimen(
          "Vibrant · multipla · sottomenu",
          html`<bolle-button
              variant="tonal"
              aria-haspopup="menu"
              @click=${(event: Event) => menu("demo-menu-vibrant", event)}
              >Filtri</bolle-button
            ><bolle-menu
              id="demo-menu-vibrant"
              color-scheme="vibrant"
              selection-mode="multi"
              menu-label="Filtri contenuti"
            ></bolle-menu>
            <bolle-button
              variant="outlined"
              aria-haspopup="menu"
              @click=${(event: Event) => menu("demo-menu-nested", event)}
              >Altre opzioni</bolle-button
            ><bolle-menu
              id="demo-menu-nested"
              menu-label="Altre opzioni"
            ></bolle-menu>`,
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

document.querySelector<BolleMenu>("#demo-menu-baseline")!.items = [
  { id: "open", label: "Apri", trailingText: "Ctrl+O" },
  { id: "rename", label: "Rinomina", supportingText: "Modifica il nome" },
  { separator: true },
  { id: "archive", label: "Archivia", disabled: true },
  { id: "docs", label: "Documentazione", href: "https://m3.material.io/" },
];
document.querySelector<BolleMenu>("#demo-menu-standard")!.items = [
  { id: "name", label: "Nome", selected: true },
  { id: "date", label: "Data di modifica" },
  { id: "size", label: "Dimensione" },
];
document.querySelector<BolleMenu>("#demo-menu-vibrant")!.items = [
  { id: "documents", label: "Documenti", selected: true, badge: "12" },
  { id: "images", label: "Immagini", badge: "8" },
  { id: "video", label: "Video", disabled: true },
];
document.querySelector<BolleMenu>("#demo-menu-groups")!.items = [
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
document.querySelector<BolleMenu>("#demo-menu-nested")!.items = [
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

document.querySelectorAll("bolle-menu").forEach((element) =>
  element.addEventListener("menu-select", (event) => {
    const detail = (event as CustomEvent<{ item: { label: string } }>).detail;
    document.getElementById("result")!.textContent =
      `Selezione: ${detail.item.label}`;
  }),
);

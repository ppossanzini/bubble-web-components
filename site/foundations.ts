import { html, svg, type TemplateResult } from "lit";
import { bolleMark } from "./landing.js";

const show = (id: string) => (event: Event) =>
  document
    .querySelector<HTMLElement & { show?: (opener?: HTMLElement) => void }>(`#${id}`)
    ?.show?.(event.currentTarget as HTMLElement);

const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** Long gradient values collapse to their function name. */
const shortValue = (value: string) => {
  const flat = value.replace(/\s+/g, " ");
  return flat.length > 60 ? `${flat.slice(0, flat.indexOf("("))}(…)` : flat;
};

const tokenTable = (rows: [string, string][]) =>
  html`<table class="fd-tokens">
    <thead>
      <tr><th scope="col">Token</th><th scope="col">Valore</th><th scope="col">Uso</th></tr>
    </thead>
    <tbody>
      ${rows.map(
        ([name, use]) =>
          html`<tr>
            <td><code>${name}</code></td>
            <td><code>${shortValue(token(name)) || "—"}</code></td>
            <td>${use}</td>
          </tr>`,
      )}
    </tbody>
  </table>`;

const section = (
  id: string,
  kicker: string,
  title: string,
  lead: string,
  body: TemplateResult,
) =>
  html`<section class="fd-section panel" id=${`fd-${id}`} aria-labelledby=${`fd-${id}-title`}>
    <p class="kicker">${kicker}</p>
    <h2 id=${`fd-${id}-title`}>${title}</h2>
    <p class="lead">${lead}</p>
    ${body}
  </section>`;

/** Samples the --bb-tension linear() stops into an SVG path. */
const tensionCurve = () => {
  const stops = token("--bb-tension")
    .replace(/^linear\(|\)$/g, "")
    .split(",")
    .map((part) => part.trim().split(/\s+/));
  const points = stops.map(([value, at], index) => [
    at ? parseFloat(at) / 100 : index / (stops.length - 1),
    parseFloat(value),
  ]);
  const d = points
    .map(([x, y], i) => `${i ? "L" : "M"}${(x * 280 + 10).toFixed(1)} ${(110 - y * 80).toFixed(1)}`)
    .join(" ");
  return html`<svg class="fd-curve" viewBox="0 0 300 130" role="img" aria-label="Curva della molla --bb-tension: supera il valore finale del 16% e oscilla prima di fermarsi">
    ${svg`<line x1="10" x2="290" y1="30" y2="30" class="fd-curve-target"></line>
      <line x1="10" x2="290" y1="110" y2="110" class="fd-curve-axis"></line>
      <path d=${d} class="fd-curve-line"></path>`}
  </svg>`;
};

const MENU = [
  { id: "recent", label: "Più recenti" },
  { id: "popular", label: "Più popolari" },
  { id: "name", label: "Nome" },
];

export function renderFoundations(): TemplateResult {
  return html`<header class="component-header">
      <span class="kicker">Foundations</span>
      <h1>Come è fatta una bolla</h1>
      <code class="tag">--bb-*</code>
      <p class="lead">
        Material 3 resta la struttura: ruoli colore, scala tipografica, stati e
        accessibilità. Bolle ne è la pelle e la riconosci da tre segni: l'angolo
        a coda, la pellicola iridescente e lo schiocco. Tutto passa da pochi token
        in più, che puoi regolare o spegnere.
      </p>
    </header>

    <nav class="fd-index" aria-label="Indice delle foundations">
      ${[
        ["coda", "Coda"],
        ["pellicola", "Pellicola"],
        ["riflesso", "Riflesso e galleggiamento"],
        ["movimento", "Movimento"],
        ["vetro", "Vetro"],
        ["colore", "Colore"],
        ["tipografia", "Tipografia"],
        ["paletti", "Paletti"],
      ].map(
        ([id, label]) =>
          html`<a
            href=${`#fd-${id}`}
            @click=${(event: Event) => {
              event.preventDefault();
              document.getElementById(`fd-${id}`)?.scrollIntoView({ block: "start" });
            }}
            >${label}</a
          >`,
      )}
    </nav>

    ${section(
      "coda",
      "Forma",
      "La coda",
      "Ogni superficie sospesa ha tre angoli tondi e uno stretto, che punta verso l'elemento da cui è nata. Menu, tooltip e azioni del FAB calcolano l'angolo all'apertura; snackbar e card lo tengono in basso, sul lato di inizio. I bottoni restano a pillola.",
      html`<div class="fd-demo-row">
          <div class="fd-shape" style="border-radius: var(--bb-tail) var(--bb-radius) var(--bb-radius) var(--bb-radius)">
            <span>Menu sotto il bottone</span>
          </div>
          <div class="fd-shape" style="border-radius: var(--bb-radius) var(--bb-radius) var(--bb-radius) var(--bb-tail)">
            <span>Snackbar · card</span>
          </div>
          <div class="fd-live">
            <bolle-button variant="tonal" haspopup="menu" @click=${show("fd-menu")}
              >Ordina</bolle-button
            >
            <bolle-menu id="fd-menu" menu-label="Ordina per" .items=${MENU}></bolle-menu>
            <bolle-tooltip label="La coda punta qui">
              <bolle-button variant="outlined">Passa sopra</bolle-button>
            </bolle-tooltip>
          </div>
        </div>
        ${tokenTable([
          ["--bb-radius", "Raggio dei tre angoli tondi delle superfici sospese"],
          ["--bb-tail", "Angolo stretto rivolto all'origine"],
          ["--bb-card-tail", "Angolo stretto delle card"],
          ["--bb-radius-m", "Raggio di snackbar e tooltip ricco"],
          ["--bb-radius-s", "Raggio del tooltip semplice"],
        ])}`,
    )}

    ${section(
      "pellicola",
      "Materiale",
      "La pellicola",
      "Un gradiente conico tenue ricavato dal colore seed: le quattro tinte ruotano attorno alla sua tonalità, così la pellicola segue il tema dinamico. Si usa con misura: anello di focus, stato selezionato, FAB. Una sola superficie iridescente per schermata, mai come sfondo.",
      html`<div class="fd-film-strip" aria-hidden="true"></div>
        <div class="fd-film-stops">
          ${[1, 2, 3, 4].map(
            (i) =>
              html`<span><i style=${`background: var(--bb-film-${i})`}></i><code>--bb-film-${i}</code></span>`,
          )}
        </div>
        <div class="fd-demo-row">
          <div class="fd-live">
            <bolle-button>Premi Tab per il focus</bolle-button>
            <bolle-chip variant="filter" selected label="Selezionato"></bolle-chip>
            <bolle-floating-action-button label="Nuovo">+</bolle-floating-action-button>
          </div>
          <p class="fd-rule">
            L'anello iridescente è sempre doppiato da un contorno pieno: il
            significato non dipende mai dal gradiente.
          </p>
        </div>
        ${tokenTable([
          ["--bb-film", "Gradiente conico completo"],
          ["--bb-film-wash", "Velatura al 30% per il FAB"],
          ["--bb-ring-width", "Spessore dell'anello pellicola"],
          ["--bb-ring-gap", "Distanza dell'anello dal controllo"],
        ])}`,
    )}

    ${section(
      "riflesso",
      "Luce",
      "Riflesso e galleggiamento",
      "In Bolle l'elevazione si legge da ombra morbida e riflesso, non solo dal colore di superficie. Più un elemento sale, più l'ombra si allarga e prende la tinta del primario. Al passaggio del puntatore ogni pulsante mostra il riflesso della bolla sopra il proprio colore, insieme allo strato di stato M3.",
      html`<div class="fd-floats">
          ${[1, 2, 3, 4, 5].map(
            (level) =>
              html`<div class="fd-float" style=${`box-shadow: var(--bb-float-${level})`}>
                <span class="fd-float-shine" aria-hidden="true"></span>
                <code>--bb-float-${level}</code>
              </div>`,
          )}
        </div>
        <div class="fd-demo-row">
          <div class="fd-live">
            <bolle-button>Filled</bolle-button>
            <bolle-button variant="tonal">Tonal</bolle-button>
            <bolle-button variant="accent">Accento</bolle-button>
            <bolle-button variant="outlined">Outlined</bolle-button>
          </div>
          <p class="fd-rule">Passa sopra i pulsanti: il riflesso compare in alto a destra.</p>
        </div>
        ${tokenTable([
          ["--bb-highlight", "Riflesso in alto a destra, all'hover e sul FAB"],
          ["--bb-float-2", "Menu, tooltip ricco, card elevate"],
          ["--bb-float-3", "Snackbar, FAB"],
          ["--bb-float-5", "Il livello più alto, con tinta del primario"],
        ])}`,
    )}

    ${section(
      "movimento",
      "Movimento",
      "Lo schiocco",
      "Molle con tensione superficiale. Alla pressione il pulsante si schiaccia a volume costante; al rilascio oscilla con una molla poco smorzata. Le superfici si gonfiano dall'angolo a coda e scoppiano alla chiusura. Le dialog, una volta aperte, galleggiano in modo quasi impercettibile.",
      html`<div class="fd-motion">
          <figure>
            ${tensionCurve()}
            <figcaption><code>--bb-tension</code> · ${token("--bb-tension-duration")}</figcaption>
          </figure>
          <ul class="fd-moves">
            <li><strong>Pressione</strong> · scala ${token("--bb-squish").replace(" ", " × ")} in ${token("--bb-squish-duration")}</li>
            <li><strong>Rilascio</strong> · ritorno con <code>--bb-tension</code></li>
            <li><strong>Comparsa</strong> · si gonfia dall'angolo a coda in ${token("--bb-inflate-duration")}</li>
            <li><strong>Chiusura</strong> · cresce del 5% e sfuma in ${token("--bb-pop-duration")}</li>
            <li><strong>Galleggiamento</strong> · le dialog oscillano di ${token("--bb-bob-distance")} ogni ${token("--bb-bob-duration")}</li>
            <li><strong>Indicatori</strong> · nei pulsanti segmentati l'indicatore scorre come una goccia</li>
          </ul>
        </div>
        <div class="fd-demo-row">
          <div class="fd-live">
            <bolle-button size="medium">Premi e rilascia</bolle-button>
            <bolle-button variant="tonal" @click=${show("fd-dialog")}>Apri una dialog</bolle-button>
            <bolle-segmented-buttons
              label="Periodo"
              .items=${[
                { id: "day", label: "Giorno" },
                { id: "week", label: "Settimana" },
                { id: "month", label: "Mese" },
              ]}
              value="day"
            ></bolle-segmented-buttons>
            <bolle-loading-indicator label="Caricamento"></bolle-loading-indicator>
          </div>
        </div>
        <bolle-dialog id="fd-dialog" label="Una dialog che galleggia" close-label="Chiudi">
          <p>Guarda il bordo: la dialog sale e scende di un paio di pixel.</p>
        </bolle-dialog>
        <p class="note">
          Con <code>prefers-reduced-motion</code> restano solo le dissolvenze: niente
          dondolio, scoppio né galleggiamento.
        </p>`,
    )}

    ${section(
      "vetro",
      "Materiale",
      "Vetro",
      "Solo gli strati sospesi sono traslucidi: menu e azioni del FAB. Sotto c'è sempre una versione opaca di riserva, che si attiva se il browser non supporta backdrop-filter, sui dispositivi lenti e con prefers-reduced-transparency.",
      tokenTable([
        ["--bb-glass-opacity", "Opacità del fondo traslucido"],
        ["--bb-glass-blur", "Sfocatura dello sfondo"],
      ]),
    )}

    ${section(
      "colore",
      "Colore",
      "Colore",
      "Il colore funzionale arriva dai ruoli tonali di M3, generati dal seed #5B4CF0 con npm run colors. La pellicola è un livello decorativo a parte. L'accento Scoppio è riservato a call to action rare.",
      html`<div class="fd-swatches">
        ${[
          ["primary", "on-primary", "Bolla · primario"],
          ["primary-container", "on-primary-container", "Lilla · container"],
          ["surface", "on-surface", "Schiuma · superficie"],
          ["inverse-surface", "inverse-on-surface", "Inchiostro"],
          ["secondary-container", "on-secondary-container", "Nebbia · secondario"],
        ].map(
          ([bg, fg, label]) =>
            html`<div class="fd-swatch" style=${`background: var(--md-sys-color-${bg}); color: var(--md-sys-color-${fg})`}>
              <strong>${label}</strong><code>${token(`--md-sys-color-${bg}`)}</code>
            </div>`,
        )}
        <div class="fd-swatch" style="background: var(--bb-accent); color: var(--bb-on-accent)">
          <strong>Scoppio · accento</strong><code>${token("--bb-accent")}</code>
        </div>
      </div>`,
    )}

    ${section(
      "tipografia",
      "Tipografia",
      "Tipografia",
      "La scala di M3 non cambia: cambiano solo le famiglie. Fredoka 600 per display e titoli dai 32 px in su, Figtree per testo e controlli, JetBrains Mono per il codice.",
      html`<div class="fd-type">
        <p class="fd-type-display">Aa Bolle</p>
        <p class="fd-type-plain">Componenti morbidi, regole rigorose.</p>
        <p><code class="fd-type-code">&lt;bolle-button variant="filled"&gt;Inizia&lt;/bolle-button&gt;</code></p>
      </div>
      ${tokenTable([
        ["--md-ref-typeface-display", "Display e headline large"],
        ["--md-ref-typeface-plain", "Testo e controlli"],
        ["--md-ref-typeface-code", "Codice"],
      ])}`,
    )}

    ${section(
      "paletti",
      "Regole",
      "Paletti",
      "Tre vincoli tengono insieme carattere e accessibilità.",
      html`<ul class="fd-rules">
        <li>${bolleMark(20)}<span><strong>Il colore resta M3.</strong> I ruoli tonali garantiscono il contrasto; l'iridescenza non indica mai uno stato da sola.</span></li>
        <li>${bolleMark(20)}<span><strong>Movimento rispettoso.</strong> Con movimento ridotto solo dissolvenze.</span></li>
        <li>${bolleMark(20)}<span><strong>Leggera quando serve.</strong> Su dispositivi lenti si spengono sfocatura e filtro goccia.</span></li>
      </ul>`,
    )}`;
}

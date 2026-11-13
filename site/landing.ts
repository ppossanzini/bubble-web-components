import { html, type TemplateResult } from "lit";
import type { BolleItem } from "../src/index.js";
import { ti } from "../demo/icons.js";
import { THEME_PRESETS, themePreset } from "./tokens.js";

export interface LandingContext {
  presetId: string;
  applyPreset: (id: string) => void;
  navigate: (route: string) => void;
  copy: (text: string) => void;
}

const INSTALL = "npm install @bolle/web-components";
const SEEDS = THEME_PRESETS.slice(0, 4);

/** The tailed bolle mark; `small` drops the film, as the identity requires below 24px. */
export const bolleMark = (size: number, label = "") =>
  html`<span
    class="bb-mark ${size < 24 ? "bb-mark-small" : ""}"
    style="--mark-size: ${size}px"
    role=${label ? "img" : "presentation"}
    aria-label=${label || undefined}
    ><span class="bb-mark-film"></span><span class="bb-mark-core"></span
    ><span class="bb-mark-shine"></span
  ></span>`;

export const bolleLogo = (size = 32) =>
  html`<span class="bb-logo">${bolleMark(size)}<span class="bb-wordmark">bolle</span></span>`;

const scrollTo = (id: string) => (event: Event) => {
  event.preventDefault();
  document.getElementById(id)?.scrollIntoView({ block: "start" });
};

const NAV_ITEMS: BolleItem[] = [
  { id: "home", label: "Home", icon: ti("home") },
  { id: "search", label: "Cerca", icon: ti("search") },
  { id: "favourites", label: "Preferiti", icon: ti("heart") },
];

const gesture = (title: string, text: string, figure: TemplateResult) =>
  html`<article class="landing-gesture">
    ${figure}
    <h3>${title}</h3>
    <p>${text}</p>
  </article>`;

const sample = (name: string, body: TemplateResult, note = "") =>
  html`<article class="landing-sample">
    <p class="landing-mono">${name}</p>
    <div class="landing-sample-body">${body}</div>
    ${note ? html`<p class="landing-note">${note}</p>` : ""}
  </article>`;

export function renderLanding(ctx: LandingContext): TemplateResult {
  const preset = themePreset(ctx.presetId);
  return html`<div class="landing">
    <header class="landing-header landing-wrap">
      <a class="landing-brand" href="#/" aria-label="bolle, presentazione"
        >${bolleLogo(34)}</a
      >
      <nav class="landing-nav" aria-label="Principale">
        <a href="#/overview">Componenti</a>
        <a href="#/foundations">Foundations</a>
        <a href="#temi" @click=${scrollTo("temi")}>Temi</a>
        <a href="#/tokens">Token</a>
        <bolle-button variant="filled" class="landing-ink" @click=${scrollTo("codice")}
          >Inizia</bolle-button
        >
      </nav>
    </header>

    <section class="landing-hero landing-wrap" aria-labelledby="landing-title">
      <div class="landing-hero-text">
        <p class="landing-film-pill"><span>Ispirata a Material 3 · open source</span></p>
        <h1 id="landing-title">Interfacce con tensione superficiale.</h1>
        <p class="landing-lead">
          Bolle è una libreria di componenti che prende i token, la struttura e
          l'accessibilità di Material 3 e li avvolge in una pelle nuova: forme a
          fumetto, una pellicola iridescente e un movimento che si schiaccia e
          scoppia.
        </p>
        <div class="landing-actions">
          <bolle-button size="medium" @click=${scrollTo("codice")}>Inizia ora</bolle-button>
          <bolle-button
            size="medium"
            variant="outlined"
            @click=${() => ctx.navigate("overview")}
            >Guarda i componenti</bolle-button
          >
        </div>
        <button
          type="button"
          class="landing-install"
          aria-label="Copia il comando di installazione"
          @click=${() => ctx.copy(INSTALL)}
        >
          <code>$ ${INSTALL}</code>${ti("copy")}
        </button>
      </div>

      <div class="landing-stage" aria-label="Esempio di componenti Bolle">
        <span class="landing-orb" aria-hidden="true"></span>
        <span class="landing-ring" aria-hidden="true"></span>
        <bolle-card variant="elevated" class="landing-float landing-notify" label="Preferenze di notifica">
          <div class="landing-notify-head">
            <bolle-switch label="Notifiche" checked></bolle-switch>
          </div>
          <div class="landing-chips">
            <bolle-chip variant="filter" selected label="Email"></bolle-chip>
            <bolle-chip variant="filter" label="Push"></bolle-chip>
            <bolle-chip variant="filter" label="SMS"></bolle-chip>
          </div>
          <bolle-slider label="Volume" value="62"></bolle-slider>
        </bolle-card>
        <div class="landing-menu" aria-hidden="true">
          <span class="is-selected">Duplica</span><span>Rinomina</span><span>Sposta in…</span>
        </div>
        <div class="landing-snack" aria-hidden="true">
          <span>Salvato.</span><strong>Annulla</strong>
        </div>
        <bolle-floating-action-button class="landing-fab" label="Nuovo elemento"
          >${ti("plus")}</bolle-floating-action-button
        >
      </div>
    </section>

    <section class="landing-band" aria-labelledby="landing-gestures">
      <div class="landing-wrap landing-stack">
        <div class="landing-split-head">
          <h2 id="landing-gestures">Tre gesti che rendono una bolla una bolla.</h2>
          <p>Sotto c'è Material 3, al completo. Sopra, tre regole applicate con coerenza a ogni componente.</p>
        </div>
        <div class="landing-grid-3">
          ${gesture(
            "La coda",
            "Ogni superficie sospesa ha un angolo stretto che indica da dove è nata. Menu, tooltip e snackbar ti dicono sempre a chi appartengono.",
            html`<span class="landing-glyph-tail" aria-hidden="true"></span>`,
          )}
          ${gesture(
            "La pellicola",
            "Un'iridescenza che deriva dal tuo colore seed e compare solo dove conta: focus, selezione, l'azione principale.",
            html`<span class="landing-glyph-film" aria-hidden="true"><span></span></span>`,
          )}
          ${gesture(
            "Lo schiocco",
            "Molle con tensione superficiale: si schiaccia, oscilla, si gonfia, scoppia. E si ferma del tutto se l'utente preferisce meno movimento.",
            html`<span class="landing-glyph-pop" aria-hidden="true"><span></span><span></span><span></span></span>`,
          )}
        </div>
      </div>
    </section>

    <section id="componenti" class="landing-wrap landing-stack landing-section" aria-labelledby="landing-components">
      <h2 id="landing-components">Tutti i componenti di M3. Con più aria dentro.</h2>
      <div class="landing-grid-auto">
        ${sample(
          "Button",
          html`<div class="landing-row">
            <bolle-button>Filled</bolle-button>
            <bolle-button variant="tonal">Tonal</bolle-button>
            <bolle-button variant="outlined">Outlined</bolle-button>
          </div>`,
        )}
        ${sample(
          "Text field",
          html`<bolle-text-field variant="outlined" label="Email" type="email"></bolle-text-field>`,
        )}
        ${sample(
          "Navigation bar",
          html`<bolle-navigation-bar
            label="Esempio di navigazione"
            .items=${NAV_ITEMS}
            value="home"
          ></bolle-navigation-bar>`,
        )}
        ${sample(
          "Segmented button",
          html`<bolle-segmented-buttons
            label="Periodo"
            .items=${[
              { id: "day", label: "Giorno" },
              { id: "week", label: "Settimana" },
              { id: "month", label: "Mese" },
            ]}
            value="day"
          ></bolle-segmented-buttons>`,
        )}
        ${sample(
          "Dialog",
          html`<div class="landing-dialog">
            <p class="landing-dialog-title">Eliminare la bozza?</p>
            <p>Non potrai recuperarla.</p>
            <div class="landing-row landing-end">
              <bolle-button variant="text">Annulla</bolle-button>
              <bolle-button>Elimina</bolle-button>
            </div>
          </div>`,
        )}
        ${sample(
          "Loading indicator",
          html`<bolle-loading-indicator label="Caricamento"></bolle-loading-indicator>`,
        )}
      </div>
    </section>

    <section id="temi" class="landing-ink-band" aria-labelledby="landing-themes">
      <div class="landing-wrap landing-columns">
        <div class="landing-stack">
          <h2 id="landing-themes">Gonfia un tema da un solo colore.</h2>
          <p>
            Il colore dinamico di Material 3 genera i ruoli tonali; Bolle ne
            ricava anche la pellicola. Scegli un seed e guarda cosa cambia: il
            tema vale per tutto il sito.
          </p>
          <bolle-segmented-buttons
            class="landing-seeds"
            label="Colore seed"
            .items=${SEEDS.map((seed) => ({ id: seed.id, label: seed.label }))}
            .value=${preset.id}
            @change=${(event: Event) =>
              ctx.applyPreset((event as CustomEvent<{ value: string }>).detail.value)}
          ></bolle-segmented-buttons>
        </div>
        <bolle-card variant="elevated" class="landing-theme-card" label=${`Tema ${preset.label}`}>
          <div class="landing-theme-head">
            ${bolleMark(52)}
            <div>
              <strong>Tema ${preset.label}</strong>
              <p class="landing-mono">seed ${preset.seed}</p>
            </div>
          </div>
          <div class="landing-chips">
            <bolle-chip variant="filter" selected label="Attivo"></bolle-chip>
            <bolle-chip variant="filter" label="In pausa"></bolle-chip>
          </div>
          <bolle-progress-indicator label="Avanzamento" value="58"></bolle-progress-indicator>
          <div class="landing-row">
            <bolle-button>Conferma</bolle-button>
            <bolle-button variant="tonal">Più tardi</bolle-button>
          </div>
        </bolle-card>
      </div>
    </section>

    <section id="codice" class="landing-wrap landing-columns landing-section" aria-labelledby="landing-code">
      <div class="landing-stack">
        <h2 id="landing-code">Se conosci M3, conosci già Bolle.</h2>
        <p>
          Stessi nomi dei componenti, stessi token di colore e tipografia. Il
          carattere passa da pochi token in più, che puoi regolare o spegnere.
        </p>
        <ul class="landing-points">
          <li><strong>Accessibile per costruzione</strong> · contrasti dei ruoli tonali M3, focus sempre visibile.</li>
          <li><strong>Movimento rispettoso</strong> · prefers-reduced-motion spegne dondolio e scoppio.</li>
          <li><strong>Leggera quando serve</strong> · sfocature e trasparenze si disattivano su dispositivi lenti.</li>
        </ul>
      </div>
      <pre class="landing-code"><code><span class="c-comment">/* tema.css */</span>
:root {
  --md-sys-color-primary: <span class="c-a">${preset.seed}</span>;
  --bb-film: <span class="c-b">conic-gradient(…)</span>;
  --bb-tail: <span class="c-c">6px</span>;
  --bb-pop-duration: <span class="c-c">180ms</span>;
}

&lt;<span class="c-a">bolle-menu</span> menu-label="Ordina"&gt;&lt;/<span class="c-a">bolle-menu</span>&gt;</code></pre>
    </section>

    <section class="landing-wrap landing-section-end">
      <div class="landing-cta">
        <span class="landing-cta-orb" aria-hidden="true"></span>
        <h2>Soffia la tua prima interfaccia.</h2>
        <p>Installa il pacchetto, scegli un seed, e i tuoi componenti M3 prendono forma.</p>
        <bolle-button variant="elevated" size="medium" @click=${() => ctx.copy(INSTALL)}
          >Copia il comando</bolle-button
        >
      </div>
    </section>
  </div>`;
}

import { LitElement, html, nothing, svg, type TemplateResult } from "lit";
import type {
  BubbleItem,
  BubbleNavigationDrawer,
  BubbleSideSheet,
  BubbleSnackbar,
} from "../src/index.js";
import { ti } from "../demo/icons.js";
import {
  entries,
  entryByTag,
  groups,
  initialState,
  type Control,
  type Entry,
  type PreviewContext,
  type State,
} from "./catalog.js";
import { buildReact, buildVue } from "./codegen.js";
import "./docs-color.js";
import "./docs-select.js";
import {
  componentTokenUsage,
  tokenDefault,
  activeTokenValue,
  type ComponentTokenUsage,
} from "./usage.js";
import { componentQuotes, shortTokenName, type Quote } from "./quotes.js";
import {
  applyTokens,
  defaultTokenSet,
  hctScheme,
  presetTokenSet,
  themePreset,
  tokensCss,
  COLOR_ROLE_GROUPS,
  COLOR_ROLES,
  FONT_KEYS,
  SHAPE_TOKENS,
  DEFAULT_THEME_PRESET,
  THEME_PRESETS,
  DENSITY_PRESETS,
  densityPreset,
  type Density,
  type ThemeName,
  type TokenSet,
} from "./tokens.js";

const GROUP_PREFIX = "group:";

export class DocsApp extends LitElement {
  static properties = {
    route: { state: true },
    states: { state: true },
    expanded: { state: true },
    codeTab: { state: true },
    dark: { state: true },
    rtl: { state: true },
    palettes: { state: true },
    contrast: { state: true },
    presetId: { state: true },
    density: { state: true },
    usage: { state: true },
    usageTag: { state: true },
    details: { state: true },
    quotes: { state: true },
    quoteLines: { state: true },
    hoverToken: { state: true },
  };

  declare route: string;
  declare codeTab: "vue" | "react";
  declare dark: boolean;
  declare rtl: boolean;
  declare expanded: string[];
  declare states: Record<string, State>;
  declare palettes: Record<ThemeName, TokenSet>;
  declare contrast: number;
  declare presetId: string;
  declare density: Density;
  declare usage: ComponentTokenUsage | null;
  declare usageTag: string;
  declare details: Record<string, Record<string, string>>;
  declare quotes: boolean;
  declare quoteLines: Quote[];
  declare hoverToken: string;
  private usageRetry = 0;
  private quoteObserver?: ResizeObserver;

  constructor() {
    super();
    this.route = "overview";
    this.codeTab = "vue";
    this.dark = false;
    this.rtl = false;
    this.expanded = groups
      .filter(
        (group) => entries.filter((entry) => entry.group === group).length > 1,
      )
      .map((group) => `${GROUP_PREFIX}${group}`);
    this.states = Object.fromEntries(
      entries.map((entry) => [entry.tag, initialState(entry)]),
    );
    this.palettes = {
      light: defaultTokenSet("light"),
      dark: defaultTokenSet("dark"),
    };
    this.contrast = 0;
    this.presetId = DEFAULT_THEME_PRESET.id;
    this.density = "airy";
    this.usage = null;
    this.usageTag = "";
    this.details = {};
    this.quotes = true;
    this.quoteLines = [];
    this.hoverToken = "";
  }

  private ctx: PreviewContext = {
    show: (id, event) => {
      const host = this.querySelector<{ show?: (opener?: HTMLElement) => void }>(
        `#${id}`,
      );
      host?.show?.(event.currentTarget as HTMLElement);
    },
    close: (id, value) => {
      const host = this.querySelector<{ close?: (value?: string) => void }>(
        `#${id}`,
      );
      host?.close?.(value);
    },
    snackbar: (id, message) => {
      this.querySelector<BubbleSnackbar>(`#${id}`)?.show(message);
    },
  };

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.readHash();
    applyTokens(this.tokenSet, this.density);
    window.addEventListener("hashchange", this.readHash);
  }

  disconnectedCallback() {
    window.removeEventListener("hashchange", this.readHash);
    this.quoteObserver?.disconnect();
    this.quoteObserver = undefined;
    super.disconnectedCallback();
  }

  protected updated() {
    if (this.isTokens || this.isOverview) return;
    const element = this.querySelector(
      `.preview-surface ${this.entry.tag}`,
    );
    if (!element) return;
    const root = element.shadowRoot;
    const ready = !!root && root.childElementCount > 0;
    const usage = componentTokenUsage(
      this.entry.tag,
      ready ? element : undefined,
    );
    if (
      this.usageTag !== this.entry.tag ||
      JSON.stringify(this.usage) !== JSON.stringify(usage)
    ) {
      this.usage = usage;
      this.usageTag = this.entry.tag;
    }
    if (!ready && this.usageRetry < 5) {
      this.usageRetry += 1;
      setTimeout(() => this.requestUpdate(), 60);
    }
    this.scheduleQuotes();
    const surface = this.querySelector<HTMLElement>(".preview-surface");
    if (surface) {
      this.quoteObserver?.disconnect();
      this.quoteObserver ??= new ResizeObserver(() => this.scheduleQuotes());
      this.quoteObserver.observe(surface);
    }
  }

  private quotePending = false;

  private scheduleQuotes() {
    if (this.quotePending) return;
    this.quotePending = true;
    requestAnimationFrame(() => {
      this.quotePending = false;
      this.refreshQuotes();
    });
  }

  private refreshQuotes() {
    const surface = this.querySelector<HTMLElement>(".preview-surface");
    const element = surface?.querySelector(this.entry.tag);
    if (!surface || !element || !this.quotes || !this.usage) {
      if (this.quoteLines.length > 0) this.quoteLines = [];
      return;
    }
    const box = surface.getBoundingClientRect();
    const origin = {
      left: box.left + surface.clientLeft,
      top: box.top + surface.clientTop,
      width: surface.clientWidth,
      height: surface.clientHeight,
    };
    const allowed = new Set(this.usage.details.filter(this.isSizeToken));
    const next = componentQuotes(this.entry.tag, element, origin, allowed);
    if (JSON.stringify(next) !== JSON.stringify(this.quoteLines))
      this.quoteLines = next;
  }

  private readHash = () => {
    const tag = location.hash.replace(/^#\/?/, "");
    if (tag === "tokens" || tag === "overview" || entryByTag(tag)) {
      if (this.route !== tag) {
        this.usageRetry = 0;
        this.hoverToken = "";
        this.querySelector<BubbleSideSheet>("#site-config")?.close();
      }
      this.route = tag;
    }
  };

  private get isTokens(): boolean {
    return this.route === "tokens";
  }

  private get isOverview(): boolean {
    return this.route === "overview";
  }

  private get activeTheme(): ThemeName {
    return this.dark ? "dark" : "light";
  }

  private get tokenSet(): TokenSet {
    return this.palettes[this.activeTheme];
  }

  private get entry(): Entry {
    return entryByTag(this.route) ?? entries[0];
  }

  private get state(): State {
    return this.states[this.entry.tag] ?? initialState(this.entry);
  }

  private setProp(prop: string, value: unknown) {
    const entry = this.entry;
    this.states = {
      ...this.states,
      [entry.tag]: { ...this.state, [prop]: value },
    };
  }

  private navigate(tag: string) {
    if (location.hash === `#/${tag}`) this.route = tag;
    else location.hash = `#/${tag}`;
  }

  private navItems(): BubbleItem[] {
    const families = groups
      .map((group) => ({
        group,
        list: entries.filter((entry) => entry.group === group),
      }))
      .filter((family) => family.list.length > 0);

    return [
      { id: "overview", label: "Components overview" },
      ...families.map((family) =>
        family.list.length === 1
          ? { id: family.list[0].tag, label: family.group }
          : {
              id: `${GROUP_PREFIX}${family.group}`,
              label: family.group,
              items: family.list.map((entry) => ({
                id: entry.tag,
                label: entry.navLabel ?? entry.title,
              })),
            },
      ),
    ];
  }

  private onNavigate = (event: Event) => {
    const id = (event as CustomEvent<{ value: string }>).detail.value;
    if (!id.startsWith(GROUP_PREFIX)) this.navigate(id);
  };

  private onExpand = (event: Event) => {
    const { id, expanded } = (
      event as CustomEvent<{ id: string; expanded: boolean }>
    ).detail;
    this.expanded = expanded
      ? [...this.expanded, id]
      : this.expanded.filter((value) => value !== id);
  };

  private onCodeTab = (event: Event) => {
    this.codeTab = (event as CustomEvent<{ value: string }>).detail.value as
      | "vue"
      | "react";
  };

  private toggleTheme = () => {
    this.dark = !this.dark;
    document.documentElement.dataset.theme = this.dark ? "dark" : "light";
    applyTokens(this.tokenSet, this.density);
  };

  private updateTokens(update: (set: TokenSet) => TokenSet) {
    const theme = this.activeTheme;
    const next = update(this.palettes[theme]);
    this.palettes = { ...this.palettes, [theme]: next };
    applyTokens(next, this.density);
  }

  private setDensity = (event: Event) => {
    const label = (event as CustomEvent<{ value: string }>).detail.value;
    const preset = DENSITY_PRESETS.find((item) => item.label === label);
    if (!preset) return;
    this.density = preset.id;
    applyTokens(this.tokenSet, this.density);
  };

  private setColor(token: string, value: string) {
    this.updateTokens((set) => ({
      ...set,
      colors: { ...set.colors, [token]: value },
    }));
  }

  private setShape(token: string, value: number) {
    this.updateTokens((set) => ({
      ...set,
      shapes: { ...set.shapes, [token]: value },
    }));
  }

  private setDetail(tag: string, token: string, value: string) {
    const trimmed = value.trim();
    const current = this.details[tag] ?? {};
    const next = { ...current };
    if (trimmed) next[token] = trimmed;
    else delete next[token];
    this.details = { ...this.details, [tag]: next };
  }

  private resetDetails(tag: string) {
    if (!this.details[tag]) return;
    const next = { ...this.details };
    delete next[tag];
    this.details = next;
  }

  private get detailsCss(): string {
    return Object.entries(this.details)
      .filter(([, values]) => Object.keys(values).length > 0)
      .map(
        ([tag, values]) =>
          `${tag} {\n${Object.entries(values)
            .map(([token, value]) => `  ${token}: ${value};`)
            .join("\n")}\n}`,
      )
      .join("\n");
  }

  private detailValue(tag: string, token: string): string {
    const override = this.details[tag]?.[token];
    if (override !== undefined) return override;
    return activeTokenValue(token) || tokenDefault(token);
  }

  private setFont(kind: "brandFont" | "plainFont", value: string) {
    this.updateTokens((set) => ({ ...set, [kind]: value }));
  }

  private setBaseSize(value: number) {
    this.updateTokens((set) => ({ ...set, baseSize: value }));
  }

  private setContrast(value: string) {
    this.contrast = Number(value);
  }

  private generateHct = () => {
    const colors = hctScheme(
      this.tokenSet.colors.primary,
      this.activeTheme,
      this.contrast,
    );
    this.updateTokens((set) => ({ ...set, colors }));
  };

  private applyPreset = (id: string) => {
    this.presetId = id;
    this.palettes = {
      light: presetTokenSet("light", id),
      dark: presetTokenSet("dark", id),
    };
    applyTokens(this.tokenSet, this.density);
  };

  private resetTokens = () => {
    const next = presetTokenSet(this.activeTheme, this.presetId);
    this.palettes = { ...this.palettes, [this.activeTheme]: next };
    applyTokens(next, this.density);
  };

  private toggleRtl = () => {
    this.rtl = !this.rtl;
    document.documentElement.dir = this.rtl ? "rtl" : "ltr";
  };

  private openDrawer = (event: Event) => {
    this.querySelector<BubbleNavigationDrawer>("#site-drawer")?.show(
      event.currentTarget as HTMLElement,
    );
  };

  private openConfig = async (event: Event) => {
    const sheet = this.querySelector<BubbleSideSheet>("#site-config");
    if (!sheet) return;
    await sheet.show(event.currentTarget as HTMLElement);
    // The sheet keeps the scroll position of the previous visit, which lands on
    // the token list and hides theme and parameters.
    const dialog = sheet.shadowRoot?.querySelector<HTMLDialogElement>("dialog");
    if (dialog) dialog.scrollTop = 0;
  };

  private closeDrawer = () => {
    this.querySelector<BubbleNavigationDrawer>("#site-drawer")?.close();
  };

  private drawerNavigate = (event: Event) => {
    this.onNavigate(event);
    this.closeDrawer();
  };

  private reset(entry: Entry) {
    this.states = {
      ...this.states,
      [entry.tag]: initialState(entry),
    };
  }

  private async copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } finally {
      this.querySelector<BubbleSnackbar>("#site-snackbar")?.show(
        "Codice copiato",
      );
    }
  }

  private renderControl(
    control: Control,
    state: State,
  ): TemplateResult {
    const value = state[control.prop];
    switch (control.kind) {
      case "bool":
        return html`<bubble-switch
          .label=${control.label}
          ?checked=${Boolean(value)}
          @change=${(event: Event) =>
            this.setProp(
              control.prop,
              (event as CustomEvent<{ checked: boolean }>).detail.checked,
            )}
        ></bubble-switch>`;
      case "range":
        return html`<bubble-slider
          .label=${control.label}
          .min=${control.min}
          .max=${control.max}
          .step=${control.step ?? 1}
          .value=${String(value ?? control.default)}
          show-value
          @value-input=${(event: Event) =>
            this.setProp(
              control.prop,
              (event as CustomEvent<{ value: string }>).detail.value,
            )}
        ></bubble-slider>`;
      case "text":
        return html`<bubble-text-field
          .label=${control.label}
          .value=${String(value ?? "")}
          placeholder=${control.placeholder ?? ""}
          @value-input=${(event: Event) =>
            this.setProp(
              control.prop,
              (event as CustomEvent<{ value: string }>).detail.value,
            )}
        ></bubble-text-field>`;
      case "longtext":
        return html`<bubble-text-field
          .label=${control.label}
          multiline
          .rows=${control.rows ?? 3}
          .value=${String(value ?? "")}
          @value-input=${(event: Event) =>
            this.setProp(
              control.prop,
              (event as CustomEvent<{ value: string }>).detail.value,
            )}
        ></bubble-text-field>`;
      case "enum":
        if (control.options.length <= 4)
          return html`<bubble-segmented-buttons
            .label=${control.label}
            .items=${control.options.map((option) => ({
              id: option,
              label: option,
            }))}
            .value=${String(value ?? control.default)}
            @change=${(event: Event) =>
              this.setProp(
                control.prop,
                (event as CustomEvent<{ value: string }>).detail.value,
              )}
          ></bubble-segmented-buttons>`;
        return html`<div class="config-field">
          <span class="config-label">${control.label}</span>
          <docs-select
            .label=${control.label}
            .value=${String(value ?? control.default)}
            .options=${control.options}
            @change=${(event: Event) =>
              this.setProp(
                control.prop,
                (event as CustomEvent<{ value: string }>).detail.value,
              )}
          ></docs-select>
        </div>`;
    }
  }

  private renderOverview(): TemplateResult {
    const families = groups
      .map((group) => ({
        group,
        list: entries.filter((entry) => entry.group === group),
      }))
      .filter((family) => family.list.length > 0);

    return html`<header class="component-header">
        <span class="kicker">Catalogo</span>
        <h1>Components overview</h1>
        <code class="tag">${entries.length} componenti</code>
        <p class="lead">
          Le famiglie seguono l'ordine e il raggruppamento della overview
          Material 3. Le famiglie con più componenti sono espandibili nella
          navigazione.
        </p>
      </header>

      <div class="overview-grid">
        ${families.map(
          (family) => html`<bubble-card
            variant="outlined"
            href=${`#/${family.list[0].tag}`}
            label=${family.group}
          >
            <span class="overview-tag"
              >${family.list.length}
              ${family.list.length === 1 ? "componente" : "componenti"}</span
            >
            <h3>${family.group}</h3>
            <p>
              ${family.list
                .map((entry) => entry.navLabel ?? entry.title)
                .join(" · ")}
            </p>
          </bubble-card>`,
        )}
      </div>`;
  }

  private renderTokensPreview(): TemplateResult {
    return html`<div class="token-preview">
      <bubble-app-bar label="Anteprima" subtitle="Token applicati"></bubble-app-bar>
      <div class="token-type">
        <p class="type-display">Aa</p>
        <h2>Titolo di sezione</h2>
        <p>
          Testo di esempio per valutare carattere, interlinea e colore su una
          superficie reale.
        </p>
      </div>
      <div class="token-row">
        <bubble-button variant="filled">Salva</bubble-button>
        <bubble-button variant="tonal">Anteprima</bubble-button>
        <bubble-button variant="outlined">Annulla</bubble-button>
        <bubble-chip variant="filter" selected label="Filtro"></bubble-chip>
      </div>
      <div class="token-fields">
        <bubble-text-field
          label="Titolo"
          value="Documento di esempio"
          supporting-text="Testo di supporto"
        ></bubble-text-field>
        <bubble-switch label="Notifiche" checked></bubble-switch>
      </div>
      <bubble-progress-indicator label="Avanzamento" value="60"></bubble-progress-indicator>
      <bubble-card variant="outlined" label="Scheda di esempio">
        <h3>Superficie</h3>
        <p>Forma, colore e tipografia applicati a una scheda.</p>
      </bubble-card>
    </div>`;
  }

  private renderThemeSelect(): TemplateResult {
    return html`<div class="config-field">
      <span class="config-label">Schema colore</span>
      <docs-select
        label="Tema"
        .options=${THEME_PRESETS.map((preset) => preset.label)}
        .value=${themePreset(this.presetId).label}
        @change=${(event: Event) => {
          const label = (event as CustomEvent<{ value: string }>).detail.value;
          const preset = THEME_PRESETS.find((item) => item.label === label);
          if (preset) this.applyPreset(preset.id);
        }}
      ></docs-select>
    </div>`;
  }

  private renderDensitySelect(): TemplateResult {
    return html`<div class="config-field">
      <span class="config-label">Densità</span>
      <docs-select
        label="Template"
        .options=${DENSITY_PRESETS.map((preset) => preset.label)}
        .value=${densityPreset(this.density).label}
        @change=${this.setDensity}
      ></docs-select>
    </div>`;
  }

  private isSizeToken = (token: string) =>
    /(padding|margin|gap|space|inset|height|width|size|target|between|leading|trailing|min-|max-)/.test(
      token,
    ) && !/(font|tracking|corner|radius)/.test(token);

  /** Colour shared by a dimension row and the matching measurement line. */
  private quoteColor(token: string): string {
    if (!this.usage) return "";
    const sizes = this.usage.details.filter(this.isSizeToken);
    const index = sizes.indexOf(token);
    if (index < 0) return "";
    // Golden angle keeps neighbouring tokens far apart in hue.
    const hue = (index * 137.5) % 360;
    return `hsl(${Math.round(hue)} 58% 42%)`;
  }
  /** Number of the measurement line drawn for a token, if the preview has one. */
  private quoteNumber(token: string): number {
    const quote = this.quoteLines.find((line) => line.token === token);
    return quote?.index ?? 0;
  }

  private renderSizePanel(): TemplateResult | typeof nothing {
    if (this.usageTag !== this.entry.tag || !this.usage) return nothing;
    const tag = this.entry.tag;
    const sizes = this.usage.details.filter(this.isSizeToken);
    if (sizes.length === 0) return nothing;
    // Same order as the numbers on the canvas, unmeasured tokens last.
    const ordered = [...sizes].sort((a, b) => {
      const left = this.quoteNumber(a) || 999;
      const right = this.quoteNumber(b) || 999;
      return left - right || a.localeCompare(b);
    });
    return html`<aside class="panel size-panel" aria-label="Token di dimensione">
      <div class="section-head">
        <h2>Dimensioni</h2>
        <bubble-button
          variant="text"
          aria-pressed=${this.quotes ? "true" : "false"}
          @click=${this.toggleQuotes}
          >${this.quotes ? "Nascondi quote" : "Mostra quote"}</bubble-button
        >
      </div>
      <span class="hint">Dichiarato · attivo</span>
      <div class="measure-table">
        ${ordered.map((token) => this.renderTokenRow(tag, token))}
      </div>
      <p class="usage-note">
        Token applicati a <code>&lt;${tag}&gt;</code>: la modifica vale per tutti
        gli esempi del componente. Ogni token ha lo stesso colore della sua quota
        nell'anteprima; varianti, colori e tipografia sono nel pannello
        <strong>Configura</strong>.
      </p>
    </aside>`;
  }

  private toggleQuotes = () => {
    this.quotes = !this.quotes;
    this.scheduleQuotes();
  };

  private renderQuotes(): TemplateResult {
    const active = this.hoverToken;
    const targets = this.quoteLines.filter(
      (quote) => active && quote.token === active,
    );
    return svg`<svg
      class="measure-quotes"
      aria-hidden="true"
      focusable="false"
    >
      ${targets.map(
        (quote) => svg`<rect
          class="quote-target"
          style=${`--quote-color:${this.quoteColor(quote.token)}`}
          x=${quote.box.x - 2}
          y=${quote.box.y - 2}
          width=${quote.box.width + 4}
          height=${quote.box.height + 4}
          rx=${6}
        />`,
      )}
      ${this.quoteLines.map(
        (quote) => svg`<g
          class="quote ${quote.inside ? "is-inside" : ""} ${active &&
          active !== quote.token
            ? "is-muted"
            : ""}"
          style=${`--quote-color:${this.quoteColor(quote.token)}`}
        >
          <title>${quote.token}: ${quote.value}</title>
          <path
            class="quote-leader"
            d=${`M ${quote.badgeX + (quote.side === "start" ? 9 : -9)} ${quote.badgeY} L ${quote.anchorX} ${quote.anchorY}`}
          />
          <line
            class="quote-line"
            x1=${quote.x1}
            y1=${quote.y1}
            x2=${quote.x2}
            y2=${quote.y2}
          />
          <line
            class="quote-tick"
            x1=${quote.axis === "v" ? quote.x1 - 5 : quote.x1}
            y1=${quote.axis === "v" ? quote.y1 : quote.y1 - 5}
            x2=${quote.axis === "v" ? quote.x1 + 5 : quote.x1}
            y2=${quote.axis === "v" ? quote.y1 : quote.y1 + 5}
          />
          <line
            class="quote-tick"
            x1=${quote.axis === "v" ? quote.x2 - 5 : quote.x2}
            y1=${quote.axis === "v" ? quote.y2 : quote.y2 - 5}
            x2=${quote.axis === "v" ? quote.x2 + 5 : quote.x2}
            y2=${quote.axis === "v" ? quote.y2 : quote.y2 + 5}
          />
          <circle
            class="quote-badge"
            cx=${quote.badgeX}
            cy=${quote.badgeY}
            r=${8}
          />
          <text
            class="quote-number"
            x=${quote.badgeX}
            y=${quote.badgeY}
            text-anchor="middle"
            dominant-baseline="central"
          >
            ${quote.index}
          </text>
          <text
            class="quote-caption"
            x=${quote.badgeX + (quote.side === "start" ? 13 : -13)}
            y=${quote.badgeY}
            text-anchor=${quote.side === "start" ? "start" : "end"}
            dominant-baseline="central"
          >
            <tspan class="quote-caption-value">${quote.value}</tspan>
            <tspan class="quote-caption-name" dx="4">${quote.label}</tspan>
          </text>
        </g>`,
      )}
    </svg>`;
  }

  private renderTokensConfig(): TemplateResult {
    const set = this.tokenSet;
    const contrasts = ["Standard", "Medium", "High"];
    return html`<bubble-card variant="outlined">
      <div class="config-head">
        <h2>Token</h2>
        <bubble-button variant="text" @click=${this.resetTokens}>Reimposta</bubble-button>
      </div>
      <div class="config-body tokens-config">
        <h3 class="config-group">Template</h3>
        ${this.renderDensitySelect()}
        <p class="usage-note">
          <em>Compatta</em> porta a tre quarti i token di spaziatura e dimensione
          dei componenti: padding, margini, gap, altezze, larghezze e dimensioni
          minime. Forme, colori e tipografia restano invariati.
        </p>
        <h3 class="config-group">Colori</h3>
        ${this.renderThemeSelect()}
        <div class="hct-panel">
          <p class="hct-caption">
            HCT · ${COLOR_ROLES.length} ruoli generati dal seme con la variante
            tonal spot
          </p>
          <div class="config-field">
            <span class="config-label">Contrasto</span>
            <docs-select
              label="Contrasto"
              .options=${contrasts}
              .value=${contrasts[Math.round(this.contrast * 2)]}
              @change=${(event: Event) =>
                this.setContrast(
                  String(
                    contrasts.indexOf(
                      (event as CustomEvent<{ value: string }>).detail.value,
                    ) / 2,
                  ),
                )}
            ></docs-select>
          </div>
          <bubble-button variant="tonal" @click=${this.generateHct}
            >Genera da Primary</bubble-button
          >
          <p class="hct-hint">
            Il seme è il valore corrente di Primary. La generazione sostituisce
            tutti i ruoli colore del tema attivo.
          </p>
        </div>
        ${COLOR_ROLE_GROUPS.map(
          (group) => html`<h4 class="config-subgroup">${group}</h4>
            ${COLOR_ROLES.filter((role) => role.group === group).map(
              (role) => html`<div class="config-field">
                <span class="config-label">${role.label}</span>
                <docs-color
                  .label=${role.label}
                  .value=${set.colors[role.token]}
                  @change=${(event: Event) =>
                    this.setColor(
                      role.token,
                      (event as CustomEvent<{ value: string }>).detail.value,
                    )}
                ></docs-color>
              </div>`,
            )}`,
        )}

        <h3 class="config-group">Forma</h3>
        ${SHAPE_TOKENS.map(
          (shape) => html`<bubble-slider
            .label=${shape.label}
            .min=${0}
            .max=${shape.max}
            .step=${1}
            .value=${String(set.shapes[shape.token])}
            show-value
            @value-input=${(event: Event) =>
              this.setShape(
                shape.token,
                Number((event as CustomEvent<{ value: string }>).detail.value),
              )}
          ></bubble-slider>`,
        )}

        <h3 class="config-group">Tipografia</h3>
        <div class="config-field">
          <span class="config-label">Font titoli</span>
          <docs-select
            label="Font titoli"
            .options=${FONT_KEYS}
            .value=${set.brandFont}
            @change=${(event: Event) =>
              this.setFont(
                "brandFont",
                (event as CustomEvent<{ value: string }>).detail.value,
              )}
          ></docs-select>
        </div>
        <div class="config-field">
          <span class="config-label">Font testo</span>
          <docs-select
            label="Font testo"
            .options=${FONT_KEYS}
            .value=${set.plainFont}
            @change=${(event: Event) =>
              this.setFont(
                "plainFont",
                (event as CustomEvent<{ value: string }>).detail.value,
              )}
          ></docs-select>
        </div>
        <bubble-slider
          label="Dimensione base (px)"
          .min=${14}
          .max=${20}
          .step=${1}
          .value=${String(set.baseSize)}
          show-value
          @value-input=${(event: Event) =>
            this.setBaseSize(
              Number((event as CustomEvent<{ value: string }>).detail.value),
            )}
        ></bubble-slider>
      </div>
    </bubble-card>`;
  }

  private renderEntryTokens(): TemplateResult | typeof nothing {
    if (this.usageTag !== this.entry.tag || !this.usage) return nothing;
    const usage = this.usage;
    const set = this.tokenSet;
    const tag = this.entry.tag;
    const shapes = new Map(SHAPE_TOKENS.map((shape) => [shape.token, shape]));
    const hasEditable =
      usage.colors.length > 0 ||
      usage.shapes.length > 0 ||
      usage.details.length > 0;
    const hasTypography = usage.typography.length > 0;
    if (!hasEditable && !hasTypography) return nothing;
    const hasOverrides = usage.details.some(
      (token) => this.details[tag]?.[token] !== undefined,
    );
    const isSizeToken = this.isSizeToken;
    const otherTokens = usage.details.filter(
      (token) => !isSizeToken(token) && !/color$/.test(token),
    );

    return html`<section class="config-section token-usage" aria-label="Token del componente">
      <div class="config-head">
        <h2>Token del componente</h2>
        ${hasOverrides
          ? html`<bubble-button
              variant="text"
              size="xs"
              @click=${() => this.resetDetails(tag)}
              >Reimposta dettaglio</bubble-button
            >`
          : nothing}
      </div>
      <div class="config-body tokens-config">
        <p class="usage-note">
          Elenco dei token che il CSS di <code>&lt;${tag}&gt;</code> usa, con il
          valore dichiarato accanto a quello attivo. Ogni valore si scrive per
          intero (px o altra unità) e la modifica vale per tutti gli esempi del
          componente. Colori e forma restano token globali del tema attivo; i
          token dei componenti annidati appartengono al componente che li usa.
        </p>

        ${usage.colors.length > 0
          ? html`<h4 class="config-subgroup">Colore</h4>
              ${usage.colors.map((token) => {
                const role = COLOR_ROLES.find((item) => item.token === token);
                if (!role) return nothing;
                return html`<div class="config-field">
                  <span class="config-label">${role.label}</span>
                  <docs-color
                    .label=${role.label}
                    .value=${set.colors[token]}
                    @change=${(event: Event) =>
                      this.setColor(
                        token,
                        (event as CustomEvent<{ value: string }>).detail.value,
                      )}
                  ></docs-color>
                </div>`;
              })}`
          : nothing}

        ${usage.shapes.length > 0
          ? html`<h4 class="config-subgroup">Forma</h4>
              ${usage.shapes.map((token) => {
                const shape = shapes.get(token);
                if (!shape) return nothing;
                return html`<bubble-slider
                  .label=${shape.label}
                  .min=${0}
                  .max=${shape.max}
                  .step=${1}
                  .value=${String(set.shapes[token])}
                  show-value
                  @value-input=${(event: Event) =>
                    this.setShape(
                      token,
                      Number(
                        (event as CustomEvent<{ value: string }>).detail.value,
                      ),
                    )}
                ></bubble-slider>`;
              })}`
          : nothing}

        ${otherTokens.length > 0
          ? html`<h4 class="config-subgroup">Altri token</h4>
              <div class="measure-table">
                ${otherTokens.map((token) => this.renderTokenRow(tag, token))}
              </div>`
          : nothing}

        ${hasTypography
          ? html`<h4 class="config-subgroup">Tipografia</h4>
              <p class="usage-scales">
                ${usage.typography.map(
                  (scale) => html`<code>${scale}</code>`,
                )}
              </p>
              <div class="config-field">
                <span class="config-label">Font titoli</span>
                <docs-select
                  label="Font titoli"
                  .options=${FONT_KEYS}
                  .value=${set.brandFont}
                  @change=${(event: Event) =>
                    this.setFont(
                      "brandFont",
                      (event as CustomEvent<{ value: string }>).detail.value,
                    )}
                ></docs-select>
              </div>
              <div class="config-field">
                <span class="config-label">Font testo</span>
                <docs-select
                  label="Font testo"
                  .options=${FONT_KEYS}
                  .value=${set.plainFont}
                  @change=${(event: Event) =>
                    this.setFont(
                      "plainFont",
                      (event as CustomEvent<{ value: string }>).detail.value,
                    )}
                ></docs-select>
              </div>
              <bubble-slider
                label="Dimensione base (px)"
                .min=${14}
                .max=${20}
                .step=${1}
                .value=${String(set.baseSize)}
                show-value
                @value-input=${(event: Event) =>
                  this.setBaseSize(
                    Number(
                      (event as CustomEvent<{ value: string }>).detail.value,
                    ),
                  )}
              ></bubble-slider>`
          : nothing}
      </div>
    </section>`;
  }

  private renderTokenRow(tag: string, token: string): TemplateResult {
    const value = this.detailValue(tag, token);
    const fallback = tokenDefault(token);
    const overridden = this.details[tag]?.[token] !== undefined;
    const color = this.quoteColor(token);
    const number = this.quotes ? this.quoteNumber(token) : 0;
    const pixels = /^-?\d*\.?\d+px$/.test(value)
      ? Math.abs(parseFloat(value))
      : null;
    return html`<div
      class="measure-row ${overridden ? "is-overridden" : ""} ${this.hoverToken &&
      this.hoverToken !== token
        ? "is-muted"
        : ""}"
      style=${color ? `--quote-color:${color}` : ""}
      @mouseenter=${() => (this.hoverToken = token)}
      @mouseleave=${() => (this.hoverToken = "")}
    >
      <code class="measure-name" title=${token}>
        ${number > 0
          ? html`<span class="measure-index" aria-hidden="true">${number}</span>`
          : html`<span class="measure-swatch" aria-hidden="true"></span>`}${shortTokenName(
          token,
          tag,
        )}
      </code>
      <span class="measure-meta">default <b>${fallback || "non dichiarato"}</b></span>
      ${pixels !== null
        ? html`<span class="measure-field">
            <input
              class="measure-input"
              type="number"
              inputmode="decimal"
              step="1"
              min="0"
              spellcheck="false"
              autocomplete="off"
              aria-label=${`Valore di ${token} in pixel`}
              .value=${String(pixels)}
              @change=${(event: Event) =>
                this.commitPixels(tag, token, event.target as HTMLInputElement)}
              @keydown=${this.onMeasureKeydown}
              @wheel=${this.onMeasureWheel}
            />
            <span class="measure-unit" aria-hidden="true">px</span>
          </span>`
        : html`<input
            class="measure-input is-text"
            type="text"
            spellcheck="false"
            autocomplete="off"
            aria-label=${`Valore di ${token}`}
            .value=${value}
            @change=${(event: Event) =>
              this.setDetail(tag, token, (event.target as HTMLInputElement).value)}
          />`}
      <span class="measure-ruler" aria-hidden="true">
        <span
          class="measure-ruler-bar"
          style=${pixels !== null ? `inline-size:${Math.min(pixels, 96)}px` : ""}
        ></span>
        <span class="measure-ruler-value"
          >${pixels !== null ? `${value}` : value || "—"}</span
        >
      </span>
      ${overridden
        ? html`<bubble-button
            variant="text"
            size="xs"
            @click=${() => this.setDetail(tag, token, "")}
            >Reset</bubble-button
          >`
        : nothing}
    </div>`;
  }

  private commitPixels(tag: string, token: string, input: HTMLInputElement) {
    const raw = input.value.trim();
    if (!raw) {
      this.setDetail(tag, token, "");
      return;
    }
    const number = Number(raw);
    if (!Number.isFinite(number)) {
      const current = parseFloat(this.detailValue(tag, token));
      input.value = String(Number.isFinite(current) ? Math.abs(current) : 0);
      return;
    }
    this.setDetail(tag, token, `${Math.round(Math.max(0, number) * 100) / 100}px`);
  }

  /** Shift widens the step, as with any number input plus a coarse mode. */
  private onMeasureKeydown = (event: KeyboardEvent) => {
    const input = event.currentTarget as HTMLInputElement;
    if (!event.shiftKey) return;
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    if (event.key === "ArrowUp") input.stepUp(10);
    else input.stepDown(10);
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  private onMeasureWheel = (event: WheelEvent) => {
    const input = event.currentTarget as HTMLInputElement;
    // Same rule as a native number input: the wheel edits only a focused field,
    // otherwise it scrolls the panel.
    if (document.activeElement !== input) return;
    event.preventDefault();
    if (event.deltaY < 0) input.stepUp(event.shiftKey ? 10 : 1);
    else input.stepDown(event.shiftKey ? 10 : 1);
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  private renderTokensMain(css: string): TemplateResult {
    return html`<header class="component-header">
        <span class="kicker">Fondamenta</span>
        <h1>Design tokens</h1>
        <code class="tag">:root</code>
        <p class="lead">
          Regola colori Material, forma e tipografia. Le modifiche si applicano a
          tutti i componenti e al sito.
        </p>
        <p class="note">
          Palette Material da
          <a class="md-text-link" href="https://materialui.co/colors" target="_blank" rel="noopener noreferrer"
            >materialui.co/colors</a
          >. I token sono mantenuti separatamente per tema chiaro e scuro.
        </p>
      </header>

      <section class="panel preview-panel" aria-label="Anteprima dei token">
        <div class="section-head">
          <h2>Anteprima</h2>
          <span class="hint">Colori, bordi e font in tempo reale</span>
        </div>
        <div class="preview-surface">${this.renderTokensPreview()}</div>
      </section>

      <section class="panel code-panel" aria-label="Codice CSS">
        <div class="section-head">
          <h2>Codice CSS</h2>
          <bubble-button variant="text" @click=${() => this.copy(css)}>Copia</bubble-button>
        </div>
        <pre class="code-block"><code>${css}</code></pre>
      </section>`;
  }

  protected render() {
    const isTokens = this.isTokens;
    const entry = this.entry;
    const state = this.state;
    const vue = buildVue(entry.tag, entry.code(state));
    const react = buildReact(entry.tag, entry.code(state));
    const css = tokensCss(this.tokenSet);
    const navList = (navigate: (event: Event) => void) => html`<bubble-list
      label="Componenti"
      selection="single"
      interactive
      .items=${this.navItems()}
      .value=${isTokens ? "" : this.isOverview ? "overview" : entry.tag}
      .expanded=${this.expanded}
      @change=${navigate}
      @expand=${this.onExpand}
    ></bubble-list>`;

    return html`
      <style>
        ${this.detailsCss}
      </style>
      <header class="topbar">
        <bubble-app-bar
          label="Bubble"
          subtitle="Material 3 web components"
          sticky
        >
          <span>Bubble</span>
          <bubble-icon-button
            slot="leading"
            class="nav-toggle"
            label="Apri navigazione"
            @click=${this.openDrawer}
            >${ti("menu-2")}</bubble-icon-button
          >
          <span slot="trailing" class="topbar-actions">
            ${!isTokens && !this.isOverview
              ? html`<bubble-icon-button
                  label="Configurazione"
                  @click=${this.openConfig}
                  >${ti("settings")}</bubble-icon-button
                >`
              : nothing}
            <bubble-icon-button
              label=${this.dark ? "Tema chiaro" : "Tema scuro"}
              toggle
              ?selected=${this.dark}
              @click=${this.toggleTheme}
              >${this.dark ? ti("sun") : ti("moon")}</bubble-icon-button
            >
            <bubble-icon-button
              label="Direzione RTL"
              toggle
              ?selected=${this.rtl}
              @click=${this.toggleRtl}
              >RTL</bubble-icon-button
            >
          </span>
        </bubble-app-bar>
      </header>

      <div class="shell ${isTokens ? "with-panel" : ""}">
        <aside class="nav-panel" aria-label="Elenco componenti">
          <p class="panel-kicker">Catalogo</p>
          <bubble-button
            class="tokens-link"
            .variant=${isTokens ? "filled-tonal" : "text"}
            @click=${() => this.navigate("tokens")}
            >${ti("palette")}<span>Design tokens</span></bubble-button
          >
          ${navList(this.onNavigate)}
        </aside>

        <main class="content">
          ${isTokens
            ? this.renderTokensMain(css)
            : this.isOverview
              ? this.renderOverview()
              : html`<header class="component-header">
                  <span class="kicker">${entry.group}</span>
                  <h1>${entry.title}</h1>
                  <code class="tag">&lt;${entry.tag}&gt;</code>
                  <p class="lead">${entry.summary}</p>
                  ${entry.note ? html`<p class="note">${entry.note}</p>` : nothing}
                </header>

                <div class="component-stage">
                  <section class="panel preview-panel" aria-label="Anteprima">
                    <div class="section-head">
                      <h2>Anteprima</h2>
                      <bubble-button variant="text" @click=${this.openConfig}
                        >Configura</bubble-button
                      >
                    </div>
                    <div
                      class="preview-surface ${this.quotes ? "with-quotes" : ""}"
                      data-group=${entry.group}
                    >
                      ${entry.render(state, this.ctx)}
                      ${this.quotes && this.quoteLines.length > 0
                        ? this.renderQuotes()
                        : nothing}
                    </div>
                  </section>
                  ${this.renderSizePanel()}
                </div>

                <section class="panel code-panel" aria-label="Codice">
                  <div class="section-head">
                    <h2>Codice</h2>
                    <div class="code-actions">
                      <bubble-segmented-buttons
                        label="Framework"
                        .items=${[
                          { id: "vue", label: "Vue" },
                          { id: "react", label: "React" },
                        ]}
                        .value=${this.codeTab}
                        @change=${this.onCodeTab}
                      ></bubble-segmented-buttons>
                      <bubble-button
                        variant="text"
                        @click=${() => this.copy(this.codeTab === "vue" ? vue : react)}
                        >Copia</bubble-button
                      >
                    </div>
                  </div>
                  <pre class="code-block"><code>${this.codeTab === "vue" ? vue : react}</code></pre>
                </section>`}
        </main>

        ${isTokens
          ? html`<aside class="config-panel" aria-label="Configurazione">
              ${this.renderTokensConfig()}
            </aside>`
          : nothing}
      </div>

      ${!isTokens && !this.isOverview
        ? html`<bubble-side-sheet
            id="site-config"
            class="config-sheet"
            label="Configurazione"
            close-label="Chiudi"
            detached
          >
            <div class="config-sheet-body">
              <section class="config-section" aria-label="Tema">
                <div class="config-head">
                  <h2>Tema</h2>
                </div>
                ${this.renderThemeSelect()}
              </section>
              <section class="config-section" aria-label="Template">
                <div class="config-head">
                  <h2>Template</h2>
                </div>
                ${this.renderDensitySelect()}
              </section>
              <section class="config-section" aria-label="Parametri">
                <div class="config-head">
                  <h2>Parametri</h2>
                  <bubble-button
                    variant="text"
                    size="xs"
                    @click=${() => this.reset(entry)}
                    >Reimposta</bubble-button
                  >
                </div>
                <div class="config-body">
                  ${entry.controls.map((control) =>
                    this.renderControl(control, state),
                  )}
                </div>
              </section>
              ${this.renderEntryTokens()}
            </div>
          </bubble-side-sheet>`
        : nothing}

      <footer class="site-footer">
        <span>Material 3 web components</span>
        <a class="md-text-link" href="https://materialui.co/colors" target="_blank" rel="noopener noreferrer"
          >Palette Material</a
        >
        <a class="md-text-link" href="https://tabler.io/icons" target="_blank" rel="noopener noreferrer"
          >Icone Tabler</a
        >
      </footer>

      <bubble-snackbar id="site-snackbar" .duration=${3000}></bubble-snackbar>

      <bubble-navigation-drawer
        id="site-drawer"
        label="Componenti"
        close-label="Chiudi"
      >
        <bubble-button
          class="tokens-link"
          .variant=${isTokens ? "filled-tonal" : "text"}
          @click=${() => {
            this.navigate("tokens");
            this.closeDrawer();
          }}
          >${ti("palette")}<span>Design tokens</span></bubble-button
        >
        ${navList(this.drawerNavigate)}
      </bubble-navigation-drawer>
    `;
  }
}

if (!customElements.get("bubble-docs"))
  customElements.define("bubble-docs", DocsApp);

import { css } from "lit";
export const surfaceStyles = css`
  :host {
    display: block;
  }
  .bar {
    display: flex;
    align-items: center;
    gap: var(--md-comp-action-gap);
    min-block-size: var(--md-comp-app-bar-height);
    padding-inline: var(--md-comp-field-padding);
    background: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
  }
  .title {
    margin: 0;
    flex: 1;
    min-inline-size: 0;
    font: var(--md-sys-typescale-title-large-font);
  }
  .title-group {
    flex: 1;
    min-inline-size: 0;
  }
  .subtitle {
    margin: 0;
    font: var(--md-sys-typescale-body-medium-font);
    letter-spacing: var(--md-sys-typescale-body-medium-tracking);
    color: var(--md-sys-color-on-surface-variant);
  }
  :host([alignment="center"]) .title-group,
  :host([variant="center-aligned"]) .title-group {
    text-align: center;
  }
  :host([variant="center-aligned"]) .title {
    text-align: center;
  }
  :host([alignment="center"]) .title {
    text-align: center;
  }
  :host([variant="medium-flexible"]:not([collapsed])) .bar {
    min-block-size: var(--md-comp-app-bar-medium-height);
    align-items: end;
    padding-block-end: var(--md-comp-field-padding);
  }
  :host([variant="medium"]) .bar,
  :host([variant="medium-flexible"]:not([collapsed])) .bar,
  :host([variant="large"]) .bar,
  :host([variant="large-flexible"]:not([collapsed])) .bar {
    align-items: flex-end;
    padding-block-end: var(--md-comp-field-padding);
  }
  :host([variant="medium-flexible"]:not([collapsed])) .title {
    font: var(--md-sys-typescale-headline-medium-font);
  }
  :host(
      [variant="medium-flexible"][subtitle]:not([subtitle=""]):not([collapsed])
    )
    .bar {
    min-block-size: var(--md-comp-app-bar-medium-subtitle-height);
  }
  :host([variant="large-flexible"]:not([collapsed])) .bar {
    min-block-size: var(--md-comp-app-bar-large-flexible-height);
    align-items: end;
    padding-block-end: var(--md-comp-field-padding);
  }
  :host([variant="large-flexible"]:not([collapsed])) .title {
    font: var(--md-sys-typescale-display-small-font);
  }
  :host(
      [variant="large-flexible"][subtitle]:not([subtitle=""]):not([collapsed])
    )
    .bar {
    min-block-size: var(--md-comp-app-bar-large-height);
  }
  :host([variant="large-flexible"]) .subtitle {
    font: var(--md-sys-typescale-title-medium-font);
  }
  :host([variant="search"]) .bar {
    min-block-size: var(--md-comp-app-bar-search-height);
    background: var(--md-sys-color-surface-container);
  }
  :host([variant="search"]) .title {
    font: var(--md-sys-typescale-body-large-font);
  }
  :host([variant="medium"]) .title,
  :host([variant="medium-flexible"]) .title {
    font: var(--md-sys-typescale-headline-small-font);
  }
  :host([variant="large"]) .title,
  :host([variant="large-flexible"]) .title {
    font: var(--md-sys-typescale-headline-medium-font);
  }
  :host([variant="search"]) ::slotted(bubble-search) {
    inline-size: 100%;
  }
  :host([variant="medium"]) .bar {
    min-block-size: var(--md-comp-app-bar-medium-height);
  }
  :host([variant="large"]) .bar {
    min-block-size: var(--md-comp-app-bar-large-height);
  }
  :host([sticky]) {
    position: sticky;
    inset-block-start: 0;
    z-index: 10;
  }
  :host([scrolled]) .bar {
    background: var(--md-sys-color-surface-container);
  }
  .toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    min-block-size: 64px;
    padding-inline: 16px;
    border-radius: var(--md-sys-shape-corner-none);
    background: var(--md-sys-color-surface-container);
  }
  :host([variant="floating"]) .toolbar {
    gap: 4px;
    padding: 8px;
    border-radius: var(--md-sys-shape-corner-full);
    box-shadow: var(--md-sys-elevation-level3);
  }
  :host([color="vibrant"]) .toolbar {
    background: var(--md-sys-color-tertiary-container);
    color: var(--md-sys-color-on-tertiary-container);
  }
  :host([orientation="vertical"]) .toolbar {
    flex-direction: column;
  }
  .card {
    padding: var(--md-comp-card-padding);
    font: var(--md-sys-typescale-body-medium-font);
    letter-spacing: var(--md-sys-typescale-body-medium-tracking);
    border-radius: var(--md-sys-shape-corner-medium);
    background: var(--md-sys-color-surface-container-highest);
    overflow: clip;
  }
  :host([variant="outlined"]) .card {
    background: var(--md-sys-color-surface);
    border: 1px solid var(--md-sys-color-outline-variant);
  }
  :host([variant="elevated"]) .card {
    background: var(--md-sys-color-surface-container-low);
    box-shadow: var(--md-sys-elevation-level1);
  }
  :host([orientation="horizontal"]) .card {
    display: flex;
    gap: var(--md-comp-field-padding);
    align-items: start;
  }
  :host([orientation="horizontal"]) ::slotted([slot="media"]) {
    flex: 0 0 var(--md-comp-card-horizontal-media-width);
    inline-size: var(--md-comp-card-horizontal-media-width);
    overflow: clip;
    border-radius: var(--md-sys-shape-corner-small);
  }
  .card > a {
    display: block;
    color: inherit;
    text-decoration: none;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-inline-size: var(--md-comp-badge-size);
    min-block-size: var(--md-comp-badge-size);
    padding-inline: var(--md-comp-badge-padding);
    border-radius: var(--md-sys-shape-corner-full);
    background: var(--md-sys-color-error);
    color: var(--md-sys-color-on-error);
    font: var(--md-sys-typescale-label-small-font);
  }
  :host([small]) .badge {
    min-inline-size: var(--md-comp-badge-small-size);
    min-block-size: var(--md-comp-badge-small-size);
    padding: 0;
  }
  .divider {
    border: 0;
    block-size: 1px;
    background: var(--md-sys-color-outline-variant);
    margin: 0;
  }
  :host([inset]) .divider,
  :host([variant="inset"]) .divider {
    margin-inline: var(--md-comp-divider-inset);
  }
  :host([variant="inset-start"]) .divider {
    margin-inline-start: var(--md-comp-divider-inset);
  }
  :host([variant="inset-end"]) .divider {
    margin-inline-end: var(--md-comp-divider-inset);
  }
  :host([vertical]) {
    display: inline-block;
    block-size: 100%;
  }
  :host([vertical]) .divider {
    inline-size: 1px;
    block-size: 100%;
    min-block-size: var(--md-comp-action-target);
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .list-item > span[aria-hidden="true"] {
    display: inline-grid;
    place-items: center;
    inline-size: 24px;
    block-size: 24px;
    font-size: 24px;
  }
  .list-item {
    display: flex;
    align-items: center;
    gap: var(--md-comp-list-item-between-space);
    /* Misura di lavoro della consolle: la stessa delle celle e dei comandi, così la
       navigazione non grida più forte dei dati che mostra. */
    font: var(--md-sys-typescale-body-medium-font);
    letter-spacing: var(--md-sys-typescale-body-medium-tracking);
    min-block-size: var(--md-comp-list-item-height);
    padding: var(--md-comp-list-item-top-space)
      var(--md-comp-list-item-trailing-space) var(--md-comp-list-item-bottom-space)
      var(--md-comp-list-item-leading-space);
    color: inherit;
    text-decoration: none;
    inline-size: 100%;
    text-align: start;
  }
  .list-item:has(.support) {
    min-block-size: 72px;
  }
  .list-item:has(.support:has(+ .support)) {
    min-block-size: 88px;
  }
  .list-text {
    display: grid;
    flex: 1;
    min-inline-size: 0;
  }
  .list-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-inline-start: auto;
    min-inline-size: var(--md-comp-badge-size);
    min-block-size: var(--md-comp-badge-size);
    padding-inline: var(--md-comp-badge-padding);
    border-radius: var(--md-sys-shape-corner-full);
    /* Il distintivo di un elenco conta elementi, non segnala un errore, e deve restare
       leggibile sia sulla voce normale sia su quella selezionata: il fondo deriva dal
       colore del testo della voce, quindi segue lo stato. */
    background: color-mix(in srgb, currentColor 12%, transparent);
    color: inherit;
    font: var(--md-sys-typescale-label-small-font);
    flex: none;
  }
  .list-text .support {
    font: var(--md-sys-typescale-body-medium-font);
    letter-spacing: var(--md-sys-typescale-body-medium-tracking);
    color: var(--md-sys-color-on-surface-variant);
  }
  :host([variant="segmented"]) ul {
    display: grid;
    gap: var(--md-comp-list-segmented-gap);
  }
  :host([variant="segmented"]) li {
    border-radius: var(--md-sys-shape-corner-large);
    overflow: clip;
    background: var(--md-sys-color-surface-container-high);
  }
  :host([variant="segmented"]) .list-item {
    border-radius: inherit;
  }
  :host([variant="segmented"]) .list-item[aria-current="true"],
  :host([variant="segmented"]) .list-item[aria-selected="true"] {
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
  }
  .list-item[aria-selected="true"] {
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
  }
  .list-item[aria-current="true"]:not([aria-current="page"]) {
    background: var(--md-sys-color-surface-container-high);
  }
  button.list-item,
  a.list-item {
    cursor: pointer;
    transition: background-color var(--md-sys-motion-duration-short2)
      var(--md-sys-motion-easing-standard);
  }
  button.list-item:hover,
  a.list-item:hover {
    background: var(--md-sys-color-surface-container-high);
  }
  button.list-item:focus-visible,
  a.list-item:focus-visible,
  .list-disclosure:focus-visible {
    outline: var(--md-comp-focus-outline);
    outline-offset: calc(var(--md-comp-focus-outline-offset) * -1);
  }
  .list-row {
    display: flex;
    align-items: center;
  }
  .list-row .list-item {
    flex: 1;
    min-inline-size: 0;
  }
  .list-disclosure {
    margin-inline-start: auto;
    display: grid;
    place-items: center;
    inline-size: var(--md-comp-action-target);
    block-size: var(--md-comp-action-target);
    border: 0;
    border-radius: var(--md-sys-shape-corner-full);
    background: transparent;
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
  }
  .list-disclosure svg {
    inline-size: 20px;
    block-size: 20px;
  }
  .list-sublist {
    padding-inline-start: var(--md-comp-field-padding);
  }
  .chip {
    position: relative;
    display: inline-flex;
    font: var(--md-sys-typescale-label-large-font);
    align-items: center;
    block-size: var(--md-comp-chip-height);
    border-radius: var(--md-sys-shape-corner-small);
    border: 1px solid var(--md-sys-color-outline);
  }
  :host([elevated]) .chip {
    border-color: transparent;
    background: var(--md-sys-color-surface-container-low);
    box-shadow: var(--md-sys-elevation-level1);
  }
  .chip button,
  .chip a,
  .chip label {
    display: inline-flex;
    gap: var(--md-comp-action-gap);
    align-items: center;
    min-block-size: var(--md-comp-action-target);
    margin-block: calc(
      (
          var(--md-comp-chip-height) - 2px -
            var(--md-comp-action-target)
        ) /
        2
    );
    padding-inline: var(--md-comp-chip-inset);
    border-radius: inherit;
    color: inherit;
    text-decoration: none;
    font: var(--md-sys-typescale-label-large-font);
    letter-spacing: var(--md-sys-typescale-label-large-tracking);
  }
  ::slotted([slot="avatar"]),
  ::slotted([slot="icon"]) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--md-comp-selection-size);
    block-size: var(--md-comp-selection-size);
  }
  .chip label {
    position: relative;
    cursor: pointer;
  }
  .chip label:has(input:focus-visible) {
    outline: 3px solid var(--md-sys-color-secondary);
    outline-offset: -3px;
  }
  .chip input {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    opacity: 0;
    margin: 0;
    pointer-events: none;
  }
  .chip label:has(input:checked)::before {
    content: "✓";
    font-size: var(--md-comp-icon-size);
    line-height: 1;
  }
  .chip .remove {
    min-block-size: var(--md-comp-action-target);
    margin-inline-start: 0;
    padding-inline: var(--md-comp-action-gap);
  }
  :host([selected]) .chip {
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
    border-color: transparent;
  }
`;

import { css } from "lit";
export const navigationStyles = css`
  :host {
    --bb-glint-color: color-mix(in srgb, var(--md-sys-color-primary) 35%, transparent);
  }
  :host {
    display: block;
  }
  nav,
  [role="tablist"] {
    display: flex;
    gap: var(--md-comp-action-gap);
    background: var(--md-sys-color-surface-container);
    padding: var(--md-comp-action-gap);
    overflow-x: auto;
  }
  nav {
    block-size: var(--md-comp-navigation-bar-height);
    padding: 0 var(--md-comp-action-gap);
  }
  .destination {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--md-comp-field-gap);
    min-block-size: var(--md-comp-navigation-bar-height);
    min-inline-size: var(--md-comp-action-target);
    padding: 0 var(--md-comp-field-gap);
    text-decoration: none;
    color: var(--md-sys-color-on-surface-variant);
    font: var(--md-sys-typescale-label-medium-font);
    letter-spacing: var(--md-sys-typescale-label-medium-tracking);
  }
  .destinations {
    display: flex;
    padding: 0;
    margin: 0;
    list-style: none;
    flex: 1;
    gap: var(--md-comp-action-gap);
  }
  .destinations li {
    display: flex;
    flex: 1;
  }
  :host([rail]) .destinations {
    flex-direction: column;
  }
  .indicator {
    display: grid;
    place-items: center;
    inline-size: var(--md-comp-navigation-indicator-width);
    block-size: 32px;
    border-radius: var(--md-sys-shape-corner-full);
    font-size: 24px;
    line-height: 1;
  }
  [aria-current="page"] .indicator,
  [aria-selected="true"] .indicator {
    color: var(--md-sys-color-on-secondary-container);
    background: var(--md-sys-color-secondary-container);
  }
  :host([rail]) {
    background: var(--md-sys-color-surface);
  }
  :host([rail]) nav {
    flex-direction: column;
    inline-size: var(--md-comp-navigation-rail-width);
    block-size: auto;
    padding: var(--md-comp-navigation-rail-top-space)
      var(--md-comp-action-gap)
      var(--md-comp-navigation-rail-item-vertical-space);
    background: transparent;
  }
  :host([rail][expanded]) nav {
    inline-size: var(--md-comp-navigation-rail-expanded-width);
    padding-block-end: var(--md-comp-navigation-rail-expanded-trailing-space);
  }
  :host([rail]) .destinations {
    gap: var(--md-comp-navigation-rail-item-vertical-space-collapsed);
  }
  :host([rail][expanded]) .destinations {
    gap: var(--md-comp-navigation-rail-item-vertical-space);
  }
  /* A 96px la label non ci sta: senza troncamento esce dal binario e invade il contenuto. */
  :host([rail]) .destination {
    min-block-size: var(--md-comp-navigation-rail-item-height);
    padding-inline: 0;
    white-space: nowrap;
    max-inline-size: 100%;
    overflow: hidden;
  }
  :host([rail]) .destination > span:not(.indicator) {
    display: block;
    max-inline-size: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  :host([rail]) .indicator {
    inline-size: var(--md-comp-navigation-rail-indicator-width);
    block-size: var(--md-comp-navigation-rail-indicator-height);
  }
  :host([rail][expanded]) .destination {
    flex-direction: row;
    justify-content: start;
    gap: var(--md-comp-navigation-rail-item-gap);
    padding-inline-start: var(--md-comp-navigation-rail-item-leading-space);
    padding-inline-end: var(--md-comp-navigation-rail-item-trailing-space);
  }
  [role="tab"] {
    flex-direction: row;
    gap: var(--md-comp-field-gap);
    font: var(--md-sys-typescale-title-small-font);
    letter-spacing: var(--md-sys-typescale-title-small-tracking);
    min-block-size: var(--md-comp-action-target);
    border-block-end: 3px solid transparent;
    white-space: nowrap;
  }
  [role="tab"]:has(.tab-icon) {
    min-block-size: 64px;
  }
  [role="tab"][aria-selected="true"] {
    border-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-primary);
  }
  :host([variant="secondary"]) [role="tab"] {
    border-block-end-width: 2px;
  }
  .tab-icon {
    font-size: 24px;
    line-height: 1;
  }
  .tab-badge {
    border-radius: var(--md-sys-shape-corner-full);
    background: var(--md-sys-color-error);
    color: var(--md-sys-color-on-error);
    padding-inline: var(--md-comp-badge-padding);
    font: var(--md-sys-typescale-label-small-font);
  }
  :host([variant="flexible"]) nav,
  :host([layout="horizontal"]) nav {
    background: transparent;
    padding: 0;
  }
  :host([variant="flexible"]) .destination,
  :host([layout="horizontal"]) .destination {
    flex-direction: row;
    justify-content: start;
    gap: var(--md-comp-field-padding);
    min-block-size: var(--md-comp-action-target);
    padding-inline: var(--md-comp-field-padding);
  }
  [role="tabpanel"] {
    padding: var(--md-comp-field-padding);
  }
  .tab-scroller {
    display: flex;
    align-items: stretch;
    background: var(--md-sys-color-surface-container);
  }
  .tab-scroller [role="tablist"] {
    flex: 1;
    min-inline-size: 0;
    scroll-behavior: smooth;
    scrollbar-width: none;
    padding-inline-start: 52px;
  }
  .tab-scroller [role="tablist"]::-webkit-scrollbar {
    display: none;
  }
  .tab-scroller [role="tab"] {
    flex: 0 0 auto;
  }
  .tab-scroll-button {
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    inline-size: var(--md-comp-action-target);
    border: 0;
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
  }
  .tab-scroll-button svg {
    inline-size: 24px;
    block-size: 24px;
  }
  .tab-scroll-button:disabled {
    opacity: var(--md-sys-state-disabled-content-opacity);
    cursor: default;
  }
  .tab-scroll-button:focus-visible {
    outline: var(--md-comp-focus-outline);
    outline-offset: calc(var(--md-comp-focus-outline-offset) * -1);
  }
`;

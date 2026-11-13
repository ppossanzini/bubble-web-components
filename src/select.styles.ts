import { css } from "lit";

export const selectStyles = css`
  :host {
    display: inline-block;
    inline-size: 100%;
    max-inline-size: 100%;
  }
  .control {
    display: grid;
    align-items: start;
    gap: 0;
    inline-size: 100%;
    min-block-size: var(--md-comp-field-height);
    padding: var(--md-comp-field-padding-block-start)
      var(--md-comp-field-padding) var(--md-comp-field-padding-block-end);
    border: 0;
    border-block-end: 1px solid var(--md-sys-color-on-surface-variant);
    border-radius: var(--md-sys-shape-corner-extra-small)
      var(--md-sys-shape-corner-extra-small) 0 0;
    background: var(--md-sys-color-surface-container-highest);
    color: var(--md-sys-color-on-surface);
    font: inherit;
    text-align: start;
    cursor: pointer;
  }
  :host([variant="outlined"]) .control {
    padding-block: var(--md-comp-field-padding-block-start);
    border: 1px solid var(--md-sys-color-outline);
    border-radius: var(--md-sys-shape-corner-extra-small);
    background: transparent;
  }
  :host([error]) .control {
    border-color: var(--md-sys-color-error);
  }
  .control:focus-visible {
    outline: 2px solid var(--md-sys-color-primary);
    outline-offset: -2px;
  }
  .field-label {
    font: var(--md-sys-typescale-body-small-font);
    letter-spacing: var(--md-sys-typescale-body-small-tracking);
    color: var(--md-sys-color-on-surface-variant);
  }
  .field-label:empty {
    display: none;
  }
  .field-body {
    display: flex;
    align-items: center;
    gap: var(--md-comp-action-gap);
    min-inline-size: 0;
    min-block-size: 24px;
  }
  .value {
    flex: 1;
    min-inline-size: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font: var(--md-sys-typescale-body-large-font);
    letter-spacing: var(--md-sys-typescale-body-large-tracking);
  }
  .value.placeholder {
    color: var(--md-sys-color-on-surface-variant);
  }
  .chevron {
    display: inline-grid;
    place-items: center;
    flex-shrink: 0;
    inline-size: var(--md-comp-icon-size);
    block-size: var(--md-comp-icon-size);
    color: var(--md-sys-color-on-surface-variant);
    transition: rotate var(--md-sys-motion-duration-short2)
      var(--md-sys-motion-easing-standard),
      var(--bb-shape-motion);
  }
  .chevron svg {
    inline-size: 100%;
    block-size: 100%;
  }
  :host([open]) .chevron {
    rotate: 180deg;
  }
  :host([error]) .support {
    color: var(--md-sys-color-error);
  }
  :host([disabled]) .control {
    cursor: default;
    opacity: var(--md-sys-state-disabled-content-opacity);
  }
  @media (prefers-reduced-motion: reduce) {
    .chevron {
      transition: none;
    }
  }
  @media (forced-colors: active) {
    .control {
      border: 1px solid ButtonText;
    }
  }
`;

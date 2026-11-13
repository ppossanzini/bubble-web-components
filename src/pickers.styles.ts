import { css } from "lit";
export const pickerStyles = css`
  .picker-field {
    display: flex;
    align-items: center;
    gap: 0;
    background: var(--md-sys-color-surface-container-highest);
    border-start-start-radius: var(--md-sys-shape-corner-extra-small);
    border-start-end-radius: var(--md-sys-shape-corner-extra-small);
    border-block-end: 1px solid var(--md-sys-color-on-surface-variant);
    padding-inline-end: 4px;
  }
  .picker-field:focus-within {
    outline: 2px solid var(--md-sys-color-primary);
    outline-offset: -2px;
  }
  :host([variant="outlined"]) .picker-field {
    background: transparent;
    border: 1px solid var(--md-sys-color-outline);
    border-radius: var(--md-sys-shape-corner-extra-small);
  }
  .picker-field > .field {
    flex: 1;
    min-inline-size: 0;
  }
  .picker-field > .field label {
    background: transparent;
    border: 0;
    padding-inline-end: 0;
  }
  .picker-field--end {
    margin-block-start: var(--md-comp-field-gap);
  }
  .picker-field > .field .support-row {
    padding-inline: var(--md-comp-field-padding) 0;
  }
  :host {
    max-inline-size: 100%;
  }
  :host([selection-mode="range"]) {
    inline-size: min(100%, var(--md-comp-date-picker-width));
  }
  :host([selection-mode="range"]) > .field {
    margin-block-start: var(--md-comp-field-gap);
    padding-inline-end: calc(
      var(--md-comp-action-target) + var(--md-comp-action-gap)
    );
  }
  .field {
    inline-size: 100%;
  }
  input[type="date"]::-webkit-calendar-picker-indicator,
  input[type="time"]::-webkit-calendar-picker-indicator {
    display: none;
  }
  input[type="date"],
  input[type="time"] {
    padding-inline-end: 0;
  }
  .picker-trigger {
    position: static;
    flex: 0 0 var(--md-comp-action-target);
    display: inline-grid;
    place-items: center;
    min-block-size: var(--md-comp-action-target);
    min-inline-size: var(--md-comp-action-target);
    border: 0;
    border-radius: var(--md-sys-shape-corner-full);
    background: transparent;
    color: var(--md-sys-color-primary);
    cursor: pointer;
  }
  .picker-trigger svg {
    inline-size: 24px;
    block-size: 24px;
  }
  .picker-trigger:focus-visible {
    outline: 3px solid var(--md-sys-color-secondary);
    outline-offset: 2px;
  }
  .picker-trigger:disabled {
    color: var(--md-sys-color-on-surface);
    opacity: var(--md-sys-state-disabled-content-opacity);
    cursor: default;
  }
  dialog {
    border: 0;
    border-radius: var(--md-sys-shape-corner-extra-large);
    padding: var(--md-comp-dialog-padding);
    background: var(--md-sys-color-surface-container-high);
    color: var(--md-sys-color-on-surface);
    max-inline-size: calc(100vw - 16px);
    max-block-size: calc(100dvh - 16px);
    overflow: auto;
    box-shadow: var(--md-sys-elevation-level2);
  }
  dialog::backdrop {
    background: var(--md-sys-color-scrim);
    opacity: 0.32;
  }
  .calendar {
    inline-size: var(--md-comp-date-picker-width);
    max-inline-size: 100%;
  }
  :host([variant="docked"]) .calendar {
    padding: var(--md-comp-dialog-padding);
    border-radius: var(--md-sys-shape-corner-large);
    background: var(--md-sys-color-surface-container-high);
    box-shadow: var(--md-sys-elevation-level1);
    max-inline-size: 100%;
  }
  :host([variant="docked"]) .calendar footer {
    display: flex;
    justify-content: end;
    gap: var(--md-comp-action-gap);
  }
  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--md-comp-field-gap);
  }
  .calendar-header button {
    min-block-size: var(--md-comp-action-target);
    min-inline-size: var(--md-comp-action-target);
  }
  .calendar-header label {
    min-block-size: 0;
    font: var(--md-sys-typescale-body-small-font);
    flex-direction: column;
    gap: 0;
  }
  .calendar-header select,
  .calendar-header input {
    max-inline-size: 8em;
    background: var(--md-sys-color-surface-container-high);
    color: inherit;
    border: 1px solid var(--md-sys-color-outline);
    border-radius: var(--md-sys-shape-corner-extra-small);
    min-block-size: var(--md-comp-action-target);
  }
  table {
    border-collapse: collapse;
    inline-size: 100%;
    table-layout: fixed;
  }
  th {
    color: var(--md-sys-color-on-surface-variant);
    font: var(--md-sys-typescale-body-small-font);
    padding-block: var(--md-comp-action-gap);
  }
  td {
    padding: 0;
    text-align: center;
  }
  td button {
    position: relative;
    inline-size: 40px;
    block-size: 40px;
    margin-inline: auto;
    border-radius: var(--md-sys-shape-corner-full);
  }
  td button::after {
    content: "";
    position: absolute;
    inset: -4px;
  }
  td[aria-selected="true"] {
    background: var(--md-sys-color-secondary-container);
  }
  td button[data-endpoint] {
    background-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
  }
  td button[aria-current="date"]:not([data-endpoint]) {
    box-shadow: inset 0 0 0 1px var(--md-sys-color-primary);
  }
  footer {
    display: flex;
    justify-content: end;
    gap: var(--md-comp-action-gap);
    margin-block-start: var(--md-comp-dialog-gap);
  }
  footer button {
    min-block-size: var(--md-comp-action-target);
    color: var(--md-sys-color-primary);
    padding-inline: var(--md-comp-field-padding);
  }
  .time-selectors {
    display: flex;
    gap: var(--md-comp-action-gap);
    align-items: center;
    justify-content: center;
    direction: ltr;
  }
  .time-selectors button,
  .time-selectors input {
    inline-size: var(--md-comp-time-selector-width);
    block-size: var(--md-comp-time-selector-height);
    border-radius: var(--md-sys-shape-corner-small);
    background: var(--md-sys-color-surface-container-highest);
    font: var(--md-sys-typescale-display-medium-font);
    border: 0;
    text-align: center;
  }
  .time-selectors [aria-pressed="true"] {
    background: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
  }
  .dial {
    position: relative;
    inline-size: var(--md-comp-time-dial-size);
    block-size: var(--md-comp-time-dial-size);
    max-inline-size: 100%;
    border-radius: var(--md-sys-shape-corner-full);
    background: var(--md-sys-color-surface-container-highest);
    margin: var(--md-comp-dialog-gap) auto;
    direction: ltr;
    touch-action: none;
  }
  .dial button {
    position: absolute;
    transform: translate(-50%, -50%);
    inline-size: 32px;
    block-size: 32px;
    border: 0;
    border-radius: var(--md-sys-shape-corner-full);
    background: transparent;
    color: var(--md-sys-color-on-surface);
    font: var(--md-sys-typescale-body-small-font);
    font-variant-numeric: tabular-nums;
    cursor: pointer;
  }
  .dial {
    touch-action: none;
  }
  .dial button:hover {
    background: color-mix(
      in srgb,
      var(--md-sys-color-on-surface) 8%,
      transparent
    );
  }
  .dial button:focus-visible {
    outline: 2px solid var(--md-sys-color-secondary);
    outline-offset: 2px;
  }
  .dial button[aria-selected="true"] {
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    font: var(--md-sys-typescale-title-medium-font);
  }
  .time-selectors {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--md-comp-action-gap);
  }
  .time-selectors > span {
    font: var(--md-sys-typescale-display-medium-font);
    color: var(--md-sys-color-on-surface);
  }
  .time-selectors > button {
    min-inline-size: var(--md-comp-time-selector-width);
    min-block-size: var(--md-comp-time-selector-height);
    border-radius: var(--md-sys-shape-corner-small);
    background: var(--md-sys-color-surface-container-highest);
    color: var(--md-sys-color-on-surface);
    font: var(--md-sys-typescale-display-medium-font);
  }
  .time-selectors > button[aria-pressed="true"] {
    background: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
  }
  .period {
    display: flex;
    justify-content: center;
    gap: var(--md-comp-action-gap);
  }
  .period label {
    border: 1px solid var(--md-sys-color-outline);
    border-radius: var(--md-sys-shape-corner-small);
    padding-inline: var(--md-comp-action-gap);
  }
  .picker-title {
    font: var(--md-sys-typescale-title-large-font);
    margin-block-end: var(--md-comp-dialog-gap);
  }
`;

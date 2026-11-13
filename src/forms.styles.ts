import { css } from "lit";
import { checkMaskStyles } from "./icons.js";
export const formStyles = css`
  :host {
    --bb-glint-color: rgb(from color-mix(in srgb, var(--md-sys-color-primary) 12%, white) r g b / 0.35);
  }
  :host {
    display: inline-block;
    max-inline-size: 100%;
  }
  label {
    display: flex;
    align-items: center;
    gap: var(--md-comp-action-gap);
    min-block-size: var(--md-comp-action-target);
    cursor: pointer;
  }
  input {
    accent-color: var(--md-sys-color-primary);
  }
  input[type="checkbox"],
  input[type="radio"] {
    appearance: none;
    display: grid;
    place-content: center;
    inline-size: var(--md-comp-selection-size);
    block-size: var(--md-comp-selection-size);
    margin: 0;
    border: 2px solid var(--md-sys-color-on-surface-variant);
    border-radius: 2px;
    background: transparent;
    cursor: pointer;
    transition:
      background-color var(--md-sys-motion-duration-short2)
        var(--md-sys-motion-easing-standard),
      border-color var(--md-sys-motion-duration-short2)
        var(--md-sys-motion-easing-standard),
      var(--bb-shape-motion);
  }
  input[type="radio"] {
    border-radius: var(--md-sys-shape-corner-full);
  }
  input[type="checkbox"]::after {
    content: "";
    inline-size: 10px;
    block-size: 6px;
    border-inline-start: 2px solid var(--md-sys-color-on-primary);
    border-block-end: 2px solid var(--md-sys-color-on-primary);
    transform: translateY(-1px) rotate(-45deg) scale(0);
    transition: transform var(--md-sys-motion-duration-short2)
      var(--md-sys-motion-easing-emphasized-decelerate),
      var(--bb-shape-motion);
  }
  input[type="checkbox"]:checked,
  input[type="checkbox"]:indeterminate {
    background: var(--md-sys-color-primary);
    border-color: var(--md-sys-color-primary);
  }
  input[type="checkbox"]:checked::after {
    transform: translateY(-1px) rotate(-45deg) scale(1);
  }
  input[type="checkbox"]:indeterminate::after {
    inline-size: 10px;
    block-size: 0;
    border-block-end: 2px solid var(--md-sys-color-on-primary);
    border-inline-start: 0;
    transform: none;
  }
  input[type="radio"]::after {
    content: "";
    inline-size: 10px;
    block-size: 10px;
    border-radius: var(--md-sys-shape-corner-full);
    background: var(--md-sys-color-on-primary);
    transform: scale(0);
    transition: transform var(--md-sys-motion-duration-short2)
      var(--md-sys-motion-easing-emphasized-decelerate),
      var(--bb-shape-motion);
  }
  input[type="radio"]:checked {
    border: 5px solid var(--md-sys-color-primary);
  }
  input[type="radio"]:checked::after {
    transform: scale(0);
  }
  input[type="checkbox"]:focus-visible,
  input[type="radio"]:focus-visible {
    outline: 2px solid var(--md-sys-color-secondary);
    outline-offset: 2px;
  }
  input[type="checkbox"][aria-invalid="true"],
  input[type="radio"][aria-invalid="true"] {
    border-color: var(--md-sys-color-error);
  }
  /* The input is visually hidden but absolutely positioned: without a containing
     block on the host it resolves against the initial containing block, escapes
     ancestor scroll containers and grows the document scroll height. */
  :host([switch]) {
    position: relative;
  }
  :host([switch]) input {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    margin: 0;
    opacity: 0;
    pointer-events: none;
  }
  :host([switch]) .switch-ui {
    position: relative;
    flex: 0 0 auto;
    inline-size: var(--md-comp-switch-width);
    block-size: var(--md-comp-switch-height);
    border-radius: var(--md-sys-shape-corner-full);
    border: 2px solid var(--md-sys-color-outline);
    background: var(--md-sys-color-surface-container-highest);
    transition:
      background-color var(--md-sys-motion-duration-short2)
        var(--md-sys-motion-easing-emphasized),
      border-color var(--md-sys-motion-duration-short2)
        var(--md-sys-motion-easing-emphasized),
      var(--bb-shape-motion);
  }
  :host([switch]) .switch-handle {
    position: absolute;
    display: grid;
    place-items: center;
    inline-size: 16px;
    block-size: 16px;
    inset-block-start: 6px;
    inset-inline-start: 8px;
    border-radius: var(--md-sys-shape-corner-full);
    background: var(--md-sys-color-outline);
    color: var(--md-sys-color-surface-container-highest);
    transition:
      inset-inline-start var(--md-sys-motion-duration-short2)
        var(--md-sys-motion-easing-emphasized),
      inline-size var(--md-sys-motion-duration-short2)
        var(--md-sys-motion-easing-emphasized),
      block-size var(--md-sys-motion-duration-short2)
        var(--md-sys-motion-easing-emphasized),
      background-color var(--md-sys-motion-duration-short2)
        var(--md-sys-motion-easing-emphasized),
      var(--bb-shape-motion);
  }
  :host([switch]) .switch-icon {
    display: grid;
    place-items: center;
    font-size: 16px;
    line-height: 1;
  }
  :host([switch]) .switch-icon svg,
  :host([switch]) .switch-icon .icon {
    inline-size: 16px;
    block-size: 16px;
  }
  :host([switch]) .switch-icon-on {
    display: none;
  }
  :host([switch]) input:checked + .switch-ui {
    background: var(--md-sys-color-primary);
    border-color: var(--md-sys-color-primary);
  }
  :host([switch]) input:checked + .switch-ui .switch-handle {
    inline-size: 24px;
    block-size: 24px;
    inset-block-start: 2px;
    inset-inline-start: 20px;
    background: var(--md-sys-color-on-primary);
    color: var(--md-sys-color-on-primary-container);
  }
  :host([switch]) input:checked + .switch-ui .switch-handle .switch-icon-off {
    display: none;
  }
  :host([switch]) input:checked + .switch-ui .switch-handle .switch-icon-on {
    display: grid;
  }
  :host([switch]) input:focus-visible + .switch-ui {
    outline: 2px solid var(--md-sys-color-secondary);
    outline-offset: 2px;
  }
  :host([switch]) input:disabled + .switch-ui {
    opacity: var(--md-sys-state-disabled-content-opacity);
  }
  :host([switch]) input[aria-invalid="true"] + .switch-ui {
    border-color: var(--md-sys-color-error);
  }
  .field {
    position: relative;
    display: grid;
    gap: var(--md-comp-field-gap);
    min-inline-size: 0;
  }
  .field label {
    display: grid;
    align-items: start;
    gap: 0;
    padding: var(--md-comp-field-padding-block-start)
      var(--md-comp-field-padding) var(--md-comp-field-padding-block-end);
    background: var(--md-sys-color-surface-container-highest);
    border-radius: var(--md-sys-shape-corner-extra-small)
      var(--md-sys-shape-corner-extra-small) 0 0;
    border-block-end: 1px solid var(--md-sys-color-on-surface-variant);
    cursor: text;
  }
  .search {
    display: grid;
    gap: var(--md-comp-field-gap);
  }
  .search form {
    display: flex;
    align-items: center;
    gap: var(--md-comp-action-gap);
    min-block-size: 56px;
    padding-inline: var(--md-comp-search-bar-leading-space)
      var(--md-comp-search-bar-trailing-space);
    border-radius: var(--md-sys-shape-corner-full);
    background: var(--md-sys-color-surface-container-high);
  }
  .search form .field {
    flex: 1;
  }
  /* The field sits in a plain wrapper that has to grow, otherwise the input
     shrinks to its content width inside the bar. */
  .search form > div {
    flex: 1;
    min-inline-size: 0;
  }
  .search form .field label {
    background: transparent;
    border: 0;
    min-block-size: 0;
    padding: 0;
  }
  /* A search bar carries the placeholder only: the label and the supporting text
     stay in the accessibility tree, out of the pill. */
  .search form .field-label,
  .search form .support-row {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  /* The bar carries the focus indicator, not the field inside it. */
  .search form .field label:focus-within {
    outline: none;
  }
  .search form:focus-within {
    outline: 2px solid var(--md-sys-color-primary);
    outline-offset: -2px;
  }
  .search[data-layout="full-screen"] form {
    border-radius: 0;
  }
  :host([appearance="divided"]) .search form {
    border-radius: 0;
    background: transparent;
    border-block-end: 1px solid var(--md-sys-color-outline-variant);
  }
  .search-results {
    border-radius: var(--md-sys-shape-corner-large);
    background: var(--md-sys-color-surface-container-low);
    overflow: clip;
  }
  .search-results[hidden] {
    display: none;
  }
  .search-suggestions {
    margin: 0;
    padding: var(--md-comp-menu-container-padding);
    list-style: none;
    border-radius: var(--md-sys-shape-corner-large);
    background: var(--md-sys-color-surface-container-low);
    box-shadow: var(--md-sys-elevation-level2);
  }
  .search-suggestions[hidden] {
    display: none;
  }
  .search-suggestions li {
    display: flex;
    align-items: center;
    min-block-size: var(--md-comp-menu-item-target-height);
    padding-inline: var(--md-comp-field-padding);
    border-radius: var(--md-sys-shape-corner-small);
    color: var(--md-sys-color-on-surface);
    cursor: pointer;
  }
  .search-suggestions li:hover {
    background: var(--md-sys-color-surface-container-high);
  }
  .search-suggestions li[aria-selected="true"] {
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
  }
  :host([variant="outlined"]) .field label {
    background: transparent;
    border: 1px solid var(--md-sys-color-outline);
    border-radius: var(--md-sys-shape-corner-extra-small);
    padding-block: var(--md-comp-field-padding-block-start);
  }
  .field label:focus-within {
    outline: 2px solid var(--md-sys-color-primary);
    outline-offset: -2px;
  }
  .field-label {
    font: var(--md-sys-typescale-body-small-font);
    letter-spacing: var(--md-sys-typescale-body-small-tracking);
  }
  .field-body {
    display: flex;
    align-items: center;
    gap: var(--md-comp-action-gap);
    min-inline-size: 0;
  }
  .field-body input,
  .field-body textarea {
    flex: 1;
  }
  .affix,
  .support-row .counter {
    color: var(--md-sys-color-on-surface-variant);
    font: var(--md-sys-typescale-body-small-font);
  }
  .support-row {
    display: flex;
    justify-content: space-between;
    gap: var(--md-comp-action-gap);
  }
  .autocomplete-list {
    position: fixed;
    inset: auto;
    z-index: 20;
    box-sizing: border-box;
    max-block-size: min(320px, calc(100dvh - 16px));
    margin: 0;
    border: 0;
    padding: var(--md-comp-menu-container-padding);
    overflow-y: auto;
    list-style: none;
    border-radius: var(--md-comp-menus-standard-menu-container-shape);
    background: var(--md-sys-color-surface-container-low);
    color: var(--md-sys-color-on-surface);
    box-shadow: var(--md-sys-elevation-level2);
    font: var(--md-sys-typescale-label-large-font);
    letter-spacing: var(--md-sys-typescale-label-large-tracking);
  }
  .autocomplete-list li {
    display: flex;
    align-items: center;
    min-block-size: var(--md-comp-menu-item-height);
    padding: var(--md-comp-menu-item-vertical-padding)
      var(--md-comp-menu-item-horizontal-padding);
    border-radius: var(--md-comp-menus-standard-menu-item-shape);
    cursor: pointer;
  }
  .autocomplete-list li:hover {
    background-image: linear-gradient(
      var(--bolle-state-hover),
      var(--bolle-state-hover)
    );
  }
  .autocomplete-list li[aria-selected="true"] {
    background-image: linear-gradient(
      var(--bolle-state-pressed),
      var(--bolle-state-pressed)
    );
  }
  .autocomplete-list li[aria-disabled="true"] {
    cursor: default;
    opacity: var(--md-sys-state-disabled-content-opacity);
  }
  :host([error]) .support,
  .required {
    color: var(--md-sys-color-error);
  }
  .field input,
  .field textarea {
    border: 0;
    background: transparent;
    outline: none;
    inline-size: 100%;
    min-inline-size: 0;
    block-size: 24px;
    padding: 0;
    color: inherit;
    font: var(--md-sys-typescale-body-large-font);
    letter-spacing: var(--md-sys-typescale-body-large-tracking);
  }
  .field textarea {
    block-size: auto;
    min-block-size: 24px;
    resize: vertical;
  }
  .field span {
    font: var(--md-sys-typescale-body-small-font);
    color: var(--md-sys-color-on-surface-variant);
  }
  .field textarea {
    resize: vertical;
  }
  :host([error]) .field label {
    border-color: var(--md-sys-color-error);
  }
  .choice {
    display: grid;
    gap: 2px;
  }
  .choice-support {
    font: var(--md-sys-typescale-body-small-font);
    letter-spacing: var(--md-sys-typescale-body-small-tracking);
    color: var(--md-sys-color-on-surface-variant);
    padding-inline-start: calc(
      var(--md-comp-selection-size) + 3 * var(--md-comp-action-gap)
    );
  }
  :host([error]) .choice-support {
    color: var(--md-sys-color-error);
  }
  fieldset {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    margin: 0;
    padding: 0;
    border: 0;
    min-inline-size: 0;
  }
  fieldset legend {
    padding: 0;
    margin-block-end: var(--md-comp-field-gap);
    font: var(--md-sys-typescale-label-large-font);
    letter-spacing: var(--md-sys-typescale-label-large-tracking);
  }
  fieldset label {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--md-comp-action-gap);
    min-block-size: 40px;
    padding-inline: var(--md-comp-field-padding);
    border: 1px solid var(--md-sys-color-outline);
    border-inline-start-width: 0;
    font: var(--md-sys-typescale-label-large-font);
    letter-spacing: var(--md-sys-typescale-label-large-tracking);
    cursor: pointer;
  }
  fieldset label::after {
    content: "";
    position: absolute;
    inset: -4px 0;
  }
  fieldset label:first-of-type {
    border-inline-start-width: 1px;
    border-start-start-radius: var(--md-sys-shape-corner-full);
    border-end-start-radius: var(--md-sys-shape-corner-full);
  }
  fieldset label:last-of-type {
    border-start-end-radius: var(--md-sys-shape-corner-full);
    border-end-end-radius: var(--md-sys-shape-corner-full);
  }
  fieldset label:has(input:checked) {
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
  }
  fieldset label:has(input:focus-visible) {
    outline: 3px solid var(--md-sys-color-secondary);
    outline-offset: 2px;
  }
  fieldset input {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    opacity: 0;
    margin: 0;
    pointer-events: none;
  }
  fieldset label:has(input:checked) > span[aria-hidden="true"] {
    display: none;
  }
  fieldset label:has(input:checked)::before {
    ${checkMaskStyles}
  }
  fieldset {
    position: relative;
    isolation: isolate;
  }
  /* Borderless track: one filled pill holds the segments and the liquid drop. */
  .segments {
    position: relative;
    display: inline-flex;
    flex-wrap: wrap;
    gap: 2px;
    padding: 4px;
    border-radius: var(--md-sys-shape-corner-full);
    background: var(--md-sys-color-surface-container-high);
  }
  fieldset .segments label {
    border: 0;
    border-radius: var(--md-sys-shape-corner-full);
  }
  fieldset label {
    z-index: 1;
    transition: color var(--md-sys-motion-duration-short4),
      var(--bb-shape-motion);
  }
  .drop {
    position: absolute;
    inset-block-start: 0;
    left: 0;
    z-index: 0;
    display: none;
    inline-size: var(--drop-w, 0);
    block-size: var(--drop-h, 0);
    translate: var(--drop-x, 0) var(--drop-y, 0);
    border-radius: var(--md-sys-shape-corner-full);
    background: var(--md-sys-color-secondary-container);
    transition:
      translate var(--bb-tension-duration) var(--bb-tension),
      inline-size var(--bb-tension-duration) var(--bb-tension),
      var(--bb-shape-motion);
  }
  fieldset[data-drop] .drop {
    display: block;
  }
  fieldset[data-drop] label:has(input:checked) {
    background: transparent;
  }
  @media (prefers-reduced-motion: reduce) {
    .drop {
      transition: none;
    }
  }
  fieldset label {
    color: var(--md-sys-color-on-surface);
  }
`;

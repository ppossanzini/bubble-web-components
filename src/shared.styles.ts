import { css } from "lit";

/** Bolle signature: tail corner toward the origin, inflate on open, pop on close. */
export const bolleStyles = css`
  :host {
    -webkit-user-select: none;
    user-select: none;
  }
  input,
  textarea,
  [contenteditable]:not([contenteditable="false"]) {
    -webkit-user-select: text;
    user-select: text;
  }
  [data-tail] {
    --bb-r: var(--bb-corner, var(--bb-radius));
    --bb-shape: var(--bb-r);
  }
  [data-tail="top-left"] {
    --bb-shape: var(--bb-tail) var(--bb-r) var(--bb-r) var(--bb-r);
    transform-origin: top left;
  }
  [data-tail="top-right"] {
    --bb-shape: var(--bb-r) var(--bb-tail) var(--bb-r) var(--bb-r);
    transform-origin: top right;
  }
  [data-tail="bottom-right"] {
    --bb-shape: var(--bb-r) var(--bb-r) var(--bb-tail) var(--bb-r);
    transform-origin: bottom right;
  }
  [data-tail="bottom-left"] {
    --bb-shape: var(--bb-r) var(--bb-r) var(--bb-r) var(--bb-tail);
    transform-origin: bottom left;
  }
  [popover][data-tail] {
    transition:
      opacity var(--bb-pop-duration) ease-in,
      scale var(--bb-pop-duration) ease-in,
      overlay var(--bb-pop-duration) allow-discrete,
      display var(--bb-pop-duration) allow-discrete;
  }
  [popover][data-tail]:popover-open {
    animation: bb-inflate var(--bb-inflate-duration) ease-out;
  }
  [popover][data-tail]:not(:popover-open) {
    opacity: 0;
    scale: 1.05;
  }
  @keyframes bb-inflate {
    0% {
      opacity: 0;
      scale: 0.6;
    }
    55% {
      opacity: 1;
      scale: 1.04;
    }
    80% {
      scale: 0.99;
    }
    100% {
      scale: 1;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    [popover][data-tail]:popover-open {
      animation: bb-fade var(--bb-pop-duration) linear;
    }
    [popover][data-tail]:not(:popover-open) {
      scale: none;
    }
    @keyframes bb-fade {
      from {
        opacity: 0;
      }
    }
  }
`;

export const commonStyles = css`
  ${bolleStyles}
  /* Film ring: decorative halo around the solid focus outline or the selected state. */
  .button::before,
  .chip::before {
    content: "";
    position: absolute;
    inset: calc(-1 * var(--bb-ring-gap));
    padding: var(--bb-ring-width);
    border-radius: inherit;
    background: var(--bb-film);
    mask:
      linear-gradient(#000 0 0) content-box exclude,
      linear-gradient(#000 0 0);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--md-sys-motion-duration-short3);
  }
  .button:focus-visible::before,
  .chip:has(:focus-visible)::before {
    opacity: 1;
  }
  /* Solid inner ring carries focus; the film ring outside it is only decoration. */
  .button:focus-visible,
  .chip label:has(input:focus-visible),
  .chip :is(button, a):focus-visible {
    outline: 2px solid var(--md-sys-color-primary);
    outline-offset: 1px;
  }
  :host([selected]),
  [aria-current="page"],
  [aria-current="true"],
  [aria-selected="true"],
  [aria-pressed="true"],
  label:has(input:checked) {
    --md-icon-fill: 1;
  }
  @media (forced-colors: active) {
    .button::before,
    .chip::before {
      display: none;
    }
  }
  .icon {
    font-family: var(--md-ref-typeface-icons, inherit);
    font-variation-settings:
      "FILL" var(--md-icon-fill, 0),
      "wght" var(--md-icon-weight, 400),
      "GRAD" 0,
      "opsz" var(--md-icon-optical-size, 24);
    font-weight: 400;
    font-size: 24px;
    line-height: 1;
    direction: ltr;
    text-transform: none;
    transition: font-variation-settings var(--md-sys-motion-duration-short4);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  :host {
    box-sizing: border-box;
    color: var(--md-sys-color-on-surface);
    font: var(--md-sys-typescale-body-large-font, 400 16px/24px system-ui);
    letter-spacing: var(--md-sys-typescale-body-large-tracking, 0.5px);
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  [hidden] {
    display: none !important;
  }
  button,
  input,
  textarea,
  select {
    font: inherit;
    color: inherit;
  }
  button,
  a,
  summary,
  input[type="range"],
  input[type="checkbox"],
  input[type="radio"] {
    cursor: pointer;
  }
  button,
  a {
    -webkit-tap-highlight-color: transparent;
  }
  button {
    border: 0;
    background: none;
  }
  button:disabled,
  input:disabled {
    cursor: default;
    opacity: var(--md-sys-state-disabled-content-opacity);
  }
  :focus-visible {
    outline: var(--md-sys-state-focus-indicator-thickness) solid
      var(--md-sys-state-focus-indicator-color);
    outline-offset: var(--md-sys-state-focus-indicator-inner-offset);
  }
  button,
  a {
    position: relative;
  }
  button:not(:disabled):hover,
  a:hover,
  label:has(> input:not(:disabled)):hover {
    background-image:
      linear-gradient(var(--bolle-state-hover), var(--bolle-state-hover)),
      var(--bb-hover-glint);
    background-size: 100% 100%, var(--bb-glint-box) var(--bb-glint-box);
    background-position: 0 0, var(--bb-glint-position);
    background-repeat: no-repeat;
  }
  button:not(:disabled):active,
  a:active,
  label:has(> input:not(:disabled)):active {
    background-image:
      linear-gradient(var(--bolle-state-pressed), var(--bolle-state-pressed)),
      var(--bb-hover-glint);
    background-size: 100% 100%, var(--bb-glint-box) var(--bb-glint-box);
    background-position: 0 0, var(--bb-glint-position);
    background-repeat: no-repeat;
  }
  :host {
    --bolle-state-hover: color-mix(in srgb, currentColor 8%, transparent);
    --bolle-state-pressed: color-mix(in srgb, currentColor 10%, transparent);
    /* Hard-edged quarter arc in a corner box, curving with the rounded corner; declared on the host to read its --bb-glint-color. */
    --bb-glint-box: 14px;
    --bb-glint-position: right 0 top 0;
    --bb-hover-glint: radial-gradient(
      circle at 0 100%,
      transparent 0 7px,
      var(--bb-glint-color, rgb(255 255 255 / 0.1)) 7.5px 10.5px,
      transparent 11px
    );
  }
  .support {
    color: var(--md-sys-color-on-surface-variant);
    font: var(--md-sys-typescale-body-small-font);
  }
  @media (prefers-reduced-motion: reduce) {
    *:not([data-tail]),
    *::before,
    *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
  }
`;

import { css } from "lit";

export const commonStyles = css`
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
  a:hover {
    background-image: linear-gradient(
      var(--bubble-state-hover),
      var(--bubble-state-hover)
    );
  }
  button:not(:disabled):active,
  a:active {
    background-image: linear-gradient(
      var(--bubble-state-pressed),
      var(--bubble-state-pressed)
    );
  }
  :host {
    --bubble-state-hover: color-mix(in srgb, currentColor 8%, transparent);
    --bubble-state-pressed: color-mix(in srgb, currentColor 10%, transparent);
  }
  .support {
    color: var(--md-sys-color-on-surface-variant);
    font: var(--md-sys-typescale-body-small-font);
  }
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
  }
`;

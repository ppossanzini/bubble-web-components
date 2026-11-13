import { css } from "lit";

export const menuStyles = css`
  :host {
    display: contents;
    --menu-container: var(
      --md-comp-menus-standard-container-color,
      var(--md-sys-color-surface-container-low)
    );
    --menu-content: var(--md-sys-color-on-surface);
    --menu-secondary: var(--md-sys-color-on-surface-variant);
    --menu-selected: var(--md-sys-color-tertiary-container);
    --menu-on-selected: var(--md-sys-color-on-tertiary-container);
  }
  :host([variant="baseline"]) {
    --menu-container: var(--md-sys-color-surface-container);
    --menu-selected: var(--md-sys-color-secondary-container);
    --menu-on-selected: var(--md-sys-color-on-secondary-container);
    --md-comp-menu-item-horizontal-padding: 12px;
    --md-comp-menu-icon-size: 24px;
  }
  :host([color-scheme="vibrant"]) {
    --menu-container: var(
      --md-comp-menus-vibrant-container-color,
      var(--md-sys-color-tertiary-container)
    );
    --menu-content: var(--md-sys-color-on-tertiary-container);
    --menu-secondary: var(--md-sys-color-on-tertiary-container);
    --menu-selected: var(--md-sys-color-tertiary);
    --menu-on-selected: var(--md-sys-color-on-tertiary);
  }
  [popover] {
    position: fixed;
    inset: auto;
    margin: 0;
    box-sizing: border-box;
    min-inline-size: var(--md-comp-menu-min-width);
    max-inline-size: min(var(--md-comp-menu-max-width), 100vw);
    max-block-size: 100dvh;
    overflow-y: auto;
    border: 0;
    padding: var(--md-comp-menu-container-padding);
    background: color-mix(
      in srgb,
      var(--menu-container) var(--bb-glass-opacity, 100%),
      transparent
    );
    backdrop-filter: blur(var(--bb-glass-blur, 0px));
    color: var(--menu-content);
    --bb-corner: var(--bb-radius);
    border-radius: var(
      --bb-shape,
      var(--md-comp-menus-standard-menu-container-shape)
    );
    box-shadow: var(--bb-float-2, var(--md-sys-elevation-level2));
    font: var(--md-sys-typescale-label-large-font);
    letter-spacing: var(--md-sys-typescale-label-large-tracking);
  }
  @supports not (backdrop-filter: blur(1px)) {
    [popover] {
      background: var(--menu-container);
    }
  }
  :host([variant="baseline"]) [popover] {
    border-radius: var(--md-comp-menu-container-shape);
  }
  :host([inactive]) [popover] {
    border-radius: var(--md-comp-menus-standard-menu-inactive-container-shape);
  }
  :host([quick]) [popover] {
    animation: none;
  }
  button,
  a {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--md-comp-menu-item-between-space);
    box-sizing: border-box;
    inline-size: 100%;
    min-block-size: var(--md-comp-menu-item-height);
    padding: var(--md-comp-menu-item-vertical-padding)
      var(--md-comp-menu-item-horizontal-padding);
    border: 0;
    border-radius: var(--md-comp-menus-standard-menu-item-shape);
    background: transparent;
    color: inherit;
    text-decoration: none;
    text-align: start;
    font: inherit;
    cursor: pointer;
    isolation: isolate;
    transition: border-radius var(--md-sys-motion-duration-short2)
      var(--md-sys-motion-easing-standard),
      var(--bb-shape-motion);
  }
  button::after,
  a::after {
    content: "";
    position: absolute;
    inset: -2px 0;
  }
  :host([variant="baseline"]) button,
  :host([variant="baseline"]) a {
    min-block-size: var(--md-comp-menu-item-target-height);
    border-radius: 0;
  }
  :host([variant="baseline"]) button::after,
  :host([variant="baseline"]) a::after {
    content: none;
  }
  button::before,
  a::before {
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: inherit;
    background: currentColor;
    opacity: 0;
    content: "";
    pointer-events: none;
  }
  :is(button, a):hover::before,
  [aria-expanded="true"]::before {
    opacity: var(--md-sys-state-hover-state-layer-opacity);
  }
  :is(button, a):focus-visible::before {
    opacity: var(--md-sys-state-focus-state-layer-opacity);
  }
  :is(button, a):active::before {
    opacity: var(--md-sys-state-pressed-state-layer-opacity);
  }
  :is(button, a):focus-visible {
    outline: var(--md-sys-state-focus-indicator-thickness) solid
      var(--md-sys-color-secondary);
    outline-offset: var(--md-sys-state-focus-indicator-inner-offset);
  }
  .group-label {
    padding: calc(var(--md-comp-menu-item-vertical-padding) * 2)
      var(--md-comp-menu-item-horizontal-padding)
      var(--md-comp-menu-item-vertical-padding);
    font: var(--md-sys-typescale-label-medium-font);
    letter-spacing: var(--md-sys-typescale-label-medium-tracking);
    color: var(--menu-secondary);
  }
  .group + .group {
    border-block-start: 1px solid var(--md-sys-color-outline-variant);
  }
  button:first-child,
  a:first-child {
    border-start-start-radius: var(
      --md-comp-menus-standard-menu-item-selected-shape
    );
    border-start-end-radius: var(
      --md-comp-menus-standard-menu-item-selected-shape
    );
  }
  button:last-child,
  a:last-child {
    border-end-start-radius: var(
      --md-comp-menus-standard-menu-item-selected-shape
    );
    border-end-end-radius: var(
      --md-comp-menus-standard-menu-item-selected-shape
    );
  }
  :host([variant="baseline"]) button:first-child,
  :host([variant="baseline"]) a:first-child,
  :host([variant="baseline"]) button:last-child,
  :host([variant="baseline"]) a:last-child {
    border-radius: 0;
  }
  [aria-checked="true"] {
    background: var(--menu-selected);
    color: var(--menu-on-selected);
    border-radius: var(--md-comp-menus-standard-menu-item-selected-shape);
  }
  [aria-disabled="true"] {
    cursor: default;
  }
  [aria-disabled="true"] > * {
    opacity: var(--md-sys-state-disabled-content-opacity);
  }
  [aria-disabled="true"]::before {
    opacity: 0 !important;
  }
  .content {
    flex: 1;
    min-inline-size: 0;
    overflow-wrap: anywhere;
  }
  .supporting,
  .trailing {
    color: var(--menu-secondary);
  }
  .supporting {
    display: block;
    font: var(--md-sys-typescale-body-small-font);
    letter-spacing: var(--md-sys-typescale-body-small-tracking);
  }
  [aria-checked="true"] .supporting,
  [aria-checked="true"] .trailing {
    color: inherit;
  }
  .indicator {
    inline-size: var(--md-comp-menu-icon-size);
    flex-shrink: 0;
    text-align: center;
  }
  [role="separator"] {
    block-size: var(--md-comp-menu-divider-height);
    margin-block: var(--md-comp-menu-divider-space);
    background: var(--md-sys-color-outline-variant);
  }
  @media (prefers-reduced-motion: reduce) {
    button,
    a {
      transition: none;
    }
  }
  @media (forced-colors: active) {
    [popover] {
      border: 1px solid CanvasText;
    }
    [aria-checked="true"] {
      outline: 1px solid Highlight;
    }
    button::before,
    a::before {
      display: none;
    }
  }
`;

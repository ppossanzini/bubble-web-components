import { css } from "lit";
export const overlayStyles = css`
  :host {
    display: contents;
  }
  dialog {
    color: var(--md-sys-color-on-surface);
    background: var(--md-sys-color-surface-container-high);
    border: 0;
    border-radius: var(--md-sys-shape-corner-extra-large);
    padding: var(--md-comp-dialog-padding);
    max-inline-size: min(var(--md-comp-dialog-max-width), calc(100vw - 32px));
    max-block-size: calc(100dvh - 32px);
    overflow: auto;
    box-shadow: var(--md-sys-elevation-level2);
  }
  dialog[open] {
    animation: overlay-in var(--md-sys-motion-duration-medium2)
      var(--md-sys-motion-easing-emphasized-decelerate);
  }
  dialog[open]::backdrop {
    animation: backdrop-in var(--md-sys-motion-duration-medium2)
      var(--md-sys-motion-easing-emphasized-decelerate);
  }
  :host([placement="bottom"]) dialog[open] {
    animation-name: sheet-in-bottom;
  }
  :host([placement="side"]) dialog[open] {
    animation-name: sheet-in-side;
  }
  :host([variant="fullscreen"]) dialog[open],
  :host([variant="full-screen"]) dialog[open] {
    animation-name: page-in;
  }
  @keyframes overlay-in {
    from {
      opacity: 0;
      transform: scale(0.92);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
  @keyframes sheet-in-bottom {
    from {
      transform: translateY(24px);
      opacity: 0;
    }
    to {
      transform: none;
      opacity: 1;
    }
  }
  @keyframes sheet-in-side {
    from {
      transform: translateX(8%);
      opacity: 0;
    }
    to {
      transform: none;
      opacity: 1;
    }
  }
  @keyframes page-in {
    from {
      transform: translateY(24px);
      opacity: 0;
    }
    to {
      transform: none;
      opacity: 1;
    }
  }
  @keyframes backdrop-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 0.32;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    dialog[open],
    dialog[open]::backdrop {
      animation: none;
    }
  }
  dialog::backdrop {
    background: var(--md-sys-color-scrim);
    opacity: 0.32;
  }
  header {
    font: var(--md-sys-typescale-headline-small-font);
    margin-block-end: var(--md-comp-dialog-gap);
  }
  slot::slotted(p) {
    margin: 0;
    color: var(--md-sys-color-on-surface-variant);
    font: var(--md-sys-typescale-body-medium-font);
    letter-spacing: var(--md-sys-typescale-body-medium-tracking);
  }
  footer {
    display: flex;
    justify-content: end;
    gap: var(--md-comp-action-gap);
    margin-block-start: var(--md-comp-dialog-padding);
  }
  :host([variant="fullscreen"]) dialog,
  :host([variant="full-screen"]) dialog {
    max-inline-size: none;
    max-block-size: none;
    inline-size: 100vw;
    block-size: 100dvh;
    border-radius: 0;
    margin: 0;
  }
  :host([placement="bottom"]) dialog {
    margin: auto auto 0;
    inline-size: min(100vw, var(--md-comp-sheet-max-width));
    max-inline-size: 100vw;
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }
  :host([placement="side"]) dialog {
    margin: 0 0 0 auto;
    block-size: 100dvh;
    max-block-size: 100dvh;
    inline-size: min(90vw, var(--md-comp-side-sheet-width));
    border-start-start-radius: var(--md-sys-shape-corner-large);
    border-end-start-radius: var(--md-sys-shape-corner-large);
    border-start-end-radius: 0;
    border-end-end-radius: 0;
    padding: 0;
  }
  :host([detached][placement="side"]) dialog,
  :host([detached][placement="start"]) dialog {
    margin: var(--md-comp-side-sheet-detached-margin);
    block-size: calc(100dvh - 2 * var(--md-comp-side-sheet-detached-margin));
    max-block-size: calc(
      100dvh - 2 * var(--md-comp-side-sheet-detached-margin)
    );
    border-radius: var(--md-sys-shape-corner-large);
  }
  :host([detached][placement="side"]) dialog {
    margin-inline-start: auto;
  }
  :host([detached][placement="start"]) dialog {
    margin-inline-end: auto;
  }
  .drag-handle {
    inline-size: var(--md-comp-bottom-sheet-drag-handle-width);
    block-size: var(--md-comp-bottom-sheet-drag-handle-height);
    margin: 0 auto var(--md-comp-dialog-gap);
    border-radius: var(--md-sys-shape-corner-full);
    background: var(--md-sys-color-on-surface-variant);
    opacity: 0.4;
  }
  :host(:dir(rtl)[placement="side"]) dialog {
    margin: 0 auto 0 0;
  }
  :host([placement="start"]) dialog {
    margin: 0 auto 0 0;
    block-size: 100dvh;
    max-block-size: 100dvh;
    inline-size: min(90vw, var(--md-comp-side-sheet-width));
    border-start-end-radius: var(--md-sys-shape-corner-large);
    border-end-end-radius: var(--md-sys-shape-corner-large);
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }
  :host(:dir(rtl)[placement="start"]) dialog {
    margin: 0 0 0 auto;
    border-start-start-radius: var(--md-sys-shape-corner-extra-large);
    border-end-start-radius: var(--md-sys-shape-corner-extra-large);
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }
  @keyframes snackbar-in {
    from {
      opacity: 0;
      translate: 0 12px;
    }
    to {
      opacity: 1;
      translate: none;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .snackbar {
      animation: none;
    }
  }
  .standard {
    position: fixed;
    z-index: 1;
    padding: var(--md-comp-dialog-padding);
    background: var(--md-sys-color-surface-container-low);
    color: var(--md-sys-color-on-surface);
    box-shadow: var(--md-sys-elevation-level1);
  }
  :host([placement="bottom"]) .standard {
    inset-inline: 0;
    inset-block-end: 0;
    margin-inline: auto;
    inline-size: min(100%, var(--md-comp-sheet-max-width));
    max-block-size: 50dvh;
    overflow: auto;
    border-start-start-radius: var(--md-sys-shape-corner-extra-large);
    border-start-end-radius: var(--md-sys-shape-corner-extra-large);
  }
  :host([placement="side"]) .standard,
  :host([placement="start"]) .standard {
    inset-block: 0;
    inline-size: min(90vw, var(--md-comp-side-sheet-width));
    max-block-size: 100dvh;
    overflow: auto;
    padding: 0;
  }
  .sheet-header {
    position: sticky;
    inset-block-start: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 20px 16px 12px 24px;
    background: inherit;
    font: var(--md-sys-typescale-title-large-font);
    color: var(--md-sys-color-on-surface-variant);
  }
  .sheet-content {
    padding: 8px 24px 24px;
  }
  .drawer-header {
    padding: 16px 28px 8px;
    font: var(--md-sys-typescale-title-small-font);
    letter-spacing: var(--md-sys-typescale-title-small-tracking);
    color: var(--md-sys-color-on-surface-variant);
  }
  .drawer-nav {
    display: grid;
    gap: 4px;
    padding: 0 12px 8px;
  }
  .drawer-item {
    display: flex;
    align-items: center;
    gap: 12px;
    min-block-size: 56px;
    padding-inline: 16px;
    border: 0;
    border-radius: var(--md-sys-shape-corner-full);
    background: transparent;
    color: var(--md-sys-color-on-surface-variant);
    font: var(--md-sys-typescale-label-large-font);
    letter-spacing: var(--md-sys-typescale-label-large-tracking);
    text-align: start;
    text-decoration: none;
    cursor: pointer;
  }
  .drawer-item[aria-current="page"] {
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
  }
  .drawer-item:disabled {
    cursor: default;
    opacity: var(--md-sys-state-disabled-content-opacity);
  }
  .drawer-icon {
    font-size: 24px;
    flex-shrink: 0;
  }
  .drawer-label {
    flex: 1;
    min-inline-size: 0;
  }
  .drawer-badge {
    font: var(--md-sys-typescale-label-small-font);
    color: inherit;
  }
  :host([placement="side"]) .standard {
    inset-inline-end: 0;
    border-start-start-radius: var(--md-sys-shape-corner-large);
    border-end-start-radius: var(--md-sys-shape-corner-large);
  }
  :host([placement="start"]) .standard {
    inset-inline-start: 0;
    border-start-end-radius: var(--md-sys-shape-corner-large);
    border-end-end-radius: var(--md-sys-shape-corner-large);
  }
  :host([variant="standard"]) .standard[hidden] {
    display: none;
  }
  .snackbar {
    animation: snackbar-in var(--md-sys-motion-duration-medium2)
      var(--md-sys-motion-easing-emphasized-decelerate);
    border: 0;
    inset-block-start: auto;
    margin-block: 0;
    inline-size: max-content;
    display: flex;
    align-items: center;
    gap: var(--md-comp-dialog-gap);
    background: var(--md-sys-color-inverse-surface);
    color: var(--md-sys-color-inverse-on-surface);
    border-radius: var(--md-sys-shape-corner-extra-small);
    padding: var(--md-comp-snackbar-padding);
    box-shadow: var(--md-sys-elevation-level3);
    position: fixed;
    inset-inline: var(--md-comp-dialog-padding);
    inset-block-end: var(--md-comp-dialog-padding);
    z-index: 1000;
    min-inline-size: min(100%, var(--md-comp-snackbar-min-width));
    max-inline-size: min(var(--md-comp-snackbar-max-width), calc(100vw - 32px));
    min-block-size: var(--md-comp-snackbar-height);
    font: var(--md-sys-typescale-body-medium-font);
    margin-inline: auto;
  }
  .snackbar > span {
    font: var(--md-sys-typescale-body-medium-font);
    letter-spacing: var(--md-sys-typescale-body-medium-tracking);
    flex: 1;
  }
  .snackbar button {
    color: var(--md-sys-color-inverse-primary);
    font: var(--md-sys-typescale-label-large-font);
    letter-spacing: var(--md-sys-typescale-label-large-tracking);
    padding: 0 12px;
    min-block-size: 40px;
    border: 0;
    border-radius: var(--md-sys-shape-corner-full);
    background: transparent;
    cursor: pointer;
  }
  :host([tooltip]) {
    display: inline-block;
  }
  .tooltip {
    position: fixed;
    inset: auto;
    margin: 0;
    max-inline-size: min(var(--md-comp-tooltip-max-width), 90vw);
    border: 0;
    background: var(--md-sys-color-inverse-surface);
    color: var(--md-sys-color-inverse-on-surface);
    border-radius: var(--md-sys-shape-corner-extra-small);
    padding: var(--md-comp-tooltip-padding);
    font: var(--md-sys-typescale-body-small-font);
  }
  :host([variant="rich"]) .tooltip {
    background: var(--md-sys-color-surface-container-high);
    color: var(--md-sys-color-on-surface);
    border-radius: var(--md-sys-shape-corner-medium);
    padding: 12px 16px 8px;
    font: var(--md-sys-typescale-body-medium-font);
    box-shadow: var(--md-sys-elevation-level2);
  }
  :host([variant="rich"]) .tooltip .subhead {
    display: block;
    margin-block-end: 4px;
    font: var(--md-sys-typescale-title-small-font);
    letter-spacing: var(--md-sys-typescale-title-small-tracking);
  }
  :host([variant="rich"]) .tooltip p {
    margin: 0;
  }
  :host([variant="rich"]) .tooltip footer {
    display: flex;
    justify-content: end;
    gap: 8px;
    margin-block-start: 8px;
  }
  :host([variant="rich"]) .tooltip footer button {
    font: var(--md-sys-typescale-label-large-font);
    letter-spacing: var(--md-sys-typescale-label-large-tracking);
    color: var(--md-sys-color-primary);
    background: transparent;
    border: 0;
    min-block-size: 40px;
    padding: 0 12px;
    border-radius: var(--md-sys-shape-corner-full);
    cursor: pointer;
  }
  .fab-menu {
    display: inline-flex;
    flex-direction: column;
    align-items: end;
    gap: var(--md-comp-action-gap);
  }
  .fab-actions {
    display: flex;
    flex-direction: column;
    align-items: end;
    gap: var(--md-comp-action-gap);
    padding: var(--md-comp-action-gap);
    border: 0;
    border-radius: var(--md-sys-shape-corner-large);
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface);
    position: fixed;
    inset: auto;
    margin: 0;
    max-block-size: calc(100dvh - 112px);
    overflow: auto;
  }
  .fab-actions:not(:popover-open) {
    display: none;
  }
  .fab-trigger {
    min-inline-size: var(--md-comp-fab-height);
    min-block-size: var(--md-comp-fab-height);
    border-radius: var(--md-sys-shape-corner-large);
    background: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    box-shadow: var(--md-sys-elevation-level2);
  }
  .fab-item {
    font: var(--md-sys-typescale-label-large-font);
    letter-spacing: var(--md-sys-typescale-label-large-tracking);
    padding: var(--md-comp-action-gap) var(--md-comp-field-padding);
    min-block-size: var(--md-comp-action-target);
    display: inline-flex;
    gap: var(--md-comp-action-gap);
    align-items: center;
    border-radius: var(--md-sys-shape-corner-full);
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
  }
  :host([color="secondary"]) .fab-trigger,
  :host([color="secondary"]) .fab-item {
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
  }
  :host([color="tertiary"]) .fab-trigger,
  :host([color="tertiary"]) .fab-item {
    background: var(--md-sys-color-tertiary-container);
    color: var(--md-sys-color-on-tertiary-container);
  }
  :host([split]) {
    display: inline-flex;
    align-items: stretch;
    gap: var(--md-comp-split-gap);
  }
  :host([split]) bubble-button {
    --bubble-button-corner-start-start: var(--md-sys-shape-corner-full);
    --bubble-button-corner-start-end: var(--md-sys-shape-corner-extra-small);
    --bubble-button-corner-end-end: var(--md-sys-shape-corner-extra-small);
    --bubble-button-corner-end-start: var(--md-sys-shape-corner-full);
  }
  :host([split]) bubble-icon-button {
    --bubble-button-corner-start-start: var(--md-sys-shape-corner-extra-small);
    --bubble-button-corner-start-end: var(--md-sys-shape-corner-full);
    --bubble-button-corner-end-end: var(--md-sys-shape-corner-full);
    --bubble-button-corner-end-start: var(--md-sys-shape-corner-extra-small);
  }
  :host([split]:dir(rtl)) bubble-button {
    --bubble-button-corner-start-start: var(--md-sys-shape-corner-extra-small);
    --bubble-button-corner-start-end: var(--md-sys-shape-corner-full);
    --bubble-button-corner-end-end: var(--md-sys-shape-corner-full);
    --bubble-button-corner-end-start: var(--md-sys-shape-corner-extra-small);
  }
  :host([split]:dir(rtl)) bubble-icon-button {
    --bubble-button-corner-start-start: var(--md-sys-shape-corner-full);
    --bubble-button-corner-start-end: var(--md-sys-shape-corner-extra-small);
    --bubble-button-corner-end-end: var(--md-sys-shape-corner-extra-small);
    --bubble-button-corner-end-start: var(--md-sys-shape-corner-full);
  }
  nav a {
    font: var(--md-sys-typescale-label-large-font);
    letter-spacing: var(--md-sys-typescale-label-large-tracking);
    color: var(--md-sys-color-primary);
  }
`;

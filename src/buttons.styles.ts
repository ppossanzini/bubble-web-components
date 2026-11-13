import { css } from "lit";
export const buttonStyles = css`
  :host {
    display: inline-block;
    vertical-align: middle;
  }
  .button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--md-comp-action-gap);
    min-block-size: var(--md-comp-button-small-height);
    padding-inline: var(--md-comp-button-padding);
    border-start-start-radius: var(
      --bolle-button-corner-start-start,
      var(--bolle-button-shape, var(--md-sys-shape-corner-full))
    );
    border-start-end-radius: var(
      --bolle-button-corner-start-end,
      var(--bolle-button-shape, var(--md-sys-shape-corner-full))
    );
    border-end-end-radius: var(
      --bolle-button-corner-end-end,
      var(--bolle-button-shape, var(--md-sys-shape-corner-full))
    );
    border-end-start-radius: var(
      --bolle-button-corner-end-start,
      var(--bolle-button-shape, var(--md-sys-shape-corner-full))
    );
    text-decoration: none;
    background-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    font: var(--md-sys-typescale-label-large-font);
    letter-spacing: var(--md-sys-typescale-label-large-tracking);
    transition:
      border-radius var(--md-sys-motion-duration-short2),
      scale var(--bb-tension-duration) var(--bb-tension),
      var(--bb-shape-motion);
  }
  .button:active {
    scale: var(--bb-squish);
    transition:
      border-radius var(--md-sys-motion-duration-short2),
      scale var(--bb-squish-duration) ease-out,
      var(--bb-shape-motion);
  }
  :host([shape="square"]) .button {
    border-radius: var(--md-sys-shape-corner-medium);
  }
  :host([shape="square"][size="medium"]) .button {
    border-radius: var(--md-sys-shape-corner-large);
  }
  :host([shape="square"][size="large"]) .button,
  :host([shape="square"][size="xl"]) .button {
    border-radius: var(--md-sys-shape-corner-extra-large);
  }
  :host(:not([grouped])) .button:active {
    border-radius: var(--md-sys-shape-corner-small);
  }
  :host([size="medium"]) .button:active {
    border-radius: var(--md-sys-shape-corner-medium);
  }
  :host([size="large"]) .button:active,
  :host([size="xl"]) .button:active {
    border-radius: var(--md-sys-shape-corner-large);
  }
  :host([icon-only]) .button::after,
  :host([size="xs"]) .button::after {
    content: "";
    position: absolute;
    inset: -4px;
  }
  :host([variant="text"]),
  :host([variant="standard"]),
  :host([variant="outlined"]),
  :host([variant="elevated"]) {
    /* No coloured fill to reflect on: the glint takes the label colour. */
    --bb-glint-color: rgb(from color-mix(in srgb, var(--md-sys-color-primary) 12%, white) r g b / 0.35);
  }
  :host([variant="tonal"]) .button,
  :host([variant="filled-tonal"]) .button {
    background-color: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
  }
  :host([variant="accent"]) .button {
    background-color: var(--bb-accent);
    color: var(--bb-on-accent);
  }
  :host([variant="outlined"]) .button {
    background-color: transparent;
    color: var(--md-sys-color-primary);
    border: 1px solid var(--md-sys-color-outline);
  }
  :host([variant="text"]) .button,
  :host([variant="standard"]) .button {
    background-color: transparent;
    color: var(--md-sys-color-primary);
  }
  :host([variant="elevated"]) .button {
    background-color: var(--md-sys-color-surface-container-low);
    color: var(--md-sys-color-primary);
    box-shadow: var(--md-sys-elevation-level1);
  }
  :host([size="xs"]) .button {
    min-block-size: var(--md-comp-button-xs-height);
  }
  :host([size="medium"]) .button {
    min-block-size: var(--md-comp-button-medium-height);
  }
  :host([size="large"]) .button {
    min-block-size: var(--md-comp-button-large-height);
  }
  :host([size="xl"]) .button {
    min-block-size: var(--md-comp-button-xl-height);
  }
  :host([toggle]:not([selected])) .button {
    background-color: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface-variant);
    border: 0;
  }
  :host([toggle]:not([selected])[variant="tonal"]) .button,
  :host([toggle]:not([selected])[variant="filled-tonal"]) .button {
    background-color: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
  }
  :host([toggle]:not([selected])[variant="outlined"]) .button {
    background-color: transparent;
    color: var(--md-sys-color-on-surface-variant);
    border: 1px solid var(--md-sys-color-outline);
  }
  :host([toggle]:not([selected])[variant="elevated"]) .button {
    background-color: var(--md-sys-color-surface-container-low);
    color: var(--md-sys-color-primary);
  }
  :host([selected]:not([grouped])) .button {
    background-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    border-color: transparent;
    border-radius: var(--md-sys-shape-corner-medium);
  }
  :host([selected]:not([grouped])[size="medium"]) .button {
    border-radius: var(--md-sys-shape-corner-large);
  }
  :host([selected]:not([grouped])[size="large"]) .button,
  :host([selected]:not([grouped])[size="xl"]) .button {
    border-radius: var(--md-sys-shape-corner-extra-large);
  }
  :host([selected]:not([grouped])[shape="square"]) .button {
    border-radius: var(--md-sys-shape-corner-full);
  }
  :host([selected][grouped]) .button {
    background-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    border-color: transparent;
  }
  :host([selected][variant="tonal"]) .button {
    background-color: var(--md-sys-color-secondary);
    color: var(--md-sys-color-on-secondary);
  }
  :host([selected][variant="outlined"]) .button {
    background-color: var(--md-sys-color-inverse-surface);
    color: var(--md-sys-color-inverse-on-surface);
    border-color: transparent;
  }
  :host([selected][variant="elevated"]) .button {
    background-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    box-shadow: var(--md-sys-elevation-level1);
  }
  .button {
    white-space: nowrap;
  }
  :host([icon-only]) .button {
    padding: 0;
    min-inline-size: var(--md-comp-button-small-height);
  }
  :host([icon-only][size="xs"]) .button {
    min-inline-size: var(--md-comp-button-xs-height);
  }
  :host([icon-only][width="wide"]) .button {
    min-inline-size: calc(
      var(--md-comp-action-target) + var(--md-comp-button-padding)
    );
  }
  :host([icon-only][width="narrow"]) .button {
    padding-inline: var(--md-comp-field-gap);
  }
  :host([icon-only][size="medium"]) .button {
    min-inline-size: var(--md-comp-button-medium-height);
  }
  :host([icon-only][size="large"]) .button {
    min-inline-size: var(--md-comp-button-large-height);
  }
  :host([icon-only][size="xl"]) .button {
    min-inline-size: var(--md-comp-button-xl-height);
  }
  :host([fab]) .button {
    padding: 0;
    font-size: 24px;
    line-height: 1;
    min-block-size: var(--md-comp-fab-height);
    min-inline-size: var(--md-comp-fab-height);
    background-color: var(--md-sys-color-primary-container);
    background-image: var(--bb-highlight), var(--bb-film-wash);
    color: var(--md-sys-color-on-primary-container);
    border-radius: var(--md-sys-shape-corner-large);
    box-shadow: var(--bb-float-3, var(--md-sys-elevation-level3));
  }
  :host([fab]) .button:hover {
    background-image:
      linear-gradient(var(--bolle-state-hover), var(--bolle-state-hover)),
      var(--bb-hover-glint), var(--bb-highlight), var(--bb-film-wash);
    background-size:
      100% 100%, var(--bb-glint-box) var(--bb-glint-box), 100% 100%, 100% 100%;
    background-position: 0 0, var(--bb-glint-position), 0 0, 0 0;
    background-repeat: no-repeat;
    box-shadow: var(--bb-float-4, var(--md-sys-elevation-level4));
  }
  :host([fab]) .button:active {
    background-image:
      linear-gradient(var(--bolle-state-pressed), var(--bolle-state-pressed)),
      var(--bb-highlight), var(--bb-film-wash);
    border-radius: var(--md-sys-shape-corner-large);
  }
  :host([fab][size="small"]) .button {
    min-block-size: var(--md-comp-action-target);
    min-inline-size: var(--md-comp-action-target);
  }
  :host([fab][size="large"]) .button {
    min-block-size: var(--md-comp-fab-large-height);
    min-inline-size: var(--md-comp-fab-large-height);
  }
  :host([fab][size="medium"]) .button {
    min-block-size: var(--md-comp-fab-medium-height);
    min-inline-size: var(--md-comp-fab-medium-height);
  }
  ::slotted([slot="icon"]) {
    font-size: 24px;
    line-height: 1;
  }
  :host([extended][size="small"]) .button {
    min-block-size: var(--md-comp-fab-height);
    min-inline-size: var(--md-comp-fab-extended-min-width);
    padding-inline: var(--md-comp-fab-extended-padding);
    font: var(--md-sys-typescale-title-medium-font);
  }
  :host([extended][size="medium"]) .button {
    min-block-size: var(--md-comp-fab-extended-medium-height);
    min-inline-size: var(--md-comp-fab-extended-min-width);
    padding-inline: var(--md-comp-button-padding);
    font: var(--md-sys-typescale-title-medium-font);
  }
  :host([extended][size="large"]) .button {
    min-block-size: var(--md-comp-fab-extended-large-height);
    min-inline-size: var(--md-comp-fab-extended-min-width);
    padding-inline: var(--md-comp-button-padding);
    font: var(--md-sys-typescale-title-large-font);
  }
  :host([fab][color="secondary-container"]) .button {
    background-color: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
  }
  :host([fab][color="tertiary-container"]) .button {
    background-color: var(--md-sys-color-tertiary-container);
    color: var(--md-sys-color-on-tertiary-container);
  }
  :host([fab][color="primary"]) .button {
    background-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
  }
  :host([fab][color="secondary"]) .button {
    background-color: var(--md-sys-color-secondary);
    color: var(--md-sys-color-on-secondary);
  }
  :host([fab][color="tertiary"]) .button {
    background-color: var(--md-sys-color-tertiary);
    color: var(--md-sys-color-on-tertiary);
  }
  :host([fab][color="surface"]) .button {
    background-color: var(--md-sys-color-surface-container-high);
    color: var(--md-sys-color-primary);
  }
`;

export const groupStyles = css`
  :host {
    display: inline-block;
    max-inline-size: 100%;
  }
  [role="group"] {
    display: flex;
    flex-wrap: wrap;
    gap: var(--md-comp-button-group-gap);
  }
  :host([size="xs"]) [role="group"] {
    gap: var(--md-comp-button-group-gap-xs);
  }
  :host([size="small"]) [role="group"] {
    gap: var(--md-comp-button-group-gap-small);
  }
  :host([size="xs"]) {
    --md-comp-button-group-inner-corner: var(
      --md-comp-button-group-inner-corner-xs
    );
    --md-comp-button-group-inner-corner-hovered: var(
      --md-comp-button-group-inner-corner-hovered-xs
    );
  }
  :host([size="large"]) {
    --md-comp-button-group-inner-corner: var(
      --md-comp-button-group-inner-corner-large
    );
    --md-comp-button-group-inner-corner-hovered: var(
      --md-comp-button-group-inner-corner-hovered-large
    );
  }
  :host([size="xl"]) {
    --md-comp-button-group-inner-corner: var(
      --md-comp-button-group-inner-corner-xl
    );
    --md-comp-button-group-inner-corner-hovered: var(
      --md-comp-button-group-inner-corner-hovered-xl
    );
  }
  :host([variant="connected"]) {
    display: block;
  }
  :host([variant="connected"]) [role="group"] {
    flex-wrap: wrap;
    gap: var(--md-comp-button-group-gap-connected);
  }
  :host([variant="connected"]) ::slotted(*) {
    flex: 1 1 auto;
    min-inline-size: fit-content;
    --bolle-button-shape: var(--md-sys-shape-corner-full);
  }
  :host([variant="connected"]) ::slotted(:not(:first-child)) {
    --bolle-button-corner-start-start: var(
      --md-comp-button-group-inner-corner
    );
    --bolle-button-corner-end-start: var(
      --md-comp-button-group-inner-corner
    );
  }
  :host([variant="connected"]) ::slotted(:not(:last-child)) {
    --bolle-button-corner-start-end: var(
      --md-comp-button-group-inner-corner
    );
    --bolle-button-corner-end-end: var(
      --md-comp-button-group-inner-corner
    );
  }
  /* Angolo interno che si allarga al passaggio: la giunzione si apre senza
     spostare i vicini. */
  :host([variant="connected"]) ::slotted(:not(:first-child):hover) {
    --bolle-button-corner-start-start: var(
      --md-comp-button-group-inner-corner-hovered
    );
    --bolle-button-corner-end-start: var(
      --md-comp-button-group-inner-corner-hovered
    );
  }
  :host([variant="connected"]) ::slotted(:not(:last-child):hover) {
    --bolle-button-corner-start-end: var(
      --md-comp-button-group-inner-corner-hovered
    );
    --bolle-button-corner-end-end: var(
      --md-comp-button-group-inner-corner-hovered
    );
  }
`;

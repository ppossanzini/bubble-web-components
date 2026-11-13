import { css, html, svg, unsafeCSS } from "lit";

// Path data from Tabler Icons (outline, MIT).
const CHECK = ["M5 12l5 5l10 -10"];
const X = ["M18 6l-12 12", "M6 6l12 12"];
const CHEVRON_DOWN = ["M6 9l6 6l6 -6"];

const tabler = (paths: string[]) => html`<svg
  class="tabler-icon"
  viewBox="0 0 24 24"
  width="1em"
  height="1em"
  aria-hidden="true"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  ${paths.map((d) => svg`<path d=${d}></path>`)}
</svg>`;

export const checkIcon = () => tabler(CHECK);
export const closeIcon = () => tabler(X);
export const chevronDownIcon = () => tabler(CHEVRON_DOWN);

/** Tabler check as a CSS mask, for ::before content painted with currentColor. */
export const checkMask = unsafeCSS(
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${CHECK[0]}"/></svg>`,
  )}")`,
);

export const checkMaskStyles = css`
  content: "";
  display: inline-block;
  inline-size: 1em;
  block-size: 1em;
  background-color: currentColor;
  mask: ${checkMask} center / contain no-repeat;
`;

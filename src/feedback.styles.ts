import { css } from "lit";
export const feedbackStyles = css`
  :host {
    display: block;
  }
  :host([variant="linear"]) {
    inline-size: 100%;
  }
  :host([variant="circular"]) {
    display: inline-block;
    inline-size: auto;
  }
  progress {
    display: block;
    inline-size: 100%;
    block-size: var(--md-comp-progress-thickness);
    accent-color: var(--md-sys-color-primary);
    border: 0;
    border-radius: var(--md-sys-shape-corner-full);
    overflow: hidden;
    background: var(--md-sys-color-secondary-container);
  }
  progress::-webkit-progress-bar {
    background: var(--md-sys-color-secondary-container);
  }
  progress::-webkit-progress-value {
    background: var(--md-sys-color-primary);
    border-radius: var(--md-sys-shape-corner-full);
  }
  progress::-moz-progress-bar {
    background: var(--md-sys-color-primary);
  }
  .circle {
    inline-size: var(--md-comp-progress-circular-size);
    block-size: var(--md-comp-progress-circular-size);
    transform: rotate(-90deg);
  }
  .track,
  .value {
    fill: none;
    stroke-width: 4;
  }
  .track {
    stroke: var(--md-sys-color-secondary-container);
  }
  .value {
    stroke: var(--md-sys-color-primary);
    stroke-linecap: round;
  }
  .linear {
    position: relative;
    overflow: hidden;
    inline-size: 100%;
    block-size: var(--md-comp-progress-thickness);
    border-radius: var(--md-sys-shape-corner-full);
    background: var(--md-sys-color-secondary-container);
  }
  .linear-stop {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-end: 0;
    inline-size: 4px;
    block-size: 4px;
    border-radius: var(--md-sys-shape-corner-full);
    background: var(--md-sys-color-primary);
    transform: translateY(-50%);
  }
  .wavy {
    display: block;
    inline-size: 100%;
    block-size: calc(var(--md-comp-progress-thickness) + 6px);
    overflow: visible;
  }
  .wavy path {
    fill: none;
    stroke-width: var(--md-comp-progress-thickness);
    stroke-linecap: round;
  }
  .wavy-track {
    stroke: var(--md-sys-color-secondary-container);
  }
  .wavy-value {
    stroke: var(--md-sys-color-primary);
  }
  .wavy-indeterminate {
    animation: wavy-slide 1.6s linear infinite;
  }
  @keyframes wavy-slide {
    from {
      transform: translateX(-32px);
    }
    to {
      transform: translateX(0);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .wavy-indeterminate {
      animation: none;
    }
  }
  .linear-value {
    position: absolute;
    inset-block: 0;
    inline-size: 40%;
    border-radius: inherit;
    background: var(--md-sys-color-primary);
  }
  .linear.indeterminate .linear-value {
    animation: linear-slide 1.8s var(--md-sys-motion-easing-standard) infinite;
  }
  .indeterminate {
    animation: rotate 1.4s linear infinite;
  }
  .indeterminate .value {
    animation: dash 1.4s ease-in-out infinite;
  }
  @keyframes linear-slide {
    0% {
      inset-inline-start: -40%;
    }
    100% {
      inset-inline-start: 100%;
    }
  }
  @keyframes dash {
    0% {
      stroke-dasharray: 1 100;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 70 100;
      stroke-dashoffset: -20;
    }
    100% {
      stroke-dasharray: 70 100;
      stroke-dashoffset: -95;
    }
  }
  .loading {
    inline-size: var(--md-comp-loading-size);
    block-size: var(--md-comp-loading-size);
    display: grid;
    place-items: center;
  }
  .loading::before {
    content: "";
    inline-size: var(--md-comp-loading-active-size);
    block-size: var(--md-comp-loading-active-size);
    background: var(--md-sys-color-primary);
    animation:
      loading-morph 2.4s ease-in-out infinite,
      loading-turn 2.4s linear infinite;
  }
  @keyframes loading-morph {
    0%,
    100% {
      border-radius: 50% 50% 50% 50%;
      transform: scale(1);
    }
    14% {
      border-radius: 30% 70% 70% 30%;
    }
    28% {
      border-radius: 70% 30% 30% 70%;
      transform: scale(0.86);
    }
    42% {
      border-radius: 20% 80% 60% 40%;
    }
    57% {
      border-radius: 60% 40% 20% 80%;
      transform: scale(1.05);
    }
    71% {
      border-radius: 45% 55% 70% 30%;
    }
    85% {
      border-radius: 80% 20% 45% 55%;
      transform: scale(0.92);
    }
  }
  @keyframes loading-turn {
    to {
      rotate: 360deg;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .linear-value,
    .indeterminate,
    .indeterminate .value,
    .loading::before {
      animation: none;
    }
  }
  :host([variant="contained"]) .loading {
    background: var(--md-sys-color-primary-container);
    border-radius: var(--md-sys-shape-corner-full);
  }
  :host([variant="contained"]) .loading::before {
    background: var(--md-sys-color-on-primary-container);
  }
  @keyframes rotate {
    to {
      transform: rotate(360deg);
    }
  }
  .carousel {
    position: relative;
  }
  .viewport {
    display: flex;
    gap: var(--md-comp-carousel-gap);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    padding: var(--md-comp-field-gap);
  }
  ::slotted(*) {
    flex: 0 0 78%;
    scroll-snap-align: start;
    border-radius: var(--md-sys-shape-corner-extra-large);
    overflow: clip;
  }
  :host([variant="multi-browse"]) .viewport {
    scroll-padding-inline-start: var(--md-comp-carousel-leading-space);
  }
  :host([variant="multi-browse"]) ::slotted(*) {
    flex-basis: min(30%, 220px);
  }
  :host([variant="uncontained"]) ::slotted(*) {
    flex-basis: auto;
    inline-size: clamp(160px, 20vw, 220px);
  }
  :host([variant="center-aligned-hero"]) .viewport {
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 14%;
  }
  :host([variant="center-aligned-hero"]) ::slotted(*) {
    flex-basis: 60%;
    scroll-snap-align: center;
  }
  :host([variant="full-screen"]) ::slotted(*) {
    flex-basis: 100%;
  }
  :host([variant="full-screen"]) .viewport {
    flex-direction: column;
    block-size: var(--md-comp-carousel-full-height);
    overflow-x: hidden;
    overflow-y: auto;
    scroll-snap-type: y mandatory;
    padding: 0;
    gap: var(--md-comp-carousel-full-screen-gap);
  }
  :host([variant="full-screen"]) ::slotted(*) {
    flex: 0 0 100%;
  }
  :host([variant="uncontained"]) .viewport,
  :host([variant="uncontained-multi-aspect-ratio"]) .viewport {
    scroll-snap-type: none;
  }
  :host([variant="uncontained-multi-aspect-ratio"]) ::slotted(*) {
    flex-basis: auto;
  }
  :host([variant="center-aligned-hero"]) ::slotted(*) {
    scroll-snap-align: center;
  }

  .controls {
    display: flex;
    align-items: center;
    justify-content: end;
    gap: var(--md-comp-action-gap);
    font: var(--md-sys-typescale-label-medium-font);
    letter-spacing: var(--md-sys-typescale-label-medium-tracking);
  }
  .controls button {
    min-block-size: var(--md-comp-action-target);
    min-inline-size: var(--md-comp-action-target);
    border-radius: var(--md-sys-shape-corner-full);
  }
`;

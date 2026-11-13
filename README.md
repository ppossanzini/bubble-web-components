# Bubble Material Web Components

A material based web component library, published as `@bubble/web-components`.

## Foundations

The foundations layer covers:

| Foundation    | Tokens and page content                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------- |
| Design tokens | Reference, system and component classes; CSS mapping keeps the `comp` segment                                       |
| Colour        | 22 container/content role pairs plus outline and outline-variant, light and dark, with hex values read from the DOM |
| Shape         | 10 corner steps including Expressive increased and extra-extra-large, plus 5 directional variants                   |
| Elevation     | Levels 0–5, tonal tints and the scrim role at 32%                                                                   |
| Motion        | 16 durations, 10 easings, 6 spring damping/stiffness pairs                                                          |
| States        | Hover 8%, focus 10%, pressed 10%, dragged 16%, disabled 38% layer; disabled container 12%, content 38%, outline 12% |
| Layout        | Breakpoints 599/839/1199/1599, margins 16/24, pane spacer 24, reading measure 40–60ch                               |
| Icons         | Sizes 20/24/40/48 and the delivery decision                                                                         |

Values come from the recorded snapshot: role tones of token set 34.0.21 and the
baseline palette hex values. `on-primary-container`,
`on-secondary-container`, `on-tertiary-container` and `on-error-container` now use
tone 30 in light mode (the 34.0.21 value), not tone 10.

Project projections and open items:

- Elevation shadows are a projection of the dp levels: the sources publish no
  offset, blur or spread values. Tonal elevation uses `color-mix` with `primary`.
- Medium and high contrast levels are not generated; only the standard level is
  supplied for light and dark.
- Springs are numeric tokens. They are not CSS timing functions; a component that
  uses them must convert the spring to a curve or duration.
- The grid column count, column width and gutter are project decisions: the M3
  sources publish no table for them.
- Material Symbols is not bundled. Components and the demo use text glyphs, so
  icon delivery remains a project decision.

## Typography

Run `npm run typography` to generate the 30 Material type styles from
`scripts/typography.mjs`. Build and development commands also generate them.
Load `tokens.css` before `typography.css`. Keep the adjacent `fonts/` directory:
Roboto 400, 500 and 700 is served locally, with its licence. All subsets supplied
by the pinned Fontsource package are copied with their original Unicode ranges:
Latin, extended Latin, Greek, extended Greek, Cyrillic, extended Cyrillic,
Vietnamese, math and symbols. The browser requests only matching subsets.
Roboto does not cover every script. Other scripts use the operating system
fallback fonts; no bundled Arabic, Indic or East Asian font coverage is claimed.

Use classes such as `md-type-body-large` and
`md-type-emphasized-body-large`, or the per-style CSS custom properties.
Font shorthand and tracking are separate: custom components must also apply
`letter-spacing: var(--md-sys-typescale-body-large-tracking)`.
Brand and plain font-family tokens can be overridden independently.
The implementation uses the static weights in token snapshot 34.0.21:
emphasized title medium/small and labels use 700, not the differing variable
axis value 600. No variable-font axes are claimed.
The demo contains specimens of all 30 styles. Generated CSS is never edited
manually.
Demo role mapping: page heading uses display large, section headings headline
medium, article headings title large, paragraphs and status body large, buttons
label large, metadata label medium and specimen captions body small.
Each mapping applies both font and tracking tokens and preserves semantic HTML.

### Languages, figures and links

`lang` selects a project language-height policy. Listed small-category languages
use factor 1, the default/medium category 1.07, Burmese and Telugu 1.3, and Urdu
uses the conservative extra-large factor 2. These are project adaptations from
approximate reference ratios, not verified per-role Material line-height tokens.
Set `data-language-height="small|medium|large|extra-large"` to override the
category, particularly when the actual font/script differs. The built-in small
language list is illustrative, not a complete language detector.
Font metrics are redeclared at explicit language boundaries; font-family reference
tokens remain inheritable. Shadow components inherit the context from their host.

`.md-numerals-tabular` applies lining tabular figures without changing the text
role. Use it for clocks, changing values and numeric table cells.
`.md-text-link` underlines links and applies the primary colour role;
`.md-text-link--tertiary` changes it to tertiary. Focus has a visible outline.
Menu navigation actions keep their component styling, not inline text-link styling.
The demo shows document content, metadata, a numeric summary, times, a data table,
links and multilingual passages in addition to the 30 type specimens.

### Typography accessibility checks

Chromium checks cover language-height selection, standard light/dark foreground
and background pairs, 200% root text size, custom line/letter/word/paragraph
spacing, and reflow at 320, 640 and 1280 CSS pixels. Text role pairs tested exceed
4.5:1. These checks do not certify every composited state, user theme or font.
Browser zoom, screen readers and real-device/script shaping remain manual checks.
Do not treat fallback availability or this automated sample as full multilingual
or WCAG conformance.

First implementation: `bubble-menu`, built with Lit 3.3.3 and TypeScript.
The library has no Material component dependency. The ES module bundles Lit and
works in HTML without an application build step.

## Framework integration

The library is consumed as Custom Elements. The integration guides show an
exhaustive Vue and React example for every component, covering attributes,
slots, events, imperative methods and forms. Each guide is available in three
languages:

- Italiano: [Vue 3](docs/it/vue.md) · [React](docs/it/react.md)
- English: [Vue 3](docs/en/vue.md) · [React](docs/en/react.md)
- Français: [Vue 3](docs/fr/vue.md) · [React](docs/fr/react.md)

Index: [docs/README.md](docs/README.md).

The live documentation site is in `site/`. It lists every component, shows a
preview, and generates the matching Vue and React snippet for the current state.
The component configuration is split in two places. The size tokens sit next to
the preview in a **Dimensioni** panel that stays visible while scrolling, so an
edit shows its effect immediately. Theme, template, the component parameters and
the colour, shape, typography and remaining tokens open in a side sheet from the
**Configura** action above the preview or from the app bar settings button;
selecting another component closes the sheet.

Both panels list only the tokens the rendered instance really uses: the site
evaluates the `:host(...)` conditions against the element's current attributes
and drops declarations a later rule overrides, so a plain button never shows FAB
tokens. Each row uses a technical layout: monospace token name, declared default,
a number field for the current value with the unit beside it, and a measurement
bar scaled to the pixel value. Pixel tokens use `input type="number"`: arrows step
by one, Shift with the arrows or the wheel steps by ten, the wheel only edits a
focused field and scrolls the panel otherwise; a token whose value is not a pixel
length keeps a text field. The override is emitted as a rule scoped to the
component tag, and a token with an override shows a reset control. Size tokens
stay in the **Dimensioni** panel, every other token in the **Token del componente**
section of the sheet; colours, corner radii and typography keep their own
subgroups inside it.

While the **Dimensioni** panel is open, the preview carries SVG measurement lines
for every editable size token. Each token gets one line, taken from the outermost
element it sizes, and a number and a colour; the badge with the number, the value
and the short token name sits in a side gutter of the preview, stacked so the
badges never overlap, and a dashed leader joins it to its line. The line is
accepted only when overriding the token really changes the used value, so an
overridden declaration draws nothing, and its axis comes from the longhand that
changes: `gap` follows the direction the flex layout separates items by, and
padding is drawn inside the box it pads. A gap with fewer than two rendered items
and a `min`/`max` the box is not sitting on draw nothing either: the declaration
is live, the rendering does not change. The same number and colour appear on the
token row, and the rows are sorted by number. Hovering a row dims every other
line and outlines the element that token sizes. The **Nascondi quote** control in
the panel header removes the overlay.

A **Template** selector scales every `--md-comp-*` spacing and size token at the
root to three quarters: padding, margin, gap, inset, height, width, minimum and
maximum sizes, targets and spaces between elements. The **Ariosa** option
restores the declared values, the **Compatta** option writes the scaled values
as inline root overrides and removes them when switched back. Corner radii,
colours, typography, elevations and state opacities are excluded, so the
comparison covers density alone. The selector appears in the configuration sheet
and at the top of the **Design tokens** page.

The **Design tokens** page edits the graphic foundation: all M3 semantic colour
roles (47, grouped by family) chosen from the Material palette published on
materialui.co/colors, seven HCT theme presets (Oceano is the site default,
followed by Foresta, Teal, Ambra, Terracotta, Grafite and the original Viola
M3), the full HCT generation of the colour scheme from the current primary with
standard/medium/high contrast, corner radii, title and body font families, and
the base text size. A preset regenerates both the light and the dark palette;
the selector is available on the tokens page and at the top of the component
configuration drawer. Values are kept separately for light and dark themes,
apply to the whole site, and are exported as a CSS `:root` snippet. Example
icons come from Tabler Icons.

Each component page also shows the tokens that component consumes, detected
from the rules its shadow DOM actually matches for the current attribute set.
Colours and corner radii map to the global theme values; the `--md-comp-*` detail
tokens are listed with their declared value from `tokens.css` and edited with an
exact text field. An override is emitted as a rule
scoped to the component tag, for example
`bubble-menu { --md-comp-menu-item-vertical-padding: 20px; }`, so it applies to
every instance of that component without creating a per-instance token copy.
Typography scale names are listed for reference because only the two font
families and the base size are editable.

The dropdown used by long configuration lists (`site/docs-select.ts`) is a site
pattern composed from `bubble-button` and `bubble-menu`, not an entry in the
library catalogue.

```sh
npm run dev:site     # http://127.0.0.1:5174/
npm run build:site   # static site in dist-site/
```

Each guide states the platform rules that matter: property versus attribute
binding, `addEventListener` for custom events, typed template refs in Vue and
`useBubbleEvent`/`useBubbleProps` in React, and the JSX type declarations.
Code excerpts are identical across the three editions; only the prose is
translated.

## Run and build

```sh
npm ci
npm run dev          # component catalogue
npm run dev:site     # documentation site with live configuration and code
npm run build
npm run build:site   # static documentation site in dist-site/
npm pack --dry-run
```

The development page is a full catalogue: foundations with the 30 type styles,
then every component group with each implemented variant labelled, then the
verification notes. It offers dark mode and right-to-left layout. Components with
an open Material variant state the gap in its note, so presence in the page is
never presented as full conformance.

## Variant and layout review

The catalogue page was rebuilt around one container width, one spacing scale and
one variant label per configuration, so every implemented variant is visible and
named. Corrections applied in this review:

- Buttons: toggle unselected uses the outlined look; connected groups wrap at
  narrow widths instead of overflowing; labels never break inside a button.
- Segmented buttons: connected geometry with checkmark on the selected segment;
  the native radio is visually hidden but still focusable.
- Chips: visible container stays at 32px while the hit area reaches 48px; filter
  chips show a checkmark, input chips accept an avatar; elevated style added.
- Text fields: leading/trailing icon slots, prefix, suffix, counter and required
  marker; input text uses the body-large role in every field.
- Sliders: one track with native inputs overlaid, so the range variant has two
  handles on the same track; label body-medium, value bubble label-medium above
  the handle, stop markers layered under the active fill; vertical orientation
  uses a native vertical fallback.
- Navigation bar and rail: 80px bar, 64x32 and 56x32 active indicators, 24px
  icons, 12px labels, rail items at 56px; icons are inline SVG.
- Date and time pickers: one field container with the trigger inside, value
  formatted with Intl (dd/mm/yy, 12/24-hour), readonly field that opens the
  picker, equal-width range fields, month list pre-selected, clock icon for time.
- Demo icons come from Tabler Icons as inline SVG, so they inherit currentColor
  and do not load an icon webfont. `--md-ref-typeface-icons` stays available for
  projects that deliver an icon font.
- Split button: primary and menu parts share one silhouette, outer full corners
  and inner 4px corners, mirrored in RTL.
- Component type roles normalised: tabs title-small 14, card and list supporting
  text body-medium 14, app bar subtitle body-medium 14, FAB icon 24, large
  extended FAB title-large 22, fab menu items label-large 14, carousel counter
  label-medium 12.
- Dividers: full, inset, inset-start, inset-end and vertical.
- Cards: media slot rendered; horizontal orientation with a fixed media column.
- Lists: segmented style with separated rounded rows and selected state.
- App bars: surface background, padding, bottom-aligned flexible titles and
  headline sizes per variant; search bar fills the app bar.
- Navigation: rail labels do not wrap; rail items use the 56px height; flexible
  bar with horizontal item layout.
- Overlays: standard bottom sheet, side sheet and drawer are fixed at their edge;
  side sheet supports a detached frame; bottom sheet supports a drag handle;
  the dialog accepts `full-screen` as well as `fullscreen`.
- Pickers: one calendar/clock affordance per field (the native indicator is
  hidden), range fields aligned, docked duplicate icon removed.
- Carousel: hero, multi-browse, uncontained and center-aligned-hero use distinct
  item widths.
- Indeterminate progress: sliding linear bar and animated circular arc; loading
  indicator morphs with reduced-motion fallback.

### Behaviour audit round

Every catalogue entry was checked again against the local component and
foundation snapshots, and the following behaviours were added.

- Menu: grouped entries with `role="group"` and a group label, density offset in
  4dp steps through `density`, and dismissal on window blur removed in favour of
  pointer and focus dismissal.
- Tabs: scrollable strip with previous/next controls, disabled edge states, a
  `ResizeObserver` that keeps the edge state accurate, and no movable indicator.
- Lists: `selection="single|multiple"` with listbox/option semantics, selection
  tint, hover state, expandable rows with a disclosure control and nested lists,
  and an `expand` event.
- Search: suggestion combobox with `aria-activedescendant`, filtered options,
  arrow keys, Enter, Escape, optional debounce and a `suggest` event.
- Split button: `size` follows the five-step button scale.
- Tooltip: plain offset 4dp, rich offset 8dp, rich tooltip persists until an
  outside press, Escape or its dismiss control.
- Snackbar: message queue plus entry motion with a reduced-motion opt-out.
- Slider: inset start/end icons, capped track width, and a rotated custom
  vertical track instead of the native fallback.
- Progress: determinate track rebuilt on a custom surface with the 4dp stop
  indicator, plus an Expressive wavy track that clips determinate values and
  animates when indeterminate.
- Checkbox, radio and switch: custom M3 controls with check path, indeterminate
  dash, radio ring, error border and focus ring; the switch draws a real handle
  with state-dependent 16/24dp size and optional off/on icons.
- Date picker: inline docked calendar sharing the modal calendar view.
- Time picker: pointer-angle drag on the dial, with the ring pinned for the
  duration of the gesture and automatic advance from hour to minute.
- Dialog, sheet and drawer: entry motion per placement with a reduced-motion
  opt-out.

Still missing against the guidelines, and stated in the page: numeric-input date
picker and time picker, exact seven-shape loading morph, movable Expressive tab
indicator, dialog container transform, carousel item morph, extended FAB
collapse on scroll and icon delivery through Material Symbols (the demo uses
inline Tabler SVG).

## HTML usage

```html
<link rel="stylesheet" href="./dist/tokens.css" />
<button id="trigger" aria-haspopup="menu">Actions</button>
<bubble-menu id="menu" menu-label="Document actions"></bubble-menu>
<script type="module">
  import "./dist/bubble.js";
  const trigger = document.querySelector("#trigger");
  const menu = document.querySelector("#menu");
  menu.items = [
    { id: "open", label: "Open" },
    { separator: true },
    { id: "archive", label: "Archive", disabled: true },
  ];
  trigger.addEventListener("click", () => menu.show(trigger));
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      menu.show(trigger, { last: event.key === "ArrowUp" });
    }
  });
  menu.addEventListener("menu-select", (event) => {
    console.log(event.detail.item.id, event.detail.selectedIds);
  });
</script>
```

Supply translated labels from the consuming application. No HTML strings are
accepted as labels or icons. The `icon` property accepts decorative text only.
Components use Shadow DOM. CSS custom properties inherit from the document;
`::part(surface)` exposes the menu surface. Set `data-theme="dark"` on the root
for the supplied dark theme, or override semantic colour roles.

## Public contract

| Property / attribute               | Values                                                       |
| ---------------------------------- | ------------------------------------------------------------ |
| `items` (JavaScript property only) | `MenuEntry[]`, immutable replacement on change               |
| `variant`                          | `vertical` (default), `baseline`                             |
| `colorScheme` / `color-scheme`     | `standard` (default), `vibrant`                              |
| `selectionMode` / `selection-mode` | `none`, `single`, `multi`                                    |
| `menuLabel` / `menu-label`         | Required localized accessible name                           |
| `quick`                            | Skip entry animation                                         |
| `open`                             | Read-only open state                                         |
| `selectedIds`                      | Read-only array of selected action ids                       |
| `show(anchor, options?)`           | Async; optional `last`, or `x` and `y` for context placement |
| `close(restoreFocus = true)`       | Close descendants and optionally return focus                |

Action fields: `id`, `label`, `supportingText`, `trailingText`, `badge`, `icon`,
`disabled`, `selected`, `href`, `children`. Ids are unique across the tree.
`selected` initializes selection; later user selection belongs to the component.
`href` actions cannot also select or open a submenu. Separators use
`{ separator: true }`. Disabled actions remain focusable but cannot activate.

`menu-select` bubbles across Shadow DOM with `{ item, selectedIds }`.
`menu-open` and `menu-close` also bubble. Events from descendants bubble through
their ancestors; consumers that need only root events check `event.target`.

Angular consumers need `CUSTOM_ELEMENTS_SCHEMA`; Vue consumers configure
`compilerOptions.isCustomElement` for every `bubble-*` tag; React consumers use
`addEventListener` for custom events. The exhaustively documented examples are in
[Vue 3](docs/it/vue.md) and [React](docs/it/react.md); their runtime verification
is still open. The English and French editions live in `docs/en` and `docs/fr`.

## Material scope and source gaps

Reference: [Material menus](https://m3.material.io/components/menus/overview),
local specification snapshot read on 2026-11-10, DSM data version 38.2.9.
The local specification also cites token data 34.0.21 and `v0_192`.
These are distinct source versions, not a unified verified token release.

- Baseline uses its documented 4px container corner; vertical uses 16px.
- Vibrant is available only for vertical menus.
- Groups use dividers on the web. Group gaps and a horizontal variant are not
  claimed as supported Material web variants.
- A 48px minimum target deliberately exceeds the 44px Expressive visual item
  height recorded in the token table. Visual and interaction geometry need review.
- The menu uses the local Roboto label-large and body-small roles when the
  typography stylesheet is loaded after the colour and component tokens.
- Entry translation/scale, 200ms submenu delay, padding and shadow resolution
  include provisional implementation choices. They are not verified missing
  measurements from the Expressive diagrams.
- Baseline uses 12px horizontal item padding and 24px icon slots; vertical uses
  16px and 20px from the recorded token table. Expressive diagram measurements
  remain incomplete.
- Menu density is implemented as a 4dp step offset; filtering, pointer-exit
  submenu dismissal, exit transitions, origin-aware ripple and complete
  Expressive spring and shape motion remain open.
- Submenus flip at viewport edges; compact-window replacement by a bottom sheet
  is not implemented. Nested multi-selection currently belongs to each submenu;
  root `selectedIds` does not aggregate descendant selection.
- Only the supplied standard-contrast light/dark presets are implemented.
  Contrast-level generation and a complete reference-to-system token generator
  remain open.

## Verification status

Type checking and production build are executable with `npm run build`.
Chromium checks cover selection, disabled actions, keyboard, submenus, focus
return, viewport placement, dark and right-to-left rendering, the scrollable tab
strip, list selection and expansion, the search combobox, menu groups and
density, split-button sizes, snackbar queueing, rich tooltip persistence, the
M3 checkbox control, determinate and wavy progress, slider inset icons, dial
drag and dialog entry motion. The overflow matrix is clean from 320 to 1440 CSS
pixels in light, dark, LTR and RTL.

No claim of WCAG 2.2 AA conformance is made. Automated regression suites follow
production-code approval under the adopted frontend rules. Screen-reader checks,
real devices, Firefox/WebKit, the runtime checks of the Vue/React examples and
Angular integration remain open.
The package stays private until release identity, licence and release checks are
confirmed. No publication occurs during this phase.

## Component catalogue in 0.2.0

The package now registers all 36 catalogue entries: the existing menu and the
35 additions below. Each addition has a functional native control or semantic
surface. Entry coverage does **not** mean complete Material 3 or Expressive
conformance. The support column states the implemented contract. The limits
column states missing variants or behaviour.

`demo/showcase.ts` renders every catalogue entry through the public package entry.
`src/catalogue.ts` exports the classes, the `catalogue` registration map,
`BubbleItem`, picker labels and event detail types. Every tag has a
`HTMLElementTagNameMap` declaration. Importing the package registers the tags.

| Catalogue entry        | Public element                  | Support                                                                                                                                                                                                                                                                     | Open limits                                                                                                                                                                                    |
| ---------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App bars               | `bubble-app-bar`                | Semantic header and heading; small, centered, medium, large, medium-flexible, large-flexible and search layouts; subtitle; leading/trailing slots; sticky, controlled scrolled/collapsed state                                                                              | No automatic scroll tracking, adaptive action overflow or spring collapse; search content uses the default slot                                                                                |
| Autocomplete           | `bubble-autocomplete`           | Filled/outlined text field with a suggestion listbox built from `<option>` children or an `options` array; case-insensitive substring filter while typing; ArrowDown/ArrowUp, Enter, Escape and Tab; top-layer popup that escapes container clipping and flips above the field when space is missing; combobox ARIA with `aria-activedescendant`; inherited validation, readonly, disabled and form submission | No asynchronous fetching or debounce hook; single value only; suggestion matching is a substring, not fuzzy |
| Badges                 | `bubble-badge`                  | Small dot or numeric text; count cap; caller-supplied accessible status label                                                                                                                                                                                               | Caller positions badge and updates the complete label when the count changes                                                                                                                   |
| Bottom sheets          | `bubble-bottom-sheet`           | Native modal dialog at the bottom; optional drag handle; standard variant fixed at the bottom without scrim; actions and close control                                                                                                                                      | No swipe/drag gesture, detents or content-driven expansion; the handle is visual only                                                                                                          |
| Button groups          | `bubble-button-group`           | Standard and connected groups; single/multiple selection; required selection after activation; filled, tonal, outlined or elevated buttons; label-only or icon+label contents; size and shape propagation; connected inner corners at the M3 per-size values (XS 4, S/M 8, L 16, XL 20dp) that grow on hover (XS 8, S/M 12, L/XL 20dp); arrow/Home/End focus                                                                                                              | No neighbouring-width animation or spring motion; group itself submits no value; initial required selection belongs to the caller                                                              |
| Buttons                | `bubble-button`                 | Filled, tonal, outlined, elevated, text; toggles with M3 unselected/selected colour mapping; round/square with size-aware radii (12/12/16/28/28dp) and pressed morph (8/8/12/16/16dp); five sizes with a 40px small container; native links; disabled; form submit/reset                                                                                                                                                       | No origin-aware ripple; no toggle-text combination; no full native form override attribute set                                                                                                 |
| Cards                  | `bubble-card`                   | Semantic article; filled, outlined, elevated; vertical and horizontal orientation with media slot; optional whole-card link                                                                                                                                                 | Whole-card links must not contain other interactive controls; no dragged state                                                                                                                 |
| Carousel               | `bubble-carousel`               | Native scroll/snap; previous/next and keyboard navigation; hero, center-aligned-hero, multi-browse, uncontained, uncontained-multi-aspect-ratio and vertical full-screen layout hooks                                                                                       | Hero/multi-browse use project flex widths, not dynamic M3 keyline masking; no item morph; caller controls aspect ratios and full-screen breakpoint restrictions                                |
| Checkbox               | `bubble-checkbox`               | Custom 18dp checkbox with rounded square, check path and indeterminate dash, focus ring, error border, supporting text; required, disabled; form association and reset                                                                                                      | No exact M3 check path timing or error icon in the supporting text                                                                                                                             |
| Chips                  | `bubble-chip`                   | Assist, suggestion, input and filter; flat and elevated styles; leading icon and avatar slots; filter checkmark replaces the native mark; optional removal; links                                                                                                           | No single-select radio filter group or drag/reorder; removal emits an event and does not delete consumer data                                                                                  |
| Date pickers           | `bubble-date-picker`            | Formatted readonly field; modal calendar grid and inline docked calendar; single/range; month/year selection; locale month/day names; min/max; keyboard navigation; confirm/cancel                                                                                          | No numeric input view; editable typing replaced by the formatted field; Shift+M/Y shortcuts missing                                                                                            |
| Dialogs                | `bubble-dialog`                 | Native dialog; basic/fullscreen; modal or nonmodal; close value; Escape; platform focus containment and return; entry motion per placement with reduced-motion opt-out                                                                                                      | No container transform from the invoking element or exit animation                                                                                                                             |
| Divider                | `bubble-divider`                | Native horizontal rule; full, inset, inset-start, inset-end and vertical modes; decorative mode                                                                                                                                                                             | Vertical form needs a parent height or uses the action-target minimum                                                                                                                          |
| Extended FAB           | `bubble-extended-fab`           | Label/icon button; small (56), medium (80) and large (96) sizes; six accent/container colours and surface; submit/reset                                                                                                                                                     | No scroll-driven collapse, branded variant or container transform; unverified Expressive radii remain project adaptations                                                                      |
| FAB menu               | `bubble-fab-menu`               | Native FAB trigger; primary, secondary and tertiary colour sets; top-layer light-dismiss menu; item actions; arrows/Home/End; first-letter navigation; Escape and focus return                                                                                                    | No alternate FAB sizes; item count of 2–6 belongs to the caller; `href` is not used in this action-only menu                                                                                   |
| Floating action button | `bubble-floating-action-button` | FAB, medium, large and legacy small; height 56/80/96px; elevation level 3 at rest and level 4 on hover; six accent/container colours and surface                                                                                                                                                                                               | No container transform, spring motion or automatic tooltip                                                                                                                                     |
| Icon buttons           | `bubble-icon-button`            | Native button/link; default/toggle; filled, tonal, outlined, standard; sizes, shapes and width hooks                                                                                                                                                                        | Narrow/wide geometry uses project minimum targets rather than the complete per-size token matrix; icon shape/weight belongs to caller content                                                  |
| Lists                  | `bubble-list`                   | Native list with standard and segmented styles; one- and two-line rows; icons, supporting text, links and interactive buttons; trailing count badge from the item `badge`; single and multiple selection with listbox/option semantics; expandable rows with nested lists and disclosure state                          | No draggable/reorderable rows or nested checkboxes/radios; segmented gaps use a 2px project value                                                                                              |
| Loading indicator      | `bubble-loading-indicator`      | Named indeterminate progressbar; default/contained; morph-style keyframes with reduced-motion fallback                                                                                                                                                                      | Approximated morph, not the exact seven M3 shape paths; the reference does not supply the paths or morph timing                                                                                |
| Navigation bar         | `bubble-navigation-bar`         | 80px bar, 3-slot destinations, 64x32 active indicator, 24px icons, 12px labels; links or actions; disabled destinations                                                                                                                                                     | No automatic breakpoint swap or flexible-bar width animation                                                                                                                                   |
| Navigation drawer      | `bubble-navigation-drawer`      | Standard or modal start-side navigation; destinations; current link; navigation event; close on modal action                                                                                                                                                                | No grouped destination sections, automatic responsive switching or persistent layout resizing                                                                                                  |
| Navigation rail        | `bubble-navigation-rail`        | 96px collapsed and 220px expanded widths, 56px items, 56x32 indicator; current destination                                                                                                                                                                                  | No modal expanded rail, expansion toggle, embedded FAB or sections                                                                                                                             |
| Progress indicators    | `bubble-progress-indicator`     | Determinate linear track with 4dp stop indicator, indeterminate slide, circular SVG variants and an Expressive wavy track with determinate clip or indeterminate phase motion; bounded values                                                                               | No spring transitions or exact Expressive wave amplitude                                                                                                                                       |
| Radio button           | `bubble-radio-button`           | Native radio; form/name-scoped exclusive selection; arrows/Home/End; required and disabled; form reset                                                                                                                                                                      | A consumer fieldset/legend supplies the group label; native glyph rather than exact M3 artwork                                                                                                 |
| Search                 | `bubble-search`                 | Semantic search region; contained and divided appearances; docked results and full-screen layout shells; query events; Enter search event; results slot; suggestion combobox with filtered options, arrow keys, Enter acceptance, Escape and optional debounce on `suggest`; the field fills the bar, the label and supporting text stay in the accessibility tree and the bar carries the focus indicator | No expanded full-screen takeover or loading state; suggestion data and fetching belong to the caller                                                                                           |
| Segmented buttons      | `bubble-segmented-buttons`      | Native fieldset/radio or checkbox group; two to five segments; label-only or icon+label contents; connected segment geometry with a 40px container inside a 48px target and a retained 1px outline; checkmark on selected segments; single/multiple values; required, disabled; form reset/restore                                                     | Inner selected corners follow a project rule, not a full token matrix; density steps are not implemented                                                                                       |
| Select                 | `bubble-select`                 | Single choice over native `<option>` and `<optgroup>` children; Material vertical menu with group labels, checkmark and 12dp selected shape; filled/outlined field with label, placeholder, supporting text and error; menu width follows the field up to 280px; Enter/Space/Arrow keys open, Escape closes; required validation, disabled state and form submission | No multiple selection or type-ahead in the closed field; the popup uses menu semantics (`menuitemradio`) instead of a listbox; option changes need a DOM mutation to refresh |
| Side sheets            | `bubble-side-sheet`             | Modal dialog or fixed standard aside at the end edge; detached frame with 16px margin and rounded corners                                                                                                                                                                   | Caller owns persistent page layout; no swipe/drag or automatic content resizing                                                                                                                |
| Sliders                | `bubble-slider`                 | Single custom track with native inputs overlaid: continuous, centered and range with two handles; stop markers at 4px with the M3 roles; five track sizes; value bubble on hover/focus with 48px minimum width; inset start/end icons flanking the track; rotated custom vertical track; capped width token                                 | Firefox track parity unverified; inset icons align at the track ends instead of the thicker M3 inset track; the pressed handle does not grow to the 28dp pressed state |
| Snackbar               | `bubble-snackbar`               | Persistent polite live region; top-layer surface; message/action/dismiss; timer pause on hover/focus; queued messages shown one after another; entry motion with reduced-motion opt-out                                                                                     | No exit or container-transform motion; application must choose an adequate timeout, or `duration=0`                                                                                            |
| Split button           | `bubble-split-button`           | Primary action plus menu action joined at a 2px seam, outer full corners and inner 4px corners mirrored in RTL; optional leading icon; four colour styles; five sizes matching the button scale; disabled                                                                  | No spring shape motion or named form submit on the primary action                                                                                                                              |
| Switch                 | `bubble-switch`                 | Switch role over a native checkbox; state-dependent 16/24dp handle with transition, optional off/on handle icons, error border, disabled state, supporting text; form association and reset                                                                                 | No pressed-state 28dp handle or state-layer ripple                                                                                                                                             |
| Tabs                   | `bubble-tabs`                   | Tablist and named slotted panels; primary and secondary styles; icon and badge per tab; automatic/manual activation; arrows/Home/End; disabled tabs; scrollable strip with previous/next controls and edge states                                                           | No movable Expressive indicator or scroll-to-active animation; scroll buttons are project controls around the tablist                                                                          |
| Text fields            | `bubble-text-field`             | Filled/outlined; input/textarea; labels, helper text, required marker and counter; leading/trailing icon slots; prefix and suffix; native validation; readonly and bounds                                                                                                   | No select mode, minlength, password visibility control or floating-label animation                                                                                                             |
| Time pickers           | `bubble-time-picker`            | Formatted readonly field; modal dial and input modes; 12/24-hour; AM/PM; keyboard dial navigation; pointer-angle drag across outer and inner 24-hour rings; min/max/step validation                                                                                         | No continuous minute dial or exact M3 dial geometry                                                                                                                                            |
| Toolbars               | `bubble-toolbar`                | Docked/floating; standard/vibrant; horizontal/vertical; native control arrow/Home/End focus                                                                                                                                                                                 | No adaptive overflow menu, expansion, docking transition or FAB morph                                                                                                                          |
| Tooltips               | `bubble-tooltip`                | Top-layer plain or rich content; hover, focus and Escape; plain tooltip offset 4 and rich offset 8; rich tooltip stays open until dismissed by outside press, Escape or its dismiss control; rich content/action slots; accessible trigger description                      | Uses `aria-description` on the real trigger, not cross-shadow `aria-describedby`; native/Bubble button, link or input trigger required; touch behaviour depends on the platform                |

### Public values and events

Properties containing arrays or objects use JavaScript property assignment.
Attributes use kebab case for `supporting-text`, `upper-value`, `upper-label`,
`close-label`, `action-label`, `menu-label`, `remove-label`, `selection-mode`,
`end-value`, `week-starts-on`, `hour-cycle` and `show-value`.
Boolean attributes use presence/absence; `disabled="false"` still means disabled.
Caller content supplies translated labels, icon content and destination text.
Picker controls have English and Italian messages through `locale` and
the `labels` override object. Date formatting uses `Intl.DateTimeFormat`.

```ts
import {
  BubbleCheckbox,
  type BubbleItem,
  type BubbleValueChangeDetail,
} from "@bubble/web-components";
import "@bubble/web-components/tokens.css";
import "@bubble/web-components/typography.css";

const destinations: BubbleItem[] = [
  { id: "inbox", label: "Inbox", icon: "✉", href: "/inbox" },
  { id: "archive", label: "Archive", href: "/archive" },
];
document.querySelector("bubble-navigation-bar")!.items = destinations;

const field = document.querySelector("bubble-text-field")!;
field.addEventListener("change", (event) => {
  const { value } = (event as CustomEvent<BubbleValueChangeDetail>).detail;
  console.log(value);
});

const checkbox = new BubbleCheckbox();
checkbox.name = "consent";
checkbox.value = "yes";
checkbox.label = "Consent";
document.querySelector("form")!.append(checkbox);
```

- `BubbleItem`: unique `id`, visible `label`, optional text `icon`,
  `supportingText`, `href`, `disabled`. Item strings render as text, never HTML.
- Button `variant`: `filled`, `tonal`/`filled-tonal`, `outlined`, `elevated`,
  `text`; icon buttons also accept `standard`. `toggle` enables `selected`.
  Button sizes: `xs`, `small`, `medium`, `large`, `xl`. Shapes: `round`, `square`.
- Floating action button sizes: `fab` (default), `medium`, `large`, legacy
  `small`. Extended floating action button sizes: `small` (default), `medium`,
  `large`. Colours: `primary-container`, `secondary-container`,
  `tertiary-container`, `primary`, `secondary`, `tertiary`, `surface`.
- `change`: `{ value }`, `{ checked, value }` or `{ selected }` for the
  corresponding control. Multiple selection adds `values`; sliders add
  `upperValue`; date ranges add `endValue`.
- `value-input`: current text, search, date, time or slider value during editing.
  Native composed `input` events also cross the component boundary.
- `action`: an optional item `id`; `navigate`: destination `id`;
  `remove`: chip removal request; `selection-change`: button group `values`;
  `search`: query `value`; carousel `change`: numeric `index`.
- `closed`: dialog `returnValue` or snackbar `reason`.
  `before-close` is cancellable for dialog Escape dismissal.
- Dialogs/sheets: `show(opener?)`, `close(returnValue?)`, `open`.
  `variant="standard"` keeps a sheet in the page layout.
  Dialog fullscreen spelling is `variant="fullscreen"`.
- Snackbar: `show(message?)`, `close(reason?)`, `duration` in milliseconds;
  zero disables the timer. Positive durations have a 4000 ms minimum.
- Carousel: `goTo(index)`, `index`, `previous-label`, `next-label`.
- Tabs: `value` selects the `BubbleItem.id`; a panel uses `slot="<id>"`.
  `activation="manual"` moves focus without selection until Enter or Space.

### Forms and focus

Checkboxes, radio buttons, switches, filter chips, text fields, search,
date/time pickers, sliders and segmented buttons use `ElementInternals`.
The hosts support `name`, `form`, disabled fieldsets, native constraint state,
`checkValidity()`, `reportValidity()`, reset and browser state restoration.
Form reset restores the values present at first render, not later attribute
edits. Date and time values serialize as `YYYY-MM-DD` and `HH:MM`.
Range dates/sliders and multiple segments submit repeated entries under `name`.
Unchecked checkboxes, switches and filter chips submit nothing.
Button groups do not submit selection; segmented buttons do.

Buttons, icon buttons and floating action buttons support `type="submit"` or
`type="reset"` and the external `form` attribute. A submit action uses a native
temporary submitter so `name`/`value` and native form validation apply.
The submitter exists only during submission. `formaction`, `formmethod`,
`formenctype`, `formtarget` and `formnovalidate` are not exposed.

Control `label` values name the real shadow control. A label on a custom host
alone does not replace the required control label. Native focus indicators use
the existing focus token. Modal surfaces use platform focus containment rather
than a document-wide custom key trap. Rich tooltip descriptions use the
focusable inner trigger. Navigation without `href` emits `navigate` for a router.
Only links with real `href` provide native browser navigation.

### Material support boundaries

`src/design-system.json` records the design system version, source date,
token snapshot and verification boundary. `src/tokens.css` contains authored
component tokens and light/dark presets. Generated typography and local font
delivery remain unchanged. The new shared styles consume those tokens.

The minimum action target is 48 CSS pixels. This exceeds some 32/40/44-pixel
visual containers in the specification. Some component dimensions, gaps,
widths, radii and motion are project adaptations. Source gaps do not establish
Material requirements. Exact Expressive geometry, seven-shape loading motion,
spring motion, dynamic carousel keylines and the complete component-state matrix
remain open. The wavy progress track is an approximation of the Expressive
shape, not a measured replica. No full Expressive conformance is claimed.
The demo is an interactive catalogue, not a complete every-state,
every-contrast conformance page.

Supported platform requirements are native custom elements, shadow DOM,
`ElementInternals`, native dialog and the Popover API. No polyfills are bundled.
Only the existing standard-contrast light/dark themes are supplied.
High/medium contrast generation, a complete token generator and certification
of consumer colour overrides remain open.

### Catalogue verification

Production build and TypeScript declaration emission pass.
The demo consumer files also pass strict TypeScript checking.
Prettier reports no formatting errors.
Inline Chromium checks use the public components on the existing demo server.
The checks cover registration/demo coverage, form submission and reset, disabled
fieldsets, named submit buttons, exclusive radio keyboard selection, modal
dismissal, standard sheets, date-grid keyboard selection, time-dial selection,
tabs, group/toolbar focus, FAB-menu dismissal and tooltip descriptions.
The demo has no document-level horizontal overflow at 320, 640 and 1280 pixels.
No runtime page errors occur in these checks.
Additional Chromium checks pass for required radio groups, disabled/nameless
segmented values, filter-chip submission, multiple/range reset, date-range
bounds, numeric sanitization, connected required selection and FAB-menu Tab
dismissal. A fresh document loads the built distribution and renders all
36 registered elements.

The audit round adds checks for the scrollable tab strip, list selection and
expansion, the search combobox, menu groups and density, split-button sizes,
snackbar queueing, rich tooltip persistence, the custom checkbox control,
determinate/wavy progress, slider inset icons, time-dial drag and dialog entry
motion; the overflow matrix covers 320, 600, 900, 1280 and 1440 pixels in both
themes.

Persistent automated test files are not added before production-code approval.
Firefox/WebKit, touch/pointer drag, screen readers, complete colour-state
contrast, zoom/text spacing for every new component and framework integration
remain unverified. These checks do not establish accessibility conformance.

[Italiano](../it/vue.md) · [English](./vue.md) · [Français](../fr/vue.md)

# Vue 3 · exhaustive usage examples

This guide covers all 36 components of the library. Each section lists the
public attributes, the slots, the events and the methods, then shows a Vue 3
example that uses them all. The examples assume `<script setup lang="ts">` and
Vue 3.4 or later. For React see [react.md](./react.md).

The components are Custom Elements: Vue treats them as native elements, not as
Vue components. This has three consequences, explained in the integration rules:
attributes stay HTML attributes, events are DOM events with `detail`,
and methods are called through a template ref.

## Installation and registration

```sh
npm install @bolle/web-components
```

```ts
// src/main.ts
import "@bolle/web-components/tokens.css";
import "@bolle/web-components/typography.css";
import "@bolle/web-components"; // registra tutti i tag bolle-*
import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
```

The library build already registers every tag: no Vue plugins and no
`app.use()` are needed. The light theme is the default; dark is enabled with
`document.documentElement.dataset.theme = "dark"`, as in the demo.

### Vue compiler

Vue must know that the `bolle-*` tags are not components to be resolved.

```ts
// vite.config.ts
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith("bolle-"),
        },
      },
    }),
  ],
});
```

If the Vue build happens at runtime, apply the same rule to the app:

```ts
app.config.compilerOptions.isCustomElement = (tag) =>
  tag.startsWith("bolle-");
```

`vue-tsc` does not infer the types of Custom Element attributes. For a complete
static check you need typed wrapper components, like this one:

```vue
<!-- src/components/AppTextField.vue -->
<script setup lang="ts">
import type { BolleTextField } from "@bolle/web-components";

const model = defineModel<string>({ default: "" });
</script>

<template>
  <bolle-text-field
    :label="label"
    :value="model"
    @value-input="model = ($event as CustomEvent<{ value: string }>).detail.value"
  />
</template>
```

The wrapper is useful only if you need type checking: the following examples
use the library tags directly.

## Integration rules

### Properties and attributes

Vue sets a DOM property when the key exists on the element, otherwise it
writes an attribute. Properties that accept arrays or objects must therefore
be bound with `:` and the property name, not as a string:

| Component             | Property to bind                                 |
| --------------------- | ------------------------------------------------ |
| `bolle-segmented-buttons` | `:items`, `:values`                         |
| `bolle-search`       | `:suggestions`                                   |
| `bolle-date-picker`  | `:labels`                                        |
| `bolle-list`         | `:items`, `:value` (including arrays), `:expanded` |
| `bolle-navigation-*`, `bolle-tabs`, `bolle-fab-menu`, `bolle-split-button`, `bolle-menu` | `:items` |
| `bolle-slider`       | `:iconStart`, `:iconEnd` (accept SVG or text)    |
| `bolle-switch`       | `:icon`, `:iconSelected`                         |

All other attributes (`variant`, `size`, `label`, `disabled`, `required`,
`supporting-text`…) work both as static attributes and with `:binding`.
For composed attributes use kebab-case: `:supporting-text`,
`:upper-value`, `:remove-label`, `:menu-label`, `:close-label`.

Properties declared without an attribute (`icon`, `iconSelected`, `iconStart`,
`iconEnd`, `items`, `values`, `suggestions`, `labels`, `expanded` and the list
`value`) exist only as properties: bind them with the exact property name
(`:iconStart`, `:items`). With an in-DOM template the browser lowercases
attribute names, so in that case use `v-bind="{ iconStart }"`.

Booleans are reflected attributes: `<bolle-checkbox checked />` is equivalent
to `:checked="true"`, while `:checked="false"` removes the attribute.

### Events

All custom events are `bubbles: true` and `composed: true`. In Vue you listen
to them with `@event-name` and the payload is in `event.detail`. The names are
always kebab-case:

```
@change  @value-input  @selection-change  @navigate  @expand
@action  @remove  @search  @suggest  @closed  @before-close
@menu-select  @menu-open  @menu-close  @queued
```

The `before-close` event is cancelable: `@before-close.prevent` prevents the
dialog from closing. Native events such as `click` and `submit` work
normally.

```ts
// src/bolle.ts
export function detail<T>(event: Event): T {
  return (event as CustomEvent<T>).detail;
}
```

### Controlled value

Form components do not emit a native `input` event: they emit
`value-input` on every keystroke and `change` on confirmation. The pattern is
always the same: you pass `:value` (or `:checked`, `:selected`) and realign the
state in the handler.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { detail } from "./bolle";

const email = ref("");
const accepted = ref(false);
</script>

<template>
  <bolle-text-field
    label="Email"
    type="email"
    :value="email"
    @value-input="email = detail<{ value: string }>($event).value"
  />
  <bolle-checkbox
    label="Accetto i termini"
    :checked="accepted"
    @change="accepted = detail<{ checked: boolean }>($event).checked"
  />
</template>
```

For checkbox, switch, radio, filter chip, segmented buttons, list and tabs the
returned value is a boolean (`checked`, `selected`) or an id (`value`), not
an input string.

### Refs and methods

Dialog, sheet, snackbar, tooltip, menu, fab-menu and carousel expose imperative
methods. They are called on a template ref typed with the component class.

```vue
<script setup lang="ts">
import { ref } from "vue";
import type { BolleSnackbar } from "@bolle/web-components";

const snackbar = ref<BolleSnackbar | null>(null);
</script>

<template>
  <bolle-snackbar ref="snackbar" message="Documento salvato" />
  <bolle-button @click="snackbar?.show('Documento salvato')">Salva</bolle-button>
</template>
```

### Form

Form components are form-associated: `bolle-button` with
`type="submit"`, checkbox, switch, radio, text field, search, slider,
segmented buttons, date picker, time picker and filter chip enter the
`FormData` with `name` and `value`. No hidden inputs are needed and names are
not duplicated.

```vue
<form @submit.prevent="onSubmit">
  <bolle-text-field name="email" label="Email" required />
  <bolle-checkbox name="newsletter" value="si" label="Newsletter" />
  <bolle-button type="submit">Iscriviti</bolle-button>
</form>
```

```ts
function onSubmit(event: Event) {
  const data = new FormData(event.currentTarget as HTMLFormElement);
  console.log(data.get("email"), data.get("newsletter"));
}
```

`form.reset()` restores the controls to their initial value, including date
ranges, range sliders and multiple selections.

### Language, direction and theme

Pickers use `locale` (default `document.documentElement.lang`) and accept
overrides with `:labels`. Components read the direction from the ancestor via
`:dir()`: setting `dir="rtl"` on `<html>` or on a container is enough. The theme
is changed with `data-theme="dark"` on `<html>`.

```vue
<bolle-date-picker
  label="Data"
  locale="it"
  :labels="{ open: 'Apri calendario', confirm: 'Conferma' }"
/>
```

### Keyboard shortcuts

Every `bolle-*` element except `bolle-menu` accepts `shortcut`, written in the
`aria-keyshortcuts` syntax (`Alt+S`, `Control+Shift+F`, alternatives separated by
a space). The component writes `aria-keyshortcuts` on its focusable inner
control: buttons, links, checkboxes and radios are focused and clicked, fields
are focused. Disabled or hidden components ignore the shortcut.

```vue
<template>
  <bolle-button shortcut="Alt+S" @click="save">Save</bolle-button>
  <bolle-text-field label="Search" shortcut="Control+K Meta+K"></bolle-text-field>
</template>
```

`:shortcut="value"` makes it dynamic; an empty string removes the shortcut and
the ARIA attribute.

### Icons and slots

Slots accept Vue nodes: `<svg slot="icon">`, `<span slot="leading">`,
`<img slot="media">`. The `icon` field inside item arrays, on the other hand, is
rendered as text: use a Material Symbols ligature name with the icon font
loaded by the project, or a character. Do not pass HTML markup as a
string, because it would be shown literally.

The library does not include an icon font. The demo uses inline SVG in slots and
ligature names in items.

## Actions

### bolle-button

Attributes: `variant` (filled, tonal, filled-tonal, outlined, elevated, text,
standard), `size` (xs, small, medium, large, xl), `shape` (round, square),
`width` (default, narrow, wide; it affects icon-only), `disabled`, `toggle`,
`selected`, `label`, `href`, `target`, `type` (button, submit, reset), `name`,
`value`, `expanded`, `controls`, `haspopup`. Slots: default, `icon`. Events:
`change` with `{ selected }` when `toggle` is active.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { detail } from "./bolle";

const variants = ["filled", "tonal", "filled-tonal", "outlined", "elevated", "text", "standard"] as const;
const sizes = ["xs", "small", "medium", "large", "xl"] as const;
const expanded = ref(false);
const submitted = ref("");

function onToggle(event: Event) {
  expanded.value = detail<{ selected: boolean }>(event).selected;
}
function onSubmit(event: Event) {
  submitted.value = String(
    new FormData(event.currentTarget as HTMLFormElement).get("azione"),
  );
}
</script>

<template>
  <bolle-button v-for="variant in variants" :key="variant" :variant="variant">
    {{ variant }}
  </bolle-button>
  <bolle-button v-for="size in sizes" :key="size" :size="size" variant="tonal">
    {{ size }}
  </bolle-button>

  <bolle-button variant="outlined" shape="square">Quadrato</bolle-button>

  <bolle-button variant="filled">
    <svg slot="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M11 5h2v14h-2zM5 11h14v2H5z" />
    </svg>
    Nuovo
  </bolle-button>

  <bolle-button
    toggle
    haspopup="menu"
    :selected="expanded"
    :expanded="expanded"
    controls="pannello"
    @change="onToggle"
  >
    {{ expanded ? "Chiudi" : "Apri" }}
  </bolle-button>

  <bolle-button href="https://example.com" target="_blank" variant="text">
    Documentazione
  </bolle-button>

  <form @submit.prevent="onSubmit">
    <bolle-button type="submit" name="azione" value="salva">Salva</bolle-button>
    <bolle-button type="reset" variant="outlined">Reimposta</bolle-button>
  </form>

  <bolle-button label="Aggiungi" disabled>Disabilitato</bolle-button>
  <output>{{ submitted }}</output>
</template>
```

### bolle-icon-button

Inherits everything from `bolle-button` and adds `icon-only`. The accessible
label is mandatory: always use `label`. `width` (narrow, wide) changes the area
of the icon alone.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { detail } from "./bolle";

const pinned = ref(false);
const menuOpen = ref(false);
</script>

<template>
  <bolle-icon-button
    v-for="size in ['xs', 'small', 'medium', 'large', 'xl']"
    :key="size"
    :size="size"
    :label="`Azione ${size}`"
  >
    <svg slot="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
    </svg>
  </bolle-icon-button>

  <bolle-icon-button width="narrow" label="Ristretto">★</bolle-icon-button>
  <bolle-icon-button width="wide" label="Largo">★</bolle-icon-button>
  <bolle-icon-button variant="tonal" shape="square" label="Quadrato">★</bolle-icon-button>

  <bolle-icon-button
    toggle
    :selected="pinned"
    label="Fissa in alto"
    @change="pinned = detail<{ selected: boolean }>($event).selected"
  >
    📌
  </bolle-icon-button>

  <bolle-icon-button
    haspopup="menu"
    :expanded="menuOpen"
    controls="menu-azioni"
    label="Altre azioni"
  >
    ⋯
  </bolle-icon-button>
</template>
```

### bolle-floating-action-button

Attributes: `size` (fab is the base size, then small, medium, large), `color`
(primary-container, secondary-container, tertiary-container, primary, secondary,
tertiary, surface), `label`, `disabled`, `href`. Slots: default, `icon`. The FAB
shows only the icon: `label` is the accessible label.

```vue
<script setup lang="ts">
const colors = [
  "primary-container",
  "secondary-container",
  "tertiary-container",
  "primary",
  "secondary",
  "tertiary",
  "surface",
] as const;
</script>

<template>
  <bolle-floating-action-button
    v-for="color in colors"
    :key="color"
    :color="color"
    :label="`Crea (${color})`"
  >
    ＋
  </bolle-floating-action-button>

  <bolle-floating-action-button size="small" label="Crea piccolo">＋</bolle-floating-action-button>
  <bolle-floating-action-button size="medium" label="Crea medio" color="tertiary">＋</bolle-floating-action-button>
  <bolle-floating-action-button size="large" label="Crea grande" color="secondary">＋</bolle-floating-action-button>
  <bolle-floating-action-button href="https://example.com" label="Apri collegamento">↗</bolle-floating-action-button>
  <bolle-floating-action-button label="Crea disabilitato" disabled>＋</bolle-floating-action-button>
</template>
```

### bolle-extended-fab

Extends the FAB with visible text. Attributes: like the FAB plus `size` small,
medium, large (default small). The visible text is the default slot; `label`
sets the accessible label.

```vue
<template>
  <bolle-extended-fab label="Nuovo documento" size="small" color="primary-container">
    Nuovo documento
  </bolle-extended-fab>
  <bolle-extended-fab label="Condividi" size="medium" color="tertiary">
    Condividi
  </bolle-extended-fab>
  <bolle-extended-fab label="Crea presentazione" size="large" color="secondary">
    <span slot="icon" aria-hidden="true">＋</span>
    Crea presentazione
  </bolle-extended-fab>
</template>
```

### bolle-button-group

Attributes: `label`, `variant` (standard, connected), `selection` (none, single,
multiple), `required`, `size`, `shape`. Children: `bolle-button` or
`bolle-icon-button` with `value`. Event: `selection-change` with `{ values }`.
With a `selection` other than `none` the children become toggles and the keyboard
moves with the arrow keys.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { detail } from "./bolle";

const alignment = ref("left");
const formats = ref<string[]>(["bold"]);
</script>

<template>
  <bolle-button-group
    label="Allineamento"
    variant="connected"
    selection="single"
    required
    size="small"
    shape="round"
    @selection-change="alignment = detail<{ values: string[] }>($event).values[0] ?? alignment"
  >
    <bolle-button value="left" :selected="alignment === 'left'">Sinistra</bolle-button>
    <bolle-button value="center" :selected="alignment === 'center'">Centro</bolle-button>
    <bolle-button value="right" :selected="alignment === 'right'">Destra</bolle-button>
  </bolle-button-group>

  <bolle-button-group
    label="Formato"
    variant="connected"
    selection="multiple"
    size="small"
    @selection-change="formats = detail<{ values: string[] }>($event).values"
  >
    <bolle-button value="bold" :selected="formats.includes('bold')">B</bolle-button>
    <bolle-button value="italic" :selected="formats.includes('italic')">I</bolle-button>
    <bolle-button value="underline" :selected="formats.includes('underline')">U</bolle-button>
  </bolle-button-group>

  <bolle-button-group label="Gruppo semplice" variant="standard" selection="none" size="large">
    <bolle-button variant="outlined">A</bolle-button>
    <bolle-button variant="outlined">B</bolle-button>
  </bolle-button-group>
</template>
```

## Communication

### bolle-badge

Attributes: `value`, `label`, `small`, `max`. Without `label` the badge is
`aria-hidden`; with `label` it becomes `role="status"` and announces the value.
With `small` it shows no text, only the dot. `max` produces `999+`.

```vue
<template>
  <span class="badge-anchor">
    <bolle-icon-button label="Notifiche">🔔</bolle-icon-button>
    <bolle-badge value="12" style="position: absolute; inset-block-start: -4px; inset-inline-end: -4px" />
  </span>

  <bolle-badge :value="1200" :max="999" label="Messaggi non letti" />
  <bolle-badge value="Nuovo" label="Novità" />
  <bolle-badge value="" label="Aggiornamento disponibile" small />
  <bolle-badge value="7" />
</template>
```

### bolle-progress-indicator

Attributes: `label`, `value`, `max`, `indeterminate`, `variant` (linear,
circular), `wavy`. `wavy` applies to the linear variant and combines with
determinate and indeterminate.

```vue
<template>
  <bolle-progress-indicator label="Download" :value="65" />
  <bolle-progress-indicator label="Connessione" indeterminate />
  <bolle-progress-indicator label="Avanzamento pratica" :value="35" :max="50" />
  <bolle-progress-indicator wavy label="Avanzamento ondulato" :value="60" />
  <bolle-progress-indicator wavy indeterminate label="Attesa ondulata" />
  <bolle-progress-indicator variant="circular" label="Caricamento file" :value="65" />
  <bolle-progress-indicator variant="circular" indeterminate label="Attesa circolare" />
</template>
```

### bolle-loading-indicator

Attributes: `label`, `variant` (default, contained). Always indeterminate, with
`role="progressbar"`.

```vue
<template>
  <bolle-loading-indicator label="Caricamento" />
  <bolle-loading-indicator variant="contained" label="Caricamento allegati" />
</template>
```

### bolle-snackbar

Attributes: `open`, `message`, `action-label`, `close-label`, `duration` (ms,
effective minimum 4000; 0 disables automatic closing). Methods:
`show(message?)`, `close(reason?)`. Events: `action`, `closed` with
`{ reason }`, `queued` with `{ pending }`. Consecutive `show` calls
queue the messages.

```vue
<script setup lang="ts">
import { ref } from "vue";
import type { BolleSnackbar } from "@bolle/web-components";
import { detail } from "./bolle";

const snackbar = ref<BolleSnackbar | null>(null);
const log = ref("");
</script>

<template>
  <bolle-snackbar
    ref="snackbar"
    message="Documento eliminato"
    action-label="Annulla"
    close-label="Chiudi"
    :duration="6000"
    @action="log = 'azione: annulla'"
    @closed="log = `chiuso: ${detail<{ reason: string }>($event).reason}`"
    @queued="log = `in coda: ${detail<{ pending: number }>($event).pending}`"
  />

  <bolle-button variant="tonal" @click="snackbar?.show('Documento salvato')">Mostra</bolle-button>
  <bolle-button
    variant="outlined"
    @click="snackbar?.show('Primo'); snackbar?.show('Secondo'); snackbar?.show('Terzo')"
  >
    Accoda tre messaggi
  </bolle-button>
  <bolle-button variant="text" @click="snackbar?.close('manuale')">Chiudi</bolle-button>
  <output>{{ log }}</output>
</template>
```

### bolle-tooltip

Attributes: `label`, `variant` (plain, rich), `supporting-text`, `persistent`.
Slots: default (trigger), `content`, `actions`. Methods: `show()`, `hide()`. The
plain tooltip closes on releasing focus/hover; `persistent` keeps it open
until Escape. The rich variant closes on an outside click and must not be used
for essential interactive content.

```vue
<script setup lang="ts">
import { ref } from "vue";
import type { BolleTooltip } from "@bolle/web-components";

const tip = ref<BolleTooltip | null>(null);
</script>

<template>
  <bolle-tooltip label="Conserva una copia del documento">
    <bolle-button variant="tonal">Salva una copia</bolle-button>
  </bolle-tooltip>

  <bolle-tooltip
    ref="tip"
    variant="rich"
    persistent
    label="Spazio personale"
    supporting-text="La copia resta nel tuo spazio e resta aperta finché non la chiudi."
  >
    <bolle-button variant="outlined">Dettagli</bolle-button>
    <p slot="content">Puoi riaprire la copia dalla sezione Documenti.</p>
    <bolle-button slot="actions" variant="text">Apri Documenti</bolle-button>
  </bolle-tooltip>

  <bolle-button variant="text" @click="tip?.show()">Mostra tooltip ricco</bolle-button>
  <bolle-button variant="text" @click="tip?.hide()">Nascondi</bolle-button>
</template>
```

### bolle-carousel

Attributes: `label`, `variant` (hero, multi-browse, uncontained,
uncontained-multi-aspect-ratio, center-aligned-hero, full-screen),
`previous-label`, `next-label`, `index`. Children: the slides. Method:
`goTo(index)`. Event: `change` with `{ index }`. The `full-screen`
variant scrolls vertically.

```vue
<script setup lang="ts">
import { ref } from "vue";
import type { BolleCarousel } from "@bolle/web-components";
import { detail } from "./bolle";

const carousel = ref<BolleCarousel | null>(null);
const current = ref(0);
const variants = [
  "hero",
  "multi-browse",
  "uncontained",
  "uncontained-multi-aspect-ratio",
  "center-aligned-hero",
  "full-screen",
] as const;
</script>

<template>
  <bolle-carousel
    ref="carousel"
    variant="hero"
    label="Documenti recenti"
    previous-label="Precedente"
    next-label="Successivo"
    :index="current"
    @change="current = detail<{ index: number }>($event).index"
  >
    <article><h3>Posta</h3><p>Messaggi ricevuti</p></article>
    <article><h3>Archivio</h3><p>Documenti salvati</p></article>
    <article><h3>Impostazioni</h3><p>Preferenze personali</p></article>
  </bolle-carousel>

  <bolle-carousel
    v-for="variant in variants"
    :key="variant"
    :variant="variant"
    :label="`Carousel ${variant}`"
    previous-label="Precedente"
    next-label="Successivo"
  >
    <article>A · {{ variant }}</article>
    <article>B · {{ variant }}</article>
    <article>C · {{ variant }}</article>
  </bolle-carousel>

  <bolle-button variant="outlined" @click="carousel?.goTo(0)">Prima slide</bolle-button>
  <bolle-button variant="outlined" @click="carousel?.goTo(2)">Ultima slide</bolle-button>
  <output>{{ current + 1 }}</output>
</template>
```

## Containment

### bolle-card

Attributes: `variant` (filled, elevated, outlined), `orientation` (vertical,
horizontal), `href`, `label`. Slots: `media`, default. With `href` the default
content is wrapped in a link, so do not insert other links or interactive
buttons inside the card.

```vue
<template>
  <bolle-card
    v-for="variant in ['filled', 'elevated', 'outlined']"
    :key="variant"
    :variant="variant"
    :label="`Scheda ${variant}`"
  >
    <h3>Documento</h3>
    <p>Contenuto indipendente con un'azione interna.</p>
    <bolle-button variant="text">Apri</bolle-button>
  </bolle-card>

  <bolle-card orientation="horizontal" href="https://example.com" label="Rapporto annuale">
    <img slot="media" src="/cover.jpg" alt="Copertina del rapporto" />
    <h3>Rapporto annuale</h3>
    <p>Riepilogo delle attività dell'anno.</p>
  </bolle-card>
</template>
```

### bolle-dialog

Attributes: `open`, `label`, `variant` (basic, full-screen), `modal`,
`close-label`. Slots: default, `actions`. Methods: `show(opener?)`,
`close(returnValue?)`. Events: `closed` with `{ returnValue }`, `before-close`
with `{ reason }` (cancelable).

```vue
<script setup lang="ts">
import { ref } from "vue";
import type { BolleDialog } from "@bolle/web-components";
import { detail } from "./bolle";

const confirm = ref<BolleDialog | null>(null);
const fullscreen = ref<BolleDialog | null>(null);
const nonModal = ref<BolleDialog | null>(null);
const proposalOpen = ref(false);
const dirty = ref(true);
const result = ref("");

function onBeforeClose(event: Event) {
  if (dirty.value) event.preventDefault();
}
function onClosed(event: Event) {
  result.value = detail<{ returnValue: string }>(event).returnValue;
  proposalOpen.value = false;
}
</script>

<template>
  <bolle-button variant="filled" @click="confirm?.show()">Elimina</bolle-button>
  <bolle-dialog
    ref="confirm"
    label="Eliminare il documento?"
    variant="basic"
    :modal="true"
    close-label="Annulla"
    @before-close="onBeforeClose"
    @closed="onClosed"
  >
    <p>L'operazione non può essere annullata.</p>
    <bolle-button slot="actions" variant="text" @click="confirm?.close('elimina')">
      Elimina
    </bolle-button>
  </bolle-dialog>

  <bolle-button variant="outlined" @click="fullscreen?.show()">Apri a schermo intero</bolle-button>
  <bolle-dialog ref="fullscreen" variant="full-screen" label="Editor" close-label="Chiudi">
    <p>Contenuto a schermo intero.</p>
    <bolle-button slot="actions" @click="fullscreen?.close('salvato')">Salva</bolle-button>
  </bolle-dialog>

  <bolle-button variant="text" @click="nonModal?.show()">Dialog non modale</bolle-button>
  <bolle-dialog ref="nonModal" :modal="false" label="Nota" close-label="Chiudi">
    <p>Questo dialog non blocca il resto della pagina.</p>
  </bolle-dialog>

  <bolle-button variant="tonal" @click="proposalOpen = true">Dialog dichiarativo</bolle-button>
  <bolle-dialog :open="proposalOpen" label="Proposta" close-label="Chiudi" @closed="onClosed">
    <p>Controllato dalla proprietà open.</p>
  </bolle-dialog>
  <output>{{ result }}</output>
</template>
```

### bolle-bottom-sheet

Inherits dialog. Additional attributes: `drag-handle`, `variant` (modal,
standard). The standard variant does not use the native dialog: it renders an
inline section visible when `open` is true.

```vue
<script setup lang="ts">
import { ref } from "vue";
import type { BolleBottomSheet } from "@bolle/web-components";
import { detail } from "./bolle";

const sheet = ref<BolleBottomSheet | null>(null);
const inlineOpen = ref(true);
const result = ref("");
</script>

<template>
  <bolle-button variant="filled" @click="sheet?.show()">Apri foglio modale</bolle-button>
  <bolle-bottom-sheet
    ref="sheet"
    drag-handle
    label="Filtri"
    close-label="Chiudi"
    @closed="result = detail<{ returnValue: string }>($event).returnValue ?? ''"
  >
    <p>Scegli i filtri da applicare.</p>
    <bolle-button slot="actions" @click="sheet?.close('applica')">Applica</bolle-button>
  </bolle-bottom-sheet>

  <bolle-bottom-sheet
    :open="inlineOpen"
    variant="standard"
    drag-handle
    label="Filtri inline"
  >
    <p>Foglio standard ancorato in basso.</p>
    <bolle-button variant="text" @click="inlineOpen = false">Chiudi</bolle-button>
  </bolle-bottom-sheet>
  <output>{{ result }}</output>
</template>
```

### bolle-side-sheet

Inherits dialog. Additional attributes: `detached`, `variant` (modal, standard).
The side is set by the component: `side`. `detached` adds the margin of the
detached variant.

```vue
<script setup lang="ts">
import { ref } from "vue";
import type { BolleSideSheet } from "@bolle/web-components";

const side = ref<BolleSideSheet | null>(null);
const standardOpen = ref(true);
</script>

<template>
  <bolle-button variant="filled" @click="side?.show()">Apri pannello</bolle-button>
  <bolle-side-sheet ref="side" label="Dettagli" detached close-label="Chiudi">
    <p>Dettagli del documento selezionato.</p>
    <bolle-button slot="actions" @click="side?.close('salvato')">Salva</bolle-button>
  </bolle-side-sheet>

  <bolle-side-sheet :open="standardOpen" variant="standard" detached label="Dettagli inline">
    <p>Pannello standard sempre visibile accanto al contenuto.</p>
    <bolle-button variant="text" @click="standardOpen = false">Chiudi</bolle-button>
  </bolle-side-sheet>
</template>
```

### bolle-divider

Attributes: `vertical`, `inset`, `variant` (full, inset, inset-start,
inset-end), `decorative`. Without `decorative` it exposes `role="separator"`;
with `decorative` it is hidden from assistive technologies.

```vue
<template>
  <bolle-divider />
  <bolle-divider inset />
  <bolle-divider variant="inset-start" />
  <bolle-divider variant="inset-end" />
  <bolle-divider decorative />

  <div style="display: flex; block-size: 120px; align-items: center; gap: 8px">
    <span>Prima</span>
    <bolle-divider vertical />
    <span>Dopo</span>
  </div>
  <div style="display: flex; block-size: 120px; align-items: center; gap: 8px">
    <span>Prima</span>
    <bolle-divider vertical decorative />
    <span>Dopo</span>
  </div>
</template>
```

## Navigation

### bolle-app-bar

Attributes: `label`, `variant` (small, center-aligned, medium,
medium-flexible, large, large-flexible, search), `subtitle`, `alignment`
(leading, center), `sticky`, `scrolled`, `collapsed`. Slots: `leading`,
`trailing`, default. In the `search` variant the default slot hosts an
`bolle-search`; in the others it hosts the title instead of `label`.

```vue
<script setup lang="ts">
import { ref } from "vue";

const scrolled = ref(false);
const collapsed = ref(false);
const variants = ["small", "center-aligned", "medium", "medium-flexible", "large", "large-flexible"] as const;
</script>

<template>
  <bolle-app-bar
    label="Posta"
    variant="small"
    subtitle="12 non letti"
    alignment="leading"
    sticky
    :scrolled="scrolled"
    :collapsed="collapsed"
  >
    <bolle-icon-button slot="leading" label="Menu">☰</bolle-icon-button>
    <bolle-icon-button slot="trailing" label="Cerca">🔍</bolle-icon-button>
  </bolle-app-bar>

  <bolle-app-bar
    v-for="variant in variants"
    :key="variant"
    :variant="variant"
    :label="`Posta ${variant}`"
    subtitle="12 non letti"
    :collapsed="collapsed"
  >
    <bolle-icon-button slot="leading" label="Menu">☰</bolle-icon-button>
  </bolle-app-bar>

  <bolle-app-bar variant="search">
    <bolle-search label="Cerca" placeholder="Cerca nella posta">
      <span slot="leading" aria-hidden="true">🔍</span>
    </bolle-search>
  </bolle-app-bar>

  <bolle-button variant="outlined" @click="scrolled = !scrolled">Alterna scrolled</bolle-button>
  <bolle-button variant="outlined" @click="collapsed = !collapsed">Alterna collapsed</bolle-button>
</template>
```

### bolle-toolbar

Attributes: `label`, `variant` (docked, floating), `orientation` (horizontal,
vertical), `color` (standard, vibrant). The child controls receive a roaming
`tabindex` and move with the arrow keys depending on the orientation.

```vue
<template>
  <bolle-toolbar label="Formato" variant="docked" orientation="horizontal" color="standard">
    <bolle-icon-button label="Grassetto" toggle>B</bolle-icon-button>
    <bolle-icon-button label="Corsivo" toggle>I</bolle-icon-button>
    <bolle-icon-button label="Sottolineato" toggle>U</bolle-icon-button>
    <bolle-divider vertical decorative />
    <bolle-icon-button label="Allinea a sinistra">≡</bolle-icon-button>
  </bolle-toolbar>

  <bolle-toolbar label="Modifica" color="vibrant">
    <bolle-icon-button label="Taglia" variant="standard">✂</bolle-icon-button>
    <bolle-icon-button label="Copia" variant="standard">⧉</bolle-icon-button>
    <bolle-icon-button label="Incolla" variant="standard">📋</bolle-icon-button>
  </bolle-toolbar>

  <bolle-toolbar label="Formato" variant="floating">
    <bolle-icon-button label="Grassetto" toggle>B</bolle-icon-button>
    <bolle-icon-button label="Corsivo" toggle>I</bolle-icon-button>
  </bolle-toolbar>

  <bolle-toolbar label="Allineamento" variant="floating" orientation="vertical">
    <bolle-icon-button label="Su">↑</bolle-icon-button>
    <bolle-icon-button label="Giù">↓</bolle-icon-button>
  </bolle-toolbar>
</template>
```

### bolle-navigation-bar

Attributes: `label`, `items` (array of `BolleItem` with `id`, `label`, `icon`,
`href`, `disabled`), `value`, `variant` (standard, flexible), `layout`
(vertical, horizontal). Event: `navigate` with `{ id }`. Use three to five
destinations.

```vue
<script setup lang="ts">
import { ref } from "vue";
import type { BolleItem } from "@bolle/web-components";
import { detail } from "./bolle";

const destinations: BolleItem[] = [
  { id: "inbox", label: "Posta", icon: "inbox" },
  { id: "archive", label: "Archivio", icon: "archive", href: "/archivio" },
  { id: "settings", label: "Impostazioni", icon: "settings" },
  { id: "trash", label: "Cestino", icon: "trash", disabled: true },
];

const current = ref("inbox");
</script>

<template>
  <bolle-navigation-bar
    label="Navigazione principale"
    :items="destinations"
    :value="current"
    variant="standard"
    layout="vertical"
    @navigate="current = detail<{ id: string }>($event).id"
  />

  <bolle-navigation-bar
    label="Navigazione flessibile"
    :items="destinations"
    :value="current"
    variant="flexible"
    layout="horizontal"
    @navigate="current = detail<{ id: string }>($event).id"
  />
  <output>{{ current }}</output>
</template>
```

### bolle-navigation-rail

Inherits navigation bar and adds `expanded`. The rail is always collapsed by
default; `expanded` shows the labels next to the icons. `variant` and
`layout` remain available.

```vue
<script setup lang="ts">
import { ref } from "vue";
import type { BolleItem } from "@bolle/web-components";
import { detail } from "./bolle";

const destinations: BolleItem[] = [
  { id: "inbox", label: "Posta", icon: "inbox" },
  { id: "archive", label: "Archivio", icon: "archive" },
  { id: "settings", label: "Impostazioni", icon: "settings" },
];
const current = ref("inbox");
</script>

<template>
  <bolle-navigation-rail
    label="Rail compresso"
    :items="destinations"
    :value="current"
    @navigate="current = detail<{ id: string }>($event).id"
  />
  <bolle-navigation-rail
    expanded
    variant="standard"
    layout="vertical"
    label="Rail espanso"
    :items="destinations"
    :value="current"
    @navigate="current = detail<{ id: string }>($event).id"
  />
</template>
```

### bolle-navigation-drawer

Inherits side sheet. Attributes: `items`, `value`, `label`, `variant` (modal,
standard), `detached`, `close-label`; default slot for additional content.
Event: `navigate` with `{ id }`. Methods: `show(opener?)`, `close()`. In the
standard variant it stays inline and is controlled with `open`.

```vue
<script setup lang="ts">
import { ref } from "vue";
import type { BolleItem, BolleNavigationDrawer } from "@bolle/web-components";
import { detail } from "./bolle";

const destinations: BolleItem[] = [
  { id: "inbox", label: "Posta", icon: "inbox" },
  { id: "archive", label: "Archivio", icon: "archive", href: "/archivio" },
  { id: "settings", label: "Impostazioni", icon: "settings" },
];
const current = ref("inbox");
const standardOpen = ref(true);
const drawer = ref<BolleNavigationDrawer | null>(null);
</script>

<template>
  <bolle-button variant="filled" @click="drawer?.show()">Apri drawer</bolle-button>
  <bolle-navigation-drawer
    ref="drawer"
    label="Sezioni"
    close-label="Chiudi"
    :items="destinations"
    :value="current"
    @navigate="current = detail<{ id: string }>($event).id"
  >
    <p>Contenuto aggiuntivo del drawer.</p>
  </bolle-navigation-drawer>

  <bolle-navigation-drawer
    :open="standardOpen"
    variant="standard"
    detached
    label="Sezioni standard"
    :items="destinations"
    :value="current"
    @navigate="current = detail<{ id: string }>($event).id"
  >
    <bolle-button variant="text" @click="standardOpen = false">Chiudi</bolle-button>
  </bolle-navigation-drawer>
</template>
```

### bolle-tabs

Attributes: `items` (`id`, `label`, `icon`, `badge`, `disabled`), `value`,
`label`, `variant` (primary, secondary), `activation` (automatic, manual),
`scrollable`. Slots: one for each item `id`. Event: `change` with `{ value }`.
With `manual` the selection happens with Enter or click, not with the arrow
keys alone.

```vue
<script setup lang="ts">
import { ref } from "vue";
import type { BolleItem } from "@bolle/web-components";
import { detail } from "./bolle";

const primary: BolleItem[] = [
  { id: "inbox", label: "Posta", icon: "inbox", badge: "3" },
  { id: "archive", label: "Archivio", icon: "archive" },
  { id: "settings", label: "Preferenze", icon: "settings" },
  { id: "trash", label: "Cestino", icon: "trash", disabled: true },
];
const many: BolleItem[] = Array.from({ length: 8 }, (_, index) => ({
  id: `s${index}`,
  label: `Vista ${index + 1}`,
}));

const tab = ref("inbox");
const manyTab = ref("s0");
</script>

<template>
  <bolle-tabs
    label="Categorie"
    :items="primary"
    :value="tab"
    variant="primary"
    activation="automatic"
    :scrollable="false"
    @change="tab = detail<{ value: string }>($event).value"
  >
    <p slot="inbox">Messaggi ricevuti.</p>
    <p slot="archive">Documenti salvati.</p>
    <p slot="settings">Preferenze personali.</p>
    <p slot="trash">Elementi eliminati.</p>
  </bolle-tabs>

  <bolle-tabs
    label="Dettagli"
    :items="primary"
    :value="tab"
    variant="secondary"
    activation="manual"
    @change="tab = detail<{ value: string }>($event).value"
  >
    <p slot="inbox">Scheda secondaria.</p>
    <p slot="archive">Archivio secondario.</p>
    <p slot="settings">Impostazioni secondarie.</p>
    <p slot="trash">Cestino secondario.</p>
  </bolle-tabs>

  <bolle-tabs
    label="Viste scorrevoli"
    :items="many"
    :value="manyTab"
    scrollable
    @change="manyTab = detail<{ value: string }>($event).value"
  >
    <p v-for="item in many" :key="item.id" :slot="item.id">{{ item.label }}</p>
  </bolle-tabs>
</template>
```

## Selection

### bolle-checkbox

Attributes: `checked`, `indeterminate`, `label`, `value`, `name`, `required`,
`disabled`, `supporting-text`, `error`. Slots: default (label). Event:
`change` with `{ checked, value }`. Form-associated.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { detail } from "./bolle";

const terms = ref(false);
const partial = ref(true);
const newsletter = ref(true);

function onTerms(event: Event) {
  terms.value = detail<{ checked: boolean }>(event).checked;
}
</script>

<template>
  <form>
    <bolle-checkbox
      label="Accetto i termini"
      name="terms"
      value="si"
      required
      :checked="terms"
      supporting-text="Puoi revocare il consenso in qualsiasi momento."
      @change="onTerms"
    />
    <bolle-checkbox name="newsletter" value="si" :checked="newsletter" label="Newsletter" />
    <bolle-checkbox :indeterminate="partial" label="Selezione parziale" />
    <bolle-checkbox checked disabled label="Disabilitata" />
    <bolle-checkbox checked error required label="Campo con errore" supporting-text="Devi accettare per continuare." />
  </form>
</template>
```

### bolle-switch

Inherits checkbox and adds `icon` and `iconSelected`, available only as
properties (`:icon`, `:iconSelected`). The role is `switch`. Same attributes,
events and form behaviour as the checkbox.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { detail } from "./bolle";

const wifi = ref(true);
const notifications = ref(false);
</script>

<template>
  <bolle-switch
    label="Wi-Fi"
    name="wifi"
    value="on"
    :checked="wifi"
    :icon="'🔅'"
    :iconSelected="'🔆'"
    @change="wifi = detail<{ checked: boolean }>($event).checked"
  />
  <bolle-switch
    label="Notifiche"
    :checked="notifications"
    supporting-text="Ricevi un avviso per ogni aggiornamento."
    @change="notifications = detail<{ checked: boolean }>($event).checked"
  />
  <bolle-switch checked disabled label="Bluetooth disabilitato" />
  <bolle-switch checked error required label="Con errore" supporting-text="Azione richiesta." />
</template>
```

### bolle-radio-button

Attributes: `name`, `value`, `checked`, `label`, `required`, `disabled`.
Selection is grouped by `name`; the arrow keys move the focus and select,
Home/End go to the first and the last. Event: `change` with
`{ checked, value }`.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { detail } from "./bolle";

const plan = ref("standard");
</script>

<template>
  <form>
    <bolle-radio-button
      v-for="option in ['standard', 'plus', 'enterprise']"
      :key="option"
      name="plan"
      :value="option"
      :label="option"
      :checked="plan === option"
      required
      @change="plan = detail<{ value: string }>($event).value"
    />
    <bolle-radio-button name="plan" value="legacy" label="Legacy" disabled />
    <bolle-radio-button name="locale" value="it" label="Italiano" checked />
    <bolle-radio-button name="locale" value="en" label="Inglese" />
  </form>
</template>
```

### bolle-chip

Attributes: `variant` (assist, filter, input, suggestion), `label`, `selected`,
`elevated`, `disabled`, `removable`, `remove-label`, `href`, `name`, `value`,
`required`. Slots: `avatar`, `icon`, default. Events: `action`, `change` with
`{ selected }` for filter, `remove`. Only the filter variant enters the form.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { detail } from "./bolle";

const favorite = ref(false);
const city = ref(["Roma"]);
const log = ref("");
</script>

<template>
  <bolle-chip variant="assist" label="Aggiungi al calendario" @action="log = 'assist'" />
  <bolle-chip
    variant="filter"
    name="filters"
    value="favorite"
    label="Preferiti"
    :selected="favorite"
    @change="favorite = detail<{ selected: boolean }>($event).selected"
  />
  <bolle-chip variant="filter" name="filters" value="unread" label="Solo non letti" />
  <bolle-chip variant="filter" elevated label="Elevata" />

  <bolle-chip
    v-for="name in city"
    :key="name"
    variant="input"
    :label="name"
    removable
    :remove-label="`Rimuovi ${name}`"
    @remove="city = city.filter((value) => value !== name)"
  >
    <span slot="avatar" aria-hidden="true">{{ name.slice(0, 2) }}</span>
  </bolle-chip>

  <bolle-chip variant="suggestion" label="Grazie!">
    <span slot="icon" aria-hidden="true">✓</span>
  </bolle-chip>
  <bolle-chip variant="assist" href="https://example.com" label="Apri collegamento">
    <span slot="icon" aria-hidden="true">↗</span>
  </bolle-chip>
  <bolle-chip variant="assist" label="Disabilitata" disabled />
  <output>{{ log }}</output>
</template>
```

### bolle-list

Attributes: `items` (with `id`, `label`, `icon`, `supportingText`, `badge`,
`href`, `selected`, `disabled`, `items`, `expanded`), `label`, `variant`
(standard, segmented), `interactive`, `selection` (none, single, multiple),
`value` (string or array), `expanded` (array of ids). Slots: default for
additional rows. Events: `action` with `{ id }`, `change` with
`{ value, id, selected }`, `expand` with `{ id, expanded }`.

```vue
<script setup lang="ts">
import { ref } from "vue";
import type { BolleItem } from "@bolle/web-components";
import { detail } from "./bolle";

const items: BolleItem[] = [
  { id: "inbox", label: "Posta", icon: "inbox", supportingText: "Messaggi ricevuti" },
  { id: "archive", label: "Archivio", icon: "archive", href: "/archivio" },
  {
    id: "folders",
    label: "Cartelle",
    icon: "folder",
    items: [
      { id: "work", label: "Lavoro" },
      { id: "home", label: "Casa" },
    ],
  },
  { id: "trash", label: "Cestino", icon: "trash", disabled: true },
  { id: "pinned", label: "Fissati", icon: "pin", selected: true },
];

const single = ref("inbox");
const multiple = ref<string[]>(["inbox"]);
const expanded = ref<string[]>(["folders"]);
const log = ref("");

function onExpand(event: Event) {
  const { id, expanded: open } = detail<{ id: string; expanded: boolean }>(event);
  expanded.value = open
    ? [...expanded.value, id]
    : expanded.value.filter((value) => value !== id);
}
</script>

<template>
  <bolle-list
    label="Selezione singola"
    variant="standard"
    interactive
    selection="single"
    :items="items"
    :value="single"
    :expanded="expanded"
    @change="single = detail<{ value: string }>($event).value"
    @expand="onExpand"
  />

  <bolle-list
    label="Selezione multipla"
    variant="segmented"
    selection="multiple"
    :items="items"
    :value="multiple"
    @change="multiple = detail<{ value: string[] }>($event).value"
  />

  <bolle-list
    label="Azioni"
    interactive
    selection="none"
    :items="items"
    @action="log = `azione ${detail<{ id: string }>($event).id}`"
  />

  <bolle-list label="Statico con link" selection="none" :items="items">
    <li><div class="list-item">Riga personalizzata</div></li>
  </bolle-list>
  <output>{{ log }}</output>
</template>
```

### bolle-segmented-buttons

Attributes: `items` (with `id`, `label`, `icon`, `disabled`), `multiple`,
`values` (array, multiple only), `value` (single), `label`, `name`,
`required`, `disabled`. Event: `change` with `{ value, values }`. Use two to
five segments.

```vue
<script setup lang="ts">
import { ref } from "vue";
import type { BolleItem } from "@bolle/web-components";
import { detail } from "./bolle";

const segments: BolleItem[] = [
  { id: "inbox", label: "Posta", icon: "inbox" },
  { id: "archive", label: "Archivio", icon: "archive" },
  { id: "settings", label: "Impostazioni", icon: "settings" },
  { id: "trash", label: "Cestino", icon: "trash", disabled: true },
];

const view = ref("inbox");
const filters = ref<string[]>(["inbox", "archive"]);
</script>

<template>
  <form>
    <bolle-segmented-buttons
      label="Vista"
      name="view"
      :items="segments"
      :value="view"
      required
      @change="view = detail<{ value: string }>($event).value"
    />
    <bolle-segmented-buttons
      label="Filtri"
      name="filters"
      multiple
      :items="segments"
      :values="filters"
      @change="filters = detail<{ values: string[] }>($event).values"
    />
    <bolle-segmented-buttons label="Disabilitati" name="disabled" :items="segments" value="inbox" disabled />
  </form>
</template>
```

### bolle-slider

Attributes: `value`, `min`, `max`, `step`, `variant` (continuous, centered,
range), `size` (xs, small, medium, large, xl), `upper-value`, `upper-label`,
`orientation` (horizontal, vertical), `show-value`, `stops`, `iconStart`,
`iconEnd`, `label`, `name`, `required`, `disabled`. Events: `value-input` with
`{ value, upperValue }`, `change` with the same payload. The two icon fields are
properties only and are bound as `:iconStart` and `:iconEnd`.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { detail } from "./bolle";

const volume = ref("40");
const balance = ref("60");
const price = ref("20");
const upper = ref(80);
const brightness = ref("40");

function onPrice(event: Event) {
  const value = detail<{ value: string; upperValue?: number }>(event);
  price.value = value.value;
  upper.value = value.upperValue ?? upper.value;
}
</script>

<template>
  <bolle-slider
    name="volume"
    label="Volume"
    :value="volume"
    :min="0"
    :max="100"
    :step="1"
    variant="continuous"
    size="xs"
    orientation="horizontal"
    show-value
    @value-input="volume = detail<{ value: string }>($event).value"
  />

  <bolle-slider
    label="Bilanciamento"
    variant="centered"
    :value="balance"
    show-value
    @value-input="balance = detail<{ value: string }>($event).value"
  />

  <bolle-slider
    label="Prezzo"
    name="price"
    variant="range"
    :value="price"
    :upper-value="upper"
    upper-label="Massimo"
    show-value
    required
    @value-input="onPrice"
    @change="onPrice"
  />

  <bolle-slider
    label="Luminosità"
    :value="brightness"
    show-value
    :iconStart="'🔅'"
    :iconEnd="'🔆'"
    @value-input="brightness = detail<{ value: string }>($event).value"
  />

  <bolle-slider label="Passo 10 con indicatori" :step="10" value="40" show-value stops />
  <bolle-slider label="Small" size="small" value="30" />
  <bolle-slider label="Large" size="large" value="70" />
  <bolle-slider label="Verticale" orientation="vertical" value="50" />
  <bolle-slider label="Disabilitato" value="20" disabled />
</template>
```

## Text and input

### bolle-text-field

Attributes: `variant` (filled, outlined), `type` (text, email, password, number,
date, time, url, tel, search), `label`, `value`, `placeholder`,
`supporting-text`, `error`, `multiline`, `rows`, `readonly`, `min`, `max`,
`step`, `pattern`, `autocomplete`, `maxlength`, `counter`, `prefix`, `suffix`,
`name`, `required`, `disabled`. Slots: `leading`, `trailing`. Events:
`value-input` with `{ value }` on every keystroke, `change` with `{ value }` on
confirmation. `pattern` and `autocomplete` apply to the single-line field;
`rows` only to `multiline`.

```vue
<script setup lang="ts">
import { computed, ref } from "vue";
import { detail } from "./bolle";

const email = ref("");
const message = ref("");
const emailError = computed(
  () => email.value.length > 0 && !email.value.includes("@"),
);

function onEmail(event: Event) {
  email.value = detail<{ value: string }>(event).value;
}
function onMessage(event: Event) {
  message.value = detail<{ value: string }>(event).value;
}
</script>

<template>
  <form>
    <bolle-text-field
      name="email"
      label="Email"
      type="email"
      variant="outlined"
      placeholder="nome@dominio.it"
      autocomplete="email"
      :maxlength="120"
      counter
      required
      :value="email"
      :error="emailError"
      supporting-text="Useremo questo indirizzo per le notifiche."
      @value-input="onEmail"
      @change="onEmail"
    >
      <span slot="leading" aria-hidden="true">✉</span>
      <span slot="trailing" aria-hidden="true">?</span>
    </bolle-text-field>

    <bolle-text-field label="Nome utente" variant="filled" prefix="@" :maxlength="30" counter />
    <bolle-text-field label="Prezzo" type="number" min="0" max="9999" step="0.01" prefix="€" suffix="EUR" value="12.50" />
    <bolle-text-field
      label="Messaggio"
      multiline
      :rows="4"
      :maxlength="200"
      counter
      :value="message"
      @value-input="onMessage"
    />
    <bolle-text-field label="Solo lettura" readonly value="Valore bloccato" />
    <bolle-text-field label="Quantità" type="number" min="1" max="10" step="1" value="2" />
    <bolle-text-field label="Codice" pattern="[A-Z]{3}[0-9]{3}" value="ABC123" supporting-text="Tre lettere e tre cifre." />
    <bolle-text-field label="Data" type="date" min="2026-01-01" max="2026-12-31" />
    <bolle-text-field label="Ricerca" type="search" placeholder="Cerca" />
    <bolle-text-field label="Disabilitato" disabled value="Non modificabile" />
  </form>
</template>
```

### bolle-search

Inherits text field. Additional attributes: `appearance` (contained, divided),
`layout` (docked, full-screen), `suggestions` (array), `suggestions-label`,
`filter`, `suggestion-delay` (ms). Slots: `leading`, `trailing`, `results`
(docked layout only). Events: `value-input`, `change`, `search` with `{ value }`
on confirmation, `suggest` with `{ value }` on every input (delayed if
`suggestion-delay` is greater than zero).

```vue
<script setup lang="ts">
import { ref } from "vue";
import type { BolleItem } from "@bolle/web-components";
import { detail } from "./bolle";

const cities = ["Bologna", "Bolzano", "Firenze", "Genova", "Milano", "Napoli", "Roma", "Torino"];
const suggestions = ref<string[]>(cities);
const query = ref("");
const lastSearch = ref("");

const results: BolleItem[] = [
  { id: "r1", label: "Roma", supportingText: "Capitale d'Italia" },
  { id: "r2", label: "Torino", supportingText: "Capoluogo piemontese" },
];

function onSuggest(event: Event) {
  const value = detail<{ value: string }>(event).value.toLocaleLowerCase();
  suggestions.value = cities.filter((city) => city.toLocaleLowerCase().includes(value));
}
</script>

<template>
  <bolle-search
    label="Cerca documenti"
    placeholder="Titolo o autore"
    appearance="contained"
    layout="docked"
    :value="query"
    :suggestions="[]"
    :suggestion-delay="0"
    @value-input="query = detail<{ value: string }>($event).value"
    @search="lastSearch = detail<{ value: string }>($event).value"
  >
    <span slot="leading" aria-hidden="true">🔍</span>
    <span slot="trailing" aria-hidden="true">⌘K</span>
    <bolle-list slot="results" label="Risultati" selection="none" :items="results" />
  </bolle-search>

  <bolle-search appearance="divided" label="Cerca nel testo" placeholder="Parola chiave" />

  <bolle-search layout="full-screen" label="Cerca ovunque" placeholder="Cerca ovunque" />

  <bolle-search
    filter
    label="Cerca città"
    placeholder="Scrivi una città"
    suggestions-label="Suggerimenti"
    :suggestion-delay="150"
    :suggestions="suggestions"
    @suggest="onSuggest"
    @search="lastSearch = detail<{ value: string }>($event).value"
  />
  <output>{{ lastSearch }}</output>
</template>
```

### bolle-date-picker

Attributes: `variant` (modal, docked), `selection-mode` (single, range),
`value` (format `AAAA-MM-GG`), `end-value`, `locale`, `labels`, `min`, `max`,
`week-starts-on` (0 Sunday, 1 Monday), `label`, `name`, `required`,
`disabled`, `supporting-text`, `error`. Event: `change` with
`{ value, endValue }`. The `docked` variant renders the calendar always visible
and does not open the dialog.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { detail } from "./bolle";

const appointment = ref("2026-11-11");
const rangeStart = ref("2026-11-01");
const rangeEnd = ref("2026-11-20");

function onAppointment(event: Event) {
  appointment.value = detail<{ value: string }>(event).value;
}
function onRange(event: Event) {
  const value = detail<{ value: string; endValue: string }>(event);
  rangeStart.value = value.value;
  rangeEnd.value = value.endValue;
}
</script>

<template>
  <form>
    <bolle-date-picker
      label="Data appuntamento"
      name="appointment"
      locale="it"
      variant="modal"
      selection-mode="single"
      min="2026-01-01"
      max="2026-12-31"
      required
      :value="appointment"
      supporting-text="Seleziona un giorno lavorativo."
      @change="onAppointment"
    />

    <bolle-date-picker
      label="Periodo"
      name="period"
      locale="it"
      selection-mode="range"
      :value="rangeStart"
      :end-value="rangeEnd"
      @change="onRange"
    />

    <bolle-date-picker
      variant="docked"
      label="Calendario sempre visibile"
      locale="it"
      selection-mode="single"
      :value="appointment"
      :week-starts-on="1"
      :labels="{ previous: 'Mese precedente', next: 'Mese successivo' }"
      @change="onAppointment"
    />

    <bolle-date-picker label="Disabilitato" disabled value="2026-11-11" />
  </form>
</template>
```

In a form, the range picker submits two values with the same `name`:

```ts
new FormData(form).getAll("period"); // ["2026-11-01", "2026-11-20"]
```

### bolle-time-picker

Attributes: `variant` (dial, input), `hour-cycle` (12, 24), `value` (`HH:mm`),
`locale`, `labels`, `label`, `name`, `required`, `disabled`. Event: `change`
with `{ value }`. With `hour-cycle="12"` the AM/PM selector appears.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { detail } from "./bolle";

const time = ref("09:30");
const evening = ref("18:45");

function onTime(event: Event) {
  time.value = detail<{ value: string }>(event).value;
}
function onEvening(event: Event) {
  evening.value = detail<{ value: string }>(event).value;
}
</script>

<template>
  <form>
    <bolle-time-picker
      label="Ora promemoria"
      name="time"
      variant="dial"
      :hour-cycle="24"
      locale="it"
      required
      :value="time"
      @change="onTime"
    />
    <bolle-time-picker
      label="Ora in formato 12"
      variant="dial"
      :hour-cycle="12"
      locale="it"
      :value="evening"
      :labels="{ period: 'AM o PM', hour: 'Ora', minute: 'Minuti' }"
      @change="onEvening"
    />
    <bolle-time-picker
      label="Inserimento da tastiera"
      variant="input"
      :hour-cycle="24"
      value="08:15"
      @change="onTime"
    />
    <bolle-time-picker label="Disabilitato" disabled value="07:00" />
  </form>
</template>
```

## Menu

### bolle-menu

Attributes: `items` (`MenuEntry[]`), `menu-label` (mandatory), `variant`
(vertical, baseline), `color-scheme` (standard, vibrant; vertical only),
`selection-mode` (none, single, multi), `quick`, `density` (number, negative
values are more compact), `inactive`. Methods: `show(anchor, { last?, x?, y? })`,
`close(restoreFocus?)`. Getters: `open`, `selectedIds`. Events: `menu-open`,
`menu-close`, `menu-select` with `{ item, selectedIds }`.

```vue
<script setup lang="ts">
import { ref } from "vue";
import type { BolleMenu, MenuEntry } from "@bolle/web-components";
import { detail } from "./bolle";

const actions = ref<BolleMenu | null>(null);
const filters = ref<BolleMenu | null>(null);
const baseline = ref<BolleMenu | null>(null);
const last = ref("");

const documentItems: MenuEntry[] = [
  {
    group: true,
    label: "Modifica",
    items: [
      { id: "undo", label: "Annulla", icon: "undo", trailingText: "⌘Z" },
      { id: "redo", label: "Ripeti", icon: "redo", trailingText: "⇧⌘Z", disabled: true },
    ],
  },
  { separator: true },
  {
    id: "share",
    label: "Condividi",
    icon: "share",
    children: [
      { id: "link", label: "Copia collegamento" },
      { id: "email", label: "Invia per email" },
    ],
  },
  { id: "open", label: "Apri in nuova scheda", href: "https://example.com" },
  { id: "download", label: "Scarica", icon: "download", badge: "PDF" },
];

const filterItems: MenuEntry[] = [
  { id: "unread", label: "Non letti", selected: true },
  { id: "flagged", label: "Con stella" },
  { id: "attachments", label: "Con allegati", supportingText: "Almeno un file" },
];

const baselineItems: MenuEntry[] = [
  { id: "copy", label: "Copia" },
  { id: "paste", label: "Incolla", disabled: true },
];

function open(
  menu: BolleMenu | null,
  event: Event,
  options: { last?: boolean; x?: number; y?: number } = {},
) {
  menu?.show(event.currentTarget as HTMLElement, options);
}
function onSelect(event: Event) {
  const result = detail<{ item: { label: string }; selectedIds: string[] }>(event);
  last.value = `${result.item.label} (${result.selectedIds.join(", ")})`;
}
</script>

<template>
  <bolle-button haspopup="menu" @click="open(actions, $event)">Azioni</bolle-button>
  <bolle-menu
    ref="actions"
    menu-label="Azioni documento"
    variant="vertical"
    color-scheme="standard"
    selection-mode="none"
    :quick="false"
    :density="0"
    :inactive="false"
    :items="documentItems"
    @menu-open="last = 'menu aperto'"
    @menu-close="last = 'menu chiuso'"
    @menu-select="onSelect"
  />

  <bolle-button variant="tonal" haspopup="menu" @click="open(filters, $event, { last: true })">
    Filtri
  </bolle-button>
  <bolle-menu
    ref="filters"
    menu-label="Filtri contenuti"
    color-scheme="vibrant"
    selection-mode="multi"
    :density="-1"
    :items="filterItems"
    @menu-select="onSelect"
  />

  <bolle-button variant="outlined" haspopup="menu" @click="open(baseline, $event, { x: 120, y: 160 })">
    Menu baseline a coordinate
  </bolle-button>
  <bolle-button variant="text" @click="actions?.close()">Chiudi menu azioni</bolle-button>
  <bolle-menu
    ref="baseline"
    menu-label="Azioni rapide"
    variant="baseline"
    :items="baselineItems"
    @menu-select="onSelect"
  />
  <output>{{ last }}</output>
</template>
```

Validation rules applied by `show`: `menu-label` cannot be empty,
the baseline variant does not allow `color-scheme="vibrant"`, ids must be
unique, groups cannot nest beyond four levels, and an entry with
`href` cannot have `children` nor be used in a menu with selection.

### bolle-fab-menu

Attributes: `label`, `items` (two to six actions), `open`. Slots: `icon`.
Event: `action` with `{ id }`. `label` is the accessible name of the button and
of the menu. `open` is reflected internal state: there is no change event, so
it must not be used as a controlled binding.

```vue
<script setup lang="ts">
import { ref } from "vue";
import type { BolleItem } from "@bolle/web-components";
import { detail } from "./bolle";

const fabItems: BolleItem[] = [
  { id: "note", label: "Nota", icon: "note" },
  { id: "folder", label: "Cartella", icon: "folder" },
  { id: "upload", label: "Carica file", icon: "upload" },
  { id: "event", label: "Evento", icon: "calendar", disabled: true },
];
const log = ref("");
</script>

<template>
  <bolle-fab-menu
    label="Crea"
    :items="fabItems"
    @action="log = `crea ${detail<{ id?: string }>($event).id}`"
  >
    <span slot="icon" aria-hidden="true">＋</span>
  </bolle-fab-menu>
  <output>{{ log }}</output>
</template>
```

### bolle-split-button

Attributes: `label`, `menu-label`, `items` (`MenuEntry[]`), `disabled`,
`variant` (filled, tonal, outlined, elevated), `size` (xs, small, medium,
large, xl). Events: `action` for the main button, `menu-select` with
`{ item, selectedIds }` propagated from the internal menu; `menu-open` and
`menu-close` also bolle up. `menu-label` is mandatory to open the menu.

```vue
<script setup lang="ts">
import { ref } from "vue";
import type { MenuEntry } from "@bolle/web-components";
import { detail } from "./bolle";

const variants = ["filled", "tonal", "outlined", "elevated"] as const;
const sizes = ["xs", "small", "medium", "large", "xl"] as const;
const log = ref("");

const items: MenuEntry[] = [
  { id: "later", label: "Invia più tardi" },
  { id: "draft", label: "Salva bozza" },
  { separator: true },
  { id: "template", label: "Usa modello" },
];

function onSelect(event: Event) {
  log.value = detail<{ item: { label: string } }>(event).item.label;
}
</script>

<template>
  <bolle-split-button
    v-for="variant in variants"
    :key="variant"
    :variant="variant"
    :label="`Invia ${variant}`"
    :menu-label="`Altre opzioni ${variant}`"
    :items="items"
    @action="log = 'azione principale'"
    @menu-select="onSelect"
    @menu-open="log = 'menu aperto'"
    @menu-close="log = 'menu chiuso'"
  />

  <bolle-split-button
    v-for="size in sizes"
    :key="size"
    :size="size"
    :label="size"
    :menu-label="`Altre opzioni ${size}`"
    :items="items"
    @menu-select="onSelect"
  />

  <bolle-split-button
    label="Invia"
    menu-label="Altre opzioni"
    disabled
    :items="items"
  />
  <output>{{ log }}</output>
</template>
```

## Coverage

| Group         | Components                                                                 |
| ------------- | -------------------------------------------------------------------------- |
| Actions       | button, icon-button, floating-action-button, extended-fab, button-group    |
| Communication | badge, progress-indicator, loading-indicator, snackbar, tooltip, carousel  |
| Containment   | card, dialog, bottom-sheet, side-sheet, divider                            |
| Navigation    | app-bar, toolbar, navigation-bar, navigation-rail, navigation-drawer, tabs |
| Selection     | checkbox, switch, radio-button, chip, list, segmented-buttons, slider      |
| Text and input | text-field, search, date-picker, time-picker                              |
| Menu          | menu, fab-menu, split-button                                               |

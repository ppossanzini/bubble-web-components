[Italiano](./vue.md) · [English](../en/vue.md) · [Français](../fr/vue.md)

# Vue 3 · esempi d'uso esaustivi

Questa guida copre tutti i 36 componenti della libreria. Ogni sezione elenca gli
attributi pubblici, gli slot, gli eventi e i metodi, poi mostra un esempio Vue 3
che li usa tutti. Gli esempi presuppongono `<script setup lang="ts">` e Vue 3.4 o
successivo. Per React vedi [react.md](./react.md).

I componenti sono Custom Elements: Vue li tratta come elementi nativi, non come
componenti Vue. Questo ha tre conseguenze, spiegate nelle regole di integrazione:
gli attributi restano attributi HTML, gli eventi sono eventi DOM con `detail`,
e i metodi si chiamano tramite un template ref.

## Installazione e registrazione

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

La build della libreria registra già tutti i tag: non servono plugin Vue né
`app.use()`. Il tema chiaro è il default; lo scuro si attiva con
`document.documentElement.dataset.theme = "dark"`, come nella demo.

### Compilatore Vue

Vue deve sapere che i tag `bolle-*` non sono componenti da risolvere.

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

Se la build di Vue avviene a runtime, imposta la stessa regola sull'app:

```ts
app.config.compilerOptions.isCustomElement = (tag) =>
  tag.startsWith("bolle-");
```

`vue-tsc` non deduce i tipi degli attributi dei Custom Elements. Per una
verifica statica completa servono componenti wrapper tipizzati, come questo:

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

Il wrapper è utile solo se serve il type checking: negli esempi seguenti si
usano direttamente i tag della libreria.

## Regole di integrazione

### Proprietà e attributi

Vue imposta una proprietà DOM quando la chiave esiste sull'elemento, altrimenti
scrive un attributo. Le proprietà che accettano array o oggetti devono quindi
essere legate con `:` e il nome della proprietà, non come stringa:

| Componente            | Proprietà da legare                              |
| --------------------- | ------------------------------------------------ |
| `bolle-segmented-buttons` | `:items`, `:values`                         |
| `bolle-search`       | `:suggestions`                                   |
| `bolle-date-picker`  | `:labels`                                        |
| `bolle-list`         | `:items`, `:value` (anche array), `:expanded`    |
| `bolle-navigation-*`, `bolle-tabs`, `bolle-fab-menu`, `bolle-split-button`, `bolle-menu` | `:items` |
| `bolle-slider`       | `:iconStart`, `:iconEnd` (accettano SVG o testo)   |
| `bolle-switch`       | `:icon`, `:iconSelected`                         |

Tutti gli altri attributi (`variant`, `size`, `label`, `disabled`, `required`,
`supporting-text`…) funzionano sia come attributi statici sia con `:binding`.
Per gli attributi composti usa la forma kebab-case: `:supporting-text`,
`:upper-value`, `:remove-label`, `:menu-label`, `:close-label`.

Le proprietà dichiarate senza attributo (`icon`, `iconSelected`, `iconStart`,
`iconEnd`, `items`, `values`, `suggestions`, `labels`, `expanded` e `value`
della list) esistono solo come proprietà: si legano con il nome esatto della
proprietà (`:iconStart`, `:items`). Con un template in-DOM il browser abbassa i
nomi degli attributi, quindi in quel caso usa `v-bind="{ iconStart }"`.

I booleani sono attributi riflessi: `<bolle-checkbox checked />` equivale a
`:checked="true"`, mentre `:checked="false"` rimuove l'attributo.

### Eventi

Tutti gli eventi personalizzati sono `bubbles: true` e `composed: true`. In Vue
si ascoltano con `@nome-evento` e il payload è in `event.detail`. I nomi sono
sempre kebab-case:

```
@change  @value-input  @selection-change  @navigate  @expand
@action  @remove  @search  @suggest  @closed  @before-close
@menu-select  @menu-open  @menu-close  @queued
```

L'evento `before-close` è annullabile: `@before-close.prevent` impedisce la
chiusura del dialog. Gli eventi nativi come `click` e `submit` funzionano
normalmente.

```ts
// src/bolle.ts
export function detail<T>(event: Event): T {
  return (event as CustomEvent<T>).detail;
}
```

### Valore controllato

I componenti di form non emettono un evento `input` nativo: emettono
`value-input` a ogni tasto e `change` alla conferma. Il pattern è sempre lo
stesso: passi `:value` (o `:checked`, `:selected`) e riallinei lo stato
nell'handler.

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

Per checkbox, switch, radio, chip filtro, segmented buttons, list e tabs il
valore restituito è un booleano (`checked`, `selected`) o un id (`value`), non
una stringa di input.

### Ref e metodi

Dialog, sheet, snackbar, tooltip, menu, fab-menu e carousel espongono metodi
imperativi. Si chiamano su un template ref tipizzato con la classe del
componente.

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

I componenti di form sono form-associated: `bolle-button` con
`type="submit"`, checkbox, switch, radio, text field, search, slider,
segmented buttons, date picker, time picker e chip filtro entrano nel
`FormData` con `name` e `value`. Non servono input nascosti e i nomi non
vengono duplicati.

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

`form.reset()` riporta i controlli al valore iniziale, compresi intervalli di
date, slider range e selezioni multiple.

### Lingua, direzione e tema

I picker usano `locale` (default `document.documentElement.lang`) e accettano
override con `:labels`. I componenti leggono la direzione dall'antenato tramite
`:dir()`: basta impostare `dir="rtl"` su `<html>` o su un contenitore. Il tema
si cambia con `data-theme="dark"` su `<html>`.

```vue
<bolle-date-picker
  label="Data"
  locale="it"
  :labels="{ open: 'Apri calendario', confirm: 'Conferma' }"
/>
```

### Scorciatoie da tastiera

Ogni elemento `bolle-*` tranne `bolle-menu` accetta `shortcut`, scritto con la
sintassi di `aria-keyshortcuts` (`Alt+S`, `Control+Shift+F`, alternative separate
da uno spazio). Il componente scrive `aria-keyshortcuts` sul controllo interno che
riceve il focus: bottoni, link, checkbox e radio ricevono focus e clic, i campi
solo il focus. I componenti disabilitati o nascosti ignorano la scorciatoia.

```vue
<template>
  <bolle-button shortcut="Alt+S" @click="save">Salva</bolle-button>
  <bolle-text-field label="Cerca" shortcut="Control+K Meta+K"></bolle-text-field>
</template>
```

Con `:shortcut="value"` diventa dinamica; una stringa vuota rimuove la
scorciatoia e l'attributo ARIA.

### Icone e slot

Gli slot accettano nodi Vue: `<svg slot="icon">`, `<span slot="leading">`,
`<img slot="media">`. Il campo `icon` dentro gli array di item, invece, viene
reso come testo: usa un nome di legatura Material Symbols con il font icone
caricato dal progetto, oppure un carattere. Non passare markup HTML come
stringa, perché verrebbe mostrato letteralmente.

La libreria non include un font icone. La demo usa SVG inline negli slot e nomi
di legatura negli item.

## Azioni

### bolle-button

Attributi: `variant` (filled, tonal, filled-tonal, outlined, elevated, text,
standard), `size` (xs, small, medium, large, xl), `shape` (round, square),
`width` (default, narrow, wide; ha effetto su icon-only), `disabled`, `toggle`,
`selected`, `label`, `href`, `target`, `type` (button, submit, reset), `name`,
`value`, `expanded`, `controls`, `haspopup`. Slot: default, `icon`. Eventi:
`change` con `{ selected }` quando `toggle` è attivo.

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

Eredita tutto da `bolle-button`, aggiunge `icon-only`. L'etichetta accessibile
è obbligatoria: usa sempre `label`. `width` (narrow, wide) cambia l'area della
sola icona.

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

Attributi: `size` (fab è la taglia base, poi small, medium, large), `color`
(primary-container, secondary-container, tertiary-container, primary, secondary,
tertiary, surface), `label`, `disabled`, `href`. Slot: default, `icon`. Il FAB
mostra solo l'icona: `label` è l'etichetta accessibile.

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

Estende il FAB con testo visibile. Attributi: come il FAB più `size` small,
medium, large (default small). Il testo visibile è lo slot di default; `label`
imposta l'etichetta accessibile.

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

Attributi: `label`, `variant` (standard, connected), `selection` (none, single,
multiple), `required`, `size`, `shape`. Figli: `bolle-button` o
`bolle-icon-button` con `value`. Evento: `selection-change` con `{ values }`.
Con `selection` diverso da `none` i figli diventano toggle e la tastiera si
sposta con le frecce.

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

## Comunicazione

### bolle-badge

Attributi: `value`, `label`, `small`, `max`. Senza `label` il badge è
`aria-hidden`; con `label` diventa `role="status"` e annuncia il valore. Con
`small` non mostra testo, solo il punto. `max` produce `999+`.

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

Attributi: `label`, `value`, `max`, `indeterminate`, `variant` (linear,
circular), `wavy`. `wavy` vale per la variante lineare e si combina con
determinato e indeterminato.

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

Attributi: `label`, `variant` (default, contained). Sempre indeterminato, con
`role="progressbar"`.

```vue
<template>
  <bolle-loading-indicator label="Caricamento" />
  <bolle-loading-indicator variant="contained" label="Caricamento allegati" />
</template>
```

### bolle-snackbar

Attributi: `open`, `message`, `action-label`, `close-label`, `duration` (ms,
minimo effettivo 4000; 0 disabilita la chiusura automatica). Metodi:
`show(message?)`, `close(reason?)`. Eventi: `action`, `closed` con
`{ reason }`, `queued` con `{ pending }`. Chiamate consecutive di `show`
accodano i messaggi.

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

Attributi: `label`, `variant` (plain, rich), `supporting-text`, `persistent`.
Slot: default (trigger), `content`, `actions`. Metodi: `show()`, `hide()`. Il
tooltip semplice chiude al rilascio di fuoco/hover; `persistent` lo mantiene
aperto fino a Escape. La variante ricca chiude al click esterno e non va usata
per contenuti interattivi indispensabili.

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

Attributi: `label`, `variant` (hero, multi-browse, uncontained,
uncontained-multi-aspect-ratio, center-aligned-hero, full-screen),
`previous-label`, `next-label`, `index`. Figli: le slide. Metodo:
`goTo(index)`. Evento: `change` con `{ index }`. La variante `full-screen`
scorre in verticale.

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

## Contenimento

### bolle-card

Attributi: `variant` (filled, elevated, outlined), `orientation` (vertical,
horizontal), `href`, `label`. Slot: `media`, default. Con `href` il contenuto di
default viene avvolto in un link, quindi non inserire altri link o pulsanti
interattivi dentro la scheda.

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

Attributi: `open`, `label`, `variant` (basic, full-screen), `modal`,
`close-label`. Slot: default, `actions`. Metodi: `show(opener?)`,
`close(returnValue?)`. Eventi: `closed` con `{ returnValue }`, `before-close`
con `{ reason }` annullabile.

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

Eredita dialog. Attributi aggiuntivi: `drag-handle`, `variant` (modal,
standard). La variante standard non usa il dialog nativo: rende una sezione
inline visibile quando `open` è vero.

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

Eredita dialog. Attributi aggiuntivi: `detached`, `variant` (modal, standard).
Il lato è impostato dal componente: `side`. `detached` aggiunge il margine
della variante staccata.

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

Attributi: `vertical`, `inset`, `variant` (full, inset, inset-start,
inset-end), `decorative`. Senza `decorative` espone `role="separator"`; con
`decorative` è nascosto alle tecnologie assistive.

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

## Navigazione

### bolle-app-bar

Attributi: `label`, `variant` (small, center-aligned, medium,
medium-flexible, large, large-flexible, search), `subtitle`, `alignment`
(leading, center), `sticky`, `scrolled`, `collapsed`. Slot: `leading`,
`trailing`, default. Nella variante `search` lo slot default ospita una
`bolle-search`; nelle altre ospita il titolo al posto di `label`.

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

Attributi: `label`, `variant` (docked, floating), `orientation` (horizontal,
vertical), `color` (standard, vibrant). I controlli figli ricevono un
`tabindex` mobile e si spostano con le frecce in base all'orientamento.

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

Attributi: `label`, `items` (array di `BolleItem` con `id`, `label`, `icon`,
`href`, `disabled`), `value`, `variant` (standard, flexible), `layout`
(vertical, horizontal). Evento: `navigate` con `{ id }`. Usa da tre a cinque
destinazioni.

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

Eredita navigation bar e aggiunge `expanded`. Il rail è sempre compresso per
default; `expanded` mostra le etichette accanto alle icone. `variant` e
`layout` restano disponibili.

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

Eredita side sheet. Attributi: `items`, `value`, `label`, `variant` (modal,
standard), `detached`, `close-label`; slot default per contenuto aggiuntivo.
Evento: `navigate` con `{ id }`. Metodi: `show(opener?)`, `close()`. Nella
variante standard resta inline e si controlla con `open`.

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

Attributi: `items` (`id`, `label`, `icon`, `badge`, `disabled`), `value`,
`label`, `variant` (primary, secondary), `activation` (automatic, manual),
`scrollable`. Slot: uno per ogni `id` di item. Evento: `change` con `{ value }`.
Con `manual` la selezione avviene con Invio o click, non con le sole frecce.

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

## Selezione

### bolle-checkbox

Attributi: `checked`, `indeterminate`, `label`, `value`, `name`, `required`,
`disabled`, `supporting-text`, `error`. Slot: default (etichetta). Evento:
`change` con `{ checked, value }`. Form-associated.

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

Eredita checkbox e aggiunge `icon` e `iconSelected`, disponibili solo come
proprietà (`:icon`, `:iconSelected`). Il ruolo è `switch`. Stessi attributi,
eventi e comportamento di form della checkbox.

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

Attributi: `name`, `value`, `checked`, `label`, `required`, `disabled`. La
selezione è di gruppo tramite `name`; le frecce spostano il focus e
selezionano, Home/End vanno al primo e all'ultimo. Evento: `change` con
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

Attributi: `variant` (assist, filter, input, suggestion), `label`, `selected`,
`elevated`, `disabled`, `removable`, `remove-label`, `href`, `name`, `value`,
`required`. Slot: `avatar`, `icon`, default. Eventi: `action`, `change` con
`{ selected }` per filter, `remove`. Solo la variante filter entra nel form.

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

Attributi: `items` (con `id`, `label`, `icon`, `supportingText`, `badge`,
`href`, `selected`, `disabled`, `items`, `expanded`), `label`, `variant`
(standard, segmented), `interactive`, `selection` (none, single, multiple),
`value` (stringa o array), `expanded` (array di id). Slot: default per righe
aggiuntive. Eventi: `action` con `{ id }`, `change` con
`{ value, id, selected }`, `expand` con `{ id, expanded }`.

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

Attributi: `items` (con `id`, `label`, `icon`, `disabled`), `multiple`,
`values` (array, solo multipla), `value` (singola), `label`, `name`,
`required`, `disabled`. Evento: `change` con `{ value, values }`. Usa da due a
cinque segmenti.

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

Attributi: `value`, `min`, `max`, `step`, `variant` (continuous, centered,
range), `size` (xs, small, medium, large, xl), `upper-value`, `upper-label`,
`orientation` (horizontal, vertical), `show-value`, `stops`, `iconStart`,
`iconEnd`, `label`, `name`, `required`, `disabled`. Eventi: `value-input` con
`{ value, upperValue }`, `change` con lo stesso payload. I due campi icona sono
solo proprietà e si legano come `:iconStart` e `:iconEnd`.

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

## Testo e input

### bolle-text-field

Attributi: `variant` (filled, outlined), `type` (text, email, password, number,
date, time, url, tel, search), `label`, `value`, `placeholder`,
`supporting-text`, `error`, `multiline`, `rows`, `readonly`, `min`, `max`,
`step`, `pattern`, `autocomplete`, `maxlength`, `counter`, `prefix`, `suffix`,
`name`, `required`, `disabled`. Slot: `leading`, `trailing`. Eventi:
`value-input` con `{ value }` a ogni tasto, `change` con `{ value }` alla
conferma. `pattern` e `autocomplete` valgono per il campo a riga singola;
`rows` solo per `multiline`.

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

Eredita text field. Attributi aggiuntivi: `appearance` (contained, divided),
`layout` (docked, full-screen), `suggestions` (array), `suggestions-label`,
`filter`, `suggestion-delay` (ms). Slot: `leading`, `trailing`, `results` (solo
layout docked). Eventi: `value-input`, `change`, `search` con `{ value }` alla
conferma, `suggest` con `{ value }` a ogni input (ritardato se
`suggestion-delay` è maggiore di zero).

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

Attributi: `variant` (modal, docked), `selection-mode` (single, range),
`value` (formato `AAAA-MM-GG`), `end-value`, `locale`, `labels`, `min`, `max`,
`week-starts-on` (0 domenica, 1 lunedì), `label`, `name`, `required`,
`disabled`, `supporting-text`, `error`. Evento: `change` con
`{ value, endValue }`. La variante `docked` rende il calendario sempre visibile
e non apre il dialog.

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

In un form, il picker range invia due valori con lo stesso `name`:

```ts
new FormData(form).getAll("period"); // ["2026-11-01", "2026-11-20"]
```

### bolle-time-picker

Attributi: `variant` (dial, input), `hour-cycle` (12, 24), `value` (`HH:mm`),
`locale`, `labels`, `label`, `name`, `required`, `disabled`. Evento: `change`
con `{ value }`. Con `hour-cycle="12"` compare il selettore AM/PM.

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

Attributi: `items` (`MenuEntry[]`), `menu-label` (obbligatorio), `variant`
(vertical, baseline), `color-scheme` (standard, vibrant; solo vertical),
`selection-mode` (none, single, multi), `quick`, `density` (numero, valori
negativi più compatti), `inactive`. Metodi: `show(anchor, { last?, x?, y? })`,
`close(restoreFocus?)`. Getter: `open`, `selectedIds`. Eventi: `menu-open`,
`menu-close`, `menu-select` con `{ item, selectedIds }`.

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

Regole di validazione applicate da `show`: `menu-label` non può essere vuoto,
la variante baseline non ammette `color-scheme="vibrant"`, gli id devono essere
unici, i gruppi non possono annidarsi oltre quattro livelli, e una voce con
`href` non può avere `children` né essere usata in un menu con selezione.

### bolle-fab-menu

Attributi: `label`, `items` (da due a sei azioni), `open`. Slot: `icon`.
Evento: `action` con `{ id }`. Il `label` è il nome accessibile del pulsante e
del menu. `open` è stato interno riflesso: non esiste un evento di cambio, quindi
non va usato come binding controllato.

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

Attributi: `label`, `menu-label`, `items` (`MenuEntry[]`), `disabled`,
`variant` (filled, tonal, outlined, elevated), `size` (xs, small, medium,
large, xl). Eventi: `action` per il pulsante principale, `menu-select` con
`{ item, selectedIds }` propagato dal menu interno; anche `menu-open` e
`menu-close` risalgono. `menu-label` è obbligatorio per aprire il menu.

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

## Copertura

| Gruppo        | Componenti                                                                 |
| ------------- | -------------------------------------------------------------------------- |
| Azioni        | button, icon-button, floating-action-button, extended-fab, button-group    |
| Comunicazione | badge, progress-indicator, loading-indicator, snackbar, tooltip, carousel  |
| Contenimento  | card, dialog, bottom-sheet, side-sheet, divider                            |
| Navigazione   | app-bar, toolbar, navigation-bar, navigation-rail, navigation-drawer, tabs |
| Selezione     | checkbox, switch, radio-button, chip, list, segmented-buttons, slider      |
| Testo e input | text-field, search, date-picker, time-picker                               |
| Menu          | menu, fab-menu, split-button                                               |


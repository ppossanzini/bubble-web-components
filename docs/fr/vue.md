[Italiano](../it/vue.md) · [English](../en/vue.md) · [Français](./vue.md)

# Vue 3 · exemples d’utilisation exhaustifs

Ce guide couvre les 36 composants de la bibliothèque. Chaque section énumère les
attributs publics, les slots, les événements et les méthodes, puis montre un
exemple Vue 3 qui les utilise tous. Les exemples supposent `<script setup lang="ts">`
et Vue 3.4 ou une version ultérieure. Pour React, voir [react.md](./react.md).

Les composants sont des Custom Elements : Vue les traite comme des éléments
natifs, et non comme des composants Vue. Cela entraîne trois conséquences,
expliquées dans les règles d’intégration : les attributs restent des attributs
HTML, les événements sont des événements DOM avec `detail`, et les méthodes
s’appellent via un template ref.

## Installation et enregistrement

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

Le build de la bibliothèque enregistre déjà toutes les balises : aucun plugin Vue
ni `app.use()` n’est nécessaire. Le thème clair est celui par défaut ; le sombre
s’active avec `document.documentElement.dataset.theme = "dark"`, comme dans la
démo.

### Compilateur Vue

Vue doit savoir que les balises `bolle-*` ne sont pas des composants à résoudre.

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

Si le build de Vue s’effectue à l’exécution, appliquez la même règle sur
l’application :

```ts
app.config.compilerOptions.isCustomElement = (tag) =>
  tag.startsWith("bolle-");
```

`vue-tsc` ne déduit pas les types des attributs des Custom Elements. Pour une
vérification statique complète, il faut des composants wrapper typés, comme
celui-ci :

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

Le wrapper n’est utile que si vous avez besoin du type checking : dans les
exemples suivants, les balises de la bibliothèque sont utilisées directement.

## Règles d’intégration

### Propriétés et attributs

Vue définit une propriété DOM lorsque la clé existe sur l’élément, sinon il écrit
un attribut. Les propriétés qui acceptent des tableaux ou des objets doivent donc
être liées avec `:` et le nom de la propriété, et non comme une chaîne :

| Composant             | Propriétés à lier                                |
| --------------------- | ------------------------------------------------ |
| `bolle-segmented-buttons` | `:items`, `:values`                         |
| `bolle-search`       | `:suggestions`                                   |
| `bolle-date-picker`  | `:labels`                                        |
| `bolle-list`         | `:items`, `:value` (aussi tableau), `:expanded`  |
| `bolle-navigation-*`, `bolle-tabs`, `bolle-fab-menu`, `bolle-split-button`, `bolle-menu` | `:items` |
| `bolle-slider`       | `:iconStart`, `:iconEnd` (acceptent SVG ou texte) |
| `bolle-switch`       | `:icon`, `:iconSelected`                         |

Tous les autres attributs (`variant`, `size`, `label`, `disabled`, `required`,
`supporting-text`…) fonctionnent à la fois comme attributs statiques et avec
`:binding`. Pour les attributs composés, utilisez la forme kebab-case :
`:supporting-text`, `:upper-value`, `:remove-label`, `:menu-label`,
`:close-label`.

Les propriétés déclarées sans attribut (`icon`, `iconSelected`, `iconStart`,
`iconEnd`, `items`, `values`, `suggestions`, `labels`, `expanded` et `value`
de la list) n’existent que comme propriétés : elles se lient avec le nom exact de
la propriété (`:iconStart`, `:items`). Avec un template in-DOM, le navigateur met
les noms d’attributs en minuscules ; dans ce cas, utilisez
`v-bind="{ iconStart }"`.

Les booléens sont des attributs reflétés : `<bolle-checkbox checked />` équivaut
à `:checked="true"`, tandis que `:checked="false"` supprime l’attribut.

### Événements

Tous les événements personnalisés sont `bubbles: true` et `composed: true`. En
Vue, on les écoute avec `@nom-evenement` et le payload se trouve dans
`event.detail`. Les noms sont toujours en kebab-case :

```
@change  @value-input  @selection-change  @navigate  @expand
@action  @remove  @search  @suggest  @closed  @before-close
@menu-select  @menu-open  @menu-close  @queued
```

L’événement `before-close` est annulable : `@before-close.prevent` empêche la
fermeture du dialog. Les événements natifs comme `click` et `submit` fonctionnent
normalement.

```ts
// src/bolle.ts
export function detail<T>(event: Event): T {
  return (event as CustomEvent<T>).detail;
}
```

### Valeur contrôlée

Les composants de formulaire n’émettent pas d’événement `input` natif : ils
émettent `value-input` à chaque frappe et `change` à la validation. Le schéma est
toujours le même : vous passez `:value` (ou `:checked`, `:selected`) et réalignez
l’état dans le handler.

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

Pour checkbox, switch, radio, chip filtre, segmented buttons, list et tabs, la
valeur renvoyée est un booléen (`checked`, `selected`) ou un id (`value`), et non
une chaîne de saisie.

### Ref et méthodes

Dialog, sheet, snackbar, tooltip, menu, fab-menu et carousel exposent des
méthodes impératives. On les appelle sur un template ref typé avec la classe du
composant.

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

### Formulaire

Les composants de formulaire sont form-associated : `bolle-button` avec
`type="submit"`, checkbox, switch, radio, text field, search, slider,
segmented buttons, date picker, time picker et chip filtre entrent dans le
`FormData` avec `name` et `value`. Aucun input masqué n’est nécessaire et les
noms ne sont pas dupliqués.

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

`form.reset()` ramène les contrôles à leur valeur initiale, y compris les
intervalles de dates, les slider range et les sélections multiples.

### Langue, direction et thème

Les pickers utilisent `locale` (par défaut `document.documentElement.lang`) et
acceptent des overrides avec `:labels`. Les composants lisent la direction depuis
l’ancêtre via `:dir()` : il suffit de définir `dir="rtl"` sur `<html>` ou sur un
conteneur. Le thème se change avec `data-theme="dark"` sur `<html>`.

```vue
<bolle-date-picker
  label="Data"
  locale="it"
  :labels="{ open: 'Apri calendario', confirm: 'Conferma' }"
/>
```

### Raccourcis clavier

Chaque élément `bolle-*` sauf `bolle-menu` accepte `shortcut`, écrit avec la
syntaxe de `aria-keyshortcuts` (`Alt+S`, `Control+Shift+F`, alternatives séparées
par une espace). Le composant écrit `aria-keyshortcuts` sur le contrôle interne
qui reçoit le focus : boutons, liens, cases à cocher et radios reçoivent le focus
et un clic, les champs seulement le focus. Les composants désactivés ou masqués
ignorent le raccourci.

```vue
<template>
  <bolle-button shortcut="Alt+S" @click="save">Enregistrer</bolle-button>
  <bolle-text-field label="Rechercher" shortcut="Control+K Meta+K"></bolle-text-field>
</template>
```

Avec `:shortcut="value"` il devient dynamique ; une chaîne vide supprime le
raccourci et l’attribut ARIA.

### Icônes et slots

Les slots acceptent des nœuds Vue : `<svg slot="icon">`, `<span slot="leading">`,
`<img slot="media">`. En revanche, le champ `icon` à l’intérieur des tableaux
d’items est rendu comme du texte : utilisez un nom de ligature Material Symbols
avec la police d’icônes chargée par le projet, ou un caractère. Ne passez pas de
markup HTML sous forme de chaîne, car il s’afficherait littéralement.

La bibliothèque n’inclut pas de police d’icônes. La démo utilise des SVG inline
dans les slots et des noms de ligature dans les items.

## Actions

### bolle-button

Attributs : `variant` (filled, tonal, filled-tonal, outlined, elevated, text,
standard), `size` (xs, small, medium, large, xl), `shape` (round, square),
`width` (default, narrow, wide ; a un effet sur icon-only), `disabled`, `toggle`,
`selected`, `label`, `href`, `target`, `type` (button, submit, reset), `name`,
`value`, `expanded`, `controls`, `haspopup`. Slots : default, `icon`. Événements :
`change` avec `{ selected }` lorsque `toggle` est actif.

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

Il hérite de tout `bolle-button` et ajoute `icon-only`. Le libellé accessible est
obligatoire : utilisez toujours `label`. `width` (narrow, wide) modifie la zone
de la seule icône.

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

Attributs : `size` (fab est la taille de base, puis small, medium, large), `color`
(primary-container, secondary-container, tertiary-container, primary, secondary,
tertiary, surface), `label`, `disabled`, `href`. Slots : default, `icon`. Le FAB
n’affiche que l’icône : `label` est le libellé accessible.

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

Il étend le FAB avec un texte visible. Attributs : comme le FAB, plus `size`
small, medium, large (par défaut small). Le texte visible est le slot par défaut ;
`label` définit le libellé accessible.

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

Attributs : `label`, `variant` (standard, connected), `selection` (none, single,
multiple), `required`, `size`, `shape`. Enfants : `bolle-button` ou
`bolle-icon-button` avec `value`. Événement : `selection-change` avec
`{ values }`. Avec `selection` différent de `none`, les enfants deviennent des
toggle et le clavier se déplace avec les flèches.

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

Attributs : `value`, `label`, `small`, `max`. Sans `label`, le badge est
`aria-hidden` ; avec `label`, il devient `role="status"` et annonce la valeur.
Avec `small`, il n’affiche pas de texte, seulement le point. `max` produit `999+`.

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

Attributs : `label`, `value`, `max`, `indeterminate`, `variant` (linear,
circular), `wavy`. `wavy` s’applique à la variante linéaire et se combine avec le
mode déterminé et indéterminé.

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

Attributs : `label`, `variant` (default, contained). Toujours indéterminé, avec
`role="progressbar"`.

```vue
<template>
  <bolle-loading-indicator label="Caricamento" />
  <bolle-loading-indicator variant="contained" label="Caricamento allegati" />
</template>
```

### bolle-snackbar

Attributs : `open`, `message`, `action-label`, `close-label`, `duration` (ms,
minimum effectif 4000 ; 0 désactive la fermeture automatique). Méthodes :
`show(message?)`, `close(reason?)`. Événements : `action`, `closed` avec
`{ reason }`, `queued` avec `{ pending }`. Des appels consécutifs à `show`
mettent les messages en file d’attente.

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

Attributs : `label`, `variant` (plain, rich), `supporting-text`, `persistent`.
Slots : default (trigger), `content`, `actions`. Méthodes : `show()`, `hide()`. Le
tooltip simple se ferme au relâchement du focus/hover ; `persistent` le maintient
ouvert jusqu’à Escape. La variante riche se ferme au clic extérieur et ne doit pas
être utilisée pour des contenus interactifs indispensables.

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

Attributs : `label`, `variant` (hero, multi-browse, uncontained,
uncontained-multi-aspect-ratio, center-aligned-hero, full-screen),
`previous-label`, `next-label`, `index`. Enfants : les slides. Méthode :
`goTo(index)`. Événement : `change` avec `{ index }`. La variante `full-screen`
défile verticalement.

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

## Confinement

### bolle-card

Attributs : `variant` (filled, elevated, outlined), `orientation` (vertical,
horizontal), `href`, `label`. Slots : `media`, default. Avec `href`, le contenu
par défaut est enveloppé dans un lien ; n’insérez donc pas d’autres liens ni de
boutons interactifs dans la carte.

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

Attributs : `open`, `label`, `variant` (basic, full-screen), `modal`,
`close-label`. Slots : default, `actions`. Méthodes : `show(opener?)`,
`close(returnValue?)`. Événements : `closed` avec `{ returnValue }`,
`before-close` avec `{ reason }` annulable.

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

Il hérite de dialog. Attributs supplémentaires : `drag-handle`, `variant` (modal,
standard). La variante standard n’utilise pas le dialog natif : elle rend une
section inline visible lorsque `open` est vrai.

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

Il hérite de dialog. Attributs supplémentaires : `detached`, `variant` (modal,
standard). Le côté est défini par le composant : `side`. `detached` ajoute la
marge de la variante détachée.

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

Attributs : `vertical`, `inset`, `variant` (full, inset, inset-start, inset-end),
`decorative`. Sans `decorative`, il expose `role="separator"` ; avec
`decorative`, il est masqué aux technologies d’assistance.

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

Attributs : `label`, `variant` (small, center-aligned, medium,
medium-flexible, large, large-flexible, search), `subtitle`, `alignment`
(leading, center), `sticky`, `scrolled`, `collapsed`. Slots : `leading`,
`trailing`, default. Dans la variante `search`, le slot par défaut accueille une
`bolle-search` ; dans les autres, il accueille le titre à la place de `label`.

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

Attributs : `label`, `variant` (docked, floating), `orientation` (horizontal,
vertical), `color` (standard, vibrant). Les contrôles enfants reçoivent un
`tabindex` mobile et se déplacent avec les flèches selon l’orientation.

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

Attributs : `label`, `items` (tableau d’`BolleItem` avec `id`, `label`, `icon`,
`href`, `disabled`), `value`, `variant` (standard, flexible), `layout`
(vertical, horizontal). Événement : `navigate` avec `{ id }`. Utilisez de trois à
cinq destinations.

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

Il hérite de navigation bar et ajoute `expanded`. Le rail est toujours compressé
par défaut ; `expanded` affiche les libellés à côté des icônes. `variant` et
`layout` restent disponibles.

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

Il hérite de side sheet. Attributs : `items`, `value`, `label`, `variant` (modal,
standard), `detached`, `close-label` ; slot par défaut pour du contenu
supplémentaire. Événement : `navigate` avec `{ id }`. Méthodes : `show(opener?)`,
`close()`. Dans la variante standard, il reste inline et se contrôle avec `open`.

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

Attributs : `items` (`id`, `label`, `icon`, `badge`, `disabled`), `value`,
`label`, `variant` (primary, secondary), `activation` (automatic, manual),
`scrollable`. Slots : un par `id` d’item. Événement : `change` avec `{ value }`.
Avec `manual`, la sélection s’effectue avec Entrée ou un clic, et non avec les
seules flèches.

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

## Sélection

### bolle-checkbox

Attributs : `checked`, `indeterminate`, `label`, `value`, `name`, `required`,
`disabled`, `supporting-text`, `error`. Slots : default (libellé). Événement :
`change` avec `{ checked, value }`. Form-associated.

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

Il hérite de checkbox et ajoute `icon` et `iconSelected`, disponibles uniquement
comme propriétés (`:icon`, `:iconSelected`). Le rôle est `switch`. Mêmes
attributs, événements et comportement de formulaire que la checkbox.

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

Attributs : `name`, `value`, `checked`, `label`, `required`, `disabled`. La
sélection est groupée via `name` ; les flèches déplacent le focus et sélectionnent,
Home/End vont au premier et au dernier. Événement : `change` avec
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

Attributs : `variant` (assist, filter, input, suggestion), `label`, `selected`,
`elevated`, `disabled`, `removable`, `remove-label`, `href`, `name`, `value`,
`required`. Slots : `avatar`, `icon`, default. Événements : `action`, `change`
avec `{ selected }` pour filter, `remove`. Seule la variante filter entre dans le
formulaire.

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

Attributs : `items` (avec `id`, `label`, `icon`, `supportingText`, `badge`,
`href`, `selected`, `disabled`, `items`, `expanded`), `label`, `variant`
(standard, segmented), `interactive`, `selection` (none, single, multiple),
`value` (chaîne ou tableau), `expanded` (tableau d’id). Slots : default pour des
lignes supplémentaires. Événements : `action` avec `{ id }`, `change` avec
`{ value, id, selected }`, `expand` avec `{ id, expanded }`.

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

Attributs : `items` (avec `id`, `label`, `icon`, `disabled`), `multiple`,
`values` (tableau, uniquement en mode multiple), `value` (unique), `label`,
`name`, `required`, `disabled`. Événement : `change` avec `{ value, values }`.
Utilisez de deux à cinq segments.

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

Attributs : `value`, `min`, `max`, `step`, `variant` (continuous, centered,
range), `size` (xs, small, medium, large, xl), `upper-value`, `upper-label`,
`orientation` (horizontal, vertical), `show-value`, `stops`, `iconStart`,
`iconEnd`, `label`, `name`, `required`, `disabled`. Événements : `value-input`
avec `{ value, upperValue }`, `change` avec le même payload. Les deux champs
d’icône sont uniquement des propriétés et se lient comme `:iconStart` et
`:iconEnd`.

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

## Texte et saisie

### bolle-text-field

Attributs : `variant` (filled, outlined), `type` (text, email, password, number,
date, time, url, tel, search), `label`, `value`, `placeholder`,
`supporting-text`, `error`, `multiline`, `rows`, `readonly`, `min`, `max`,
`step`, `pattern`, `autocomplete`, `maxlength`, `counter`, `prefix`, `suffix`,
`name`, `required`, `disabled`. Slots : `leading`, `trailing`. Événements :
`value-input` avec `{ value }` à chaque frappe, `change` avec `{ value }` à la
validation. `pattern` et `autocomplete` s’appliquent au champ sur une seule ligne ;
`rows` uniquement à `multiline`.

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

Il hérite de text field. Attributs supplémentaires : `appearance` (contained,
divided), `layout` (docked, full-screen), `suggestions` (tableau),
`suggestions-label`, `filter`, `suggestion-delay` (ms). Slots : `leading`,
`trailing`, `results` (uniquement avec le layout docked). Événements :
`value-input`, `change`, `search` avec `{ value }` à la validation, `suggest`
avec `{ value }` à chaque saisie (différé si `suggestion-delay` est supérieur à
zéro).

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

Attributs : `variant` (modal, docked), `selection-mode` (single, range), `value`
(format `AAAA-MM-GG`), `end-value`, `locale`, `labels`, `min`, `max`,
`week-starts-on` (0 dimanche, 1 lundi), `label`, `name`, `required`, `disabled`,
`supporting-text`, `error`. Événement : `change` avec `{ value, endValue }`. La
variante `docked` rend le calendrier toujours visible et n’ouvre pas le dialog.

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

Dans un formulaire, le picker range envoie deux valeurs avec le même `name` :

```ts
new FormData(form).getAll("period"); // ["2026-11-01", "2026-11-20"]
```

### bolle-time-picker

Attributs : `variant` (dial, input), `hour-cycle` (12, 24), `value` (`HH:mm`),
`locale`, `labels`, `label`, `name`, `required`, `disabled`. Événement : `change`
avec `{ value }`. Avec `hour-cycle="12"`, le sélecteur AM/PM apparaît.

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

## Menus

### bolle-menu

Attributs : `items` (`MenuEntry[]`), `menu-label` (obligatoire), `variant`
(vertical, baseline), `color-scheme` (standard, vibrant ; uniquement vertical),
`selection-mode` (none, single, multi), `quick`, `density` (nombre, les valeurs
négatives sont plus compactes), `inactive`. Méthodes : `show(anchor, { last?, x?, y? })`,
`close(restoreFocus?)`. Getters : `open`, `selectedIds`. Événements :
`menu-open`, `menu-close`, `menu-select` avec `{ item, selectedIds }`.

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

Règles de validation appliquées par `show` : `menu-label` ne peut pas être vide,
la variante baseline n’admet pas `color-scheme="vibrant"`, les id doivent être
uniques, les groupes ne peuvent pas s’imbriquer sur plus de quatre niveaux, et une
entrée avec `href` ne peut avoir ni `children` ni être utilisée dans un menu avec
sélection.

### bolle-fab-menu

Attributs : `label`, `items` (de deux à six actions), `open`. Slots : `icon`.
Événement : `action` avec `{ id }`. Le `label` est le nom accessible du bouton et
du menu. `open` est un état interne reflété : il n’existe pas d’événement de
changement, il ne faut donc pas l’utiliser comme binding contrôlé.

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

Attributs : `label`, `menu-label`, `items` (`MenuEntry[]`), `disabled`, `variant`
(filled, tonal, outlined, elevated), `size` (xs, small, medium, large, xl).
Événements : `action` pour le bouton principal, `menu-select` avec
`{ item, selectedIds }` propagé depuis le menu interne ; `menu-open` et
`menu-close` remontent aussi. `menu-label` est obligatoire pour ouvrir le menu.

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

## Couverture

| Groupe        | Composants                                                                 |
| ------------- | -------------------------------------------------------------------------- |
| Actions       | button, icon-button, floating-action-button, extended-fab, button-group    |
| Communication | badge, progress-indicator, loading-indicator, snackbar, tooltip, carousel  |
| Confinement   | card, dialog, bottom-sheet, side-sheet, divider                            |
| Navigation    | app-bar, toolbar, navigation-bar, navigation-rail, navigation-drawer, tabs |
| Sélection     | checkbox, switch, radio-button, chip, list, segmented-buttons, slider      |
| Texte et saisie | text-field, search, date-picker, time-picker                             |
| Menus         | menu, fab-menu, split-button                                               |

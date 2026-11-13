[Italiano](../it/react.md) · [English](./react.md) · [Français](../fr/react.md)

# React · exhaustive usage examples

This guide covers all 36 components of the library with a React example for
each one. The reference for attributes, slots, events and methods is the same as
in the Vue guide: [vue.md](./vue.md). Here you'll find the React-specific rules
and the code.

The recommended baseline is React 19. With React 18 the examples work by
changing the way you pass non-string properties and boolean properties (see
below).

## Installation and registration

```sh
npm install @bubble/web-components
```

```tsx
// src/main.tsx
import "@bubble/web-components/tokens.css";
import "@bubble/web-components/typography.css";
import "@bubble/web-components"; // registra tutti i tag bubble-*
import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(<App />);
```

The registration import must happen before the first render: React 19 decides
whether to write a property or an attribute by looking at the already-updated
instance. The dark theme is activated with
`document.documentElement.dataset.theme = "dark"`.

## Integration rules

### Properties

React 19 writes a DOM property when it exists on the element instance, otherwise
it writes an attribute. So arrays, objects and booleans are passed directly:

```tsx
<bubble-list items={items} value={selected} expanded={expanded} />
<bubble-text-field value={email} maxlength={120} counter />
<bubble-button disabled={false} />
```

With React 18 non-string values would become attributes (`[object Object]`) and
`disabled={false}` would write `disabled="false"`, which is still truthy. In that
case assign the properties with the `useBubbleProps` hook shown below, or use
`disabled={undefined}` for false booleans.

### Events

React does not map custom events (`change`, `value-input`,
`menu-select`…) onto JSX props. They must be attached with `addEventListener` on
a ref. The native `click` and `submit` events keep using `onClick` and
`onSubmit`.

```tsx
// src/bubble.ts
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

export function useBubbleEvent<T extends HTMLElement, D = unknown>(
  ref: RefObject<T | null>,
  name: string,
  handler: (detail: D, event: Event) => void,
) {
  const saved = useRef(handler);
  saved.current = handler;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const listener = (event: Event) =>
      saved.current((event as CustomEvent<D>).detail, event);
    node.addEventListener(name, listener);
    return () => node.removeEventListener(name, listener);
  }, [ref, name]);
}

/** Solo per React 18: assegna come proprietà i valori non stringa. */
export function useBubbleProps<T extends HTMLElement>(
  ref: RefObject<T | null>,
  props: Record<string, unknown>,
) {
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    for (const [key, value] of Object.entries(props)) {
      if (key in node) (node as unknown as Record<string, unknown>)[key] = value;
    }
  });
}
```

The second argument of `handler` is the event: it is needed for `before-close`,
where `event.preventDefault()` cancels the closing.

### Refs and methods

Dialog, sheet, snackbar, tooltip, menu, fab-menu and carousel expose imperative
methods. The ref is typed with the component class.

```tsx
const snackbar = useRef<BubbleSnackbar | null>(null);

<bubble-snackbar ref={snackbar} message="Documento salvato" />
<bubble-button onClick={() => snackbar.current?.show("Documento salvato")}>Salva</bubble-button>
```

### Controlled state

The pattern is identical to Vue: React state passed as a property and realigned
in the listener.

```tsx
const [email, setEmail] = useState("");
const field = useRef<BubbleTextField | null>(null);
useBubbleEvent(field, "value-input", ({ value }: { value: string }) => setEmail(value));

<bubble-text-field ref={field} label="Email" value={email} />

const terms = useRef<BubbleCheckbox | null>(null);
useBubbleEvent(terms, "change", ({ checked }: { checked: boolean }) => setAccepted(checked));
<bubble-checkbox ref={terms} label="Accetto" checked={accepted} />
```

For checkbox, switch, radio and filter chip the event is `change` with `checked`
or `selected`; for text field, search, slider, segmented buttons, date and time
picker it is `value-input`/`change` with `value`. Even when the event is called
`change`, it is not React's native event: it must be attached with
`useBubbleEvent`.

### Forms

The components are form-associated: they enter the `FormData` with `name` and
`value`, without hidden inputs. `form.reset()` restores the initial values.

```tsx
function onSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  console.log(data.get("email"), data.get("newsletter"));
}
```

### Slots

Slots are light DOM: you pass a child with the `slot` attribute.

```tsx
<bubble-app-bar label="Posta">
  <bubble-icon-button slot="leading" label="Menu">☰</bubble-icon-button>
</bubble-app-bar>

<bubble-button>
  <svg slot="icon" viewBox="0 0 24 24" aria-hidden="true">…</svg>
  Nuovo
</bubble-button>
```

React 19 supports `slot` as an attribute; with React 18 it is still written as a
custom attribute.

### Icons

Slots accept JSX, hence inline SVG. The `icon` field inside item arrays is
instead rendered as text: use a Material Symbols ligature name with the project
icon font, or a character. Do not pass markup as a string.

### JSX types

Without declarations, TypeScript rejects unknown tags. A compact fallback:

```ts
// src/bubble-elements.d.ts
import type * as React from "react";

type BubbleElementProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> & { [prop: string]: unknown };

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      [tag: `bubble-${string}`]: BubbleElementProps;
    }
  }
}
```

For precise type checking add targeted declarations, which take precedence over
the fallback:

```ts
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "bubble-text-field": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        variant?: "filled" | "outlined";
        label?: string;
        value?: string;
        type?: string;
        supportingText?: string;
        error?: boolean;
        multiline?: boolean;
        rows?: number;
        maxlength?: number;
        counter?: boolean;
        prefix?: string;
        suffix?: string;
        name?: string;
        required?: boolean;
        disabled?: boolean;
      };
      "bubble-list": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        items?: import("@bubble/web-components").BubbleItem[];
        label?: string;
        variant?: "standard" | "segmented";
        interactive?: boolean;
        selection?: "none" | "single" | "multiple";
        value?: string | string[];
        expanded?: string[];
      };
    }
  }
}
```

From here on, the React imports (`import * as React from "react"` for the types,
plus `useRef`, `useState` and the helpers) are assumed to be present in every
example.

## Actions

### bubble-button

```tsx
export function ButtonExamples() {
  const [expanded, setExpanded] = useState(false);
  const [submitted, setSubmitted] = useState("");
  const toggle = useRef<BubbleButton | null>(null);
  useBubbleEvent(toggle, "change", ({ selected }: { selected: boolean }) =>
    setExpanded(selected),
  );

  const variants = ["filled", "tonal", "filled-tonal", "outlined", "elevated", "text", "standard"] as const;
  const sizes = ["xs", "small", "medium", "large", "xl"] as const;

  return (
    <div>
      {variants.map((variant) => (
        <bubble-button key={variant} variant={variant}>{variant}</bubble-button>
      ))}
      {sizes.map((size) => (
        <bubble-button key={size} size={size} variant="tonal">{size}</bubble-button>
      ))}

      <bubble-button variant="outlined" shape="square">Quadrato</bubble-button>

      <bubble-button variant="filled">
        <svg slot="icon" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M11 5h2v14h-2zM5 11h14v2H5z" />
        </svg>
        Nuovo
      </bubble-button>

      <bubble-button
        ref={toggle}
        toggle
        haspopup="menu"
        selected={expanded}
        expanded={expanded}
        controls="pannello"
      >
        {expanded ? "Chiudi" : "Apri"}
      </bubble-button>

      <bubble-button href="https://example.com" target="_blank" variant="text">
        Documentazione
      </bubble-button>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(String(new FormData(event.currentTarget).get("azione")));
        }}
      >
        <bubble-button type="submit" name="azione" value="salva">Salva</bubble-button>
        <bubble-button type="reset" variant="outlined">Reimposta</bubble-button>
      </form>

      <bubble-button label="Aggiungi" disabled>Disabilitato</bubble-button>
      <output>{submitted}</output>
    </div>
  );
}
```

### bubble-icon-button

```tsx
export function IconButtonExamples() {
  const [pinned, setPinned] = useState(false);
  const pin = useRef<BubbleIconButton | null>(null);
  useBubbleEvent(pin, "change", ({ selected }: { selected: boolean }) =>
    setPinned(selected),
  );

  return (
    <div>
      {(["xs", "small", "medium", "large", "xl"] as const).map((size) => (
        <bubble-icon-button key={size} size={size} label={`Azione ${size}`}>
          <svg slot="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
          </svg>
        </bubble-icon-button>
      ))}

      <bubble-icon-button width="narrow" label="Ristretto">★</bubble-icon-button>
      <bubble-icon-button width="wide" label="Largo">★</bubble-icon-button>
      <bubble-icon-button variant="tonal" shape="square" label="Quadrato">★</bubble-icon-button>

      <bubble-icon-button ref={pin} toggle selected={pinned} label="Fissa in alto">
        📌
      </bubble-icon-button>

      <bubble-icon-button haspopup="menu" expanded controls="menu-azioni" label="Altre azioni">
        ⋯
      </bubble-icon-button>
    </div>
  );
}
```

### bubble-floating-action-button

```tsx
const colors = [
  "primary-container",
  "secondary-container",
  "tertiary-container",
  "primary",
  "secondary",
  "tertiary",
  "surface",
] as const;

export function FabExamples() {
  return (
    <div>
      {colors.map((color) => (
        <bubble-floating-action-button key={color} color={color} label={`Crea (${color})`}>
          ＋
        </bubble-floating-action-button>
      ))}

      <bubble-floating-action-button size="small" label="Crea piccolo">＋</bubble-floating-action-button>
      <bubble-floating-action-button size="medium" color="tertiary" label="Crea medio">＋</bubble-floating-action-button>
      <bubble-floating-action-button size="large" color="secondary" label="Crea grande">＋</bubble-floating-action-button>
      <bubble-floating-action-button href="https://example.com" label="Apri collegamento">↗</bubble-floating-action-button>
      <bubble-floating-action-button label="Crea disabilitato" disabled>＋</bubble-floating-action-button>
    </div>
  );
}
```

### bubble-extended-fab

```tsx
export function ExtendedFabExamples() {
  return (
    <div>
      <bubble-extended-fab label="Nuovo documento" size="small" color="primary-container">
        Nuovo documento
      </bubble-extended-fab>
      <bubble-extended-fab label="Condividi" size="medium" color="tertiary">
        Condividi
      </bubble-extended-fab>
      <bubble-extended-fab label="Crea presentazione" size="large" color="secondary">
        <span slot="icon" aria-hidden="true">＋</span>
        Crea presentazione
      </bubble-extended-fab>
    </div>
  );
}
```

### bubble-button-group

```tsx
export function ButtonGroupExamples() {
  const [alignment, setAlignment] = useState("left");
  const [formats, setFormats] = useState<string[]>(["bold"]);
  const alignmentGroup = useRef<BubbleButtonGroup | null>(null);
  const formatGroup = useRef<BubbleButtonGroup | null>(null);

  useBubbleEvent(alignmentGroup, "selection-change", ({ values }: { values: string[] }) =>
    setAlignment(values[0] ?? "left"),
  );
  useBubbleEvent(formatGroup, "selection-change", ({ values }: { values: string[] }) =>
    setFormats(values),
  );

  return (
    <div>
      <bubble-button-group
        ref={alignmentGroup}
        label="Allineamento"
        variant="connected"
        selection="single"
        required
        size="small"
        shape="round"
      >
        {["left", "center", "right"].map((value) => (
          <bubble-button key={value} value={value} selected={alignment === value}>
            {value}
          </bubble-button>
        ))}
      </bubble-button-group>

      <bubble-button-group
        ref={formatGroup}
        label="Formato"
        variant="connected"
        selection="multiple"
        size="small"
      >
        {["bold", "italic", "underline"].map((value) => (
          <bubble-button key={value} value={value} selected={formats.includes(value)}>
            {value}
          </bubble-button>
        ))}
      </bubble-button-group>

      <bubble-button-group label="Gruppo semplice" variant="standard" selection="none" size="large">
        <bubble-button variant="outlined">A</bubble-button>
        <bubble-button variant="outlined">B</bubble-button>
      </bubble-button-group>
    </div>
  );
}
```

## Communication

### bubble-badge

```tsx
export function BadgeExamples() {
  return (
    <div>
      <span className="badge-anchor">
        <bubble-icon-button label="Notifiche">🔔</bubble-icon-button>
        <bubble-badge
          value="12"
          style={{ position: "absolute", insetBlockStart: -4, insetInlineEnd: -4 }}
        />
      </span>

      <bubble-badge value={1200} max={999} label="Messaggi non letti" />
      <bubble-badge value="Nuovo" label="Novità" />
      <bubble-badge value="" label="Aggiornamento disponibile" small />
      <bubble-badge value="7" />
    </div>
  );
}
```

### bubble-progress-indicator

```tsx
export function ProgressExamples() {
  return (
    <div>
      <bubble-progress-indicator label="Download" value={65} />
      <bubble-progress-indicator label="Connessione" indeterminate />
      <bubble-progress-indicator label="Avanzamento pratica" value={35} max={50} />
      <bubble-progress-indicator wavy label="Avanzamento ondulato" value={60} />
      <bubble-progress-indicator wavy indeterminate label="Attesa ondulata" />
      <bubble-progress-indicator variant="circular" label="Caricamento file" value={65} />
      <bubble-progress-indicator variant="circular" indeterminate label="Attesa circolare" />
    </div>
  );
}
```

### bubble-loading-indicator

```tsx
export function LoadingExamples() {
  return (
    <div>
      <bubble-loading-indicator label="Caricamento" />
      <bubble-loading-indicator variant="contained" label="Caricamento allegati" />
    </div>
  );
}
```

### bubble-snackbar

```tsx
export function SnackbarExamples() {
  const snackbar = useRef<BubbleSnackbar | null>(null);
  const [log, setLog] = useState("");

  useBubbleEvent(snackbar, "closed", ({ reason }: { reason: string }) =>
    setLog(`chiuso: ${reason}`),
  );
  useBubbleEvent(snackbar, "action", () => setLog("azione: annulla"));
  useBubbleEvent(snackbar, "queued", ({ pending }: { pending: number }) =>
    setLog(`in coda: ${pending}`),
  );

  return (
    <div>
      <bubble-snackbar
        ref={snackbar}
        message="Documento eliminato"
        actionLabel="Annulla"
        closeLabel="Chiudi"
        duration={6000}
      />

      <bubble-button variant="tonal" onClick={() => snackbar.current?.show("Documento salvato")}>
        Mostra
      </bubble-button>
      <bubble-button
        variant="outlined"
        onClick={() => {
          snackbar.current?.show("Primo");
          snackbar.current?.show("Secondo");
          snackbar.current?.show("Terzo");
        }}
      >
        Accoda tre messaggi
      </bubble-button>
      <bubble-button variant="text" onClick={() => snackbar.current?.close("manuale")}>
        Chiudi
      </bubble-button>
      <output>{log}</output>
    </div>
  );
}
```

### bubble-tooltip

```tsx
export function TooltipExamples() {
  const tip = useRef<BubbleTooltip | null>(null);

  return (
    <div>
      <bubble-tooltip label="Conserva una copia del documento">
        <bubble-button variant="tonal">Salva una copia</bubble-button>
      </bubble-tooltip>

      <bubble-tooltip
        ref={tip}
        variant="rich"
        persistent
        label="Spazio personale"
        supportingText="La copia resta nel tuo spazio e resta aperta finché non la chiudi."
      >
        <bubble-button variant="outlined">Dettagli</bubble-button>
        <p slot="content">Puoi riaprire la copia dalla sezione Documenti.</p>
        <bubble-button slot="actions" variant="text">Apri Documenti</bubble-button>
      </bubble-tooltip>

      <bubble-button variant="text" onClick={() => tip.current?.show()}>Mostra tooltip ricco</bubble-button>
      <bubble-button variant="text" onClick={() => tip.current?.hide()}>Nascondi</bubble-button>
    </div>
  );
}
```

### bubble-carousel

```tsx
export function CarouselExamples() {
  const [current, setCurrent] = useState(0);
  const carousel = useRef<BubbleCarousel | null>(null);
  useBubbleEvent(carousel, "change", ({ index }: { index: number }) =>
    setCurrent(index),
  );

  const variants = [
    "hero",
    "multi-browse",
    "uncontained",
    "uncontained-multi-aspect-ratio",
    "center-aligned-hero",
    "full-screen",
  ] as const;

  return (
    <div>
      <bubble-carousel
        ref={carousel}
        variant="hero"
        label="Documenti recenti"
        previousLabel="Precedente"
        nextLabel="Successivo"
        index={current}
      >
        <article><h3>Posta</h3><p>Messaggi ricevuti</p></article>
        <article><h3>Archivio</h3><p>Documenti salvati</p></article>
        <article><h3>Impostazioni</h3><p>Preferenze personali</p></article>
      </bubble-carousel>

      {variants.map((variant) => (
        <bubble-carousel
          key={variant}
          variant={variant}
          label={`Carousel ${variant}`}
          previousLabel="Precedente"
          nextLabel="Successivo"
        >
          <article>A · {variant}</article>
          <article>B · {variant}</article>
          <article>C · {variant}</article>
        </bubble-carousel>
      ))}

      <bubble-button variant="outlined" onClick={() => carousel.current?.goTo(0)}>
        Prima slide
      </bubble-button>
      <bubble-button variant="outlined" onClick={() => carousel.current?.goTo(2)}>
        Ultima slide
      </bubble-button>
      <output>{current + 1}</output>
    </div>
  );
}
```

## Containment

### bubble-card

```tsx
export function CardExamples() {
  return (
    <div>
      {(["filled", "elevated", "outlined"] as const).map((variant) => (
        <bubble-card key={variant} variant={variant} label={`Scheda ${variant}`}>
          <h3>Documento</h3>
          <p>Contenuto indipendente con un'azione interna.</p>
          <bubble-button variant="text">Apri</bubble-button>
        </bubble-card>
      ))}

      <bubble-card orientation="horizontal" href="https://example.com" label="Rapporto annuale">
        <img slot="media" src="/cover.jpg" alt="Copertina del rapporto" />
        <h3>Rapporto annuale</h3>
        <p>Riepilogo delle attività dell'anno.</p>
      </bubble-card>
    </div>
  );
}
```

### bubble-dialog

```tsx
export function DialogExamples() {
  const confirm = useRef<BubbleDialog | null>(null);
  const fullscreen = useRef<BubbleDialog | null>(null);
  const nonModal = useRef<BubbleDialog | null>(null);
  const proposal = useRef<BubbleDialog | null>(null);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [dirty] = useState(true);
  const [result, setResult] = useState("");

  useBubbleEvent(confirm, "before-close", (_detail, event) => {
    if (dirty) event.preventDefault();
  });
  useBubbleEvent(confirm, "closed", ({ returnValue }: { returnValue?: string }) =>
    setResult(returnValue ?? ""),
  );
  useBubbleEvent(proposal, "closed", ({ returnValue }: { returnValue?: string }) => {
    setProposalOpen(false);
    setResult(returnValue ?? "");
  });

  return (
    <div>
      <bubble-button variant="filled" onClick={() => confirm.current?.show()}>
        Elimina
      </bubble-button>
      <bubble-dialog
        ref={confirm}
        label="Eliminare il documento?"
        variant="basic"
        modal
        closeLabel="Annulla"
      >
        <p>L'operazione non può essere annullata.</p>
        <bubble-button slot="actions" variant="text" onClick={() => confirm.current?.close("elimina")}>
          Elimina
        </bubble-button>
      </bubble-dialog>

      <bubble-button variant="outlined" onClick={() => fullscreen.current?.show()}>
        Apri a schermo intero
      </bubble-button>
      <bubble-dialog ref={fullscreen} variant="full-screen" label="Editor" closeLabel="Chiudi">
        <p>Contenuto a schermo intero.</p>
        <bubble-button slot="actions" onClick={() => fullscreen.current?.close("salvato")}>
          Salva
        </bubble-button>
      </bubble-dialog>

      <bubble-button variant="text" onClick={() => nonModal.current?.show()}>
        Dialog non modale
      </bubble-button>
      <bubble-dialog ref={nonModal} modal={false} label="Nota" closeLabel="Chiudi">
        <p>Questo dialog non blocca il resto della pagina.</p>
      </bubble-dialog>

      <bubble-button variant="tonal" onClick={() => setProposalOpen(true)}>
        Dialog dichiarativo
      </bubble-button>
      <bubble-dialog
        ref={proposal}
        open={proposalOpen}
        label="Proposta"
        closeLabel="Chiudi"
      >
        <p>Controllato dalla proprietà open.</p>
      </bubble-dialog>
      <output>{result}</output>
    </div>
  );
}
```

### bubble-bottom-sheet

```tsx
export function BottomSheetExamples() {
  const sheet = useRef<BubbleBottomSheet | null>(null);
  const [inlineOpen, setInlineOpen] = useState(true);
  const [result, setResult] = useState("");
  useBubbleEvent(sheet, "closed", ({ returnValue }: { returnValue?: string }) =>
    setResult(returnValue ?? ""),
  );

  return (
    <div>
      <bubble-button variant="filled" onClick={() => sheet.current?.show()}>
        Apri foglio modale
      </bubble-button>
      <bubble-bottom-sheet ref={sheet} dragHandle label="Filtri" closeLabel="Chiudi">
        <p>Scegli i filtri da applicare.</p>
        <bubble-button slot="actions" onClick={() => sheet.current?.close("applica")}>
          Applica
        </bubble-button>
      </bubble-bottom-sheet>

      <bubble-bottom-sheet open={inlineOpen} variant="standard" dragHandle label="Filtri inline">
        <p>Foglio standard ancorato in basso.</p>
        <bubble-button variant="text" onClick={() => setInlineOpen(false)}>Chiudi</bubble-button>
      </bubble-bottom-sheet>
      <output>{result}</output>
    </div>
  );
}
```

### bubble-side-sheet

```tsx
export function SideSheetExamples() {
  const side = useRef<BubbleSideSheet | null>(null);
  const [standardOpen, setStandardOpen] = useState(true);

  return (
    <div>
      <bubble-button variant="filled" onClick={() => side.current?.show()}>
        Apri pannello
      </bubble-button>
      <bubble-side-sheet ref={side} label="Dettagli" detached closeLabel="Chiudi">
        <p>Dettagli del documento selezionato.</p>
        <bubble-button slot="actions" onClick={() => side.current?.close("salvato")}>
          Salva
        </bubble-button>
      </bubble-side-sheet>

      <bubble-side-sheet
        open={standardOpen}
        variant="standard"
        detached
        label="Dettagli inline"
      >
        <p>Pannello standard sempre visibile accanto al contenuto.</p>
        <bubble-button variant="text" onClick={() => setStandardOpen(false)}>Chiudi</bubble-button>
      </bubble-side-sheet>
    </div>
  );
}
```

### bubble-divider

```tsx
export function DividerExamples() {
  return (
    <div>
      <bubble-divider />
      <bubble-divider inset />
      <bubble-divider variant="inset-start" />
      <bubble-divider variant="inset-end" />
      <bubble-divider decorative />

      <div style={{ display: "flex", blockSize: 120, alignItems: "center", gap: 8 }}>
        <span>Prima</span>
        <bubble-divider vertical />
        <span>Dopo</span>
      </div>
      <div style={{ display: "flex", blockSize: 120, alignItems: "center", gap: 8 }}>
        <span>Prima</span>
        <bubble-divider vertical decorative />
        <span>Dopo</span>
      </div>
    </div>
  );
}
```

## Navigation

### bubble-app-bar

```tsx
export function AppBarExamples() {
  const [scrolled, setScrolled] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const variants = ["small", "center-aligned", "medium", "medium-flexible", "large", "large-flexible"] as const;

  return (
    <div>
      <bubble-app-bar
        label="Posta"
        variant="small"
        subtitle="12 non letti"
        alignment="leading"
        sticky
        scrolled={scrolled}
        collapsed={collapsed}
      >
        <bubble-icon-button slot="leading" label="Menu">☰</bubble-icon-button>
        <bubble-icon-button slot="trailing" label="Cerca">🔍</bubble-icon-button>
      </bubble-app-bar>

      {variants.map((variant) => (
        <bubble-app-bar
          key={variant}
          variant={variant}
          label={`Posta ${variant}`}
          subtitle="12 non letti"
          collapsed={collapsed}
        >
          <bubble-icon-button slot="leading" label="Menu">☰</bubble-icon-button>
        </bubble-app-bar>
      ))}

      <bubble-app-bar variant="search">
        <bubble-search label="Cerca" placeholder="Cerca nella posta">
          <span slot="leading" aria-hidden="true">🔍</span>
        </bubble-search>
      </bubble-app-bar>

      <bubble-button variant="outlined" onClick={() => setScrolled((value) => !value)}>
        Alterna scrolled
      </bubble-button>
      <bubble-button variant="outlined" onClick={() => setCollapsed((value) => !value)}>
        Alterna collapsed
      </bubble-button>
    </div>
  );
}
```

### bubble-toolbar

```tsx
export function ToolbarExamples() {
  return (
    <div>
      <bubble-toolbar label="Formato" variant="docked" orientation="horizontal" color="standard">
        <bubble-icon-button label="Grassetto" toggle>B</bubble-icon-button>
        <bubble-icon-button label="Corsivo" toggle>I</bubble-icon-button>
        <bubble-icon-button label="Sottolineato" toggle>U</bubble-icon-button>
        <bubble-divider vertical decorative />
        <bubble-icon-button label="Allinea a sinistra">≡</bubble-icon-button>
      </bubble-toolbar>

      <bubble-toolbar label="Modifica" color="vibrant">
        <bubble-icon-button label="Taglia" variant="standard">✂</bubble-icon-button>
        <bubble-icon-button label="Copia" variant="standard">⧉</bubble-icon-button>
        <bubble-icon-button label="Incolla" variant="standard">📋</bubble-icon-button>
      </bubble-toolbar>

      <bubble-toolbar label="Formato" variant="floating">
        <bubble-icon-button label="Grassetto" toggle>B</bubble-icon-button>
        <bubble-icon-button label="Corsivo" toggle>I</bubble-icon-button>
      </bubble-toolbar>

      <bubble-toolbar label="Allineamento" variant="floating" orientation="vertical">
        <bubble-icon-button label="Su">↑</bubble-icon-button>
        <bubble-icon-button label="Giù">↓</bubble-icon-button>
      </bubble-toolbar>
    </div>
  );
}
```

### bubble-navigation-bar

```tsx
const destinations: BubbleItem[] = [
  { id: "inbox", label: "Posta", icon: "inbox" },
  { id: "archive", label: "Archivio", icon: "archive", href: "/archivio" },
  { id: "settings", label: "Impostazioni", icon: "settings" },
  { id: "trash", label: "Cestino", icon: "trash", disabled: true },
];

export function NavigationBarExamples() {
  const [current, setCurrent] = useState("inbox");
  const bar = useRef<BubbleNavigationBar | null>(null);
  const flexible = useRef<BubbleNavigationBar | null>(null);
  useBubbleEvent(bar, "navigate", ({ id }: { id: string }) => setCurrent(id));
  useBubbleEvent(flexible, "navigate", ({ id }: { id: string }) => setCurrent(id));

  return (
    <div>
      <bubble-navigation-bar
        ref={bar}
        label="Navigazione principale"
        items={destinations}
        value={current}
        variant="standard"
        layout="vertical"
      />
      <bubble-navigation-bar
        ref={flexible}
        label="Navigazione flessibile"
        items={destinations}
        value={current}
        variant="flexible"
        layout="horizontal"
      />
      <output>{current}</output>
    </div>
  );
}
```

### bubble-navigation-rail

```tsx
// `destinations` è lo stesso array della sezione bubble-navigation-bar.
export function NavigationRailExamples() {
  const [current, setCurrent] = useState("inbox");
  const rail = useRef<BubbleNavigationRail | null>(null);
  useBubbleEvent(rail, "navigate", ({ id }: { id: string }) => setCurrent(id));

  return (
    <div>
      <bubble-navigation-rail
        ref={rail}
        label="Rail compresso"
        items={destinations}
        value={current}
      />
      <bubble-navigation-rail
        expanded
        variant="standard"
        layout="vertical"
        label="Rail espanso"
        items={destinations}
        value={current}
      />
    </div>
  );
}
```

### bubble-navigation-drawer

```tsx
// `destinations` è lo stesso array della sezione bubble-navigation-bar.
export function NavigationDrawerExamples() {
  const [current, setCurrent] = useState("inbox");
  const [standardOpen, setStandardOpen] = useState(true);
  const drawer = useRef<BubbleNavigationDrawer | null>(null);
  useBubbleEvent(drawer, "navigate", ({ id }: { id: string }) => setCurrent(id));

  return (
    <div>
      <bubble-button variant="filled" onClick={() => drawer.current?.show()}>
        Apri drawer
      </bubble-button>
      <bubble-navigation-drawer
        ref={drawer}
        label="Sezioni"
        closeLabel="Chiudi"
        items={destinations}
        value={current}
      >
        <p>Contenuto aggiuntivo del drawer.</p>
      </bubble-navigation-drawer>

      <bubble-navigation-drawer
        open={standardOpen}
        variant="standard"
        detached
        label="Sezioni standard"
        items={destinations}
        value={current}
      >
        <bubble-button variant="text" onClick={() => setStandardOpen(false)}>Chiudi</bubble-button>
      </bubble-navigation-drawer>
    </div>
  );
}
```

### bubble-tabs

```tsx
const primaryTabs: BubbleItem[] = [
  { id: "inbox", label: "Posta", icon: "inbox", badge: "3" },
  { id: "archive", label: "Archivio", icon: "archive" },
  { id: "settings", label: "Preferenze", icon: "settings" },
  { id: "trash", label: "Cestino", icon: "trash", disabled: true },
];

const manyTabs: BubbleItem[] = Array.from({ length: 8 }, (_, index) => ({
  id: `s${index}`,
  label: `Vista ${index + 1}`,
}));

export function TabsExamples() {
  const [tab, setTab] = useState("inbox");
  const [manyTab, setManyTab] = useState("s0");
  const tabs = useRef<BubbleTabs | null>(null);
  const secondary = useRef<BubbleTabs | null>(null);
  const scrollTabs = useRef<BubbleTabs | null>(null);
  useBubbleEvent(tabs, "change", ({ value }: { value: string }) => setTab(value));
  useBubbleEvent(secondary, "change", ({ value }: { value: string }) => setTab(value));
  useBubbleEvent(scrollTabs, "change", ({ value }: { value: string }) => setManyTab(value));

  return (
    <div>
      <bubble-tabs
        ref={tabs}
        label="Categorie"
        items={primaryTabs}
        value={tab}
        variant="primary"
        activation="automatic"
        scrollable={false}
      >
        <p slot="inbox">Messaggi ricevuti.</p>
        <p slot="archive">Documenti salvati.</p>
        <p slot="settings">Preferenze personali.</p>
        <p slot="trash">Elementi eliminati.</p>
      </bubble-tabs>

      <bubble-tabs
        ref={secondary}
        label="Dettagli"
        items={primaryTabs}
        value={tab}
        variant="secondary"
        activation="manual"
      >
        <p slot="inbox">Scheda secondaria.</p>
        <p slot="archive">Archivio secondario.</p>
        <p slot="settings">Impostazioni secondarie.</p>
        <p slot="trash">Cestino secondario.</p>
      </bubble-tabs>

      <bubble-tabs
        ref={scrollTabs}
        label="Viste scorrevoli"
        items={manyTabs}
        value={manyTab}
        scrollable
      >
        {manyTabs.map((item) => (
          <p key={item.id} slot={item.id}>{item.label}</p>
        ))}
      </bubble-tabs>
    </div>
  );
}
```

## Selection

### bubble-checkbox

```tsx
export function CheckboxExamples() {
  const [terms, setTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const termsField = useRef<BubbleCheckbox | null>(null);
  const newsletterField = useRef<BubbleCheckbox | null>(null);
  useBubbleEvent(termsField, "change", ({ checked }: { checked: boolean }) =>
    setTerms(checked),
  );
  useBubbleEvent(newsletterField, "change", ({ checked }: { checked: boolean }) =>
    setNewsletter(checked),
  );

  return (
    <form>
      <bubble-checkbox
        ref={termsField}
        label="Accetto i termini"
        name="terms"
        value="si"
        required
        checked={terms}
        supportingText="Puoi revocare il consenso in qualsiasi momento."
      />
      <bubble-checkbox
        ref={newsletterField}
        name="newsletter"
        value="si"
        checked={newsletter}
        label="Newsletter"
      />
      <bubble-checkbox indeterminate label="Selezione parziale" />
      <bubble-checkbox checked disabled label="Disabilitata" />
      <bubble-checkbox
        checked
        error
        required
        label="Campo con errore"
        supportingText="Devi accettare per continuare."
      />
    </form>
  );
}
```

The component's `change` event is not the browser's native event: it must
always be attached with `useBubbleEvent` on a ref, as in the two controlled
fields.

### bubble-switch

```tsx
export function SwitchExamples() {
  const [wifi, setWifi] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const wifiSwitch = useRef<BubbleSwitch | null>(null);
  const notificationsSwitch = useRef<BubbleSwitch | null>(null);
  useBubbleEvent(wifiSwitch, "change", ({ checked }: { checked: boolean }) =>
    setWifi(checked),
  );
  useBubbleEvent(notificationsSwitch, "change", ({ checked }: { checked: boolean }) =>
    setNotifications(checked),
  );

  return (
    <div>
      <bubble-switch
        ref={wifiSwitch}
        label="Wi-Fi"
        name="wifi"
        value="on"
        checked={wifi}
        icon="🔅"
        iconSelected="🔆"
      />
      <bubble-switch
        ref={notificationsSwitch}
        label="Notifiche"
        checked={notifications}
        supportingText="Ricevi un avviso per ogni aggiornamento."
      />
      <bubble-switch checked disabled label="Bluetooth disabilitato" />
      <bubble-switch checked error required label="Con errore" supportingText="Azione richiesta." />
    </div>
  );
}
```

`icon` and `iconSelected` exist only as properties (no attribute): React 19
assigns them correctly. With React 18 use `useBubbleProps(switchRef, { icon, iconSelected })`.

### bubble-radio-button

```tsx
export function RadioExamples() {
  const [plan, setPlan] = useState("standard");
  const group = useRef<HTMLDivElement | null>(null);
  useBubbleEvent(group, "change", ({ value }: { value: string }) => setPlan(value));

  return (
    <form ref={group}>
      {["standard", "plus", "enterprise"].map((option) => (
        <bubble-radio-button
          key={option}
          name="plan"
          value={option}
          label={option}
          checked={plan === option}
          required
        />
      ))}
      <bubble-radio-button name="plan" value="legacy" label="Legacy" disabled />
      <bubble-radio-button name="locale" value="it" label="Italiano" checked />
      <bubble-radio-button name="locale" value="en" label="Inglese" />
    </form>
  );
}
```

The listener sits on the container, not on the individual radio: that way it
receives the `change` of the whole group.

### bubble-chip

```tsx
export function ChipExamples() {
  const [favorite, setFavorite] = useState(false);
  const [cities, setCities] = useState(["Roma"]);
  const [log, setLog] = useState("");
  const chips = useRef<HTMLDivElement | null>(null);

  useBubbleEvent(chips, "action", () => setLog("assist"));
  useBubbleEvent(chips, "change", ({ selected }: { selected: boolean }) =>
    setFavorite(selected),
  );
  useBubbleEvent(chips, "remove", (_detail, event) => {
    const label = (event.target as BubbleChip).label;
    setCities((current) => current.filter((city) => city !== label));
  });

  return (
    <div ref={chips}>
      <bubble-chip variant="assist" label="Aggiungi al calendario" />
      <bubble-chip
        variant="filter"
        name="filters"
        value="favorite"
        label="Preferiti"
        selected={favorite}
      />
      <bubble-chip variant="filter" name="filters" value="unread" label="Solo non letti" />
      <bubble-chip variant="filter" elevated label="Elevata" />

      {cities.map((city) => (
        <bubble-chip
          key={city}
          variant="input"
          label={city}
          removable
          removeLabel={`Rimuovi ${city}`}
        >
          <span slot="avatar" aria-hidden="true">{city.slice(0, 2)}</span>
        </bubble-chip>
      ))}

      <bubble-chip variant="suggestion" label="Grazie!">
        <span slot="icon" aria-hidden="true">✓</span>
      </bubble-chip>
      <bubble-chip variant="assist" href="https://example.com" label="Apri collegamento">
        <span slot="icon" aria-hidden="true">↗</span>
      </bubble-chip>
      <bubble-chip variant="assist" label="Disabilitata" disabled />
      <output>{log}</output>
    </div>
  );
}
```

Only the `filter` variant participates in the form with `name` and `value`.

### bubble-list

```tsx
const listItems: BubbleItem[] = [
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

export function ListExamples() {
  const [single, setSingle] = useState("inbox");
  const [multiple, setMultiple] = useState<string[]>(["inbox"]);
  const [expanded, setExpanded] = useState<string[]>(["folders"]);
  const [log, setLog] = useState("");
  const singleList = useRef<BubbleList | null>(null);
  const multiList = useRef<BubbleList | null>(null);
  const actionList = useRef<BubbleList | null>(null);

  useBubbleEvent(singleList, "change", ({ value }: { value: string }) => setSingle(value));
  useBubbleEvent(singleList, "expand", ({ id, expanded: open }: { id: string; expanded: boolean }) =>
    setExpanded((current) => (open ? [...current, id] : current.filter((value) => value !== id))),
  );
  useBubbleEvent(multiList, "change", ({ value }: { value: string[] }) => setMultiple(value));
  useBubbleEvent(actionList, "action", ({ id }: { id: string }) => setLog(`azione ${id}`));

  return (
    <div>
      <bubble-list
        ref={singleList}
        label="Selezione singola"
        variant="standard"
        interactive
        selection="single"
        items={listItems}
        value={single}
        expanded={expanded}
      />
      <bubble-list
        ref={multiList}
        label="Selezione multipla"
        variant="segmented"
        selection="multiple"
        items={listItems}
        value={multiple}
      />
      <bubble-list
        ref={actionList}
        label="Azioni"
        interactive
        selection="none"
        items={listItems}
      />
      <bubble-list label="Statico con link" selection="none" items={listItems}>
        <li><div className="list-item">Riga personalizzata</div></li>
      </bubble-list>
      <output>{log}</output>
    </div>
  );
}
```

### bubble-segmented-buttons

```tsx
const segments: BubbleItem[] = [
  { id: "inbox", label: "Posta", icon: "inbox" },
  { id: "archive", label: "Archivio", icon: "archive" },
  { id: "settings", label: "Impostazioni", icon: "settings" },
  { id: "trash", label: "Cestino", icon: "trash", disabled: true },
];

export function SegmentedExamples() {
  const [view, setView] = useState("inbox");
  const [filters, setFilters] = useState<string[]>(["inbox", "archive"]);
  const single = useRef<BubbleSegmentedButtons | null>(null);
  const multi = useRef<BubbleSegmentedButtons | null>(null);
  useBubbleEvent(single, "change", ({ value }: { value: string }) => setView(value));
  useBubbleEvent(multi, "change", ({ values }: { values: string[] }) => setFilters(values));

  return (
    <form>
      <bubble-segmented-buttons
        ref={single}
        label="Vista"
        name="view"
        items={segments}
        value={view}
        required
      />
      <bubble-segmented-buttons
        ref={multi}
        label="Filtri"
        name="filters"
        multiple
        items={segments}
        values={filters}
      />
      <bubble-segmented-buttons label="Disabilitati" name="disabled" items={segments} value="inbox" disabled />
    </form>
  );
}
```

### bubble-slider

```tsx
export function SliderExamples() {
  const [volume, setVolume] = useState("40");
  const [balance, setBalance] = useState("60");
  const [price, setPrice] = useState("20");
  const [upper, setUpper] = useState(80);
  const [brightness, setBrightness] = useState("40");
  const volumeSlider = useRef<BubbleSlider | null>(null);
  const balanceSlider = useRef<BubbleSlider | null>(null);
  const range = useRef<BubbleSlider | null>(null);
  const brightnessSlider = useRef<BubbleSlider | null>(null);

  useBubbleEvent(volumeSlider, "value-input", ({ value }: { value: string }) => setVolume(value));
  useBubbleEvent(balanceSlider, "value-input", ({ value }: { value: string }) => setBalance(value));
  useBubbleEvent(brightnessSlider, "value-input", ({ value }: { value: string }) => setBrightness(value));
  useBubbleEvent(range, "value-input", ({ value, upperValue }: { value: string; upperValue?: number }) => {
    setPrice(value);
    setUpper(upperValue ?? upper);
  });

  return (
    <div>
      <bubble-slider
        ref={volumeSlider}
        name="volume"
        label="Volume"
        value={volume}
        min={0}
        max={100}
        step={1}
        variant="continuous"
        size="xs"
        orientation="horizontal"
        showValue
      />
      <bubble-slider
        ref={balanceSlider}
        label="Bilanciamento"
        variant="centered"
        value={balance}
        showValue
      />
      <bubble-slider
        ref={range}
        label="Prezzo"
        name="price"
        variant="range"
        value={price}
        upperValue={upper}
        upperLabel="Massimo"
        showValue
        required
      />
      <bubble-slider
        ref={brightnessSlider}
        label="Luminosità"
        value={brightness}
        showValue
        iconStart="🔅"
        iconEnd="🔆"
      />
      <bubble-slider label="Passo 10 con indicatori" step={10} value="40" showValue stops />
      <bubble-slider label="Small" size="small" value="30" />
      <bubble-slider label="Large" size="large" value="70" />
      <bubble-slider label="Verticale" orientation="vertical" value="50" />
      <bubble-slider label="Disabilitato" value="20" disabled />
    </div>
  );
}
```

`iconStart` and `iconEnd` are properties: React 19 assigns them; with React 18
use `useBubbleProps`.

## Text and input

### bubble-text-field

```tsx
export function TextFieldExamples() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const field = useRef<BubbleTextField | null>(null);
  const bio = useRef<BubbleTextField | null>(null);
  const emailError = email.length > 0 && !email.includes("@");

  useBubbleEvent(field, "value-input", ({ value }: { value: string }) => setEmail(value));
  useBubbleEvent(bio, "value-input", ({ value }: { value: string }) => setMessage(value));

  return (
    <form>
      <bubble-text-field
        ref={field}
        name="email"
        label="Email"
        type="email"
        variant="outlined"
        placeholder="nome@dominio.it"
        autocomplete="email"
        maxlength={120}
        counter
        required
        value={email}
        error={emailError}
        supportingText="Useremo questo indirizzo per le notifiche."
      >
        <span slot="leading" aria-hidden="true">✉</span>
        <span slot="trailing" aria-hidden="true">?</span>
      </bubble-text-field>

      <bubble-text-field label="Nome utente" variant="filled" prefix="@" maxlength={30} counter />
      <bubble-text-field label="Prezzo" type="number" min="0" max="9999" step="0.01" prefix="€" suffix="EUR" value="12.50" />
      <bubble-text-field
        ref={bio}
        label="Messaggio"
        multiline
        rows={4}
        maxlength={200}
        counter
        value={message}
      />
      <bubble-text-field label="Solo lettura" readonly value="Valore bloccato" />
      <bubble-text-field label="Quantità" type="number" min="1" max="10" step="1" value="2" />
      <bubble-text-field label="Codice" pattern="[A-Z]{3}[0-9]{3}" value="ABC123" supportingText="Tre lettere e tre cifre." />
      <bubble-text-field label="Data" type="date" min="2026-01-01" max="2026-12-31" />
      <bubble-text-field label="Ricerca" type="search" placeholder="Cerca" />
      <bubble-text-field label="Disabilitato" disabled value="Non modificabile" />
    </form>
  );
}
```

### bubble-search

```tsx
const allCities = ["Bologna", "Bolzano", "Firenze", "Genova", "Milano", "Napoli", "Roma", "Torino"];

export function SearchExamples() {
  const [query, setQuery] = useState("");
  const [cities, setCities] = useState(allCities);
  const [lastSearch, setLastSearch] = useState("");
  const search = useRef<BubbleSearch | null>(null);

  useBubbleEvent(search, "value-input", ({ value }: { value: string }) => setQuery(value));
  useBubbleEvent(search, "suggest", ({ value }: { value: string }) =>
    setCities(allCities.filter((city) => city.toLowerCase().includes(value.toLowerCase()))),
  );
  useBubbleEvent(search, "search", ({ value }: { value: string }) => setLastSearch(value));

  return (
    <div>
      <bubble-search
        label="Cerca documenti"
        placeholder="Titolo o autore"
        appearance="contained"
        layout="docked"
        value={query}
        suggestions={[]}
        suggestionDelay={0}
      >
        <span slot="leading" aria-hidden="true">🔍</span>
        <span slot="trailing" aria-hidden="true">⌘K</span>
        <bubble-list
          slot="results"
          label="Risultati"
          selection="none"
          items={[
            { id: "r1", label: "Roma", supportingText: "Capitale d'Italia" },
            { id: "r2", label: "Torino", supportingText: "Capoluogo piemontese" },
          ]}
        />
      </bubble-search>

      <bubble-search appearance="divided" label="Cerca nel testo" placeholder="Parola chiave" />
      <bubble-search layout="full-screen" label="Cerca ovunque" placeholder="Cerca ovunque" />

      <bubble-search
        ref={search}
        filter
        label="Cerca città"
        placeholder="Scrivi una città"
        suggestionsLabel="Suggerimenti"
        suggestionDelay={150}
        suggestions={cities}
      />
      <output>{lastSearch}</output>
    </div>
  );
}
```

### bubble-date-picker

```tsx
export function DatePickerExamples() {
  const [appointment, setAppointment] = useState("2026-11-11");
  const [rangeStart, setRangeStart] = useState("2026-11-01");
  const [rangeEnd, setRangeEnd] = useState("2026-11-20");
  const single = useRef<BubbleDatePicker | null>(null);
  const range = useRef<BubbleDatePicker | null>(null);

  useBubbleEvent(single, "change", ({ value }: { value: string }) => setAppointment(value));
  useBubbleEvent(range, "change", ({ value, endValue }: { value: string; endValue: string }) => {
    setRangeStart(value);
    setRangeEnd(endValue);
  });

  return (
    <form>
      <bubble-date-picker
        ref={single}
        label="Data appuntamento"
        name="appointment"
        locale="it"
        variant="modal"
        selectionMode="single"
        min="2026-01-01"
        max="2026-12-31"
        required
        value={appointment}
        supportingText="Seleziona un giorno lavorativo."
      />

      <bubble-date-picker
        ref={range}
        label="Periodo"
        name="period"
        locale="it"
        selectionMode="range"
        value={rangeStart}
        endValue={rangeEnd}
      />

      <bubble-date-picker
        variant="docked"
        label="Calendario sempre visibile"
        locale="it"
        selectionMode="single"
        value={appointment}
        weekStartsOn={1}
        labels={{ previous: "Mese precedente", next: "Mese successivo" }}
      />

      <bubble-date-picker label="Disabilitato" disabled value="2026-11-11" />
    </form>
  );
}
```

### bubble-time-picker

```tsx
export function TimePickerExamples() {
  const [time, setTime] = useState("09:30");
  const [evening, setEvening] = useState("18:45");
  const dial = useRef<BubbleTimePicker | null>(null);
  const twelve = useRef<BubbleTimePicker | null>(null);

  useBubbleEvent(dial, "change", ({ value }: { value: string }) => setTime(value));
  useBubbleEvent(twelve, "change", ({ value }: { value: string }) => setEvening(value));

  return (
    <form>
      <bubble-time-picker
        ref={dial}
        label="Ora promemoria"
        name="time"
        variant="dial"
        hourCycle={24}
        locale="it"
        required
        value={time}
      />
      <bubble-time-picker
        ref={twelve}
        label="Ora in formato 12"
        variant="dial"
        hourCycle={12}
        locale="it"
        value={evening}
        labels={{ period: "AM o PM", hour: "Ora", minute: "Minuti" }}
      />
      <bubble-time-picker label="Inserimento da tastiera" variant="input" hourCycle={24} value="08:15" />
      <bubble-time-picker label="Disabilitato" disabled value="07:00" />
    </form>
  );
}
```

## Menu

### bubble-menu

```tsx
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

export function MenuExamples() {
  const actions = useRef<BubbleMenu | null>(null);
  const filters = useRef<BubbleMenu | null>(null);
  const baseline = useRef<BubbleMenu | null>(null);
  const [last, setLast] = useState("");

  const onSelect = ({ item, selectedIds }: { item: { label: string }; selectedIds: string[] }) =>
    setLast(`${item.label} (${selectedIds.join(", ")})`);

  useBubbleEvent(actions, "menu-select", onSelect);
  useBubbleEvent(filters, "menu-select", onSelect);
  useBubbleEvent(baseline, "menu-select", onSelect);
  useBubbleEvent(actions, "menu-open", () => setLast("menu aperto"));
  useBubbleEvent(actions, "menu-close", () => setLast("menu chiuso"));

  function open(
    menu: BubbleMenu | null,
    event: React.MouseEvent,
    options?: { last?: boolean; x?: number; y?: number },
  ) {
    menu?.show(event.currentTarget as HTMLElement, options);
  }

  return (
    <div>
      <bubble-button haspopup="menu" onClick={(event) => open(actions.current, event)}>
        Azioni
      </bubble-button>
      <bubble-menu
        ref={actions}
        menuLabel="Azioni documento"
        variant="vertical"
        colorScheme="standard"
        selectionMode="none"
        quick={false}
        density={0}
        inactive={false}
        items={documentItems}
      />

      <bubble-button
        variant="tonal"
        haspopup="menu"
        onClick={(event) => open(filters.current, event, { last: true })}
      >
        Filtri
      </bubble-button>
      <bubble-menu
        ref={filters}
        menuLabel="Filtri contenuti"
        colorScheme="vibrant"
        selectionMode="multi"
        density={-1}
        items={filterItems}
      />

      <bubble-button
        variant="outlined"
        haspopup="menu"
        onClick={(event) => open(baseline.current, event, { x: 120, y: 160 })}
      >
        Menu baseline a coordinate
      </bubble-button>
      <bubble-button variant="text" onClick={() => actions.current?.close()}>
        Chiudi menu azioni
      </bubble-button>
      <bubble-menu ref={baseline} menuLabel="Azioni rapide" variant="baseline" items={baselineItems} />
      <output>{last}</output>
    </div>
  );
}
```

### bubble-fab-menu

```tsx
const fabItems: BubbleItem[] = [
  { id: "note", label: "Nota", icon: "note" },
  { id: "folder", label: "Cartella", icon: "folder" },
  { id: "upload", label: "Carica file", icon: "upload" },
  { id: "event", label: "Evento", icon: "calendar", disabled: true },
];

export function FabMenuExamples() {
  const [log, setLog] = useState("");
  const fab = useRef<BubbleFabMenu | null>(null);
  useBubbleEvent(fab, "action", ({ id }: { id?: string }) => setLog(`crea ${id}`));

  return (
    <div>
      <bubble-fab-menu ref={fab} label="Crea" items={fabItems}>
        <span slot="icon" aria-hidden="true">＋</span>
      </bubble-fab-menu>
      <output>{log}</output>
    </div>
  );
}
```

### bubble-split-button

```tsx
const splitItems: MenuEntry[] = [
  { id: "later", label: "Invia più tardi" },
  { id: "draft", label: "Salva bozza" },
  { separator: true },
  { id: "template", label: "Usa modello" },
];

export function SplitButtonExamples() {
  const [log, setLog] = useState("");
  const variants = ["filled", "tonal", "outlined", "elevated"] as const;
  const sizes = ["xs", "small", "medium", "large", "xl"] as const;
  const split = useRef<BubbleSplitButton | null>(null);

  useBubbleEvent(split, "action", () => setLog("azione principale"));
  useBubbleEvent(split, "menu-select", ({ item }: { item: { label: string } }) =>
    setLog(item.label),
  );
  useBubbleEvent(split, "menu-open", () => setLog("menu aperto"));
  useBubbleEvent(split, "menu-close", () => setLog("menu chiuso"));

  return (
    <div>
      {variants.map((variant) => (
        <bubble-split-button
          key={variant}
          variant={variant}
          label={`Invia ${variant}`}
          menuLabel={`Altre opzioni ${variant}`}
          items={splitItems}
        />
      ))}

      {sizes.map((size) => (
        <bubble-split-button
          key={size}
          size={size}
          label={size}
          menuLabel={`Altre opzioni ${size}`}
          items={splitItems}
        />
      ))}

      <bubble-split-button
        ref={split}
        label="Invia"
        menuLabel="Altre opzioni"
        items={splitItems}
      />
      <bubble-split-button label="Invia" menuLabel="Altre opzioni" disabled items={splitItems} />
      <output>{log}</output>
    </div>
  );
}
```

## Coverage

| Group         | Components                                                                 |
| ------------- | -------------------------------------------------------------------------- |
| Actions       | button, icon-button, floating-action-button, extended-fab, button-group    |
| Communication | badge, progress-indicator, loading-indicator, snackbar, tooltip, carousel  |
| Containment   | card, dialog, bottom-sheet, side-sheet, divider                            |
| Navigation    | app-bar, toolbar, navigation-bar, navigation-rail, navigation-drawer, tabs |
| Selection     | checkbox, switch, radio-button, chip, list, segmented-buttons, slider      |
| Text and input| text-field, search, date-picker, time-picker                               |
| Menu          | menu, fab-menu, split-button                                               |







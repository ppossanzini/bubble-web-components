# Bubble · Slider — istruzioni di implementazione

Questa guida costruisce in VS Code le cinque varianti dello slider di Bubble come **Web Components senza framework** (HTML, CSS, JavaScript). Funzionano ovunque: in una pagina statica, in React, Vue, Angular o Svelte.

| Variante | Elemento | Uso |
|---|---|---|
| A · Bolla-valore | `<bb-slider>` | Slider standard per valori continui |
| B · Livello liquido | `<bb-slider variant="liquid">` | Valori continui su mobile e pannelli compatti |
| C · Bolle in fila | `<bb-steps>` | Da 3 a 7 valori discreti con un nome |
| D · Membrana | `<bb-slider variant="membrane">` | Solo per momenti espressivi, al massimo una per schermata |
| E · Gocce che si fondono | `<bb-range>` | Intervalli con minimo e massimo |

---

## 1. Prepara il progetto

1. In VS Code apri una cartella vuota (*File → Apri cartella…*), per esempio `bubble-slider`.
2. Installa l'estensione **Live Server** (Ritwick Dey). In alternativa, dal terminale integrato puoi usare `npx serve .`.
3. Crea questa struttura:

```
bubble-slider/
├─ index.html            ← pagina demo
└─ src/
   ├─ tokens.css         ← colori, raggi, ombre, movimento (light + dark)
   ├─ slider.css         ← stili delle 5 varianti
   └─ slider.js          ← i tre custom element
```

4. Incolla il contenuto dei paragrafi 2–5 nei file corrispondenti.
5. Tasto destro su `index.html` → **Open with Live Server**.

> **Con un assistente AI in VS Code** (Copilot Chat, Claude Code, Cursor…) puoi saltare i passi 4–5: apri questo file e chiedi «Implementa BUBBLE-SLIDER.md esattamente come descritto, poi esegui la checklist del paragrafo 7».

---

## 2. `src/tokens.css`

Contiene solo i token di Bubble che servono allo slider. Il tema scuro si attiva con `data-theme="dark"` su `<html>` oppure seguendo il sistema.

```css
:root, [data-theme="light"] {
  --primary: #5B4CF0;
  --on-primary: #FFFFFF;
  --surface: #F7F5FF;
  --surface-container: #FFFFFF;
  --surface-container-high: #EFECFB;
  --on-surface: #16142B;
  --on-surface-variant: #4A4766;
  --outline: #79769A;
  --outline-variant: #D9D4F5;
  --highlight: #FFFFFF;
  --float-2: 0 6px 16px rgba(22, 20, 43, 0.14);
}
[data-theme="dark"] {
  --primary: #C4BDFF;
  --on-primary: #2A1F99;
  --surface: #121124;
  --surface-container: #1C1A33;
  --surface-container-high: #26243F;
  --on-surface: #ECEAF7;
  --on-surface-variant: #C3C0DA;
  --outline: #8E8BAB;
  --outline-variant: #3A3756;
  --highlight: #E9E6FF;
  --float-2: 0 6px 16px rgba(0, 0, 0, 0.55);
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --primary: #C4BDFF; --on-primary: #2A1F99; --surface: #121124;
    --surface-container: #1C1A33; --surface-container-high: #26243F;
    --on-surface: #ECEAF7; --on-surface-variant: #C3C0DA; --outline: #8E8BAB;
    --outline-variant: #3A3756; --highlight: #E9E6FF; --float-2: 0 6px 16px rgba(0, 0, 0, 0.55);
  }
}
:root {
  /* pellicola: solo decorazione */
  --film-cyan: #7FD6FF; --film-lilac: #B79CFF; --film-pink: #FF9ECF; --film-gold: #FFD68A;
  --bb-film: conic-gradient(from 200deg, var(--film-cyan), var(--film-lilac), var(--film-pink), var(--film-gold), var(--film-cyan));

  --radius-tail: 6px;
  --radius-full: 9999px;

  --dur-squish: 380ms;
  --dur-fade: 150ms;
  --ease-spring: cubic-bezier(0.3, 1.6, 0.5, 1);
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);

  --font-display: Fredoka, Figtree, system-ui, sans-serif;
  --font-sans: Figtree, system-ui, sans-serif;
}
```

---

## 3. `src/slider.css`

Tutte le varianti si basano su un `<input type="range">` nativo e trasparente, che garantisce tastiera e screen reader. Il JavaScript aggiorna `--v` (percentuale 0–100) sul contenitore. La pressione corrisponde a `:active`.

```css
/* ---------- base comune ---------- */
bb-slider, bb-range, bb-steps { display: block; font-family: var(--font-sans); color: var(--on-surface); }
.bb-slider, .bb-range { position: relative; touch-action: none; }
.bb-slider__input, .bb-range__input {
  position: absolute; inset: 0; width: 100%; height: 100%; margin: 0;
  opacity: 0; cursor: pointer; -webkit-appearance: none; appearance: none; background: transparent;
}
.bb-slider__input::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 44px; }
.bb-slider__input::-moz-range-thumb { width: 24px; height: 44px; border: 0; }

.bb-label { display: flex; justify-content: space-between; margin: 0 0 8px; font: 600 13px/16px var(--font-sans); color: var(--on-surface-variant); }

/* focus standard (A, B, C): contorno sul contenitore, solo da tastiera */
.bb-slider:not(.bb-slider--membrane):has(.bb-slider__input:focus-visible),
.bb-steps:has(:focus-visible) {
  outline: 2px solid var(--primary); outline-offset: 6px; border-radius: var(--radius-full);
}

/* focus discreto (D, E): nessun contorno, alone sul pomello, mai durante il trascinamento */
.bb-slider--membrane:not([data-pointer]):has(.bb-slider__input:focus-visible) .bb-membrane__thumb { stroke: var(--film-lilac); stroke-width: 5; }
.bb-range:not([data-pointer]):has([data-end="lo"]:focus-visible) .bb-range__thumb--lo,
.bb-range:not([data-pointer]):has([data-end="hi"]:focus-visible) .bb-range__thumb--hi {
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--film-lilac) 55%, transparent);
}

/* ---------- A · Bolla-valore ---------- */
.bb-slider { --v: 50; --x: calc(12px + (100% - 24px) * var(--v) / 100); height: 72px; }
.bb-slider__track {
  position: absolute; left: 0; right: 0; bottom: 18px; height: 8px; border-radius: var(--radius-full);
  background: linear-gradient(to right, var(--primary) var(--x), var(--surface-container-high) var(--x));
}
.bb-slider__thumb {
  position: absolute; bottom: 10px; left: var(--x); width: 24px; height: 24px; margin-left: -12px;
  border-radius: 50%; background: var(--primary); border: 3px solid var(--surface-container); box-sizing: border-box;
  box-shadow: var(--float-2); pointer-events: none;
  transition: transform var(--dur-squish) var(--ease-spring);
}
.bb-slider__bubble {
  position: absolute; left: var(--x); bottom: 30px; width: 44px; height: 44px; margin-left: -22px;
  border-radius: 50% 50% 50% var(--radius-tail); background: var(--primary); color: var(--on-primary);
  display: flex; align-items: center; justify-content: center; box-shadow: var(--float-2); pointer-events: none;
  transform: rotate(-45deg) scale(.82);
  transition: transform var(--dur-squish) var(--ease-spring), bottom var(--dur-squish) var(--ease-spring);
}
.bb-slider__bubble > span { transform: rotate(45deg); font: 700 15px/1 var(--font-sans); }
.bb-slider:active .bb-slider__thumb { transform: scale(1.25, .8); }
.bb-slider:active .bb-slider__bubble { transform: rotate(-45deg) scale(1.08); bottom: 40px; }

/* ---------- B · Livello liquido ---------- */
.bb-slider--liquid {
  --fill: max(64px, calc(var(--v) * 1%)); height: 64px; border-radius: var(--radius-full);
  background: var(--surface-container-high); overflow: hidden;
  transition: transform var(--dur-squish) var(--ease-spring);
}
.bb-slider--liquid::before { content: ""; position: absolute; inset: 0 auto 0 0; width: var(--fill); border-radius: var(--radius-full); background: var(--primary); pointer-events: none; }
.bb-slider--liquid::after { content: ""; position: absolute; top: 11px; left: calc(var(--fill) - 30px); width: 16px; height: 9px; border-radius: 50%; background: var(--highlight); opacity: .55; transform: rotate(35deg); pointer-events: none; }
.bb-slider--liquid .bb-slider__icon { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); color: var(--on-primary); pointer-events: none; z-index: 1; display: flex; }
.bb-slider--liquid .bb-slider__input::-webkit-slider-thumb { width: 1px; height: 64px; }
.bb-slider--liquid .bb-slider__input::-moz-range-thumb { width: 1px; height: 64px; }
.bb-slider--liquid:active { transform: scale(1.02, .9); }

/* ---------- C · Bolle in fila ---------- */
.bb-steps__row { display: inline-flex; align-items: flex-end; gap: 6px; }
.bb-steps__step { width: 52px; height: 52px; padding: 0; border: 0; background: transparent; cursor: pointer; display: flex; align-items: flex-end; justify-content: center; }
.bb-steps__step:focus-visible { outline: none; }
.bb-steps__dot {
  --size: 24px; display: block; width: var(--size); height: var(--size); border-radius: 50%; box-sizing: border-box;
  border: 2px solid var(--outline); background: transparent;
  transition: transform var(--dur-squish) var(--ease-spring), background-color var(--dur-fade) var(--ease-standard);
}
.bb-steps__step:has(~ .bb-steps__step[aria-checked="true"]) .bb-steps__dot { background: var(--primary); border-color: var(--primary); }
.bb-steps__step[aria-checked="true"] .bb-steps__dot {
  border: 3px solid transparent; transform: scale(1.12);
  background: linear-gradient(var(--primary), var(--primary)) padding-box, var(--bb-film) border-box;
}
.bb-steps__step:active .bb-steps__dot { transform: scale(1.2, .85); }

/* ---------- D · Membrana ---------- */
.bb-slider--membrane { height: 110px; }
.bb-slider--membrane svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.bb-slider--membrane .bb-slider__input { top: 40px; height: 60px; }
.bb-membrane__on { stop-color: var(--primary); }
.bb-membrane__off { stop-color: var(--outline-variant); }
.bb-membrane__thumb { fill: var(--primary); stroke: var(--surface-container); stroke-width: 3; }
.bb-membrane__value { fill: var(--on-surface); font: 600 22px var(--font-display); }

/* ---------- E · Gocce che si fondono ---------- */
.bb-range {
  --lo: 20; --hi: 70;
  --xl: calc(14px + (100% - 28px) * var(--lo) / 100);
  --xh: calc(14px + (100% - 28px) * var(--hi) / 100);
  height: 44px;
}
.bb-range::before { content: ""; position: absolute; left: 0; right: 0; top: 18px; height: 8px; border-radius: var(--radius-full); background: var(--surface-container-high); }
.bb-range__bridge {
  position: absolute; left: var(--xl); width: calc(var(--xh) - var(--xl)); top: 17px; height: 10px;
  border-radius: var(--radius-full); background: var(--primary); pointer-events: none;
  transition: height var(--dur-squish) var(--ease-spring), top var(--dur-squish) var(--ease-spring);
}
.bb-range.is-merged .bb-range__bridge { height: 24px; top: 10px; }
.bb-range__thumb { position: absolute; top: 8px; width: 28px; height: 28px; margin-left: -14px; border-radius: 50%; background: var(--primary); box-shadow: var(--float-2); pointer-events: none; }
.bb-range__thumb--lo { left: var(--xl); }
.bb-range__thumb--hi { left: var(--xh); }
.bb-range__input { pointer-events: none; }
.bb-range__input::-webkit-slider-thumb { pointer-events: auto; -webkit-appearance: none; width: 28px; height: 44px; cursor: pointer; }
.bb-range__input::-moz-range-thumb { pointer-events: auto; width: 28px; height: 44px; border: 0; cursor: pointer; }

/* ---------- movimento ridotto ---------- */
@media (prefers-reduced-motion: reduce) {
  .bb-slider__thumb, .bb-slider__bubble, .bb-slider--liquid, .bb-steps__dot, .bb-range__bridge { transition: none; }
  .bb-slider:active .bb-slider__thumb, .bb-slider--liquid:active, .bb-steps__step:active .bb-steps__dot { transform: none; }
  .bb-slider:active .bb-slider__bubble { transform: rotate(-45deg) scale(.82); bottom: 30px; }
}
```

---

## 4. `src/slider.js`

Tre custom element che disegnano il proprio markup nel light DOM, così lo stile del paragrafo 3 si applica direttamente. Gli eventi nativi `input` e `change` risalgono dall'input interno. `<bb-steps>` e `<bb-range>` emettono anche un evento `change` con `detail`.

```js
const pct = (v, min, max) => ((v - min) / (max - min)) * 100;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* Nasconde il focus durante il trascinamento: data-pointer su pointerdown, via su keydown */
function pointerFocus(el) {
  el.addEventListener('pointerdown', () => el.setAttribute('data-pointer', ''));
  el.addEventListener('keydown', () => el.removeAttribute('data-pointer'));
}

/* ---------- <bb-slider>  varianti: bubble (predefinita) | liquid | membrane ---------- */
class BbSlider extends HTMLElement {
  connectedCallback() {
    if (this._ready) return; this._ready = true;
    this.min = Number(this.getAttribute('min') ?? 0);
    this.max = Number(this.getAttribute('max') ?? 100);
    this.step = this.getAttribute('step') ?? '1';
    this.variant = this.getAttribute('variant') ?? 'bubble';
    this.suffix = this.getAttribute('suffix') ?? '';
    const label = this.getAttribute('label') ?? 'Valore';
    const value = Number(this.getAttribute('value') ?? (this.min + this.max) / 2);
    const input = `<input class="bb-slider__input" type="range" min="${this.min}" max="${this.max}" step="${this.step}" value="${value}" aria-label="${esc(label)}">`;
    const head = `<p class="bb-label"><span>${esc(label)}</span><span data-out></span></p>`;

    if (this.variant === 'liquid') {
      this.innerHTML = `${head}<div class="bb-slider bb-slider--liquid">
        <span class="bb-slider__icon">${this.getAttribute('icon') ?? ''}</span>${input}</div>`;
    } else if (this.variant === 'membrane') {
      this.innerHTML = `${head}<div class="bb-slider bb-slider--membrane">
        <svg viewBox="0 0 340 110" preserveAspectRatio="none" aria-hidden="true">
          <defs><linearGradient id="g-${this._uid()}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="340" y2="0">
            <stop class="bb-membrane__on"></stop><stop class="bb-membrane__off"></stop></linearGradient></defs>
          <text class="bb-membrane__value" text-anchor="middle"></text>
          <path fill="none" stroke-width="8" stroke-linecap="round"></path>
          <circle class="bb-membrane__thumb"></circle>
        </svg>${input}</div>`;
      const grad = this.querySelector('linearGradient');
      this.querySelector('path').setAttribute('stroke', `url(#${grad.id})`);
    } else {
      this.innerHTML = `<div class="bb-slider">
        <div class="bb-slider__track"></div><div class="bb-slider__thumb"></div>
        <output class="bb-slider__bubble"><span data-out></span></output>${input}</div>`;
    }

    this.box = this.querySelector('.bb-slider');
    this.input = this.querySelector('input');
    this.out = this.querySelector('[data-out]');
    this.pressed = false;
    if (this.variant === 'membrane') {
      pointerFocus(this.box);
      this.input.addEventListener('pointerdown', () => { this.pressed = true; this.render(); });
      ['pointerup', 'pointercancel', 'blur'].forEach((e) => this.input.addEventListener(e, () => { this.pressed = false; this.render(); }));
    }
    this.input.addEventListener('input', () => this.render());
    this.render();
  }
  _uid() { return Math.random().toString(36).slice(2, 9); }
  get value() { return Number(this.input?.value); }
  set value(v) { if (this.input) { this.input.value = v; this.render(); } }

  render() {
    const v = Number(this.input.value);
    const p = pct(v, this.min, this.max);
    this.box.style.setProperty('--v', p);
    if (this.out) this.out.textContent = v + this.suffix;
    if (this.variant === 'membrane') this.drawMembrane(v, p);
  }

  drawMembrane(v, p) {
    const base = 70, x = 14 + p * 3.12, dip = reduced() ? 0 : this.pressed ? 22 : 9;
    const path = this.querySelector('path'), c = this.querySelector('circle'), t = this.querySelector('text');
    path.setAttribute('d',
      `M14 ${base} L${Math.max(14, x - 70)} ${base} ` +
      `C${x - 35} ${base} ${x - 28} ${base + dip} ${x} ${base + dip} ` +
      `C${x + 28} ${base + dip} ${x + 35} ${base} ${Math.min(326, x + 70)} ${base} L326 ${base}`);
    c.setAttribute('cx', x); c.setAttribute('cy', base + dip); c.setAttribute('r', this.pressed ? 16 : 13);
    t.setAttribute('x', x); t.setAttribute('y', base + dip - 26); t.textContent = v;
    this.querySelectorAll('stop').forEach((s) => s.setAttribute('offset', x / 340));
    if (this.out) this.out.textContent = '';
  }
}

/* ---------- <bb-steps options="A,B,C" value="1" label="…"> ---------- */
class BbSteps extends HTMLElement {
  connectedCallback() {
    if (this._ready) return; this._ready = true;
    this.options = (this.getAttribute('options') ?? 'Leggera,Morbida,Media,Forte,Intensa').split(',').map((s) => s.trim());
    this.index = Number(this.getAttribute('value') ?? 0);
    const label = this.getAttribute('label') ?? 'Livello';
    const n = this.options.length, minS = 16, maxS = 46;
    const btns = this.options.map((o, i) => {
      const size = Math.round(minS + (maxS - minS) * (n === 1 ? 1 : i / (n - 1)));
      return `<button type="button" class="bb-steps__step" role="radio" aria-label="${esc(o)}"><span class="bb-steps__dot" style="--size:${size}px"></span></button>`;
    }).join('');
    this.innerHTML = `<p class="bb-label"><span>${esc(label)}: <strong data-out></strong></span></p>
      <div class="bb-steps"><div class="bb-steps__row" role="radiogroup" aria-label="${esc(label)}">${btns}</div></div>`;
    this.buttons = [...this.querySelectorAll('.bb-steps__step')];
    this.buttons.forEach((b, i) => {
      b.addEventListener('click', () => this.select(i, true));
      b.addEventListener('keydown', (e) => {
        const k = e.key; let j = null;
        if (k === 'ArrowRight' || k === 'ArrowUp') j = Math.min(n - 1, i + 1);
        if (k === 'ArrowLeft' || k === 'ArrowDown') j = Math.max(0, i - 1);
        if (k === 'Home') j = 0;
        if (k === 'End') j = n - 1;
        if (j !== null) { e.preventDefault(); this.select(j, true); this.buttons[j].focus(); }
      });
    });
    this.select(this.index, false);
  }
  get value() { return this.index; }
  set value(i) { this.select(Number(i), false); }
  select(i, emit) {
    this.index = i;
    this.buttons.forEach((b, j) => {
      b.setAttribute('aria-checked', String(j === i));
      b.tabIndex = j === i ? 0 : -1; // roving tabindex
    });
    this.querySelector('[data-out]').textContent = this.options[i];
    if (emit) this.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { index: i, label: this.options[i] } }));
  }
}

/* ---------- <bb-range min max lo hi min-gap label suffix> ---------- */
class BbRange extends HTMLElement {
  connectedCallback() {
    if (this._ready) return; this._ready = true;
    this.min = Number(this.getAttribute('min') ?? 0);
    this.max = Number(this.getAttribute('max') ?? 100);
    this.gap = Number(this.getAttribute('min-gap') ?? 4);
    this.suffix = this.getAttribute('suffix') ?? '';
    const label = this.getAttribute('label') ?? 'Intervallo';
    const lo = this.getAttribute('lo') ?? this.min, hi = this.getAttribute('hi') ?? this.max;
    const attrs = `min="${this.min}" max="${this.max}" step="${this.getAttribute('step') ?? 1}"`;
    this.innerHTML = `<p class="bb-label"><span>${esc(label)}: <strong data-out></strong></span></p>
      <div class="bb-range">
        <div class="bb-range__bridge"></div>
        <div class="bb-range__thumb bb-range__thumb--lo"></div>
        <div class="bb-range__thumb bb-range__thumb--hi"></div>
        <input class="bb-range__input" type="range" ${attrs} value="${lo}" data-end="lo" aria-label="${esc(label)} minimo">
        <input class="bb-range__input" type="range" ${attrs} value="${hi}" data-end="hi" aria-label="${esc(label)} massimo">
      </div>`;
    this.box = this.querySelector('.bb-range');
    this.lo = this.querySelector('[data-end="lo"]');
    this.hi = this.querySelector('[data-end="hi"]');
    pointerFocus(this.box);
    this.lo.addEventListener('input', () => this.sync('lo'));
    this.hi.addEventListener('input', () => this.sync('hi'));
    this.sync();
  }
  get value() { return [Number(this.lo.value), Number(this.hi.value)]; }
  sync(moved) {
    let lo = Number(this.lo.value), hi = Number(this.hi.value);
    if (moved === 'lo' && lo > hi - this.gap) { lo = hi - this.gap; this.lo.value = lo; }
    if (moved === 'hi' && hi < lo + this.gap) { hi = lo + this.gap; this.hi.value = hi; }
    const pl = pct(lo, this.min, this.max), ph = pct(hi, this.min, this.max);
    this.box.style.setProperty('--lo', pl);
    this.box.style.setProperty('--hi', ph);
    this.box.classList.toggle('is-merged', ph - pl < 16);   // le gocce si fondono
    this.querySelector('[data-out]').textContent = `${lo} – ${hi}${this.suffix}`;
    if (moved) this.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { lo, hi } }));
  }
}

customElements.define('bb-slider', BbSlider);
customElements.define('bb-steps', BbSteps);
customElements.define('bb-range', BbRange);
```

---

## 5. `index.html` (demo)

```html
<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Bubble · Slider</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600&family=Figtree:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="src/tokens.css">
  <link rel="stylesheet" href="src/slider.css">
  <script type="module" src="src/slider.js"></script>
  <style>
    body { margin: 0; background: var(--surface); color: var(--on-surface); font-family: var(--font-sans); }
    main { max-width: 960px; margin: 0 auto; padding: 48px 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px 56px; }
    h1 { grid-column: 1 / -1; margin: 0; font: 600 40px/1.1 var(--font-display); }
    section { background: var(--surface-container); padding: 24px; border-radius: 28px 28px 28px 6px; }
    h2 { margin: 0 0 16px; font: 600 20px/1.2 var(--font-display); }
  </style>
</head>
<body>
  <main>
    <h1>Bubble · Slider</h1>

    <section><h2>A · Bolla-valore</h2>
      <bb-slider label="Luminosità" value="40"></bb-slider>
    </section>

    <section><h2>B · Livello liquido</h2>
      <bb-slider variant="liquid" label="Volume" value="65" suffix="%"
        icon='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg>'></bb-slider>
    </section>

    <section><h2>C · Bolle in fila</h2>
      <bb-steps label="Intensità" options="Leggera,Morbida,Media,Forte,Intensa" value="2"></bb-steps>
    </section>

    <section><h2>D · Membrana</h2>
      <bb-slider variant="membrane" label="Tensione" value="55"></bb-slider>
    </section>

    <section><h2>E · Gocce che si fondono</h2>
      <bb-range label="Prezzo" min="0" max="100" lo="20" hi="70" suffix=" €"></bb-range>
    </section>
  </main>

  <script type="module">
    document.addEventListener('change', (e) => console.log(e.target.tagName, e.detail ?? e.target.value));
  </script>
</body>
</html>
```

---

## 6. Regole di comportamento da rispettare

- **Pressione:** in A il pomello si schiaccia (1,25 × 0,8) e la bolla del valore si gonfia e sale. In B tutta la pillola si schiaccia (1,02 × 0,9). In D la membrana affonda di 22 px (9 px a riposo). Tutto usa `--ease-spring` in `--dur-squish`.
- **Fusione (E):** quando la distanza tra i pomelli scende sotto il 16% dell'escursione, il contenitore prende `is-merged`: il ponte passa da 10 a 24 px e le gocce diventano una sola forma. La distanza minima è `min-gap` (predefinito 4).
- **Focus:** in A, B e C c'è un contorno `--primary` sul contenitore, solo da tastiera. In D ed E il focus è discreto: nessun contorno, solo un alone `--film-lilac` sul pomello attivo, e solo da tastiera. Mentre trascini con mouse o dito non compare nulla.
- **Valore:** è sempre leggibile come testo, non solo dalla posizione.
- **Area di tocco:** almeno 44 px in altezza.
- **Movimento ridotto:** con `prefers-reduced-motion` niente schiacciamenti né rimbalzi, e la membrana resta piatta.
- **Quale usare:** A di default, B su mobile, C per 3–7 valori discreti, E per gli intervalli, D al massimo una volta per schermata e mai nei form.

---

## 7. Checklist di verifica

Apri la demo con Live Server e controlla:

- [ ] Trascinando A la bolla segue il pomello, si gonfia alla pressione e il numero è corretto anche agli estremi (0 e 100).
- [ ] In B il riempimento non scende mai sotto i 64 px e l'icona resta visibile.
- [ ] In C cliccando una bolla si riempiono tutte quelle precedenti, quella scelta ha l'anello iridescente e le frecce cambiano livello.
- [ ] D si incurva sotto il pomello e affonda di più mentre premi.
- [ ] In E i pomelli non si incrociano e, avvicinandoli, il ponte si ingrossa.
- [ ] Con **Tab** compare il focus: contorno su A, B e C, alone sul pomello in D ed E. **Trascinando D ed E col mouse non compare nessun contorno.**
- [ ] Frecce, Pagina su e giù, Home e Fine funzionano su A, B, D ed E.
- [ ] Con `<html data-theme="dark">` i colori passano al tema scuro e restano leggibili.
- [ ] In DevTools → Rendering → *Emulate prefers-reduced-motion: reduce* le animazioni si spengono e la membrana resta piatta.
- [ ] Il console log mostra gli eventi `change` di C ed E con `detail`.

---

## 8. Usarlo in un framework

- **React:** importa una volta `slider.js` e i CSS, poi usa `<bb-slider label="Volume" value="40" />`. Per leggere il valore aggiungi un listener nativo tramite `ref` (`ref.current.addEventListener('input', …)`), perché React non inoltra gli eventi dei custom element in modo affidabile prima della versione 19.
- **Vue / Svelte / Angular:** i custom element funzionano direttamente. In Vue dichiara `compilerOptions.isCustomElement = tag => tag.startsWith('bb-')`, in Angular aggiungi `CUSTOM_ELEMENTS_SCHEMA`.

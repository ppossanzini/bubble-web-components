const root = document.getElementById("foundations-extra")!;

const hex = (token: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(token).trim();

const block = (title: string, description: string): HTMLElement => {
  const section = document.createElement("article");
  section.className = "foundation-block";
  section.innerHTML = `<h3>${title}</h3><p class="note">${description}</p>`;
  root.append(section);
  return section;
};

const swatch = (container: string, content: string, label: string) => {
  const cell = document.createElement("div");
  cell.className = "swatch";
  cell.style.background = `var(--md-sys-color-${container})`;
  cell.style.color = `var(--md-sys-color-${content})`;
  cell.innerHTML = `<strong>${label} · ${hex(`--md-sys-color-${container}`)}</strong><span>--md-sys-color-${container}</span><span>--md-sys-color-${content}</span>`;
  return cell;
};

const chip = (text: string, style?: (element: HTMLElement) => void) => {
  const item = document.createElement("span");
  item.className = "token-pill";
  item.textContent = text;
  style?.(item);
  return item;
};

function colourFoundation() {
  const section = block(
    "Colore",
    "Coppie di ruoli container e contenuto. L'esadecimale è letto dal DOM e cambia con il tema.",
  );
  const pairs: Array<[string, string, string]> = [
    ["primary", "on-primary", "Primary"],
    ["primary-container", "on-primary-container", "Primary container"],
    ["secondary", "on-secondary", "Secondary"],
    ["secondary-container", "on-secondary-container", "Secondary container"],
    ["tertiary", "on-tertiary", "Tertiary"],
    ["tertiary-container", "on-tertiary-container", "Tertiary container"],
    ["error", "on-error", "Error"],
    ["error-container", "on-error-container", "Error container"],
    ["surface", "on-surface", "Surface"],
    ["surface-dim", "on-surface", "Surface dim"],
    ["surface-bright", "on-surface", "Surface bright"],
    ["surface-container-lowest", "on-surface", "Container lowest"],
    ["surface-container-low", "on-surface", "Container low"],
    ["surface-container", "on-surface", "Container"],
    ["surface-container-high", "on-surface", "Container high"],
    ["surface-container-highest", "on-surface", "Container highest"],
    ["surface-variant", "on-surface-variant", "Surface variant"],
    ["inverse-surface", "inverse-on-surface", "Inverse surface"],
    ["primary-fixed", "on-primary-fixed", "Primary fixed"],
    ["primary-fixed-dim", "on-primary-fixed-variant", "Primary fixed dim"],
    ["secondary-fixed", "on-secondary-fixed", "Secondary fixed"],
    ["tertiary-fixed", "on-tertiary-fixed", "Tertiary fixed"],
  ];
  const grid = document.createElement("div");
  grid.className = "swatch-grid";
  for (const [container, content, label] of pairs)
    grid.append(swatch(container, content, label));
  for (const token of ["outline", "outline-variant"]) {
    const cell = document.createElement("div");
    cell.className = "swatch swatch-line";
    cell.innerHTML = `<strong>${token} · ${hex(`--md-sys-color-${token}`)}</strong><span class="line-sample" style="background: var(--md-sys-color-${token})"></span><span>--md-sys-color-${token}</span>`;
    grid.append(cell);
  }
  section.append(grid);
}

function shapeFoundation() {
  const section = block(
    "Forma",
    "Scala dei corner della token set 34.0.21. I passi increased e extra-extra-large appartengono a M3 Expressive.",
  );
  const row = document.createElement("div");
  row.className = "shape-row";
  for (const token of [
    "none",
    "extra-small",
    "small",
    "medium",
    "large",
    "large-increased",
    "extra-large",
    "extra-large-increased",
    "extra-extra-large",
    "full",
  ]) {
    const item = document.createElement("div");
    item.className = "shape-item";
    item.innerHTML = `<span class="shape-sample" style="border-radius: var(--md-sys-shape-corner-${token})"></span><span class="token">corner.${token}</span>`;
    row.append(item);
  }
  section.append(row);
  const note = document.createElement("p");
  note.className = "note";
  note.textContent =
    "Varianti direzionali: extra-small top, large top, large start, large end, extra-large top. Start ed end si invertono in RTL.";
  section.append(note);
}

function elevationFoundation() {
  const section = block(
    "Elevazione",
    "Sei livelli. La shadow è una proiezione di progetto dei valori dp, perché le fonti non pubblicano offset e blur. L'elevazione tonale miscela primary con surface.",
  );
  const row = document.createElement("div");
  row.className = "elevation-row";
  for (const level of [0, 1, 2, 3, 4, 5]) {
    const item = document.createElement("div");
    item.className = "elevation-item";
    item.style.boxShadow = `var(--md-sys-elevation-level${level})`;
    item.style.background =
      level === 0
        ? "var(--md-sys-color-surface-container)"
        : `var(--md-sys-elevation-tint-${level})`;
    item.innerHTML = `<strong>Level ${level}</strong><span class="token">elevation-level${level}</span>`;
    row.append(item);
  }
  section.append(row);
  const note = document.createElement("p");
  note.className = "note";
  note.textContent =
    "Livelli di riposo: 0 superficie, 1 card elevata e fogli modali, 2 menu e navigation bar, 3 dialoghi e picker. 4 e 5 non sono assegnati a riposo. Lo scrim usa il ruolo scrim al 32%.";
  section.append(note);
}

function stateFoundation() {
  const section = block(
    "Stati",
    "State layer sul colore del contenuto, indicatore di focus e valori disabilitati.",
  );
  const row = document.createElement("div");
  row.className = "state-row";
  for (const state of ["hover", "focus", "pressed", "dragged"]) {
    const item = document.createElement("div");
    item.className = "state-item";
    item.innerHTML = `<span class="state-sample" style="opacity: var(--md-sys-state-${state}-state-layer-opacity)"></span><strong>${state}</strong><span class="token">${state}-state-layer-opacity</span>`;
    row.append(item);
  }
  section.append(row);
  const focus = document.createElement("div");
  focus.className = "focus-row";
  focus.innerHTML = `<button class="focus-sample" type="button">Focus visibile</button><p class="note">Indicatore 3px, offset esterno 2px, offset interno -3px, colore secondary. Disabilitato: contenitore 12%, contenuto 38%, contorno 12%. Lo state layer misura 40px sul target di 48px.</p>`;
  section.append(focus);
}

function motionFoundation() {
  const section = block(
    "Movimento",
    "Sedici durate, curve di easing e molle Expressive. Le curve emphasized non sono esprimibili con una sola cubic-bezier sul web.",
  );
  const durations = document.createElement("div");
  durations.className = "token-row";
  for (const group of ["short", "medium", "long", "extra-long"])
    for (const index of [1, 2, 3, 4])
      durations.append(
        chip(`${group}${index}`, (element) => {
          element.style.setProperty(
            "--pill",
            `var(--md-sys-motion-duration-${group}${index})`,
          );
        }),
      );
  section.append(durations);
  const easings = document.createElement("div");
  easings.className = "token-row";
  for (const easing of [
    "standard",
    "standard-decelerate",
    "standard-accelerate",
    "emphasized",
    "emphasized-decelerate",
    "emphasized-accelerate",
    "legacy",
    "linear",
  ])
    easings.append(
      chip(easing, (element) => {
        element.style.transition = `transform var(--md-sys-motion-duration-long2) var(--md-sys-motion-easing-${easing})`;
      }),
    );
  section.append(easings);
  const note = document.createElement("p");
  note.className = "note";
  note.textContent =
    "Ogni transizione usa i token e rispetta prefers-reduced-motion. Le molle espongono damping e stiffness come token numerici.";
  section.append(note);
}

function layoutFoundation() {
  const section = block(
    "Layout",
    "Breakpoint, margini, distanza tra pane e misura di lettura. Numero di colonne e gutter sono decisioni di progetto: le fonti M3 non li pubblicano.",
  );
  const table = document.createElement("table");
  table.className = "foundation-table";
  table.innerHTML = `<caption>Breakpoint e margini</caption><thead><tr><th scope="col">Classe</th><th scope="col">Larghezza</th><th scope="col">Margine</th></tr></thead><tbody>
<tr><th scope="row">Compact</th><td>0–599px</td><td>16px</td></tr>
<tr><th scope="row">Medium</th><td>600–839px</td><td>24px</td></tr>
<tr><th scope="row">Expanded</th><td>840–1199px</td><td>24px</td></tr>
<tr><th scope="row">Large</th><td>1200–1599px</td><td>24px</td></tr>
<tr><th scope="row">Extra-large</th><td>1600px e oltre</td><td>24px</td></tr>
</tbody>`;
  section.append(table);
  const note = document.createElement("p");
  note.className = "note";
  note.textContent =
    "Distanza tra pane 24px. Misura di lettura del testo: da 40 a 60 caratteri per riga.";
  section.append(note);
}

function iconFoundation() {
  const section = block(
    "Icone",
    "Taglie dei token di sistema. Il font Material Symbols non è incluso nel pacchetto: la consegna delle icone resta una decisione di progetto.",
  );
  const row = document.createElement("div");
  row.className = "icon-row";
  for (const [size, token] of [
    ["20", "small"],
    ["24", "base"],
    ["40", "large"],
    ["48", "extra-large"],
  ]) {
    const item = document.createElement("div");
    item.className = "icon-item";
    item.innerHTML = `<span class="icon-sample" style="font-size: ${size}px">★</span><span class="token">${token} · ${size}px</span>`;
    row.append(item);
  }
  section.append(row);
  const note = document.createElement("p");
  note.className = "note";
  note.textContent =
    "Assi previsti dal sistema: fill, weight, grade, optical size. La demo usa glifi di testo finché il progetto non consegna il font.";
  section.append(note);
}

export function renderFoundations() {
  root.replaceChildren();
  colourFoundation();
  shapeFoundation();
  elevationFoundation();
  stateFoundation();
  motionFoundation();
  layoutFoundation();
  iconFoundation();
}

renderFoundations();

new MutationObserver(renderFoundations).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-theme"],
});

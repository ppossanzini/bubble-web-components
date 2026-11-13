import { COLOR_ROLES, SHAPE_TOKENS } from "./tokens.js";

export interface ComponentTokenUsage {
  colors: string[];
  shapes: string[];
  details: string[];
  typography: string[];
}

const EMPTY: ComponentTokenUsage = {
  colors: [],
  shapes: [],
  details: [],
  typography: [],
};

interface StyledConstructor {
  elementStyles?: unknown;
  styles?: unknown;
}

const cssText = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(cssText).join("\n");
  const candidate = value as { cssText?: string; styleSheet?: CSSStyleSheet };
  if (typeof candidate.cssText === "string") return candidate.cssText;
  const rules = candidate.styleSheet?.cssRules;
  if (!rules) return "";
  return Array.from(rules)
    .map((rule) => rule.cssText)
    .join("\n");
};

/** Returns the shadow CSS a component registers, shared styles included. */
const componentCss = (tag: string): string => {
  const ctor = customElements.get(tag) as StyledConstructor | undefined;
  if (!ctor) return "";
  const registered = cssText(ctor.elementStyles);
  return registered || cssText(ctor.styles);
};

const definitions = new Map<string, string>();
let definitionsLoaded = false;

const loadDefinitions = () => {
  if (definitionsLoaded) return;
  definitionsLoaded = true;
  const readRules = (list: CSSRuleList) => {
    for (const rule of Array.from(list)) {
      if (rule instanceof CSSStyleRule) {
        if (!rule.selectorText.includes(":root")) continue;
        for (const property of Array.from(rule.style))
          if (property.startsWith("--"))
            definitions.set(property, rule.style.getPropertyValue(property));
      }
      const nested = (rule as CSSGroupingRule).cssRules;
      if (nested) readRules(nested);
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      readRules(sheet.cssRules);
    } catch {
      // Cross-origin stylesheets are not readable; the local ones are.
    }
  }
};

const VAR_REFERENCE = /var\(\s*(--[a-z0-9-]+)/gi;

/** Default value declared for a token in the loaded token stylesheet. */
export function tokenDefault(token: string): string {
  loadDefinitions();
  return definitions.get(token)?.trim() ?? "";
}

/** Value the token resolves to on the document root right now. */
export function activeTokenValue(token: string): string {
  if (typeof document === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
}

/** Expands component custom properties into the system tokens they resolve to. */
const collectTokens = (css: string): Set<string> => {
  loadDefinitions();
  const pending = Array.from(css.matchAll(VAR_REFERENCE), (match) => match[1]);
  const seen = new Set<string>();
  while (pending.length > 0) {
    const token = pending.pop();
    if (!token || seen.has(token)) continue;
    seen.add(token);
    const value = definitions.get(token);
    if (value)
      pending.push(
        ...Array.from(value.matchAll(VAR_REFERENCE), (match) => match[1]),
      );
  }
  return seen;
};

const TYPESCALE = /^--md-sys-typescale-(.+?)-(font|line-height|tracking|size|weight)$/;

const cache = new Map<string, ComponentTokenUsage>();

const signature = (host: Element): string =>
  [...host.attributes]
    .map((attribute) => `${attribute.name}=${attribute.value}`)
    .sort()
    .join("&");

/** Splits a selector into the `:host(...)` conditions and the remaining part. */
const splitHost = (selector: string) => {
  const conditions: string[] = [];
  let rest = "";
  let index = 0;
  while (index < selector.length) {
    const found = selector.toLowerCase().indexOf(":host", index);
    if (found === -1) {
      rest += selector.slice(index);
      break;
    }
    rest += selector.slice(index, found);
    let cursor = found + 5;
    if (selector[cursor] === "(") {
      const start = cursor + 1;
      let depth = 0;
      for (; cursor < selector.length; cursor += 1) {
        if (selector[cursor] === "(") depth += 1;
        else if (selector[cursor] === ")") {
          depth -= 1;
          if (depth === 0) break;
        }
      }
      conditions.push(selector.slice(start, cursor));
      cursor += 1;
    }
    index = cursor;
  }
  return { conditions, rest };
};

const STATIC_PSEUDO =
  /:(?:active|hover|focus|focus-visible|focus-within|disabled|enabled|checked|selected|open|placeholder-shown)\b/gi;

const hostConditionApplies = (host: Element, condition: string): boolean => {
  const compound = condition
    .replace(/::[a-z-]+(?:\([^()]*\))?/gi, "")
    .replace(STATIC_PSEUDO, "")
    .trim();
  if (!compound) return true;
  try {
    return host.matches(compound);
  } catch {
    return true;
  }
};

type Probe = { token: string; property: string; element: Element };

export type TokenProbe = Probe;

export const SHORTHAND: Record<string, string> = {
  padding: "padding-top",
  "padding-block": "padding-block-start",
  "padding-inline": "padding-inline-start",
  margin: "margin-top",
  "margin-block": "margin-block-start",
  "margin-inline": "margin-inline-start",
  inset: "top",
  gap: "row-gap",
  "border-radius": "border-top-left-radius",
  background: "background-color",
  font: "font-size",
  outline: "outline-width",
};

/** Longhands a shorthand can win on: probing only one would miss the others. */
const LONGHANDS: Record<string, string[]> = {
  padding: [
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
  ],
  "padding-block": ["padding-block-start", "padding-block-end"],
  "padding-inline": ["padding-inline-start", "padding-inline-end"],
  margin: ["margin-top", "margin-right", "margin-bottom", "margin-left"],
  "margin-block": ["margin-block-start", "margin-block-end"],
  "margin-inline": ["margin-inline-start", "margin-inline-end"],
  inset: ["top", "right", "bottom", "left"],
  gap: ["row-gap", "column-gap"],
};

/** True when overriding the token on the element changes the used declaration. */
const probeValue = (
  element: Element,
  property: string,
  token: string,
): boolean => {
  const html = element as HTMLElement;
  if (!html.style) return true;
  const targets = LONGHANDS[property] ?? [SHORTHAND[property] ?? property];
  const before = targets.map((target) =>
    getComputedStyle(element).getPropertyValue(target),
  );
  if (before.every((value) => !value)) return true;
  const snapshot = element.getAttribute("style");
  html.style.setProperty(token, "123457px");
  const after = targets.map((target) =>
    getComputedStyle(element).getPropertyValue(target),
  );
  if (snapshot === null) element.removeAttribute("style");
  else element.setAttribute("style", snapshot);
  return after.some((value, index) => value !== before[index]);
};

const hasEffectiveUse = (token: string, probes: Probe[]): boolean => {
  const relevant = probes.filter((probe) => probe.token === token);
  if (relevant.length === 0) return true;
  const seen = new Set<string>();
  for (const probe of relevant) {
    const key = `${probe.property}|${probe.token}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (probeValue(probe.element, probe.property, probe.token)) return true;
  }
  return false;
};

/** True when at least one matched declaration of the token is not overridden. */
export const tokenIsEffective = hasEffectiveUse;

/**
 * Declarations of a rule read from its source text: CSSOM drops shorthands whose
 * value contains `var()` from `style.item()`, and those are exactly the size
 * declarations the measurement lines need.
 */
const declarationsOf = (rule: CSSStyleRule): [string, string][] => {
  const open = rule.cssText.indexOf("{");
  const close = rule.cssText.lastIndexOf("}");
  if (open < 0 || close <= open) return [];
  const body = rule.cssText.slice(open + 1, close);
  const parts: string[] = [];
  let depth = 0;
  let quote = "";
  let start = 0;
  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];
    if (quote) {
      if (char === quote && body[index - 1] !== "\\") quote = "";
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === "(") depth += 1;
    else if (char === ")") depth -= 1;
    else if (char === ";" && depth === 0) {
      parts.push(body.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(body.slice(start));
  return parts
    .map((part) => part.trim())
    .filter((part) => part && !part.includes("{"))
    .map((part) => {
      const colon = part.indexOf(":");
      if (colon < 0) return ["", ""] as [string, string];
      return [
        part.slice(0, colon).trim().toLowerCase(),
        part.slice(colon + 1).trim(),
      ] as [string, string];
    })
    .filter(([property]) => property.startsWith("--") || property.length > 0);
};

/**
 * Keeps only the rules that match the component instance, plus the declarations
 * to probe later: sibling components share a style module and would otherwise
 * leak their tokens into the panel.
 */
const matchingCss = (
  css: string,
  root: ShadowRoot,
  host: Element,
): { css: string; probes: Probe[] } => {
  let sheet: CSSStyleSheet;
  try {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
  } catch {
    return { css, probes: [] };
  }
  const parts: string[] = [];
  const probes: Probe[] = [];
  const record = (rule: CSSStyleRule, target: Element) => {
    for (const [property, value] of declarationsOf(rule))
      for (const match of value.matchAll(VAR_REFERENCE))
        probes.push({ token: match[1], property, element: target });
  };
  const visit = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) {
        let target: Element | "unknown" | null = null;
        for (const selector of rule.selectorText.split(",")) {
          const found = selectorTarget(selector.trim(), root, host);
          if (found) {
            target = found;
            break;
          }
        }
        if (target) {
          parts.push(rule.cssText);
          if (target !== "unknown") record(rule, target);
        }
        continue;
      }
      const nested = (rule as CSSGroupingRule).cssRules;
      if (nested) visit(nested);
    }
  };
  visit(sheet.cssRules);
  return { css: parts.join("\n"), probes };
};

const selectorTarget = (
  selector: string,
  root: ShadowRoot,
  host: Element,
): Element | "unknown" | null => {
  if (!selector) return "unknown";
  if (selector.includes("::slotted")) return "unknown";
  if (selector.includes(":is(") || selector.includes(":where("))
    return "unknown";
  const { conditions, rest } = splitHost(selector);
  if (!conditions.every((condition) => hostConditionApplies(host, condition)))
    return null;
  const normalized = rest
    .replace(/::[a-z-]+(?:\([^)]*\))?/gi, "")
    .replace(/:(?!host)[a-z-]+(?:\([^)]*\))?/gi, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s*[>+~]\s*/g, " ")
    .trim();
  if (!normalized) return host;
  try {
    return root.querySelector(normalized) ?? null;
  } catch {
    return null;
  }
};

/**
 * Declarations that consume a token in the rules the instance matches, with the
 * element each rule applies to. Recomputes instead of caching, because callers
 * keep the element references and a re-render replaces them.
 */
export function componentProbes(
  tag: string,
  element: Element,
): { token: string; property: string; element: Element }[] {
  const root = element.shadowRoot;
  if (!root) return [];
  const css = componentCss(tag);
  if (!css) return [];
  return matchingCss(css, root, element).probes;
}

/**
 * System tokens a component consumes, limited to the ones the editor exposes.
 * Pass the rendered element to restrict the scan to the rules its shadow DOM
 * actually matches.
 */
export function componentTokenUsage(
  tag: string,
  element?: Element,
): ComponentTokenUsage {
  const root = element?.shadowRoot;
  const ready = !!root && root.childElementCount > 0;
  const key = ready && element ? `${tag}|${signature(element)}` : "";
  const cached = ready ? cache.get(key) : undefined;
  if (cached) return cached;
  const full = componentCss(tag);
  if (!full) return EMPTY;
  const matched = ready ? matchingCss(full, root!, element!) : null;
  const css = matched?.css || full;
  const probes = matched?.probes ?? [];
  const verdicts = new Map<string, boolean>();
  const effective = (token: string): boolean => {
    if (!matched) return true;
    let verdict = verdicts.get(token);
    if (verdict === undefined) {
      verdict = hasEffectiveUse(token, probes);
      verdicts.set(token, verdict);
    }
    return verdict;
  };
  const tokens = new Set([...collectTokens(css)].filter(effective));
  const details = new Set<string>();
  for (const match of css.matchAll(VAR_REFERENCE))
    if (match[1].startsWith("--md-comp-") && effective(match[1]))
      details.add(match[1]);
  const typography = new Set<string>();
  for (const token of tokens) {
    const scale = TYPESCALE.exec(token);
    if (scale) typography.add(scale[1]);
  }

  const usage: ComponentTokenUsage = {
    colors: COLOR_ROLES.filter((role) =>
      tokens.has(`--md-sys-color-${role.token}`),
    ).map((role) => role.token),
    shapes: SHAPE_TOKENS.filter((shape) =>
      tokens.has(`--md-sys-shape-corner-${shape.token}`),
    ).map((shape) => shape.token),
    details: [...details].sort(),
    typography: [...typography].sort(),
  };
  if (ready) cache.set(key, usage);
  return usage;
}

import { SHORTHAND, componentProbes } from "./usage.js";

/** A single measurement drawn over the preview for one size token. */
export interface Quote {
  token: string;
  label: string;
  index: number;
  value: string;
  axis: "h" | "v";
  /** Measured line inside the preview. */
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Point on the line the leader starts from. */
  anchorX: number;
  anchorY: number;
  /** Badge in a side gutter. */
  badgeX: number;
  badgeY: number;
  side: "start" | "end";
  /** Box of the element the token applies to, for the hover highlight. */
  box: { x: number; y: number; width: number; height: number };
  inside: boolean;
}

/** Token name without the stylesheet prefix, the component name included. */
export const shortTokenName = (token: string, tag: string): string => {
  const component = tag.replace(/^bubble-/, "");
  const name = token.replace(/^--md-comp-/, "");
  return name.startsWith(component)
    ? name.slice(component.length).replace(/^-/, "")
    : name;
};

const LONGHANDS_FOR: Record<string, string[]> = {
  padding: ["padding-top", "padding-right", "padding-bottom", "padding-left"],
  "padding-block": ["padding-block-start", "padding-block-end"],
  "padding-inline": ["padding-inline-start", "padding-inline-end"],
  margin: ["margin-top", "margin-right", "margin-bottom", "margin-left"],
  "margin-block": ["margin-block-start", "margin-block-end"],
  "margin-inline": ["margin-inline-start", "margin-inline-end"],
  inset: ["top", "right", "bottom", "left"],
  gap: ["row-gap", "column-gap"],
};

const parse = (value: string): number | null => {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : null;
};

const axisOf = (longhand: string): "h" | "v" => {
  if (longhand === "row-gap") return "v";
  if (longhand === "column-gap") return "h";
  return /block|height|(^|-)top$|bottom|vertical/.test(longhand) ? "v" : "h";
};

/**
 * Longhands the token really moves on this element, with their used value. A
 * declaration overridden by a later rule changes nothing, so it produces no
 * measurement: this is where a line is accepted or dropped, declaration by
 * declaration, not token by token.
 */
/** Flex/grid items a container really renders: a slot stands for its content. */
const renderedItems = (element: Element): number => {
  let count = 0;
  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const child = node as Element;
      if (getComputedStyle(child).display === "none") continue;
      if (child.tagName === "SLOT") {
        const assigned = (child as HTMLSlotElement).assignedNodes({
          flatten: true,
        });
        const hasContent = assigned.some(
          (item) =>
            item.nodeType === Node.ELEMENT_NODE ||
            (item.nodeType === Node.TEXT_NODE &&
              (item.textContent ?? "").trim() !== ""),
        );
        if (hasContent) count += 1;
        continue;
      }
      const rect = child.getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) count += 1;
    } else if (
      node.nodeType === Node.TEXT_NODE &&
      (node.textContent ?? "").trim() !== ""
    )
      count += 1;
  }
  return count;
};

/** A min/max only shows when the box sits exactly on it. */
const binds = (longhand: string, value: number, rect: DOMRect): boolean => {
  const axis = /inline|width/.test(longhand) ? rect.width : rect.height;
  if (/^(min|max)-(inline|block)-size$/.test(longhand) || /^(min|max)-(width|height)$/.test(longhand))
    return Math.abs(axis - value) < 1;
  return true;
};

const resolveUsed = (
  element: Element,
  property: string,
  token: string,
): { longhand: string; length: number }[] => {
  if (property.startsWith("--")) return [];
  const targets = LONGHANDS_FOR[property] ?? [SHORTHAND[property] ?? property];
  const style = getComputedStyle(element);
  const before = targets.map((target) =>
    parse(style.getPropertyValue(target)),
  );
  if (before.every((value) => value === null)) return [];
  const html = element as HTMLElement;
  const snapshot = element.getAttribute("style");
  html.style?.setProperty(token, "123457px");
  const after = getComputedStyle(element);
  const changed = targets.map(
    (target, index) =>
      parse(after.getPropertyValue(target)) !== before[index],
  );
  if (snapshot === null) element.removeAttribute("style");
  else element.setAttribute("style", snapshot);
  const used = targets
    .map((target, index) => ({ longhand: target, length: before[index] ?? 0 }))
    .filter((_, index) => changed[index]);
  const rect = element.getBoundingClientRect();
  const visible = used.filter((entry) =>
    binds(entry.longhand, entry.length, rect),
  );
  if (visible.length === 0) return [];
  // `gap` sets both axes; only the one the flex direction separates items by is
  // visible, so the other would draw a line that measures nothing.
  let result = visible;
  if (targets.includes("row-gap") && targets.includes("column-gap")) {
    const flex = /flex/.test(style.getPropertyValue("display"));
    if (flex) {
      const wanted = style
        .getPropertyValue("flex-direction")
        .startsWith("column")
        ? "row-gap"
        : "column-gap";
      const filtered = visible.filter((entry) => entry.longhand === wanted);
      if (filtered.length > 0) result = filtered;
    }
  }
  // A gap between fewer than two items exists in the box model but shows nothing.
  if (renderedItems(element) < 2)
    result = result.filter((entry) => !/gap$/.test(entry.longhand));
  return result;
};

/** Padding describes the size of a component better than its inner gaps. */
const kindRank = (longhand: string): number => {
  if (longhand.startsWith("padding")) return 0;
  if (longhand.startsWith("margin")) return 1;
  if (/gap$/.test(longhand)) return 3;
  return 2;
};

/** Depth of an element inside the component, to prefer the outermost use. */
const depthOf = (element: Element, root: Element): number => {
  let depth = 0;
  let node: Element | null = element;
  while (node && node !== root) {
    depth += 1;
    node = node.parentElement;
  }
  return depth;
};


/**
 * Measurement lines for the size tokens that the rendered instance really uses,
 * positioned relative to the preview surface.
 */
export function componentQuotes(
  tag: string,
  element: Element,
  origin: { left: number; top: number; width: number; height: number },
  allowed: Set<string>,
): Quote[] {
  const probes = componentProbes(tag, element);
  // One candidate per declaration that really moves something.
  const candidates: {
    token: string;
    element: Element;
    longhand: string;
    length: number;
    depth: number;
  }[] = [];
  const seenRules = new Set<string>();
  for (const probe of probes) {
    if (!allowed.has(probe.token)) continue;
    const target = probe.element;
    if (!target.isConnected) continue;
    const rect = target.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) continue;
    for (const used of resolveUsed(target, probe.property, probe.token)) {
      if (used.length <= 0) continue;
      const key = `${probe.token}|${used.longhand}`;
      if (seenRules.has(key)) continue;
      seenRules.add(key);
      candidates.push({
        token: probe.token,
        element: target,
        longhand: used.longhand,
        length: used.length,
        depth: depthOf(target, element),
      });
    }
  }

  // One line per token: the outermost element it sizes, largest box on a tie.
  const best = new Map<string, (typeof candidates)[number]>();
  for (const candidate of candidates) {
    const current = best.get(candidate.token);
    if (!current) {
      best.set(candidate.token, candidate);
      continue;
    }
    const rect = candidate.element.getBoundingClientRect();
    const other = current.element.getBoundingClientRect();
    if (
      candidate.depth < current.depth ||
      (candidate.depth === current.depth &&
        (kindRank(candidate.longhand) < kindRank(current.longhand) ||
          (kindRank(candidate.longhand) === kindRank(current.longhand) &&
            rect.width * rect.height > other.width * other.height)))
    )
      best.set(candidate.token, candidate);
  }

  const quotes: Quote[] = [];
  const offsets = new Map<Element, number>();
  for (const candidate of best.values()) {
    const rect = candidate.element.getBoundingClientRect();
    const declared =
      parse(
        getComputedStyle(candidate.element)
          .getPropertyValue(candidate.token)
          .trim(),
      ) ?? candidate.length;
    if (declared <= 0) continue;
    const slot = (offsets.get(candidate.element) ?? 0) + 1;
    offsets.set(candidate.element, slot);
    const left = rect.left - origin.left;
    const top = rect.top - origin.top;
    const inside = candidate.longhand.startsWith("padding");
    const fromEnd = /-end$|bottom$|^right$/.test(candidate.longhand);
    const axis = axisOf(candidate.longhand);
    // Never longer than the box it measures: a max-width would overflow.
    const length = Math.min(declared, axis === "v" ? rect.height : rect.width);
    if (length <= 0) continue;
    const shift = inside ? (slot - 1) * 12 : 0;
    const outsideGap = 12 + Math.min(slot - 1, 3) * 6;
    let quote: Quote;
    if (axis === "v") {
      let x = inside ? left + rect.width / 2 + shift : left - outsideGap;
      // No room on the leading side: measure from the other edge.
      if (x < 2) x = left + rect.width + outsideGap;
      const y1 = inside && fromEnd ? top + rect.height - length : top;
      quote = {
        token: candidate.token,
        label: shortTokenName(candidate.token, tag),
        index: 0,
        value: `${Math.round(declared * 100) / 100}px`,
        axis: "v",
        x1: x,
        y1,
        x2: x,
        y2: y1 + length,
        anchorX: x,
        anchorY: y1 + length / 2,
        badgeX: 0,
        badgeY: 0,
        side: "start",
        box: { x: left, y: top, width: rect.width, height: rect.height },
        inside,
      };
    } else {
      let y = inside ? top + rect.height / 2 + shift : top - outsideGap;
      if (y < 2) y = top + rect.height + outsideGap;
      const x1 = inside && fromEnd ? left + rect.width - length : left;
      quote = {
        token: candidate.token,
        label: shortTokenName(candidate.token, tag),
        index: 0,
        value: `${Math.round(declared * 100) / 100}px`,
        axis: "h",
        x1,
        y1: y,
        x2: x1 + length,
        y2: y,
        anchorX: x1 + length / 2,
        anchorY: y,
        badgeX: 0,
        badgeY: 0,
        side: "start",
        box: { x: left, y: top, width: rect.width, height: rect.height },
        inside,
      };
    }
    quotes.push(quote);
    if (quotes.length >= 40) break;
  }
  placeBadges(quotes, origin);
  // Number top to bottom along each gutter, so the panel reads like the canvas.
  [...quotes]
    .sort(
      (a, b) =>
        (a.side === b.side ? 0 : a.side === "start" ? -1 : 1) ||
        a.badgeY - b.badgeY,
    )
    .forEach((quote, index) => {
      quote.index = index + 1;
    });
  return quotes;
}

const MIN_SPACING = 22;
const EDGE = 14;

/** Stacks the badges in the two side gutters, nearest to their own anchor. */
const placeBadges = (
  quotes: Quote[],
  origin: { width: number; height: number },
): void => {
  const centre = origin.width / 2;
  const start = quotes.filter((quote) => quote.anchorX < centre);
  const end = quotes.filter((quote) => quote.anchorX >= centre);
  // A gutter holds a limited number of badges: spill the excess into the other.
  const capacity = Math.max(
    1,
    Math.floor((origin.height - 2 * EDGE) / MIN_SPACING),
  );
  if (start.length > capacity) {
    start.sort((a, b) => a.anchorY - b.anchorY);
    end.push(...start.splice(capacity));
  }
  if (end.length > capacity) {
    end.sort((a, b) => a.anchorY - b.anchorY);
    start.push(...end.splice(capacity));
  }
  const stack = (list: Quote[], side: "start" | "end") => {
    list.sort((a, b) => a.anchorY - b.anchorY);
    let cursor = EDGE;
    for (const quote of list) {
      quote.side = side;
      quote.badgeY = Math.max(quote.anchorY, cursor);
      cursor = quote.badgeY + MIN_SPACING;
    }
    const overflow = cursor - MIN_SPACING - (origin.height - EDGE);
    if (overflow > 0)
      for (const quote of list)
        quote.badgeY = Math.max(EDGE, quote.badgeY - overflow);
    for (const quote of list)
      quote.badgeX = side === "start" ? 26 : origin.width - 26;
  };
  stack(start, "start");
  stack(end, "end");
}

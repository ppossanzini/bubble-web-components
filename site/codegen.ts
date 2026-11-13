export interface AttrSpec {
  /** Canonical property name, camelCase. */
  name: string;
  value?: string | number | boolean;
  /** Expression rendered as a binding instead of a literal. */
  raw?: string;
  /** Override the Vue attribute name for property-only fields. */
  vueName?: string;
}

export interface SnippetSpec {
  attrs: AttrSpec[];
  content?: string;
  vuePreamble?: string[];
  reactPreamble?: string[];
}

const kebab = (name: string) =>
  name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const quote = (value: string) => value.replace(/"/g, "&quot;");

const indent = (value: string) =>
  value
    .trim()
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");

function layout(
  tag: string,
  attrs: string[],
  content: string | undefined,
  selfClose: boolean,
): string {
  const oneLine = `<${tag}${attrs.map((attr) => ` ${attr}`).join("")}>`;
  const body = content ? `\n${indent(content)}\n` : "";
  const open =
    oneLine.length > 88 && attrs.length > 1
      ? `<${tag}\n  ${attrs.join("\n  ")}\n>`
      : oneLine;
  if (selfClose && !content) return `${open}</${tag}>`;
  return `${open}${body}</${tag}>`;
}

export function buildVue(tag: string, spec: SnippetSpec): string {
  const attrs = spec.attrs.flatMap((attr) => {
    const name = attr.vueName ?? kebab(attr.name);
    if (attr.raw !== undefined) return [`:${name}="${attr.raw}"`];
    if (attr.value === undefined || attr.value === false) return [];
    if (attr.value === true) return [name];
    return [`${name}="${quote(String(attr.value))}"`];
  });
  const markup = layout(tag, attrs, spec.content, false);
  const preamble = spec.vuePreamble?.length
    ? `<script setup lang="ts">\n${spec.vuePreamble.join("\n")}\n</script>\n\n`
    : "";
  return `${preamble}${markup}`;
}

export function buildReact(tag: string, spec: SnippetSpec): string {
  const attrs = spec.attrs.flatMap((attr) => {
    if (attr.raw !== undefined) return [`${attr.name}={${attr.raw}}`];
    if (attr.value === undefined || attr.value === false) return [];
    if (attr.value === true) return [attr.name];
    if (typeof attr.value === "number")
      return [`${attr.name}={${attr.value}}`];
    return [`${attr.name}="${quote(attr.value)}"`];
  });
  const markup = layout(tag, attrs, spec.content, true);
  const preamble = spec.reactPreamble?.length
    ? `${spec.reactPreamble.join("\n")}\n\n`
    : "";
  return `${preamble}${markup}`;
}

export const code = (value: unknown): string =>
  JSON.stringify(value, null, 2);

// Rewrites the M3 colour roles in src/tokens.css: tonal spot, but the primary palette keeps the seed chroma.
import { readFile, writeFile } from "node:fs/promises";
import {
  DynamicScheme,
  Hct,
  MaterialDynamicColors,
  SchemeTonalSpot,
  TonalPalette,
  argbFromHex,
  hexFromArgb,
} from "@material/material-color-utilities";

const SEED = process.argv[2] ?? "#5B4CF0";
const camel = (role) => role.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const scheme = (dark) => {
  const base = new SchemeTonalSpot(Hct.fromInt(argbFromHex(SEED)), dark, 0);
  return new DynamicScheme({
    sourceColorHct: base.sourceColorHct,
    variant: base.variant,
    contrastLevel: 0,
    isDark: dark,
    primaryPalette: TonalPalette.fromInt(argbFromHex(SEED)),
    secondaryPalette: base.secondaryPalette,
    tertiaryPalette: base.tertiaryPalette,
    neutralPalette: base.neutralPalette,
    neutralVariantPalette: base.neutralVariantPalette,
  });
};
const light = scheme(false);
const dark = scheme(true);

const path = "src/tokens.css";
const source = await readFile(path, "utf8");
const darkStart = source.indexOf(':root[data-theme="dark"]');
const recolor = (text, s) =>
  text.replace(/(--md-sys-color-([a-z-]+):\s*)#[0-9a-fA-F]{3,8}/g, (all, head, role) => {
    const color = MaterialDynamicColors[camel(role)];
    return color ? head + hexFromArgb(color.getArgb(s)) : all;
  });
await writeFile(
  path,
  recolor(source.slice(0, darkStart), light) + recolor(source.slice(darkStart), dark),
);
console.log(`Colour roles regenerated from seed ${SEED}.`);

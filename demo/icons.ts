import { html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import archive from "@tabler/icons/outline/archive.svg?raw";
import arrowDown from "@tabler/icons/outline/arrow-down.svg?raw";
import arrowUp from "@tabler/icons/outline/arrow-up.svg?raw";
import bold from "@tabler/icons/outline/bold.svg?raw";
import chevronDown from "@tabler/icons/outline/chevron-down.svg?raw";
import clipboard from "@tabler/icons/outline/clipboard.svg?raw";
import copy from "@tabler/icons/outline/copy.svg?raw";
import folder from "@tabler/icons/outline/folder.svg?raw";
import help from "@tabler/icons/outline/help.svg?raw";
import inbox from "@tabler/icons/outline/inbox.svg?raw";
import italic from "@tabler/icons/outline/italic.svg?raw";
import menu from "@tabler/icons/outline/menu-2.svg?raw";
import moon from "@tabler/icons/outline/moon.svg?raw";
import palette from "@tabler/icons/outline/palette.svg?raw";
import plus from "@tabler/icons/outline/plus.svg?raw";
import plane from "@tabler/icons/outline/plane.svg?raw";
import planeOff from "@tabler/icons/outline/plane-off.svg?raw";
import scissors from "@tabler/icons/outline/scissors.svg?raw";
import search from "@tabler/icons/outline/search.svg?raw";
import settings from "@tabler/icons/outline/settings.svg?raw";
import star from "@tabler/icons/outline/star.svg?raw";
import sun from "@tabler/icons/outline/sun.svg?raw";
import sunHigh from "@tabler/icons/outline/sun-high.svg?raw";
import trash from "@tabler/icons/outline/trash.svg?raw";
import underline from "@tabler/icons/outline/underline.svg?raw";
import wifi from "@tabler/icons/outline/wifi.svg?raw";
import wifiOff from "@tabler/icons/outline/wifi-off.svg?raw";

const icons: Record<string, string> = {
  archive,
  "arrow-down": arrowDown,
  "arrow-up": arrowUp,
  bold,
  "chevron-down": chevronDown,
  clipboard,
  copy,
  folder,
  help,
  inbox,
  italic,
  "menu-2": menu,
  moon,
  palette,
  plane,
  "plane-off": planeOff,
  plus,
  scissors,
  search,
  settings,
  star,
  sun,
  "sun-high": sunHigh,
  trash,
  underline,
  wifi,
  "wifi-off": wifiOff,
};

/** Tabler icon as an inline SVG so `currentColor` and the 24px sizing apply. */
export const ti = (name: keyof typeof icons | string) => {
  const svg = icons[name];
  if (!svg) throw new Error(`Unknown Tabler icon: ${name}`);
  return html`${unsafeSVG(svg)}`;
};

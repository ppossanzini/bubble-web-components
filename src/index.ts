import { BubbleMenu } from "./menu.js";
export * from "./catalogue.js";

if (!customElements.get("bubble-menu"))
  customElements.define("bubble-menu", BubbleMenu);
export { BubbleMenu };
export type {
  MenuAction,
  MenuDivider,
  MenuEntry,
  MenuSelectDetail,
  SelectionMode,
} from "./menu.types.js";

declare global {
  interface HTMLElementTagNameMap {
    "bubble-menu": BubbleMenu;
  }
}

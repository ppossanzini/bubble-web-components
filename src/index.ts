import { BolleMenu } from "./menu.js";
export * from "./catalogue.js";

if (!customElements.get("bolle-menu"))
  customElements.define("bolle-menu", BolleMenu);
export { BolleMenu };
export type {
  MenuAction,
  MenuDivider,
  MenuEntry,
  MenuSelectDetail,
  SelectionMode,
} from "./menu.types.js";

declare global {
  interface HTMLElementTagNameMap {
    "bolle-menu": BolleMenu;
  }
}

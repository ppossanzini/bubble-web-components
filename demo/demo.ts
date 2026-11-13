import "../src/index.js";
import "./showcase.js";
import "./typography.js";
import "./foundations.js";
import type { BubbleButton } from "../src/index.js";

const theme = document.getElementById("theme") as BubbleButton;
const direction = document.getElementById("direction") as BubbleButton;

theme.addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme !== "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  theme.textContent = dark ? "Tema chiaro" : "Tema scuro";
});

direction.addEventListener("click", () => {
  const rtl = document.documentElement.dir !== "rtl";
  document.documentElement.dir = rtl ? "rtl" : "ltr";
  direction.textContent = rtl ? "Direzione LTR" : "Direzione RTL";
});

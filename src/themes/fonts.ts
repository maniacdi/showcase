import { Archivo, Fraunces, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";

// next/font instances. Variable names MUST match FONT_OPTIONS[].cssVar in
// fontOptions.ts. This module pulls next/font, so import it only from server
// components (e.g. the layout) — never from stores or tests.
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const FONT_CLASSNAMES = [
  archivo.variable,
  hanken.variable,
  fraunces.variable,
  jetbrains.variable,
].join(" ");

export { DEFAULT_FONT_KEY, FONT_OPTIONS, type FontKey } from "./fontOptions";

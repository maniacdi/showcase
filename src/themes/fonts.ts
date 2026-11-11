import {
  Archivo,
  Fraunces,
  Hanken_Grotesk,
  JetBrains_Mono,
  Nunito,
  Plus_Jakarta_Sans,
  Space_Grotesk,
  Unbounded,
} from "next/font/google";

// next/font instances. Variable names MUST match FONT_OPTIONS[].cssVar in
// fontOptions.ts. This module pulls next/font, so import it only from server
// components (e.g. the layout) — never from stores or tests.
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

// Design-style fonts (see styles/_design-styles.scss). Not preloaded: only
// fetched when a style that uses them is active.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
  preload: false,
});
const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
  preload: false,
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  preload: false,
});
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap", preload: false });

export const FONT_CLASSNAMES = [
  archivo.variable,
  hanken.variable,
  fraunces.variable,
  jetbrains.variable,
  spaceGrotesk.variable,
  unbounded.variable,
  jakarta.variable,
  nunito.variable,
].join(" ");

export { DEFAULT_FONT_KEY, FONT_OPTIONS, type FontKey } from "./fontOptions";

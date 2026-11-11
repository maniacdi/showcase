"use client";

import { useEffect } from "react";
import { FONT_OPTIONS } from "@/themes/fontOptions";
import { isDesignStyle } from "@/themes/designStyles";
import { usePrefsStore } from "@/store/usePrefsStore";

export default function PrefsApplier() {
  const colorScheme = usePrefsStore((s) => s.colorScheme);
  const font = usePrefsStore((s) => s.font);
  const style = usePrefsStore((s) => s.style);
  const setStyle = usePrefsStore((s) => s.setStyle);

  // Shareable links: ?style=brutalism wins over the persisted choice once.
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("style");
    if (isDesignStyle(param)) setStyle(param);
  }, [setStyle]);

  useEffect(() => {
    document.documentElement.setAttribute("data-color-scheme", colorScheme);
  }, [colorScheme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-style", style);
  }, [style]);

  useEffect(() => {
    const option = FONT_OPTIONS.find((o) => o.key === font) ?? FONT_OPTIONS[0];
    document.documentElement.style.setProperty("--font-sans", `var(${option.cssVar})`);
  }, [font]);

  return null;
}

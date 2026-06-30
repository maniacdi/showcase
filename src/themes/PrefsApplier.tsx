"use client";

import { useEffect } from "react";
import { FONT_OPTIONS } from "@/themes/fontOptions";
import { usePrefsStore } from "@/store/usePrefsStore";

export default function PrefsApplier() {
  const colorScheme = usePrefsStore((s) => s.colorScheme);
  const font = usePrefsStore((s) => s.font);

  useEffect(() => {
    document.documentElement.setAttribute("data-color-scheme", colorScheme);
  }, [colorScheme]);

  useEffect(() => {
    const option = FONT_OPTIONS.find((o) => o.key === font) ?? FONT_OPTIONS[0];
    document.documentElement.style.setProperty("--font-sans", `var(${option.cssVar})`);
  }, [font]);

  return null;
}

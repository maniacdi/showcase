"use client";

import { useCallback } from "react";
import { usePrefsStore } from "@/store/usePrefsStore";
import type { DesignStyleKey } from "@/themes/designStyles";

let timer: number | undefined;

/** Switch design style with a short global cross-fade (skipped on reduced motion). */
export function useSwitchStyle() {
  const setStyle = usePrefsStore((s) => s.setStyle);

  return useCallback(
    (key: DesignStyleKey) => {
      const root = document.documentElement;
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (!reduce) {
        root.classList.add("style-switching");
        window.clearTimeout(timer);
        timer = window.setTimeout(() => root.classList.remove("style-switching"), 450);
      }
      setStyle(key);
    },
    [setStyle],
  );
}

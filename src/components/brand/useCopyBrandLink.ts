"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { shareUrl } from "@/themes/brand";
import { useBrandStore } from "@/store/useBrandStore";
import { usePrefsStore } from "@/store/usePrefsStore";

export type CopyState = "idle" | "copied" | "manual";

/**
 * Copies the current page URL with ?brand= (+ ?style=) to the clipboard.
 * When the Clipboard API is unavailable (http, old browsers) it returns the
 * link so the UI can show it in a selectable field instead ("manual").
 */
export function useCopyBrandLink() {
  const [state, setState] = useState<CopyState>("idle");
  const [link, setLink] = useState("");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    const brand = useBrandStore.getState().brand;
    if (!brand) return;
    const url = shareUrl(window.location.href, brand, usePrefsStore.getState().style);
    setLink(url);
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("manual");
    }
  }, []);

  return { copy, state, link };
}

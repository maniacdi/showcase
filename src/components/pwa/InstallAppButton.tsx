"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./InstallAppButton.module.scss";

/** Chromium's install prompt event (not in lib.dom yet). */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * "Instalar app": shown only when the browser fires `beforeinstallprompt`
 * (Chromium). iOS Safari has no prompt, so it gets a short how-to instead.
 * Renders nothing when already running as an installed app.
 */
export default function InstallAppButton() {
  const t = useTranslations("pwa");
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;

    const ua = navigator.userAgent;
    const isIos =
      /iphone|ipad|ipod/i.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIos(isIos);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setPrompt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (prompt) {
    return (
      <button
        type="button"
        className={styles.button}
        onClick={async () => {
          await prompt.prompt();
          await prompt.userChoice;
          setPrompt(null);
        }}
      >
        {t("install")}
      </button>
    );
  }
  if (ios) return <p className={styles.hint}>{t("iosHint")}</p>;
  return null;
}

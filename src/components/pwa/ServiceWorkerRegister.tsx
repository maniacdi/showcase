"use client";

import { useEffect } from "react";

/**
 * Registers public/sw.js. Production only, so dev HMR chunks are never
 * cached; `?sw=1` forces it in dev for testing and `?sw=0` unregisters it.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const flag = new URLSearchParams(window.location.search).get("sw");
    if (flag === "0") {
      void navigator.serviceWorker
        .getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())));
      return;
    }
    if (process.env.NODE_ENV !== "production" && flag !== "1") return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        /* offline support is a progressive enhancement */
      });
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);
  return null;
}

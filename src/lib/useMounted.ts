"use client";

import { useEffect, useState } from "react";

/** false during SSR and the hydration render, true after mount. Use it to read
 *  persisted (localStorage) state without hydration mismatches. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

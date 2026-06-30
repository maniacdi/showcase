import type { CSSProperties, ReactNode } from "react";
import { themes, type ThemeName } from "./themes";

export default function ThemeProvider({
  theme,
  children,
}: {
  theme: ThemeName;
  children: ReactNode;
}) {
  const t = themes[theme];
  const style = {
    "--accent": t.accent,
    "--accent-ink": t.accentInk,
  } as CSSProperties;
  return (
    <div data-theme={theme} style={style}>
      {children}
    </div>
  );
}

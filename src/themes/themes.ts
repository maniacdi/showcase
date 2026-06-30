export type ThemeName = "servicios" | "tienda" | "reservas" | "admin";

export const themes: Record<ThemeName, { accent: string; accentInk: string }> = {
  servicios: { accent: "#1f4fff", accentInk: "#ffffff" },
  tienda: { accent: "#0e7c5a", accentInk: "#ffffff" },
  reservas: { accent: "#c2410c", accentInk: "#ffffff" },
  admin: { accent: "#16181d", accentInk: "#ffffff" },
};

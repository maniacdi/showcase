// Real projects shown on the hub. Copy (name/desc) lives in messages under
// `projects.<key>`; here only structure. Add `url` when a project is public.

export type ProjectKind = "web" | "mobile" | "client";

export interface Proyecto {
  key: "portfolio" | "clinica" | "boda" | "ironlog" | "compras";
  kind: ProjectKind;
  stack: string[];
  url?: string;
  featured?: boolean;
}

export const proyectos: Proyecto[] = [
  {
    key: "portfolio",
    kind: "web",
    stack: ["Next.js 16", "TypeScript", "Framer Motion", "Zustand", "Groq AI", "Sentry", "Cypress"],
    url: "https://javimagaldi.com",
    featured: true,
  },
  {
    key: "clinica",
    kind: "client",
    stack: ["Next.js 16", "Drizzle", "Neon Postgres", "Resend", "Tailwind", "Shopify"],
    url: "https://umedicinaestetica.com",
  },
  {
    key: "boda",
    kind: "web",
    stack: ["React", "Vite", "Supabase", "TypeScript"],
  },
  {
    key: "ironlog",
    kind: "mobile",
    stack: ["Expo", "React Native", "AsyncStorage", "SVG charts"],
  },
  {
    key: "compras",
    kind: "mobile",
    stack: ["Expo", "React Native", "Socket.io", "Node API"],
  },
];

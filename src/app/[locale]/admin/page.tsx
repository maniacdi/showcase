import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";
import { setRequestLocale } from "next-intl/server";
import RequireAuth from "@/lib/auth/RequireAuth";
import ThemeProvider from "@/themes/ThemeProvider";
import AdminDashboard from "./AdminDashboard";

export const metadata: Metadata = { title: "Panel de administración", robots: NOINDEX };

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ThemeProvider theme="admin">
      <RequireAuth role="admin">
        <AdminDashboard />
      </RequireAuth>
    </ThemeProvider>
  );
}

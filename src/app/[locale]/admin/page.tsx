import { setRequestLocale } from "next-intl/server";
import RequireAuth from "@/lib/auth/RequireAuth";
import ThemeProvider from "@/themes/ThemeProvider";
import AdminDashboard from "./AdminDashboard";

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

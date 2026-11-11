import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo";
import { setRequestLocale } from "next-intl/server";
import AuthFlow from "@/components/auth/AuthFlow";

export const metadata: Metadata = { title: "Crear cuenta", robots: NOINDEX };

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AuthFlow initialMode="register" />;
}

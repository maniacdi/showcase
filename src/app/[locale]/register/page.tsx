import { setRequestLocale } from "next-intl/server";
import AuthFlow from "@/components/auth/AuthFlow";

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AuthFlow initialMode="register" />;
}

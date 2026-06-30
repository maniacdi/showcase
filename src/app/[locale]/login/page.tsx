import { setRequestLocale } from "next-intl/server";
import AuthFlow from "@/components/auth/AuthFlow";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AuthFlow initialMode="login" />;
}

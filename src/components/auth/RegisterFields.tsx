"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import Button from "@/components/ui/Button/Button";
import Field from "@/components/ui/Field/Field";
import Input from "@/components/ui/Input/Input";
import { useAuth } from "@/lib/auth/useAuth";
import styles from "./auth.module.scss";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.?[^\s@]*$/;

export default function RegisterFields({ onSwitch }: { onSwitch: () => void }) {
  const t = useTranslations("auth");
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !EMAIL_RE.test(email) || password.length < 3) {
      setError(t("errorFields"));
      return;
    }
    const res = register(name, email, password);
    if (!res.ok) {
      setError(res.error === "exists" ? t("errorExists") : t("errorFields"));
      return;
    }
    router.replace("/");
  }

  return (
    <div className={styles.fields}>
      <h1 className={styles.title}>{t("registerTitle")}</h1>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <Field label={t("name")} htmlFor="reg-name">
          <Input id="reg-name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={t("email")} htmlFor="reg-email">
          <Input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label={t("password")} htmlFor="reg-password" error={error ?? undefined}>
          <Input
            id="reg-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Button type="submit">{t("register")}</Button>
      </form>

      <button type="button" className={styles.mobileSwitch} onClick={onSwitch}>
        {t("hasAccount")}
      </button>
    </div>
  );
}

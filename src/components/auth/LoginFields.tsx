"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import Button from "@/components/ui/Button/Button";
import Field from "@/components/ui/Field/Field";
import Input from "@/components/ui/Input/Input";
import { useAuth } from "@/lib/auth/useAuth";
import styles from "./auth.module.scss";

const DEMO_USERS = ["admin@demo", "user@demo"] as const;

export default function LoginFields({ onSwitch }: { onSwitch: () => void }) {
  const t = useTranslations("auth");
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = login(email, password);
    if (!res.ok) {
      setError(t("errorInvalid"));
      return;
    }
    router.replace("/admin");
  }

  return (
    <div className={styles.fields}>
      <div className={styles.headBlock}>
        <span className={styles.eyebrow}>{t("loginEyebrow")}</span>
        <h1 className={styles.title}>{t("loginTitle")}</h1>
        <p className={styles.subtitle}>{t("loginSub")}</p>
      </div>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <Field label={t("email")} htmlFor="login-email">
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label={t("password")} htmlFor="login-password" error={error ?? undefined}>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Button type="submit" className={styles.submit}>
          {t("login")}
        </Button>
      </form>

      <span className={styles.divider}>{t("or")}</span>

      <Button
        variant="outline"
        className={styles.google}
        onClick={() => {
          loginWithGoogle();
          router.replace("/");
        }}
      >
        {t("google")}
      </Button>

      <button type="button" className={styles.mobileSwitch} onClick={onSwitch}>
        {t("noAccount")}
      </button>
      <div className={styles.hint}>
        <span>{t("demoLabel")}</span>
        {DEMO_USERS.map((u) => (
          <button
            key={u}
            type="button"
            className={styles.demoUser}
            onClick={() => {
              setEmail(u);
              setPassword("demo");
              setError(null);
            }}
          >
            {u}
          </button>
        ))}
        <span>{t("demoPassword")}</span>
      </div>
    </div>
  );
}

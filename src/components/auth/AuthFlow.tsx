"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Brand from "@/components/layout/Brand/Brand";
import LoginFields from "./LoginFields";
import RegisterFields from "./RegisterFields";
import styles from "./auth.module.scss";

type Mode = "login" | "register";

export default function AuthFlow({ initialMode }: { initialMode: Mode }) {
  const t = useTranslations("auth");
  const [mode, setMode] = useState<Mode>(initialMode);

  const toLogin = () => setMode("login");
  const toRegister = () => setMode("register");

  return (
    <main
      className={`${styles.stage} ${mode === "login" ? styles.modeLogin : styles.modeRegister}`}
    >
      <Link href="/" className={styles.back}>
        <svg
          className={styles.backIcon}
          viewBox="0 0 16 16"
          width="16"
          height="16"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span>{t("backHome")}</span>
      </Link>

      <section className={`${styles.col} ${styles.colLogin}`} aria-hidden={mode !== "login"}>
        <LoginFields onSwitch={toRegister} />
      </section>

      <section className={`${styles.col} ${styles.colRegister}`} aria-hidden={mode !== "register"}>
        <RegisterFields onSwitch={toLogin} />
      </section>

      {/* Sliding brand panel (desktop) */}
      <aside className={styles.overlay}>
        <div className={styles.grid} aria-hidden="true" />
        <div className={styles.panelTop}>
          <Brand />
        </div>
        <div className={styles.panelMid}>
          <span className={styles.lead}>{t("panelLead")}</span>
          <span className={styles.cycler}>
            <span className={styles.cyclerInner}>
              <b>{t("panelW1")}</b>
              <b>{t("panelW2")}</b>
              <b>{t("panelW3")}</b>
              <b>{t("panelW1")}</b>
            </span>
          </span>
        </div>
        <div className={styles.panelBottom}>
          <span className={styles.prompt}>
            {mode === "login" ? t("promptToRegister") : t("promptToLogin")}
          </span>
          <button
            type="button"
            className={styles.switch}
            onClick={mode === "login" ? toRegister : toLogin}
          >
            {mode === "login" ? t("ctaToRegister") : t("ctaToLogin")}
          </button>
        </div>
      </aside>
    </main>
  );
}

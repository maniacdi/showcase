"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button/Button";
import Field from "@/components/ui/Field/Field";
import Input from "@/components/ui/Input/Input";
import Modal from "@/components/ui/Modal/Modal";
import Textarea from "@/components/ui/Textarea/Textarea";
import { plans } from "@/data/servicios";
import { SITE } from "@/config/site";
import { buildMailto } from "@/lib/contact";
import { useBudgetStore } from "@/store/useBudgetStore";
import styles from "./BudgetModal.module.scss";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.?[^\s@]*$/;
const RANGES = ["< 200 €", "200–500 €", "500–1.000 €", "> 1.000 €"];

export default function BudgetModal() {
  const t = useTranslations("budget");
  const open = useBudgetStore((s) => s.open);
  const planFromStore = useBudgetStore((s) => s.plan);
  const close = useBudgetStore((s) => s.close);

  const [plan, setPlan] = useState("");
  const [range, setRange] = useState(RANGES[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open) {
      setPlan(planFromStore ?? "");
      setSent(false);
      setError(null);
    }
  }, [open, planFromStore]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !EMAIL_RE.test(email)) {
      setError(t("errorFields"));
      return;
    }
    // Real: open the user's email client prefilled (no backend).
    window.location.href = buildMailto(SITE.contactEmail, "[Showcase] Solicitud de presupuesto", [
      `Plan de interés: ${plan || t("planNone")}`,
      `Presupuesto: ${range}`,
      `Nombre: ${name}`,
      `Email: ${email}`,
      "",
      details,
    ]);
    setSent(true);
  }

  return (
    <Modal open={open} onClose={close} title={t("title")}>
      {sent ? (
        <p className={styles.sent} role="status">
          {t("sent")}
        </p>
      ) : (
        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <p className={styles.intro}>{t("intro")}</p>

          <Field label={t("plan")} htmlFor="b-plan">
            <select
              id="b-plan"
              className={styles.select}
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            >
              <option value="">{t("planNone")}</option>
              {plans.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("budgetLabel")} htmlFor="b-range">
            <select
              id="b-range"
              className={styles.select}
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              {RANGES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("name")} htmlFor="b-name">
            <Input id="b-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label={t("email")} htmlFor="b-email" error={error ?? undefined}>
            <Input id="b-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label={t("details")} htmlFor="b-details">
            <Textarea id="b-details" value={details} onChange={(e) => setDetails(e.target.value)} />
          </Field>

          <Button type="submit">{t("send")}</Button>
        </form>
      )}
    </Modal>
  );
}

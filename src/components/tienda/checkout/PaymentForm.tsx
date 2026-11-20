"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button/Button";
import Field from "@/components/ui/Field/Field";
import Input from "@/components/ui/Input/Input";
import { formatPrice } from "@/lib/cart";
import {
  type CardErrors,
  type CardValues,
  type PaymentMethod,
  formatCardNumber,
  formatExpiry,
  isValidBizumPhone,
  validateCard,
} from "@/lib/checkout";
import styles from "./checkout.module.scss";

const CARD_ERROR: Record<keyof CardValues, string> = {
  holder: "errRequired",
  number: "errCard",
  expiry: "errExpiry",
  cvc: "errCvc",
};

export interface PaymentResult {
  method: PaymentMethod;
  /** Last 4 digits only; the full number never leaves this component. */
  cardLast4?: string;
}

/**
 * Simulated payment. Card data lives only in this component's state (memory):
 * it is never persisted, never sent anywhere and is dropped on unmount. Only
 * the last 4 digits are handed to the order.
 */
export default function PaymentForm({
  total,
  defaultPhone,
  defaultHolder,
  onBack,
  onPay,
}: {
  total: number;
  defaultPhone: string;
  defaultHolder: string;
  onBack: () => void;
  onPay: (r: PaymentResult) => void;
}) {
  const t = useTranslations("checkout");
  const [method, setMethod] = useState<PaymentMethod>("tarjeta");
  const [card, setCard] = useState<CardValues>({
    holder: defaultHolder,
    number: "",
    expiry: "",
    cvc: "",
  });
  const [phone, setPhone] = useState(defaultPhone);
  const [errors, setErrors] = useState<CardErrors>({});
  const [phoneError, setPhoneError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const setField = (k: keyof CardValues, v: string) => {
    const next = { ...card, [k]: v };
    setCard(next);
    if (submitted) setErrors(validateCard(next, new Date()));
  };
  const err = (k: keyof CardValues) => (errors[k] ? t(CARD_ERROR[k]) : undefined);

  function submit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (method === "tarjeta") {
      const found = validateCard(card, new Date());
      setErrors(found);
      const first = (Object.keys(found) as (keyof CardValues)[])[0];
      if (first) {
        document.getElementById(`card-${first}`)?.focus();
        return;
      }
    } else {
      const bad = !isValidBizumPhone(phone);
      setPhoneError(bad);
      if (bad) {
        document.getElementById("bizum-phone")?.focus();
        return;
      }
    }
    setProcessing(true);
    const last4 = method === "tarjeta" ? card.number.replace(/\D/g, "").slice(-4) : undefined;
    // Short pause so the "processing" state reads as a payment step.
    timer.current = window.setTimeout(() => {
      setCard({ holder: "", number: "", expiry: "", cvc: "" });
      onPay({ method, ...(last4 ? { cardLast4: last4 } : {}) });
    }, 700);
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate aria-busy={processing}>
      <div className={styles.notice} role="note">
        <span className={styles.noticeStrong}>{t("simulatedNotice")}</span>
        <span className={styles.noticeText}>{t("testCard")}</span>
      </div>

      <fieldset className={styles.fieldset} disabled={processing}>
        <legend className={styles.legend}>{t("payMethodLegend")}</legend>
        <div className={`${styles.options} ${styles.options2}`}>
          {(["tarjeta", "bizum"] as const).map((m) => (
            <label key={m} className={styles.option}>
              <input
                type="radio"
                name="pay-method"
                value={m}
                checked={method === m}
                onChange={() => setMethod(m)}
              />
              <span className={styles.optionBody}>
                <span className={styles.optionName}>
                  {m === "tarjeta" ? t("payCard") : t("payBizum")}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {method === "tarjeta" ? (
        <div className={styles.fields}>
          <div className={styles.full}>
            <Field label={t("cardHolder")} htmlFor="card-holder" error={err("holder")}>
              <Input
                id="card-holder"
                value={card.holder}
                onChange={(e) => setField("holder", e.target.value)}
                autoComplete="off"
                aria-invalid={errors.holder ? true : undefined}
                disabled={processing}
              />
            </Field>
          </div>
          <div className={styles.full}>
            <Field label={t("cardNumber")} htmlFor="card-number" error={err("number")}>
              <Input
                id="card-number"
                className={styles.mono}
                value={card.number}
                onChange={(e) => setField("number", formatCardNumber(e.target.value))}
                inputMode="numeric"
                // Demo: keep the browser from offering (or saving) a real card.
                autoComplete="off"
                placeholder="4242 4242 4242 4242"
                aria-invalid={errors.number ? true : undefined}
                disabled={processing}
              />
            </Field>
          </div>
          <Field label={t("cardExpiry")} htmlFor="card-expiry" error={err("expiry")}>
            <Input
              id="card-expiry"
              className={styles.mono}
              value={card.expiry}
              onChange={(e) => setField("expiry", formatExpiry(e.target.value))}
              inputMode="numeric"
              autoComplete="off"
              placeholder="MM/AA"
              maxLength={5}
              aria-invalid={errors.expiry ? true : undefined}
              disabled={processing}
            />
          </Field>
          <Field label={t("cardCvc")} htmlFor="card-cvc" error={err("cvc")}>
            <Input
              id="card-cvc"
              className={styles.mono}
              value={card.cvc}
              onChange={(e) => setField("cvc", e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              aria-invalid={errors.cvc ? true : undefined}
              disabled={processing}
            />
          </Field>
        </div>
      ) : (
        <div className={styles.fields}>
          <Field
            label={t("bizumPhone")}
            htmlFor="bizum-phone"
            error={phoneError ? t("errBizum") : undefined}
          >
            <Input
              id="bizum-phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (submitted) setPhoneError(!isValidBizumPhone(e.target.value));
              }}
              inputMode="tel"
              autoComplete="tel"
              aria-invalid={phoneError ? true : undefined}
              aria-describedby="bizum-hint"
              disabled={processing}
            />
            <span id="bizum-hint" className={styles.hint}>
              {t("bizumHint")}
            </span>
          </Field>
        </div>
      )}

      <div className={styles.actions}>
        <Button type="submit" disabled={processing}>
          {processing ? t("processing") : t("pay", { amount: formatPrice(total) })}
        </Button>
        <Button type="button" variant="ghost" onClick={onBack} disabled={processing}>
          {t("back")}
        </Button>
      </div>
      <p className={styles.srOnly} role="status">
        {processing ? t("processing") : ""}
      </p>
    </form>
  );
}

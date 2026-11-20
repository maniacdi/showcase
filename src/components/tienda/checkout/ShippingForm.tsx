"use client";

import { type FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button/Button";
import Field from "@/components/ui/Field/Field";
import Input from "@/components/ui/Input/Input";
import { formatPrice } from "@/lib/cart";
import {
  FREE_SHIPPING_FROM,
  SHIPPING_METHODS,
  type ShippingErrors,
  type ShippingValues,
  shippingCost,
  validateShipping,
} from "@/lib/checkout";
import styles from "./checkout.module.scss";

const ERROR_KEY: Record<keyof ShippingValues, string> = {
  name: "errRequired",
  email: "errEmail",
  address: "errRequired",
  city: "errRequired",
  postalCode: "errPostal",
  phone: "errPhone",
  method: "errRequired",
};

export default function ShippingForm({
  values,
  onChange,
  subtotal,
  onBack,
  onNext,
}: {
  values: ShippingValues;
  onChange: (v: ShippingValues) => void;
  subtotal: number;
  onBack: () => void;
  onNext: () => void;
}) {
  const t = useTranslations("checkout");
  const [errors, setErrors] = useState<ShippingErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof ShippingValues>(k: K, v: ShippingValues[K]) => {
    const next = { ...values, [k]: v };
    onChange(next);
    if (submitted) setErrors(validateShipping(next));
  };
  const err = (k: keyof ShippingValues) => (errors[k] ? t(ERROR_KEY[k]) : undefined);
  const pickup = values.method === "recogida";

  function submit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const found = validateShipping(values);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      onNext();
      return;
    }
    const first = (Object.keys(found) as (keyof ShippingValues)[])[0];
    document.getElementById(`ship-${first}`)?.focus();
  }

  const text = (
    k: "name" | "email" | "address" | "city" | "postalCode" | "phone",
    extra: object = {},
  ) => (
    <Input
      id={`ship-${k}`}
      value={values[k]}
      onChange={(e) => set(k, e.target.value)}
      aria-invalid={errors[k] ? true : undefined}
      {...extra}
    />
  );

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{t("methodLegend")}</legend>
        <div className={styles.options}>
          {SHIPPING_METHODS.map((m) => {
            const price = shippingCost(m.id, subtotal);
            return (
              <label key={m.id} className={styles.option}>
                <input
                  type="radio"
                  name="ship-method"
                  value={m.id}
                  checked={values.method === m.id}
                  onChange={() => set("method", m.id)}
                />
                <span className={styles.optionBody}>
                  <span className={styles.optionName}>{t(`method_${m.id}`)}</span>
                  <span className={styles.optionMeta}>{t("methodDays", { days: m.days })}</span>
                  <span className={styles.optionPrice}>
                    {price === 0 ? t("free") : formatPrice(price)}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        <p className={styles.hint}>{t("freeFrom", { amount: formatPrice(FREE_SHIPPING_FROM) })}</p>
      </fieldset>

      <div className={styles.fields}>
        <Field label={t("name")} htmlFor="ship-name" error={err("name")}>
          {text("name", { autoComplete: "name" })}
        </Field>
        <Field label={t("email")} htmlFor="ship-email" error={err("email")}>
          {text("email", { type: "email", autoComplete: "email", inputMode: "email" })}
        </Field>
        {pickup ? null : (
          <>
            <div className={styles.full}>
              <Field label={t("address")} htmlFor="ship-address" error={err("address")}>
                {text("address", { autoComplete: "street-address" })}
              </Field>
            </div>
            <Field label={t("city")} htmlFor="ship-city" error={err("city")}>
              {text("city", { autoComplete: "address-level2" })}
            </Field>
            <Field label={t("postalCode")} htmlFor="ship-postalCode" error={err("postalCode")}>
              {text("postalCode", {
                autoComplete: "postal-code",
                inputMode: "numeric",
                maxLength: 5,
                "aria-describedby": "ship-postal-hint",
              })}
              <span id="ship-postal-hint" className={styles.hint}>
                {t("postalHint")}
              </span>
            </Field>
          </>
        )}
        <Field label={t("phone")} htmlFor="ship-phone" error={err("phone")}>
          {text("phone", { type: "tel", autoComplete: "tel", inputMode: "tel" })}
        </Field>
      </div>

      {submitted && Object.keys(errors).length > 0 ? (
        <p className={styles.formError}>{t("fixErrors")}</p>
      ) : null}

      <div className={styles.actions}>
        <Button type="submit">{t("continuePayment")}</Button>
        <Button type="button" variant="ghost" onClick={onBack}>
          {t("back")}
        </Button>
      </div>
    </form>
  );
}

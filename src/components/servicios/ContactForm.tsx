"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button/Button";
import Field from "@/components/ui/Field/Field";
import Input from "@/components/ui/Input/Input";
import Textarea from "@/components/ui/Textarea/Textarea";
import { validateContact, type ContactErrors } from "@/lib/validation";
import { buildMailto } from "@/lib/contact";
import { SITE } from "@/config/site";
import styles from "./ContactForm.module.scss";

export default function ContactForm() {
  const t = useTranslations("servicios");
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      window.location.href = buildMailto(SITE.contactEmail, "[Showcase] Contacto", [
        `Nombre: ${values.name}`,
        `Email: ${values.email}`,
        "",
        values.message,
      ]);
      setSent(true);
      setValues({ name: "", email: "", message: "" });
    }
  }

  if (sent) {
    return (
      <p className={styles.sent} role="status">
        {t("formSent")}
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <Field label={t("formName")} htmlFor="name" error={errors.name && t("formName")}>
        <Input
          id="name"
          name="name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
      </Field>
      <Field label={t("formEmail")} htmlFor="email" error={errors.email && t("formEmail")}>
        <Input
          id="email"
          name="email"
          type="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
      </Field>
      <Field label={t("formMessage")} htmlFor="message" error={errors.message && t("formMessage")}>
        <Textarea
          id="message"
          name="message"
          value={values.message}
          onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
        />
      </Field>
      <Button type="submit">{t("formSend")}</Button>
    </form>
  );
}

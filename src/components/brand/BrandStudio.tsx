"use client";

import { useId, useState, type ChangeEvent, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import btn from "@/components/ui/Button/Button.module.scss";
import Button from "@/components/ui/Button/Button";
import Field from "@/components/ui/Field/Field";
import Input from "@/components/ui/Input/Input";
import { downscaleImage } from "@/lib/downscaleImage";
import { useMounted } from "@/lib/useMounted";
import { useBrandStore } from "@/store/useBrandStore";
import {
  BRAND_FONT_KEYS,
  BRAND_NAME_MAX,
  BRAND_PRESETS,
  BUSINESS_TYPES,
  DEFAULT_BRAND,
  LIGHT_PAPER,
  contrastRatio,
  normalizeHex,
  pickInk,
  type BrandFontKey,
} from "@/themes/brand";
import { DESIGN_STYLES } from "@/themes/designStyles";
import BrandPreview from "./BrandPreview";
import { useCopyBrandLink } from "./useCopyBrandLink";
import styles from "./BrandStudio.module.scss";

const VERTICALS = [
  { href: "/servicios", key: "seeServicios" },
  { href: "/tienda", key: "seeTienda" },
  { href: "/reservas", key: "seeReservas" },
] as const;

/**
 * /marca: every change is written to useBrandStore immediately, so the whole
 * site (this page's header and footer included) re-brands live.
 */
export default function BrandStudio() {
  const t = useTranslations("brand");
  const mounted = useMounted();
  const stored = useBrandStore((s) => s.brand);
  const storedLogo = useBrandStore((s) => s.logo);
  const patch = useBrandStore((s) => s.patch);
  const setLogo = useBrandStore((s) => s.setLogo);
  const reset = useBrandStore((s) => s.reset);
  const { copy, state: copyState, link } = useCopyBrandLink();

  // Persisted state is client-only: render defaults until mounted (no mismatch).
  const brand = mounted ? stored : null;
  const logo = mounted ? storedLogo : null;
  const cfg = brand ?? DEFAULT_BRAND;

  const [logoError, setLogoError] = useState("");
  const [status, setStatus] = useState("");
  const id = useId();

  const color = normalizeHex(cfg.color) ?? DEFAULT_BRAND.color;
  const ink = pickInk(color);
  const lowText = contrastRatio(color, LIGHT_PAPER) < 3;
  const displayName = cfg.name.trim() || t("fallbackName");

  const update = (partial: Parameters<typeof patch>[0]) => {
    setStatus("");
    patch(partial);
  };

  async function onLogo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLogoError("");
    try {
      const dataUrl = await downscaleImage(file, 256);
      if (!useBrandStore.getState().brand) patch({});
      setLogo(dataUrl);
    } catch (err) {
      setLogoError(err instanceof Error && err.message === "too-big" ? t("logoTooBig") : t("logoError"));
    }
  }

  function onReset() {
    reset();
    setLogoError("");
    setStatus(t("resetDone"));
  }

  return (
    <div className={styles.studio}>
      <form
        className={styles.form}
        aria-labelledby={`${id}-form`}
        onSubmit={(e) => e.preventDefault()}
      >
        <h2 id={`${id}-form`} className={styles.formTitle}>
          {t("formTitle")}
        </h2>

        <Field label={t("name")} htmlFor={`${id}-name`}>
          <Input
            id={`${id}-name`}
            value={cfg.name}
            maxLength={BRAND_NAME_MAX}
            placeholder={t("namePlaceholder")}
            autoComplete="organization"
            onChange={(e) => update({ name: e.target.value })}
          />
        </Field>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>{t("type")}</legend>
          <div className={styles.chips}>
            {BUSINESS_TYPES.map((type) => (
              <label key={type} className={styles.chip}>
                <input
                  type="radio"
                  name={`${id}-type`}
                  value={type}
                  checked={cfg.type === type}
                  onChange={() => update({ type })}
                />
                <span>{t(`types.${type}.label`)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>{t("color")}</legend>
          <div className={styles.swatches} role="group" aria-label={t("presets")}>
            {BRAND_PRESETS.map((hex) => (
              <label key={hex} className={styles.swatch} style={{ "--sw": hex } as CSSProperties}>
                <input
                  type="radio"
                  name={`${id}-color`}
                  value={hex}
                  checked={!!brand && color === hex}
                  aria-label={t("preset", { hex })}
                  onChange={() => update({ color: hex })}
                />
              </label>
            ))}
          </div>
          <div className={styles.colorRow}>
            <label className={styles.colorCustom} htmlFor={`${id}-color`}>
              <input
                id={`${id}-color`}
                type="color"
                value={color}
                onChange={(e) => {
                  const hex = normalizeHex(e.target.value);
                  if (hex) update({ color: hex });
                }}
              />
              <span>{t("colorCustom")}</span>
            </label>
            <code className={styles.hex}>{color}</code>
          </div>
          <p className={styles.hint}>
            {t("inkLabel")}: {ink === "#ffffff" ? t("inkWhite") : t("inkBlack")} (
            {contrastRatio(color, ink).toFixed(1)}:1)
          </p>
          {lowText && <p className={styles.warn}>{t("contrastLow")}</p>}
        </fieldset>

        <Field label={t("font")} htmlFor={`${id}-font`}>
          <select
            id={`${id}-font`}
            className={styles.select}
            value={cfg.font}
            onChange={(e) => update({ font: e.target.value as BrandFontKey })}
          >
            {BRAND_FONT_KEYS.map((f) => (
              <option key={f} value={f}>
                {t(`fonts.${f}`)}
              </option>
            ))}
          </select>
        </Field>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>{t("logo")}</legend>
          <div className={styles.logoRow}>
            {logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.logoThumb} src={logo} alt={t("logoAlt", { name: displayName })} />
            )}
            <input
              id={`${id}-logo`}
              className={styles.file}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              aria-describedby={`${id}-logo-hint`}
              onChange={onLogo}
            />
            {logo && (
              <Button type="button" variant="ghost" onClick={() => setLogo(null)}>
                {t("logoRemove")}
              </Button>
            )}
          </div>
          <p id={`${id}-logo-hint`} className={styles.hint}>
            {t("logoHint")}
          </p>
          {logoError && (
            <p className={styles.warn} role="alert">
              {logoError}
            </p>
          )}
        </fieldset>

        <div className={styles.actions}>
          <Button type="button" onClick={copy} disabled={!brand}>
            {copyState === "copied" ? t("copied") : t("copy")}
          </Button>
          <Button type="button" variant="outline" onClick={onReset} disabled={!brand}>
            {t("reset")}
          </Button>
        </div>
        {copyState === "manual" && (
          <Field label={t("copyFallback")} htmlFor={`${id}-link`}>
            <Input id={`${id}-link`} readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
          </Field>
        )}
        <p className={styles.hint}>{t("shareHint")}</p>
        <p className={styles.status} role="status" aria-live="polite">
          {copyState === "copied" ? t("copied") : status}
        </p>
      </form>

      <div className={styles.side}>
        <h2 className={styles.formTitle}>{t("previewTitle")}</h2>
        <BrandPreview name={displayName} logo={logo} type={cfg.type} />
        <p className={styles.hint}>{t("styleNote", { count: DESIGN_STYLES.length })}</p>

        <h2 className={styles.formTitle}>{t("seeTitle")}</h2>
        <ul className={styles.links}>
          {VERTICALS.map((v) => (
            <li key={v.href}>
              <Link href={v.href} className={`${btn.btn} ${btn.outline}`}>
                {t(v.key)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

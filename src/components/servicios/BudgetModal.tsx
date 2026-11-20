"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Button from "@/components/ui/Button/Button";
import Field from "@/components/ui/Field/Field";
import Input from "@/components/ui/Input/Input";
import Modal from "@/components/ui/Modal/Modal";
import Textarea from "@/components/ui/Textarea/Textarea";
import {
  estimatorConfig,
  siteTypeForPlan,
  type ExtraId,
  type PagesId,
  type SiteTypeId,
  type TimeframeId,
} from "@/data/estimator";
import { SITE } from "@/config/site";
import { buildMailto } from "@/lib/contact";
import { calculateEstimate, formatEuroRange, type Estimate } from "@/lib/estimate";
import { useBudgetStore } from "@/store/useBudgetStore";
import styles from "./BudgetModal.module.scss";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.?[^\s@]*$/;
const STEPS = ["type", "pages", "extras", "timeframe", "summary"] as const;
const LAST = STEPS.length - 1;

function defaultPages(type: SiteTypeId): PagesId {
  return type === "landing" ? "one" : "upTo5";
}

function weeksText([min, max]: readonly [number, number]) {
  return min === max ? String(min) : `${min}–${max}`;
}

/**
 * Step-by-step estimator ("presupuestador"). Opened from the hero CTA and from
 * each pricing card (which pre-selects its site type). All prices come from
 * data/estimator.ts through the pure calculateEstimate().
 */
export default function BudgetModal() {
  const t = useTranslations("estimator");
  const tb = useTranslations("budget");
  const locale = useLocale();
  const open = useBudgetStore((s) => s.open);
  const planFromStore = useBudgetStore((s) => s.plan);
  const close = useBudgetStore((s) => s.close);

  const [step, setStep] = useState(0);
  const [siteType, setSiteType] = useState<SiteTypeId | null>(null);
  const [pages, setPages] = useState<PagesId>("one");
  const [pagesTouched, setPagesTouched] = useState(false);
  const [extras, setExtras] = useState<ExtraId[]>([]);
  const [timeframe, setTimeframe] = useState<TimeframeId>("normal");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const stepRef = useRef<HTMLFieldSetElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    if (!open) return;
    const type = siteTypeForPlan(planFromStore);
    setStep(0);
    setSiteType(type);
    setPages(type ? defaultPages(type) : "one");
    setPagesTouched(false);
    setExtras([]);
    setTimeframe("normal");
    setSent(false);
    setError(null);
    moved.current = false;
  }, [open, planFromStore]);

  // Move focus to the new step (not on first open: Modal focuses the dialog).
  useEffect(() => {
    if (moved.current) stepRef.current?.focus();
  }, [step]);

  const estimate: Estimate | null = useMemo(
    () => (siteType ? calculateEstimate({ siteType, pages, extras, timeframe }) : null),
    [siteType, pages, extras, timeframe],
  );

  const typeConfig = estimatorConfig.siteTypes.find((s) => s.id === siteType);

  function go(to: number) {
    moved.current = true;
    setStep(Math.max(0, Math.min(LAST, to)));
  }

  function pickType(id: SiteTypeId) {
    setSiteType(id);
    if (!pagesTouched) setPages(defaultPages(id));
  }

  function toggleExtra(id: ExtraId) {
    setExtras((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));
  }

  function includedTag(id: ExtraId): string | null {
    if (!typeConfig) return null;
    if ((typeConfig.included as readonly ExtraId[]).includes(id)) return t("included");
    const oneOf = "includedOneOf" in typeConfig ? typeConfig.includedOneOf : undefined;
    if ((oneOf as readonly ExtraId[] | undefined)?.includes(id)) return t("includedOne");
    return null;
  }

  const priceText = estimate ? formatEuroRange(estimate.price, locale) : "";
  const monthlyText =
    estimate && estimate.monthly[1] > 0 ? formatEuroRange(estimate.monthly, locale) : null;

  const extrasText =
    extras.length === 0
      ? t("none")
      : estimatorConfig.extras
          .filter((e) => extras.includes(e.id))
          .map((e) =>
            estimate?.includedExtras.includes(e.id)
              ? `${t(`extras.${e.id}`)} (${t("includedSuffix")})`
              : t(`extras.${e.id}`),
          )
          .join(", ");

  const summaryRows: [string, string][] = [];
  if (siteType && estimate) {
    summaryRows.push(
      [t("summaryType"), t(`types.${siteType}`)],
      [t("summaryPages"), t(`pages.${pages}`)],
      [t("summaryExtras"), extrasText],
      [t("summaryTimeframe"), t(`timeframes.${timeframe}`)],
      [t("summaryPrice"), priceText],
    );
    if (monthlyText) summaryRows.push([t("summaryMonthly"), t("monthlyValue", { range: monthlyText })]);
    summaryRows.push([t("summaryWeeks"), t("weeksValue", { range: weeksText(estimate.weeks) })]);
  }

  function messageLines(): string[] {
    const lines = [t("greeting"), "", ...summaryRows.map(([k, v]) => `${k}: ${v}`)];
    if (name.trim()) lines.push(`${t("summaryName")}: ${name.trim()}`);
    if (email.trim()) lines.push(`${t("summaryEmail")}: ${email.trim()}`);
    if (notes.trim()) lines.push("", `${t("summaryNotes")}: ${notes.trim()}`);
    return lines;
  }

  const whatsappHref = SITE.whatsapp
    ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(messageLines().join("\n"))}`
    : null;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < LAST) {
      if (step === 0 && !siteType) return;
      go(step + 1);
      return;
    }
    if (!name.trim() || !EMAIL_RE.test(email)) {
      setError(tb("errorFields"));
      return;
    }
    // No backend: open the visitor's email client with the summary prefilled.
    window.location.href = buildMailto(
      SITE.contactEmail,
      "[Showcase] Solicitud de presupuesto",
      messageLines(),
    );
    setSent(true);
  }

  const current = STEPS[step];
  const hintId = `est-hint-${current}`;
  const hasHint = current === "pages" || current === "extras" || current === "summary";

  return (
    <Modal open={open} onClose={close} title={t("title")}>
      {sent ? (
        <p className={styles.sent} role="status">
          {tb("sent")}
        </p>
      ) : (
        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div className={styles.progress}>
            <p className={styles.progressText}>
              {t("progress", { step: step + 1, total: STEPS.length })}
            </p>
            <div className={styles.progressTrack} aria-hidden="true">
              <span
                className={styles.progressBar}
                style={{ transform: `scaleX(${(step + 1) / STEPS.length})` }}
              />
            </div>
            <ol className={styles.stepList} aria-label={t("stepsLabel")}>
              {STEPS.map((s, i) => (
                <li
                  key={s}
                  className={styles.stepItem}
                  aria-current={i === step ? "step" : undefined}
                  data-done={i < step || undefined}
                >
                  {t(`steps.${s}`)}
                </li>
              ))}
            </ol>
          </div>

          <fieldset
            key={current}
            ref={stepRef}
            tabIndex={-1}
            className={styles.step}
            aria-describedby={hasHint ? hintId : undefined}
          >
            {current === "type" && (
              <>
                <legend className={styles.legend}>{t("typeLegend")}</legend>
                <div className={styles.options}>
                  {estimatorConfig.siteTypes.map((s) => (
                    <label key={s.id} className={styles.option}>
                      <input
                        type="radio"
                        name="est-type"
                        value={s.id}
                        checked={siteType === s.id}
                        onChange={() => pickType(s.id)}
                      />
                      <span className={styles.optionBody}>
                        <span className={styles.optionTitle}>
                          {t(`types.${s.id}`)}
                          <span className={styles.optionMeta}>
                            {formatEuroRange([s.from, s.from], locale)}
                          </span>
                        </span>
                        <span className={styles.optionHint}>{t(`typeHints.${s.id}`)}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </>
            )}

            {current === "pages" && (
              <>
                <legend className={styles.legend}>{t("pagesLegend")}</legend>
                <p id={hintId} className={styles.hint}>
                  {t("pagesHint")}
                </p>
                <div className={`${styles.options} ${styles.optionsGrid}`}>
                  {estimatorConfig.pages.map((p) => (
                    <label key={p.id} className={styles.option}>
                      <input
                        type="radio"
                        name="est-pages"
                        value={p.id}
                        checked={pages === p.id}
                        onChange={() => {
                          setPages(p.id);
                          setPagesTouched(true);
                        }}
                      />
                      <span className={styles.optionTitle}>{t(`pages.${p.id}`)}</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            {current === "extras" && (
              <>
                <legend className={styles.legend}>{t("extrasLegend")}</legend>
                <p id={hintId} className={styles.hint}>
                  {t("extrasHint")}
                </p>
                <div className={`${styles.options} ${styles.optionsGrid}`}>
                  {estimatorConfig.extras.map((x) => {
                    const tag = includedTag(x.id);
                    return (
                      <label key={x.id} className={styles.option}>
                        <input
                          type="checkbox"
                          name="est-extras"
                          value={x.id}
                          checked={extras.includes(x.id)}
                          onChange={() => toggleExtra(x.id)}
                        />
                        <span className={styles.optionBody}>
                          <span className={styles.optionTitle}>{t(`extras.${x.id}`)}</span>
                          {tag && <span className={styles.tag}>{tag}</span>}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </>
            )}

            {current === "timeframe" && (
              <>
                <legend className={styles.legend}>{t("timeframeLegend")}</legend>
                <div className={styles.options}>
                  {estimatorConfig.timeframes.map((tf) => (
                    <label key={tf.id} className={styles.option}>
                      <input
                        type="radio"
                        name="est-timeframe"
                        value={tf.id}
                        checked={timeframe === tf.id}
                        onChange={() => setTimeframe(tf.id)}
                      />
                      <span className={styles.optionBody}>
                        <span className={styles.optionTitle}>{t(`timeframes.${tf.id}`)}</span>
                        <span className={styles.optionHint}>{t(`timeframeHints.${tf.id}`)}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </>
            )}

            {current === "summary" && (
              <>
                <legend className={styles.legend}>{t("summaryLegend")}</legend>
                <p id={hintId} className={styles.hint}>
                  {t("summaryIntro")}
                </p>
                <dl className={styles.summary}>
                  {summaryRows.map(([k, v]) => (
                    <div key={k} className={styles.summaryRow}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                <Field label={tb("name")} htmlFor="b-name">
                  <Input
                    id="b-name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
                <Field label={tb("email")} htmlFor="b-email" error={error ?? undefined}>
                  <Input
                    id="b-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <Field label={t("notes")} htmlFor="b-notes">
                  <Textarea id="b-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </Field>
              </>
            )}
          </fieldset>

          {current !== "summary" && (
            <div className={styles.estimate} aria-live="polite">
              <p className={styles.estimateLabel}>{t("estimateLabel")}</p>
              {estimate ? (
                <>
                  <p className={styles.estimatePrice}>{priceText}</p>
                  <p className={styles.estimateMeta}>
                    {t("weeks", { range: weeksText(estimate.weeks) })}
                  </p>
                  {monthlyText && (
                    <p className={styles.estimateMeta}>{t("monthly", { range: monthlyText })}</p>
                  )}
                </>
              ) : (
                <p className={styles.estimateMeta}>{t("estimateEmpty")}</p>
              )}
            </div>
          )}
          <p className={styles.disclaimer}>{t("disclaimer")}</p>

          <div className={styles.nav}>
            {step > 0 && (
              <Button type="button" variant="ghost" onClick={() => go(step - 1)}>
                {t("back")}
              </Button>
            )}
            {step < LAST ? (
              <Button type="submit" disabled={step === 0 && !siteType} className={styles.navNext}>
                {t("next")}
              </Button>
            ) : (
              <div className={styles.sendActions}>
                {whatsappHref && (
                  <Button
                    as="a"
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                  >
                    {t("sendWhatsapp")}
                  </Button>
                )}
                <Button type="submit">{t("sendEmail")}</Button>
              </div>
            )}
          </div>
        </form>
      )}
    </Modal>
  );
}

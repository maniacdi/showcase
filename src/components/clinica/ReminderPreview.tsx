"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Cita } from "@/data/citas";
import { addDays } from "@/lib/agenda";
import { formatDayLong } from "./format";
import styles from "./clinica.module.scss";

/**
 * Phone-chat-like preview of the reminder that would go out 24 h before the
 * appointment. Built from site tokens only (no messaging-app branding).
 */
export default function ReminderPreview({
  cita,
  serviceLabel,
  proName,
  manageHref,
  onManage,
}: {
  cita: Cita;
  serviceLabel: string;
  proName: string;
  manageHref: string;
  onManage: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const t = useTranslations("clinica");
  const locale = useLocale();
  const day = cita.fecha.slice(0, 10);
  const time = cita.fecha.slice(11, 16);
  const sendDay = addDays(day, -1);

  return (
    <figure className={styles.phone} aria-labelledby="reminder-caption">
      <figcaption id="reminder-caption" className={styles.phoneHead}>
        <span className={styles.phoneSender}>{t("reminderSender")}</span>
        {cita.telefono ? (
          <span className={styles.phoneTo}>{t("reminderTo", { phone: cita.telefono })}</span>
        ) : null}
        <span className={styles.tag}>{t("reminderPreview")}</span>
      </figcaption>
      <div className={styles.phoneBody}>
        <p className={styles.phoneStamp}>
          {t("reminderSentAt", { date: formatDayLong(sendDay, locale), time })}
        </p>
        <div className={styles.bubble}>
          <p>
            {t("reminderMessage", {
              name: cita.cliente,
              service: serviceLabel,
              pro: proName,
              date: formatDayLong(day, locale),
              time,
            })}
          </p>
          <a className={styles.bubbleLink} href={manageHref} onClick={onManage}>
            {t("manageLink")}
          </a>
          <span className={styles.bubbleTime}>{time}</span>
        </div>
      </div>
    </figure>
  );
}

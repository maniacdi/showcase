import { useTranslations } from "next-intl";
import { SITE } from "@/config/site";
import styles from "./WhatsAppButton.module.scss";

export default function WhatsAppButton() {
  const t = useTranslations("common");
  if (!SITE.whatsapp) return null;
  const href = `https://wa.me/${SITE.whatsapp}`;
  return (
    <a
      className={styles.fab}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsapp")}
      title={t("whatsapp")}
    >
      <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true" fill="currentColor">
        <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.1 1.6 5.9L4 29l8.3-1.6c1.7.9 3.7 1.4 5.7 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.4.7.7-3.3-.2-.4c-1-1.6-1.5-3.4-1.5-5.2C6.2 9.6 10.6 5.2 16 5.2S25.8 9.6 25.8 15 21.4 24.8 16 24.8zm5.4-7.3c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5 4.5.7.3 1.2.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3z" />
      </svg>
    </a>
  );
}

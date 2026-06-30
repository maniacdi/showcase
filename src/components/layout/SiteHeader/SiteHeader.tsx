"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Brand from "@/components/layout/Brand/Brand";
import Container from "@/components/ui/Container/Container";
import styles from "./SiteHeader.module.scss";

interface NavItem {
  href: string;
  label: string;
}

export default function SiteHeader({
  nav,
  cta,
}: {
  nav: NavItem[];
  cta?: { href: string; label: string };
}) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className={styles.header}>
      <Container className={styles.bar}>
        <Link href="/" className={styles.brand} onClick={() => setOpen(false)}>
          <Brand />
        </Link>

        <button
          type="button"
          className={styles.toggle}
          aria-label="Menú"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "✕" : "≡"}
        </button>

        <nav className={`${styles.nav} ${open ? styles.navOpen : ""}`} aria-label="Principal">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link
            href={cta?.href ?? "/servicios#contacto"}
            className={styles.cta}
            onClick={() => setOpen(false)}
          >
            {cta?.label ?? t("contact")}
          </Link>
        </nav>
      </Container>
    </header>
  );
}

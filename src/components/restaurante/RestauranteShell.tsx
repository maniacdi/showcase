import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import ThemeProvider from "@/themes/ThemeProvider";
import DemoBar from "@/components/layout/DemoBar/DemoBar";
import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader/SiteHeader";
import Container from "@/components/ui/Container/Container";
import PhotoCredits from "@/components/tienda/PhotoCredits";
import type { Photo } from "@/data/productos";
import styles from "./restaurante.module.scss";

/** Header (restaurant nav) + demo bar + page + photo credits + footer. */
export default async function RestauranteShell({
  locale,
  photos = [],
  children,
}: {
  locale: string;
  photos?: Photo[];
  children: ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: "restaurante" });
  return (
    <ThemeProvider theme="reservas">
      <SiteHeader
        nav={[
          { href: "/restaurante/carta", label: t("navCarta") },
          { href: "/restaurante/reservar", label: t("navReservar") },
          { href: "/restaurante#contacto", label: t("navContact") },
        ]}
        cta={{ href: "/restaurante/reservar", label: t("ctaReserve") }}
      />
      <DemoBar />
      <main>{children}</main>
      {photos.length > 0 ? (
        <Container className={styles.credits}>
          <PhotoCredits label={t("photos")} photos={photos} />
        </Container>
      ) : null}
      <SiteFooter />
    </ThemeProvider>
  );
}

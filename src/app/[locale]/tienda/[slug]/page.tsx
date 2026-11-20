import type { Metadata } from "next";
import { alternatesFor } from "@/lib/seo";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import DemoBar from "@/components/layout/DemoBar/DemoBar";
import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader/SiteHeader";
import Container from "@/components/ui/Container/Container";
import Section from "@/components/ui/Section/Section";
import AddToCart from "@/components/tienda/AddToCart";
import Photo from "@/components/tienda/Photo";
import PhotoCredits from "@/components/tienda/PhotoCredits";
import { productosSeed } from "@/data/productos";
import { formatPrice } from "@/lib/cart";
import ThemeProvider from "@/themes/ThemeProvider";
import { routing } from "@/i18n/routing";
import styles from "./detail.module.scss";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => productosSeed.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const producto = productosSeed.find((p) => p.slug === slug);
  if (!producto) return {};
  return {
    title: `${producto.name}, tienda`,
    description: producto.description,
    alternates: alternatesFor(`/tienda/${slug}`, locale),
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tienda" });
  const producto = productosSeed.find((p) => p.slug === slug);
  if (!producto) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.name,
    description: producto.description,
    category: producto.category,
    image: producto.image.src,
    offers: { "@type": "Offer", price: producto.price, priceCurrency: "EUR" },
  };

  return (
    <ThemeProvider theme="tienda">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader
        nav={[{ href: "/tienda", label: t("title") }]}
        cta={{ href: "/tienda/carrito", label: t("cart") }}
      />
      <DemoBar />
      <Section>
        <Container className={styles.wrap}>
          <Link href="/tienda" className={styles.back}>
            {t("backToShop")}
          </Link>
          <div className={styles.grid}>
            <Photo
              photo={producto.image}
              sizes="(min-width: 1024px) 460px, (min-width: 768px) 50vw, 100vw"
              className={styles.image}
              priority
            />
            <div className={styles.info}>
              <span className={styles.cat}>{producto.category}</span>
              <h1 className={styles.name}>{producto.name}</h1>
              <p className={styles.price}>{formatPrice(producto.price)}</p>
              <p className={styles.desc}>{producto.description}</p>
              <AddToCart producto={producto} />
            </div>
          </div>
          <PhotoCredits label={t("photos")} photos={[producto.image]} className={styles.credits} />
        </Container>
      </Section>
      <SiteFooter />
    </ThemeProvider>
  );
}

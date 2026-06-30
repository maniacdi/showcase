"use client";

import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container/Container";
import { useProductsStore } from "@/store/useProductsStore";
import CartLink from "./CartLink";
import ProductCard from "./ProductCard";
import styles from "./tienda.module.scss";

export default function Catalog() {
  const t = useTranslations("tienda");
  const productos = useProductsStore((s) => s.productos);
  const activos = productos.filter((p) => p.active);

  return (
    <main>
      <Container>
        <header className={styles.head}>
          <div>
            <h1 className={styles.title}>{t("title")}</h1>
            <p className={styles.intro}>{t("intro")}</p>
          </div>
          <CartLink />
        </header>
        <div className={styles.grid}>
          {activos.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      </Container>
    </main>
  );
}

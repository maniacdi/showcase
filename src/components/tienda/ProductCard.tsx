"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button/Button";
import type { Producto } from "@/data/productos";
import { formatPrice } from "@/lib/cart";
import { useCartStore } from "@/store/useCartStore";
import Photo from "./Photo";
import styles from "./tienda.module.scss";

export default function ProductCard({ producto }: { producto: Producto }) {
  const t = useTranslations("tienda");
  const add = useCartStore((s) => s.add);
  const [added, setAdded] = useState(false);
  const out = producto.stock <= 0;

  function onAdd() {
    add(producto);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className={styles.card}>
      <Link
        href={`/tienda/${producto.slug}`}
        className={styles.thumb}
        tabIndex={-1}
        aria-hidden="true"
      >
        <Photo
          photo={producto.image}
          sizes="(min-width: 1024px) 380px, (min-width: 768px) 33vw, 50vw"
          className={styles.thumbImg}
        />
      </Link>
      <div className={styles.cardBody}>
        <span className={styles.cardCat}>{producto.category}</span>
        <Link href={`/tienda/${producto.slug}`} className={styles.cardName}>
          {producto.name}
        </Link>
        <span className={styles.cardPrice}>{formatPrice(producto.price)}</span>
        <Button variant="outline" className={styles.cardCta} onClick={onAdd} disabled={out}>
          {out ? t("outOfStock") : added ? t("added") : t("addToCart")}
        </Button>
      </div>
    </div>
  );
}

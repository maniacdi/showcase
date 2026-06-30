"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button/Button";
import type { Producto } from "@/data/productos";
import { useCartStore } from "@/store/useCartStore";
import CartLink from "./CartLink";
import styles from "./tienda.module.scss";

export default function AddToCart({ producto }: { producto: Producto }) {
  const t = useTranslations("tienda");
  const add = useCartStore((s) => s.add);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const out = producto.stock <= 0;

  return (
    <div className={styles.addRow}>
      <label className={styles.qtyLabel}>
        {t("qty")}
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          className={styles.qtyInput}
          disabled={out}
        />
      </label>
      <Button
        onClick={() => {
          add(producto, qty);
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1200);
        }}
        disabled={out}
      >
        {out ? t("outOfStock") : added ? t("added") : t("addToCart")}
      </Button>
      <CartLink />
    </div>
  );
}

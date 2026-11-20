"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button/Button";
import type { Producto } from "@/data/productos";
import { useCartStore } from "@/store/useCartStore";
import { rehydrateOrders } from "@/store/useOrdersStore";
import { useProductsStore } from "@/store/useProductsStore";
import CartLink from "./CartLink";
import styles from "./tienda.module.scss";

export default function AddToCart({ producto }: { producto: Producto }) {
  const t = useTranslations("tienda");
  const add = useCartStore((s) => s.add);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  // Live stock: orders placed in this session decrement it (useOrdersStore).
  const live = useProductsStore((s) => s.productos.find((p) => p.id === producto.id));
  const out = (live?.stock ?? producto.stock) <= 0 || live?.active === false;

  useEffect(() => {
    void rehydrateOrders();
  }, []);

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

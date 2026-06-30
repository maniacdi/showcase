"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button/Button";
import Container from "@/components/ui/Container/Container";
import { cartTotal, formatPrice } from "@/lib/cart";
import { useCartStore } from "@/store/useCartStore";
import styles from "./tienda.module.scss";

export default function CartView() {
  const t = useTranslations("tienda");
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <main>
        <Container className={styles.cartWrap}>
          <p className={styles.checkoutDone} role="status">
            {t("checkoutDone")}
          </p>
          <Link href="/tienda" className={styles.back}>
            ← {t("backToShop")}
          </Link>
        </Container>
      </main>
    );
  }

  return (
    <main>
      <Container className={styles.cartWrap}>
        <h1 className={styles.title}>{t("cart")}</h1>

        {items.length === 0 ? (
          <>
            <p className={styles.intro}>{t("empty")}</p>
            <Link href="/tienda" className={styles.back}>
              ← {t("backToShop")}
            </Link>
          </>
        ) : (
          <>
            <ul className={styles.cartList}>
              {items.map((i) => (
                <li key={i.id} className={styles.cartRow}>
                  <span className={styles.cartName}>{i.name}</span>
                  <input
                    type="number"
                    min={1}
                    value={i.qty}
                    className={styles.qtyInput}
                    aria-label={t("qty")}
                    onChange={(e) => setQty(i.id, Number(e.target.value) || 1)}
                  />
                  <span className={styles.cartLine}>{formatPrice(i.price * i.qty)}</span>
                  <button type="button" className={styles.removeBtn} onClick={() => remove(i.id)}>
                    {t("remove")}
                  </button>
                </li>
              ))}
            </ul>

            <div className={styles.cartFoot}>
              <span className={styles.totalLabel}>{t("total")}</span>
              <span className={styles.totalValue}>{formatPrice(cartTotal(items))}</span>
            </div>

            <Button
              onClick={() => {
                clear();
                setDone(true);
              }}
            >
              {t("checkout")}
            </Button>
          </>
        )}
      </Container>
    </main>
  );
}

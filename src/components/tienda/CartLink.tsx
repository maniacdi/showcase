"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cartCount } from "@/lib/cart";
import { useCartStore } from "@/store/useCartStore";
import styles from "./tienda.module.scss";

export default function CartLink() {
  const t = useTranslations("tienda");
  const count = useCartStore((s) => cartCount(s.items));
  return (
    <Link href="/tienda/carrito" className={styles.cartLink}>
      {t("cart")} ({count})
    </Link>
  );
}

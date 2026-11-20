"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button/Button";
import Container from "@/components/ui/Container/Container";
import { formatPrice } from "@/lib/cart";
import { type Order, type ShippingValues, computeTotals } from "@/lib/checkout";
import { useMounted } from "@/lib/useMounted";
import { productImage } from "@/data/productos";
import { useCartStore } from "@/store/useCartStore";
import { rehydrateOrders, useOrdersStore } from "@/store/useOrdersStore";
import { useProductsStore } from "@/store/useProductsStore";
import OrderConfirmation from "./checkout/OrderConfirmation";
import OrderSummary from "./checkout/OrderSummary";
import PaymentForm, { type PaymentResult } from "./checkout/PaymentForm";
import ShippingForm from "./checkout/ShippingForm";
import Photo from "./Photo";
import PhotoCredits from "./PhotoCredits";
import styles from "./checkout/checkout.module.scss";

type Step = "carrito" | "envio" | "pago" | "confirmacion";
const STEPS: Step[] = ["carrito", "envio", "pago", "confirmacion"];
const STEP_KEY: Record<Step, string> = {
  carrito: "stepCart",
  envio: "stepShipping",
  pago: "stepPayment",
  confirmacion: "stepDone",
};

const EMPTY_SHIPPING: ShippingValues = {
  name: "",
  email: "",
  address: "",
  city: "",
  postalCode: "",
  phone: "",
  method: "estandar",
};

/**
 * Cart + simulated multi-step checkout: carrito, envío, pago, confirmación.
 * Shipping details live in component state only; card data never leaves the
 * payment form (see PaymentForm). The order goes to useOrdersStore, which
 * decrements stock and feeds the admin.
 */
export default function CartView() {
  const t = useTranslations("tienda");
  const tc = useTranslations("checkout");
  const mounted = useMounted();
  const allItems = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const productos = useProductsStore((s) => s.productos);
  const place = useOrdersStore((s) => s.place);

  const [step, setStep] = useState<Step>("carrito");
  const [shipping, setShipping] = useState<ShippingValues>(EMPTY_SHIPPING);
  const [order, setOrder] = useState<Order | null>(null);
  const [stockError, setStockError] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    void rehydrateOrders();
  }, []);

  // Move focus to the step heading on every step change (not on first load).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  // Ignore ids no longer in the catalogue (e.g. a cart persisted by an older seed).
  const items = mounted ? allItems.filter((i) => productImage(i.id)) : [];
  const stockOf = (id: string) => {
    const p = productos.find((x) => x.id === id);
    return p && p.active ? p.stock : 0;
  };
  const blocked = items.some((i) => i.qty > stockOf(i.id));
  const totals = computeTotals(items, step === "carrito" ? "estandar" : shipping.method);
  const shippingLabel =
    step === "carrito" ? tc("shippingStandard") : tc(`method_${shipping.method}`);

  function pay(r: PaymentResult) {
    const res = place({
      items,
      cliente: shipping.name,
      email: shipping.email,
      ciudad: shipping.city,
      shippingMethod: shipping.method,
      payment: r.method,
      cardLast4: r.cardLast4,
    });
    if (!res.ok) {
      setStockError(true);
      setStep("carrito");
      return;
    }
    clear();
    setOrder(res.order);
    setStep("confirmacion");
  }

  const stepIndex = STEPS.indexOf(step);
  const heading =
    step === "carrito"
      ? t("cart")
      : step === "envio"
        ? tc("shippingTitle")
        : step === "pago"
          ? tc("paymentTitle")
          : tc("doneTitle");

  const showSteps = mounted && (items.length > 0 || step === "confirmacion");

  return (
    <main>
      <Container className={styles.wrap}>
        <h1 className={styles.title}>{step === "confirmacion" ? tc("doneTitle") : t("cart")}</h1>

        {showSteps ? (
          <ol className={styles.steps} aria-label={tc("stepsLabel")}>
            {STEPS.map((s, i) => (
              <li
                key={s}
                className={`${styles.step} ${i < stepIndex ? styles.stepDone : ""} ${i === stepIndex ? styles.stepCurrent : ""}`}
                aria-current={i === stepIndex ? "step" : undefined}
              >
                <span className={styles.stepName}>{tc(STEP_KEY[s])}</span>
              </li>
            ))}
          </ol>
        ) : null}

        {step === "confirmacion" && order ? (
          <>
            <h2 ref={headingRef} tabIndex={-1} className={styles.srOnly}>
              {heading}
            </h2>
            <OrderConfirmation
              order={order}
              address={[shipping.address, `${shipping.postalCode} ${shipping.city}`.trim()]
                .filter(Boolean)
                .join(", ")}
            />
          </>
        ) : !mounted ? null : items.length === 0 ? (
          <>
            <p className={styles.lead}>{t("empty")}</p>
            <Link href="/tienda" className={styles.back}>
              {t("backToShop")}
            </Link>
          </>
        ) : (
          <div className={styles.layout}>
            <div className={styles.main}>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className={step === "carrito" ? styles.srOnly : styles.h2}
              >
                {heading}
                <span className={styles.srOnly}>
                  {" "}
                  ({tc("stepOf", { n: stepIndex + 1, total: STEPS.length })})
                </span>
              </h2>

              {step === "carrito" ? (
                <>
                  {stockError ? (
                    <p className={styles.formError} role="alert">
                      {tc("outOfStockError")}
                    </p>
                  ) : null}
                  <ul className={styles.cartList}>
                    {items.map((i) => {
                      const img = productImage(i.id);
                      const stock = stockOf(i.id);
                      const over = i.qty > stock;
                      return (
                        <li key={i.id} className={styles.cartRow}>
                          {img ? (
                            <Photo photo={img} sizes="64px" className={styles.thumb} decorative />
                          ) : (
                            <span className={styles.thumb} aria-hidden="true" />
                          )}
                          <span className={styles.cartName}>{i.name}</span>
                          <input
                            type="number"
                            min={1}
                            max={Math.max(1, stock)}
                            value={i.qty}
                            className={styles.qty}
                            aria-label={`${t("qty")}: ${i.name}`}
                            aria-invalid={over || undefined}
                            aria-describedby={`stock-${i.id}`}
                            onChange={(e) => {
                              setStockError(false);
                              setQty(i.id, Number(e.target.value) || 1);
                            }}
                          />
                          <span className={styles.line}>{formatPrice(i.price * i.qty)}</span>
                          <button
                            type="button"
                            className={styles.remove}
                            onClick={() => remove(i.id)}
                          >
                            {t("remove")}
                          </button>
                          <span
                            id={`stock-${i.id}`}
                            className={`${styles.note} ${over ? styles.noteError : ""}`}
                          >
                            {stock <= 0
                              ? tc("noStock")
                              : over
                                ? tc("stockOver", { n: stock })
                                : tc("stockLeft", { n: stock })}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <div className={styles.actions}>
                    <Button onClick={() => setStep("envio")} disabled={blocked}>
                      {tc("continueShipping")}
                    </Button>
                    <Link href="/tienda" className={styles.back}>
                      {t("backToShop")}
                    </Link>
                  </div>
                  <PhotoCredits
                    label={t("photos")}
                    photos={items.flatMap((i) => {
                      const img = productImage(i.id);
                      return img ? [img] : [];
                    })}
                  />
                </>
              ) : null}

              {step === "envio" ? (
                <ShippingForm
                  values={shipping}
                  onChange={setShipping}
                  subtotal={totals.subtotal}
                  onBack={() => setStep("carrito")}
                  onNext={() => setStep("pago")}
                />
              ) : null}

              {step === "pago" ? (
                <PaymentForm
                  total={totals.total}
                  defaultPhone={shipping.phone}
                  defaultHolder={shipping.name}
                  onBack={() => setStep("envio")}
                  onPay={pay}
                />
              ) : null}
            </div>

            <OrderSummary items={items} totals={totals} shippingLabel={shippingLabel} />
          </div>
        )}
      </Container>
    </main>
  );
}

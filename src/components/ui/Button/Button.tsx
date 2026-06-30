import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.scss";

type Variant = "solid" | "outline" | "ghost";

type CommonProps = { variant?: Variant; className?: string; children: ReactNode };

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" };
type ButtonAsAnchor = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { as: "a"; href: string };

export default function Button(props: ButtonAsButton | ButtonAsAnchor) {
  const { variant = "solid", className = "", children } = props;
  const cls = `${styles.btn} ${styles[variant]} ${className}`.trim();

  if (props.as === "a") {
    const { as: _as, variant: _variant, className: _className, children: _children, ...rest } =
      props;
    return (
      <a className={cls} data-variant={variant} {...rest}>
        {children}
      </a>
    );
  }
  const { as: _as, variant: _variant, className: _className, children: _children, ...rest } = props;
  return (
    <button className={cls} data-variant={variant} {...rest}>
      {children}
    </button>
  );
}

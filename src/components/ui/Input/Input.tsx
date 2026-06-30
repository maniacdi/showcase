import type { InputHTMLAttributes } from "react";
import styles from "./Input.module.scss";

export default function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input className={`${styles.input} ${className}`.trim()} {...rest} />;
}

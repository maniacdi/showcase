import type { TextareaHTMLAttributes } from "react";
import styles from "./Textarea.module.scss";

export default function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return <textarea className={`${styles.textarea} ${className}`.trim()} rows={5} {...rest} />;
}

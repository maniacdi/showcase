import { useMemo } from "react";
import { encodeQr, qrPath } from "@/lib/qr";
import styles from "./restaurante.module.scss";

/** Inline SVG QR code (encoded locally, no network, no dependency). */
export default function QrCode({ value, label }: { value: string; label: string }) {
  const { d, size } = useMemo(() => {
    const matrix = encodeQr(value);
    return { d: qrPath(matrix), size: matrix.length + 8 };
  }, [value]);

  return (
    <div className={styles.qrFrame}>
      <svg
        className={styles.qrSvg}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={label}
        shapeRendering="crispEdges"
      >
        <path d={d} />
      </svg>
    </div>
  );
}

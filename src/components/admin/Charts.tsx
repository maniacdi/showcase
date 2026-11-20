import type { CSSProperties, ReactNode } from "react";
import { niceMax } from "@/lib/stats";
import styles from "./charts.module.scss";

/**
 * Dependency-free charts (CSS + inline SVG). The drawing is aria-hidden; a
 * visually hidden table carries the same numbers for screen readers. Bars grow
 * with transform (scaleY / scaleX) and the line fades in; all of it is
 * disabled under prefers-reduced-motion.
 */

export interface Datum {
  key: string;
  /** Short axis label ("19", "29 jun"). */
  short: string;
  /** Full label for the table and the tooltip ("jueves, 2 de julio"). */
  label: string;
  value: number;
}

interface ChartFrameProps {
  title: string;
  desc: string;
  keyHeader: string;
  valueHeader: string;
  data: Datum[];
  format: (n: number) => string;
  children: ReactNode;
}

function ChartFrame({
  title,
  desc,
  keyHeader,
  valueHeader,
  data,
  format,
  children,
}: ChartFrameProps) {
  return (
    <figure className={styles.chart}>
      <figcaption className={styles.head}>
        <span className={styles.title}>{title}</span>
        <span className={styles.desc}>{desc}</span>
      </figcaption>
      <div aria-hidden="true">{children}</div>
      {/* Tables ignore width: 1px, so the hiding goes on a wrapper. */}
      <div className={styles.srOnly}>
        <table>
          <caption>{`${title}. ${desc}`}</caption>
          <thead>
            <tr>
              <th scope="col">{keyHeader}</th>
              <th scope="col">{valueHeader}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.key}>
                <th scope="row">{d.label}</th>
                <td>{format(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

type ChartProps = Omit<ChartFrameProps, "children"> & {
  /** Tooltip text for a datum. */
  tip: (d: Datum) => string;
  /** Index to highlight (today / this week); defaults to the last one. */
  current?: number;
};

function Axis({ max, format }: { max: number; format: (n: number) => string }) {
  return (
    <div className={styles.yAxis}>
      <span>{format(max)}</span>
      <span>{format(max / 2)}</span>
      <span>{format(0)}</span>
    </div>
  );
}

/** `every` > 1 labels only every n-th tick (counted back from the last one). */
function XAxis({ data, current, every = 1 }: { data: Datum[]; current: number; every?: number }) {
  const last = data.length - 1;
  return (
    <>
      <span />
      <div className={styles.xAxis}>
        {data.map((d, i) => (
          <span key={d.key} className={i === current ? styles.xCurrent : undefined}>
            {(last - i) % every === 0 || i === current ? d.short : ""}
          </span>
        ))}
      </div>
    </>
  );
}

export function ColumnChart(props: ChartProps & { axisFormat?: (n: number) => string }) {
  const { data, tip, axisFormat = props.format } = props;
  const current = props.current ?? data.length - 1;
  const max = niceMax(data.map((d) => d.value));
  return (
    <ChartFrame {...props}>
      <div className={styles.frame}>
        <Axis max={max} format={axisFormat} />
        <div className={styles.plot}>
          <span className={`${styles.grid} ${styles.gridTop}`} />
          <span className={`${styles.grid} ${styles.gridMid}`} />
          <div className={styles.cols}>
            {data.map((d, i) => {
              const h = d.value / max;
              return (
                <div
                  key={d.key}
                  className={`${styles.col} ${i === current ? styles.current : ""}`}
                  style={{ "--h": h } as CSSProperties}
                >
                  <span className={styles.bar} style={{ transform: `scaleY(${h})` }} />
                  <span className={styles.tip}>
                    {d.short}: {tip(d)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <XAxis data={data} current={current} />
      </div>
    </ChartFrame>
  );
}

export function LineChart(props: ChartProps & { axisFormat?: (n: number) => string }) {
  const { data, tip, axisFormat = props.format } = props;
  const current = props.current ?? data.length - 1;
  const max = niceMax(data.map((d) => d.value));
  const pts = data.map((d, i) => ({
    // Centre of each x-axis column, so dots line up with their labels.
    x: ((i + 0.5) / data.length) * 100,
    y: 100 - (d.value / max) * 100,
  }));
  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = pts.length
    ? `M${pts[0].x},100 L${pts.map((p) => `${p.x},${p.y}`).join(" L")} L${pts[pts.length - 1].x},100 Z`
    : "";
  return (
    <ChartFrame {...props}>
      <div className={styles.frame}>
        <Axis max={max} format={axisFormat} />
        <div className={styles.plot}>
          <span className={`${styles.grid} ${styles.gridTop}`} />
          <span className={`${styles.grid} ${styles.gridMid}`} />
          <svg
            className={styles.svg}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            focusable="false"
          >
            <path className={styles.area} d={area} />
            <polyline className={styles.line} points={line} />
          </svg>
          {data.map((d, i) => (
            <span
              key={d.key}
              className={`${styles.dot} ${i === current ? styles.dotCurrent : ""}`}
              style={{ left: `${pts[i].x}%`, top: `${pts[i].y}%` }}
            >
              <span
                className={styles.tip}
                style={
                  i === 0
                    ? { left: 0, translate: "0 0" }
                    : i === data.length - 1
                      ? { left: "auto", right: 0, translate: "0 0" }
                      : undefined
                }
              >
                {d.short}: {tip(d)}
              </span>
            </span>
          ))}
        </div>
        <XAxis data={data} current={current} every={2} />
      </div>
    </ChartFrame>
  );
}

export function HBarChart(props: Omit<ChartProps, "current" | "tip">) {
  const { data, format } = props;
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ChartFrame {...props}>
      <ol className={styles.rows}>
        {data.map((d) => (
          <li key={d.key} className={styles.row}>
            <span className={styles.rowName}>{d.label}</span>
            <span className={styles.rowValue}>{format(d.value)}</span>
            <span className={styles.track}>
              <span className={styles.fill} style={{ transform: `scaleX(${d.value / max})` }} />
            </span>
          </li>
        ))}
      </ol>
    </ChartFrame>
  );
}

import { describe, expect, it } from "vitest";
import { buildIcs, escapeIcsText, foldIcsLine } from "./ics";

const base = {
  uid: "b9-202607021000@showcase-demo",
  start: "2026-07-02T10:00",
  durationMin: 45,
  summary: "Limpieza dental (Elena Marín)",
  now: new Date(Date.UTC(2026, 5, 30, 8, 5, 9)),
};

describe("buildIcs", () => {
  it("produces a VCALENDAR with one VEVENT and CRLF line endings", () => {
    const ics = buildIcs(base);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(ics.endsWith("END:VEVENT\r\nEND:VCALENDAR\r\n")).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics.replace(/\r\n/g, "")).not.toMatch(/\n/);
  });

  it("writes start, end (start + duration) and a UTC DTSTAMP", () => {
    const ics = buildIcs(base);
    expect(ics).toContain("DTSTART:20260702T100000\r\n");
    expect(ics).toContain("DTEND:20260702T104500\r\n");
    expect(ics).toContain("DTSTAMP:20260630T080509Z\r\n");
    expect(ics).toContain(`UID:${base.uid}\r\n`);
  });

  it("rolls the end over hours and days", () => {
    expect(buildIcs({ ...base, start: "2026-07-02T23:30", durationMin: 60 })).toContain(
      "DTEND:20260703T003000",
    );
  });

  it("adds a 24 h display alarm by default and can omit it", () => {
    expect(buildIcs(base)).toContain("BEGIN:VALARM\r\nACTION:DISPLAY");
    expect(buildIcs(base)).toContain("TRIGGER:-PT1440M");
    expect(buildIcs({ ...base, alarmMinutesBefore: 0 })).not.toContain("VALARM");
  });

  it("escapes text fields", () => {
    const ics = buildIcs({ ...base, summary: "Revisión; 1, 2", description: "Línea 1\nLínea 2" });
    expect(ics).toContain("SUMMARY:Revisión\\; 1\\, 2");
    expect(ics).toContain("DESCRIPTION:Línea 1\\nLínea 2");
  });
});

describe("escapeIcsText", () => {
  it("escapes backslash first, then separators and newlines", () => {
    expect(escapeIcsText("a\\b;c,d\r\ne")).toBe("a\\\\b\\;c\\,d\\ne");
  });
});

describe("foldIcsLine", () => {
  const bytes = (s: string) => new TextEncoder().encode(s).length;

  it("leaves short lines alone", () => {
    expect(foldIcsLine("SUMMARY:corto")).toBe("SUMMARY:corto");
  });

  it("folds long lines at 75 octets, never splitting a multi-byte character", () => {
    const line = `DESCRIPTION:${"ñá".repeat(60)}`;
    const folded = foldIcsLine(line);
    const parts = folded.split("\r\n");
    expect(parts.length).toBeGreaterThan(1);
    for (const p of parts) expect(bytes(p)).toBeLessThanOrEqual(75);
    for (const p of parts.slice(1)) expect(p.startsWith(" ")).toBe(true);
    expect(parts.map((p, i) => (i === 0 ? p : p.slice(1))).join("")).toBe(line);
  });
});

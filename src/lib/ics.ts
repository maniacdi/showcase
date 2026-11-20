/**
 * Minimal RFC 5545 calendar file for one appointment, built client-side (no
 * backend). Times are "floating" (no TZID): calendars show them at the same
 * wall-clock time the clinic uses, which is what a local patient expects.
 */

export interface IcsEvent {
  uid: string;
  /** "YYYY-MM-DDTHH:mm" in clinic local time. */
  start: string;
  durationMin: number;
  summary: string;
  description?: string;
  location?: string;
  /** Creation timestamp; injectable for deterministic tests. */
  now?: Date;
  /** Minutes before start for the alarm (default 24 h). Omit with 0. */
  alarmMinutesBefore?: number;
}

/** Escape TEXT values: backslash, semicolon, comma and newlines. */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Fold lines longer than 75 octets (UTF-8 aware): CRLF + one space. */
export function foldIcsLine(line: string): string {
  const enc = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  for (const ch of line) {
    const size = enc.encode(ch).length;
    const limit = parts.length === 0 ? 75 : 74; // continuation lines start with a space
    if (bytes + size > limit) {
      parts.push(current);
      current = "";
      bytes = 0;
    }
    current += ch;
    bytes += size;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

function localStamp(isoLocal: string): string {
  // "2026-07-02T10:00" → "20260702T100000"
  return `${isoLocal.slice(0, 10).replace(/-/g, "")}T${isoLocal.slice(11, 13)}${isoLocal.slice(14, 16)}00`;
}

function addMinutesLocal(isoLocal: string, minutes: number): string {
  const [y, mo, d] = isoLocal.slice(0, 10).split("-").map(Number);
  const [h, mi] = isoLocal.slice(11, 16).split(":").map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d, h, mi + minutes));
  return dt.toISOString().slice(0, 16);
}

function utcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function buildIcs(event: IcsEvent): string {
  const alarm = event.alarmMinutesBefore ?? 24 * 60;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Showcase//Agenda demo//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${utcStamp(event.now ?? new Date())}`,
    `DTSTART:${localStamp(event.start)}`,
    `DTEND:${localStamp(addMinutesLocal(event.start, event.durationMin))}`,
    `SUMMARY:${escapeIcsText(event.summary)}`,
    ...(event.description ? [`DESCRIPTION:${escapeIcsText(event.description)}`] : []),
    ...(event.location ? [`LOCATION:${escapeIcsText(event.location)}`] : []),
    ...(alarm > 0
      ? [
          "BEGIN:VALARM",
          "ACTION:DISPLAY",
          `DESCRIPTION:${escapeIcsText(event.summary)}`,
          `TRIGGER:-PT${alarm}M`,
          "END:VALARM",
        ]
      : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldIcsLine).join("\r\n") + "\r\n";
}

/** Browser-only: trigger a download of the .ics via a Blob URL. */
export function downloadIcs(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * CSV export for spreadsheets opened by Spanish-locale Excel: semicolon
 * separator, decimal comma, CRLF line ends and a UTF-8 BOM so accents
 * ("Revisión", "Móviles") open correctly.
 */

export const CSV_BOM = "﻿";

export type CsvCell = string | number | null | undefined;

/** Quote when needed and neutralise formula injection (=, +, -, @ at the start). */
export function escapeCsvCell(cell: CsvCell, sep = ";"): string {
  if (cell === null || cell === undefined) return "";
  let s = typeof cell === "number" ? String(cell) : cell;
  if (typeof cell === "string" && /^[=+\-@\t\r]/.test(s) && !/^-?\d+([.,]\d+)?$/.test(s)) {
    s = `'${s}`;
  }
  if (s.includes(sep) || s.includes('"') || /[\r\n]/.test(s) || s !== s.trim()) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Rows (first one = header) → CSV text with BOM. */
export function toCSV(rows: CsvCell[][], sep = ";"): string {
  return (
    CSV_BOM + rows.map((r) => r.map((c) => escapeCsvCell(c, sep)).join(sep)).join("\r\n") + "\r\n"
  );
}

/** Client-only: download `content` as a file. */
export function downloadCSV(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

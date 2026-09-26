/**
 * Real UTF-8 CSV generation with RFC-4180 escaping and CSV formula-injection
 * protection. Used by the Orders and Reports exports.
 */

/** Cells beginning with any of these are treated as formulas by spreadsheets. */
const FORMULA_TRIGGERS = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Neutralise CSV/formula injection: any user-entered value that starts with a
 * formula trigger is prefixed with a single quote so Excel/Sheets treat it as
 * text. Applied before quoting.
 */
export function sanitizeCell(value: unknown): string {
  let str = value == null ? '' : String(value);
  if (str.length > 0 && FORMULA_TRIGGERS.includes(str[0])) {
    str = `'${str}`;
  }
  return str;
}

/** RFC-4180 quote: wrap in quotes and double any embedded quotes when needed. */
export function escapeCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export interface CsvColumn<T> {
  key: string;
  header: string;
  /** Extract the raw cell value for a row. */
  value: (row: T) => unknown;
}

/**
 * Build a CSV string from rows + selected columns. Prepends a UTF-8 BOM so
 * Excel opens non-ASCII correctly.
 */
export function buildCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const headerLine = columns.map((c) => escapeCell(sanitizeCell(c.header))).join(',');
  const bodyLines = rows.map((row) =>
    columns.map((c) => escapeCell(sanitizeCell(c.value(row)))).join(','),
  );
  return '﻿' + [headerLine, ...bodyLines].join('\r\n') + '\r\n';
}

/** Trigger a browser download of a CSV string (client-side only). */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Release the object URL on the next tick.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

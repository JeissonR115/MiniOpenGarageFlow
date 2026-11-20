type CsvValue = string | number | null | undefined;

function escapeCsvValue(value: CsvValue): string {
  const raw = value === null || value === undefined ? "" : String(value);
  const safe = /^[\t\r\n ]*[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function toCsv(headers: string[], rows: CsvValue[][]): string {
  return (
    [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\r\n") + "\r\n"
  );
}

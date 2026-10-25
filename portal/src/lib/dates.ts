import type { AnalyticsRange } from "./types";

export const AR_TZ = "America/Argentina/Buenos_Aires";
const DAY_MS = 24 * 60 * 60 * 1000;

function arDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: AR_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

function arMidnightUtc(year: number, month: number, day: number) {
  // Argentina no aplica horario de verano: UTC-3 todo el año.
  return new Date(Date.UTC(year, month - 1, day, 3, 0, 0, 0));
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS);
}

function addMonths(date: Date, months: number) {
  const parts = arDateParts(date);
  const total = parts.year * 12 + (parts.month - 1) + months;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  return arMidnightUtc(year, month, 1);
}

export function getAnalyticsStart(range: AnalyticsRange, now = new Date()) {
  const { year, month, day } = arDateParts(now);
  const today = arMidnightUtc(year, month, day);

  if (range === "semana") return addDays(today, -6);
  if (range === "mes") return addDays(today, -29);
  return addMonths(arMidnightUtc(year, month, 1), -11);
}

export function getAnalyticsRange(range: AnalyticsRange, now = new Date()) {
  const start = getAnalyticsStart(range, now);
  const label =
    range === "semana"
      ? "Últimos 7 días"
      : range === "mes"
        ? "Últimos 30 días"
        : "Últimos 12 meses";

  return { start, end: now, label };
}

export function getBucketKey(date: Date, range: AnalyticsRange) {
  const { year, month, day } = arDateParts(date);
  if (range === "anio") {
    return `${year}-${String(month).padStart(2, "0")}`;
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function buildAnalyticsBuckets(range: AnalyticsRange, now = new Date()) {
  const start = getAnalyticsStart(range, now);
  const buckets: Array<{ key: string; label: string }> = [];

  if (range === "anio") {
    for (let index = 0; index < 12; index += 1) {
      const current = addMonths(start, index);
      const { year, month } = arDateParts(current);
      buckets.push({
        key: `${year}-${String(month).padStart(2, "0")}`,
        label: new Intl.DateTimeFormat("es-AR", {
          month: "short",
          timeZone: AR_TZ,
        })
          .format(current)
          .replace(".", ""),
      });
    }
    return buckets;
  }

  const days = range === "semana" ? 7 : 30;
  for (let index = 0; index < days; index += 1) {
    const current = addDays(start, index);
    const { year, month, day } = arDateParts(current);
    const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const label =
      range === "semana"
        ? new Intl.DateTimeFormat("es-AR", {
            weekday: "short",
            day: "numeric",
            timeZone: AR_TZ,
          })
            .format(current)
            .replace(".", "")
        : new Intl.DateTimeFormat("es-AR", {
            day: "numeric",
            month: "short",
            timeZone: AR_TZ,
          })
            .format(current)
            .replace(".", "");
    buckets.push({ key, label });
  }

  return buckets;
}

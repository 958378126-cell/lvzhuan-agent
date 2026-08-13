import "server-only";

import type { ResumeData } from "./schemas";

// Keep date handling conservative: source-backed dates win, otherwise use “—”.
const DATE_PART = String.raw`(?:19|20)\d{2}(?:\s*[./年月-]\s*(?:0?[1-9]|1[0-2])\s*月?)?`;
const DATE_RANGE_PATTERN = new RegExp(
  String.raw`(?:${DATE_PART}\s*(?:至|到|—|–|-|~|～)\s*(?:${DATE_PART}|至今|现在)|${DATE_PART}\s*(?:至今|现在))`,
  "gi",
);
const DATE_TOKEN_PATTERN = /(?:19|20)\d{2}/g;

function cleanLine(line: string) {
  return line.replace(/^[-*•\s]+/, "").trim();
}

function normalize(value: string) {
  return value.replace(/[\s·•，,。；;：:（）()\[\]{}、/\\_\-]/g, "").toLowerCase();
}

function entryKeys(entry: { role?: string; org?: string; school?: string; degree?: string }) {
  return [entry.role, entry.org, entry.school, entry.degree]
    .filter((value): value is string => Boolean(value))
    .map(normalize)
    .filter((value) => value.length >= 2 && value !== "—" && value !== "未提供");
}

export function extractDateRanges(source: string) {
  DATE_RANGE_PATTERN.lastIndex = 0;
  return Array.from(new Set(source.match(DATE_RANGE_PATTERN) ?? []));
}

export function extractSourceYears(source: string) {
  return new Set(source.match(DATE_TOKEN_PATTERN) ?? []);
}

/** Returns source-backed date lines for the model to copy exactly. */
export function buildDateEvidence(source: string) {
  const lines = source
    .split(/\r?\n|[。；;]/)
    .map(cleanLine)
    .filter((line) => extractDateRanges(line).length > 0 || /至今|现在/.test(line));
  return Array.from(new Set(lines)).slice(0, 80).join("\n");
}

function sourceEvidenceForEntry(
  entry: { role?: string; org?: string; school?: string; degree?: string },
  lines: string[],
) {
  const keys = entryKeys(entry);
  if (keys.length === 0) return undefined;

  for (let index = 0; index < lines.length; index += 1) {
    const normalizedLine = normalize(lines[index]);
    if (!keys.some((key) => normalizedLine.includes(key) || key.includes(normalizedLine))) continue;
    const nearby = lines.slice(Math.max(0, index - 1), index + 2);
    const withDate = nearby.find((line) => extractDateRanges(line).length > 0 || /至今|现在/.test(line));
    if (withDate) return withDate;
  }
  return undefined;
}

function guardEntryDates<T extends { dates: string; role?: string; org?: string; school?: string; degree?: string }>(entry: T, lines: string[], sourceYears: Set<string>) {
  const evidence = sourceEvidenceForEntry(entry, lines);
  if (evidence) {
    const ranges = extractDateRanges(evidence);
    if (ranges.length > 0) return { ...entry, dates: ranges[0] };
  }

  const generatedYears = entry.dates.match(DATE_TOKEN_PATTERN) ?? [];
  if (generatedYears.length > 0 && generatedYears.every((year) => sourceYears.has(year))) return entry;
  return { ...entry, dates: "—" };
}

export function guardResumeDates(data: ResumeData, source: string): ResumeData {
  const normalizedSource = source.trim();
  if (!normalizedSource) return data;
  const lines = normalizedSource.split(/\r?\n|[。；;]/).map(cleanLine).filter(Boolean);
  const sourceYears = extractSourceYears(normalizedSource);
  return {
    ...data,
    experience: data.experience.map((entry) => guardEntryDates(entry, lines, sourceYears)),
    education: data.education.map((entry) => guardEntryDates(entry, lines, sourceYears)),
  };
}

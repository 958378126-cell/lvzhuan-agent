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

function dateMatches(source: string) {
  DATE_RANGE_PATTERN.lastIndex = 0;
  return Array.from(source.matchAll(DATE_RANGE_PATTERN)).map((match) => ({
    value: match[0],
    index: match.index ?? 0,
  }));
}

/** Returns source-backed date lines for the model to copy exactly. */
export function buildDateEvidence(source: string) {
  // Keep a short context window around every date range. This is more useful
  // than passing one flattened DOCX paragraph containing every education and
  // work date, which can make a model swap the dates between adjacent entries.
  const snippets = dateMatches(source).map(({ value, index }) => {
    const start = Math.max(0, index - 120);
    const end = Math.min(source.length, index + value.length + 120);
    return cleanLine(source.slice(start, end));
  });
  return Array.from(new Set(snippets)).slice(0, 80).join("\n");
}

/** Find the source date range closest to the school/degree or role/org label. */
export function sourceDateRangeForEntry(
  entry: { role?: string; org?: string; school?: string; degree?: string },
  source: string,
) {
  const matches = dateMatches(source);
  if (matches.length === 0) return undefined;

  const labels = [entry.school, entry.degree, entry.org, entry.role]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.trim())
    .filter((value) => value.length >= 2 && value !== "—" && value !== "未提供");
  const positions: number[] = [];
  for (const label of labels) {
    let from = 0;
    while (from < source.length) {
      const position = source.indexOf(label, from);
      if (position < 0) break;
      positions.push(position);
      from = position + label.length;
    }
  }
  if (positions.length === 0) return undefined;

  // In a flattened DOCX paragraph, two education records can be only a few
  // characters apart. Prefer the first date range *after* the matched school
  // or degree label (the usual `school · degree · dates` order); absolute
  // nearest-distance would incorrectly give the previous degree's dates.
  const forwardCandidates = positions.flatMap((position) =>
    matches
      .filter((match) => match.index >= position)
      .map((match) => ({ ...match, distance: match.index - position }))
      .filter((match) => match.distance <= 260),
  );
  const closest = (forwardCandidates.length > 0 ? forwardCandidates : matches.map((match) => ({
    ...match,
    distance: Math.min(...positions.map((position) => Math.abs(match.index - position))),
  }))).sort((left, right) => left.distance - right.distance)[0];
  // A very distant match is more likely to belong to another section.
  return closest.distance <= 500 ? closest.value : undefined;
}

export function sourceEvidenceForEntry(
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

export function attachResumeEvidence(data: ResumeData, source: string): ResumeData {
  const normalizedSource = source.trim();
  if (!normalizedSource) return data;
  const lines = normalizedSource.split(/\r?\n|[。；;]/).map(cleanLine).filter(Boolean);
  const findEvidence = (entry: { role?: string; org?: string; school?: string; degree?: string }) => {
    const evidence = sourceEvidenceForEntry(entry, lines);
    return evidence ? [evidence.slice(0, 1000)] : [];
  };
  return {
    ...data,
    experience: data.experience.map((entry) => ({
      ...entry,
      sourceEvidence: entry.sourceEvidence.length ? entry.sourceEvidence : findEvidence(entry),
    })),
    education: data.education,
  };
}

function guardEntryDates<T extends { dates: string; role?: string; org?: string; school?: string; degree?: string }>(entry: T, lines: string[], sourceYears: Set<string>) {
  const source = lines.join("\n");
  const exactRange = sourceDateRangeForEntry(entry, source);
  if (exactRange) return { ...entry, dates: exactRange };

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

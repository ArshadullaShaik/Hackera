import axios from "axios";
import * as cheerio from "cheerio";

export interface HackathonDetailDates {
  startsAt?: string;
  endsAt?: string;
  registrationStartsAt?: string;
  registrationEndsAt?: string;
}

const DATE_KEY_PATTERNS: Record<keyof HackathonDetailDates, RegExp[]> = {
  startsAt: [/^starts?at$/i, /^start[_-]?at$/i, /^start[_-]?date$/i, /^event[_-]?start(?:at|date|time)?$/i],
  endsAt: [/^ends?at$/i, /^end[_-]?at$/i, /^end[_-]?date$/i, /^event[_-]?end(?:at|date|time)?$/i],
  registrationStartsAt: [
    /registration.*(start|open|begin)/i,
    /application.*(start|open|begin)/i,
    /apply.*(open|start)/i,
    /signup.*(open|start)/i,
    /^registration[_-]?(open|start)(?:at|date|time)?$/i,
  ],
  registrationEndsAt: [
    /registration.*(end|close|deadline|until)/i,
    /application.*(end|close|deadline|until)/i,
    /apply.*(close|end|deadline|until)/i,
    /signup.*(close|end|deadline|until)/i,
    /^deadline$/i,
    /^registration[_-]?(close|end)(?:at|date|time)?$/i,
  ],
};

function normalizeDateValue(value: unknown): string | undefined {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  }

  if (typeof value !== "string" && typeof value !== "number") {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function matchesKey(targetField: keyof HackathonDetailDates, key: string): boolean {
  const compactKey = key.replace(/[^a-zA-Z]/g, "");
  return DATE_KEY_PATTERNS[targetField].some((pattern) => pattern.test(key) || pattern.test(compactKey));
}

function walkDateSource(source: unknown, dates: HackathonDetailDates, seen = new WeakSet<object>()): void {
  if (!source || typeof source !== "object") {
    return;
  }

  if (seen.has(source as object)) {
    return;
  }

  seen.add(source as object);

  if (Array.isArray(source)) {
    for (const item of source) {
      walkDateSource(item, dates, seen);
    }
    return;
  }

  for (const [key, value] of Object.entries(source as Record<string, unknown>)) {
    for (const field of Object.keys(DATE_KEY_PATTERNS) as Array<keyof HackathonDetailDates>) {
      if (!dates[field] && matchesKey(field, key)) {
        const normalized = normalizeDateValue(value);
        if (normalized) {
          dates[field] = normalized;
          break;
        }
      }
    }

    if (typeof value === "object" && value !== null) {
      walkDateSource(value, dates, seen);
    }
  }
}

function extractJsonCandidatesFromHtml(html: string): unknown[] {
  const $ = cheerio.load(html);
  const candidates: unknown[] = [];

  $("script").each((_, script) => {
    const content = $(script).html()?.trim();
    if (!content) {
      return;
    }

    candidates.push(content);
  });

  const bodyText = $("body").text().trim();
  if (bodyText) {
    candidates.push(bodyText);
  }

  return candidates;
}

function tryParseJson(text: string): unknown | undefined {
  const trimmed = text.trim();
  if (!trimmed) {
    return undefined;
  }

  const directCandidates = [trimmed];
  const assignmentMatch = trimmed.match(/(?:window\.[\w$]+\s*=\s*|self\.[\w$]+\s*=\s*)(\{[\s\S]*\})\s*;?$/);
  if (assignmentMatch?.[1]) {
    directCandidates.unshift(assignmentMatch[1]);
  }

  for (const candidate of directCandidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      continue;
    }
  }

  return undefined;
}

export function extractDetailDates(detailPayload: unknown): HackathonDetailDates {
  const dates: HackathonDetailDates = {};

  const visit = (payload: unknown): void => {
    if (!payload) {
      return;
    }

    if (typeof payload === "string") {
      const parsed = tryParseJson(payload);
      if (parsed !== undefined) {
        visit(parsed);
        return;
      }

      if (payload.includes("<")) {
        for (const candidate of extractJsonCandidatesFromHtml(payload)) {
          if (typeof candidate === "string") {
            const nestedParsed = tryParseJson(candidate);
            if (nestedParsed !== undefined) {
              visit(nestedParsed);
            }
          } else {
            visit(candidate);
          }
        }
      }

      return;
    }

    walkDateSource(payload, dates);
  };

  visit(detailPayload);
  return dates;
}

export function mergeRawSourcePayload(basePayload: unknown, detailPayload: unknown): Record<string, unknown> {
  if (basePayload && typeof basePayload === "object" && !Array.isArray(basePayload)) {
    return {
      ...(basePayload as Record<string, unknown>),
      detail: detailPayload,
    };
  }

  return {
    source: basePayload,
    detail: detailPayload,
  };
}

export async function mapWithConcurrency<T, U>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<U>
): Promise<U[]> {
  if (items.length === 0) {
    return [];
  }

  const safeConcurrency = Math.max(1, Math.floor(concurrency));
  const results: U[] = new Array(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  const workerCount = Math.min(safeConcurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

export async function fetchDetailPayload(url: string, timeout: number, headers?: Record<string, string>): Promise<unknown> {
  const response = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/json,application/xhtml+xml,*/*",
      ...headers,
    },
    timeout,
  });

  return response.data;
}
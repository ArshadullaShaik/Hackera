import axios from "axios";
import * as cheerio from "cheerio";
const DATE_KEY_PATTERNS = {
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
        /^registration[_-]?(close|end)(?:at|date|time)?$/i,
    ],
};
function normalizeDateValue(value) {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
    }
    if (typeof value !== "string" && typeof value !== "number") {
        return undefined;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}
function matchesKey(targetField, key) {
    const compactKey = key.replace(/[^a-zA-Z]/g, "");
    return DATE_KEY_PATTERNS[targetField].some((pattern) => pattern.test(key) || pattern.test(compactKey));
}
function walkDateSource(source, dates, seen = new WeakSet()) {
    if (!source || typeof source !== "object") {
        return;
    }
    if (seen.has(source)) {
        return;
    }
    seen.add(source);
    if (Array.isArray(source)) {
        for (const item of source) {
            walkDateSource(item, dates, seen);
        }
        return;
    }
    for (const [key, value] of Object.entries(source)) {
        for (const field of Object.keys(DATE_KEY_PATTERNS)) {
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
function extractJsonCandidatesFromHtml(html) {
    const $ = cheerio.load(html);
    const candidates = [];
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
function tryParseJson(text) {
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
        }
        catch {
            continue;
        }
    }
    return undefined;
}
export function extractDetailDates(detailPayload) {
    const dates = {};
    const visit = (payload) => {
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
                    }
                    else {
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
export function mergeRawSourcePayload(basePayload, detailPayload) {
    if (basePayload && typeof basePayload === "object" && !Array.isArray(basePayload)) {
        return {
            ...basePayload,
            detail: detailPayload,
        };
    }
    return {
        source: basePayload,
        detail: detailPayload,
    };
}
export async function mapWithConcurrency(items, concurrency, mapper) {
    if (items.length === 0) {
        return [];
    }
    const safeConcurrency = Math.max(1, Math.floor(concurrency));
    const results = new Array(items.length);
    let nextIndex = 0;
    async function worker() {
        while (nextIndex < items.length) {
            const currentIndex = nextIndex++;
            results[currentIndex] = await mapper(items[currentIndex], currentIndex);
        }
    }
    const workerCount = Math.min(safeConcurrency, items.length);
    await Promise.all(Array.from({ length: workerCount }, () => worker()));
    return results;
}
export async function fetchDetailPayload(url, timeout, headers) {
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
//# sourceMappingURL=detail-enrichment.js.map
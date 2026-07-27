module.exports = [
"[project]/src/dedup/dedup.service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DedupService",
    ()=>DedupService,
    "isDateClose",
    ()=>isDateClose,
    "normalizeTitle",
    ()=>normalizeTitle,
    "titleSimilarity",
    ()=>titleSimilarity
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/core/logger.ts [app-route] (ecmascript)");
;
function normalizeTitle(title) {
    return title.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
}
function titleSimilarity(a, b) {
    const normA = normalizeTitle(a);
    const normB = normalizeTitle(b);
    if (normA === normB) return 1.0;
    if (!normA || !normB) return 0.0;
    // 1. Token (word) set similarity (Jaccard on words)
    const wordsA = new Set(normA.split(" ").filter((w)=>w.length > 0));
    const wordsB = new Set(normB.split(" ").filter((w)=>w.length > 0));
    let wordIntersection = 0;
    for (const w of wordsA){
        if (wordsB.has(w)) wordIntersection++;
    }
    const wordUnion = new Set([
        ...wordsA,
        ...wordsB
    ]).size;
    const wordSimilarity = wordUnion > 0 ? wordIntersection / wordUnion : 0;
    // Prefix/Subsequence match check
    if (normA.startsWith(normB) || normB.startsWith(normA)) {
        const minLen = Math.min(normA.length, normB.length);
        const maxLen = Math.max(normA.length, normB.length);
        if (minLen / maxLen > 0.5) {
            return Math.max(0.85, wordSimilarity);
        }
    }
    // 2. Character Bigram similarity
    if (normA.length < 2 || normB.length < 2) return wordSimilarity;
    const getBigrams = (str)=>{
        const bigrams = new Map();
        for(let i = 0; i < str.length - 1; i++){
            const bigram = str.substring(i, i + 2);
            bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
        }
        return bigrams;
    };
    const bigramsA = getBigrams(normA);
    const bigramsB = getBigrams(normB);
    let intersection = 0;
    for (const [bigram, countA] of bigramsA.entries()){
        const countB = bigramsB.get(bigram);
        if (countB) {
            intersection += Math.min(countA, countB);
        }
    }
    const totalBigrams = normA.length - 1 + (normB.length - 1);
    const bigramSimilarity = 2.0 * intersection / totalBigrams;
    // Return the higher of the two metric scores
    return Math.max(bigramSimilarity, wordSimilarity);
}
function isDateClose(dateA, dateB, toleranceMs = 24 * 60 * 60 * 1000) {
    const tA = new Date(dateA).getTime();
    const tB = new Date(dateB).getTime();
    return Math.abs(tA - tB) <= toleranceMs;
}
class DedupService {
    SIMILARITY_THRESHOLD = 0.8;
    TIME_TOLERANCE_MS = 24 * 60 * 60 * 1000;
    /**
   * Find matching existing hackathon from a DIFFERENT platform.
   * Returns matching existing ID if duplicate found, or null if unique.
   */ findDuplicate(candidate, existingList) {
        for (const existing of existingList){
            // Don't duplicate against same platform (handled by unique sourceId_sourcePlatform constraint)
            if (existing.sourcePlatform === candidate.sourcePlatform) {
                continue;
            }
            // Check date proximity
            if (!isDateClose(candidate.startsAt, existing.startsAt, this.TIME_TOLERANCE_MS)) {
                continue;
            }
            // Check title similarity
            const similarity = titleSimilarity(candidate.title, existing.title);
            if (similarity >= this.SIMILARITY_THRESHOLD) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info({
                    candidateTitle: candidate.title,
                    matchedTitle: existing.title,
                    similarity,
                    candidatePlatform: candidate.sourcePlatform,
                    matchedPlatform: existing.sourcePlatform
                }, "Cross-source duplicate identified");
                return existing;
            }
        }
        return null;
    }
}
}),
];

//# sourceMappingURL=src_dedup_dedup_service_ts_1yk7ca0._.js.map
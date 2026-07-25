import { NormalizedHackathon } from "../core/schema.js";
import { logger } from "../core/logger.js";

/**
 * Normalize title by converting to lowercase, replacing special characters and stripping extra whitespace.
 */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Compute Sorensen-Dice similarity coefficient for two strings.
 * Returns a value between 0 and 1.
 */
export function titleSimilarity(a: string, b: string): number {
  const normA = normalizeTitle(a);
  const normB = normalizeTitle(b);

  if (normA === normB) return 1.0;
  if (!normA || !normB) return 0.0;

  // 1. Token (word) set similarity (Jaccard on words)
  const wordsA = new Set(normA.split(" ").filter((w) => w.length > 0));
  const wordsB = new Set(normB.split(" ").filter((w) => w.length > 0));

  let wordIntersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) wordIntersection++;
  }
  const wordUnion = new Set([...wordsA, ...wordsB]).size;
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

  const getBigrams = (str: string): Map<string, number> => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bigram = str.substring(i, i + 2);
      bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
    }
    return bigrams;
  };

  const bigramsA = getBigrams(normA);
  const bigramsB = getBigrams(normB);

  let intersection = 0;
  for (const [bigram, countA] of bigramsA.entries()) {
    const countB = bigramsB.get(bigram);
    if (countB) {
      intersection += Math.min(countA, countB);
    }
  }

  const totalBigrams = (normA.length - 1) + (normB.length - 1);
  const bigramSimilarity = (2.0 * intersection) / totalBigrams;

  // Return the higher of the two metric scores
  return Math.max(bigramSimilarity, wordSimilarity);
}

/**
 * Check if two dates fall within a tolerance window (default 24 hours).
 */
export function isDateClose(
  dateA: Date | string,
  dateB: Date | string,
  toleranceMs: number = 24 * 60 * 60 * 1000
): boolean {
  const tA = new Date(dateA).getTime();
  const tB = new Date(dateB).getTime();
  return Math.abs(tA - tB) <= toleranceMs;
}

export interface ExistingHackathonRecord {
  id: string;
  title: string;
  startsAt: Date;
  sourcePlatform: string;
  description?: string | null;
  locationName?: string | null;
  imageUrl?: string | null;
  duplicateOfId?: string | null;
}

export class DedupService {
  private readonly SIMILARITY_THRESHOLD = 0.8;
  private readonly TIME_TOLERANCE_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Find matching existing hackathon from a DIFFERENT platform.
   * Returns matching existing ID if duplicate found, or null if unique.
   */
  findDuplicate(
    candidate: { title: string; startsAt: string | Date; sourcePlatform: string },
    existingList: ExistingHackathonRecord[]
  ): ExistingHackathonRecord | null {
    for (const existing of existingList) {
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
        logger.info(
          {
            candidateTitle: candidate.title,
            matchedTitle: existing.title,
            similarity,
            candidatePlatform: candidate.sourcePlatform,
            matchedPlatform: existing.sourcePlatform,
          },
          "Cross-source duplicate identified"
        );
        return existing;
      }
    }

    return null;
  }
}

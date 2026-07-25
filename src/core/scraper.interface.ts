import { NormalizedHackathon } from "./schema.js";

export interface Scraper {
  /**
   * Fetch and normalize hackathon events from the source.
   * Should fail fast on envelope-level errors (bad auth, service down).
   * Should fail soft on record-level errors (skip malformed individual records, log warning).
   */
  scrape(): Promise<NormalizedHackathon[]>;
}

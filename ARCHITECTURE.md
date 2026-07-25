# Hackera Architecture

## Project Overview
A TypeScript-based multi-source hackathon event aggregator. Currently in Phase 1: Luma scraper validation complete.

## Phase 1 Status: ✅ COMPLETE
- [x] TypeScript project setup with strict mode
- [x] Core `Scraper` interface and `NormalizedHackathon` schema
- [x] Luma scraper implemented with proper error handling (fail-fast envelope, fail-soft records)
- [x] Pagination support (fetches multiple pages)
- [x] Output: 38 valid events from Luma API
- [x] All acceptance criteria met

## Phase 2 Status: ✅ COMPLETE
- [x] Devfolio scraper implemented (HTML-based Type B)
- [x] Next.js dehydrated state JSON extraction
- [x] 27 valid events from Devfolio
- [x] Both scrapers run together: 65 total events
- [x] Schema validation passes for all events (datetime offset fix)
- [x] Fail-fast/fail-soft pattern proven across multiple sources
- [x] All acceptance criteria met

### Phase 2 Discovery: Devfolio Data Source
**Type**: HTML-based (Type B) — not a public REST API
- **Data location**: Embedded JSON in `<script>` tag
- **Structure**: Next.js dehydrated state format
- **Key path**: `props.pageProps.dehydratedState.queries[0].state.data.open_hackathons`
- **Field mappings**:
  - Event ID: `uuid` (not `api_id` like Luma)
  - Timestamps: ISO 8601 with timezone offset (e.g., `2026-08-08T06:00:00+00:00`)
  - Location: `is_online` boolean (true for online events, false for in-person; no hybrid or coordinates)
  - URL: slug only, construct as `https://devfolio.co/{slug}`
  - Settings: Rich metadata including registration dates, social links
- **Pagination**: None (all events returned at once)
- **Events retrieved**: 27 from global catalog

### Schema Evolution
The `NormalizedHackathonSchema` was generalized to support both sources:
- **Timestamps**: Changed from `z.string().datetime()` to `z.string().datetime({ offset: true })` to accept timezone-aware datetimes
- **Location fields**: Made GPS coordinates optional (Devfolio doesn't provide them)
- **Location type**: Handles both Luma's "offline/virtual" and Devfolio's boolean "is_online" flag
- **Flexibility**: Design allows consuming code to remain source-agnostic

### Schema Findings from Phase 1
**Luma API (`/discover/get-paginated-events`)**
- Type: REST API (requires valid `discover_place_api_id`)
- Response structure: `{ entries: [...], next_cursor: "..." }`
- Key field mappings:
  - Event data nested under `entry.event` 
  - Timestamps: ISO 8601 strings (not unix timestamps)
  - URL: slug only (construct full URL as `https://lu.ma/{slug}`)
  - Location: `location_type` enum (offline | virtual) + `geo_address_info` object
  - Coordinates: Available in `coordinate` object (latitude/longitude)
- Pagination: Uses cursor-based pagination via `pagination_cursor` param
- Note: Returns all events from a geographic area, not hackathon-specific; filtering by event type recommended for production

## Project Structure

```
src/
├── core/
│   ├── scraper.interface.ts      # Scraper interface all sources must implement
│   ├── schema.ts                 # NormalizedHackathon zod schema (supports both sources)
│   └── logger.ts                 # Pino logger configuration
├── scrapers/
│   ├── luma/
│   │   └── luma.scraper.ts       # Luma scraper (Type A: REST API) + raw schema
│   └── devfolio/
│       └── devfolio.scraper.ts   # Devfolio scraper (Type B: HTML JSON) + raw schema
└── index.ts                      # Entry point (runs all scrapers, aggregates results)
```

## Core Conventions (Established in Phase 1)

### Error Handling Pattern
- **Fail-fast at envelope level**: Invalid HTTP response, auth failure, timeout → throw error, stop processing
- **Fail-soft at record level**: Malformed individual event → log warning, skip record, continue
- See `luma.scraper.ts` lines ~95-112 for implementation reference

### Schema Organization
- **Raw schemas**: Source-specific zod schemas live INSIDE each scraper's folder (e.g. `LumaRawEventSchema`)
  - Reflect actual API response shape (field names, types, nullable/optional rules)
  - Never exported; used only for validation before mapping
- **Mapping layer**: Each scraper has a private `mapToNormalized()` method
  - Converts raw → `NormalizedHackathon`
  - Documents any unmappable fields as comments
  - Always includes full `rawSourcePayload` for debugging
- **Core schema**: `NormalizedHackathonSchema` in `src/core/schema.ts`
  - Canonical fields only (title, startsAt, locationType, sourceId, etc.)
  - Enforced via zod at mapping boundary

### Dependencies
- **HTTP**: `axios` with explicit timeouts (10s default)
- **HTML parsing**: `cheerio` (when needed)
- **JS-rendered sources**: `playwright` (not yet used)
- **Validation**: `zod` with strict parsing
- **Logging**: `pino` with `pino-pretty` for development
- **Framework**: Express (for Phase 4 API)

## Data Model

### NormalizedHackathon
```typescript
{
  // Canonical fields
  title: string
  description?: string
  startsAt: ISO8601 datetime
  endsAt?: ISO8601 datetime
  
  // Location
  locationType: "in-person" | "online" | "hybrid"
  locationName?: string
  latitude?: number
  longitude?: number
  
  // Source tracking
  sourceId: string                    // Platform's internal ID
  sourcePlatform: "luma" | "devfolio" | "devpost" | "other"
  canonicalUrl: string                // URL to the event on the source platform
  
  // Metadata
  imageUrl?: URL
  
  // For debugging: always keep raw payload
  rawSourcePayload: Record<string, unknown>
}
```

## Next Phases

## Next Phases

### Phase 3: PostgreSQL Persistence (READY)
Target: Store normalized results with dedup within same source.
Steps:
1. Choose ORM: Compare Prisma vs Drizzle vs raw `pg`
2. Design `hackathons` table with columns matching `NormalizedHackathon` + `id`, `createdAt`, `updatedAt`
3. Implement `hackathon.repository.ts` with `upsert(hackathon: NormalizedHackathon)` keyed on `(sourceId, sourcePlatform)`
4. Add docker-compose.yml with Postgres service
5. Run scrapers twice: verify second run updates instead of duplicates

Acceptance criteria:
- [ ] Second run doesn't create duplicates for same `(sourceId, sourcePlatform)`
- [ ] `docker-compose up` brings up working local Postgres
- [ ] All scraped events successfully stored

### Phase 4: REST API (Express) (READY)
Target: Expose stored data via HTTP.
Steps:
1. Create Express app in new `src/api/` folder
2. `GET /hackathons` — paginated list with query params: `search`, `platform`, `locationType`, `startsAfter`, `startsBefore`
3. `GET /hackathons/:id` — single record
4. Error middleware (400 for bad params, 500 with logging)
5. Rate limiting middleware

Acceptance criteria:
- [ ] All endpoints return correct JSON shape
- [ ] Filtering/search works correctly
- [ ] Invalid params return 400

### Phase 5: Queue + Scheduler (BullMQ + Redis) (READY)
Target: Automated scraping on schedule.
Steps:
1. Add Redis to docker-compose
2. BullMQ queue + worker per scraper: `scrape:luma`, `scrape:devfolio`
3. Node-cron or BullMQ repeatable jobs on interval
4. Retry with exponential backoff
5. Job result logging

Acceptance criteria:
- [ ] One failing scraper doesn't block others
- [ ] Transient failures auto-retry
- [ ] Logs track job history

### Phase 6: Cross-Source Dedup (READY)
Target: Merge likely-duplicate events from different platforms.
Steps:
1. Fuzzy match: normalize titles, compare startsAt (tolerance window), check locationName/geo proximity
2. Post-normalization step before DB upsert
3. Design merge strategy (duplicateOf link? keep richest record?)

Acceptance criteria:
- [ ] Test case identifies near-identical records from different platforms
- [ ] Merge strategy documented

### Phase 7: Testing, CI/CD, Docker (READY)
Target: Production hardening.
Steps:
1. Unit tests per scraper (mock HTTP)
2. Integration test for dedup
3. GitHub Actions: lint, test, build on PR
4. Full docker-compose with all services
5. Document deployment strategy

Acceptance criteria:
- [ ] `npm test` passes
- [ ] `docker-compose up` runs entire stack

## Development Commands

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript
npm start            # Run compiled app
npm run dev          # [todo] Direct TS execution
npm test             # [todo] Run tests
```

## Known Issues / Technical Debt
1. Direct TS execution (`npm run dev` via ts-node) fails with ES modules — workaround: build then run
2. Luma scraper uses generic location discover endpoint; may need event-type filtering for production use
3. No caching of paginated results — refetch on each run (fine for Phase 1, add for Phase 5)


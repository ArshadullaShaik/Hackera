<![CDATA[<div align="center">

# 🏆 HACKERA

**Multi-source hackathon aggregator — scrapes 8 platforms, deduplicates across sources, and serves a unified dashboard.**

[![CI](https://github.com/ArshadullaShaik/Hackera/actions/workflows/ci.yml/badge.svg)](https://github.com/ArshadullaShaik/Hackera/actions)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=nodedotjs)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)](https://redis.io)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

</div>

---

## 📖 What is Hackera?

Hackera automatically discovers hackathon events from **8 major platforms**, normalizes them into a canonical schema, deduplicates cross-platform listings, and presents them through a polished Next.js frontend and a RESTful API. Think of it as an aggregated "Google for Hackathons."

### Supported Platforms

| Platform | Method | Type |
|---|---|---|
| **Devfolio** | GraphQL API | API |
| **Devpost** | Web Scraping | HTML (Cheerio) |
| **MLH** | Web Scraping | HTML (Cheerio) |
| **Luma** | API | REST |
| **Unstop** | API | REST |
| **HackerEarth** | Web Scraping | HTML (Cheerio) |
| **Hack Club** | API | REST |
| **DoraHacks** | API | REST |

---

## 🏗️ Architecture

Hackera follows a **modular, service-oriented architecture** with clearly separated concerns across five layers:

```
┌────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                        │
│              src/app/ — SSR pages, client components              │
│        Vercel deployment ──► rewrites /api/* to backend           │
└─────────────────────────────┬──────────────────────────────────────┘
                              │ HTTP
┌─────────────────────────────▼──────────────────────────────────────┐
│                       REST API (Express)                          │
│              src/api/ — routes, middleware, validation             │
│         Rate limiting · Caching · Zod validation · CORS           │
│              Railway deployment (Docker container)                 │
└─────────────────────────────┬──────────────────────────────────────┘
                              │
┌─────────────────────────────▼──────────────────────────────────────┐
│                     PERSISTENCE LAYER                             │
│         src/persistence/ — Prisma ORM + raw SQL queries           │
│    HackathonRepository: upsert, filter, search, dedup, cleanup    │
└─────────────────────────────┬──────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
   ┌─────────────┐   ┌──────────────┐   ┌──────────────┐
   │ PostgreSQL  │   │    Redis     │   │   BullMQ     │
   │  (Prisma)   │   │  (ioredis)  │   │   Queue      │
   │  Data store │   │  Job broker │   │  Scheduler   │
   └─────────────┘   └──────────────┘   │  + Worker    │
                                        └──────┬───────┘
                                               │
                      ┌────────────────────────┼────────────────────────┐
                      ▼                        ▼                        ▼
               ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
               │ Scraper #1  │         │ Scraper #2  │   ...   │ Scraper #8  │
               │  (Devfolio) │         │  (Devpost)  │         │ (DoraHacks) │
               └──────┬──────┘         └──────┬──────┘         └──────┬──────┘
                      │                       │                       │
                      └───────────┬───────────┘                       │
                                  ▼                                   │
                      ┌───────────────────────┐                       │
                      │    Core Pipeline      │◄──────────────────────┘
                      │  Schema validation    │
                      │  Enrichment (tracks,  │
                      │    prizes, location)  │
                      │  Cross-source dedup   │
                      │  Auto-cleanup         │
                      └───────────────────────┘
```

### Layer Breakdown

#### 1. Scrapers (`src/scrapers/`)

Each platform has its own scraper module implementing the [`Scraper`](src/core/scraper.interface.ts) interface:

```typescript
interface Scraper {
  scrape(): Promise<NormalizedHackathon[]>;
}
```

Every scraper:
- Fetches raw data from its source (API call or HTML parsing via Cheerio/Playwright)
- Maps the source-specific response into the canonical [`NormalizedHackathon`](src/core/schema.ts) schema (validated with Zod)
- Preserves the raw payload in `rawSourcePayload` for debugging and future enrichment

#### 2. Core (`src/core/`)

Shared logic used across the entire application:

| File | Purpose |
|---|---|
| [`schema.ts`](src/core/schema.ts) | Zod schema for the canonical `NormalizedHackathon` type |
| [`scraper.interface.ts`](src/core/scraper.interface.ts) | Interface contract all scrapers implement |
| [`enrichment.ts`](src/core/enrichment.ts) | Location type detection, track classification (AI/ML, Web3, etc.), prize pool extraction |
| [`detail-enrichment.ts`](src/core/detail-enrichment.ts) | Extracts registration dates from raw payloads |
| [`card-utils.ts`](src/core/card-utils.ts) | Frontend display helpers (date formatting, badge generation) |
| [`cache.ts`](src/core/cache.ts) | In-memory TTL cache for API query responses |
| [`logger.ts`](src/core/logger.ts) | Pino-based structured logger |

#### 3. Deduplication (`src/dedup/`)

Cross-source deduplication engine that identifies when the same hackathon appears on multiple platforms:

- **Title similarity**: Sørensen–Dice coefficient + Jaccard word similarity (threshold: 0.8)
- **Date proximity**: Events must start within 24 hours of each other
- **Platform exclusion**: Only matches across _different_ platforms (same-platform uniqueness is enforced by the DB constraint `@@unique([sourceId, sourcePlatform])`)

#### 4. Queue System (`src/queue/`)

BullMQ-powered job queue backed by Redis:

| Process | Role |
|---|---|
| **Scheduler** (`scrape.scheduler.ts`) | Enqueues scrape jobs — either one-shot (`--once`) or repeating every 6 hours |
| **Worker** (`scrape.worker.ts`) | Processes scrape jobs one at a time (concurrency: 1), runs the full pipeline: scrape → filter active → upsert → dedup → cleanup |

Jobs retry with exponential backoff (30s → 60s → 120s, 3 attempts max).

#### 5. API (`src/api/`)

Express REST API serving hackathon data:

| Endpoint | Description |
|---|---|
| `GET /hackathons` | Paginated list with filters (`search`, `platform`, `locationType`, `startsAfter`, `startsBefore`, `includeDuplicates`) |
| `GET /hackathons/:id` | Single hackathon by UUID |
| `GET /health` | Health check |

**Middleware stack**: JSON parsing → Rate limiting (100 req / 15 min per IP) → Zod query validation → In-memory caching → Error handler

#### 6. Frontend (`src/app/`)

Next.js 16 App Router frontend:

- **Server-side rendering** with client-side interactive filters
- Search, platform filter, location type filter
- Infinite scroll / pagination (12 cards per page)
- Hackathon cards with track badges, prize pools, countdown timers
- Privacy and Terms pages
- Vercel Analytics integration

#### 7. Persistence (`src/persistence/`)

Repository pattern over Prisma ORM + raw SQL:

- **Upsert logic**: Insert-or-update on the composite key `(sourceId, sourcePlatform)`
- **Filtered queries**: Full-text ILIKE search, platform/location/date filters, pagination
- **Cross-source dedup**: Links duplicates via `duplicateOfId` foreign key
- **Auto-cleanup**: Deletes hackathons whose `endsAt` has passed
- **Scrape run logging**: Tracks success/failure/counts for observability

---

## 📊 Data Model

```
┌────────────────────────────────────────────────┐
│                 Hackathon                       │
├────────────────────────────────────────────────┤
│ id                UUID (PK)                    │
│ sourceId          String                       │
│ sourcePlatform    String                       │
│ title             String                       │
│ description       String                       │
│ startsAt          DateTime                     │
│ endsAt            DateTime?                    │
│ locationType      "in-person"|"online"|"hybrid"│
│ locationName      String?                      │
│ latitude / longitude  Float?                   │
│ canonicalUrl      String                       │
│ imageUrl          String?                      │
│ rawSourcePayload  JSON                         │
│ duplicateOfId     UUID? → self FK              │
│ createdAt / updatedAt                          │
├────────────────────────────────────────────────┤
│ @@unique([sourceId, sourcePlatform])           │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│                 ScrapeRun                       │
├────────────────────────────────────────────────┤
│ id              UUID (PK)                      │
│ platform        String                         │
│ status          "completed" | "failed"         │
│ eventsCreated   Int                            │
│ eventsUpdated   Int                            │
│ errorMessage    String?                        │
│ startedAt / completedAt / createdAt            │
└────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x
- **Docker & Docker Compose** (for PostgreSQL + Redis)

### 1. Clone & Install

```bash
git clone https://github.com/ArshadullaShaik/Hackera.git
cd Hackera
npm install
```

### 2. Start Infrastructure

```bash
docker compose up -d
```

This spins up:
- **PostgreSQL 16** on port `5432`
- **Redis 7** on port `6379`

### 3. Configure Environment

```bash
cp .env.example .env
```

Default `.env`:

```env
DATABASE_URL="postgresql://hackera_user:hackera_password@localhost:5432/hackera_db?schema=public"
REDIS_HOST="localhost"
REDIS_PORT="6379"
PORT="3000"
LOG_LEVEL="info"
```

### 4. Set Up Database

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Run

You can run Hackera in different modes:

```bash
# One-shot scrape (scrape all platforms once, persist, and exit)
npm run dev

# Start the Express API server
npm run api

# Start the Next.js frontend
npm run dev:next

# Start the BullMQ worker (processes scrape jobs)
npm run worker

# Start the scheduler (enqueue jobs every 6 hours)
npm run scheduler

# One-shot scheduler (enqueue once and exit)
npm run scheduler:once
```

---

## 🐳 Docker Production Deployment

The project includes a multi-stage `Dockerfile` and a full `docker-compose.yml`:

```bash
# Build and start all services (API + Worker + Postgres + Redis)
docker compose up --build
```

| Service | Container | Port |
|---|---|---|
| PostgreSQL | `hackera-db` | 5432 |
| Redis | `hackera-redis` | 6379 |
| API Server | `hackera-api` | 3000 |
| Scrape Worker | `hackera-worker` | — |

### Platform Deployments

| Component | Platform | Config |
|---|---|---|
| Frontend (Next.js) | **Vercel** | [`vercel.json`](vercel.json) |
| Backend (API + Worker) | **Railway** | [`railway.json`](railway.json), [`Dockerfile`](Dockerfile) |

The Next.js frontend proxies `/api/*` requests to the Railway backend via [`next.config.mjs`](next.config.mjs) rewrites (configured by `RAILWAY_API_URL`).

---

## 🧪 Testing

```bash
# Run all tests
npm test
```

Tests use **Vitest** and cover:
- Scraper normalization logic
- Deduplication (title similarity, date proximity)
- API query validation middleware
- Enrichment helpers (tracks, prizes, location types)
- Repository operations
- Cache behavior

---

## 📁 Project Structure

```
Hackera/
├── prisma/
│   ├── schema.prisma          # Database schema (Hackathon + ScrapeRun models)
│   └── migrations/            # Prisma migration history
├── public/                    # Static frontend assets (legacy HTML version)
├── scripts/
│   └── fix-esm-imports.mjs    # Post-build ESM import fixer
├── src/
│   ├── index.ts               # CLI entry point (one-shot scrape-all)
│   ├── api/
│   │   ├── server.ts          # Express app factory + startup
│   │   ├── routes/
│   │   │   └── hackathons.ts  # GET /hackathons, GET /hackathons/:id
│   │   └── middleware/
│   │       ├── validate.ts    # Zod schemas for query/param validation
│   │       └── error-handler.ts
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout (navbar, footer)
│   │   ├── page.tsx           # Main hackathon explorer page
│   │   ├── globals.css        # Global styles
│   │   ├── api/hackathons/    # Next.js API route (proxy)
│   │   ├── privacy/           # Privacy policy page
│   │   └── terms/             # Terms of service page
│   ├── core/
│   │   ├── schema.ts          # NormalizedHackathon Zod schema
│   │   ├── scraper.interface.ts
│   │   ├── enrichment.ts      # Location, tracks, prize extraction
│   │   ├── detail-enrichment.ts
│   │   ├── card-utils.ts      # Frontend display helpers
│   │   ├── cache.ts           # In-memory TTL cache
│   │   └── logger.ts          # Pino logger
│   ├── dedup/
│   │   └── dedup.service.ts   # Cross-source dedup (Dice + Jaccard)
│   ├── persistence/
│   │   ├── db.ts              # Prisma client factory
│   │   └── hackathon.repository.ts  # Data access layer
│   ├── queue/
│   │   ├── connection.ts      # Redis connection factory
│   │   ├── scrape.scheduler.ts
│   │   └── scrape.worker.ts
│   └── scrapers/
│       ├── devfolio/          # Devfolio scraper
│       ├── devpost/           # Devpost scraper
│       ├── dorahacks/         # DoraHacks scraper
│       ├── hackclub/          # Hack Club scraper
│       ├── hackerearth/       # HackerEarth scraper
│       ├── luma/              # Luma scraper
│       ├── mlh/               # MLH scraper
│       └── unstop/            # Unstop scraper
├── docker-compose.yml         # Local dev infrastructure
├── Dockerfile                 # Multi-stage production build
├── railway.json               # Railway deployment config
├── vercel.json                # Vercel deployment config
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## ⚙️ Tech Stack

| Category | Technology |
|---|---|
| **Language** | TypeScript (ESM) |
| **Runtime** | Node.js 20 |
| **Frontend** | Next.js 16 (App Router), React 19 |
| **Backend API** | Express 4 |
| **Database** | PostgreSQL 16 (via Prisma ORM) |
| **Job Queue** | BullMQ + Redis 7 (ioredis) |
| **Web Scraping** | Cheerio, Axios, Playwright |
| **Validation** | Zod |
| **Logging** | Pino |
| **Testing** | Vitest |
| **Deployment** | Docker, Vercel (frontend), Railway (backend) |
| **Analytics** | Vercel Analytics |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-scraper`)
3. Commit your changes (`git commit -m 'Add new scraper for X platform'`)
4. Push to the branch (`git push origin feature/new-scraper`)
5. Open a Pull Request

### Adding a New Scraper

1. Create a new directory under `src/scrapers/<platform-name>/`
2. Implement the `Scraper` interface from `src/core/scraper.interface.ts`
3. Map the source response to `NormalizedHackathon` using `NormalizedHackathonSchema.parse()`
4. Register the scraper in `src/index.ts` and `src/queue/scrape.worker.ts`
5. Add the platform name to the `sourcePlatform` enum in `src/core/schema.ts`
6. Add tests in a co-located `*.test.ts` file

---

## 📄 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
]]>

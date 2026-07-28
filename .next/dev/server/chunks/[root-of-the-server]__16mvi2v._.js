module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/src/core/logger.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "logger",
    ()=>logger
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__ = __turbopack_context__.i("[externals]/pino [external] (pino, cjs, [project]/node_modules/pino)");
;
const logger = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$pino__$5b$external$5d$__$28$pino$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$pino$29$__["default"])({
    level: process.env.LOG_LEVEL || "info",
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname"
        }
    }
});
}),
"[project]/src/persistence/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "disconnectPrisma",
    ()=>disconnectPrisma,
    "getPrismaClient",
    ()=>getPrismaClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dotenv$2f$lib$2f$main$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/dotenv/lib/main.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$pg$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@prisma/adapter-pg/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/node_modules/pg)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/core/logger.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$pg$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$pg$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dotenv$2f$lib$2f$main$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].config();
;
;
;
;
let prisma;
function getPrismaClient() {
    if (!prisma) {
        const pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["default"].Pool({
            connectionString: process.env.DATABASE_URL
        });
        const adapter = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$pg$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PrismaPg"](pool);
        prisma = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
            adapter,
            log: [
                {
                    level: "error",
                    emit: "stdout"
                },
                {
                    level: "warn",
                    emit: "stdout"
                }
            ]
        });
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("Prisma client initialized");
    }
    return prisma;
}
async function disconnectPrisma() {
    if (prisma) {
        await prisma.$disconnect();
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info("Prisma client disconnected");
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/persistence/hackathon.repository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HackathonRepository",
    ()=>HackathonRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/core/logger.ts [app-route] (ecmascript)");
;
class HackathonRepository {
    prisma;
    constructor(prisma){
        this.prisma = prisma;
    }
    /**
   * Upsert a hackathon: update if (sourceId, sourcePlatform) already exists, else create new.
   * Uses Prisma's native upsert — atomic, no race condition.
   */ async upsert(hackathon) {
        try {
            // Check if record exists to determine created vs updated
            const existing = await this.prisma.hackathon.findUnique({
                where: {
                    sourceId_sourcePlatform: {
                        sourceId: hackathon.sourceId,
                        sourcePlatform: hackathon.sourcePlatform
                    }
                },
                select: {
                    id: true
                }
            });
            const data = {
                title: hackathon.title,
                description: hackathon.description,
                startsAt: new Date(hackathon.startsAt),
                endsAt: hackathon.endsAt ? new Date(hackathon.endsAt) : null,
                locationType: hackathon.locationType,
                locationName: hackathon.locationName,
                latitude: hackathon.latitude,
                longitude: hackathon.longitude,
                canonicalUrl: hackathon.canonicalUrl,
                imageUrl: hackathon.imageUrl,
                rawSourcePayload: hackathon.rawSourcePayload
            };
            const result = await this.prisma.hackathon.upsert({
                where: {
                    sourceId_sourcePlatform: {
                        sourceId: hackathon.sourceId,
                        sourcePlatform: hackathon.sourcePlatform
                    }
                },
                update: data,
                create: {
                    sourceId: hackathon.sourceId,
                    sourcePlatform: hackathon.sourcePlatform,
                    ...data
                }
            });
            const created = !existing;
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].debug({
                id: result.id,
                platform: hackathon.sourcePlatform,
                sourceId: hackathon.sourceId,
                created
            }, created ? "Hackathon record created" : "Hackathon record updated");
            return {
                id: result.id,
                created
            };
        } catch (error) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].error({
                error: error instanceof Error ? error.message : String(error),
                hackathon: {
                    title: hackathon.title,
                    sourceId: hackathon.sourceId
                }
            }, "Failed to upsert hackathon");
            throw error;
        }
    }
    /**
   * Batch upsert hackathons. Fail-soft: logs and skips individual failures.
   */ async upsertBatch(hackathons) {
        let created = 0;
        let updated = 0;
        for (const hackathon of hackathons){
            try {
                const result = await this.upsert(hackathon);
                if (result.created) {
                    created++;
                } else {
                    updated++;
                }
            } catch (error) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].warn({
                    error: error instanceof Error ? error.message : String(error),
                    title: hackathon.title
                }, "Failed to upsert individual hackathon in batch");
            // Continue processing remaining hackathons
            }
        }
        return {
            created,
            updated
        };
    }
    /**
   * Query hackathons with combined optional filters + pagination.
   * Returns both data and total count for pagination metadata.
   */ async findFiltered(filters) {
        const where = {};
        if (!filters.includeDuplicates) {
            where.duplicateOfId = null;
        }
        if (filters.search) {
            where.OR = [
                {
                    title: {
                        contains: filters.search,
                        mode: "insensitive"
                    }
                },
                {
                    description: {
                        contains: filters.search,
                        mode: "insensitive"
                    }
                }
            ];
        }
        if (filters.platform) {
            where.sourcePlatform = filters.platform;
        }
        if (filters.locationType) {
            where.locationType = filters.locationType;
        }
        if (filters.startsAfter || filters.startsBefore) {
            where.startsAt = {};
            if (filters.startsAfter) {
                where.startsAt.gte = filters.startsAfter;
            }
            if (filters.startsBefore) {
                where.startsAt.lte = filters.startsBefore;
            }
        }
        const offset = (filters.page - 1) * filters.limit;
        const [data, total] = await Promise.all([
            this.prisma.hackathon.findMany({
                where,
                take: filters.limit,
                skip: offset,
                orderBy: {
                    startsAt: "asc"
                }
            }),
            this.prisma.hackathon.count({
                where
            })
        ]);
        return {
            data,
            total
        };
    }
    /**
   * Run cross-source deduplication on all records.
   * Identifies near-duplicate hackathons across platforms and links duplicate records.
   */ async runCrossSourceDeduplication() {
        const { DedupService } = await __turbopack_context__.A("[project]/src/dedup/dedup.service.ts [app-route] (ecmascript, async loader)");
        const dedupService = new DedupService();
        const allHackathons = await this.prisma.hackathon.findMany({
            select: {
                id: true,
                title: true,
                startsAt: true,
                sourcePlatform: true,
                description: true,
                locationName: true,
                imageUrl: true,
                duplicateOfId: true
            },
            orderBy: {
                createdAt: "asc"
            }
        });
        let duplicatesFound = 0;
        for(let i = 0; i < allHackathons.length; i++){
            const current = allHackathons[i];
            if (current.duplicateOfId) continue; // Already marked as duplicate
            const existingBefore = allHackathons.slice(0, i).filter((h)=>!h.duplicateOfId);
            const match = dedupService.findDuplicate(current, existingBefore);
            if (match) {
                const canonicalId = match.duplicateOfId || match.id;
                await this.prisma.hackathon.update({
                    where: {
                        id: current.id
                    },
                    data: {
                        duplicateOfId: canonicalId
                    }
                });
                current.duplicateOfId = canonicalId;
                duplicatesFound++;
            }
        }
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].info({
            duplicatesFound
        }, "Cross-source deduplication sweep complete");
        return duplicatesFound;
    }
    /**
   * Find a single hackathon by internal UUID.
   */ async findById(id) {
        return this.prisma.hackathon.findUnique({
            where: {
                id
            }
        });
    }
    /**
   * Get all hackathons from database (paginated).
   */ async findAll(limit = 100, offset = 0) {
        return this.prisma.hackathon.findMany({
            take: limit,
            skip: offset,
            orderBy: {
                startsAt: "asc"
            }
        });
    }
    /**
   * Get total count of hackathons.
   */ async count() {
        return this.prisma.hackathon.count();
    }
    /**
   * Get hackathons by platform.
   */ async findByPlatform(platform, limit = 100, offset = 0) {
        return this.prisma.hackathon.findMany({
            where: {
                sourcePlatform: platform
            },
            take: limit,
            skip: offset,
            orderBy: {
                startsAt: "asc"
            }
        });
    }
    /**
   * Get hackathons by date range.
   */ async findByDateRange(startsAfter, startsBefore, limit = 100) {
        return this.prisma.hackathon.findMany({
            where: {
                startsAt: {
                    gte: startsAfter,
                    lte: startsBefore
                }
            },
            take: limit,
            orderBy: {
                startsAt: "asc"
            }
        });
    }
    /**
   * Log a scrape run for job history tracking.
   */ async logScrapeRun(run) {
        await this.prisma.scrapeRun.create({
            data: run
        });
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logger"].debug({
            platform: run.platform,
            status: run.status
        }, "Scrape run logged");
    }
}
}),
"[project]/src/api/middleware/validate.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HackathonQuerySchema",
    ()=>HackathonQuerySchema,
    "UuidParamSchema",
    ()=>UuidParamSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
const HackathonQuerySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    search: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].preprocess((val)=>val === "" ? undefined : val, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()),
    platform: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].preprocess((val)=>val === "" ? undefined : val, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "luma",
        "devfolio",
        "devpost",
        "mlh",
        "unstop",
        "hackerearth",
        "hackclub",
        "other"
    ]).optional()),
    locationType: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].preprocess((val)=>val === "" ? undefined : val, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "in-person",
        "online",
        "hybrid"
    ]).optional()),
    startsAfter: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].preprocess((val)=>val === "" ? undefined : val, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().refine((s)=>!isNaN(Date.parse(s)), {
        message: "startsAfter must be a valid date (ISO 8601)"
    }).optional()),
    startsBefore: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].preprocess((val)=>val === "" ? undefined : val, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().refine((s)=>!isNaN(Date.parse(s)), {
        message: "startsBefore must be a valid date (ISO 8601)"
    }).optional()),
    includeDuplicates: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].preprocess((val)=>val === "" ? undefined : val === "true" || val === "1", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional()),
    page: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.number().int().min(1, "page must be >= 1").default(1),
    limit: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.number().int().min(1, "limit must be >= 1").max(100, "limit must be <= 100").default(20)
});
const UuidParamSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid("id must be a valid UUID")
});
}),
"[project]/src/app/api/hackathons/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$persistence$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/persistence/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$persistence$2f$hackathon$2e$repository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/persistence/hackathon.repository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$middleware$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/api/middleware/validate.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$persistence$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$persistence$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const queryObj = {};
        searchParams.forEach((value, key)=>{
            queryObj[key] = value;
        });
        const parseResult = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$api$2f$middleware$2f$validate$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HackathonQuerySchema"].safeParse(queryObj);
        if (!parseResult.success) {
            const messages = parseResult.error.errors.map((e)=>`${e.path.join(".")}: ${e.message}`).join("; ");
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: {
                    message: `Invalid query parameters: ${messages}`
                }
            }, {
                status: 400
            });
        }
        const { search, platform, locationType, startsAfter, startsBefore, includeDuplicates, page, limit } = parseResult.data;
        const prisma = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$persistence$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPrismaClient"])();
        const repository = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$persistence$2f$hackathon$2e$repository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HackathonRepository"](prisma);
        const { data, total } = await repository.findFiltered({
            search,
            platform,
            locationType,
            startsAfter: startsAfter ? new Date(startsAfter) : undefined,
            startsBefore: startsBefore ? new Date(startsBefore) : undefined,
            includeDuplicates,
            page,
            limit
        });
        const totalPages = Math.ceil(total / limit);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            data,
            meta: {
                total,
                page,
                limit,
                totalPages
            }
        });
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: {
                message: error instanceof Error ? error.message : "Internal Server Error"
            }
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__16mvi2v._.js.map
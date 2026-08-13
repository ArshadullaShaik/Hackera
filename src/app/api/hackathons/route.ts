import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "../../../persistence/db";
import { HackathonRepository } from "../../../persistence/hackathon.repository";
import { HackathonQuerySchema } from "../../../api/middleware/validate";
import { apiQueryCache } from "../../../core/cache";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryObj: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      queryObj[key] = value;
    });

    const parseResult = HackathonQuerySchema.safeParse(queryObj);
    if (!parseResult.success) {
      const messages = parseResult.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      return NextResponse.json(
        { error: { message: `Invalid query parameters: ${messages}` } },
        { status: 400 }
      );
    }

    const cacheKey = JSON.stringify(parseResult.data);
    const cachedResponse = apiQueryCache.get(cacheKey);
    if (cachedResponse) {
      return NextResponse.json(cachedResponse, {
        headers: {
          "X-Cache": "HIT",
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      });
    }

    const {
      search,
      platform,
      locationType,
      startsAfter,
      startsBefore,
      includeDuplicates,
      page,
      limit,
    } = parseResult.data;

    const prisma = getPrismaClient();
    const repository = new HackathonRepository(prisma);

    const { data, total } = await repository.findFiltered({
      search,
      platform,
      locationType,
      startsAfter: startsAfter ? new Date(startsAfter) : undefined,
      startsBefore: startsBefore ? new Date(startsBefore) : undefined,
      includeDuplicates,
      page,
      limit,
    });

    const totalPages = Math.ceil(total / limit);
    const payload = {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };

    apiQueryCache.set(cacheKey, payload);

    return NextResponse.json(payload, {
      headers: {
        "X-Cache": "MISS",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("GET /api/hackathons failed", error);
    return NextResponse.json(
      {
        error: {
          message,
        },
      },
      { status: 500 }
    );
  }
}

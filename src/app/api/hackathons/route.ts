import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "../../../persistence/db";
import { HackathonRepository } from "../../../persistence/hackathon.repository";
import { HackathonQuerySchema } from "../../../api/middleware/validate";

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

    return NextResponse.json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof Error ? error.message : "Internal Server Error",
        },
      },
      { status: 500 }
    );
  }
}

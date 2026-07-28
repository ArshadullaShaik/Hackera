import { NextResponse } from "next/server";
import { getPrismaClient } from "../../../persistence/db.js";
import { HackathonRepository } from "../../../persistence/hackathon.repository.js";
import { HackathonQuerySchema } from "../../../api/middleware/validate.js";
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const queryObj = {};
        searchParams.forEach((value, key) => {
            queryObj[key] = value;
        });
        const parseResult = HackathonQuerySchema.safeParse(queryObj);
        if (!parseResult.success) {
            const messages = parseResult.error.errors
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join("; ");
            return NextResponse.json({ error: { message: `Invalid query parameters: ${messages}` } }, { status: 400 });
        }
        const { search, platform, locationType, startsAfter, startsBefore, includeDuplicates, page, limit, } = parseResult.data;
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
    }
    catch (error) {
        return NextResponse.json({
            error: {
                message: error instanceof Error ? error.message : "Internal Server Error",
            },
        }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map
import { NextRequest, NextResponse } from "next/server";
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: {
        message: string;
    };
}> | NextResponse<{
    data: any[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}>>;
//# sourceMappingURL=route.d.ts.map
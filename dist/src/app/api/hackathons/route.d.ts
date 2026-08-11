import { NextRequest, NextResponse } from "next/server";
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: {
        message: string;
    };
}> | NextResponse<{
    data: any[];
    meta: any;
}>>;
//# sourceMappingURL=route.d.ts.map
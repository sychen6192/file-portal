import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
    try {
        const name = new URL(req.url).searchParams.get("name");
        if (!name) {
            return NextResponse.json({ error: "Missing 'name' parameter" }, { status: 400 });
        }

        const filePath = path.join(process.cwd(), "data/uploads", name);
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const stat = fs.statSync(filePath);
        const stream = fs.createReadStream(filePath);

        const ext = path.extname(filePath).toLowerCase();
        const mimeMap: Record<string, string> = {
            ".txt": "text/plain",
            ".json": "application/json",
            ".csv": "text/csv",
            ".zip": "application/zip",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".pdf": "application/pdf",
        };
        const contentType = mimeMap[ext] || "application/octet-stream";

        return new Response(stream as any, {
            headers: {
                "Content-Type": contentType,
                "Content-Length": stat.size.toString(),
                "Content-Disposition": `attachment; filename="${path.basename(filePath)}"`,
            },
        });
    } catch (err) {
        console.error("❌ Download failed:", err);
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}

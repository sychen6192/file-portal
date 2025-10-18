import { NextRequest, NextResponse } from "next/server";
import { listFiles } from "@/lib/file-utils";
import fs from "fs";
import path from "path";
import Busboy from "busboy";
import { Readable } from "stream";

export const config = {
    api: { bodyParser: false },
};

export async function GET(req: NextRequest) {
    const pathParam = new URL(req.url).searchParams.get("path") || "";
    const files = listFiles(pathParam);
    return NextResponse.json(files);
}

export async function POST(req: NextRequest) {
    return new Promise((resolve, reject) => {
        try {
            const nodeStream = Readable.fromWeb(req.body as any);

            const busboy = Busboy({ headers: Object.fromEntries(req.headers) });
            const uploadDir = path.join(process.cwd(), "data/uploads");
            let targetFolder = "";

            busboy.on("field", (fieldname, val) => {
                if (fieldname === "path") targetFolder = val;
            });

            busboy.on("file", (fieldname, file, info) => {
                const { filename } = info;
                const folderPath = path.join(uploadDir, targetFolder);
                const filePath = path.join(folderPath, filename);

                fs.mkdirSync(folderPath, { recursive: true });
                const writeStream = fs.createWriteStream(filePath);
                console.log(`⬆️ Start uploading: ${filePath}`);

                file.pipe(writeStream);

                file.on("end", () => console.log(`✅ Finished: ${filename}`));
                file.on("error", (err) => {
                    console.error("❌ File stream error:", err);
                    reject(err);
                });
            });

            busboy.on("finish", () => {
                console.log("🎉 Upload finished");
                resolve(NextResponse.json({ message: "Uploaded (streaming OK)" }));
            });

            nodeStream.pipe(busboy);
        } catch (err) {
            console.error("❌ Upload failed:", err);
            reject(NextResponse.json({ error: (err as Error).message }, { status: 500 }));
        }
    });
}

export async function DELETE(req: NextRequest) {
    const pathParam = new URL(req.url).searchParams.get("path");
    if (!pathParam) return NextResponse.json({ error: "Missing path" }, { status: 400 });

    const fullPath = path.join(process.cwd(), "data/uploads", pathParam);
    try {
        await fs.promises.rm(fullPath, { recursive: true, force: true });
        return NextResponse.json({ message: "Deleted" });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 404 });
    }
}

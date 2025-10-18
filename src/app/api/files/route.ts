import { NextRequest, NextResponse } from "next/server";
import { deleteFile, listFiles, writeFile } from "@/lib/file-utils";

export async function GET(req: NextRequest) {
    const path = new URL(req.url).searchParams.get("path") || "";
    const files = listFiles(path);
    return NextResponse.json(files);
}

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("path") as string) || "";
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(`${folder}/${file.name}`, buffer);
    return NextResponse.json({ message: "Uploaded" });
}

export async function DELETE(req: NextRequest) {
    const path = new URL(req.url).searchParams.get("path");
    if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

    try {
        await deleteFile(path);
        return NextResponse.json({ message: "Deleted" });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 404 });
    }
}

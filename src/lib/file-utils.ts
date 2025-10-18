import fs from "fs-extra";
import path from "path";

const baseDir = path.join(process.cwd(), "data/uploads");
fs.ensureDirSync(baseDir);

export function listFiles(relativePath = "") {
    const dirPath = path.join(baseDir, relativePath);
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    return entries.map((entry) => {
        const fullPath = path.join(dirPath, entry.name);
        const stat = fs.statSync(fullPath);

        return {
            name: entry.name,
            type: entry.isDirectory() ? "folder" : "file",
            size: entry.isFile() ? stat.size : 0,
            modified: stat.mtime,
            path: path.join(relativePath, entry.name),
        };
    });
}

export async function writeFile(relativePath: string, buffer: Buffer) {
    const filePath = path.join(baseDir, relativePath);
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, buffer);
}

export async function deleteFile(relativePath: string) {
    const filePath = path.join(baseDir, relativePath);
    if (!(await fs.pathExists(filePath))) throw new Error("File not found");
    await fs.remove(filePath);
}

export function getFilePath(relativePath: string) {
    return path.join(baseDir, relativePath);
}

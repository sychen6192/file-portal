"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Folder, FileIcon, Upload, Trash2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

type FileItem = {
  name: string;
  type: "file" | "folder";
  size: number;
  modified: string;
  path: string;
};

export default function FilePortal() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [path, setPath] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);

  async function fetchFiles(dir = "") {
    const res = await axios.get("/api/files", { params: { path: dir } });
    setFiles(res.data);
    setPath(dir);
  }

  async function uploadFile() {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("path", path);

    setUploading(true);
    await axios.post("/api/files", form, {
      onUploadProgress: (e) => {
        setProgress(Math.round((e.loaded / (e.total ?? 1)) * 100));
      },
    });
    setUploading(false);
    setProgress(0);
    setFile(null);
    fetchFiles(path);
  }

  async function deleteItem(targetPath: string) {
    await axios.delete("/api/files", { params: { path: targetPath } });
    fetchFiles(path);
  }

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {path && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  fetchFiles(path.split("/").slice(0, -1).join("/"))
                }
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            📁 {path || "Root"}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="max-w-[220px]"
            />
            <Button onClick={uploadFile} disabled={!file}>
              <Upload className="w-4 h-4 mr-2" /> Upload
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {uploading && (
            <div className="my-3">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground mt-1">
                Uploading... {progress}%
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 divide-y">
            {files.map((f) => (
              <motion.div
                key={f.path}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between py-3 hover:bg-muted/30 px-2 rounded-lg"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() =>
                    f.type === "folder" ? fetchFiles(f.path) : null
                  }
                >
                  {f.type === "folder" ? (
                    <Folder className="text-yellow-500" />
                  ) : (
                    <FileIcon className="text-blue-500" />
                  )}
                  <span>{f.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {f.type === "file" && (
                    <a
                      href={`/api/files/download?name=${encodeURIComponent(
                        f.path
                      )}`}
                      className="text-blue-600 text-sm"
                    >
                      Download
                    </a>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteItem(f.path)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

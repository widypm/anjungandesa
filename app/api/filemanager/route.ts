import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs, { existsSync, mkdirSync, writeFileSync } from "fs";
import fsawait from "fs/promises";

const ALLOWED_FORMATS = [
  ".png",
  ".jpeg",
  ".jpg",
  ".webp",
  ".gif",
  ".bmp",
  ".svg",
  ".pdf",
  ".ico",
];

function getExt(filename: string): string {
  return path.extname(filename).toLowerCase();
}
const BASE_DIR = path.resolve("./public/uploads");
const HIDDEN_DIRS = [".cache", ".tmp", ".DS_Store"];

function listDirectoriesRecursively(dirPath: string, relativePath = ""): any[] {
  const result: any[] = [];

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || HIDDEN_DIRS.includes(entry.name)) continue;

    const fullEntryPath = path.join(dirPath, entry.name);
    const relativeEntryPath = path
      .join(relativePath, entry.name)
      .replace(/\\/g, "/");

    const { f, d } = countRecursive(fullEntryPath);

    result.push({
      f,
      d,
      p: "/" + relativeEntryPath,
      filled: true,
    });

    // Recurse deeper
    result.push(
      ...listDirectoriesRecursively(fullEntryPath, relativeEntryPath)
    );
  }

  return result;
}

function countRecursive(fullPath: string): { f: number; d: number } {
  let totalFiles = 0;
  let totalDirs = 0;

  if (!fs.existsSync(fullPath)) return { f: 0, d: 0 };

  const entries = fs.readdirSync(fullPath, { withFileTypes: true });

  for (const entry of entries) {
    if (HIDDEN_DIRS.includes(entry.name)) continue;

    const entryPath = path.join(fullPath, entry.name);

    if (entry.isDirectory()) {
      totalDirs++;
      const nested = countRecursive(entryPath);
      totalFiles += nested.f;
      totalDirs += nested.d;
    } else if (entry.isFile()) {
      totalFiles++;
    }
  }

  return { f: totalFiles, d: totalDirs };
}
function getSafePath(filePath: string) {
  return path.join(BASE_DIR, filePath.replace(/^\/+/, ""));
}
// Fungsi bantu untuk menentukan MIME type berdasarkan ekstensi file
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const action = formData.get("action");
  const contentTypeHeader = req.headers.get("content-type") || "";
  const widthParam = formData.get("width");
  const files = formData.getAll("files[]");
  const filePathParam: any = formData.get("f");
  const filePath = decodeURIComponent(filePathParam);

  if (!action) {
    return NextResponse.json({ error: "Missing action" }, { status: 400 });
  }

  if (action === "dirList") {
    const fromDir = (formData.get("fromDir") as string) || "/";
    const fullPath = path.join(BASE_DIR, fromDir);

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: "Directory not found", data: [] },
        { status: 404 }
      );
    }

    const directories = listDirectoriesRecursively(fullPath, fromDir);

    return NextResponse.json({ error: null, data: directories });
  }

  if (action === "fileListPaged") {
    const dir = decodeURIComponent((formData.get("dir") as string) || "/");
    const maxFiles = parseInt((formData.get("maxFiles") as string) || "100");
    const blackList = formData.getAll("blackList[]") as string[];
    const orderBy = (formData.get("orderBy") as string) || "name";
    const orderAsc = formData.get("orderAsc") === "true";

    const fullPath = path.join(BASE_DIR, dir);

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: "Directory not found" },
        { status: 404 }
      );
    }

    const allEntries = fs.readdirSync(fullPath, { withFileTypes: true });

    let files = allEntries
      .filter((entry) => entry.isFile())
      .filter((entry) => {
        const ext = getExt(entry.name);
        if (blackList.includes(entry.name)) return false;
        if (!ALLOWED_FORMATS.includes(ext)) return false;
        return true;
      })
      .map((entry) => {
        const filePath = path.join(fullPath, entry.name);
        const stats = fs.statSync(filePath);
        return {
          name: entry.name,
          size: stats.size,
          timestamp: Math.floor(stats.mtime.getTime() / 1000),
          width: 0,
          height: 0,
          blurhash: "LSO|eBE1D%WB_4f+WXoz8_V@WVoL", // placeholder
          formats: ALLOWED_FORMATS,
        };
      });

    // Sorting
    files.sort((a, b) => {
      if (orderBy === "name") {
        return orderAsc
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (orderBy === "size") {
        return orderAsc ? a.size - b.size : b.size - a.size;
      } else if (orderBy === "timestamp") {
        return orderAsc ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
      }
      return 0;
    });

    const slicedFiles = files.slice(0, maxFiles);

    return NextResponse.json({
      error: null,
      data: {
        countfiltered: files.length,
        counttotal: files.length,
        files: slicedFiles,
        issend: false,
      },
    });
  }

  if (action === "getVersion") {
    return NextResponse.json({
      error: null,
      data: {
        version: "6",
        build: "10",
        language: "",
        storage: "local",
        dirfiles: "",
        dircache: "",
      },
    });
  }

  if (action === "dirCreate") {
    const d = formData.get("d") as string;
    const n = formData.get("n") as string;

    if (!d || !n) {
      return NextResponse.json(
        { error: "Missing directory path or name" },
        { status: 400 }
      );
    }

    const newDirPath = path.join(BASE_DIR, decodeURIComponent(d), n);

    try {
      if (!fs.existsSync(newDirPath)) {
        fs.mkdirSync(newDirPath, { recursive: true });
        return NextResponse.json({ error: null, data: true });
      } else {
        // Directory already exists
        return NextResponse.json(
          { error: "Directory already exists", data: false },
          { status: 409 }
        );
      }
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message || "Failed to create directory", data: false },
        { status: 500 }
      );
    }
  }
  if (action === "fileListSpecified") {
    const result = files
      .map((file) => {
        const filePath = getSafePath(file.toString());
        return fs.existsSync(filePath)
          ? {
              name: path.basename(filePath),
              size: fs.statSync(filePath).size,
              timestamp: Math.floor(fs.statSync(filePath).mtimeMs / 1000),
              width: 0,
              height: 0,
              blurhash: "LSO|eBE1D%WB_4f+WXoz8_V@WVoL",
              formats: [],
            }
          : null;
      })
      .filter(Boolean);

    return NextResponse.json({ error: null, data: result });
  }
  if (contentTypeHeader.includes("multipart/form-data")) {
    const action = formData.get("action") as string;

    if (action === "uploadFile") {
      const file = formData.get("file") as File;
      const dir = (formData.get("dir") as string) || "/";
      const safeDir = getSafePath("/FileManager" + dir);

      mkdirSync(safeDir, { recursive: true });

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const fileName = `asset-${file.name.replace(/[^a-z0-9_.-]/gi, "-")}`;
      const targetPath = path.join(safeDir, fileName);

      writeFileSync(targetPath, buffer);

      return NextResponse.json({
        error: null,
        data: {
          file: {
            name: fileName,
            size: buffer.length,
            timestamp: Math.floor(Date.now() / 1000),
            width: 0,
            height: 0,
            blurhash: "LSO|eBE1D%WB_4f+WXoz8_V@WVoL",
            formats: [],
          },
        },
      });
    }
  }
  if (action === "filePreviewAndResolution") {
    try {
      // Path ke direktori public (ubah sesuai kebutuhanmu)
      const fullPath = path.join(process.cwd(), "public/uploads", filePath);
      const fileBuffer = await fsawait.readFile(fullPath);

      // Encode file menjadi base64
      const mimeType = getMimeType(filePath);
      const base64 = fileBuffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64}`;

      return NextResponse.json({
        error: null,
        data: {
          preview: dataUrl,
        },
      });
    } catch (err) {
      return NextResponse.json(
        { error: "File not found or could not be read", data: null },
        { status: 404 }
      );
    }
  }
  if (action === "fileDelete") {
    const fsParam = formData.get("fs") as string;
    const suffixes = formData.getAll("formatSuffixes[]") as string[];

    if (!fsParam) {
      return NextResponse.json(
        { error: "Missing 'fs' parameter" },
        { status: 400 }
      );
    }

    const decodedPath = decodeURIComponent(fsParam); // contoh: /FileManager/asset-image.png
    const baseName = path.basename(decodedPath); // asset-image.png
    const ext = path.extname(baseName); // .png
    const nameWithoutExt = baseName.replace(ext, ""); // asset-image

    const targetDir = getSafePath(path.dirname(decodedPath)); // full dir path di dalam /public
    const fullPath = path.join(targetDir, baseName); // full path dari file utama

    try {
      // Hapus file utama
      if (existsSync(fullPath)) {
        await fsawait.unlink(fullPath);
      }

      // Hapus semua varian preview/medium
      for (const suffix of suffixes) {
        const variantFile = path.join(
          targetDir,
          `${nameWithoutExt}${suffix}${ext}`
        );
        if (existsSync(variantFile)) {
          await fsawait.unlink(variantFile);
        }
      }

      return NextResponse.json({ error: null, data: true });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
  if (action === "dirDelete") {
    const dirParam = formData.get("d") as string;
    if (!dirParam) {
      return NextResponse.json(
        { error: "Missing 'd' parameter" },
        { status: 400 }
      );
    }
    const decodedDir = decodeURIComponent(dirParam);
    const targetDir = getSafePath(decodedDir);
    try {
      // Pastikan folder ada
      const stat = await fsawait.stat(targetDir);
      if (!stat.isDirectory()) {
        return NextResponse.json(
          { error: "Target is not a directory" },
          { status: 400 }
        );
      }

      // Hapus folder dan seluruh isinya
      await fsawait.rm(targetDir, { recursive: true, force: true });

      return NextResponse.json({ error: null, data: true });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
  if (action === "fileRename") {
    const fileParam = formData.get("f") as string;
    const newName = formData.get("n") as string;

    if (!fileParam) {
      return NextResponse.json(
        { error: "Missing 'f' parameter" },
        { status: 400 }
      );
    }
    if (!newName) {
      return NextResponse.json(
        { error: "Missing 'n' parameter" },
        { status: 400 }
      );
    }

    const decodedFile = decodeURIComponent(fileParam);
    const oldFilePath = getSafePath(decodedFile);

    // Pastikan newName hanya nama file, bukan path lengkap
    const sanitizedNewName = newName.replace(/[/\\]/g, "");

    // Path baru di folder yang sama dengan oldFilePath
    const newFilePath = path.join(path.dirname(oldFilePath), sanitizedNewName);

    try {
      const stat = await fsawait.stat(oldFilePath);
      if (!stat.isFile()) {
        return NextResponse.json(
          { error: "Target is not a file" },
          { status: 400 }
        );
      }

      // Rename file
      await fsawait.rename(oldFilePath, newFilePath);

      return NextResponse.json({ error: null, data: true });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}

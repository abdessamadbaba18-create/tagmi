import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { requireAuth } from "@/lib/auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
]);

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 150 * 1024 * 1024; // 150 MB

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
    "video/x-matroska": ".mkv",
  };
  return map[mime] || "";
}

// POST /api/upload - upload property images / videos (multipart form-data)
export async function POST(request: Request) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const uploaded: { url: string; type: string; name: string }[] = [];

    for (const file of files) {
      if (!(file as File).name) continue;

      const type = file.type;
      const isImage = ALLOWED_IMAGE_TYPES.has(type);
      const isVideo = ALLOWED_VIDEO_TYPES.has(type);

      if (!isImage && !isVideo) {
        return NextResponse.json(
          {
            error:
              "Format non supporté. Images: JPG, PNG, WEBP, GIF, AVIF. Vidéos: MP4, WEBM, MOV, MKV.",
          },
          { status: 400 }
        );
      }

      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (file.size > maxSize) {
        return NextResponse.json(
          {
            error: `Fichier trop volumineux (max ${isVideo ? "150" : "10"} MB)`,
          },
          { status: 400 }
        );
      }

      const ext = extFromMime(type);
      const fileName = `${randomUUID()}${ext}`;
      const bytes = Buffer.from(await file.arrayBuffer());

      await writeFile(path.join(UPLOAD_DIR, fileName), bytes);

      uploaded.push({
        url: `/uploads/${fileName}`,
        type: isVideo ? "video" : "image",
        name: file.name,
      });
    }

    return NextResponse.json({ success: true, data: uploaded });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Une erreur est survenue" }, { status: 500 });
  }
}
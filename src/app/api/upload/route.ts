import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    const isEpub = file.type === "application/epub+zip";
    if (!isImage && !isPdf && !isEpub) {
      return NextResponse.json({ error: "File must be an image, PDF, or EPUB" }, { status: 400 });
    }

    let maxSize = 5 * 1024 * 1024;
    let sizeLabel = "5MB";
    if (isPdf) { maxSize = 20 * 1024 * 1024; sizeLabel = "20MB"; }
    if (isEpub) { maxSize = 50 * 1024 * 1024; sizeLabel = "50MB"; }

    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large (max ${sizeLabel})` }, { status: 400 });
    }

    const blob = await put(file.name, file, { access: "public" });

    return NextResponse.json({ url: blob.url });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

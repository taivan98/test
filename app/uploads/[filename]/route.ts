import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { readUpload, CONTENT_TYPES } from "@/lib/uploads";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const buffer = await readUpload(filename);
  if (!buffer) return new NextResponse("Not found", { status: 404 });

  const ext = path.extname(filename).toLowerCase();
  const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

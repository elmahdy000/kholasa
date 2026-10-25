import fs from "fs/promises";
import { createReadStream } from "fs";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { contentTypeForExt, getUploadRoot, isMediaCategory } from "@/services/media.service";

export const dynamic = "force-dynamic";

function parseRange(header: string, size: number): { start: number; end: number } | null {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m || (m[1] === "" && m[2] === "")) return null;
  let start: number;
  let end: number;
  if (m[1] === "") {
    const suffix = Number(m[2]);
    start = Math.max(size - suffix, 0);
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === "" ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= size) return null;
  return { start, end };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { path: segments } = await params;
  if (!segments || segments.length !== 2) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }
  const [category, filename] = segments;
  const ext = path.extname(filename).toLowerCase();
  const contentType = contentTypeForExt(ext);
  if (!isMediaCategory(category) || !contentType) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  const root = getUploadRoot();
  const filePath = path.resolve(root, category, filename);
  if (!filePath.startsWith(root + path.sep)) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  let size: number;
  try {
    const st = await fs.stat(filePath);
    if (!st.isFile()) throw new Error("not a file");
    size = st.size;
  } catch {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
    "Content-Disposition": "inline",
    "Cache-Control": "private, max-age=3600",
    "Accept-Ranges": "bytes",
    "Content-Security-Policy": "default-src 'none'; sandbox",
  };

  const rangeHeader = req.headers.get("range");
  let start = 0;
  let end = size - 1;
  let status = 200;
  if (rangeHeader) {
    const range = parseRange(rangeHeader, size);
    if (!range) {
      return new NextResponse(null, {
        status: 416,
        headers: { ...headers, "Content-Range": `bytes */${size}` },
      });
    }
    ({ start, end } = range);
    status = 206;
    headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
  }
  headers["Content-Length"] = String(end - start + 1);

  const stream = Readable.toWeb(createReadStream(filePath, { start, end })) as ReadableStream;
  return new NextResponse(stream, { status, headers });
}

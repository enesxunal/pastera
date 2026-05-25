import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const BUCKET = "catalog-images";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function isAdmin(req: NextRequest): boolean {
  return req.cookies.get("pastera_admin")?.value === "1";
}

function safeId(raw: string): string {
  const s = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
  return s.slice(0, 80) || "product";
}

function extFromType(type: string, filename: string): string {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  const m = filename.match(/\.(jpe?g|png|webp|gif)$/i);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
}

async function saveLocal(buffer: Buffer, productId: string, ext: string): Promise<string> {
  const dir = path.join(process.cwd(), "public", "catalog");
  await mkdir(dir, { recursive: true });
  const name = `${safeId(productId)}-${Date.now()}.${ext}`;
  await writeFile(path.join(dir, name), buffer);
  return `/catalog/${name}`;
}

async function saveSupabase(
  buffer: Buffer,
  productId: string,
  ext: string,
  contentType: string,
): Promise<string | null> {
  const svc = createSupabaseServiceClient();
  if (!svc) return null;
  const objectPath = `${safeId(productId)}/${Date.now()}.${ext}`;
  const { error } = await svc.storage.from(BUCKET).upload(objectPath, buffer, {
    contentType,
    upsert: true,
  });
  if (error) return null;
  const { data } = svc.storage.from(BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_form" }, { status: 400 });
  }

  const file = form.get("file");
  const productId = String(form.get("productId") ?? "product");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "no_file" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ ok: false, error: "bad_type" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "too_large" }, { status: 400 });
  }

  const ext = extFromType(file.type, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  const remote = await saveSupabase(buffer, productId, ext, file.type);
  if (remote) {
    return NextResponse.json({ ok: true, url: remote, storage: "supabase" });
  }

  try {
    const localPath = await saveLocal(buffer, productId, ext);
    return NextResponse.json({ ok: true, url: localPath, storage: "local" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "upload_failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

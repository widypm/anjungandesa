import { parseKTP } from "app/lib/parseKTP";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  /* ==========================================
     🔥 WAJIB: CONVERT FILE → BUFFER ASLI
     ini yang bikin error kamu hilang
  ========================================== */

  const buffer = Buffer.from(await file.arrayBuffer());

  const body = new FormData();
  body.append("apikey", "K84916411788957");

  body.append("file", new Blob([buffer], { type: "image/jpeg" }), "ktp.jpg");

  body.append("language", "eng");
  body.append("OCREngine", "2");
  body.append("scale", "true");
  body.append("detectOrientation", "true");

  const res = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    body,
  });

  const json = await res.json();

  console.log("OCR RAW RESPONSE:", json);

  const text = json?.ParsedResults?.[0]?.ParsedText || "";

  const parsed = parseKTP(text);

  return NextResponse.json({
    success: true,
    rawText: text,
    data: parsed,
  });
}

import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const HTMLtoDOCX = require("html-to-docx");

export async function POST(req: NextRequest) {
  const { html, name } = await req.json();
  if (!html) return NextResponse.json({ error: "缺少 html" }, { status: 400 });

  const buffer: Buffer = await HTMLtoDOCX(html, undefined, {
    title: name ?? "简历",
    margins: { top: 720, bottom: 720, left: 900, right: 900 },
  });

  const filename = encodeURIComponent(`${name ?? "简历"}.docx`);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { resumeSchema } from "@/lib/schemas";
import { buildResumeDocx } from "@/lib/resume-docx";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = resumeSchema.parse(body.resumeData);
    const name = String(body.name || data.name || "律转简历").slice(0, 80);
    const buffer = await buildResumeDocx(data);
    const filename = encodeURIComponent(`${name}.docx`);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "导出失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "未收到文件" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "文件不能超过 5MB" }, { status: 413 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const name = file.name.toLowerCase();

  try {
    let text = "";

    if (name.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json({ error: "目前仅支持 .docx 文件，也可以直接粘贴简历文字" }, { status: 400 });
    }

    text = text.replace(/\s+/g, " ").trim();
    if (!text || text.length < 50) {
      return NextResponse.json({ error: "未能从文件中提取到足够的文字内容，请尝试粘贴文字版本" }, { status: 422 });
    }

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "文件解析失败，请确认文件未加密且格式正确" }, { status: 500 });
  }
}

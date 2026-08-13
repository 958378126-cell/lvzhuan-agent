import { NextRequest, NextResponse } from "next/server";
import { createAIClient } from "@/lib/ai";

const IMAGE_PATTERN = /^data:image\/(?:png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/;

function readText(raw: string) {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? raw;
  try {
    const parsed = JSON.parse(fenced) as { text?: unknown };
    if (typeof parsed.text === "string") return parsed.text.trim();
  } catch {
    // Some vision providers ignore response_format and return plain OCR text.
  }
  return raw.trim();
}

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (typeof image !== "string" || !IMAGE_PATTERN.test(image)) {
      return NextResponse.json({ error: "请上传 PNG、JPG 或 WebP 图片" }, { status: 400 });
    }
    if (image.length > 12_000_000) {
      return NextResponse.json({ error: "图片过大，请压缩到 8MB 以内再识别" }, { status: 413 });
    }

    const { client, model: defaultModel } = createAIClient();
    const model = process.env.AI_VISION_MODEL?.trim() || defaultModel;
    if (/deepseek/i.test(model)) {
      return NextResponse.json({ error: "当前 DeepSeek 配置不支持图片识别，请在 AI_VISION_MODEL 中配置支持视觉输入的模型（例如 gpt-4o-mini）" }, { status: 503 });
    }
    const completion = await client.chat.completions.create({
      model,
      max_tokens: 6000,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "你是招聘信息 OCR 助手。只识别图片中可见的招聘岗位描述原文，保留中文、英文、数字、标点和段落顺序，不要总结、改写或补全。只返回 JSON：{\"text\":\"识别出的原文\"}。看不清的字符用 [无法识别] 标记。",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "请识别这张招聘 JD 图片中的全部文字。" },
            { type: "image_url", image_url: { url: image, detail: "high" } },
          ],
        },
      ],
    });
    const text = readText(completion.choices[0]?.message?.content ?? "");
    if (!text || text.length < 5) {
      return NextResponse.json({ error: "没有识别到足够文字，请换一张更清晰的图片" }, { status: 422 });
    }
    return NextResponse.json({ text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "图片识别失败";
    return NextResponse.json({ error: `图片识别失败：${message}` }, { status: 502 });
  }
}

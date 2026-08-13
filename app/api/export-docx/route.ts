import { NextRequest, NextResponse } from "next/server";
import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { resumeSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = resumeSchema.parse(body.resumeData);
    const name = String(body.name || data.name || "律转简历").slice(0, 80);
    const paragraphs: Paragraph[] = [
      new Paragraph({
        heading: HeadingLevel.TITLE,
        children: [new TextRun({ text: data.name, bold: true })],
      }),
      new Paragraph({ children: [new TextRun({ text: data.title, bold: true, color: "2563EB" })] }),
      new Paragraph(`${data.phone}  ${data.email}  ${data.location}`.trim()),
      new Paragraph({ heading: HeadingLevel.HEADING_1, text: "个人简介" }),
      new Paragraph(data.summary),
      new Paragraph({ heading: HeadingLevel.HEADING_1, text: "工作经历" }),
    ];

    for (const entry of data.experience) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: entry.role, bold: true }),
            new TextRun(`  ${entry.org}`),
          ],
        }),
        new Paragraph({ children: [new TextRun({ text: `${entry.dates}  ${entry.location}`.trim(), italics: true })] })
      );
      entry.bullets.forEach((bullet) => paragraphs.push(new Paragraph({ text: bullet, bullet: { level: 0 } })));
    }

    paragraphs.push(new Paragraph({ heading: HeadingLevel.HEADING_1, text: "教育背景" }));
    data.education.forEach((entry) =>
      paragraphs.push(new Paragraph(`${entry.degree}  ${entry.school}  ${entry.dates}`.trim()))
    );
    paragraphs.push(
      new Paragraph({ heading: HeadingLevel.HEADING_1, text: "技能" }),
      new Paragraph(data.skills.join(" · "))
    );
    if (data.certifications.length) {
      paragraphs.push(
        new Paragraph({ heading: HeadingLevel.HEADING_1, text: "证书 / 资质" }),
        ...data.certifications.map((item) => new Paragraph({ text: item, bullet: { level: 0 } }))
      );
    }

    const doc = new Document({
      sections: [{
        properties: { page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } } },
        children: paragraphs,
      }],
    });
    const buffer = await Packer.toBuffer(doc);
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

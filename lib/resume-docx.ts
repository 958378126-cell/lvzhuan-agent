import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { ResumeData } from "./schemas";

const BLUE = "2563EB";
const INK = "1A1A1A";
const MUTED = "6A6A6A";
const CONTENT_WIDTH = 10900;

const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

function run(text: string, options: Record<string, unknown> = {}) {
  return new TextRun({ text, font: "Arial", size: 17, color: INK, ...options });
}

function paragraph(text = "", options: Record<string, unknown> = {}) {
  return new Paragraph({
    spacing: { after: 45, line: 235 },
    children: text ? [run(text)] : [],
    ...options,
  });
}

function sectionHeading(text: string) {
  return new Paragraph({
    spacing: { before: 100, after: 55 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: INK } },
    children: [run(text, { bold: true, size: 19, color: INK })],
  });
}

function entryHeading(role: string, org: string, dates: string, location?: string) {
  return [
    new Paragraph({ spacing: { before: 55, after: 0 }, children: [run(role, { bold: true, size: 17 }), run(`  ${org}`, { bold: true, size: 16, color: BLUE })] }),
    new Paragraph({ spacing: { after: 30 }, children: [run(`${dates}${location ? `  ${location}` : ""}`, { size: 14, color: MUTED, italics: true })] }),
  ];
}

function bullet(text: string) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 18, line: 225 },
    children: [run(text, { size: 15, color: "333333" })],
  });
}

function cell(children: Paragraph[], width: number) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    margins: { top: 0, bottom: 0, left: 80, right: 100 },
    borders: noBorders,
    children,
  });
}

export async function buildResumeDocx(data: ResumeData) {
  const main: Paragraph[] = [sectionHeading("个人简介"), paragraph(data.summary), sectionHeading("工作经历")];
  for (const entry of data.experience) {
    main.push(...entryHeading(entry.role, entry.org, entry.dates, entry.location), ...entry.bullets.map(bullet));
  }
  main.push(sectionHeading("教育背景"));
  for (const entry of data.education) main.push(...entryHeading(entry.degree, entry.school, entry.dates));

  const aside: Paragraph[] = [sectionHeading("技能"), paragraph(data.skills.join(" · "))];
  if (data.certifications.length) {
    aside.push(sectionHeading("证书 / 资质"), ...data.certifications.map(bullet));
  }
  if (data.achievements.length) {
    aside.push(sectionHeading("核心成就"));
    for (const item of data.achievements) aside.push(new Paragraph({ spacing: { after: 35 }, children: [run(`${item.icon}  ${item.title}`, { bold: true, size: 15 }), run(`\n${item.desc}`, { size: 14, color: MUTED })] }));
  }
  if (data.languages.length) {
    aside.push(sectionHeading("语言"));
    for (const item of data.languages) aside.push(paragraph(`${item.name}  ${item.level}  ${"●".repeat(Math.max(0, Math.min(5, item.dots)))}${"○".repeat(Math.max(0, 5 - item.dots))}`, { spacing: { after: 35 } }));
  }

  const header = [
    new Paragraph({ spacing: { after: 20 }, children: [run(data.name, { bold: true, size: 34, color: INK })] }),
    new Paragraph({ spacing: { after: 45 }, children: [run(data.title, { bold: true, size: 19, color: BLUE })] }),
    new Paragraph({ spacing: { after: 90 }, children: [run([data.phone, data.email, data.location, data.linkedin].filter(Boolean).join("   "), { size: 14, color: MUTED })] }),
  ];

  const columns = new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [7000, 3900],
    borders: noBorders,
    rows: [new TableRow({ children: [cell(main, 7000), cell(aside, 3900)] })],
  });
  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 17 }, paragraph: { spacing: { line: 235 } } } } },
    numbering: { config: [{ reference: "resume-bullets", levels: [{ level: 0, format: "bullet" as never, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 260, hanging: 160 } } } }] }] },
    sections: [{
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 520, right: 500, bottom: 520, left: 500 } },
      },
      children: [...header, columns],
    }],
  });
  return Packer.toBuffer(doc);
}

import { NextRequest, NextResponse } from "next/server";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { resumeSchema } from "@/lib/schemas";
import { buildResumeDocx } from "@/lib/resume-docx";

export const runtime = "nodejs";
const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  let workDir = "";
  try {
    const body = await req.json();
    const data = resumeSchema.parse(body.resumeData);
    const name = String(body.name || data.name || "律转简历").slice(0, 80);
    workDir = await mkdtemp(join(tmpdir(), "lvzhuan-pdf-"));
    const docxPath = join(workDir, "resume.docx");
    await writeFile(docxPath, await buildResumeDocx(data));

    // LibreOffice is available in the local desktop runtime and preserves the
    // exact A4 DOCX layout used by the Word export. A self-hosted deployment
    // can provide its own `soffice` binary on PATH.
    await execFileAsync(process.env.SOFFICE_PATH || "soffice", [
      "--headless", "--convert-to", "pdf", "--outdir", workDir, docxPath,
    ], { timeout: 30_000 });
    const pdf = await readFile(join(workDir, "resume.pdf"));
    const filename = encodeURIComponent(`${name}.pdf`);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF 导出失败";
    const hint = message.includes("ENOENT") ? "当前部署没有 PDF 转换引擎，请先使用“打印 / 存为 PDF”，或在服务器安装 LibreOffice。" : message;
    return NextResponse.json({ error: hint }, { status: 502 });
  } finally {
    if (workDir) await rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

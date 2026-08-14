import { access } from "fs/promises";
import { constants } from "fs";
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import { buildResumeHTML } from "@/lib/resume-html";
import { resumeSchema, resumeTemplateSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const maxDuration = 60;

const LOCAL_CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

async function findChrome() {
  const configured = process.env.CHROME_EXECUTABLE_PATH?.trim();
  const candidates = configured ? [configured, ...LOCAL_CHROME_PATHS] : LOCAL_CHROME_PATHS;
  for (const candidate of candidates) {
    try {
      await access(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Try the next well-known Chrome path.
    }
  }
  return undefined;
}

async function browserLaunchOptions(localExecutablePath?: string) {
  if (localExecutablePath) {
    return {
      executablePath: localExecutablePath,
      headless: true as const,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
    };
  }
  const { default: chromium } = await import("@sparticuz/chromium-min");
  const architecture = process.arch === "arm64" ? "arm64" : "x64";
  const remotePack = process.env.CHROMIUM_PACK_URL?.trim()
    || `https://github.com/Sparticuz/chromium/releases/download/v149.0.0/chromium-v149.0.0-pack.${architecture}.tar`;
  return {
    executablePath: await chromium.executablePath(remotePack),
    headless: true as const,
    args: [...chromium.args, "--font-render-hinting=none"],
  };
}

export async function POST(req: NextRequest) {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | undefined;
  try {
    const body = await req.json();
    const data = resumeSchema.parse(body.resumeData);
    const templateId = resumeTemplateSchema.catch("pillar").parse(body.templateId);
    const photo = typeof body.photo === "string" ? body.photo : undefined;
    const name = String(body.name || data.name || "律转简历").slice(0, 80);
    browser = await puppeteer.launch(await browserLaunchOptions(await findChrome()));
    const page = await browser.newPage();
    await page.setContent(buildResumeHTML(data, photo, templateId), { waitUntil: "load" });
    await page.emulateMediaType("print");
    await page.evaluate(async () => {
      await document.fonts.ready;
      for (const image of Array.from(document.images)) {
        if (!image.complete) await new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        });
      }
      const fitResumePage = (window as typeof window & { __fitResumePage?: () => void }).__fitResumePage;
      fitResumePage?.();
    });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    const filename = encodeURIComponent(`${name}.pdf`);
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF 导出失败";
    return NextResponse.json({ error: message }, { status: 502 });
  } finally {
    if (browser) await browser.close().catch(() => undefined);
  }
}

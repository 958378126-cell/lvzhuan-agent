"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const steps = [
  { href: "/interview", number: "01", label: "访谈" },
  { href: "/map", number: "02", label: "档案" },
  { href: "/analyze", number: "03", label: "匹配" },
  { href: "/resume", number: "04", label: "简历" },
  { href: "/interview-prep", number: "05", label: "投递" },
];

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="app-frame">
      <header className="studio-header">
        <Link href="/" className="wordmark" aria-label="律转首页">
          <span className="wordmark-glyph" aria-hidden="true">
            <b>律</b><b>转</b>
          </span>
          <span className="wordmark-copy">
            <strong>律转</strong>
            <small>CAREER TRANSLATION DESK</small>
          </span>
        </Link>

        <nav className="workflow-nav" aria-label="求职工作流">
          {steps.map((step) => {
            const active = pathname === step.href;
            return (
              <Link
                key={step.href}
                href={step.href}
                className={active ? "workflow-link is-active" : "workflow-link"}
                aria-current={active ? "page" : undefined}
              >
                <span>{step.number}</span>
                {step.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/interview" className="header-action">
          {isHome ? "建立我的底稿" : "回到访谈"}
          <span aria-hidden="true">↗</span>
        </Link>
      </header>
      <div className="route-canvas">{children}</div>
    </div>
  );
}

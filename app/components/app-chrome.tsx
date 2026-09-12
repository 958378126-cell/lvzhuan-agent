"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AmbientField from "./ambient-field";

const steps = [
  { href: "/interview", number: "01", label: "访谈" },
  { href: "/map", number: "02", label: "档案" },
  { href: "/analyze", number: "03", label: "匹配" },
  { href: "/resume", number: "04", label: "简历" },
  { href: "/interview-prep", number: "05", label: "投递" },
];

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setEntered(true);
      return;
    }

    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setEntered(true));
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, []);

  return (
    <div className={`app-frame ${entered ? "is-entered" : "is-entering"}`}>
      <AmbientField />
      <div className="field-wash" aria-hidden="true" />
      <svg className="field-grain" aria-hidden="true">
        <filter id="grain-filter">
          <feTurbulence type="fractalNoise" baseFrequency=".82" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-filter)" />
      </svg>

      <header className="studio-header reveal">
        <Link href="/" className="wordmark" aria-label="律转首页">
          <span className="signal-dot" aria-hidden="true" />
          <strong>律转</strong>
        </Link>

        <span className="header-whisper">把经历译成可被判断的价值</span>

        <nav className="workflow-nav" aria-label="求职工作流">
          {steps.map((step) => {
            const active = pathname === step.href;
            return (
              <Link key={step.href} href={step.href} className={active ? "workflow-link is-active" : "workflow-link"} aria-current={active ? "page" : undefined}>
                <span>{step.number}</span>{step.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <div className="route-canvas">{children}</div>
    </div>
  );
}

import Link from "next/link";

const workflow = [
  ["01", "访谈", "追问到事实", "/interview"],
  ["02", "档案", "记住能力证据", "/map"],
  ["03", "匹配", "逐条对照岗位", "/analyze"],
  ["04", "简历", "生成岗位译文", "/resume"],
  ["05", "投递", "用事实准备回答", "/interview-prep"],
];

export default function Home() {
  return (
    <main className="dark-home">
      <section className="dark-hero">
        <div className="hero-copy reveal d2">
          <p className="eyebrow">LEGAL CAREER TRANSLATION / 2026</p>
          <h1>
            <span>LAW,</span>
            <span>TRANSLATED.</span>
            <span className="han">律转</span>
          </h1>
          <p className="hero-statement">
            把“我只是审合同”，<br />翻译成招聘方能够判断的能力。
          </p>
          <div className="hero-actions">
            <Link href="/interview" className="primary-action">开始建立能力档案 <span>↗</span></Link>
            <Link href="/interview" className="text-action">体验离线演示</Link>
          </div>
        </div>

        <div className="case-file reveal d3" aria-label="律转工作流">
          <div className="case-file-head"><span>CAREER FILE</span><span>LVZ / 001</span></div>
          {workflow.map(([number, title, detail, href]) => (
            <Link href={href} className="case-row" key={number}>
              <span className="case-number">{number}</span>
              <strong>{title}</strong>
              <small>{detail}</small>
              <span className="case-arrow">↗</span>
            </Link>
          ))}
          <div className="translation-sample">
            <span>RAW</span><p>负责日常合同审核</p>
            <i aria-hidden="true">→</i>
            <span>PROOF</span><p>风险识别 · 流程设计 · 决策支持</p>
          </div>
        </div>
      </section>

      <footer className="home-footer reveal d4">
        <div className="live-status"><span className="signal-dot" />事实档案在每次任务中继续生长</div>
        <p>主动追问 / 长期记忆 / 证据约束</p>
        <span>LVZ © 2026</span>
      </footer>
    </main>
  );
}

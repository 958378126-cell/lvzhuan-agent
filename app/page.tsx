import Link from "next/link";

const workflow = [
  ["01", "访谈", "追问事实", "/interview"],
  ["02", "档案", "留下证据", "/map"],
  ["03", "匹配", "对照岗位", "/analyze"],
  ["04", "简历", "选择表达", "/resume"],
  ["05", "投递", "准备回答", "/interview-prep"],
];

export default function Home() {
  return (
    <main className="dark-home">
      <section className="dark-hero">
        <div className="hero-copy reveal d2">
          <p className="eyebrow">CAREER TRANSLATION / 律转</p>
          <h1>
            <span>把经历，</span>
            <span>译成价值。</span>
          </h1>
          <p className="hero-statement">从真实经历出发，写成招聘方能够判断的能力。</p>
          <div className="hero-actions">
            <Link href="/interview" className="primary-action">开始建立能力档案 <span>↗</span></Link>
          </div>
        </div>

        <div className="case-file reveal d3" aria-label="律转工作流">
          <div className="case-file-head"><span>求职档案</span><span>01—05</span></div>
          {workflow.map(([number, title, detail, href]) => (
            <Link href={href} className="case-row" key={number}>
              <span className="case-number">{number}</span>
              <strong>{title}</strong>
              <small>{detail}</small>
              <span className="case-arrow">↗</span>
            </Link>
          ))}
          <div className="translation-sample" aria-label="翻译示例">
            <span>原话</span><p>“我只是审合同。”</p>
            <i aria-hidden="true">↓</i>
            <span>译文</span><p>风险识别 · 流程设计 · 决策支持</p>
          </div>
        </div>
      </section>

      <footer className="home-footer reveal d4">
        <span>事实由你确认</span>
        <span>LVZ © 2026</span>
      </footer>
    </main>
  );
}

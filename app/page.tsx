import Link from "next/link";

export default function Home() {
  return (
    <main className="dark-home">
      <section className="dark-hero">
        <div className="hero-copy reveal d2">
          <p className="eyebrow">LEGAL CAREER TRANSLATION</p>
          <h1>
            <span>LAW,</span>
            <span>TRANSLATED.</span>
            <span className="han">律转</span>
          </h1>
          <p className="hero-statement">把法律经历，译成招聘方能够判断的价值。</p>
          <div className="hero-actions">
            <Link href="/interview" className="primary-action">交给我一份原稿 <span>↗</span></Link>
          </div>
        </div>

        <div className="translation-proof reveal d3" aria-label="法律经历翻译示例">
          <div className="proof-head"><span>TRANSLATION / 001</span><span>事实 → 价值</span></div>
          <div className="proof-source">
            <span>原话</span>
            <blockquote>“我只是审合同。”</blockquote>
          </div>
          <div className="proof-turn" aria-hidden="true"><i />↓</div>
          <div className="proof-result">
            <span>译文</span>
            <p>识别风险，<br />设计流程，<br />支持决策。</p>
          </div>
          <div className="proof-evidence"><span>依据</span>合同审查 · 跨部门协作 · 制度落地</div>
        </div>
      </section>

      <footer className="home-footer reveal d4">
        <span>基于事实，不替你编故事。</span>
        <span>LVZ © 2026</span>
      </footer>
    </main>
  );
}

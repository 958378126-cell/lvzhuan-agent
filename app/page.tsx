import Link from "next/link";

const translationTrace = [
  { number: "01", label: "原话", copy: "“负责日常合同审核。”" },
  { number: "02", label: "追问", copy: "一年多少份？卡在哪里？你具体改变了什么？" },
  { number: "03", label: "事实", copy: "300+ 份合同 · 3 类协作部门 · 7 天 → 4 天" },
  { number: "04", label: "能力", copy: "需求澄清 · 流程设计 · 跨部门推进" },
];

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

      <section className="translation-journey" aria-labelledby="journey-title">
        <div className="journey-lead">
          <p className="eyebrow">EVIDENCE TRACE / 01</p>
          <h2 id="journey-title">一句原话，<br />要经过几次校准。</h2>
          <p>先把事实问清，再选择招聘方需要的表达。</p>
        </div>

        <div className="journey-ledger">
          {translationTrace.map((item) => (
            <div className="journey-row" key={item.number}>
              <span className="journey-number">{item.number}</span>
              <span className="journey-label">{item.label}</span>
              <p>{item.copy}</p>
            </div>
          ))}
          <div className="journey-row is-final">
            <span className="journey-number">05</span>
            <span className="journey-label">简历</span>
            <p>协调采购、信息化与业务部门重构合同审批流程，累计覆盖 300+ 份合同，将平均流转周期缩短 43%。</p>
          </div>
          <div className="journey-source">
            <span>证据约束</span>
            <p>数字、行动和结果都能回到原始经历；不确定的地方继续问。</p>
          </div>
        </div>
      </section>

      <section className="home-close">
        <div>
          <p className="eyebrow">YOUR TURN / 01</p>
          <h2>从你的原话开始。</h2>
        </div>
        <Link href="/interview" className="primary-action">建立能力档案 <span>↗</span></Link>
      </section>

      <footer className="home-footer reveal d4">
        <span>基于事实，不替你编故事。</span>
        <span>LVZ © 2026</span>
      </footer>
    </main>
  );
}

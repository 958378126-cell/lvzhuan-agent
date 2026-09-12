import Image from "next/image";
import Link from "next/link";

const workflow = [
  ["01", "访谈", "把模糊叙述追问成事实", "/interview"],
  ["02", "档案", "一次梳理，持续复用", "/map"],
  ["03", "匹配", "逐条对照 JD 与证据", "/analyze"],
  ["04", "简历", "只选择最相关的经历", "/resume"],
  ["05", "投递", "用同一底稿准备面试", "/interview-prep"],
];

export default function Home() {
  return (
    <main className="home-page">
      <section className="hero-sheet">
        <div className="hero-index" aria-hidden="true">CASE 001 / CAREER TRANSLATION</div>

        <div className="hero-intro">
          <p className="eyebrow">写给准备转身的法律人</p>
          <h1>
            把经历
            <span className="proof-edit"><del>包装</del><ins>翻译</ins></span>
            成价值。
          </h1>
          <p className="hero-deck">
            律转先读懂你做过的事，再用事实把它写成招聘方能够判断的能力。
          </p>
          <div className="hero-actions">
            <Link href="/interview" className="primary-action">从一份简历开始 <span>→</span></Link>
            <Link href="/interview" className="text-action">没有准备好？直接体验演示</Link>
          </div>
        </div>

        <div className="translation-proof" aria-label="经历翻译示例">
          <div className="proof-toolbar"><span>TRANSLATION PROOF</span><span>第 01 次校样</span></div>
          <div className="proof-columns">
            <article className="proof-source">
              <header><span>原始陈述</span><b>RAW</b></header>
              <blockquote>“负责日常合同审核，跟进各部门的合同问题。”</blockquote>
              <p className="red-note">太像职责，不像能力。<br />具体判断了什么？</p>
            </article>
            <article className="proof-result">
              <header><span>岗位语言</span><b>EDITED</b></header>
              <p>建立合同风险分级与审查口径，协调业务、采购与财务完成争议条款闭环。</p>
              <dl>
                <div><dt>E-01</dt><dd>风险识别</dd></div>
                <div><dt>E-02</dt><dd>流程设计</dd></div>
                <div><dt>E-03</dt><dd>跨部门推进</dd></div>
              </dl>
            </article>
          </div>
          <div className="proof-footer"><span>只写有证据的事</span><span className="approval-mark">FACT CHECKED</span></div>
        </div>

        <div className="hero-stamp" aria-hidden="true">
          <Image src="/brand/ip-logo/A1-fox-lower-left.png" alt="" width={180} height={180} priority />
          <span>翻译编辑 · 狐</span>
        </div>
      </section>

      <section className="manifesto-row">
        <p className="margin-label">EDITOR&apos;S NOTE</p>
        <p className="manifesto-copy">不是替你发明一个更厉害的人。<br />是把那个已经存在、却没被看见的人，写清楚。</p>
        <aside><span>主动追问</span><span>记住事实</span><span>标明证据</span></aside>
      </section>

      <section className="workflow-section" id="workflow">
        <div className="section-heading">
          <p className="eyebrow">一份底稿，五次交付</p>
          <h2>你的经历不必<br />每次从头讲起。</h2>
        </div>
        <div className="workflow-list">
          {workflow.map(([number, title, detail, href]) => (
            <Link href={href} key={number} className="workflow-row">
              <span className="workflow-number">{number}</span><strong>{title}</strong><p>{detail}</p><span className="row-arrow">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="evidence-section">
        <div className="evidence-quote">
          <span className="quote-mark">“</span>
          <blockquote>我只是审合同。<em>这是结论，不是事实。</em></blockquote>
        </div>
        <div className="evidence-copy">
          <p className="eyebrow">律转会继续问</p>
          <ol>
            <li><span>01</span>什么类型的合同，风险集中在哪里？</li>
            <li><span>02</span>你改变了哪一个判断或流程？</li>
            <li><span>03</span>谁因此更快、更稳地完成了工作？</li>
          </ol>
          <Link href="/interview" className="primary-action dark">开始把事实写清楚 <span>→</span></Link>
        </div>
      </section>

      <footer className="studio-footer">
        <div className="footer-title">律转</div>
        <p>把法律人的经历，翻译成真正的职业价值。</p>
        <span>© CAREER TRANSLATION DESK</span>
      </footer>
    </main>
  );
}

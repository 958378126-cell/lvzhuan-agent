import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-10 py-5"
        style={{ backgroundColor: "#1a2744" }}
      >
        <span
          className="text-white text-sm font-semibold tracking-widest uppercase"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          ◎ 律转
        </span>
        <div className="hidden md:flex items-center gap-10">
          <a href="#how" className="text-sm text-blue-200 hover:text-white transition-colors">
            如何运作
          </a>
          <a href="#steps" className="text-sm text-blue-200 hover:text-white transition-colors">
            使用步骤
          </a>
        </div>
        <Link
          href="/interview"
          className="text-sm font-semibold px-5 py-2 rounded border border-white text-white hover:bg-white hover:text-[#1a2744] transition-colors"
        >
          开始访谈
        </Link>
      </nav>

      {/* Hero */}
      <section
        className="flex flex-col items-center justify-center text-center px-6 py-32"
        style={{ backgroundColor: "#1a2744" }}
      >
        <p className="text-blue-300 text-xs font-semibold tracking-[0.2em] uppercase mb-8">
          — &nbsp;Law to Legaltech &nbsp;—
        </p>
        <div className="flex items-center gap-2 mb-6">
          <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "#2563eb", color: "#fff" }}>
            Personal Agent
          </span>
          <span className="text-blue-300 text-xs">记忆你 · 主动问你 · 替你执行</span>
        </div>
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight max-w-3xl"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          把你的法律经历，
          <br />
          <span className="italic font-normal text-blue-300">
            翻译成真正的价值。
          </span>
        </h1>
        <p className="mt-8 text-blue-200 text-base sm:text-lg max-w-xl leading-8">
          不止是聊天框，也不止是模板生成器。<br className="hidden sm:block" />
          律转会记住你的能力档案，在每一步求职任务里主动替你思考和执行。
        </p>
        <Link
          href="/interview"
          className="mt-12 inline-flex items-center justify-center px-8 h-14 rounded bg-white text-[#1a2744] text-base font-semibold hover:bg-blue-50 transition-colors"
        >
          开始访谈 →
        </Link>
        <p className="mt-4 text-blue-300 text-sm">
          约 10 分钟 · 全程只问你、不评判你
        </p>
      </section>

      {/* Insight */}
      <section className="px-10 py-24" style={{ backgroundColor: "#1a2744" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="block h-px w-8 bg-blue-400" />
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-300">
              为什么做这个
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <h2
                className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-8"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                不是能力不够，
                <br />
                <span className="italic font-normal text-blue-300">
                  是不知道怎么讲。
                </span>
              </h2>
              <p className="text-blue-200 text-base leading-8">
                作者本人在高校法务部工作，想转型 legaltech / PM。
                投了很多简历，发现最大的障碍不是经历太少——
                而是把"我只是审合同""就搭了一半"这类话翻译成
                招聘方听得懂的语言，难到让人放弃。
              </p>
              <p className="text-blue-200 text-base leading-8 mt-4">
                律转做的事只有一件：逼问你的真实经历，帮你完成这个翻译。
              </p>
            </div>
            <div className="flex flex-col gap-5">
              {[
                {
                  icon: "◉",
                  title: "主动追问，不被动等待",
                  desc: "Agent 能力一：主动性。不接受「我只是审合同」这类模糊输入，追问到具体场景和结果，直到能翻译成 PM 语言为止。",
                },
                {
                  icon: "◈",
                  title: "记住你，跨任务复用",
                  desc: "Agent 能力二：记忆。访谈产出的《能力档案》被持久存储，成为简历生成、JD 匹配、邮件投递的唯一事实源——填一次，处处复用。",
                },
                {
                  icon: "◎",
                  title: "生成成果，不只给建议",
                  desc: "Agent 能力三：执行。从生成定制简历、分析 JD 匹配度，到起草可确认的投递邮件，Agent 直接产出成果，你只需确认或调整。",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <span className="text-blue-300 text-xl mt-0.5 flex-none">{item.icon}</span>
                  <div>
                    <div className="text-white text-sm font-semibold mb-1">{item.title}</div>
                    <div className="text-blue-200 text-sm leading-6">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-10 py-24" style={{ backgroundColor: "#f4f5f7" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="block h-px w-8 bg-[#1a2744]" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#1a2744]">
              用户反馈
            </span>
          </div>
          <h2
            className="text-4xl sm:text-5xl font-bold text-[#1a2744] leading-tight mb-16"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            真实使用，
            <br />
            <span className="italic font-normal text-[#6b7a99]">真实反馈。</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                quote: "访谈结束之后第一次看到自己的能力档案，才意识到原来我做过这么多有价值的事——我自己从来没这样梳理过。",
                name: "Sandy",
                role: "高校法务 · 转型 legaltech PM",
              },
              {
                quote: "生成的简历跟我以前写的完全不同，它会用岗位的语言讲我的经历，不是把我写的东西重新排列一下。",
                name: "测试用户",
                role: "律所律师 · 探索 PM 方向",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl bg-white p-8 shadow-sm flex flex-col gap-6">
                <p
                  className="text-[#1a2744] text-base leading-8 flex-1"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  「{item.quote}」
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-none"
                    style={{ backgroundColor: "#1a2744" }}
                  >
                    {item.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#1a2744]">{item.name}</div>
                    <div className="text-xs text-[#6b7a99]">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how"
        className="px-10 py-24"
        style={{ backgroundColor: "#f4f5f7" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="block h-px w-8 bg-[#1a2744]" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#1a2744]">
              如何运作
            </span>
          </div>
          <h2
            className="text-4xl sm:text-5xl font-bold text-[#1a2744] leading-tight mb-16"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            四个步骤。
            <br />
            <span className="italic font-normal text-[#6b7a99]">
              一份专属于你的能力档案。
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: "01",
                icon: "◉",
                title: "对齐访谈",
                desc: "Agent 逐问逼问你的真实经历，把「我就是打杂」翻译成可被识别的 PM 能力。",
                href: "/interview",
              },
              {
                num: "02",
                icon: "◈",
                title: "能力地图",
                desc: "生成你专属的能力档案，标注绿色王牌与红色缺口，知道自己站在哪里。",
                href: "/map",
              },
              {
                num: "03",
                icon: "◍",
                title: "JD 匹配分析",
                desc: "贴入目标 JD，Agent 对比你的档案，输出匹配分、能力缺口和具体行动建议。",
                href: "/analyze",
              },
              {
                num: "04",
                icon: "◎",
                title: "定制简历",
                desc: "一键生成针对该 JD 的简历，生成后可用自然语言继续迭代修改。",
                href: "/resume",
              },
              {
                num: "05",
                icon: "◇",
                title: "岗位面试准备",
                desc: "根据 JD 和你的真实经历，生成预测题、考察点与 STAR 准备卡。",
                href: "/interview-prep",
              },
            ].map((item) => (
              <Link key={item.num} href={item.href} className="block">
                <div
                  className="rounded-2xl p-8 flex flex-col gap-6 h-full transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#1a2744" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-blue-300 text-xs font-mono">{item.num}</span>
                    <span className="text-blue-300 text-2xl">{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3
                      className="text-white text-xl font-semibold mb-3"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-blue-200 text-sm leading-7">{item.desc}</p>
                  </div>
                  <span className="text-blue-300 text-sm font-semibold">进入 →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="px-10 py-24" style={{ backgroundColor: "#f4f5f7" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="block h-px w-8 bg-[#1a2744]" />
            <span className="text-xs font-semibold tracking-widest uppercase text-[#1a2744]">
              产品路线图
            </span>
          </div>
          <h2
            className="text-4xl sm:text-5xl font-bold text-[#1a2744] leading-tight mb-16"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Agent，不止于生成。
            <br />
            <span className="italic font-normal text-[#6b7a99]">
              从被动工具到主动伙伴。
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                status: "已上线",
                color: "#22c55e",
                icon: "◉",
                title: "对齐访谈 + 简历生成",
                desc: "上传简历 → Agent 深度访谈 → 能力档案 → JD 匹配分析 → 定制简历 + 一键导出 Word。",
              },
              {
                status: "已上线",
                color: "#22c55e",
                icon: "◈",
                title: "投递邮件草稿",
                desc: "Agent 从 JD 中识别投递邮箱并生成邮件草稿，人工确认后唤起你的默认邮件客户端完成投递。",
              },
              {
                status: "规划中",
                color: "#6b7a99",
                icon: "◎",
                title: "每日招聘日报",
                desc: "根据你的能力档案和偏好，Agent 每日主动推送匹配岗位摘要，直接进入 JD 分析流程。",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl p-8 flex flex-col gap-5 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ backgroundColor: item.color + "20", color: item.color }}
                  >
                    {item.status}
                  </span>
                  <span className="text-2xl" style={{ color: "#1a2744" }}>{item.icon}</span>
                </div>
                <div>
                  <h3
                    className="text-[#1a2744] text-lg font-semibold mb-2"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-[#6b7a99] text-sm leading-7">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section
        className="flex flex-col items-center justify-center text-center px-6 py-28"
        style={{ backgroundColor: "#1a2744" }}
      >
        <h2
          className="text-4xl sm:text-5xl font-bold text-white leading-tight max-w-xl"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          把不确定，
          <br />
          <span className="italic font-normal text-blue-300">换成清晰的方向。</span>
        </h2>
        <Link
          href="/interview"
          className="mt-10 inline-flex items-center justify-center px-8 h-14 rounded bg-white text-[#1a2744] text-base font-semibold hover:bg-blue-50 transition-colors"
        >
          开始访谈
        </Link>
        <p className="mt-4 text-blue-300 text-sm">
          约 10 分钟 · 档案默认保存在本浏览器
        </p>
      </section>

      {/* Footer */}
      <footer
        className="flex items-center justify-between px-10 py-6 text-blue-300 text-xs"
        style={{ backgroundColor: "#1a2744" }}
      >
        <span>◎ 律转 · legaltech 求职陪跑</span>
        <span>© 2026</span>
      </footer>
    </div>
  );
}

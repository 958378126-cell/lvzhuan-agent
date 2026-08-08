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
          法律人跨行最大的障碍，不是能力不够，
          <br className="hidden sm:block" />
          而是不知道怎么把经历讲成别人听得懂的话。
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
            三个步骤。
            <br />
            <span className="italic font-normal text-[#6b7a99]">
              一份专属于你的能力档案。
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                icon: "◉",
                title: "对齐访谈",
                desc: "Agent 逐问逼问你的真实经历，把「我就是打杂」翻译成可被识别的 PM 能力。",
              },
              {
                num: "02",
                icon: "◈",
                title: "能力地图",
                desc: "生成你专属的能力档案，标注绿色王牌与红色缺口，知道自己站在哪里。",
              },
              {
                num: "03",
                icon: "◎",
                title: "定制简历",
                desc: "贴入任意 JD，Agent 自动匹配你的档案，生成一份可直接投递的定制简历。",
                href: "/resume",
              },
            ].map((item) => {
              const card = (
                <div
                  key={item.num}
                  className="rounded-2xl p-8 flex flex-col gap-6 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#1a2744" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-blue-300 text-xs font-mono">{item.num}</span>
                    <span className="text-blue-300 text-2xl">{item.icon}</span>
                  </div>
                  <div>
                    <h3
                      className="text-white text-xl font-semibold mb-3"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-blue-200 text-sm leading-7">{item.desc}</p>
                  </div>
                  {"href" in item && (
                    <span className="text-blue-300 text-sm font-semibold mt-auto">开始生成 →</span>
                  )}
                </div>
              );
              return "href" in item ? (
                <Link key={item.num} href={item.href!} className="block">
                  {card}
                </Link>
              ) : (
                <div key={item.num}>{card}</div>
              );
            })}
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
          约 10 分钟 · 数据存在你自己手里
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

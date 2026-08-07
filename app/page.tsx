import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 bg-gradient-to-b from-white via-indigo-50/40 to-white">
      <div className="flex flex-col items-center text-center max-w-2xl">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-1.5 text-sm font-medium text-indigo-600 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
          律转 · legaltech 求职陪跑
        </span>

        <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
          你的法律经历，
          <br />
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            比你以为的值钱
          </span>
        </h1>

        <p className="mt-6 text-lg leading-8 text-slate-600 max-w-xl">
          法律人最强的能力，常常用最弱的方式讲出来。
          这个 Agent 不接受你的自我贬低——它会逼问你的真实经历，
          翻译成 legaltech / 产品经理岗位听得懂的价值。
        </p>

        <Link
          href="/interview"
          className="mt-10 inline-flex h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-transform hover:scale-[1.03]"
        >
          开始访谈 →
        </Link>

        <p className="mt-4 text-sm text-slate-400">
          约 10 分钟 · 全程只问你、不评判你
        </p>
      </div>
    </main>
  );
}

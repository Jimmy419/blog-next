import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-68px)] bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="grid gap-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 p-6 shadow-xl md:grid-cols-2 md:p-10">
          <div className="space-y-6">
            <Image
              src="/goalmanager-logo.svg"
              alt="GoalManager"
              width={220}
              height={56}
              className="h-12 w-auto"
              priority
            />
            <h1 className="text-3xl font-bold leading-tight md:text-4xl">
              把每一次努力
              <span className="text-emerald-400"> 变成看得见的成长曲线</span>
            </h1>
            <p className="text-sm leading-7 text-slate-300 md:text-[15px]">
              GoalManager 是一个专注于目标执行的轻量系统：设置目标、记录进度、
              自动统计达成率、支持密码保护删除，帮助你长期稳定地管理成长计划。
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/login"
                prefetch={false}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                立即登录开始记录
              </Link>
              <Link
                href="/register"
                prefetch={false}
                className="rounded-full border border-slate-600 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
              >
                注册新账号
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { label: "目标创建", value: "不限数量" },
                { label: "记录模式", value: "按时间追踪" },
                { label: "安全策略", value: "密码确认删除" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-slate-700 bg-slate-900/70 p-3"
                >
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="mb-3 text-sm font-medium text-slate-300">目标管理预览</p>
            <div className="rounded-lg border border-slate-700 bg-slate-950 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">好好吃饭</h3>
                <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                  进行中
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-300">进度：12 / 30（40%）</p>
              <div className="mt-2 h-2 rounded bg-slate-800">
                <div className="h-2 w-2/5 rounded bg-green-500" />
              </div>
              <p className="mt-3 text-sm text-slate-300">奖励：周末去游乐场</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="rounded-md border border-slate-700 bg-slate-950 p-2">
                +1 2026/05/09 10:46 主动完成
              </div>
              <div className="rounded-md border border-slate-700 bg-slate-950 p-2">
                +1 2026/05/10 10:48 晚饭吃完
              </div>
            </div>
            <div className="mt-3 rounded-md border border-emerald-400/30 bg-emerald-500/10 p-2 text-xs text-emerald-300">
              目标达成后状态自动切换为“已完成”
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "创建目标",
              desc: "支持配置目标值、奖励文案、奖励图片，形成完整激励闭环。",
            },
            {
              title: "进度可追溯",
              desc: "每次记录都带时间和备注，随时复盘执行节奏与状态变化。",
            },
            {
              title: "操作更安全",
              desc: "删除目标和历史记录均需密码确认，避免误删关键数据。",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-slate-800 bg-slate-900 p-4"
            >
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
          <h2 className="text-2xl font-bold">3 步开始你的 Goal Flow</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              "1. 创建目标：设置目标值与奖励，让行动有期待",
              "2. 每日记录：录入增量、时间与备注，形成执行轨迹",
              "3. 达成复盘：查看完成率与记录历史，持续优化习惯",
            ].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300"
              >
                {item}
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link
              href="/login"
              prefetch={false}
              className="inline-flex rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
            >
              登录后立即开始
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

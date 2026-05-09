"use client";
import { FC, useState } from "react";
import { Session } from "next-auth";
import { handleLogout } from "@/actions/auth.action";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface LinksProps {
  session: Session | null;
}

const Links: FC<LinksProps> = ({ session }) => {
  const pathname = usePathname();
  const isAuthed = Boolean(session?.user);
  const displayName =
    session?.user?.name || session?.user?.email || `用户#${session?.user?.id || ""}`;
  // 业务聚焦：暂时仅保留目标相关入口，其余导航先收起
  // const archivedLinks = ["/", "/about", "/contact", "/blog", "/jtool", "/robot", "/personal/me"];
  const goalLinks = [
    { title: "目标列表", path: "/personal/goals" },
    { title: "创建目标", path: "/personal/goals/new" },
  ];
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="hidden items-center gap-2 md:flex">
        {isAuthed ? (
          <>
            <span className="px-3 text-sm text-slate-300">{displayName}</span>
            {goalLinks.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  pathname === item.path
                    ? "bg-blue-600 text-white"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.title}
              </Link>
            ))}
            <form action={handleLogout}>
              <button className="rounded-full border border-red-300/40 px-3 py-1 text-sm text-red-200">
                Logout
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white"
          >
            Login
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2 md:hidden">
        {isAuthed ? (
          <>
            {/* <Link
              href="/personal/goals"
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                pathname === "/personal/goals"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-100"
              }`}
            >
              目标
            </Link>
            <Link
              href="/personal/goals/new"
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                pathname === "/personal/goals/new"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-100"
              }`}
            >
              + 新建
            </Link> */}
            <button
              type="button"
              className="relative z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-500 bg-slate-800"
              onClick={() => setOpen((prev) => !prev)}
              aria-label={open ? "关闭菜单" : "打开菜单"}
            >
              <span
                className={`absolute h-0.5 w-5 bg-white transition ${
                  open ? "rotate-45" : "-translate-y-1.5"
                }`}
              />
              <span
                className={`absolute h-0.5 w-5 bg-white transition ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute h-0.5 w-5 bg-white transition ${
                  open ? "-rotate-45" : "translate-y-1.5"
                }`}
              />
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white"
          >
            Login
          </Link>
        )}
      </div>

      {open && isAuthed ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="关闭菜单遮罩"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-slate-700 bg-slate-950 p-5 text-white shadow-2xl">
            <div className="mb-4 mx-auto h-1.5 w-10 rounded-full bg-slate-700" />
            <div className="mb-5 rounded-xl border border-slate-700 bg-slate-900 p-3">
              <p className="text-xs text-slate-400">账户</p>
              <p className="mt-1 truncate text-sm font-medium">
                {displayName}
              </p>
            </div>

            <nav className="grid grid-cols-2 gap-2">
              {goalLinks.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl border px-3 py-2 text-center text-sm font-medium ${
                    pathname === item.path
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-slate-700 bg-slate-900 text-slate-100"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
            <form action={handleLogout}>
              <button
                className="mt-4 w-full rounded-xl border border-red-400/60 bg-red-500/10 px-3 py-2 text-left font-medium text-red-200"
                onClick={() => setOpen(false)}
              >
                Logout
              </button>
            </form>
          </aside>
        </div>
      ) : null}
    </div>
  );
};

export default Links;

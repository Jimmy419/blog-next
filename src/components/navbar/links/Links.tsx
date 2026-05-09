"use client";
import { FC, useMemo, useState } from "react";
import NavLink from "./navLink/NavLink";

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
  const links = useMemo(
    () => [
      {
        title: "home",
        path: "/",
      },
      {
        title: "About",
        path: "/about",
      },
      {
        title: "Contact",
        path: "/contact",
      },
      {
        title: "Blog",
        path: "/blog",
      },
      {
        title: "JTool",
        path: "/jtool",
      },
    ],
    []
  );
  const authedLinks = useMemo(
    () => [
      { title: "我的", path: "/personal/me" },
      { title: "目标", path: "/personal/goals" },
      { title: "Robot", path: "/robot" },
    ],
    []
  );

  const mobileLinks = isAuthed ? [...links, ...authedLinks] : links;
  const isAdmin = false;
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="hidden items-center md:flex">
        {links.map((item) => (
          <NavLink item={item} key={item.title} />
        ))}
        {isAuthed ? (
          <>
            {isAdmin && <NavLink item={{ title: "Admin", path: "/admin" }} />}
            <span className="px-3 text-sm text-white/90">{displayName}</span>
            {authedLinks.map((item) => (
              <NavLink item={item} key={item.path} />
            ))}
            <form action={handleLogout}>
              <button className="rounded-full border border-white/30 px-3 py-1 text-sm text-white/90">
                Logout
              </button>
            </form>
          </>
        ) : (
          <NavLink item={{ title: "Login", path: "/login" }} />
        )}
      </div>

      <button
        type="button"
        className="relative z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-500 bg-slate-800 md:hidden"
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

      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="关闭菜单遮罩"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-[85vw] max-w-sm border-l border-slate-700 bg-slate-950 p-5 text-white shadow-2xl">
            <div className="mb-5 rounded-xl border border-slate-700 bg-slate-900 p-3">
              <p className="text-xs text-slate-400">导航菜单</p>
              <p className="mt-1 truncate text-sm font-medium">
                {isAuthed ? displayName : "未登录"}
              </p>
            </div>

            <nav className="flex flex-col gap-2">
              {mobileLinks.map((item) => {
                const active = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setOpen(false)}
                    className={`rounded-xl px-3 py-2 text-base font-medium transition ${
                      active
                        ? "bg-blue-600 text-white"
                        : "border border-slate-700 bg-slate-900 text-slate-100"
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}
              {isAuthed ? (
                <form action={handleLogout}>
                  <button
                    className="mt-2 w-full rounded-xl border border-red-400/60 bg-red-500/10 px-3 py-2 text-left font-medium text-red-200"
                    onClick={() => setOpen(false)}
                  >
                    Logout
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className={`mt-2 rounded-xl px-3 py-2 text-base transition ${
                    pathname === "/login"
                      ? "bg-blue-600 text-white"
                      : "border border-slate-700 bg-slate-900 text-slate-100"
                  }`}
                >
                  Login
                </Link>
              )}
            </nav>
          </aside>
        </div>
      ) : null}
    </div>
  );
};

export default Links;

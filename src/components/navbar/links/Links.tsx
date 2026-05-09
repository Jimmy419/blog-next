"use client";
import { FC, useState } from "react";
import NavLink from "./navLink/NavLink";

import { Session } from "next-auth";
import Image from "next/image";
import { handleLogout } from "@/actions/auth.action";

interface LinksProps {
  session: Session | null;
}

const Links: FC<LinksProps> = ({ session }) => {
  const isAuthed = Boolean(session?.user);
  const displayName =
    session?.user?.name || session?.user?.email || `用户#${session?.user?.id || ""}`;
  const links = [
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
    // {
    //   title: "Robot",
    //   path: "/robot",
    // },
    {
      title: "JTool",
      path: "/jtool",
    }
  ];

  const isAdmin = false;
  // const session = false;
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="md:flex items-center hidden">
        {links.map((item) => (
          <NavLink item={item} key={item.title} />
        ))}
        {isAuthed ? (
          <>
            {isAdmin && <NavLink item={{ title: "Admin", path: "/admin" }} />}
            <span className="px-3 text-sm text-white/90">{displayName}</span>
            <NavLink item={{ title: "我的", path: "/personal/me" }} />
            <NavLink item={{ title: "目标", path: "/personal/goals" }} />
            <NavLink item={{ title: "Robot", path: "/robot" }} />
            <form action={handleLogout}>
              <button className="">Logout</button>
            </form>
          </>
        ) : (
          <NavLink item={{ title: "Login", path: "/login" }} />
        )}
      </div>

      <Image
        src="/menu.png"
        className="cursor-pointer block md:hidden"
        alt=""
        width={30}
        height={30}
        onClick={() => setOpen((prev) => !prev)}
      />
      {open && (
        <div className="flex md:hidden flex-col fixed top-[100px] right-0 w-1/2 h-[calc(100vh-100px)] bg-[var(--bg)] items-center justify-center gap-2.5">
          {links.map((item) => (
            <NavLink item={item} key={item.title} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Links;

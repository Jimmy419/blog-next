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
        {session && session.user && session.user.id ? (
          <>
            {isAdmin && <NavLink item={{ title: "Admin", path: "/admin" }} />}
            <NavLink item={{ title: "我的", path: "/personal/me" }} />
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

"use client";
import { FC, useState } from "react";
import NavLink from "./navLink/NavLink";
import { SessionType } from "@/types/auth.type";
import { handleLogout } from "@/lib/action";
// import { auth } from "@/lib/auth";

interface LinksProps {
  session: SessionType;
}

const Links: FC<LinksProps> = ({ session }) => {
  // const authResult = await auth();
  // console.log("authResult", authResult);
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
      {links.map((item) => (
        <NavLink item={item} key={item.title} />
      ))}
      {session ? (
        <>
          {isAdmin && <NavLink item={{ title: "Admin", path: "/admin" }} />}
          <form action={handleLogout}>
            <button>Logout</button>
          </form>
        </>
      ) : (
        <NavLink item={{ title: "Login", path: "/login" }} />
      )}

      <button
        onClick={() => {
          setOpen((pre) => !pre);
        }}
      >
        Menu
      </button>
      {open && (
        <div>
          {links.map((item) => (
            <NavLink item={item} key={item.title} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Links;

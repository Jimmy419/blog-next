"use client";
import { useState } from "react";
import NavLink from "./navLink/NavLink";

const Links = () => {
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
  const session = false;
  const [open, setOpen] = useState(false);

  return (
    <div>
      {links.map((item) => (
        <NavLink item={item} key={item.title} />
      ))}
      {session ? (
        <>
          {isAdmin && <NavLink item={{ title: "Admin", path: "/admin" }} />}
          <button>Logout</button>
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

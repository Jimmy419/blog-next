"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC } from "react";

interface NavLinkProps {
  item: {
    title: string;
    path: string;
  };
}

const NavLink: FC<NavLinkProps> = ({ item }) => {
  const pathName = usePathname();
  const active = pathName === item.path;

  return (
    <Link
      href={item.path}
      className={`rounded-full px-3 py-1.5 text-sm transition ${
        active
          ? "bg-blue-600 text-white"
          : "text-slate-200 hover:bg-white/10 hover:text-white"
      }`}
    >
      {item.title}
    </Link>
  );
};

export default NavLink;

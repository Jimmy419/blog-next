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

  return (
    <Link href={item.path} className={`${pathName === item.path && "text-yellow-50"} px-3`}>
      {item.title}
    </Link>
  );
};

export default NavLink;

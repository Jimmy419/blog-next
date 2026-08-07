"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = pathname.startsWith("/jtool/stocks");

  return (
    <div className="flex min-h-screen flex-col md:flex-row md:overflow-hidden">
      {!hideSidebar ? (
        <div className="flex flex-col p-5">
          <Link className="p-2" href="/jtool/calculator">
            Calculator
          </Link>
          <Link className="p-2" href="/jtool/formatter">
            Formatter
          </Link>
          <Link className="p-2" href="/jtool/stocks">
            Stocks
          </Link>
          <Link className="p-2" href="/jtool/validator">
            Validator
          </Link>
        </div>
      ) : null}
      <div
        className={
          hideSidebar
            ? "flex-grow md:overflow-y-auto"
            : "flex-grow p-6 md:overflow-y-auto md:p-12"
        }
      >
        {children}
      </div>
    </div>
  );
}

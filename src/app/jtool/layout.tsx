import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="flex flex-col p-5">
        <Link className="p-2" href="/jtool/calculator">
          Calculator
        </Link>
        <Link className="p-2" href="/jtool/formatter">
          Formatter
        </Link>
        <Link className="p-2" href="/jtool/validator">
          Validator
        </Link>
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}

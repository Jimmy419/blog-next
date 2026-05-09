import { auth } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import Links from "./links/Links";

const Navbar = async () => {
  const session = await auth();

  return (
    <div className="sticky top-0 z-30 border-b border-slate-700 bg-slate-950 px-4 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <Link href="/" className="shrink-0" aria-label="返回首页">
          <Image
            src="/goalmanager-logo.svg"
            alt="GoalManager Logo"
            width={220}
            height={56}
            className="h-10 w-auto md:h-12"
            priority
          />
        </Link>
        <div>
          <Links session={session} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;

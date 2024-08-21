import { auth } from "@/lib/auth";
import Links from "./links/Links";

const Navbar = async () => {
  const session = await auth();
  // console.log("session*******009",session);

  return (
    <div>
      <div>Logo</div>
      <div>
        <Links session={session} />
      </div>
    </div>
  );
};

export default Navbar;

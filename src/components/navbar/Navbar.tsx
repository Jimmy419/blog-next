import { auth } from "@/lib/auth";
import Links from "./links/Links";

const Navbar = async () => {
  const session = await auth();
  // console.log("session*******009",session);

  return (
    <div className="flex justify-between p-3 bg-lime-500">
      <div>Logo</div>
      <div>
        <Links session={session} />
      </div>
    </div>
  );
};

export default Navbar;

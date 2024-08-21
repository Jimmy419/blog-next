// import Image from "next/image";

import { auth } from "@/lib/auth";
import { syncDb } from "@/server/actions/dbSync.actions";
import { getUsers } from "@/server/actions/user.actions";

export default async function Home() {
  const session = await auth();
  // await syncDb();
  // const posts = await getUsers();
  // console.log('posts',posts)
  // const [users, setUsers] = useState([]);

  // useEffect(() => {
  //   async function fetchUsers() {
  //     const response = await fetch("/api/users");
  //     const data = await response.json();
  //     setUsers(data);
  //   }

  //   fetchUsers();
  // }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      hello world
    </main>
  );
}

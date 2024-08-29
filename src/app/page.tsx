// import Image from "next/image";

import { getBlogList } from "@/actions/blog.action";
import { auth } from "@/lib/auth";
import { syncDb } from "@/server/actions/dbSync.actions";
import { getUsers } from "@/server/actions/user.actions";
import Link from "next/link";

export default async function Home() {
  // await syncDb();
  const session = await auth();
  const list = await getBlogList();
  
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
      <div>
        {list.map((item) => (
          <div key={item.id}>
            <Link href={`/blog/${item.id}`}>{item.title}</Link>
          </div>
        ))}
      </div>
    </main>
  );
}

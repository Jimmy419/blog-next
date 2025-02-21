import { getBlogList } from "@/actions/blog.action";
import { ChatWindow } from "@/components/aiChat/ChatWindowTwo";
import { auth } from "@/lib/auth";
import { Camera } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  // const session = await auth();
  const list = await getBlogList();

  return (
    <main className="flex min-h-[calc(100vh-100px)] flex-col items-center justify-between p-24">
      {/* <Camera color="red" size={48} />; */}
      <ChatWindow
        apiBaseUrl={
          process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080"
        }
        titleText="VO2 Asia 🦜🔗"
        placeholder="Ask anything..."
      ></ChatWindow>
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

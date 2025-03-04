import { getBlogList } from "@/actions/blog.action";
import { ChatWindow } from "@/components/aiChat/ChatWindowTwo";
import { auth } from "@/lib/auth";
import { Camera } from "lucide-react";
import Link from "next/link";
import { ToastContainer } from "react-toastify";

import { ChakraProvider } from "@chakra-ui/react";

export default async function Home() {
  // const session = await auth();
  const list = await getBlogList();

  return (
    <ChakraProvider>
      <ToastContainer />
      <main className="flex min-h-[calc(100vh-68px)] flex-col items-center justify-between p-24 md:p-8 bg-zinc-900">
        {/* <Camera color="red" size={48} />; */}
        <ChatWindow
          apiBaseUrl={
            process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
          }
          titleText="Hi! Welcome to our website"
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
    </ChakraProvider>
  );
}

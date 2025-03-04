import { ChatWindow } from "@/components/aiChat/ChatWindowTwo";
import { ToastContainer } from "react-toastify";
import { ChakraProvider } from "@chakra-ui/react";

const BlogPage = () => {
  return (
    <div className="flex min-h-[calc(100vh-68px)] flex-col items-center justify-between p-24 md:p-8 bg-zinc-900">
      <ChakraProvider>
        <ToastContainer />
        <ChatWindow
          apiBaseUrl={
            process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
          }
          titleText="Hi! Welcome to our website"
          placeholder="Ask anything..."
        ></ChatWindow>
      </ChakraProvider>
    </div>
  );
};

export default BlogPage;

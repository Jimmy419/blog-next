import { auth } from "@/lib/auth";
import Blog from "@/server/model/Blog";
import { NextRequest } from "next/server";
import { z } from "zod";

export const POST = async (request: NextRequest) => {
  const session = await auth();
//   console.log("session", session);
//   console.log(request);
//   console.log("******req body******");
  const dataReceived = await request.json();
  const dataToSave = {
    ...dataReceived,
    author: Number(session?.user?.id),
  };
  const parsedCredentials = z
    .object({
      title: z.string().min(1),
      tag: z.string().min(1),
      content: z.string().min(1),
      author: z.number().min(1),
    })
    .safeParse(dataToSave);
  if (parsedCredentials) {
    try {
      await Blog.create(parsedCredentials.data);
      return new Response("ok", { status: 200 });
    } catch (error) {
      console.log(error);
      return new Response("error", { status: 500 });
    }
  }

  return new Response(JSON.stringify({ error: "parmas invalid" }), {
    status: 500,
  });
};

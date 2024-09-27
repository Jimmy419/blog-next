import { getBlogById } from "@/actions/blog.action";
import prisma from "@/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { z } from "zod";

export const POST = async (request: NextRequest) => {
  const session = await auth();
  const dataReceived = await request.json();
  let dataFromDb = undefined;
  if (dataReceived.id) {
    dataFromDb = await getBlogById(dataReceived.id);
    if (!dataFromDb)
      return new Response(JSON.stringify({ error: "bad request!" }), {
        status: 500,
      });
  }
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
  if (parsedCredentials && parsedCredentials.data) {
    try {
      if (dataFromDb) {
        await prisma.blog.update({data:parsedCredentials.data,
          where: {
            id: dataFromDb.id,
          },
        });
      } else {
        await prisma.blog.create({data:parsedCredentials.data});
      }

      return new Response("ok", { status: 200 });
    } catch (error) {
      console.error(error);
      return new Response("error", { status: 500 });
    }
  }

  return new Response(JSON.stringify({ error: "parmas invalid" }), {
    status: 500,
  });
};

export const GET = async (request: NextRequest) => {
  const dataList = await prisma.blog.findMany();
  return new Response(JSON.stringify(dataList), { status: 200 });
};

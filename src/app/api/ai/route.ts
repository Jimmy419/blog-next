// import prisma from "@/db";
// import { auth } from "@/lib/auth";
// import { z } from "zod";
// const bodyParser = require('body-parser');
import { NextRequest, NextResponse } from "next/server";
import https from "https";

export const POST = async (req: NextRequest) => {
  try {
    const { prompt, sessionId = null } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const postData = JSON.stringify({
      input: {
        prompt,
        session_id: sessionId,
      },
      parameters: {
        incremental_output: true,
      },
      debug: {},
    });

    const options = {
      hostname: "dashscope.aliyuncs.com",
      path: `/api/v1/apps/${process.env.BAILIAN_APP_ID}/completion`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BAILIAN_API_KEY}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
        "X-DashScope-SSE": "enable",
      },
    };

    return new Promise((resolve) => {
      const externalReq = https.request(options, (externalRes) => {
        let responseData = "";

        externalRes.on("data", (chunk) => {
          responseData += chunk;
        });

        externalRes.on("end", () => {
          resolve(
            new NextResponse(responseData, {
              status: externalRes.statusCode || 200,
            })
          );
        });
      });

      externalReq.on("error", (error) => {
        console.error(error);
        resolve(
          NextResponse.json(
            { error: "An error occurred while contacting the external API" },
            { status: 500 }
          )
        );
      });

      // Write and end the external request
      externalReq.write(postData);
      externalReq.end();
    });
  } catch (error) {
    console.error("Error processing the request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};




// export const POST = async (request: NextRequest) => {
//   const session = await auth();
//   const dataReceived = await request.json();
//   let dataFromDb = undefined;
//   if (dataReceived.id) {
//     dataFromDb = await getBlogById(dataReceived.id);
//     if (!dataFromDb)
//       return new Response(JSON.stringify({ error: "bad request!" }), {
//         status: 500,
//       });
//   }
//   const dataToSave = {
//     ...dataReceived,
//     author: Number(session?.user?.id),
//   };
//   const parsedCredentials = z
//     .object({
//       title: z.string().min(1),
//       tag: z.string().min(1),
//       content: z.string().min(1),
//       author: z.number().min(1),
//     })
//     .safeParse(dataToSave);
//   if (parsedCredentials && parsedCredentials.data) {
//     try {
//       if (dataFromDb) {
//         await prisma.blog.update({data:parsedCredentials.data,
//           where: {
//             id: dataFromDb.id,
//           },
//         });
//       } else {
//         await prisma.blog.create({data:parsedCredentials.data});
//       }

//       return new Response("ok", { status: 200 });
//     } catch (error) {
//       console.error(error);
//       return new Response("error", { status: 500 });
//     }
//   }

//   return new Response(JSON.stringify({ error: "parmas invalid" }), {
//     status: 500,
//   });
// };
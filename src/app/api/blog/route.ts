import { NextRequest } from "next/server";


export const POST = async (request:NextRequest) => {
    console.log(request)
    console.log("******req body******");
    console.log(await request.json());
    return new Response("ok",{status:200})
}
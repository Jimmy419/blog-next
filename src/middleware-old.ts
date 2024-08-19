import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

// export default NextAuth(authConfig).auth;

// This function can be marked `async` if using `await` inside
// export async function middleware(request: NextRequest) {
//   const session = await auth();
//   console.log('session',session)
//   console.log('request*****', request)
//   // return NextResponse.redirect(new URL('/', request.url))
// }

// export const config = {
//   matcher: ["/((?!api|static|.*\\..*|_next).*)"],
// };

// FOR MORE INFORMATION CHECK: https://nextjs.org/docs/app/building-your-application/routing/middleware
import { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    // FOR MORE DETAIL ABOUT CALLBACK FUNCTIONS CHECK https://next-auth.js.org/configuration/callbacks
    async jwt({ token, user }) {
      console.error("token,user0009", token, user);
      //这个地方只有在登录的时候才会有user，其他情况下都是undefined
      if (user) {
        token.id = `${user.id}`;
        // token.username = user.username;
        token.email = user.email;
        token.image = user.image;
        // token.realname = user.realname;
      }
      return token;
    },
    async session({ session, token }) {
      console.info("token,user0017", token, session);
      if (token) {
        session.user.id = token.id as string;
        // session.user.username = token.username;
      }
      return session;
    },
    authorized({ auth, request }) {
      console.log(request);
      const user = auth?.user;
      // const isOnAdminPanel = request.nextUrl?.pathname.startsWith("/admin");
      const isOnBlogPage = request.nextUrl?.pathname.startsWith("/blog");
      const isOnLoginPage = request.nextUrl?.pathname.startsWith("/login");
      const isOnPersonalPage =
        request.nextUrl?.pathname.startsWith("/personal");

      // ONLY ADMIN CAN REACH THE ADMIN DASHBOARD

      // if (isOnAdminPanel && !user?.isAdmin) {
      //   return false;
      // }

      // ONLY AUTHENTICATED USERS CAN REACH THE BLOG PAGE

      if (isOnBlogPage && !user) {
        return false;
      }

      if (isOnPersonalPage && !user) {
        return false;
      }

      // ONLY UNAUTHENTICATED USERS CAN REACH THE LOGIN PAGE

      if (isOnLoginPage && user) {
        return Response.redirect(new URL("/", request.nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;

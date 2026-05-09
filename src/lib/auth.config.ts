import { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    // FOR MORE DETAIL ABOUT CALLBACK FUNCTIONS CHECK https://next-auth.js.org/configuration/callbacks
    async jwt({ token, user }) {
      //这个地方只有在登录的时候才会有user，其他情况下都是undefined
      if (user) {
        token.id = `${user.id}`;
        token.roles = user.roles;
        token.email = user.email;
        token.image = user.image;
        // token.realname = user.realname;
      }
      // 兜底：部分场景 user 为空时，仍从 sub 回填 id，确保 session.user.id 可用
      if (!token.id && token.sub) {
        token.id = token.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id || token.sub || "") as string;
        session.user.roles = token.roles as string;
      }
      return session;
    },
    authorized({ auth, request }) {
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
        return Response.redirect(new URL("/personal/goals", request.nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;

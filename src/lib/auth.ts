import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// Your own logic for dealing with plaintext password strings; be careful!
// import { saltAndHashPassword } from "@/utils/password";
import prisma from "@/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  // trustHost:false,
  // session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // credentials: {
      //   username: {},
      //   password: {},
      // },
      async authorize(credentials) {
        console.log("🚀 ~ authorize ~ credentials:", credentials);
        const parsedCredentials = z
          .object({
            username: z.string(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { username, password } = parsedCredentials.data;
          const user = await prisma.user.findFirst({
            where: { username },
          });
          if (!user) return null;

          const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
          );
          console.log("🚀 ~ authorize ~ isPasswordCorrect:", isPasswordCorrect);

          if (isPasswordCorrect) {
            // 只返回非敏感信息，构建符合 NextAuth 的 User 类型
            const safeUser = {
              id: user.id.toString(), // NextAuth 中的 id 是字符串类型
              name: user.username,
              email: user.email,
              image: user.image,
              roles: user.roles || "",
            };
            console.log("🚀 ~ authorize ~ safeUser:", safeUser);

            return safeUser;
          }
        }

        return null;
      },
    }),
  ],
});

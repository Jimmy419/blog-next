import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// Your own logic for dealing with plaintext password strings; be careful!
// import { saltAndHashPassword } from "@/utils/password";
import User from "@/db/model/User";
import bcrypt from "bcrypt";
import { authConfig } from "./auth.config";
import { z } from "zod";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
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
        const parsedCredentials = z
          .object({
            username: z.string(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { username, password } = parsedCredentials.data;
          const user = await User.findOne({
            where: { username },
          });
          console.log("user777777", user);
          if (!user) return null;

          const isPasswordCorrect = await bcrypt.compare(
            password,
            user.getDataValue("password")
          );

          if (isPasswordCorrect) return user.dataValues;
        }

        return null;
      },
    }),
  ],
});

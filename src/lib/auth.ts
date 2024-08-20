import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// Your own logic for dealing with plaintext password strings; be careful!
// import { saltAndHashPassword } from "@/utils/password";
import User from "@/server/model/User";
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
      async authorize(credentials){
        console.log("credentials", JSON.stringify(credentials));

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
  // callbacks: {
  //   async session({ session, token }) {
  //     console.log("session, token********045",JSON.stringify(session), JSON.stringify(token))
  //     // if (session && token.sub) {
  //     //   session.user.id = token.sub
  //     // }
  //     // if (session.user && token.role) {
  //     //   session.user.role = token.role as string
  //     // }
  //     // if (session.user) {
  //     //   session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
  //     //   session.user.name = token.name
  //     //   session.user.email = token.email as string
  //     //   session.user.isOAuth = token.isOAuth as boolean
  //     //   session.user.image = token.image as string
  //     // }
  //     return session
  //   },
  //   async jwt({ token }) {
  //     console.log("session, token********062", JSON.stringify(token))
  //     if (!token.sub) return token
  //     const existingUser = await User.findOne({
  //       where: {id:token.sub}
  //     })
  //     // console.log('existingUser',existingUser)
  //     if (!existingUser) return token
  //     // // const existingAccount = await db.query.accounts.findFirst({
  //     // //   where: eq(accounts.userId, existingUser.id),
  //     // // })
  //     console.log('existingUser',existingUser,existingUser.getDataValue("username"))
  //     // // token.isOAuth = !!existingAccount
  //     token.name = existingUser.getDataValue("username");
  //     // token.email = existingUser.email
  //     // token.role = existingUser.role
  //     // token.isTwoFactorEnabled = existingUser.twoFactorEnabled
  //     token.image = existingUser.getDataValue("image")
  //     return token
  //   },
  // },
});

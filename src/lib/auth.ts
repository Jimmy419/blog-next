import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
// import { connectToDb } from "./utils";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import User from "@/server/model/User";

console.log("bcrypt.compare*****************", bcrypt.compare);
const login = async (credentials: any) => {
  try {
    // connectToDb();
    const user = await User.findOne({
      where: { username: credentials.username },
    });

    if (!user) throw new Error("Wrong credentials!");
    console.log("bcrypt.compare*****************", bcrypt.compare);
    const isPasswordCorrect = await bcrypt.compare(
      credentials.password,
      // @ts-ignore
      user.password
    );

    if (!isPasswordCorrect) throw new Error("Wrong credentials!");

    return user;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to login!");
  }
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      // @ts-ignore
      async authorize(credentials) {
        try {
          const user = await login(credentials);
          return user;
        } catch (err) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account.provider === "github") {
        // connectToDb();
        try {
          const user = await User.findOne({ where: { email: profile.email } });

          if (!user) {
            await User.create({
              username: profile.login,
              email: profile.email,
              image: profile.avatar_url,
            });
          }
        } catch (err) {
          console.log(err);
          return false;
        }
      }
      return true;
    },
    ...authConfig.callbacks,
  },
});

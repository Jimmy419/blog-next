import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// Your own logic for dealing with plaintext password strings; be careful!
// import { saltAndHashPassword } from "@/utils/password";
import User from "@/server/model/User";
import bcrypt from "bcrypt";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
      authorize: async (credentials) => {
        console.log('credentials',credentials)
        try {
          // connectToDb();
          const user = await User.findOne({
            where: { username: credentials?.username },
          });

          if (!user) throw new Error("Wrong credentials!");
          console.log("bcrypt.compare*****************", bcrypt.compare);
          const isPasswordCorrect = await bcrypt.compare(
            credentials?.password as string,
            user.getDataValue("password")
          );

          if (!isPasswordCorrect) throw new Error("Wrong credentials!");

          return user;
        } catch (err) {
          console.log(err);
          throw new Error("Failed to login!");
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      console.log("session, token********045",session, token)
      // if (session && token.sub) {
      //   session.user.id = token.sub
      // }
      // if (session.user && token.role) {
      //   session.user.role = token.role as string
      // }
      // if (session.user) {
      //   session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
      //   session.user.name = token.name
      //   session.user.email = token.email as string
      //   session.user.isOAuth = token.isOAuth as boolean
      //   session.user.image = token.image as string
      // }
      return session
    },
    async jwt({ token }) {
      console.log("session, token********062", token)
      if (!token.sub) return token
      const existingUser = await User.findOne({
        where: {id:token.sub}
      })
      // console.log('existingUser',existingUser)
      if (!existingUser) return token
      // // const existingAccount = await db.query.accounts.findFirst({
      // //   where: eq(accounts.userId, existingUser.id),
      // // })
      console.log('existingUser',existingUser,existingUser.getDataValue("username"))
      // // token.isOAuth = !!existingAccount
      token.name = existingUser.getDataValue("username");
      // token.email = existingUser.email
      // token.role = existingUser.role
      // token.isTwoFactorEnabled = existingUser.twoFactorEnabled
      token.image = existingUser.getDataValue("image")
      return token
    },
  },
});

// import NextAuth from "next-auth";
// import GitHub from "next-auth/providers/github";
// import Credentials from "next-auth/providers/credentials";
// // import { connectToDb } from "./utils";
// import bcrypt from "bcryptjs";
// // import { authConfig } from "./auth.config";
// import User from "@/server/model/User";

// const login = async (credentials: any) => {
//   try {
//     // connectToDb();
//     const user = await User.findOne({
//       where: { username: credentials.username },
//     });

//     if (!user) throw new Error("Wrong credentials!");
//     console.log("bcrypt.compare*****************", bcrypt.compare);
//     const isPasswordCorrect = await bcrypt.compare(
//       credentials.password,
//       // @ts-ignore
//       user.password
//     );

//     if (!isPasswordCorrect) throw new Error("Wrong credentials!");

//     return user;
//   } catch (err) {
//     console.log(err);
//     throw new Error("Failed to login!");
//   }
// };

// export const {
//   handlers,
//   auth,
//   signIn,
//   signOut,
// } = NextAuth({
//   // ...authConfig,
//   providers: [
//     // GitHub({
//     //   clientId: process.env.GITHUB_ID!,
//     //   clientSecret: process.env.GITHUB_SECRET!,
//     // }),
//     Credentials({
//       credentials: {
//         username: {},
//         password: {},
//       },
//       // @ts-ignore
//       async authorize(credentials) {
//         try {
//           const user = await login(credentials);
//           return user;
//         } catch (err) {
//           return null;
//         }
//       },
//     }),
//   ],
//   // callbacks: {
//   //   async signIn({ user, account, profile }: any) {
//   //     if (account.provider === "github") {
//   //       // connectToDb();
//   //       try {
//   //         const user = await User.findOne({ where: { email: profile.email } });

//   //         if (!user) {
//   //           await User.create({
//   //             username: profile.login,
//   //             email: profile.email,
//   //             image: profile.avatar_url,
//   //           });
//   //         }
//   //       } catch (err) {
//   //         console.log(err);
//   //         return false;
//   //       }
//   //     }
//   //     return true;
//   //   },
//   //   ...authConfig.callbacks,
//   // },
//   callbacks: {
//     // async session({ session, token }) {
//     //   if (session && token.sub) {
//     //     session.user.id = token.sub
//     //   }
//     //   if (session.user && token.role) {
//     //     session.user.role = token.role as string
//     //   }
//     //   if (session.user) {
//     //     session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
//     //     session.user.name = token.name
//     //     session.user.email = token.email as string
//     //     session.user.isOAuth = token.isOAuth as boolean
//     //     session.user.image = token.image as string
//     //   }
//     //   return session
//     // },
//     // async jwt({ token }) {
//     //   if (!token.sub) return token
//     //   const existingUser = await db.query.users.findFirst({
//     //     where: eq(users.id, token.sub),
//     //   })
//     //   if (!existingUser) return token
//     //   const existingAccount = await db.query.accounts.findFirst({
//     //     where: eq(accounts.userId, existingUser.id),
//     //   })

//     //   token.isOAuth = !!existingAccount
//     //   token.name = existingUser.name
//     //   token.email = existingUser.email
//     //   token.role = existingUser.role
//     //   token.isTwoFactorEnabled = existingUser.twoFactorEnabled
//     //   token.image = existingUser.image
//     //   return token
//     // },
//     async signIn({ user, account, profile }: any) {
//       if (account.provider === "github") {
//         // connectToDb();
//         try {
//           const user = await User.findOne({ where: { email: profile.email } });

//           if (!user) {
//             await User.create({
//               username: profile.login,
//               email: profile.email,
//               image: profile.avatar_url,
//             });
//           }
//         } catch (err) {
//           console.log(err);
//           return false;
//         }
//       }
//       return true;
//     },
//   },
// });

"use server";

import User from "@/server/model/User";
// import { revalidatePath } from "next/cache";
// import { Post, User } from "./models";
// import { connectToDb } from "./utils";
import { signIn, signOut } from "./auth";
import bcrypt from "bcrypt";
import { AuthError } from "next-auth";

// export const addPost = async (prevState, formData) => {
//   // const title = formData.get("title");
//   // const desc = formData.get("desc");
//   // const slug = formData.get("slug");

//   const { title, desc, slug, userId } = Object.fromEntries(formData);

//   try {
//     connectToDb();
//     const newPost = new Post({
//       title,
//       desc,
//       slug,
//       userId,
//     });

//     await newPost.save();
//     console.log("saved to db");
//     revalidatePath("/blog");
//     revalidatePath("/admin");
//   } catch (err) {
//     console.log(err);
//     return { error: "Something went wrong!" };
//   }
// };

// export const deletePost = async (formData) => {
//   const { id } = Object.fromEntries(formData);

//   try {
//     connectToDb();

//     await Post.findByIdAndDelete(id);
//     console.log("deleted from db");
//     revalidatePath("/blog");
//     revalidatePath("/admin");
//   } catch (err) {
//     console.log(err);
//     return { error: "Something went wrong!" };
//   }
// };

// export const addUser = async (prevState, formData) => {
//   const { username, email, password, img } = Object.fromEntries(formData);

//   try {
//     connectToDb();
//     const newUser = new User({
//       username,
//       email,
//       password,
//       img,
//     });

//     await newUser.save();
//     console.log("saved to db");
//     revalidatePath("/admin");
//   } catch (err) {
//     console.log(err);
//     return { error: "Something went wrong!" };
//   }
// };

// export const deleteUser = async (formData) => {
//   const { id } = Object.fromEntries(formData);

//   try {
//     connectToDb();

//     await Post.deleteMany({ userId: id });
//     await User.findByIdAndDelete(id);
//     console.log("deleted from db");
//     revalidatePath("/admin");
//   } catch (err) {
//     console.log(err);
//     return { error: "Something went wrong!" };
//   }
// };

// export const handleGithubLogin = async () => {
//   "use server";
//   await signIn("github");
// };

export const handleLogout = async () => {
  await signOut();
};

export const register = async (
  previousState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) => {
  const { username, email, password, img, passwordRepeat } =
    Object.fromEntries(formData);

  if (password !== passwordRepeat) {
    return { error: "Passwords do not match" };
  }

  try {
    // connectToDb();

    const user = await User.findOne({ where: { username } });

    if (user) {
      return { error: "Username already exists" };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password as string, salt);

    await User.create({
      username,
      email,
      password: hashedPassword,
      img,
    });
    console.log("saved to db");

    return { success: true };
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong!" };
  }
};

export const login = async (
  prevState: string | undefined,
  formData: FormData
) => {
  const { username, password } = Object.fromEntries(formData);

  try {
    await signIn("credentials", { username, password });
    return "User Signed In!";
  } catch (err: any) {
    console.log(err);

    if (err instanceof AuthError) {
      if (err.type === "CredentialsSignin") {
        return "Invalid username or password";
      } else {
        return "Something went wrong";
      }
    }
    throw err;
  }
};

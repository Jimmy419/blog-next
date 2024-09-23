"use server";

import User from "@/db/model/User";
import bcrypt from "bcrypt";
import { AuthError } from "next-auth";
import { signIn, signOut } from "../lib/auth";

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

    return { success: true };
  } catch (err) {
    console.error("🚀 ~ err:", err);
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
  } catch (err) {
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

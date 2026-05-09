"use server";

import prisma from "@/db";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn, signOut } from "../lib/auth";
import { z } from "zod";
import {
  buildResetPasswordUrl,
  createPasswordResetToken,
  getPasswordResetExpireTime,
  hashPasswordResetToken,
} from "@/lib/password-reset";
import { sendMail } from "@/lib/mailer";

// 兼容编辑器中的 Prisma 类型缓存，避免新字段刚添加时误报。
const authDb = prisma as any;

export const handleLogout = async () => {
  await signOut({ redirectTo: "/login" });
};

export const register = async (
  _previousState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) => {
  const parsed = z
    .object({
      username: z.string().trim().min(2),
      email: z.string().trim().email(),
      password: z.string().min(6),
      passwordRepeat: z.string().min(6),
      img: z.string().trim().optional(),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "请填写合法的注册信息" };
  }
  const { username, email, password, img, passwordRepeat } = parsed.data;
  if (password !== passwordRepeat) {
    return { error: "两次密码不一致" };
  }

  try {
    const user = await authDb.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (user) {
      return { error: "用户名或邮箱已存在" };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await authDb.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        image: img || null,
      },
    });

    return { success: true };
  } catch (err) {
    console.error("🚀 ~ err:", err);
    return { error: "Something went wrong!" };
  }
};

export const login = async (
  _prevState: string | undefined,
  formData: FormData
) => {
  const parsed = z
    .object({
      username: z.string().trim().min(1),
      password: z.string().min(6),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return "请输入正确的用户名和密码";
  }
  const { username, password } = parsed.data;

  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: "/personal/goals",
    });
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

const PASSWORD_RESET_GENERIC_MESSAGE =
  "如果邮箱已注册，我们会发送一封重置密码邮件，请注意查收。";

export const requestPasswordReset = async (
  _previousState: { error?: string; success?: boolean; message?: string } | undefined,
  formData: FormData
) => {
  const parsed = z
    .object({
      email: z.string().trim().email("请输入正确邮箱"),
    })
    .safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: "请输入正确邮箱" };
  }

  const { email } = parsed.data;

  try {
    const user = await authDb.user.findUnique({
      where: { email },
      select: { id: true, email: true, username: true },
    });

    if (user) {
      const { rawToken, hashedToken } = createPasswordResetToken();
      const resetTokenExpiresAt = getPasswordResetExpireTime();

      await authDb.user.update({
        where: { id: user.id },
        data: {
          resetTokenHash: hashedToken,
          resetTokenExpiresAt,
        },
      });

      const resetUrl = buildResetPasswordUrl(rawToken);
      await sendMail({
        to: user.email,
        subject: "GoalManager 重置密码",
        text: `你好，${user.username}。请在有效期内通过下方链接重置密码：${resetUrl}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>GoalManager 密码重置</h2>
            <p>你好，${user.username}。</p>
            <p>我们收到了你的重置密码请求，请点击下面链接重置密码：</p>
            <p><a href="${resetUrl}" target="_blank" rel="noopener noreferrer">${resetUrl}</a></p>
            <p>如果不是你本人操作，可以忽略本邮件。</p>
          </div>
        `,
      });
    }

    return { success: true, message: PASSWORD_RESET_GENERIC_MESSAGE };
  } catch (error) {
    console.error("requestPasswordReset error:", error);
    return { success: true, message: PASSWORD_RESET_GENERIC_MESSAGE };
  }
};

export const resetPassword = async (
  _previousState: { error?: string; success?: boolean; message?: string } | undefined,
  formData: FormData
) => {
  const parsed = z
    .object({
      token: z.string().trim().min(1, "链接无效，请重新申请"),
      password: z.string().min(6, "密码至少 6 位"),
      passwordRepeat: z.string().min(6, "请再次输入密码"),
    })
    .safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "提交参数不正确" };
  }

  const { token, password, passwordRepeat } = parsed.data;
  if (password !== passwordRepeat) {
    return { error: "两次密码不一致" };
  }

  try {
    const tokenHash = hashPasswordResetToken(token);
    const user = await authDb.user.findFirst({
      where: {
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: {
          gt: new Date(),
        },
      },
      select: { id: true },
    });

    if (!user) {
      return { error: "重置链接无效或已过期，请重新申请" };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await authDb.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
    });

    return { success: true, message: "密码重置成功，请使用新密码登录" };
  } catch (error) {
    console.error("resetPassword error:", error);
    return { error: "重置失败，请稍后重试" };
  }
};

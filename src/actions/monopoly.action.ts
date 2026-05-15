"use server";

import prisma from "@/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// 验证并获取当前用户ID
const requireAuth = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("未登录或 Token 验证失败，请重新登录");
  }
  return Number(session.user.id);
};

// 获取游戏存档
export const loadMonopolyGame = async () => {
  const userId = await requireAuth();
  const game = await (prisma as any).monopolyGame.findUnique({
    where: { userId },
  });
  return game ? game.gameState : null;
};

// 保存游戏存档
export const saveMonopolyGame = async (gameState: any) => {
  const userId = await requireAuth();
  const game = await (prisma as any).monopolyGame.upsert({
    where: { userId },
    update: {
      gameState,
    },
    create: {
      userId,
      gameState,
    },
  });
  revalidatePath("/personal/monopoly");
  return { success: true, gameId: game.id };
};

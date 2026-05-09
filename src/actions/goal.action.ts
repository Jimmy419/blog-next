"use server";

import prisma from "@/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

// 兼容编辑器中偶发的 Prisma 类型缓存问题，运行时不受影响。
const goalDb = prisma as any;

// 验证并获取当前用户ID
const requireAuth = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("未登录或 Token 验证失败，请重新登录");
  }
  return Number(session.user.id);
};

export const createGoal = async (data: {
  title: string;
  targetValue: number;
  rewardText?: string;
  rewardImage?: string;
}) => {
  const authorId = await requireAuth();
  const parsed = z
    .object({
      title: z.string().trim().min(1, "目标名称不能为空"),
      targetValue: z.number().int().positive("目标值必须大于 0"),
      rewardText: z.string().trim().max(200).optional(),
      rewardImage: z.string().trim().max(500).optional(),
    })
    .parse(data);

  const newGoal = await goalDb.goal.create({
    data: {
      title: parsed.title,
      targetValue: parsed.targetValue,
      rewardText: parsed.rewardText || null,
      rewardImage: parsed.rewardImage || null,
      authorId,
    },
  });

  revalidatePath("/personal/goals");
  revalidatePath("/personal/goals/new");
  return { success: true, data: newGoal };
};

export type GoalStatusFilter = "ALL" | "IN_PROGRESS" | "COMPLETED";

export const getMyGoals = async (status: GoalStatusFilter = "ALL") => {
  const authorId = await requireAuth();
  const where =
    status === "ALL" ? { authorId } : { authorId, status };

  const goals = await goalDb.goal.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      targetValue: true,
      currentValue: true,
      rewardText: true,
      rewardImage: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return goals;
};

export const getMyGoalDetail = async (goalId: number) => {
  const authorId = await requireAuth();
  const parsedGoalId = z.number().int().positive().parse(goalId);
  const goal = await goalDb.goal.findUnique({
    where: { id: parsedGoalId },
    include: {
      records: {
        orderBy: [{ recordDate: "desc" }, { id: "desc" }],
      },
    },
  });

  if (!goal || goal.authorId !== authorId) {
    throw new Error("目标不存在或无权限");
  }

  return goal;
};

export const addGoalRecord = async (data: {
  goalId: number;
  value: number;
  note?: string;
  recordDate?: Date;
}) => {
  const authorId = await requireAuth();
  const parsed = z
    .object({
      goalId: z.number().int().positive(),
      value: z.number().int().min(-100).max(100),
      note: z.string().trim().max(500).optional(),
      recordDate: z.date().optional(),
    })
    .parse(data);

  // 确认目标归属
  const goal = await goalDb.goal.findUnique({
    where: { id: parsed.goalId },
  });

  if (!goal || goal.authorId !== authorId) {
    throw new Error("目标不存在或无权限");
  }

  // 使用事务：新增记录并更新当前值
  const result = await prisma.$transaction(async (tx) => {
    const txDb = tx as any;
    const record = await txDb.goalRecord.create({
      data: {
        goalId: parsed.goalId,
        value: parsed.value,
        note: parsed.note || null,
        recordDate: parsed.recordDate || new Date(),
      },
    });

    const newCurrentValue = Math.max(0, goal.currentValue + parsed.value);
    const newStatus =
      newCurrentValue >= goal.targetValue ? "COMPLETED" : "IN_PROGRESS";

    const updatedGoal = await txDb.goal.update({
      where: { id: parsed.goalId },
      data: {
        currentValue: newCurrentValue,
        status: newStatus,
      },
    });

    return { record, updatedGoal };
  });

  revalidatePath("/personal/goals");
  revalidatePath(`/personal/goals/${parsed.goalId}`);
  return { success: true, data: result };
};

export const deleteGoal = async (data: { goalId: number; password: string }) => {
  const authorId = await requireAuth();
  const parsed = z
    .object({
      goalId: z.number().int().positive(),
      password: z.string().min(6, "请输入登录密码"),
    })
    .parse(data);

  const currentUser = await goalDb.user.findUnique({
    where: { id: authorId },
    select: { password: true },
  });
  if (!currentUser) {
    throw new Error("用户不存在，请重新登录");
  }
  const passwordValid = await bcrypt.compare(parsed.password, currentUser.password);
  if (!passwordValid) {
    throw new Error("密码错误，删除失败");
  }

  const goal = await goalDb.goal.findUnique({
    where: { id: parsed.goalId },
  });

  if (!goal || goal.authorId !== authorId) {
    throw new Error("目标不存在或无权限");
  }

  await goalDb.goal.delete({
    where: { id: parsed.goalId },
  });

  revalidatePath("/personal/goals");
  revalidatePath(`/personal/goals/${parsed.goalId}`);
  return { success: true };
};

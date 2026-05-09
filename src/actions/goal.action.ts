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

const verifyUserPassword = async (authorId: number, password: string) => {
  const currentUser = await goalDb.user.findUnique({
    where: { id: authorId },
    select: { password: true },
  });
  if (!currentUser) {
    throw new Error("用户不存在，请重新登录");
  }
  const passwordValid = await bcrypt.compare(password, currentUser.password);
  if (!passwordValid) {
    throw new Error("密码错误，操作失败");
  }
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

export const updateGoal = async (data: {
  goalId: number;
  title: string;
  targetValue: number;
  rewardText?: string;
  rewardImage?: string | null;
}) => {
  const authorId = await requireAuth();
  const parsed = z
    .object({
      goalId: z.number().int().positive(),
      title: z.string().trim().min(1, "目标名称不能为空"),
      targetValue: z.number().int().positive("目标值必须大于 0"),
      rewardText: z.string().trim().max(200).optional(),
      rewardImage: z.string().trim().max(500).nullable().optional(),
    })
    .parse(data);

  const goal = await goalDb.goal.findUnique({
    where: { id: parsed.goalId },
    select: { id: true, authorId: true, currentValue: true },
  });
  if (!goal || goal.authorId !== authorId) {
    throw new Error("目标不存在或无权限");
  }

  const nextStatus =
    goal.currentValue >= parsed.targetValue ? "COMPLETED" : "IN_PROGRESS";

  const updatedGoal = await goalDb.goal.update({
    where: { id: parsed.goalId },
    data: {
      title: parsed.title,
      targetValue: parsed.targetValue,
      rewardText: parsed.rewardText || null,
      rewardImage:
        parsed.rewardImage === undefined ? undefined : parsed.rewardImage || null,
      status: nextStatus,
    },
  });

  revalidatePath("/personal/goals");
  revalidatePath(`/personal/goals/${parsed.goalId}`);
  return { success: true, data: updatedGoal };
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

  await verifyUserPassword(authorId, parsed.password);

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

export const deleteGoalRecord = async (data: {
  goalId: number;
  recordId: number;
  password: string;
}) => {
  const authorId = await requireAuth();
  const parsed = z
    .object({
      goalId: z.number().int().positive(),
      recordId: z.number().int().positive(),
      password: z.string().min(6, "请输入登录密码"),
    })
    .parse(data);

  await verifyUserPassword(authorId, parsed.password);

  const goal = await goalDb.goal.findUnique({
    where: { id: parsed.goalId },
  });
  if (!goal || goal.authorId !== authorId) {
    throw new Error("目标不存在或无权限");
  }

  const record = await goalDb.goalRecord.findUnique({
    where: { id: parsed.recordId },
  });
  if (!record || record.goalId !== parsed.goalId) {
    throw new Error("进度记录不存在或无权限");
  }

  await prisma.$transaction(async (tx) => {
    const txDb = tx as any;
    await txDb.goalRecord.delete({
      where: { id: parsed.recordId },
    });

    const nextCurrentValue = Math.max(0, goal.currentValue - record.value);
    const nextStatus =
      nextCurrentValue >= goal.targetValue ? "COMPLETED" : "IN_PROGRESS";

    await txDb.goal.update({
      where: { id: parsed.goalId },
      data: {
        currentValue: nextCurrentValue,
        status: nextStatus,
      },
    });
  });

  revalidatePath("/personal/goals");
  revalidatePath(`/personal/goals/${parsed.goalId}`);
  return { success: true };
};

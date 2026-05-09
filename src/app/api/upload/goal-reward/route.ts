import { auth } from "@/lib/auth";
import { toGoalRewardApiPath } from "@/lib/goal-reward-image";
import { getGoalRewardUploadDir } from "@/lib/goal-reward-storage";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未授权，请先登录" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "未检测到上传文件" }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "仅支持 jpg/png/webp 图片上传" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "图片大小不能超过 2MB" },
      { status: 400 }
    );
  }

  const extension = file.name.includes(".")
    ? file.name.split(".").pop()?.toLowerCase() || "png"
    : "png";
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  const outputDir = getGoalRewardUploadDir();
  const outputPath = path.join(outputDir, fileName);

  await mkdir(outputDir, { recursive: true });
  const bytes = await file.arrayBuffer();
  await writeFile(outputPath, new Uint8Array(bytes));

  return NextResponse.json({
    success: true,
    url: toGoalRewardApiPath(`/uploads/goal-rewards/${fileName}`),
  });
}

import { auth } from "@/lib/auth";
import { getGoalRewardFilePath } from "@/lib/goal-reward-storage";
import { readFile } from "fs/promises";
import path from "path";

const mimeByExtension: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { fileName: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rawName = decodeURIComponent(params.fileName || "").trim();
  if (!rawName || rawName.includes("/") || rawName.includes("..")) {
    return new Response("Invalid file name", { status: 400 });
  }

  const extension = path.extname(rawName).toLowerCase();
  const contentType = mimeByExtension[extension];
  if (!contentType) {
    return new Response("Unsupported file type", { status: 400 });
  }

  try {
    const fullPath = getGoalRewardFilePath(rawName);
    const bytes = await readFile(fullPath);
    return new Response(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

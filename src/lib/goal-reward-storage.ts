import path from "path";

export const getGoalRewardUploadDir = () =>
  process.env.GOAL_REWARD_UPLOAD_DIR ||
  path.join(process.cwd(), "public", "uploads", "goal-rewards");

export const getGoalRewardFilePath = (fileName: string) =>
  path.join(getGoalRewardUploadDir(), fileName);

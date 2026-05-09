const LEGACY_PREFIX = "/uploads/goal-rewards/";
const API_PREFIX = "/api/goal-reward-file/";

const extractFileName = (pathname: string) => {
  if (!pathname.startsWith(LEGACY_PREFIX) && !pathname.startsWith(API_PREFIX)) {
    return null;
  }
  const raw = pathname.startsWith(LEGACY_PREFIX)
    ? pathname.slice(LEGACY_PREFIX.length)
    : pathname.slice(API_PREFIX.length);
  const fileName = raw.split("/").filter(Boolean).pop() || "";
  if (!fileName || fileName.includes("..")) {
    return null;
  }
  return fileName;
};

export const toGoalRewardApiPath = (rawValue: string | null | undefined) => {
  if (!rawValue) return null;
  const value = rawValue.trim();
  if (!value) return null;

  if (value.startsWith(API_PREFIX)) {
    return value;
  }

  if (value.startsWith(LEGACY_PREFIX)) {
    const fileName = extractFileName(value);
    return fileName ? `${API_PREFIX}${encodeURIComponent(fileName)}` : value;
  }

  try {
    const parsed = new URL(value);
    const fileName = extractFileName(parsed.pathname);
    if (fileName) {
      return `${API_PREFIX}${encodeURIComponent(fileName)}`;
    }
  } catch {
    // ignore invalid URL, keep original
  }

  return value;
};

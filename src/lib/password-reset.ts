import crypto from "crypto";

const TOKEN_BYTES = 32;

export const createPasswordResetToken = () => {
  const rawToken = crypto.randomBytes(TOKEN_BYTES).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, hashedToken };
};

export const hashPasswordResetToken = (rawToken: string) =>
  crypto.createHash("sha256").update(rawToken).digest("hex");

export const getPasswordResetExpireTime = () => {
  const ttlMinutes = Number(process.env.PASSWORD_RESET_TOKEN_TTL_MIN || 15);
  const safeTtlMinutes = Number.isFinite(ttlMinutes) && ttlMinutes > 0 ? ttlMinutes : 15;
  return new Date(Date.now() + safeTtlMinutes * 60 * 1000);
};

export const getAppBaseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || "http://localhost:3000";

export const buildResetPasswordUrl = (rawToken: string) => {
  const baseUrl = getAppBaseUrl().replace(/\/$/, "");
  return `${baseUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
};

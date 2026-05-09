import nodemailer from "nodemailer";

const boolFromEnv = (value: string | undefined) => `${value}`.toLowerCase() === "true";

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: boolFromEnv(process.env.SMTP_SECURE),
    auth: {
      user,
      pass,
    },
  });
};

export const sendMail = async (params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("SMTP not configured, skip real email sending.");
    console.info("Mail preview:", params);
    return;
  }

  const fromName = process.env.MAIL_FROM_NAME || "GoalManager";
  const fromAddress = process.env.MAIL_FROM_ADDRESS || "no-reply@goalmanager.local";

  await transporter.sendMail({
    from: `${fromName} <${fromAddress}>`,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
};

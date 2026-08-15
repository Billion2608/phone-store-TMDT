import nodemailer from "nodemailer";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password || !Number.isInteger(port)) return null;

  return {
    host,
    port,
    secure: process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === "true"
      : port === 465,
    auth: { user, pass: password },
  };
}

export function isSmtpConfigured() {
  return getSmtpConfig() !== null;
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  const config = getSmtpConfig();
  if (!config) return false;

  const transporter = nodemailer.createTransport(config);
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `PhoneStore <${config.auth.user}>`,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });
  return true;
}

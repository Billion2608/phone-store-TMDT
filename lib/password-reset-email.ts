import { sendEmail } from "@/lib/mailer";

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string,
) {
  return sendEmail({
    to,
    subject: "Đặt lại mật khẩu PhoneStore",
    html: `<p>Xin chào ${escapeHtml(name)},</p><p>Bạn vừa yêu cầu đặt lại mật khẩu PhoneStore. Liên kết có hiệu lực trong 30 phút.</p><p><a href="${resetUrl}">Đặt lại mật khẩu</a></p><p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>`,
  });
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        character
      ] ?? character,
  );
}

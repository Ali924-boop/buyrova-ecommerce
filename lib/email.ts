// lib/email.ts
// Sends transactional emails via Nodemailer.
// Works with any SMTP provider: Gmail, Resend, Mailgun, SendGrid, etc.
//
// Required .env variables:
//   EMAIL_HOST     e.g. smtp.gmail.com
//   EMAIL_PORT     e.g. 587
//   EMAIL_USER     your sending address
//   EMAIL_PASS     app password (Gmail) or API key (others)
//   EMAIL_FROM     display name + address, e.g. "Buyrova <no-reply@buyrova.com>"

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   Number(process.env.EMAIL_PORT ?? 587),
  secure: Number(process.env.EMAIL_PORT) === 465, // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Password reset email ──────────────────────────────────────────────────────
export async function sendPasswordResetEmail({
  to, name, resetUrl,
}: {
  to:       string;
  name:     string;
  resetUrl: string;
}) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#1a1a1a;border-radius:16px;border:1px solid #2a2a2a;overflow:hidden;max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#f59e0b;padding:28px 40px;text-align:center;">
              <h1 style="margin:0;color:#000;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                BUYROVA
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 12px;color:#fff;font-size:20px;font-weight:700;">
                Reset your password
              </h2>
              <p style="margin:0 0 24px;color:#9ca3af;font-size:15px;line-height:1.6;">
                Hi ${name}, we received a request to reset your password.
                Click the button below — this link expires in <strong style="color:#f59e0b;">1 hour</strong>.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="border-radius:10px;background:#f59e0b;">
                    <a href="${resetUrl}"
                      style="display:inline-block;padding:14px 32px;color:#000;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 28px;word-break:break-all;">
                <a href="${resetUrl}" style="color:#f59e0b;font-size:12px;">${resetUrl}</a>
              </p>

              <hr style="border:none;border-top:1px solid #2a2a2a;margin:0 0 24px;" />

              <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
                If you didn't request this, you can safely ignore this email.
                Your password won't change until you click the link above.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;text-align:center;border-top:1px solid #2a2a2a;">
              <p style="margin:0;color:#4b5563;font-size:12px;">
                © ${new Date().getFullYear()} Buyrova. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM ?? process.env.EMAIL_USER,
    to,
    subject: "Reset your Buyrova password",
    html,
  });
}
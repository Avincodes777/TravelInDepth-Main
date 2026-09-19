import nodemailer from "nodemailer";

/**
 * Creates and returns an active email transporter.
 * Supports SMTP (Gmail, Brevo, SendGrid, Amazon SES, or custom SMTP).
 */
const createTransporter = () => {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  const port = parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || "587", 10);
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });
  }

  // Gmail shorthand support: if EMAIL_USER and EMAIL_APP_PASSWORD are provided
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  return null;
};

/**
 * Sends a password reset email to the user with a secure link.
 * If SMTP credentials are not configured, logs the link clearly to the server console.
 * 
 * @param {string} toEmail - Recipient email
 * @param {string} resetToken - Generated reset token
 * @param {string} userName - Name of the user
 */
export const sendPasswordResetEmail = async (toEmail, resetToken, userName = "Traveler") => {
  const frontendUrl =
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    "http://localhost:5173";

  // Clean trailing slash
  const cleanFrontendUrl = frontendUrl.replace(/\/+$/, "");
  const resetLink = `${cleanFrontendUrl}/reset-password/${resetToken}`;

  const transporter = createTransporter();
  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || '"Travel In Depth" <noreply@travelindepth.com>';

  const subject = "Reset Your Travel In Depth Password";
  const textContent = `Hello ${userName},\n\nYou requested to reset your password for your Travel In Depth account.\n\nPlease click the link below to set a new password:\n${resetLink}\n\nThis link is valid for 1 hour.\nIf you did not request this, please ignore this email and your password will remain unchanged.\n\nHappy travels,\nThe Travel In Depth Team`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FDF6EC; margin: 0; padding: 0; }
          .container { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(90, 20, 0, 0.06); }
          .header { background: #8B1A1A; padding: 32px 24px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
          .content { padding: 40px 32px; color: #2D1B00; line-height: 1.7; font-size: 15px; }
          .button-container { text-align: center; margin: 32px 0; }
          .btn { background-color: #FF6B1A; color: #ffffff !important; padding: 14px 36px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 14px; letter-spacing: 1px; display: inline-block; box-shadow: 0 6px 18px rgba(255, 107, 26, 0.35); }
          .footer { background: #FFF8F0; padding: 20px 32px; text-align: center; font-size: 12px; color: #8A7060; border-top: 1px solid #F0E2D2; }
          .flag-strip { display: flex; height: 4px; width: 100%; }
          .flag-orange { background: #FF6B1A; flex: 1; height: 4px; }
          .flag-white { background: #ffffff; flex: 1; height: 4px; }
          .flag-green { background: #138808; flex: 1; height: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="flag-strip">
            <div class="flag-orange"></div>
            <div class="flag-white"></div>
            <div class="flag-green"></div>
          </div>
          <div class="header">
            <h1>Travel In Depth</h1>
          </div>
          <div class="content">
            <h2 style="color: #8B1A1A; margin-top: 0;">Password Reset Request</h2>
            <p>Hello <b>${userName}</b>,</p>
            <p>We received a request to reset the password associated with your account (<b>${toEmail}</b>).</p>
            <p>Click the button below to choose a new, secure password:</p>
            <div class="button-container">
              <a href="${resetLink}" class="btn" target="_blank">Reset My Password</a>
            </div>
            <p style="font-size: 13px; color: #666;">This link is valid for <b>1 hour</b>. If you didn't request a password reset, you can safely ignore this email.</p>
            <p style="font-size: 12px; color: #888; word-break: break-all;">Or copy and paste this link into your browser:<br><a href="${resetLink}" style="color: #FF6B1A;">${resetLink}</a></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Travel In Depth. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });
      console.log(`✉️ Password reset email dispatched to ${toEmail}. Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error("❌ Failed to send reset email via SMTP:", err.message);
      // Even if SMTP fails, return link info so development or fallback works
      return { success: false, error: err.message, resetLink };
    }
  } else {
    console.log("==================================================================");
    console.log("⚠️ SMTP not configured (EMAIL_HOST / GMAIL_USER missing in backend .env)");
    console.log(`🔗 Password Reset Link for ${toEmail}:`);
    console.log(resetLink);
    console.log("==================================================================");
    return { success: true, isDevFallback: true, resetLink };
  }
};

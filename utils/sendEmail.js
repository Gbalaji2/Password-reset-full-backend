// utils/sendEmail.js
import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
      port: process.env.BREVO_SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS, // SMTP Key (NOT API Key)
      },
    });

    const mailOptions = {
      from: `"Support Team" <${process.env.BREVO_SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Brevo email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Brevo email send failed:", error.message);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;
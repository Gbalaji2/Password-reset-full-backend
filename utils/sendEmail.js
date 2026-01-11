// utils/sendEmail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// -------------------- Ensure SMTP key exists --------------------
if (!process.env.BREVO_SMTP_PASS) {
  console.error("❌ BREVO_SMTP_PASS is missing in .env!");
  process.exit(1); // Stop execution if key missing
}

const sendEmail = async (to, subject, html) => {
  try {
    // -------------------- SMTP Transport --------------------
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,           // 587 for TLS, 465 for SSL
      secure: false,       // true for port 465
      auth: {
        user: "apikey",
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    // -------------------- Test connection --------------------
    await transporter.verify(); // Throws if credentials are invalid
    console.log("✅ SMTP connected successfully");

    // -------------------- Send Email --------------------
    const info = await transporter.sendMail({
      from: `"Support Team" <sbalajigowtham@gmail.com>`, // Verified sender
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to: ${to} | Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    // Handle auth errors more clearly
    if (error.code === "EAUTH") {
      console.error(
        "❌ SMTP Authentication failed. Check your BREVO_SMTP_PASS and sender email."
      );
    } else {
      console.error("❌ Brevo SMTP error:", error);
    }
    throw error;
  }
};

export default sendEmail;
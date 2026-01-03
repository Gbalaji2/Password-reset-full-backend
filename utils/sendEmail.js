import dotenv from "dotenv";
dotenv.config(); // ✅ MUST be first

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Support Team" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("✅ Email sent to:", to);
  } catch (error) {
    console.error("❌ Gmail SMTP error:", error.message);
    throw error;
  }
};

console.log("GMAIL_USER:", process.env.GMAIL_USER);
console.log(
  "GMAIL_APP_PASS:",
  process.env.GMAIL_APP_PASS ? "Loaded ✅" : "Not loaded ❌"
);

export default sendEmail;
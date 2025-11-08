// utils/sendEmail.js
import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // <– easier and more reliable than host/port for Gmail
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // must be App Password (not normal Gmail password)
      },
    });

    const mailOptions = {
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;
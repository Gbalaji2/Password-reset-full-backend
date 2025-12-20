// utils/sendEmail.js
import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {

  // 🔍 TEMP DEBUG LOG (ADD HERE)
  console.log("SMTP PASS loaded:", !!process.env.BREVO_SMTP_PASS);

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Support Team" <sbalajigowtham@gmail.com>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Brevo email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Brevo email send failed:", error);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;
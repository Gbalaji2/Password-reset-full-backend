import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",                     // Must be literal
        pass: process.env.BREVO_SMTP_PASS, // SMTP key
      },
    });

    const info = await transporter.sendMail({
      from: `"Your App Name" <no-reply@yourdomain.com>`, 
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to: ${to} | Message ID: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Brevo SMTP error:", error);
    throw error;
  }
};

export default sendEmail;
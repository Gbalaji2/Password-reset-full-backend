// utils/sendEmail.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// -------------------- Ensure API key exists --------------------
if (!process.env.BREVO_API_KEY) {
  console.error("❌ BREVO_API_KEY is missing in environment variables!");
  process.exit(1);
}

const sendEmail = async (to, subject, html) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Support Team",
          email: "sbalajigowtham@gmail.com", // can be any verified sender
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ Email sent to ${to} | ID: ${response.data.messageId}`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Brevo API error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export default sendEmail;
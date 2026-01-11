import sendEmail from "./utils/sendEmail.js";

(async () => {
  try {
    await sendEmail(
      "recipient@example.com",        // Replace with your test email
      "Test Email",
      "<h1>Hello from Brevo SMTP!</h1><p>If you receive this, it works ✅</p>"
    );
  } catch (error) {
    console.error("Test email failed:", error.message);
  }
})();
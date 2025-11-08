import dotenv from "dotenv";
dotenv.config(); // 🔥 Load environment variables

import sendEmail from "./utils/sendEmail.js";

sendEmail("sbalajigowtham@gmail.com", "Test Email", "<h1>Hello Gowtham!</h1>")
  .then(() => console.log("✅ Test email sent successfully"))
  .catch((err) => console.error("❌ Test email failed:", err.message));
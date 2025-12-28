// Load environment variables immediately
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";

const app = express();

// -------------------- Body Parsers --------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// -------------------- CORS Setup --------------------
const allowedOrigins = [
  process.env.FRONTEND_URL,   // Production frontend
  "http://localhost:5173"     // Local frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow Postman or non-browser tools
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS not allowed by server"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// -------------------- Database Connect --------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// -------------------- API Routes --------------------
app.use("/api/auth", authRoutes);

// -------------------- Test Route for Env --------------------
app.get("/test-env", (req, res) => {
  res.json({
    user: process.env.GMAIL_USER || "Not loaded",
    passLoaded: !!process.env.GMAIL_APP_PASS
  });
});

// -------------------- Default Route --------------------
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});

// -------------------- Log SMTP Info --------------------
console.log("GMAIL_USER:", process.env.GMAIL_USER);
console.log("GMAIL_APP_PASS loaded:", !!process.env.GMAIL_APP_PASS);
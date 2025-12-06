// routes/auth.js
import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const router = express.Router();

// ---------------------- SEND EMAIL FUNCTION ----------------------
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // Or any other SMTP service
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail
        pass: process.env.EMAIL_PASS, // App password
      },
    });

    await transporter.sendMail({
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully to", to);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
  }
};

// ---------------------- FORGOT PASSWORD ----------------------
router.post("/forgot-password", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(200).json({ message: "If email exists, reset link sent." });

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Reset URL for email
    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;
    const message = `
      <p>You requested a password reset.</p>
      <p>Click <a href="${resetURL}">here</a> to reset your password. This link is valid for 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    // Send email (ignore errors, still return token for Postman)
    sendEmail(email, "Password Reset", message);

    // For testing: return token in response
    res.json({
      message: "Reset link sent if email exists",
      token, // use in Postman for /reset-password testing
    });

    console.log("✅ Reset token for testing:", token);
  } catch (error) {
    console.error("Forgot-password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ---------------------- RESET PASSWORD ---------------------- */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, email, password } = req.body;
    if (!token || !email || !password)
      return res.status(400).json({ message: "Missing required fields" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    // Hash new password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    res.json({ message: "Password successfully reset!" });
  } catch (error) {
    console.error("Reset-password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------- REGISTER ---------------------- */
router.post("/register", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
    });

    res.json({
      message: "User registered successfully",
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------------------- LOGIN ---------------------- */
router.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful", token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

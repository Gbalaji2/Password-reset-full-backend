import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Forgot password route
// Forgot password route
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("🔍 Forgot-password request for:", email); // ✅ log email

    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ No user found for this email");
      return res
        .status(200)
        .json({ message: "If email exists, reset link sent." });
    }

    console.log("✅ User found:", user.email);

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 3600000;

    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;
    const message = `<p>Click <a href="${resetURL}">here</a> to reset your password. Valid for 1 hour.</p>`;

    console.log("✅ RESET TOKEN:", token); // ✅ token log

    await sendEmail(email, "Password Reset", message);

    res.json({ message: "Reset link sent if email exists." });
  } catch (error) {
    console.error("Forgot-password error:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
});

// Reset password route
router.post("/reset-password", async (req, res) => {
  const { token, email, password } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    email,
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: "Password successfully reset!" });
});

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword
    });

    res.json({ message: "User registered successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      email: user.email
    }
  });
});

export default router;

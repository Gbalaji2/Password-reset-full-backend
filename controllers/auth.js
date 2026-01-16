import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

// Register User
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Prevent email enumeration
    if (!user) {
      return res.json({
        message: "If this email is registered, reset instructions have been sent",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    if (!process.env.FRONTEND_URL) {
      throw new Error("FRONTEND_URL not configured");
    }

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const html = `
      <h3>Password Reset</h3>
      <p>You requested a password reset.</p>
      <p>
        <a href="${resetUrl}" target="_blank">Click here to reset your password</a>
      </p>
      <p>This link will expire in 10 minutes.</p>
    `;

    try {
      await sendEmail(user.email, "Reset Your Password", html);
    } catch (emailError) {
      console.error("Email failed but token saved:", emailError.message);
      // Do NOT throw — token is valid
    }

    return res.json({
      message: "If this email is registered, reset instructions have been sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  const token = req.params.token;

  // ✅ 1. Validate new password FIRST
  if (!req.body.password || req.body.password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  // ✅ 2. Hash the token from URL
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // ✅ 3. Find valid user by token + expiry
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ message: "Token invalid or expired" });
  }

  // ✅ 4. Hash and update password
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  // ✅ 5. Success response
  res.json({ message: "Password updated successfully" });
};
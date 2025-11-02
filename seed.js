import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const seedUser = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const password = await bcrypt.hash("Test@1234", 10);
  const user = new User({ email: "test@example.com", password });
  await user.save();
  console.log("Test user created:", user.email);
  mongoose.disconnect();
};

seedUser();

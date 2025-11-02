import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const seedUser = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Check if user already exists to avoid duplicates
  const exists = await User.findOne({ email: "test1@example.com" });
  if (exists) {
    console.log("Seed user already exists. Skipping...");
    mongoose.disconnect();
    return;
  }

  const password = await bcrypt.hash("Test@1234", 10);

  const user = new User({
    username: "testuser",   // <-- add this
    email: "test1@example.com",
    password
  });

  await user.save();
  console.log("Test user created:", user.email);
  mongoose.disconnect();
};

seedUser();

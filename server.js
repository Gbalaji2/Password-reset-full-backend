import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/api/auth", authRoutes);

// default route
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

app.listen(process.env.PORT || 5000, () => console.log("Server running..."));
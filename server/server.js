import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import aiTextRoutes from "./routes/aiTextRoutes.js";
import summarizerRoutes from "./routes/summarizerRoutes.js";
import paraphraseRoutes from "./routes/paraphraseRoutes.js";
import translatorRoutes from "./routes/translatorRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";

import adminRoutes from "./routes/adminRoutes.js";

dotenv.config({ path: './.env', quiet: true });
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Normalize double slashes in URLs (e.g. //api/auth -> /api/auth)
app.use((req, res, next) => {
  if (req.url.startsWith("//")) {
    req.url = req.url.replace(/^\/+/, "/");
  }
  next();
});
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/ai", aiTextRoutes);
app.use("/api/ai", summarizerRoutes);
app.use("/api/ai", paraphraseRoutes);
app.use("/api/ai", translatorRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/image", imageRoutes);
app.use("/api/history", historyRoutes);

// Connect Database
connectDB();

// Default Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT} [Updated]`);
});

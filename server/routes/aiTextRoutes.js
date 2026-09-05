import express from "express";
import { generateText } from "../controllers/aiTextController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protected route → user must be logged in
router.post("/generate-text", protectRoute, generateText);

export default router;

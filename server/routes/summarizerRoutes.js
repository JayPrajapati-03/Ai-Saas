import express from "express";
import { summarizeText } from "../controllers/summarizerController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/summarize", protectRoute, summarizeText);

export default router;

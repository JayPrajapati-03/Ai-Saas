import express from "express";
import { generateImage } from "../controllers/imageController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/generate", protectRoute, generateImage);

export default router;


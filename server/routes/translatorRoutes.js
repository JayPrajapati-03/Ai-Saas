import express from "express";
import { translateText } from "../controllers/translatorController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/translate", protectRoute, translateText);

export default router;

import express from "express";
import { paraphraseText } from "../controllers/paraphraseController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/paraphrase", protectRoute, paraphraseText);

export default router;

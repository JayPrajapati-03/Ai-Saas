import express from "express";
import { registerUser, loginUser, getUserStats } from "../controllers/authController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/stats", protectRoute, getUserStats);

export default router;

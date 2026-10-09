import express from "express";
import { getDashboardStats } from "../controllers/adminController.js";
import { protectRoute, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Only authenticated admins can access admin dashboard stats
router.get("/stats", protectRoute, requireAdmin, getDashboardStats);

export default router;

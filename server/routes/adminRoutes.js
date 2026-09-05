import express from "express";
import { getDashboardStats } from "../controllers/adminController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Apply auth middleware. In future, add admin role check middleware here.
router.get("/stats", protectRoute, getDashboardStats);

export default router;

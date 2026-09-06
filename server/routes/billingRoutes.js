import express from "express";
import {
  getBillingStatus,
  processCheckout,
  switchToBasic,
} from "../controllers/billingController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All billing endpoints require authentication
router.get("/status", protectRoute, getBillingStatus);
router.post("/checkout", protectRoute, processCheckout);
router.post("/switch-basic", protectRoute, switchToBasic);

export default router;

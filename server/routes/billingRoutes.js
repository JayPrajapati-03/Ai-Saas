import express from "express";
import {
  getBillingStatus,
  processCheckout,
  switchToBasic,
  resumePurchasedPlan,
  createRazorpayOrder,
  createRazorpayPaymentLink,
} from "../controllers/billingController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All billing endpoints require authentication
router.get("/status", protectRoute, getBillingStatus);
router.post("/checkout", protectRoute, processCheckout);
router.post("/switch-basic", protectRoute, switchToBasic);
router.post("/resume-plan", protectRoute, resumePurchasedPlan);
router.post("/create-order", protectRoute, createRazorpayOrder);
router.post("/create-payment-link", protectRoute, createRazorpayPaymentLink);

export default router;

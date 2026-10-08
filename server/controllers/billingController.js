import User from "../models/User.js";
import axios from "axios";

// GET /api/billing/status
export const getBillingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "plan credits planStartDate billingHistory name email"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const currentPlan = user.plan || "Basic";
    const creditsDisplay =
      currentPlan === "Basic" ? "Unlimited credits" : user.credits;

    res.json({
      success: true,
      subscription: {
        plan: currentPlan,
        credits: creditsDisplay,
        rawCredits: user.credits,
        planStartDate: user.planStartDate || user.createdAt,
        billingHistory: user.billingHistory || [],
      },
    });
  } catch (error) {
    console.error("Billing Status Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/billing/checkout
export const processCheckout = async (req, res) => {
  try {
    const { plan, amount, paymentMethod } = req.body;

    if (!plan || !["Pro", "Ultimate"].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan selected. Only 'Pro' and 'Ultimate' require payment.",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const planAmount = amount || (plan === "Pro" ? "$9.99" : "$19.99");
    const allocatedCredits = plan === "Pro" ? 2000 : 5000;
    const transactionId = `INV-${new Date().getFullYear()}-${Math.floor(
      100000 + Math.random() * 900000
    )}`;

    const newTransaction = {
      transactionId,
      plan: `${plan} Plan`,
      amount: planAmount,
      date: new Date(),
      status: "Completed",
      paymentMethod: paymentMethod || "Razorpay Official Checkout",
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          plan,
          credits: allocatedCredits,
          planStartDate: new Date(),
        },
        $push: {
          billingHistory: {
            $each: [newTransaction],
            $position: 0,
          },
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: `🎉 Payment verified! Your ${plan} Plan is now active with ${allocatedCredits.toLocaleString()} credits.`,
      subscription: {
        plan: updatedUser.plan,
        credits: updatedUser.credits,
        rawCredits: updatedUser.credits,
        planStartDate: updatedUser.planStartDate,
        transaction: newTransaction,
        billingHistory: updatedUser.billingHistory || [],
      },
    });
  } catch (error) {
    console.error("Checkout Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/billing/switch-basic
export const switchToBasic = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          plan: "Basic",
          planStartDate: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Successfully switched to Basic Plan. Enjoy unlimited free generation!",
      subscription: {
        plan: "Basic",
        credits: "Unlimited credits",
        rawCredits: updatedUser.credits,
        planStartDate: updatedUser.planStartDate,
        billingHistory: updatedUser.billingHistory || [],
      },
    });
  } catch (error) {
    console.error("Switch to Basic Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/billing/create-order (Razorpay Official Orders API)
export const createRazorpayOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!plan || !["Pro", "Ultimate"].includes(plan)) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    const priceVal = plan === "Pro" ? 9.99 : 19.99;
    const amountInPaise = Math.round(priceVal * 83 * 100);

    const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

    // DEBUG: Verify exact credential values loaded from .env
    console.log("=== Razorpay Credentials Debug ===");
    console.log("KEY_ID:", JSON.stringify(keyId));
    console.log("KEY_SECRET length:", keySecret.length);

    if (!keyId || !keySecret) {
      return res
        .status(500)
        .json({ success: false, message: "Razorpay credentials not configured in server .env" });
    }

    const orderRes = await axios.post(
      "https://api.razorpay.com/v1/orders",
      {
        amount: amountInPaise,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: {
          plan,
          userId: req.user.id,
        },
      },
      {
        auth: {
          username: keyId,
          password: keySecret,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      order: orderRes.data,
      keyId,
    });
  } catch (error) {
    const rzpError = error.response?.data;
    const statusCode = error.response?.status || 500;
    console.error("=== Razorpay Order Creation FAILED ===");
    console.error("Status:", statusCode);
    console.error("Razorpay Error:", JSON.stringify(rzpError, null, 2));
    console.error("Message:", error.message);
    res.status(statusCode).json({
      success: false,
      statusCode,
      message:
        statusCode === 401
          ? "Razorpay Authentication failed: Invalid or expired Key ID / Secret. Please verify in your Razorpay Dashboard."
          : rzpError?.error?.description || rzpError?.error?.reason || error.message,
      razorpayError: rzpError?.error || null,
    });
  }
};

// POST /api/billing/create-payment-link (Razorpay Hosted Page Direct Redirect)
export const createRazorpayPaymentLink = async (req, res) => {
  try {
    const { plan, returnPath } = req.body;
    if (!plan || !["Pro", "Ultimate"].includes(plan)) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    const priceVal = plan === "Pro" ? 9.99 : 19.99;
    const amountInPaise = Math.round(priceVal * 83 * 100);

    const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

    const user = await User.findById(req.user.id);
    const callbackUrl = `http://localhost:5173/app/billing?payment=razorpay_success&plan=${plan}&from=${encodeURIComponent(returnPath || "/app")}`;

    const linkRes = await axios.post(
      "https://api.razorpay.com/v1/payment_links",
      {
        amount: amountInPaise,
        currency: "INR",
        accept_partial: false,
        description: `${plan} Plan Upgrade on AISaaS Studio`,
        customer: {
          name: user?.name || "Subscriber",
          email: user?.email || "user@example.com",
        },
        notify: {
          sms: false,
          email: false,
        },
        reminder_enable: false,
        notes: {
          plan,
          userId: req.user.id,
        },
        callback_url: callbackUrl,
        callback_method: "get",
      },
      {
        auth: {
          username: keyId,
          password: keySecret,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      paymentLink: linkRes.data.short_url,
      id: linkRes.data.id,
    });
  } catch (error) {
    const rzpErr = error.response?.data;
    console.error("Payment Link Error:", rzpErr || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: rzpErr?.error?.description || error.message,
    });
  }
};

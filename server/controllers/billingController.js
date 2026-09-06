import User from "../models/User.js";

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
      paymentMethod: paymentMethod || "Credit Card (•••• 4242)",
    };

    user.plan = plan;
    user.credits = allocatedCredits;
    user.planStartDate = new Date();
    if (!user.billingHistory) user.billingHistory = [];
    user.billingHistory.unshift(newTransaction);

    await user.save();

    res.json({
      success: true,
      message: `🎉 Payment verified! Your ${plan} Plan is now active with ${allocatedCredits.toLocaleString()} credits.`,
      subscription: {
        plan: user.plan,
        credits: user.credits,
        rawCredits: user.credits,
        planStartDate: user.planStartDate,
        transaction: newTransaction,
        billingHistory: user.billingHistory,
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
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.plan = "Basic";
    // For Basic, reset to free tier baseline
    user.planStartDate = new Date();
    await user.save();

    res.json({
      success: true,
      message: "Successfully switched to Basic Plan. Enjoy unlimited free generation!",
      subscription: {
        plan: "Basic",
        credits: "Unlimited credits",
        rawCredits: user.credits,
        planStartDate: user.planStartDate,
        billingHistory: user.billingHistory || [],
      },
    });
  } catch (error) {
    console.error("Switch to Basic Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

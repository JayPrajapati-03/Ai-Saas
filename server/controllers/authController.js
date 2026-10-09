import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { checkAndResetDailyCredits } from "../utils/creditHelper.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@aisaas.com").toLowerCase().trim();
    if (email.toLowerCase().trim() === adminEmail) {
      return res.status(400).json({ message: "This email is reserved for administration. Please sign in directly." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "user",
    });

    res.json({
      success: true,
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(400).json({ message: "User does not exist" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan || "Basic",
        userLevel: user.userLevel || "Bronze",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserStats = async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select(
      "credits todayUsage userLevel totalUsage lastActiveDate plan planStartDate billingHistory freeCreditsResetAt"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check and trigger daily free credits reset if 24h passed
    await checkAndResetDailyCredits(user);

    // Check for daily usage reset
    const now = new Date();
    const lastActive = new Date(user.lastActiveDate);

    const isNewDay =
      now.getFullYear() !== lastActive.getFullYear() ||
      now.getMonth() !== lastActive.getMonth() ||
      now.getDate() !== lastActive.getDate();

    if (isNewDay) {
      user.todayUsage = 0;
      user.lastActiveDate = now;
      await user.save();
    }

    const currentPlan = user.plan || "Basic";

    res.json({
      success: true,
      stats: {
        plan: currentPlan,
        credits: user.credits ?? 50,
        rawCredits: user.credits ?? 50,
        freeCreditsResetAt: user.freeCreditsResetAt || null,
        todayUsage: user.todayUsage,
        userLevel: user.userLevel,
        totalUsage: user.totalUsage || 0,
        planStartDate: user.planStartDate,
        billingHistory: user.billingHistory || [],
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

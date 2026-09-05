import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
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

    const user = await User.findOne({ email });
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
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserStats = async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select('credits todayUsage userLevel totalUsage lastActiveDate');
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check for daily reset
    const now = new Date();
    const lastActive = new Date(user.lastActiveDate);

    // Simple check: are they on different calendar days?
    // We compare Year, Month, Date
    const isNewDay =
      now.getFullYear() !== lastActive.getFullYear() ||
      now.getMonth() !== lastActive.getMonth() ||
      now.getDate() !== lastActive.getDate();

    if (isNewDay) {
      user.todayUsage = 0;
      user.lastActiveDate = now;
      await user.save();
    }

    res.json({
      success: true,
      stats: {
        credits: user.credits,
        todayUsage: user.todayUsage,
        credits: user.credits,
        todayUsage: user.todayUsage,
        userLevel: user.userLevel,
        totalUsage: user.totalUsage || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

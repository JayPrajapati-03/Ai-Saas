import express from "express";
import History from "../models/History.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/history - Fetch usage history for logged in user
router.get("/", protectRoute, async (req, res) => {
    try {
        const history = await History.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(1000); // Generous limit to support comprehensive history pagination

        res.json({
            success: true,
            total: history.length,
            history,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message,
        });
    }
});

export default router;

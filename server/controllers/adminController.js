import User from "../models/User.js";
import History from "../models/History.js";

export const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Users
        const totalUsers = await User.countDocuments();

        // 2. Total Requests (Sum of totalUsage field)
        const users = await User.find({}, 'totalUsage');
        const totalRequests = users.reduce((acc, curr) => acc + (curr.totalUsage || 0), 0);

        // 3. Images Generated (Count from History where type='image')
        const imagesGenerated = await History.countDocuments({ type: 'image' });

        // 4. Translations (Count from History where type='translate')
        const translations = await History.countDocuments({ type: { $in: ["translate", "translator"] } });

        // 5. Recent Users (Last 5)
        const recentUsersData = await User.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email createdAt');

        // 6. Usage Activity (Last 7 Days)
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const usageActivityData = await History.aggregate([
            { $match: { createdAt: { $gte: last7Days } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Fill in missing days with 0
        const usageActivity = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = usageActivityData.find(item => item._id === dateStr);

            // Format date for frontend (e.g., "Mon", "Tue" or "Dec 14")
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

            usageActivity.push({
                date: dateStr,
                name: dayName,
                requests: found ? found.count : 0
            });
        }

        // Format recent users
        const recentUsers = recentUsersData.map(user => {
            return {
                name: user.name,
                email: user.email,
                joined: user.createdAt
            };
        });

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalRequests,
                imagesGenerated,
                translations
            },
            usageActivity,
            recentUsers
        });

    } catch (error) {
        console.error("Admin Stats Error:", error);
        res.status(500).json({ message: "Failed to fetch admin stats" });
    }
};

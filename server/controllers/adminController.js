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

        // 5. Users List (Up to 50 users for management)
        const allUsersData = await User.find({})
            .sort({ createdAt: -1 })
            .limit(50)
            .select('name email createdAt plan credits role todayUsage');

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

        // Format users list
        const usersList = allUsersData.map(user => {
            return {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || "user",
                plan: user.plan || "Basic",
                credits: user.credits ?? 120,
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
            recentUsers: usersList.slice(0, 5),
            allUsers: usersList
        });

    } catch (error) {
        console.error("Admin Stats Error:", error);
        res.status(500).json({ message: "Failed to fetch admin stats" });
    }
};

import { useEffect, useState } from "react";
import { Users, BarChart3, ImageIcon, Languages } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { API_URL } from "../config/api";

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalRequests: 0,
    imagesGenerated: 0,
    translations: 0,
    usageActivity: []
  });

  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/admin/stats`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();

        if (data.success) {
          setStatsData({
            ...data.stats,
            usageActivity: data.usageActivity || []
          });

          // Format recent users dates
          const formattedUsers = data.recentUsers.map(user => ({
            ...user,
            joined: new Date(user.joined).toLocaleString('en-US', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            })
          }));
          setRecentUsers(formattedUsers);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      }
    };

    fetchAdminStats();
  }, []);

  const stats = [
    {
      title: "Total Users",
      value: statsData.totalUsers.toLocaleString(),
      icon: <Users size={26} className="text-indigo-400" />,
    },
    {
      title: "Total Requests",
      value: statsData.totalRequests.toLocaleString(),
      icon: <BarChart3 size={26} className="text-green-400" />,
    },
    {
      title: "Images Generated",
      value: statsData.imagesGenerated.toLocaleString(),
      icon: <ImageIcon size={26} className="text-pink-400" />,
    },
    {
      title: "Translations",
      value: statsData.translations.toLocaleString(),
      icon: <Languages size={26} className="text-yellow-400" />,
    },
  ];

  return (
    <div className="space-y-10">

      {/* Page Title */}
      <h1 className="text-3xl font-bold">
        Admin <span className="text-indigo-400">Dashboard</span>
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, i) => (
          <div
            key={i}
            className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex items-center gap-4 shadow-xl"
          >
            <div className="p-3 bg-black/20 rounded-xl">{item.icon}</div>
            <div>
              <p className="text-gray-300 text-sm">{item.title}</p>
              <h2 className="text-2xl font-bold mt-1">{item.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Graph Placeholder */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Usage Activity</h2>

        <div className="h-80 w-full bg-black/20 border border-white/10 rounded-xl p-4">
          {statsData.usageActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={statsData.usageActivity}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff20" />
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#9ca3af"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                  itemStyle={{ color: "#e5e7eb" }}
                  labelStyle={{ display: "none" }}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorUsage)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              <p>Not enough data yet to show graph.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Users List */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Users</h2>

        <div className="space-y-4">
          {recentUsers.length > 0 ? (
            recentUsers.map((user, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-black/20 border border-white/10 rounded-xl p-4"
              >
                <div>
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <p className="text-gray-300 text-sm">{user.email}</p>
                </div>
                <p className="text-gray-400 text-sm">{user.joined}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">No recent users found.</p>
          )}
        </div>
      </div>

    </div>
  );
}

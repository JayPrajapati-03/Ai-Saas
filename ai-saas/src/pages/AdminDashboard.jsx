import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, BarChart3, ImageIcon, Languages, Settings, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { API_URL } from "../config/api";

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState({
    totalUsers: 0, totalRequests: 0, imagesGenerated: 0, translations: 0, usageActivity: []
  });
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
          setStatsData({ ...data.stats, usageActivity: data.usageActivity || [] });
          setRecentUsers(data.recentUsers.map(u => ({
            ...u,
            joined: new Date(u.joined).toLocaleString("en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
          })));
        }
      } catch { /* noop */ }
    };
    fetchAdminStats();
  }, []);

  const stats = [
    { title: "Total Users",       value: statsData.totalUsers.toLocaleString(),       icon: Users,      color: "#c4b5fd", bg: "rgba(124,58,237,0.15)", border: "rgba(124,58,237,0.35)", trend: "+12%" },
    { title: "Total Requests",    value: statsData.totalRequests.toLocaleString(),    icon: BarChart3,  color: "#6ee7b7", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.35)", trend: "+8%" },
    { title: "Images Generated",  value: statsData.imagesGenerated.toLocaleString(), icon: ImageIcon,  color: "#f9a8d4", bg: "rgba(236,72,153,0.15)", border: "rgba(236,72,153,0.35)", trend: "+24%" },
    { title: "Translations",      value: statsData.translations.toLocaleString(),     icon: Languages,  color: "#fcd34d", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.35)", trend: "+5%" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Settings size={22} style={{ color: "#fca5a5" }} />
        </div>
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Admin <span style={{ background: "linear-gradient(135deg,#fca5a5,#f9a8d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Dashboard</span>
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>Platform-wide analytics and user management</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
        {stats.map(({ title, value, icon: Icon, color, bg, border, trend }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            style={{ padding: "22px 22px", background: "var(--bg-card)", border: `1px solid ${border}`, borderRadius: 16, boxShadow: `0 0 20px ${bg}` }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: bg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
                <Icon size={19} />
              </div>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#6ee7b7", background: "rgba(16,185,129,0.12)", padding: "3px 8px", borderRadius: 999 }}>
                <TrendingUp size={10} /> {trend}
              </span>
            </div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 32, fontWeight: 800, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{title}</div>
          </motion.div>
        ))}
      </div>

      {/* Usage Chart */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ padding: "24px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 700 }}>Usage Activity</h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>AI requests over time</p>
          </div>
          <span className="badge badge-violet">Last 30 days</span>
        </div>
        <div style={{ height: 280, width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 8px" }}>
          {statsData.usageActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={statsData.usageActivity}>
                <defs>
                  <linearGradient id="gradViolet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#475569" tickLine={false} axisLine={false} dy={10} tick={{ fontSize: 11 }} />
                <YAxis stroke="#475569" tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f1629", border: "1px solid rgba(124,58,237,0.35)", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}
                  itemStyle={{ color: "#c4b5fd" }}
                  labelStyle={{ color: "#94a3b8", display: "none" }}
                />
                <Area type="monotone" dataKey="requests" stroke="#7c3aed" strokeWidth={2.5} fillOpacity={1} fill="url(#gradViolet)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 14 }}>
              Not enough data yet to display a chart.
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent Users */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        style={{ padding: "24px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 700 }}>Recent Users</h2>
          <span className="badge badge-cyan">{recentUsers.length} users</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recentUsers.length > 0 ? (
            recentUsers.map((user, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.2)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Avatar */}
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `hsl(${(user.name.charCodeAt(0) * 15) % 360}, 60%, 40%)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16, color: "white", flexShrink: 0 }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{user.name}</div>
                      {user.plan && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 999,
                            background:
                              user.plan === "Ultimate"
                                ? "rgba(245,158,11,0.18)"
                                : user.plan === "Pro"
                                ? "rgba(124,58,237,0.2)"
                                : "rgba(16,185,129,0.18)",
                            color:
                              user.plan === "Ultimate"
                                ? "#fcd34d"
                                : user.plan === "Pro"
                                ? "#c4b5fd"
                                : "#6ee7b7",
                            border: `1px solid ${
                              user.plan === "Ultimate"
                                ? "rgba(245,158,11,0.35)"
                                : user.plan === "Pro"
                                ? "rgba(124,58,237,0.35)"
                                : "rgba(16,185,129,0.3)"
                            }`,
                          }}
                        >
                          {user.plan}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{user.email}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Joined</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 1 }}>{user.joined}</div>
                </div>
              </motion.div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 14 }}>
              <Users size={32} style={{ margin: "0 auto 10px", display: "block", opacity: 0.25 }} />
              No recent users found.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

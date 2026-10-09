import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  BarChart3,
  ImageIcon,
  Languages,
  Settings,
  TrendingUp,
  Search,
  Zap,
  ArrowRight,
  Shield,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { API_URL } from "../config/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    totalRequests: 0,
    imagesGenerated: 0,
    translations: 0,
    usageActivity: [],
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

  // Determine active view based on URL hash
  const activeTab =
    location.hash === "#users"
      ? "users"
      : location.hash === "#activity"
      ? "activity"
      : "overview";

  useEffect(() => {
    const content = document.querySelector(".dashboard-content");
    if (content) content.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      if (u?.role !== "admin") {
        navigate("/app", { replace: true });
        return;
      }
      setIsAuthorized(true);
    } catch {
      navigate("/app", { replace: true });
      return;
    }

    const fetchAdminStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 403 || res.status === 401) {
          navigate("/app", { replace: true });
          return;
        }
        const data = await res.json();
        if (data.success) {
          setStatsData({ ...data.stats, usageActivity: data.usageActivity || [] });
          const formattedUsers = (data.allUsers || data.recentUsers || []).map((u) => ({
            ...u,
            joinedFormatted: new Date(u.joined).toLocaleString("en-US", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
          setAllUsers(formattedUsers);
          setRecentUsers(
            (data.recentUsers || formattedUsers.slice(0, 5)).map((u) => ({
              ...u,
              joinedFormatted: new Date(u.joined).toLocaleString("en-US", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }),
            }))
          );
        }
      } catch {
        /* noop */
      }
    };
    fetchAdminStats();
  }, [navigate]);

  if (!isAuthorized) return null;

  const stats = [
    {
      title: "Total Users",
      value: statsData.totalUsers.toLocaleString(),
      icon: Users,
      color: "#c4b5fd",
      bg: "rgba(124,58,237,0.15)",
      border: "rgba(124,58,237,0.35)",
      trend: "+12%",
    },
    {
      title: "Total Requests",
      value: statsData.totalRequests.toLocaleString(),
      icon: BarChart3,
      color: "#6ee7b7",
      bg: "rgba(16,185,129,0.15)",
      border: "rgba(16,185,129,0.35)",
      trend: "+8%",
    },
    {
      title: "Images Generated",
      value: statsData.imagesGenerated.toLocaleString(),
      icon: ImageIcon,
      color: "#f9a8d4",
      bg: "rgba(236,72,153,0.15)",
      border: "rgba(236,72,153,0.35)",
      trend: "+24%",
    },
    {
      title: "Translations",
      value: statsData.translations.toLocaleString(),
      icon: Languages,
      color: "#fcd34d",
      bg: "rgba(245,158,11,0.15)",
      border: "rgba(245,158,11,0.35)",
      trend: "+5%",
    },
  ];

  // Filter users based on search query and plan filter
  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan =
      planFilter === "all" || (u.plan || "Basic").toLowerCase() === planFilter.toLowerCase();
    return matchesSearch && matchesPlan;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header & Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              background: "rgba(239,68,68,0.14)",
              border: "1px solid rgba(239,68,68,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Settings size={22} style={{ color: "#fca5a5" }} />
          </div>
          <div>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              {activeTab === "users" ? (
                <>
                  User <span className="gradient-text">Management</span>
                </>
              ) : activeTab === "activity" ? (
                <>
                  Platform <span className="gradient-text">Activity</span>
                </>
              ) : (
                <>
                  Admin <span className="gradient-text">Dashboard</span>
                </>
              )}
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
              {activeTab === "users"
                ? "Manage registered user accounts, subscriptions, and access"
                : activeTab === "activity"
                ? "Platform request trends and AI generation volume"
                : "Platform-wide analytics, metrics overview and operations"}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: 4,
            borderRadius: 12,
          }}
        >
          <Link
            to="/app/admin"
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              color: activeTab === "overview" ? "white" : "var(--text-muted)",
              background:
                activeTab === "overview"
                  ? "linear-gradient(135deg,rgba(124,58,237,0.3),rgba(6,182,212,0.15))"
                  : "transparent",
              border:
                activeTab === "overview"
                  ? "1px solid rgba(124,58,237,0.4)"
                  : "1px solid transparent",
              transition: "all 0.15s ease",
            }}
          >
            Overview
          </Link>
          <Link
            to="/app/admin#users"
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              color: activeTab === "users" ? "white" : "var(--text-muted)",
              background:
                activeTab === "users"
                  ? "linear-gradient(135deg,rgba(124,58,237,0.3),rgba(6,182,212,0.15))"
                  : "transparent",
              border:
                activeTab === "users"
                  ? "1px solid rgba(124,58,237,0.4)"
                  : "1px solid transparent",
              transition: "all 0.15s ease",
            }}
          >
            Users ({allUsers.length})
          </Link>
          <Link
            to="/app/admin#activity"
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              color: activeTab === "activity" ? "white" : "var(--text-muted)",
              background:
                activeTab === "activity"
                  ? "linear-gradient(135deg,rgba(124,58,237,0.3),rgba(6,182,212,0.15))"
                  : "transparent",
              border:
                activeTab === "activity"
                  ? "1px solid rgba(124,58,237,0.4)"
                  : "1px solid transparent",
              transition: "all 0.15s ease",
            }}
          >
            Usage Activity
          </Link>
        </div>
      </motion.div>

      {/* ────────────────── VIEW 1: ADMIN OVERVIEW ────────────────── */}
      {activeTab === "overview" && (
        <motion.div
          key="overview"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", flexDirection: "column", gap: 24 }}
        >
          {/* Key Stat Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
              gap: 16,
            }}
          >
            {stats.map(({ title, value, icon: Icon, color, bg, border, trend }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.05 }}
                style={{
                  padding: "20px",
                  background: "var(--bg-card)",
                  border: `1px solid ${border}`,
                  borderRadius: 16,
                  boxShadow: `0 0 20px ${bg}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 11,
                      background: bg,
                      border: `1px solid ${border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color,
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#6ee7b7",
                      background: "rgba(16,185,129,0.12)",
                      padding: "3px 8px",
                      borderRadius: 999,
                    }}
                  >
                    <TrendingUp size={10} /> {trend}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 28,
                    fontWeight: 800,
                    color,
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {value}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{title}</div>
              </motion.div>
            ))}
          </div>

          {/* Quick Previews Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(400px,1fr))", gap: 20 }}>
            {/* Left: Usage Chart Preview */}
            <div
              style={{
                padding: "22px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 18,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <div>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 700 }}>
                    Activity Preview
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Last 7 days trends</p>
                </div>
                <Link
                  to="/app/admin#activity"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#c4b5fd",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Full Analytics <ArrowRight size={13} />
                </Link>
              </div>

              <div
                style={{
                  height: 200,
                  width: "100%",
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  padding: "10px 4px",
                }}
              >
                {statsData.usageActivity.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={statsData.usageActivity}>
                      <defs>
                        <linearGradient id="gradPrev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#475569" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                      <YAxis stroke="#475569" tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f1629",
                          border: "1px solid rgba(124,58,237,0.35)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Area type="monotone" dataKey="requests" stroke="#7c3aed" strokeWidth={2} fill="url(#gradPrev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
                    No activity data available yet
                  </div>
                )}
              </div>
            </div>

            {/* Right: Recent Users Preview */}
            <div
              style={{
                padding: "22px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 18,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <div>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 700 }}>
                    Recent Users
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Newly registered accounts</p>
                </div>
                <Link
                  to="/app/admin#users"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6ee7b7",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Manage Users <ArrowRight size={13} />
                </Link>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                {recentUsers.slice(0, 4).map((u, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      background: "rgba(0,0,0,0.18)",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: `hsl(${((u.name || "U").charCodeAt(0) * 25) % 360}, 60%, 40%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 14,
                          color: "white",
                        }}
                      >
                        {(u.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{u.email}</div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: 999,
                        background:
                          u.plan === "Ultimate"
                            ? "rgba(245,158,11,0.2)"
                            : u.plan === "Pro"
                            ? "rgba(124,58,237,0.2)"
                            : "rgba(16,185,129,0.15)",
                        color:
                          u.plan === "Ultimate"
                            ? "#fcd34d"
                            : u.plan === "Pro"
                            ? "#c4b5fd"
                            : "#6ee7b7",
                      }}
                    >
                      {u.plan || "Basic"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ────────────────── VIEW 2: USER MANAGEMENT ────────────────── */}
      {activeTab === "users" && (
        <motion.div
          key="users"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          {/* Controls: Search and Filter Bar */}
          <div
            style={{
              padding: "18px 22px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            {/* Search Input */}
            <div
              style={{
                position: "relative",
                flex: "1 1 280px",
                maxWidth: 420,
              }}
            >
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px 10px 38px",
                  borderRadius: 10,
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>

            {/* Filter Pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["all", "Ultimate", "Pro", "Basic"].map((p) => {
                const isSelected = planFilter.toLowerCase() === p.toLowerCase();
                const count =
                  p === "all"
                    ? allUsers.length
                    : allUsers.filter((u) => (u.plan || "Basic").toLowerCase() === p.toLowerCase()).length;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlanFilter(p)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      border: isSelected
                        ? "1px solid rgba(124,58,237,0.5)"
                        : "1px solid rgba(255,255,255,0.08)",
                      background: isSelected
                        ? "linear-gradient(135deg,rgba(124,58,237,0.3),rgba(6,182,212,0.15))"
                        : "rgba(255,255,255,0.03)",
                      color: isSelected ? "white" : "var(--text-secondary)",
                    }}
                  >
                    {p === "all" ? "All Users" : p} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Users Table Card */}
          <div
            style={{
              padding: "22px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 17, fontWeight: 700 }}>
                Registered Accounts ({filteredUsers.length})
              </h3>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Showing {filteredUsers.length} of {allUsers.length} total users
              </span>
            </div>

            {filteredUsers.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 20px",
                  color: "var(--text-muted)",
                }}
              >
                <Users size={36} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
                <p style={{ fontSize: 14 }}>No users found matching &quot;{searchQuery}&quot;</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredUsers.map((u, i) => (
                  <motion.div
                    key={u.id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      background: "rgba(0,0,0,0.2)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 12,
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    {/* User Profile */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: `hsl(${((u.name || "U").charCodeAt(0) * 35) % 360}, 65%, 45%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 16,
                          color: "white",
                        }}
                      >
                        {(u.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "white" }}>
                            {u.name}
                          </span>
                          {u.role === "admin" && (
                            <span
                              style={{
                                fontSize: 9.5,
                                fontWeight: 700,
                                padding: "2px 6px",
                                borderRadius: 999,
                                background: "rgba(239,68,68,0.25)",
                                color: "#fca5a5",
                                border: "1px solid rgba(239,68,68,0.4)",
                              }}
                            >
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{u.email}</div>
                      </div>
                    </div>

                    {/* Plan & Credits */}
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Credits Balance</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#c4b5fd" }}>
                          {u.plan === "Basic" ? "∞ (Free)" : `${u.credits?.toLocaleString() || 0} pts`}
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: 999,
                          background:
                            u.plan === "Ultimate"
                              ? "rgba(245,158,11,0.2)"
                              : u.plan === "Pro"
                              ? "rgba(124,58,237,0.2)"
                              : "rgba(16,185,129,0.15)",
                          color:
                            u.plan === "Ultimate"
                              ? "#fcd34d"
                              : u.plan === "Pro"
                              ? "#c4b5fd"
                              : "#6ee7b7",
                          border: `1px solid ${
                            u.plan === "Ultimate"
                              ? "rgba(245,158,11,0.35)"
                              : u.plan === "Pro"
                              ? "rgba(124,58,237,0.35)"
                              : "rgba(16,185,129,0.3)"
                          }`,
                        }}
                      >
                        {u.plan || "Basic"} Tier
                      </span>

                      <div style={{ textAlign: "right", minWidth: 100 }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Registered</div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                          {u.joinedFormatted || "Recent"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ────────────────── VIEW 3: PLATFORM USAGE ────────────────── */}
      {activeTab === "activity" && (
        <motion.div
          key="activity"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", flexDirection: "column", gap: 24 }}
        >
          {/* Detailed Area Chart */}
          <div
            style={{
              padding: "24px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 700 }}>
                  AI Request Traffic
                </h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  Daily generation traffic across Text, Summarizer, Translator, and Images
                </p>
              </div>
              <span className="badge badge-violet">Live Traffic Activity</span>
            </div>

            <div
              style={{
                height: 320,
                width: "100%",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 14,
                padding: "16px 8px",
              }}
            >
              {statsData.usageActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={statsData.usageActivity}>
                    <defs>
                      <linearGradient id="gradFull" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.65} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} dy={10} tick={{ fontSize: 12 }} />
                    <YAxis stroke="#64748b" tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f1629",
                        border: "1px solid rgba(124,58,237,0.4)",
                        borderRadius: 10,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                      }}
                      itemStyle={{ color: "#c4b5fd" }}
                    />
                    <Area type="monotone" dataKey="requests" stroke="#a78bfa" strokeWidth={3} fill="url(#gradFull)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 14 }}>
                  No traffic activity recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Breakdown KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
            <div
              style={{
                padding: "20px",
                background: "var(--bg-card)",
                border: "1px solid rgba(236,72,153,0.3)",
                borderRadius: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <ImageIcon size={20} color="#f472b6" />
                <span style={{ fontSize: 14, fontWeight: 600, color: "white" }}>Image Generations</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#f472b6" }}>
                {statsData.imagesGenerated}
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                Generated via HuggingFace SDXL models
              </p>
            </div>

            <div
              style={{
                padding: "20px",
                background: "var(--bg-card)",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Languages size={20} color="#fbbf24" />
                <span style={{ fontSize: 14, fontWeight: 600, color: "white" }}>Translations</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#fbbf24" }}>
                {statsData.translations}
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                Multilingual AI translation requests
              </p>
            </div>

            <div
              style={{
                padding: "20px",
                background: "var(--bg-card)",
                border: "1px solid rgba(16,185,129,0.3)",
                borderRadius: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <BarChart3 size={20} color="#34d399" />
                <span style={{ fontSize: 14, fontWeight: 600, color: "white" }}>Total Traffic</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#34d399" }}>
                {statsData.totalRequests}
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                All AI pipeline requests served
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

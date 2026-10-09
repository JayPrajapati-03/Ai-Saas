import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Sparkles, FileText, ImageIcon, Languages, Clock,
  CreditCard, Settings, Menu, X, ChevronRight, Cpu, LogOut, Bell,
  CheckCheck, Trash2, Zap, Trophy, Shield, BarChart3, Users, TrendingUp
} from "lucide-react";
import { useUsage } from "../context/UsageContext";
import { useNotifications, getRelativeTime } from "../context/NotificationContext";
import OutOfCreditsModal from "../components/OutOfCreditsModal";

// Regular user navigation items (consumer AI tools & billing)
const userMenuItems = [
  { name: "Dashboard",       icon: Home,       path: "/app",                  color: "#c4b5fd" },
  { name: "Text Generator",  icon: Sparkles,   path: "/app/text-generator",   color: "#67e8f9" },
  { name: "Summarizer",      icon: FileText,   path: "/app/summarizer",        color: "#6ee7b7" },
  { name: "Image Generator", icon: ImageIcon,  path: "/app/image-generator",  color: "#f9a8d4" },
  { name: "Translator",      icon: Languages,  path: "/app/translator",        color: "#fcd34d" },
  { name: "History",         icon: Clock,      path: "/app/history",           color: "#93c5fd" },
  { name: "Billing",         icon: CreditCard, path: "/app/billing",           color: "#86efac" },
];

// Dedicated Admin navigation items (platform management only)
const adminMenuItems = [
  { name: "Admin Overview",  icon: BarChart3,  path: "/app/admin",            color: "#fda4af" },
  { name: "User Management", icon: Users,      path: "/app/admin#users",      color: "#c4b5fd" },
  { name: "Platform Usage",  icon: TrendingUp, path: "/app/admin#activity",   color: "#67e8f9" },
];

const notifIconMap = { Sparkles, Zap, ImageIcon, Bell, Trophy, Shield, CreditCard };

export default function DashboardLayout() {
  const {
    plan = "Basic",
    credits = "Unlimited credits",
    showOutOfCreditsModal,
    setShowOutOfCreditsModal,
  } = useUsage() || {};
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    clearAllNotifications,
    dismissNotification,
    toggleRead,
  } = useNotifications();

  const [open, setOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const isAdmin = (() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u?.role === "admin";
    } catch {
      return false;
    }
  })();

  const visibleMenuItems = isAdmin ? adminMenuItems : userMenuItems;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("#notif-container")) {
        setNotifOpen(false);
      }
      if (!e.target.closest("#profile-container")) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getUserInitial = () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        return user.name ? user.name.charAt(0).toUpperCase() : "U";
      }
    } catch { /* noop */ }
    return "U";
  };

  const getUserEmail = () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        return user.email || "";
      }
    } catch { /* noop */ }
    return "";
  };

  const getUserName = () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        return user.name || "User";
      }
    } catch { /* noop */ }
    return "User";
  };

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      maxHeight: "100vh",
      width: "100%",
      overflow: "hidden",
      background: "var(--bg-deep)",
      fontFamily: "var(--font-body)",
      position: "relative",
    }}>
      {/* Mesh bg */}
      <div className="mesh-bg" />

      {/* ═══════════════════════════════════
          SIDEBAR
      ═══════════════════════════════════ */}
      <motion.div
        animate={{ width: open ? 240 : 72 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{
          height: "100vh",
          maxHeight: "100vh",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          padding: 0,
          position: "sticky",
          top: 0,
          zIndex: 20,
          overflow: "hidden",
        }}
      >
        {/* Sidebar Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: open ? "space-between" : "center",
          padding: open ? "18px 18px 14px" : "18px 12px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          marginBottom: 6,
          flexShrink: 0,
        }}>
          <AnimatePresence>
            {open && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Cpu size={16} color="white" />
                </div>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 700, whiteSpace: "nowrap" }}>
                  AI<span className="gradient-text">Panel</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setOpen(!open)}
            title={open ? "Collapse sidebar" : "Expand sidebar"}
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)", transition: "all 0.2s", flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
          >
            <Menu size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav
          className="sidebar-nav-scroll"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            padding: "6px 10px",
          }}
        >
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path.includes("#")
              ? (location.pathname + location.hash) === item.path
              : location.pathname === item.path && !location.hash;
            return (
              <Link
                key={item.path}
                to={item.path}
                state={item.path === "/app/billing" ? { from: location.pathname } : undefined}
                title={!open ? item.name : undefined}
                style={{
                  display: "flex", alignItems: "center",
                  gap: open ? 12 : 0,
                  justifyContent: open ? "flex-start" : "center",
                  padding: open ? "9px 12px" : "9px",
                  borderRadius: 10,
                  textDecoration: "none",
                  position: "relative",
                  transition: "all 0.2s ease",
                  ...(isActive ? {
                    background: "linear-gradient(135deg,rgba(124,58,237,0.25),rgba(6,182,212,0.1))",
                    border: "1px solid rgba(124,58,237,0.4)",
                    boxShadow: "0 4px 16px rgba(124,58,237,0.2)",
                    color: "white",
                  } : {
                    background: "transparent",
                    border: "1px solid transparent",
                    color: "var(--text-secondary)",
                  }),
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "white"; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, borderRadius: "0 4px 4px 0", background: item.color }} />
                )}
                <Icon
                  size={18}
                  style={{ color: isActive ? item.color : "currentColor", flexShrink: 0 }}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <AnimatePresence>
                  {open && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, whiteSpace: "nowrap", overflow: "hidden" }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                {open && isActive && <ChevronRight size={14} style={{ marginLeft: "auto", color: item.color, opacity: 0.7 }} />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Subscription / Admin Widget */}
        <AnimatePresence>
          {open ? (
            isAdmin ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                style={{
                  flexShrink: 0,
                  margin: "8px 10px 12px",
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(124,58,237,0.1))",
                  border: "1px solid rgba(239,68,68,0.3)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>ROLE</span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: "rgba(239,68,68,0.25)",
                      color: "#fca5a5",
                      border: "1px solid rgba(239,68,68,0.45)",
                    }}
                  >
                    ADMIN
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "white", fontWeight: 600 }}>
                  <Shield size={13} color="#fca5a5" style={{ flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Platform Superadmin</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                style={{
                  flexShrink: 0,
                  margin: "8px 10px 12px",
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.06))",
                  border: "1px solid rgba(124,58,237,0.25)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>PLAN</span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: plan === "Ultimate" ? "rgba(245,158,11,0.2)" : plan === "Pro" ? "rgba(124,58,237,0.25)" : "rgba(16,185,129,0.2)",
                      color: plan === "Ultimate" ? "#fcd34d" : plan === "Pro" ? "#c4b5fd" : "#6ee7b7",
                      border: `1px solid ${plan === "Ultimate" ? "rgba(245,158,11,0.4)" : plan === "Pro" ? "rgba(124,58,237,0.4)" : "rgba(16,185,129,0.35)"}`,
                    }}
                  >
                    {plan}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "white", fontWeight: 600, marginBottom: 10 }}>
                  <Zap size={13} color="#c4b5fd" style={{ flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{credits}</span>
                </div>
                <Link
                  to="/app/billing"
                  state={{ from: location.pathname }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: "7px 0",
                    borderRadius: 8,
                    background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.2))",
                    border: "1px solid rgba(124,58,237,0.45)",
                    color: "#ffffff",
                    textDecoration: "none",
                    fontSize: 11,
                    fontWeight: 600,
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 8px rgba(124,58,237,0.25)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(124,58,237,0.55), rgba(6,182,212,0.4))";
                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(124,58,237,0.45)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.2))";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(124,58,237,0.25)";
                  }}
                >
                  <Sparkles size={12} color="#c4b5fd" />
                  <span>{plan === "Basic" ? "Upgrade Subscription" : "Manage Billing"}</span>
                </Link>
              </motion.div>
            )
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                flexShrink: 0,
                margin: "8px 10px 12px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Link
                to="/app/billing"
                state={{ from: location.pathname }}
                title={`${plan} Plan • ${credits}`}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))",
                  border: "1px solid rgba(124,58,237,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#c4b5fd",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(124,58,237,0.35), rgba(6,182,212,0.2))";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <Zap size={18} color="#c4b5fd" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ═══════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════ */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxHeight: "100vh",
        minWidth: 0,
        overflow: "hidden",
        position: "relative",
        zIndex: 1,
      }}>

        {/* TOP NAVBAR */}
        <div style={{
          flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 28px",
          background: "rgba(255,255,255,0.02)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          position: "sticky", top: 0, zIndex: 10,
        }}>

          {/* Page title derived from path */}
          <div>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 600, color: "white" }}>
              {visibleMenuItems.find(m => m.path === (location.pathname + location.hash))?.name || visibleMenuItems.find(m => m.path.split("#")[0] === location.pathname)?.name || (isAdmin ? "Admin Portal" : "Dashboard")}
            </h1>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Notification Bell with interactive dropdown */}
            <div id="notif-container" style={{ position: "relative" }}>
              <button
                id="notif-button"
                aria-haspopup="true"
                aria-expanded={notifOpen}
                onClick={() => { setNotifOpen(!notifOpen); setMenuOpen(false); }}
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: notifOpen ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${notifOpen ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.1)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: notifOpen ? "white" : "var(--text-secondary)",
                  position: "relative", transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "white"; }}
                onMouseLeave={e => { if (!notifOpen) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute", top: -2, right: -2,
                    minWidth: 16, height: 16, borderRadius: 999,
                    background: "linear-gradient(135deg,#7c3aed,#ec4899)",
                    border: "2px solid var(--bg-deep)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: "white", padding: "0 3px",
                    boxShadow: "0 0 10px rgba(236,72,153,0.6)"
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    id="notif-dropdown"
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: "absolute", right: 0, top: "calc(100% + 10px)",
                      width: 350, maxWidth: "calc(100vw - 32px)",
                      borderRadius: 16,
                      background: "#0c1222",
                      border: "1px solid rgba(124,58,237,0.35)",
                      boxShadow: "0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(124,58,237,0.15)",
                      zIndex: 100, overflow: "hidden",
                    }}
                  >
                    {/* Header */}
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)",
                      background: "rgba(255,255,255,0.02)"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15, color: "white" }}>
                          Notifications
                        </span>
                        {unreadCount > 0 ? (
                          <span className="badge badge-violet" style={{ fontSize: 10, padding: "2px 8px" }}>
                            {unreadCount} new
                          </span>
                        ) : (
                          <span className="badge badge-emerald" style={{ fontSize: 10, padding: "2px 8px" }}>
                            Caught up
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            title="Mark all as read"
                            style={{
                              background: "none", border: "none", cursor: "pointer",
                              color: "var(--text-secondary)", display: "flex", alignItems: "center",
                              gap: 4, fontSize: 11, padding: "4px 8px", borderRadius: 6,
                              transition: "all 0.15s"
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = "#c4b5fd"; e.currentTarget.style.background = "rgba(124,58,237,0.1)"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "none"; }}
                          >
                            <CheckCheck size={13} />
                            <span>Mark read</span>
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            title="Clear all notifications"
                            style={{
                              background: "none", border: "none", cursor: "pointer",
                              color: "var(--text-muted)", display: "flex", alignItems: "center",
                              padding: "4px 6px", borderRadius: 6, transition: "all 0.15s"
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = "#fca5a5"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "none"; }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notification list */}
                    <div style={{ maxHeight: 340, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: "36px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6ee7b7" }}>
                            <CheckCheck size={20} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: "white" }}>All caught up!</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>No new notifications at this time.</div>
                          </div>
                        </div>
                      ) : (
                        notifications.map((n) => {
                          const IconComponent = notifIconMap[n.iconName] || n.icon || Bell;
                          return (
                            <div
                              key={n.id}
                              onClick={() => toggleRead(n.id)}
                              style={{
                                display: "flex", alignItems: "flex-start", gap: 12,
                                padding: "14px 16px", cursor: "pointer",
                                borderBottom: "1px solid rgba(255,255,255,0.05)",
                                background: n.unread ? "rgba(124,58,237,0.07)" : "transparent",
                                transition: "background 0.15s ease",
                                position: "relative"
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = n.unread ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.04)"}
                              onMouseLeave={e => e.currentTarget.style.background = n.unread ? "rgba(124,58,237,0.07)" : "transparent"}
                            >
                              {/* Unread indicator pill */}
                              {n.unread && (
                                <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 24, borderRadius: "0 4px 4px 0", background: "#7c3aed" }} />
                              )}

                              {/* Icon */}
                              <div style={{
                                width: 32, height: 32, borderRadius: 10,
                                background: `${n.color}22`, border: `1px solid ${n.color}44`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: n.color, flexShrink: 0, marginTop: 2
                              }}>
                                <IconComponent size={15} />
                              </div>

                              {/* Text info */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                                  <div style={{ fontSize: 13, fontWeight: n.unread ? 600 : 500, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {n.title}
                                  </div>
                                  <button
                                    onClick={(e) => dismissNotification(n.id, e)}
                                    title="Dismiss"
                                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 2, borderRadius: 4, display: "flex", flexShrink: 0 }}
                                    onMouseEnter={e => e.currentTarget.style.color = "white"}
                                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.4 }}>
                                  {n.message}
                                </div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                                  {n.createdAt ? getRelativeTime(n.createdAt) : n.time || "Just now"}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer */}
                    <div style={{
                      padding: "10px 16px", background: "rgba(0,0,0,0.25)",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      fontSize: 11, color: "var(--text-muted)"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
                        <span>All systems operational</span>
                      </div>
                      <span>AISaaS v1.0</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User avatar */}
            <div id="profile-container" style={{ position: "relative" }}>
              <button
                id="profile-button"
                aria-haspopup="true"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
                  border: "2px solid rgba(124,58,237,0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15, color: "white",
                  cursor: "pointer", boxShadow: "0 0 12px rgba(124,58,237,0.3)",
                  transition: "box-shadow 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 20px rgba(124,58,237,0.5)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 12px rgba(124,58,237,0.3)"}
              >
                {getUserInitial()}
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    role="menu"
                    style={{
                      position: "absolute", right: 0, top: "calc(100% + 10px)",
                      width: 220, borderRadius: 14,
                      background: "#0f1629",
                      border: "1px solid rgba(124,58,237,0.3)",
                      boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 0 20px rgba(124,58,237,0.1)",
                      zIndex: 100, overflow: "hidden",
                    }}
                  >
                    <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "white" }}>{getUserName()}</div>
                        {isAdmin ? (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 999,
                              background: "rgba(239,68,68,0.2)",
                              color: "#fca5a5",
                              border: "1px solid rgba(239,68,68,0.4)",
                            }}
                          >
                            ADMIN
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 999,
                              background: plan === "Ultimate" ? "rgba(245,158,11,0.2)" : plan === "Pro" ? "rgba(124,58,237,0.25)" : "rgba(16,185,129,0.18)",
                              color: plan === "Ultimate" ? "#fcd34d" : plan === "Pro" ? "#c4b5fd" : "#6ee7b7",
                              border: `1px solid ${plan === "Ultimate" ? "rgba(245,158,11,0.4)" : plan === "Pro" ? "rgba(124,58,237,0.4)" : "rgba(16,185,129,0.3)"}`,
                            }}
                          >
                            {plan} Tier
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getUserEmail()}</div>
                    </div>
                    <div style={{ padding: "8px" }}>
                      {isAdmin && (
                        <Link
                          to="/app/admin"
                          onClick={() => setMenuOpen(false)}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "10px 12px", borderRadius: 8, background: "none",
                            color: "#fda4af", textDecoration: "none", fontSize: 13, fontWeight: 500,
                            marginBottom: 4, transition: "background 0.15s",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(253,164,175,0.1)"}
                          onMouseLeave={e => e.currentTarget.style.background = "none"}
                        >
                          <Settings size={15} /> Admin Dashboard
                        </Link>
                      )}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: 8,
                          padding: "10px 12px", borderRadius: 8, background: "none", border: "none",
                          color: "#fca5a5", cursor: "pointer", fontSize: 13, fontWeight: 500, textAlign: "left",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="dashboard-content" style={{ flex: 1, padding: "28px 32px", overflowY: "auto", minHeight: 0 }}>
          <Outlet />
        </div>
      </div>

      {/* Out Of Credits Warning Modal */}
      <OutOfCreditsModal
        isOpen={Boolean(showOutOfCreditsModal)}
        onClose={() => setShowOutOfCreditsModal?.(false)}
      />
    </div>
  );
}

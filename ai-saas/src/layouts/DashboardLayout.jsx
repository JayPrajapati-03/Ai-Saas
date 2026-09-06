import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Sparkles, FileText, ImageIcon, Languages, Clock,
  CreditCard, Settings, Menu, X, ChevronRight, Cpu, LogOut, Bell,
  CheckCheck, Trash2, Zap
} from "lucide-react";

const menuItems = [
  { name: "Dashboard",       icon: Home,       path: "/app",                  color: "#c4b5fd" },
  { name: "Text Generator",  icon: Sparkles,   path: "/app/text-generator",   color: "#67e8f9" },
  { name: "Summarizer",      icon: FileText,   path: "/app/summarizer",        color: "#6ee7b7" },
  { name: "Image Generator", icon: ImageIcon,  path: "/app/image-generator",  color: "#f9a8d4" },
  { name: "Translator",      icon: Languages,  path: "/app/translator",        color: "#fcd34d" },
  { name: "History",         icon: Clock,      path: "/app/history",           color: "#93c5fd" },
  { name: "Billing",         icon: CreditCard, path: "/app/billing",           color: "#86efac" },
  { name: "Admin",           icon: Settings,   path: "/app/admin",             color: "#fda4af" },
];

export default function DashboardLayout() {
  const [open, setOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Welcome to AISaaS 🎉",
      message: "Your AI suite is ready. Generate content, summaries, images, and translations.",
      time: "Just now",
      unread: true,
      icon: Sparkles,
      color: "#c4b5fd",
    },
    {
      id: 2,
      title: "Active Tier: Bronze ⚡",
      message: "Unlimited text generation and summarization unlocked on your account.",
      time: "15m ago",
      unread: true,
      icon: Zap,
      color: "#6ee7b7",
    },
    {
      id: 3,
      title: "Image Styles Available 🎨",
      message: "Try Anime, Cinematic, Pixel Art, and Photorealistic styles in Image Generator.",
      time: "1h ago",
      unread: false,
      icon: ImageIcon,
      color: "#f9a8d4",
    },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const dismissNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: !n.unread } : n));
  };

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
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-deep)", fontFamily: "var(--font-body)", position: "relative" }}>
      {/* Mesh bg */}
      <div className="mesh-bg" />

      {/* ═══════════════════════════════════
          SIDEBAR
      ═══════════════════════════════════ */}
      <motion.div
        animate={{ width: open ? 240 : 72 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{
          flexShrink: 0, display: "flex", flexDirection: "column",
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          padding: "0 0 24px",
          position: "relative", zIndex: 20, overflow: "hidden",
        }}
      >
        {/* Sidebar Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: open ? "space-between" : "center",
          padding: open ? "20px 20px 16px" : "20px 12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          marginBottom: 8,
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
            style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)", transition: "all 0.2s", flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, padding: "8px 12px" }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={!open ? item.name : undefined}
                style={{
                  display: "flex", alignItems: "center",
                  gap: open ? 12 : 0,
                  justifyContent: open ? "flex-start" : "center",
                  padding: open ? "10px 14px" : "10px",
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
      </motion.div>

      {/* ═══════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative", zIndex: 1 }}>

        {/* TOP NAVBAR */}
        <div style={{
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
              {menuItems.find(m => m.path === location.pathname)?.name || "Dashboard"}
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
                          const IconComponent = n.icon || Bell;
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
                                  {n.time}
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
                      <div style={{ fontWeight: 600, fontSize: 14, color: "white" }}>{getUserName()}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getUserEmail()}</div>
                    </div>
                    <div style={{ padding: "8px" }}>
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
        <div className="dashboard-content" style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

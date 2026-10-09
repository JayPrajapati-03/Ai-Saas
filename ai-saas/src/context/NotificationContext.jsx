import { createContext, useContext, useState, useEffect, useCallback } from "react";

const NotificationContext = createContext();

export function getRelativeTime(timestamp) {
  if (!timestamp) return "Just now";
  const diffSec = Math.floor((Date.now() - Number(timestamp)) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

// User-specific initial notifications
const defaultUserNotifications = [
  {
    id: "welcome-user",
    title: "Welcome to AISaaS 🎉",
    message: "Your AI suite is ready. Explore text generation, image creation, and summarizer.",
    createdAt: Date.now() - 1000 * 60 * 5,
    unread: true,
    iconName: "Sparkles",
    color: "#c4b5fd",
  },
  {
    id: "tier-user",
    title: "Account Activated ⚡",
    message: "Free tier generation unlocked. Ready to create your first content piece.",
    createdAt: Date.now() - 1000 * 60 * 20,
    unread: true,
    iconName: "Zap",
    color: "#6ee7b7",
  },
];

// Admin-specific initial system alerts
const defaultAdminNotifications = [
  {
    id: "admin-system-init",
    title: "Admin Portal Online 🛡️",
    message: "Superadmin session active with full platform access and management privileges.",
    createdAt: Date.now() - 1000 * 60 * 2,
    unread: true,
    iconName: "Shield",
    color: "#fca5a5",
  },
  {
    id: "admin-user-monitor",
    title: "User Management Active 👥",
    message: "Platform monitoring active across all registered accounts and subscription tiers.",
    createdAt: Date.now() - 1000 * 60 * 15,
    unread: true,
    iconName: "Users",
    color: "#c4b5fd",
  },
  {
    id: "admin-pipeline-status",
    title: "AI Pipelines Healthy ⚡",
    message: "Text generation, SDXL image engine, and translation microservices are operational.",
    createdAt: Date.now() - 1000 * 60 * 45,
    unread: false,
    iconName: "Zap",
    color: "#6ee7b7",
  },
  {
    id: "admin-billing-monitor",
    title: "Billing Gateway Ready 💳",
    message: "Razorpay payment link integration and subscription state tracking active.",
    createdAt: Date.now() - 1000 * 60 * 90,
    unread: false,
    iconName: "CreditCard",
    color: "#fcd34d",
  },
];

function getCurrentRole() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    return u?.role === "admin" ? "admin" : "user";
  } catch {
    return "user";
  }
}

const getStorageKey = (r) =>
  r === "admin" ? "aisaas_notifications_admin" : "aisaas_notifications_user";

const getDefaults = (r) =>
  r === "admin" ? defaultAdminNotifications : defaultUserNotifications;

export function NotificationProvider({ children }) {
  const [role, setRole] = useState(() => getCurrentRole());

  const loadNotificationsForRole = useCallback((targetRole) => {
    try {
      const saved = localStorage.getItem(getStorageKey(targetRole));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      /* noop */
    }
    return getDefaults(targetRole);
  }, []);

  const [notifications, setNotifications] = useState(() =>
    loadNotificationsForRole(getCurrentRole())
  );

  // Keep relative times fresh every minute
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  // Track role switches (e.g. user logs out, admin logs in or vice versa)
  useEffect(() => {
    const handleRoleCheck = () => {
      const activeRole = getCurrentRole();
      if (activeRole !== role) {
        setRole(activeRole);
        setNotifications(loadNotificationsForRole(activeRole));
      }
    };
    window.addEventListener("storage", handleRoleCheck);
    const interval = setInterval(handleRoleCheck, 1000);
    return () => {
      window.removeEventListener("storage", handleRoleCheck);
      clearInterval(interval);
    };
  }, [role, loadNotificationsForRole]);

  // Persist notifications to role-specific localStorage key
  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey(role), JSON.stringify(notifications));
    } catch {
      /* noop */
    }
  }, [notifications, role]);

  // Real-time custom event listener
  useEffect(() => {
    const handleCustomNotify = (e) => {
      if (e.detail) {
        addNotification(e.detail);
      }
    };
    window.addEventListener("aisaas:notify", handleCustomNotify);
    return () => window.removeEventListener("aisaas:notify", handleCustomNotify);
  }, [role]);

  const addNotification = useCallback(
    (item) => {
      // If notification is explicitly targeted for a specific role and current role does not match, ignore
      if (item.targetRole && item.targetRole !== role) return;

      const newNotif = {
        id: "notif_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
        title: item.title || "Notification",
        message: item.message || "",
        createdAt: Date.now(),
        unread: true,
        iconName: item.iconName || (role === "admin" ? "Shield" : "Bell"),
        color: item.color || (role === "admin" ? "#fca5a5" : "#c4b5fd"),
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 24)]);
    },
    [role]
  );

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const dismissNotification = useCallback((id, e) => {
    if (e) e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const toggleRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        role,
        isAdmin: role === "admin",
        notifications,
        unreadCount,
        addNotification,
        markAllAsRead,
        clearAllNotifications,
        dismissNotification,
        toggleRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      role: "user",
      isAdmin: false,
      notifications: [],
      unreadCount: 0,
      addNotification: () => {},
      markAllAsRead: () => {},
      clearAllNotifications: () => {},
      dismissNotification: () => {},
      toggleRead: () => {},
    };
  }
  return context;
}

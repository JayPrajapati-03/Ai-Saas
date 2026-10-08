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

const defaultInitialNotifications = [
  {
    id: "welcome-init",
    title: "Welcome to AISaaS 🎉",
    message: "Your AI suite is ready. Explore text generation, image creation, and summarizer.",
    createdAt: Date.now() - 1000 * 60 * 2, // 2m ago
    unread: true,
    iconName: "Sparkles",
    color: "#c4b5fd",
  },
  {
    id: "tier-init",
    title: "Account Activated ⚡",
    message: "Free tier generation unlocked. Ready to create your first content piece.",
    createdAt: Date.now() - 1000 * 60 * 15, // 15m ago
    unread: true,
    iconName: "Zap",
    color: "#6ee7b7",
  },
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("aisaas_notifications");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      /* noop */
    }
    return defaultInitialNotifications;
  });

  // Keep relative times fresh by ticking state periodically
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("aisaas_notifications", JSON.stringify(notifications));
    } catch {
      /* noop */
    }
  }, [notifications]);

  // Sync across tabs in real-time
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "aisaas_notifications" && e.newValue) {
        try {
          setNotifications(JSON.parse(e.newValue));
        } catch {
          /* noop */
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Real-time custom event listener
  useEffect(() => {
    const handleCustomNotify = (e) => {
      if (e.detail) {
        addNotification(e.detail);
      }
    };
    window.addEventListener("aisaas:notify", handleCustomNotify);
    return () => window.removeEventListener("aisaas:notify", handleCustomNotify);
  }, []);

  const addNotification = useCallback((item) => {
    const newNotif = {
      id: "notif_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      title: item.title || "Notification",
      message: item.message || "",
      createdAt: Date.now(),
      unread: true,
      iconName: item.iconName || "Bell",
      color: item.color || "#c4b5fd",
    };

    setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]); // Cap at 20 items
  }, []);

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

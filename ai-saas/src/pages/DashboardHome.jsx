import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  FileText,
  ImageIcon,
  Languages,
  ArrowRight,
  Zap,
  Trophy,
  CreditCard,
  Crown,
  Star,
  Check,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUsage } from "../context/UsageContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../config/api";

const quickTools = [
  {
    title: "Text Generator",
    desc: "Generate creative, professional AI content in seconds.",
    icon: Sparkles,
    path: "/app/text-generator",
    color: "#c4b5fd",
    bg: "rgba(124,58,237,0.15)",
    border: "rgba(124,58,237,0.35)",
  },
  {
    title: "Summarizer",
    desc: "Condense lengthy content into crisp summaries.",
    icon: FileText,
    path: "/app/summarizer",
    color: "#6ee7b7",
    bg: "rgba(16,185,129,0.15)",
    border: "rgba(16,185,129,0.35)",
  },
  {
    title: "Image Generator",
    desc: "Create stunning AI images from simple prompts.",
    icon: ImageIcon,
    path: "/app/image-generator",
    color: "#f9a8d4",
    bg: "rgba(236,72,153,0.15)",
    border: "rgba(236,72,153,0.35)",
  },
  {
    title: "Translator",
    desc: "Translate text across 7+ languages instantly.",
    icon: Languages,
    path: "/app/translator",
    color: "#fcd34d",
    bg: "rgba(245,158,11,0.15)",
    border: "rgba(245,158,11,0.35)",
  },
];

const levelColors = {
  Bronze: { color: "#cd7f32", glow: "rgba(205,127,50,0.3)" },
  Silver: { color: "#c0c0c0", glow: "rgba(192,192,192,0.3)" },
  Gold: { color: "#ffd700", glow: "rgba(255,215,0,0.3)" },
  Platinum: { color: "#e5e4e2", glow: "rgba(229,228,226,0.3)" },
};

const planBadges = {
  Basic: {
    name: "Basic Plan",
    tag: "🌱 Free Tier",
    color: "#6ee7b7",
    bg: "rgba(16,185,129,0.15)",
    border: "rgba(16,185,129,0.35)",
    icon: Zap,
    perks: [
      "AI Text Generation",
      "AI Summarizer",
      "Basic Translator",
      "Image Generator (10/day)",
    ],
  },
  Pro: {
    name: "Pro Plan",
    tag: "⚡ Pro Member",
    color: "#c4b5fd",
    bg: "rgba(124,58,237,0.15)",
    border: "rgba(124,58,237,0.4)",
    icon: Star,
    perks: [
      "2,000 monthly credits",
      "Fast AI responses",
      "HD Image Generation",
      "Priority support",
    ],
  },
  Ultimate: {
    name: "Ultimate Plan",
    tag: "👑 Ultimate Member",
    color: "#fcd34d",
    bg: "rgba(245,158,11,0.15)",
    border: "rgba(245,158,11,0.4)",
    icon: Crown,
    perks: [
      "5,000 monthly credits",
      "Ultra-fast AI",
      "Unlimited images",
      "Dedicated support",
    ],
  },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardHome() {
  const [userName, setUserName] = useState("User");
  const { usageCount, plan, credits } = useUsage();
  const [stats, setStats] = useState({
    credits: "∞",
    todayUsage: 0,
    userLevel: "Bronze",
  });

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      if (u.name) setUserName(u.name);
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${API_URL}/api/auth/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data.success) {
          if (data.stats.plan === "Basic" || data.stats.userLevel === "Bronze") {
            data.stats.credits = "∞";
          }
          setStats(data.stats);
        }
      } catch {
        /* noop */
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const prevLevel = localStorage.getItem("userLevel");
    if (stats.userLevel && prevLevel && stats.userLevel !== prevLevel) {
      const levels = ["Bronze", "Silver", "Gold", "Platinum"];
      if (levels.indexOf(stats.userLevel) > levels.indexOf(prevLevel)) {
        toast.success(`🎉 You reached ${stats.userLevel} Level!`, {
          position: "top-center",
          autoClose: 5000,
          theme: "dark",
        });
      }
    }
    if (stats.userLevel) localStorage.setItem("userLevel", stats.userLevel);
  }, [stats.userLevel]);

  const lvl = levelColors[stats.userLevel] || levelColors.Bronze;
  const currentPlanConfig = planBadges[plan] || planBadges.Basic;
  const PlanIcon = currentPlanConfig.icon;

  // Credits to display on Dashboard
  const displayCredits =
    plan === "Basic" ? "∞" : credits || stats.credits || "2,000";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <ToastContainer />

      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          padding: "32px 36px",
          background:
            plan === "Ultimate"
              ? "linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(124,58,237,0.1) 100%)"
              : plan === "Pro"
              ? "linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(6,182,212,0.1) 100%)"
              : "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(6,182,212,0.08) 100%)",
          border: `1px solid ${currentPlanConfig.border}`,
          borderRadius: 20,
          position: "relative",
          overflow: "hidden",
          boxShadow: `0 0 40px ${currentPlanConfig.bg}`,
        }}
      >
        {/* Background glow orb */}
        <div
          style={{
            position: "absolute",
            right: -60,
            top: -60,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(124,58,237,0.2),transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: "#c4b5fd",
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
            >
              {getGreeting()}, welcome back 👋
            </p>

            {/* Active Plan Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 14px",
                borderRadius: 999,
                background: currentPlanConfig.bg,
                border: `1px solid ${currentPlanConfig.border}`,
                fontSize: 12,
                fontWeight: 700,
                color: currentPlanConfig.color,
                letterSpacing: "0.04em",
              }}
            >
              <PlanIcon size={14} />
              <span>{currentPlanConfig.tag}</span>
            </div>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: 8,
            }}
          >
            Hello, <span className="gradient-text">{userName}</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
            Your AI-powered workspace is ready on the{" "}
            <strong style={{ color: currentPlanConfig.color }}>
              {currentPlanConfig.name}
            </strong>
            . What will you create today?
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
            <Link
              to="/app/text-generator"
              className="btn-primary"
              style={{
                display: "inline-flex",
                textDecoration: "none",
                fontSize: 14,
                padding: "10px 22px",
              }}
            >
              Start Creating <ArrowRight size={16} />
            </Link>

            <Link
              to="/app/billing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 18px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "white",
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 600,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
            >
              <CreditCard size={15} style={{ color: currentPlanConfig.color }} />
              <span>
                {plan === "Basic" ? "Upgrade Subscription" : "Manage Billing & Plan"}
              </span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row (4 Cards) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: 16,
        }}
      >
        {/* Plan Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          style={{
            padding: "24px 24px",
            background: "var(--bg-card)",
            border: `1px solid ${currentPlanConfig.border}`,
            borderRadius: 16,
            boxShadow: `0 0 20px ${currentPlanConfig.bg}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: currentPlanConfig.bg,
                  border: `1px solid ${currentPlanConfig.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: currentPlanConfig.color,
                }}
              >
                <Shield size={16} />
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                }}
              >
                Active Plan
              </span>
            </div>
          </div>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 28,
              fontWeight: 700,
              color: currentPlanConfig.color,
              lineHeight: 1.1,
            }}
          >
            {plan}
          </div>
          <div style={{ marginTop: 8 }}>
            <Link
              to="/app/billing"
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {plan === "Basic" ? "Upgrade plan →" : "View subscription →"}
            </Link>
          </div>
        </motion.div>

        {/* Credits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          style={{
            padding: "24px 24px",
            background: "var(--bg-card)",
            border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: 16,
            boxShadow: "0 0 20px rgba(124,58,237,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "rgba(124,58,237,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CreditCard size={15} style={{ color: "#c4b5fd" }} />
            </div>
            <span
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              Remaining Credits
            </span>
          </div>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 34,
              fontWeight: 700,
              color: "#c4b5fd",
              lineHeight: 1,
            }}
          >
            {displayCredits}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
            {plan === "Basic"
              ? "Unlimited free generation"
              : `Monthly pool (${credits})`}
          </p>
        </motion.div>

        {/* Today's Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          style={{
            padding: "24px 24px",
            background: "var(--bg-card)",
            border: "1px solid rgba(6,182,212,0.3)",
            borderRadius: 16,
            boxShadow: "0 0 20px rgba(6,182,212,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "rgba(6,182,212,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={15} style={{ color: "#67e8f9" }} />
            </div>
            <span
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              Today&apos;s Usage
            </span>
          </div>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 34,
              fontWeight: 700,
              color: "#67e8f9",
              lineHeight: 1,
            }}
          >
            {usageCount}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
            Prompts used this session
          </p>
        </motion.div>

        {/* User Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            padding: "24px 24px",
            background: "var(--bg-card)",
            border: `1px solid ${lvl.glow}`,
            borderRadius: 16,
            boxShadow: `0 0 20px ${lvl.glow}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: `${lvl.glow}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trophy size={15} style={{ color: lvl.color }} />
            </div>
            <span
              style={{
                fontSize: 12,
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              User Level
            </span>
          </div>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 34,
              fontWeight: 700,
              color: lvl.color,
              lineHeight: 1,
            }}
          >
            {stats.userLevel}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
            Keep using tools to level up
          </p>
        </motion.div>
      </div>

      {/* ── Plan Perks Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{
          padding: "20px 24px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 16,
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
              width: 38,
              height: 38,
              borderRadius: 10,
              background: currentPlanConfig.bg,
              border: `1px solid ${currentPlanConfig.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: currentPlanConfig.color,
            }}
          >
            <PlanIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>
              Active Tier Perks: {currentPlanConfig.name}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 14,
                marginTop: 6,
              }}
            >
              {currentPlanConfig.perks.map((p, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Check size={13} style={{ color: currentPlanConfig.color }} />
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Link
          to="/app/billing"
          style={{
            fontSize: 13,
            color: currentPlanConfig.color,
            fontWeight: 600,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 8,
            background: currentPlanConfig.bg,
            border: `1px solid ${currentPlanConfig.border}`,
          }}
        >
          <span>{plan === "Basic" ? "Upgrade to Pro" : "Change Plan"}</span>
          <ArrowRight size={14} />
        </Link>
      </motion.div>

      {/* ── Quick Tools ── */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            Quick Tools
          </h2>
          <Link
            to="/app/history"
            style={{
              fontSize: 13,
              color: "#c4b5fd",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            View History <ArrowRight size={13} />
          </Link>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 16,
          }}
        >
          {quickTools.map(
            ({ title, desc, icon: Icon, path, color, bg, border }, i) => (
              <motion.div
                key={path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                whileHover={{ y: -3 }}
              >
                <Link
                  to={path}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    padding: "24px",
                    background: bg,
                    border: `1px solid ${border}`,
                    borderRadius: 16,
                    textDecoration: "none",
                    color: "inherit",
                    transition: "box-shadow 0.25s ease",
                    height: "100%",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow = `0 0 28px ${border}`)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow = "none")
                  }
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color,
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: 16,
                        fontWeight: 600,
                        color: "white",
                        marginBottom: 6,
                      }}
                    >
                      {title}
                    </h3>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        lineHeight: 1.55,
                      }}
                    >
                      {desc}
                    </p>
                  </div>
                  <div
                    style={{
                      marginTop: "auto",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    Open Tool <ArrowRight size={14} />
                  </div>
                </Link>
              </motion.div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

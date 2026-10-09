import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, ArrowRight, Eye, EyeOff, Cpu, Sparkles, FileText, Zap, Globe, Sun, Moon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";
import { useTheme } from "../context/ThemeContext";

const features = [
  { icon: <Sparkles size={18} />, label: "AI Text Generator" },
  { icon: <FileText size={18} />, label: "Smart Summarizer" },
  { icon: <Zap size={18} />, label: "Image Generation" },
  { icon: <Globe size={18} />, label: "AI Translator" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "" });
  const navigate = useNavigate();
  const { theme, isDark, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.user?.userLevel) {
          localStorage.setItem("userLevel", data.user.userLevel);
          localStorage.setItem(`aisaas_celebrated_level_${data.user.id || data.user.email}`, data.user.userLevel);
        }
        if (data.user?.role === "admin") {
          navigate("/app/admin");
        } else {
          navigate("/app");
        }
      } else {
        if (data.message === "User does not exist") {
          setPopup({ show: true, message: "First need to register. Please sign up." });
        } else {
          setPopup({ show: true, message: data.message || "Login failed" });
        }
      }
    } catch (error) {
      setPopup({ show: true, message: "Network error. Please try again." });
    }

    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-deep)", fontFamily: "var(--font-body)", position: "relative" }}>
      <div className="mesh-bg" />

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        aria-label="Toggle theme"
        style={{
          position: "absolute", top: 20, right: 24, zIndex: 50,
          width: 38, height: 38, borderRadius: 10,
          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
          border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: isDark ? "#fcd34d" : "#7c3aed",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Sun size={17} />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Moon size={17} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* ── LEFT BRAND PANEL ── */}
      <div style={{
        flex: "0 0 45%", display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "60px 64px", position: "relative", zIndex: 1,
        borderRight: "1px solid rgba(255,255,255,0.07)",
        background: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(6,182,212,0.05) 100%)",
      }} className="auth-brand-panel">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 64 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Cpu size={20} color="white" />
          </div>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 700 }}>
            AI<span className="gradient-text">SaaS</span>
          </span>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 36, fontWeight: 700, lineHeight: 1.2, marginBottom: 16, letterSpacing: "-0.02em" }}>
            Your AI creative<br /><span className="gradient-text">suite awaits</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7, marginBottom: 40, maxWidth: 360 }}>
            Unlock the power of AI with a single login. Generate, translate, summarize, and create — all in one place.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {features.map(({ icon, label }, i) => (
              <motion.div key={label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
                <span style={{ color: "#c4b5fd" }}>{icon}</span>
                <span style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>{label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          style={{ marginTop: "auto", paddingTop: 40, fontSize: 13, color: "var(--text-muted)", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          "AISaaS completely transformed how I create content. I save 5+ hours every week."
          <br /><span style={{ color: "var(--text-secondary)", marginTop: 6, display: "block" }}>— Sarah K., Content Creator</span>
        </motion.p>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="auth-form-panel" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 48px", position: "relative", zIndex: 1 }}>
        <div className="auth-card-wrap">
          <div className="auth-card-glow" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="auth-card"
          >
            {/* Mobile logo (visible when left brand panel hidden on small screens) */}
            <Link to="/" className="auth-card-mobile-logo">
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Cpu size={18} color="white" />
              </div>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700 }}>
                AI<span className="gradient-text">SaaS</span>
              </span>
            </Link>

            {/* Card Icon Badge */}
            <div className="auth-card-icon-badge">
              <Lock size={20} />
            </div>

            <h1 className="auth-card-title">Welcome back</h1>
            <p className="auth-card-subtitle">Sign in to continue to your dashboard</p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Email */}
              <div className="auth-input-group">
                <label className="auth-input-label" style={{ marginBottom: 8 }}>Email address</label>
                <div className="auth-input-wrap">
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-premium"
                    style={{ paddingLeft: 42 }}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-input-group">
                <div className="auth-input-label-row">
                  <label className="auth-input-label">Password</label>
                  <Link to="#" style={{ fontSize: 12, color: "#c4b5fd", textDecoration: "none" }}>Forgot password?</Link>
                </div>
                <div className="auth-input-wrap">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-premium"
                    style={{ paddingLeft: 42, paddingRight: 44 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-password-toggle"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center", marginTop: 4, padding: "14px", fontSize: 15 }}
              >
                {loading ? "Signing in..." : "Sign In"} {!loading && <ArrowRight size={17} />}
              </motion.button>
            </form>

            <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 16 }}>
              <div className="glow-divider" style={{ flex: 1 }} />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>or</span>
              <div className="glow-divider" style={{ flex: 1 }} />
            </div>

            <div className="auth-card-footer">
              <p className="auth-card-footer-text">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="auth-card-footer-link">Create one free</Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Popup */}
      {popup.show && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 999 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ background: "#0f1629", border: "1px solid rgba(124,58,237,0.4)", borderRadius: 20, padding: "32px 36px", maxWidth: 360, width: "90%", textAlign: "center", boxShadow: "0 0 40px rgba(124,58,237,0.2)" }}>
            <p style={{ color: "var(--text-primary)", marginBottom: 24, lineHeight: 1.6 }}>{popup.message}</p>
            <button onClick={() => setPopup({ show: false, message: "" })} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
              OK
            </button>
          </motion.div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .auth-brand-panel { display: none; } }
      `}</style>
    </div>
  );
}

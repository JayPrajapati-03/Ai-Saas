import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, User, Eye, EyeOff, Cpu, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";

const perks = [
  "Unlimited AI text generation on free tier",
  "10 images generated daily at no cost",
  "Translation across 7+ languages",
  "Smart summarizer for any content",
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "", success: false });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setPopup({ show: true, message: "Registration successful! Please login.", success: true });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setPopup({ show: true, message: data.message || "Registration failed", success: false });
      }
    } catch (error) {
      setPopup({ show: true, message: "Network error. Please try again.", success: false });
    }

    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-deep)", fontFamily: "var(--font-body)" }}>
      <div className="mesh-bg" />

      {/* ── LEFT BRAND PANEL ── */}
      <div style={{
        flex: "0 0 45%", display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "60px 64px", position: "relative", zIndex: 1,
        borderRight: "1px solid rgba(255,255,255,0.07)",
        background: "linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(124,58,237,0.08) 100%)",
      }} className="auth-brand-panel">
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
            Start creating for<br /><span className="gradient-text">free today</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7, marginBottom: 40, maxWidth: 360 }}>
            Join over 10,000 creators who use AISaaS to generate content, images, and translations effortlessly.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {perks.map((perk, i) => (
              <motion.div key={perk} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "var(--text-primary)" }}>
                <CheckCircle2 size={17} style={{ color: "#6ee7b7", flexShrink: 0 }} />
                {perk}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          style={{ marginTop: "auto", paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[["10K+","Users"], ["500K+","Requests"], ["Free","Forever"]].map(([val, label]) => (
              <div key={label}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 700, color: "#c4b5fd" }}>{val}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="auth-form-panel" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 48px", position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ width: "100%", maxWidth: 420 }}
        >
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 30, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.01em" }}>Create your account</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>It&apos;s free — no credit card required</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Name */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>Full Name</label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="input-premium"
                  style={{ paddingLeft: 42 }}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>Email address</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
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
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8 }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="input-premium"
                  style={{ paddingLeft: 42, paddingRight: 44 }}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: 4 }}>
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
              style={{ width: "100%", justifyContent: "center", marginTop: 6, padding: "14px", fontSize: 15 }}
            >
              {loading ? "Creating account..." : "Create Free Account"} {!loading && <ArrowRight size={17} />}
            </motion.button>
          </form>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
            By creating an account, you agree to our{" "}
            <a href="#" style={{ color: "#c4b5fd", textDecoration: "none" }}>Terms of Service</a>
          </p>

          <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 16 }}>
            <div className="glow-divider" style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>or</span>
            <div className="glow-divider" style={{ flex: 1 }} />
          </div>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#c4b5fd", textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
          </p>
        </motion.div>
      </div>

      {/* Popup */}
      {popup.show && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 999 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{
              background: "#0f1629",
              border: `1px solid ${popup.success ? "rgba(16,185,129,0.4)" : "rgba(124,58,237,0.4)"}`,
              borderRadius: 20, padding: "32px 36px", maxWidth: 360, width: "90%", textAlign: "center",
              boxShadow: popup.success ? "0 0 40px rgba(16,185,129,0.15)" : "0 0 40px rgba(124,58,237,0.2)",
            }}>
            <p style={{ color: "var(--text-primary)", marginBottom: 24, lineHeight: 1.6 }}>{popup.message}</p>
            <button onClick={() => setPopup({ show: false, message: "", success: false })} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
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

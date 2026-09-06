import { motion, AnimatePresence } from "framer-motion";
import { ZapOff, CreditCard, ArrowRight, X, Sparkles, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUsage } from "../context/UsageContext";

export default function OutOfCreditsModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { plan = "Pro" } = useUsage() || {};

  if (!isOpen) return null;

  const handleGoToBilling = () => {
    onClose?.();
    navigate("/app/billing");
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(12px)",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 440,
            borderRadius: 22,
            background: "#0c1222",
            border: "1px solid rgba(245, 158, 11, 0.45)",
            boxShadow:
              "0 25px 60px rgba(0,0,0,0.85), 0 0 45px rgba(245, 158, 11, 0.2)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Top warning ribbon */}
          <div
            style={{
              padding: "20px 24px 16px",
              background: "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(239,68,68,0.12))",
              borderBottom: "1px solid rgba(245,158,11,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(245,158,11,0.25)",
                  border: "1px solid rgba(245,158,11,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fbbf24",
                  boxShadow: "0 0 20px rgba(245,158,11,0.3)",
                }}
              >
                <ZapOff size={22} />
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  Out of Credits!
                </h3>
                <p style={{ fontSize: 12, color: "#fbbf24", fontWeight: 500 }}>
                  0 Credits Remaining on {plan} Plan
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "white";
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Modal Content */}
          <div style={{ padding: "22px 24px" }}>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              You have exhausted all your generation credits. To continue using the{" "}
              <strong style={{ color: "white" }}>Text Generator</strong>,{" "}
              <strong style={{ color: "white" }}>Summarizer</strong>, and{" "}
              <strong style={{ color: "white" }}>Image Generator</strong>, please
              purchase additional credits or renew your subscription.
            </p>

            {/* Quick Balance Status Box */}
            <div
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CreditCard size={18} style={{ color: "var(--text-muted)" }} />
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  Current Balance
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#ef4444",
                }}
              >
                0 Credits
              </span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                type="button"
                onClick={handleGoToBilling}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 14,
                  color: "white",
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(245,158,11,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.92")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <Sparkles size={16} />
                <span>Go to Billing & Purchase Credits</span>
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  width: "100%",
                  padding: "11px",
                  borderRadius: 12,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

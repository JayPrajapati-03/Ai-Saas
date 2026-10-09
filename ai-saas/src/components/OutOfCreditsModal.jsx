import { motion, AnimatePresence } from "framer-motion";
import { ZapOff, CreditCard, ArrowRight, X, Sparkles, Clock, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUsage } from "../context/UsageContext";
import { useState, useEffect } from "react";

function useCountdown(resetAt) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!resetAt) {
      setTimeLeft(null);
      return;
    }

    const target = new Date(resetAt).getTime();

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0, done: true });
      } else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft({ h, m, s, done: false });
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resetAt]);

  return timeLeft;
}

export default function OutOfCreditsModal({ isOpen, onClose, freeCreditsResetAt, toolName }) {
  const navigate = useNavigate();
  const { plan = "Basic" } = useUsage() || {};
  const countdown = useCountdown(freeCreditsResetAt);

  if (!isOpen) return null;

  const isBasic = plan === "Basic";

  const handleGoToBilling = () => {
    onClose?.();
    navigate("/app/billing", { state: { from: window.location.pathname } });
  };

  const pad = (n) => String(n).padStart(2, "0");

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
          background: "rgba(0, 0, 0, 0.85)",
          backdropFilter: "blur(14px)",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 24 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 460,
            borderRadius: 24,
            background: "#0a0f1e",
            border: `1px solid ${isBasic ? "rgba(99,102,241,0.45)" : "rgba(245,158,11,0.45)"}`,
            boxShadow: isBasic
              ? "0 25px 60px rgba(0,0,0,0.9), 0 0 50px rgba(99,102,241,0.2)"
              : "0 25px 60px rgba(0,0,0,0.9), 0 0 50px rgba(245,158,11,0.2)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Header ribbon */}
          <div
            style={{
              padding: "20px 24px 18px",
              background: isBasic
                ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.12))"
                : "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(239,68,68,0.12))",
              borderBottom: `1px solid ${isBasic ? "rgba(99,102,241,0.25)" : "rgba(245,158,11,0.25)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 13,
                  background: isBasic ? "rgba(99,102,241,0.25)" : "rgba(245,158,11,0.25)",
                  border: `1px solid ${isBasic ? "rgba(99,102,241,0.5)" : "rgba(245,158,11,0.5)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isBasic ? "#818cf8" : "#fbbf24",
                  boxShadow: isBasic ? "0 0 20px rgba(99,102,241,0.3)" : "0 0 20px rgba(245,158,11,0.3)",
                }}
              >
                {isBasic ? <Clock size={22} /> : <ZapOff size={22} />}
              </div>
              <div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 700, color: "white", marginBottom: 2 }}>
                  {isBasic ? `${toolName ? `${toolName} ` : "Daily "}Credits Used Up!` : "Out of Credits!"}
                </h3>
                <p style={{ fontSize: 12, color: isBasic ? "#818cf8" : "#fbbf24", fontWeight: 500 }}>
                  {isBasic ? `Daily allowance for ${toolName || "this tool"} is exhausted` : `0 Credits Remaining on ${plan} Plan`}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--text-muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "24px 24px 20px" }}>
            {isBasic ? (
              <>
                {/* Message */}
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65, marginBottom: 20 }}>
                  You've used all daily credits for <strong style={{ color: "white" }}>{toolName || "this tool"}</strong>.
                  Your credits for this tool will <strong style={{ color: "#818cf8" }}>automatically renew</strong> 24 hours from when they ran out.
                  {toolName && (
                    <span style={{ display: "block", marginTop: 8, fontSize: 13, color: "#94a3b8" }}>
                      💡 You can still use other AI tools if they have remaining daily credits!
                    </span>
                  )}
                </p>

                {/* Live countdown */}
                {countdown && !countdown.done && (
                  <div
                    style={{
                      padding: "18px 20px",
                      borderRadius: 16,
                      background: "rgba(99,102,241,0.08)",
                      border: "1px solid rgba(99,102,241,0.25)",
                      marginBottom: 20,
                      textAlign: "center",
                    }}
                  >
                    <p style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                      Credits renew in
                    </p>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                      {[{ label: "HRS", val: countdown.h }, { label: "MIN", val: countdown.m }, { label: "SEC", val: countdown.s }].map(({ label, val }, i) => (
                        <div key={label}>
                          {i > 0 && <span style={{ color: "#818cf8", fontWeight: 700, fontSize: 24, marginRight: 8 }}>:</span>}
                          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
                            <span style={{
                              fontFamily: "var(--font-heading)",
                              fontSize: 34,
                              fontWeight: 800,
                              color: "white",
                              lineHeight: 1,
                              letterSpacing: "-1px",
                            }}>
                              {pad(val)}
                            </span>
                            <span style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, letterSpacing: "0.1em" }}>{label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {countdown?.done && (
                  <div style={{ padding: "14px", borderRadius: 12, background: "rgba(110,231,183,0.1)", border: "1px solid rgba(110,231,183,0.3)", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                    <RefreshCw size={16} style={{ color: "#6ee7b7" }} />
                    <span style={{ fontSize: 13, color: "#6ee7b7", fontWeight: 600 }}>Your credits have renewed! Close and try again.</span>
                  </div>
                )}

                {!freeCreditsResetAt && (
                  <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                    <Clock size={16} style={{ color: "var(--text-muted)" }} />
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Credits will renew 24 hours after your last use.</span>
                  </div>
                )}

                {/* Upgrade nudge */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button
                    type="button"
                    onClick={handleGoToBilling}
                    style={{
                      width: "100%", padding: "13px", borderRadius: 12, fontWeight: 700, fontSize: 14,
                      color: "white", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    <Sparkles size={16} />
                    <span>Upgrade for Unlimited Credits</span>
                    <ArrowRight size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      width: "100%", padding: "11px", borderRadius: 12,
                      background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                      color: "var(--text-secondary)", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; }}
                  >
                    I'll wait for renewal
                  </button>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>
                  You have exhausted all your generation credits. To continue using the{" "}
                  <strong style={{ color: "white" }}>Text Generator</strong>,{" "}
                  <strong style={{ color: "white" }}>Summarizer</strong>,{" "}
                  <strong style={{ color: "white" }}>Translator</strong>, and{" "}
                  <strong style={{ color: "white" }}>Image Generator</strong>, please
                  purchase additional credits or renew your subscription.
                </p>

                <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <CreditCard size={18} style={{ color: "var(--text-muted)" }} />
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Current Balance</span>
                  </div>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 800, color: "#ef4444" }}>0 Credits</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button
                    type="button"
                    onClick={handleGoToBilling}
                    style={{
                      width: "100%", padding: "13px", borderRadius: 12, fontWeight: 700, fontSize: 14,
                      color: "white", background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(245,158,11,0.35)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "opacity 0.2s",
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
                      width: "100%", padding: "11px", borderRadius: 12,
                      background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                      color: "var(--text-secondary)", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; }}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, FileText, Copy, Check, ArrowRight } from "lucide-react";
import { useUsage } from "../context/UsageContext";
import { API_URL } from "../config/api";

export default function Summarizer() {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading]     = useState(false);
  const [summary, setSummary]     = useState("");
  const [copied, setCopied]       = useState(false);
  const {
    plan = "Basic",
    credits = "Unlimited credits",
    rawCredits = 120,
    consumeCredits,
    updateCreditsFromServer,
    openOutOfCreditsModal,
  } = useUsage() || {};

  const handleSummarize = async () => {
    if (!inputText.trim()) return;

    if (plan !== "Basic" && (rawCredits < 5 || rawCredits <= 0)) {
      openOutOfCreditsModal?.();
      setSummary("⚠️ You are out of credits. Please recharge credits on the Billing page.");
      return;
    }

    setLoading(true);
    setSummary("");

    try {
      const token = localStorage.getItem("token");
      if (!token) { setSummary("Please login to use this feature."); setLoading(false); return; }

      const res = await fetch(`${API_URL}/api/ai/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      if (res.ok) {
        setSummary(data.summary);
        consumeCredits?.(5);
        if (typeof data.remainingCredits === "number") {
          updateCreditsFromServer?.(data.remainingCredits);
        }
      } else {
        if (data.outOfCredits || res.status === 403) {
          openOutOfCreditsModal?.();
        }
        setSummary(`Error: ${data.message || "Failed to summarize"}`);
      }
    } catch { setSummary("Network error. Please try again."); }

    setLoading(false);
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = (text) => text.trim() ? text.trim().split(/\s+/).length : 0;
  const compressionRatio = summary && inputText
    ? Math.round((1 - wordCount(summary) / wordCount(inputText)) * 100)
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={22} style={{ color: "#6ee7b7" }} />
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em" }}>
              AI <span style={{ background: "linear-gradient(135deg,#6ee7b7,#67e8f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Summarizer</span>
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>Condense any content into crisp, meaningful summaries</p>
          </div>
        </div>

        {/* Credit Cost Badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 12, color: "var(--text-secondary)"
        }}>
          <span style={{ color: plan === "Basic" ? "#6ee7b7" : "#c4b5fd", fontWeight: 600 }}>
            {plan === "Basic" ? "🌱 Unlimited Free Summaries" : `⚡ 5 credits / summary`}
          </span>
          {plan !== "Basic" && (
            <span style={{ color: "var(--text-muted)" }}>
              • Balance: <strong style={{ color: "white" }}>{credits}</strong>
            </span>
          )}
        </div>
      </motion.div>

      {/* Stats row */}
      {(inputText || summary) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { label: "Input Words", value: wordCount(inputText), color: "#67e8f9" },
            { label: "Output Words", value: wordCount(summary), color: "#6ee7b7" },
            ...(compressionRatio !== null ? [{ label: "Compressed By", value: `${compressionRatio}%`, color: "#c4b5fd" }] : []),
          ].map(({ label, value, color }) => (
            <div key={label} style={{ padding: "10px 18px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13 }}>
              <span style={{ color: "var(--text-muted)" }}>{label}: </span>
              <span style={{ color, fontWeight: 700, fontFamily: "var(--font-heading)" }}>{value}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Two-panel layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 0, alignItems: "stretch" }}>

        {/* Input Panel */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          style={{ padding: "24px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px 0 0 16px", display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.04em" }}>ORIGINAL TEXT</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste or type your lengthy text here — articles, reports, documentation, or any content you want condensed..."
            className="textarea-premium"
            style={{ flex: 1, minHeight: 280 }}
          />
          <button onClick={handleSummarize} disabled={loading || !inputText.trim()} className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
            {loading ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Summarizing...</>
                     : <><ArrowRight size={18} /> Summarize</>}
          </button>
        </motion.div>

        {/* Divider Arrow */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 2px", background: "rgba(255,255,255,0.03)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: loading ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
            {loading ? <Loader2 size={16} style={{ color: "#c4b5fd", animation: "spin 1s linear infinite" }} /> : <ArrowRight size={16} style={{ color: "var(--text-muted)" }} />}
          </div>
        </div>

        {/* Output Panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          style={{ padding: "24px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "0 16px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#6ee7b7", letterSpacing: "0.04em" }}>SUMMARY</label>
            {summary && (
              <button onClick={handleCopy}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "5px 12px",
                  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: "1px solid", transition: "all 0.2s",
                  ...(copied
                    ? { background: "rgba(16,185,129,0.15)", borderColor: "rgba(16,185,129,0.4)", color: "#6ee7b7" }
                    : { background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-secondary)" }),
                }}>
                {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
              </button>
            )}
          </div>
          <div style={{
            flex: 1, minHeight: 280, padding: "16px", borderRadius: 12,
            background: "rgba(0,0,0,0.2)", border: "1px solid rgba(16,185,129,0.15)",
            color: loading ? "var(--text-muted)" : "var(--text-primary)",
            fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap",
            fontStyle: loading ? "italic" : "normal",
          }}>
            {loading ? "✨ Summarizing your content..." : summary || "Your summary will appear here after summarizing."}
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .summarizer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

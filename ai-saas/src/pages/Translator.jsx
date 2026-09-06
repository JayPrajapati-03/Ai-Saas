import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowRightLeft, Globe, Copy, Check } from "lucide-react";
import { useUsage } from "../context/UsageContext";
import { API_URL } from "../config/api";

const languages = [
  { code: "en", name: "English",  flag: "🇺🇸" },
  { code: "hi", name: "Hindi",    flag: "🇮🇳" },
  { code: "es", name: "Spanish",  flag: "🇪🇸" },
  { code: "fr", name: "French",   flag: "🇫🇷" },
  { code: "de", name: "German",   flag: "🇩🇪" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "zh", name: "Chinese",  flag: "🇨🇳" },
];

function LangSelect({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{
        padding: "10px 14px", borderRadius: 10, fontSize: 14, fontWeight: 500,
        background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
        color: "white", outline: "none", cursor: "pointer", width: "100%",
        fontFamily: "var(--font-body)",
      }}>
      {languages.map(l => (
        <option key={l.code} value={l.code} style={{ background: "#0f1629" }}>
          {l.flag} {l.name}
        </option>
      ))}
    </select>
  );
}

export default function Translator() {
  const [inputText, setInputText]   = useState("");
  const [fromLang, setFromLang]     = useState("en");
  const [toLang, setToLang]         = useState("hi");
  const [loading, setLoading]       = useState(false);
  const [outputText, setOutputText] = useState("");
  const [copied, setCopied]         = useState(false);
  const {
    plan = "Basic",
    credits = "Unlimited credits",
    rawCredits = 120,
    consumeCredits,
    updateCreditsFromServer,
    openOutOfCreditsModal,
  } = useUsage() || {};

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    if (plan !== "Basic" && (rawCredits < 5 || rawCredits <= 0)) {
      openOutOfCreditsModal?.();
      setOutputText("⚠️ You are out of credits. Please recharge credits on the Billing page.");
      return;
    }

    setLoading(true); setOutputText("");

    try {
      const token = localStorage.getItem("token");
      if (!token) { setOutputText("Please login to use this feature."); setLoading(false); return; }

      const targetLangName = languages.find(l => l.code === toLang)?.name || toLang;
      const res = await fetch(`${API_URL}/api/ai/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: inputText, targetLanguage: targetLangName }),
      });
      const data = await res.json();
      if (data.success) {
        setOutputText(data.translated);
        consumeCredits?.(5);
        if (typeof data.remainingCredits === "number") {
          updateCreditsFromServer?.(data.remainingCredits);
        }
      } else {
        if (data.outOfCredits || res.status === 403) {
          openOutOfCreditsModal?.();
        }
        setOutputText(`Error: ${data.message || "Failed to translate"}`);
      }
    } catch { setOutputText("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const swapLanguages = () => {
    const prevFrom = fromLang;
    setFromLang(toLang);
    setToLang(prevFrom);
    setInputText(outputText);
    setOutputText(inputText);
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fromLangData = languages.find(l => l.code === fromLang);
  const toLangData   = languages.find(l => l.code === toLang);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Globe size={22} style={{ color: "#fcd34d" }} />
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em" }}>
              AI <span style={{ background: "linear-gradient(135deg,#fcd34d,#fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Translator</span>
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>Translate text across 7+ languages with AI precision</p>
          </div>
        </div>

        {/* Credit Cost Badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 12, color: "var(--text-secondary)"
        }}>
          <span style={{ color: plan === "Basic" ? "#6ee7b7" : "#fcd34d", fontWeight: 600 }}>
            {plan === "Basic" ? "🌱 Unlimited Free Translations" : `⚡ 5 credits / translation`}
          </span>
          {plan !== "Basic" && (
            <span style={{ color: "var(--text-muted)" }}>
              • Balance: <strong style={{ color: "white" }}>{credits}</strong>
            </span>
          )}
        </div>
      </motion.div>

      {/* Language Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ padding: "20px 24px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: 8 }}>FROM</label>
          <LangSelect value={fromLang} onChange={setFromLang} />
        </div>

        {/* Swap button */}
        <div style={{ paddingTop: 18, flexShrink: 0 }}>
          <motion.button
            onClick={swapLanguages}
            whileTap={{ rotate: 180 }}
            whileHover={{ scale: 1.08 }}
            style={{
              width: 42, height: 42, borderRadius: 12, cursor: "pointer",
              background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fcd34d", transition: "all 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(245,158,11,0.22)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(245,158,11,0.12)"}
          >
            <ArrowRightLeft size={18} />
          </motion.button>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: 8 }}>TO</label>
          <LangSelect value={toLang} onChange={setToLang} />
        </div>
      </motion.div>

      {/* Translation panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Input */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          style={{ padding: "20px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
              {fromLangData?.flag} {fromLangData?.name}
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{inputText.length} chars</span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Type in ${fromLangData?.name}...`}
            className="textarea-premium"
            style={{ flex: 1, minHeight: 200 }}
          />
          <button onClick={handleTranslate} disabled={loading || !inputText.trim()} className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
              background: "linear-gradient(135deg,#d97706,#b45309)" }}>
            {loading ? <><Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> Translating...</>
                     : <><ArrowRightLeft size={17} /> Translate</>}
          </button>
        </motion.div>

        {/* Output */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          style={{ padding: "20px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fcd34d" }}>
              {toLangData?.flag} {toLangData?.name}
            </span>
            {outputText && !loading && (
              <button onClick={handleCopy}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "4px 12px",
                  borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: "1px solid", transition: "all 0.2s",
                  ...(copied
                    ? { background: "rgba(16,185,129,0.15)", borderColor: "rgba(16,185,129,0.4)", color: "#6ee7b7" }
                    : { background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-secondary)" }),
                }}>
                {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
              </button>
            )}
          </div>
          <div style={{
            flex: 1, minHeight: 200, padding: "14px", borderRadius: 12,
            background: "rgba(0,0,0,0.2)", border: "1px solid rgba(245,158,11,0.15)",
            color: loading ? "var(--text-muted)" : "var(--text-primary)",
            fontSize: 15, lineHeight: 1.7, whiteSpace: "pre-wrap",
            fontStyle: loading ? "italic" : "normal",
          }}>
            {loading ? "✨ Translating..." : outputText || "Translation will appear here..."}
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .translator-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

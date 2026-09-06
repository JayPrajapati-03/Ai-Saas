import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Copy, Check, Wand2 } from "lucide-react";
import { useUsage } from "../context/UsageContext";
import { API_URL } from "../config/api";

const TONES = [
  { label: "Professional", emoji: "💼" },
  { label: "Creative",     emoji: "🎨" },
  { label: "Casual",       emoji: "😊" },
  { label: "Formal",       emoji: "🎓" },
  { label: "Persuasive",   emoji: "🔥" },
];

export default function TextGenerator() {
  const [prompt, setPrompt]   = useState("");
  const [tone, setTone]       = useState("Professional");
  const [loading, setLoading] = useState(false);
  const [output, setOutput]   = useState("");
  const [copied, setCopied]   = useState(false);
  const { incrementUsage } = useUsage();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setOutput("");

    try {
      const token = localStorage.getItem("token");
      if (!token) { setOutput("Please login to use this feature."); setLoading(false); return; }

      const res = await fetch(`${API_URL}/api/ai/generate-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt: `[Tone: ${tone}] ${prompt}` }),
      });
      const data = await res.json();
      if (res.ok) { setOutput(data.output); incrementUsage(); }
      else setOutput(`Error: ${data.message || "Failed to generate text"}`);
    } catch { setOutput("Network error. Please try again."); }

    setLoading(false);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sparkles size={22} style={{ color: "#c4b5fd" }} />
        </div>
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Text <span className="gradient-text">Generator</span>
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>Generate any content with AI in seconds</p>
        </div>
      </motion.div>

      {/* Tone Selector */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ padding: "20px 24px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12, letterSpacing: "0.04em" }}>WRITING TONE</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {TONES.map(({ label, emoji }) => (
            <button key={label} onClick={() => setTone(label)}
              style={{
                padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer",
                transition: "all 0.2s", border: "1px solid",
                ...(tone === label
                  ? { background: "rgba(124,58,237,0.2)", borderColor: "rgba(124,58,237,0.5)", color: "#c4b5fd", boxShadow: "0 0 12px rgba(124,58,237,0.2)" }
                  : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-secondary)" }),
              }}
              onMouseEnter={e => { if (tone !== label) { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "white"; }}}
              onMouseLeave={e => { if (tone !== label) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text-secondary)"; }}}
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Prompt Input */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ padding: "24px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.04em" }}>YOUR PROMPT</label>
          <span style={{ fontSize: 12, color: prompt.length > 900 ? "#fca5a5" : "var(--text-muted)" }}>{prompt.length} / 1000</span>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, 1000))}
          placeholder="Describe what you want the AI to write... e.g. 'Write a product description for wireless headphones targeting Gen Z'"
          className="textarea-premium"
          style={{ height: 160, marginBottom: 16 }}
        />
        <button onClick={handleGenerate} disabled={loading || !prompt.trim()} className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {loading ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Generating...</>
                   : <><Wand2 size={18} /> Generate Text</>}
        </button>
      </motion.div>

      {/* Output */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ padding: "24px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.04em" }}>AI OUTPUT</label>
            {output && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={handleCopy}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "6px 14px",
                  borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: "1px solid", transition: "all 0.2s",
                  ...(copied
                    ? { background: "rgba(16,185,129,0.15)", borderColor: "rgba(16,185,129,0.4)", color: "#6ee7b7" }
                    : { background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-secondary)" }),
                }}>
                {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
              </motion.button>
            )}
          </div>
          <div style={{
            minHeight: 140, padding: "16px", borderRadius: 12,
            background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)",
            color: loading ? "var(--text-muted)" : "var(--text-primary)",
            fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap",
            fontStyle: loading ? "italic" : "normal",
          }}>
            {loading ? "✨ AI is generating your content..." : output || "Your AI-generated text will appear here. Enter a prompt and click Generate."}
          </div>
          {output && !loading && (
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)" }}>
              {output.split(/\s+/).filter(Boolean).length} words · {output.length} characters
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

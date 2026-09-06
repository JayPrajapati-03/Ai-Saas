import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, Sparkles, AlertCircle, ImageIcon, Maximize2 } from "lucide-react";
import { useUsage } from "../context/UsageContext";
import { API_URL } from "../config/api";

const STYLE_CHIPS = [
  { label: "Photorealistic", emoji: "📷" },
  { label: "Digital Art",    emoji: "🎨" },
  { label: "Anime",          emoji: "🌸" },
  { label: "Oil Painting",   emoji: "🖼️" },
  { label: "Cinematic",      emoji: "🎬" },
  { label: "Pixel Art",      emoji: "🕹️" },
];

const SIZE_OPTIONS = [
  { value: "256x256",   label: "256×256",   sub: "Fast" },
  { value: "512x512",   label: "512×512",   sub: "Standard" },
  { value: "1024x1024", label: "1024×1024", sub: "HD" },
];

export default function ImageGenerator() {
  const [prompt, setPrompt]         = useState("");
  const [artStyle, setArtStyle]     = useState("Photorealistic");
  const [size, setSize]             = useState("512x512");
  const [loading, setLoading]       = useState(false);
  const [loadingSecs, setLoadingSecs] = useState(0);
  const [imageUrl, setImageUrl]     = useState("");
  const [error, setError]           = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const { incrementUsage } = useUsage();

  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingSecs(0);
      interval = setInterval(() => setLoadingSecs(p => p + 1), 1000);
    } else setLoadingSecs(0);
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setError(""); setImageUrl("");
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 35000);

    try {
      const token = localStorage.getItem("token");
      if (!token) { setError("Please log in to generate images."); setLoading(false); clearTimeout(tid); return; }

      const fullPrompt = `${artStyle} style: ${prompt}`;
      const res = await fetch(`${API_URL}/api/image/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt: fullPrompt, size }),
        signal: controller.signal,
      });
      clearTimeout(tid);
      const data = await res.json();
      if (res.ok && data.success && data.image) { setImageUrl(data.image); incrementUsage(); }
      else setError(data.message || "Failed to generate image. Please try again.");
    } catch (err) {
      clearTimeout(tid);
      if (err.name === "AbortError") setError("Generation took too long. Please try again.");
      else setError("Network error. Unable to connect to the server.");
    } finally { setLoading(false); }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      if (imageUrl.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = imageUrl; link.download = `ai-image-${Date.now()}.jpg`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
      } else {
        const blob = await (await fetch(imageUrl)).blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url; link.download = `ai-image-${Date.now()}.jpg`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch { window.open(imageUrl, "_blank"); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(236,72,153,0.15)", border: "1px solid rgba(236,72,153,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ImageIcon size={22} style={{ color: "#f9a8d4" }} />
        </div>
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Image <span style={{ background: "linear-gradient(135deg,#f9a8d4,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Generator</span>
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>Create stunning AI images from text descriptions</p>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ padding: "24px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Art Style */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.04em", marginBottom: 12 }}>ART STYLE</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {STYLE_CHIPS.map(({ label, emoji }) => (
              <button key={label} onClick={() => setArtStyle(label)}
                style={{
                  padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s", border: "1px solid",
                  ...(artStyle === label
                    ? { background: "rgba(236,72,153,0.2)", borderColor: "rgba(236,72,153,0.5)", color: "#f9a8d4", boxShadow: "0 0 12px rgba(236,72,153,0.2)" }
                    : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-secondary)" }),
                }}
                onMouseEnter={e => { if (artStyle !== label) { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "white"; }}}
                onMouseLeave={e => { if (artStyle !== label) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text-secondary)"; }}}
              >
                {emoji} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Image Size */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.04em", marginBottom: 12 }}>IMAGE SIZE</label>
          <div style={{ display: "flex", gap: 10 }}>
            {SIZE_OPTIONS.map(({ value, label, sub }) => (
              <button key={value} onClick={() => { setSize(value); setError(""); }}
                style={{
                  flex: 1, padding: "12px", borderRadius: 12, cursor: "pointer", transition: "all 0.2s", border: "1px solid", textAlign: "center",
                  ...(size === value
                    ? { background: "rgba(124,58,237,0.2)", borderColor: "rgba(124,58,237,0.5)", boxShadow: "0 0 12px rgba(124,58,237,0.2)" }
                    : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }),
                }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: size === value ? "#c4b5fd" : "var(--text-primary)" }}>{label}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.04em", marginBottom: 12 }}>IMAGE DESCRIPTION</label>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleGenerate(); }}
            placeholder="Describe your image... e.g. 'sunset over futuristic cityscape, neon lights reflecting on wet streets'"
            className="input-premium"
            style={{ marginBottom: 16 }}
          />
          <button onClick={handleGenerate} disabled={loading || !prompt.trim()} className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {loading ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Generating ({loadingSecs}s)...</>
                     : <><Sparkles size={18} /> Generate Image</>}
          </button>
        </div>
      </motion.div>

      {/* Output */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ padding: "24px", background: "rgba(236,72,153,0.05)", border: "1px solid rgba(236,72,153,0.2)", borderRadius: 16 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#f9a8d4", letterSpacing: "0.04em", marginBottom: 16 }}>GENERATED IMAGE</label>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ marginBottom: 16, padding: "14px 16px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fca5a5", fontSize: 14 }}>
              <AlertCircle size={17} style={{ flexShrink: 0 }} /> {error}
            </div>
            <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#fca5a5", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
          </motion.div>
        )}

        <div style={{ minHeight: 300, borderRadius: 14, background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 40 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(236,72,153,0.15)", border: "2px solid rgba(236,72,153,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Loader2 size={28} style={{ color: "#f9a8d4", animation: "spin 1s linear infinite" }} />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: 4 }}>Generating your image ({loadingSecs}s)</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {loadingSecs < 8 ? "Usually takes 3-8 seconds..." : "Adding fine details, almost done..."}
                </div>
              </div>
              <div style={{ width: 200, height: 4, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div className="shimmer" style={{ height: "100%", borderRadius: 4 }} />
              </div>
            </div>
          ) : imageUrl ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%", padding: 20 }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <motion.img
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  src={imageUrl}
                  alt={prompt}
                  style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", maxWidth: "100%", maxHeight: 480, objectFit: "contain", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
                  onError={() => { setError("Failed to render the image. Please try again."); setImageUrl(""); }}
                />
                <button onClick={() => setFullscreen(true)}
                  style={{ position: "absolute", top: 10, right: 10, width: 34, height: 34, borderRadius: 9, background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.85)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.6)"}>
                  <Maximize2 size={15} />
                </button>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleDownload} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", fontSize: 14 }}>
                  <Download size={16} /> Download
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
              <ImageIcon size={52} style={{ marginBottom: 12, opacity: 0.25 }} />
              <p style={{ fontSize: 14 }}>Your generated image will appear here</p>
              <p style={{ fontSize: 12, marginTop: 6, opacity: 0.7 }}>Enter a description and click "Generate Image"</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {fullscreen && imageUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setFullscreen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, cursor: "zoom-out" }}>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              src={imageUrl} alt={prompt}
              style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: 12, boxShadow: "0 0 60px rgba(0,0,0,0.8)" }} />
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

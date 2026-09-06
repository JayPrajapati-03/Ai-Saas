import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  ArrowRight, Sparkles, Zap, Shield, Brain, Globe, FileText,
  Star, CheckCircle2, Users, TrendingUp, ChevronRight, Cpu,
} from "lucide-react";
import { Link } from "react-router-dom";

/* ── Animated counter ── */
function Counter({ to, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = to;
    const step = Math.ceil(end / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 18);
    return () => clearInterval(timer);
  }, [inView, to]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ── Feature card ── */
function FeatureCard({ icon, title, desc, color, delay }) {
  const colorMap = {
    violet: { bg: "rgba(124,58,237,0.1)", border: "rgba(124,58,237,0.3)", iconBg: "rgba(124,58,237,0.2)", text: "#c4b5fd" },
    cyan:   { bg: "rgba(6,182,212,0.1)",  border: "rgba(6,182,212,0.3)",  iconBg: "rgba(6,182,212,0.2)",  text: "#67e8f9" },
    pink:   { bg: "rgba(236,72,153,0.1)", border: "rgba(236,72,153,0.3)", iconBg: "rgba(236,72,153,0.2)", text: "#f9a8d4" },
    amber:  { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", iconBg: "rgba(245,158,11,0.2)", text: "#fcd34d" },
    emerald:{ bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)", iconBg: "rgba(16,185,129,0.2)", text: "#6ee7b7" },
    blue:   { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)", iconBg: "rgba(59,130,246,0.2)", text: "#93c5fd" },
  };
  const c = colorMap[color] || colorMap.violet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 16,
        padding: "28px",
        cursor: "default",
        transition: "box-shadow 0.25s ease",
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 30px ${c.border}`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ width: 48, height: 48, borderRadius: 12, background: c.iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: c.text, marginBottom: 16 }}>
        {icon}
      </div>
      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65 }}>{desc}</p>
    </motion.div>
  );
}

/* ── Pricing Card ── */
function PricingCard({ plan, price, desc, features, popular, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      style={{
        background: popular ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.04)",
        border: popular ? "1px solid rgba(124,58,237,0.55)" : "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: "32px",
        position: "relative",
        boxShadow: popular ? "0 0 40px rgba(124,58,237,0.2)" : "none",
      }}
    >
      {popular && (
        <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)" }}>
          <span style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)", color: "white", fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 999, letterSpacing: "0.06em" }}>
            MOST POPULAR
          </span>
        </div>
      )}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: popular ? "#c4b5fd" : "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{plan}</span>
      </div>
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 42, fontWeight: 700, color: "white", lineHeight: 1 }}>
        {price}
        {price !== "Free" && <span style={{ fontSize: 16, color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontWeight: 400 }}>/mo</span>}
      </div>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8, marginBottom: 24 }}>{desc}</p>
      <div className="glow-divider" style={{ marginBottom: 24 }} />
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--text-primary)" }}>
            <CheckCircle2 size={16} style={{ color: popular ? "#c4b5fd" : "#6ee7b7", flexShrink: 0 }} />
            {f}
          </li>
        ))}
      </ul>
      <Link
        to="/register"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          marginTop: 28, padding: "13px 0", borderRadius: 12, fontWeight: 600, fontSize: 14,
          background: popular ? "linear-gradient(135deg,#7c3aed,#0891b2)" : "rgba(255,255,255,0.07)",
          color: "white", textDecoration: "none",
          border: popular ? "none" : "1px solid rgba(255,255,255,0.12)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        Get started <ChevronRight size={16} />
      </Link>
    </motion.div>
  );
}

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-deep)", color: "var(--text-primary)", overflowX: "hidden" }}>
      {/* Animated mesh background */}
      <div className="mesh-bg" />
      <div className="mesh-orb-3" />

      {/* ── NAVBAR ── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: "sticky", top: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 48px",
          background: "rgba(3,7,18,0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Cpu size={18} color="white" />
          </div>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700, color: "white" }}>
            AI<span className="gradient-text">SaaS</span>
          </span>
          <span className="badge badge-violet" style={{ marginLeft: 4 }}>Beta</span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Features", "Pricing", "About"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{ fontSize: 14, color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "white"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}>
              {item}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/login" style={{ fontSize: 14, color: "var(--text-secondary)", textDecoration: "none", padding: "9px 18px", borderRadius: 10, transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "white"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}>
            Login
          </Link>
          <Link to="/register" className="btn-primary" style={{ fontSize: 14, padding: "9px 22px", textDecoration: "none" }}>
            Start Free <ArrowRight size={15} />
          </Link>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section style={{ padding: "100px 48px 80px", textAlign: "center", maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 999, padding: "6px 16px", marginBottom: 32 }}>
            <Star size={13} style={{ color: "#c4b5fd" }} />
            <span style={{ fontSize: 12, color: "#c4b5fd", fontWeight: 600, letterSpacing: "0.04em" }}>AI-POWERED TOOLS FOR CREATORS</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(42px, 7vw, 76px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.02em", margin: "0 0 24px" }}
        >
          Build Smarter With{" "}
          <span className="gradient-text">AI-Powered</span>
          <br />Tools That Deliver
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          style={{ fontSize: 18, color: "var(--text-secondary)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}
        >
          Generate content, summarize text, create stunning images, translate languages — all in one unified AI platform designed for modern creators.
        </motion.p>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.5 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <Link to="/register" className="btn-primary" style={{ textDecoration: "none", fontSize: 16, padding: "14px 32px" }}>
            Get Started Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-ghost" style={{ textDecoration: "none", fontSize: 15 }}>
            Sign In
          </Link>
        </motion.div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28, marginTop: 48, flexWrap: "wrap" }}
        >
          {[
            { icon: <Users size={14} />, label: "10,000+ Users" },
            { icon: <Star size={14} />, label: "4.9 / 5 Rating" },
            { icon: <Shield size={14} />, label: "SOC 2 Secure" },
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
              <span style={{ color: "#c4b5fd" }}>{icon}</span>
              {label}
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "80px 48px", maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ textAlign: "center", marginBottom: 60 }}>
          <span className="badge badge-cyan" style={{ marginBottom: 16 }}>FEATURES</span>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Everything you need to <span className="gradient-text">create</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, marginTop: 12, maxWidth: 480, margin: "12px auto 0" }}>
            Six powerful AI tools bundled into one seamless platform.
          </p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          <FeatureCard icon={<Sparkles size={22} />} color="violet" title="AI Text Generator" desc="Generate articles, blogs, social posts, and creative copy in seconds with context-aware AI." delay={0} />
          <FeatureCard icon={<FileText size={22} />} color="emerald" title="Smart Summarizer" desc="Condense lengthy documents, articles, and reports into crisp, meaningful summaries." delay={0.07} />
          <FeatureCard icon={<Zap size={22} />} color="pink" title="Image Generation" desc="Create breathtaking HD images from simple text prompts — any style, any concept." delay={0.14} />
          <FeatureCard icon={<Globe size={22} />} color="amber" title="AI Translator" desc="Translate between 7+ languages with natural, fluent results powered by AI." delay={0.21} />
          <FeatureCard icon={<Brain size={22} />} color="cyan" title="AI Chat Assistant" desc="Chat with a powerful AI for brainstorming, Q&A, coding help, and more." delay={0.28} />
          <FeatureCard icon={<Shield size={22} />} color="blue" title="Secure & Private" desc="Enterprise-grade security with JWT auth, encrypted storage, and role-based access." delay={0.35} />
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: "60px 48px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 2 }}>
          {[
            { n: 10000, suffix: "+", label: "Active Users", color: "#c4b5fd" },
            { n: 500000, suffix: "+", label: "AI Requests Served", color: "#67e8f9" },
            { n: 50000, suffix: "+", label: "Images Generated", color: "#f9a8d4" },
            { n: 99, suffix: "%", label: "Uptime SLA", color: "#6ee7b7" },
          ].map(({ n, suffix, label, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{ textAlign: "center", padding: "40px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}
            >
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 44, fontWeight: 700, color, lineHeight: 1 }}>
                <Counter to={n} suffix={suffix} />
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: "80px 48px", maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ textAlign: "center", marginBottom: 60 }}>
          <span className="badge badge-amber" style={{ marginBottom: 16 }}>PRICING</span>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(28px,4vw,44px)", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Simple, transparent <span className="gradient-text">pricing</span>
          </h2>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
          <PricingCard plan="Basic" price="Free" desc="Perfect for getting started" features={["AI Text Generation","AI Summarizer","Basic Translator","Image Generator (10/day)"]} delay={0} />
          <PricingCard plan="Pro" price="$9.99" desc="For serious creators" features={["Everything in Basic","Fast AI responses","HD Image Generation","500 images / month","Priority support"]} popular delay={0.1} />
          <PricingCard plan="Ultimate" price="$19.99" desc="For power users and teams" features={["Everything in Pro","Ultra-fast AI","Unlimited images","API access","Dedicated support"]} delay={0.2} />
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: "80px 48px", position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            maxWidth: 800, margin: "0 auto", textAlign: "center",
            background: "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(6,182,212,0.1))",
            border: "1px solid rgba(124,58,237,0.35)",
            borderRadius: 24, padding: "64px 40px",
            boxShadow: "0 0 60px rgba(124,58,237,0.15)",
          }}
        >
          <TrendingUp size={36} style={{ color: "#c4b5fd", marginBottom: 20 }} />
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 38, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16 }}>
            Ready to supercharge<br />your workflow?
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
            Join thousands of creators using AISaaS to work smarter every day.
          </p>
          <Link to="/register" className="btn-primary" style={{ textDecoration: "none", fontSize: 16, padding: "14px 36px" }}>
            Start Building for Free <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "40px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Cpu size={14} color="white" />
          </div>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16 }}>AI<span className="gradient-text">SaaS</span></span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Contact"].map(link => (
            <a key={link} href="#" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--text-secondary)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
              {link}
            </a>
          ))}
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>© 2025 AISaaS. All rights reserved.</p>
      </footer>
    </div>
  );
}

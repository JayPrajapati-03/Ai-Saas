import { useState } from "react";
import { motion } from "framer-motion";
import { Check, CreditCard, Clock, Zap, Shield, Star, Crown } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "Free",
    desc: "Great for getting started",
    credits: "Unlimited credits",
    icon: <Zap size={20} />,
    color: "#6ee7b7",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.3)",
    features: ["AI Text Generation", "AI Summarizer", "Basic Translator", "Image Generator (10/day)"],
    popular: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    desc: "Perfect for serious creators",
    credits: "2,000 credits / month",
    icon: <Star size={20} />,
    color: "#c4b5fd",
    bg: "rgba(124,58,237,0.12)",
    border: "rgba(124,58,237,0.5)",
    features: ["Everything in Basic", "Fast AI responses", "HD Image Generation", "500 images / month", "Priority support"],
    popular: true,
  },
  {
    name: "Ultimate",
    price: "$19.99",
    desc: "For power users and teams",
    credits: "5,000 credits / month",
    icon: <Crown size={20} />,
    color: "#fcd34d",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.35)",
    features: ["Everything in Pro", "Ultra-fast AI", "Unlimited images", "API access", "Dedicated support"],
    popular: false,
  },
];

export default function Billing() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activePlan, setActivePlan]     = useState("Basic");
  const [credits, setCredits]           = useState("Unlimited credits");
  const [history, setHistory]           = useState([]);

  const handleUpgrade = (plan) => {
    setActivePlan(plan.name);
    if (plan.name === "Basic") setCredits("Unlimited credits");
    else if (plan.name === "Pro") setCredits("2,000");
    else if (plan.name === "Ultimate") setCredits("5,000");

    if (plan.price !== "Free") {
      setHistory([{ id: Date.now(), plan: `${plan.name} Plan`, amount: plan.price, date: new Date().toISOString().split("T")[0] }, ...history]);
    }
    setSelectedPlan(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CreditCard size={22} style={{ color: "#c4b5fd" }} />
        </div>
        <div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Billing <span className="gradient-text">Center</span>
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>Manage your plan and credits</p>
        </div>
      </motion.div>

      {/* Current Plan Banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{
          padding: "28px 32px",
          background: "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(6,182,212,0.08))",
          border: "1px solid rgba(124,58,237,0.35)",
          borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
          boxShadow: "0 0 30px rgba(124,58,237,0.1)",
        }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Shield size={16} style={{ color: "#c4b5fd" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#c4b5fd", letterSpacing: "0.05em" }}>CURRENT PLAN</span>
          </div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 700 }}>
            <span className="gradient-text">{activePlan} Plan</span>
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Renews monthly · No hidden fees</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Credits Remaining</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 38, fontWeight: 700, color: "#6ee7b7", lineHeight: 1 }}>{credits}</div>
        </div>
      </motion.div>

      {/* Plan Cards */}
      <div>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700, marginBottom: 18 }}>Choose Your Plan</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18 }}>
          {plans.map((plan, i) => {
            const isActive   = activePlan === plan.name;
            const isSelected = selectedPlan === plan.name;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                whileHover={{ y: -3 }}
                onClick={() => setSelectedPlan(plan.name)}
                style={{
                  padding: "28px 24px", borderRadius: 18, position: "relative", cursor: "pointer", transition: "all 0.25s",
                  background: isSelected ? plan.bg : (plan.popular ? "rgba(124,58,237,0.08)" : "var(--bg-card)"),
                  border: `1px solid ${isSelected || isActive ? plan.border : (plan.popular ? "rgba(124,58,237,0.4)" : "var(--border)")}`,
                  boxShadow: isSelected || plan.popular ? `0 0 30px ${plan.bg}` : "none",
                }}
              >
                {plan.popular && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#7c3aed,#06b6d4)", color: "white", fontSize: 10, fontWeight: 700, padding: "4px 14px", borderRadius: 999, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                    ✨ MOST POPULAR
                  </div>
                )}
                {isActive && (
                  <div style={{ position: "absolute", top: 14, right: 14, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "rgba(16,185,129,0.15)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.3)" }}>
                    ACTIVE
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: plan.bg, border: `1px solid ${plan.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: plan.color }}>
                    {plan.icon}
                  </div>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 700 }}>{plan.name}</span>
                </div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 36, fontWeight: 800, color: plan.color, lineHeight: 1, margin: "12px 0 4px" }}>
                  {plan.price}{plan.price !== "Free" && <span style={{ fontSize: 14, color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontWeight: 400 }}>/mo</span>}
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>{plan.desc}</p>
                <p style={{ fontSize: 12, color: plan.color, fontWeight: 600, marginBottom: 18 }}>{plan.credits}</p>
                <div className="glow-divider" style={{ marginBottom: 18 }} />
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "var(--text-primary)" }}>
                      <Check size={15} style={{ color: plan.color, flexShrink: 0 }} /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={(e) => { e.stopPropagation(); handleUpgrade(plan); }}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer",
                    transition: "all 0.2s", border: "none",
                    ...(isActive
                      ? { background: "rgba(16,185,129,0.12)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.3)", cursor: "default" }
                      : isSelected || plan.popular
                      ? { background: `linear-gradient(135deg,${plan.color === "#c4b5fd" ? "#7c3aed,#0891b2" : plan.color === "#fcd34d" ? "#d97706,#b45309" : "#059669,#0891b2"})`, color: "white", boxShadow: `0 4px 16px ${plan.bg}` }
                      : { background: "rgba(255,255,255,0.07)", color: "var(--text-secondary)", border: "1px solid rgba(255,255,255,0.1)" }),
                  }}
                >
                  {isActive ? "✓ Current Plan" : isSelected ? "Upgrade Now" : "Choose Plan"}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      <div>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Payment History</h2>
        <div style={{ padding: "24px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18 }}>
          {history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <CreditCard size={36} style={{ color: "var(--text-muted)", margin: "0 auto 10px", display: "block", opacity: 0.3 }} />
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>No transactions yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {history.map((h) => (
                <div key={h.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{h.plan}</p>
                    <p style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                      <Clock size={12} /> {h.date}
                    </p>
                  </div>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 700, color: "#c4b5fd" }}>{h.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

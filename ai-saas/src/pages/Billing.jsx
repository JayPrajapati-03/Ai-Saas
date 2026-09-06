import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  CreditCard,
  Clock,
  Zap,
  Shield,
  Star,
  Crown,
  Lock,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { useUsage } from "../context/UsageContext";

const plans = [
  {
    name: "Basic",
    price: "Free",
    priceVal: 0,
    desc: "Great for getting started",
    credits: "Unlimited credits",
    icon: <Zap size={20} />,
    color: "#6ee7b7",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.3)",
    features: [
      "AI Text Generation",
      "AI Summarizer",
      "Basic Translator",
      "Image Generator (10/day)",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    priceVal: 9.99,
    desc: "Perfect for serious creators",
    credits: "2,000 credits / month",
    icon: <Star size={20} />,
    color: "#c4b5fd",
    bg: "rgba(124,58,237,0.12)",
    border: "rgba(124,58,237,0.5)",
    features: [
      "Everything in Basic",
      "Fast AI responses",
      "HD Image Generation",
      "500 images / month",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Ultimate",
    price: "$19.99",
    priceVal: 19.99,
    desc: "For power users and teams",
    credits: "5,000 credits / month",
    icon: <Crown size={20} />,
    color: "#fcd34d",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.35)",
    features: [
      "Everything in Pro",
      "Ultra-fast AI",
      "Unlimited images",
      "API access",
      "Dedicated support",
    ],
    popular: false,
  },
];

export default function Billing() {
  const {
    plan: activePlan,
    credits,
    billingHistory,
    upgradePlan,
    switchToBasic,
  } = useUsage();

  // Payment checkout modal state
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successBanner, setSuccessBanner] = useState("");

  // Payment form state
  const [cardName, setCardName] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u.name || "Alex Morgan";
    } catch {
      return "Alex Morgan";
    }
  });
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("888");
  const [cardZip, setCardZip] = useState("94105");

  // Downgrade confirmation modal
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);

  // Open checkout for a plan
  const handleSelectPlan = (plan) => {
    if (plan.name === activePlan) return;

    if (plan.name === "Basic") {
      // Switching back to Basic: free, no payment required
      setShowDowngradeModal(true);
      return;
    }

    // Paid plan: open secure payment checkout modal
    setCheckoutPlan(plan);
    setPaymentSuccess(false);
    setIsProcessing(false);
    setProcessStep("");
  };

  // Quick fill test card credentials
  const handleQuickFill = () => {
    setCardName("Test User");
    setCardNumber("4242 4242 4242 4242");
    setCardExpiry("08/29");
    setCardCvc("321");
    setCardZip("90210");
  };

  // Process checkout payment simulation
  const handleCompletePayment = async (e) => {
    e.preventDefault();
    if (!checkoutPlan || isProcessing) return;

    setIsProcessing(true);
    setProcessStep("Encrypting payment details...");

    await new Promise((r) => setTimeout(r, 600));
    setProcessStep("Authorizing with payment network...");

    await new Promise((r) => setTimeout(r, 700));
    setProcessStep("Payment verified! Activating subscription...");

    // Execute plan upgrade in context & backend
    await upgradePlan(checkoutPlan.name, {
      cardNumber: cardNumber.replace(/\s+/g, ""),
      cardName,
    });

    await new Promise((r) => setTimeout(r, 500));
    setPaymentSuccess(true);
    setProcessStep("Payment Successful!");

    setTimeout(() => {
      setCheckoutPlan(null);
      setIsProcessing(false);
      setPaymentSuccess(false);
      setSuccessBanner(
        `🎉 Congratulations! Your ${checkoutPlan.name} Plan is now active with ${checkoutPlan.credits}.`
      );
      setTimeout(() => setSuccessBanner(""), 8000);
    }, 1200);
  };

  // Confirm downgrade back to Basic
  const handleConfirmDowngrade = async () => {
    setShowDowngradeModal(false);
    await switchToBasic();
    setSuccessBanner(
      "🌱 Switched to Basic Plan! You now have unlimited free generations."
    );
    setTimeout(() => setSuccessBanner(""), 8000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Success Notification Banner */}
      <AnimatePresence>
        {successBanner && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            style={{
              padding: "16px 20px",
              background:
                "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.15))",
              border: "1px solid rgba(16,185,129,0.4)",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 8px 24px rgba(16,185,129,0.15)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(16,185,129,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6ee7b7",
                }}
              >
                <CheckCircle2 size={18} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "white" }}>
                {successBanner}
              </span>
            </div>
            <button
              onClick={() => setSuccessBanner("")}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
              }}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "center", gap: 16 }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "rgba(124,58,237,0.15)",
            border: "1px solid rgba(124,58,237,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CreditCard size={22} style={{ color: "#c4b5fd" }} />
        </div>
        <div>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Billing <span className="gradient-text">Center</span>
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              marginTop: 2,
            }}
          >
            Manage your subscription plan, payment details, and billing history
          </p>
        </div>
      </motion.div>

      {/* Current Plan Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          padding: "28px 32px",
          background:
            activePlan === "Ultimate"
              ? "linear-gradient(135deg,rgba(245,158,11,0.15),rgba(124,58,237,0.1))"
              : activePlan === "Pro"
              ? "linear-gradient(135deg,rgba(124,58,237,0.16),rgba(6,182,212,0.1))"
              : "linear-gradient(135deg,rgba(16,185,129,0.12),rgba(6,182,212,0.08))",
          border: `1px solid ${
            activePlan === "Ultimate"
              ? "rgba(245,158,11,0.4)"
              : activePlan === "Pro"
              ? "rgba(124,58,237,0.4)"
              : "rgba(16,185,129,0.3)"
          }`,
          borderRadius: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          boxShadow: `0 0 30px ${
            activePlan === "Ultimate"
              ? "rgba(245,158,11,0.1)"
              : activePlan === "Pro"
              ? "rgba(124,58,237,0.15)"
              : "rgba(16,185,129,0.1)"
          }`,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <Shield
              size={16}
              style={{
                color:
                  activePlan === "Ultimate"
                    ? "#fcd34d"
                    : activePlan === "Pro"
                    ? "#c4b5fd"
                    : "#6ee7b7",
              }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color:
                  activePlan === "Ultimate"
                    ? "#fcd34d"
                    : activePlan === "Pro"
                    ? "#c4b5fd"
                    : "#6ee7b7",
                letterSpacing: "0.05em",
              }}
            >
              CURRENT SUBSCRIPTION
            </span>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            <span
              style={{
                color:
                  activePlan === "Ultimate"
                    ? "#fcd34d"
                    : activePlan === "Pro"
                    ? "#c4b5fd"
                    : "#6ee7b7",
              }}
            >
              {activePlan} Plan
            </span>
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              marginTop: 4,
            }}
          >
            {activePlan === "Basic"
              ? "Free tier · Unlimited generations included · Upgrade anytime"
              : "Renews monthly · Full feature access unlocked · Downgrade to Basic anytime"}
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              marginBottom: 4,
            }}
          >
            Credits Remaining
          </div>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 38,
              fontWeight: 700,
              color:
                activePlan === "Ultimate"
                  ? "#fcd34d"
                  : activePlan === "Pro"
                  ? "#c4b5fd"
                  : "#6ee7b7",
              lineHeight: 1,
            }}
          >
            {credits}
          </div>
          {activePlan !== "Basic" && (
            <span
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginTop: 6,
                display: "block",
              }}
            >
              Next monthly refill in 30 days
            </span>
          )}
        </div>
      </motion.div>

      {/* Plan Cards */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              Choose Your Plan
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              Select a tier that fits your workflow. You can switch back to
              Basic at any time.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: 18,
          }}
        >
          {plans.map((plan, i) => {
            const isActive = activePlan === plan.name;
            const isBasic = plan.name === "Basic";

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                whileHover={{ y: -3 }}
                style={{
                  padding: "28px 24px",
                  borderRadius: 18,
                  position: "relative",
                  transition: "all 0.25s",
                  background: isActive
                    ? plan.bg
                    : plan.popular
                    ? "rgba(124,58,237,0.08)"
                    : "var(--bg-card)",
                  border: `1px solid ${
                    isActive
                      ? plan.border
                      : plan.popular
                      ? "rgba(124,58,237,0.4)"
                      : "var(--border)"
                  }`,
                  boxShadow:
                    isActive || plan.popular ? `0 0 30px ${plan.bg}` : "none",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Popular Pill */}
                {plan.popular && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
                      color: "white",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "4px 14px",
                      borderRadius: 999,
                      letterSpacing: "0.06em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ✨ MOST POPULAR
                  </div>
                )}

                {/* Active Pill */}
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 999,
                      background: "rgba(16,185,129,0.18)",
                      color: "#6ee7b7",
                      border: "1px solid rgba(16,185,129,0.35)",
                    }}
                  >
                    ACTIVE
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: plan.bg,
                      border: `1px solid ${plan.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: plan.color,
                    }}
                  >
                    {plan.icon}
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {plan.name}
                  </span>
                </div>

                <div
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 36,
                    fontWeight: 800,
                    color: plan.color,
                    lineHeight: 1,
                    margin: "12px 0 4px",
                  }}
                >
                  {plan.price}
                  {plan.price !== "Free" && (
                    <span
                      style={{
                        fontSize: 14,
                        color: "var(--text-secondary)",
                        fontFamily: "var(--font-body)",
                        fontWeight: 400,
                      }}
                    >
                      /mo
                    </span>
                  )}
                </div>

                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    marginBottom: 4,
                  }}
                >
                  {plan.desc}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: plan.color,
                    fontWeight: 600,
                    marginBottom: 18,
                  }}
                >
                  {plan.credits}
                </p>

                <div className="glow-divider" style={{ marginBottom: 18 }} />

                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    flex: 1,
                  }}
                >
                  {plan.features.map((f, j) => (
                    <li
                      key={j}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        fontSize: 13,
                        color: "var(--text-primary)",
                      }}
                    >
                      <Check
                        size={15}
                        style={{ color: plan.color, flexShrink: 0 }}
                      />{" "}
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Plan Action Button */}
                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isActive}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: isActive ? "default" : "pointer",
                    transition: "all 0.2s",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    ...(isActive
                      ? {
                          background: "rgba(16,185,129,0.15)",
                          color: "#6ee7b7",
                          border: "1px solid rgba(16,185,129,0.35)",
                        }
                      : isBasic
                      ? {
                          background: "rgba(16,185,129,0.12)",
                          color: "#6ee7b7",
                          border: "1px solid rgba(16,185,129,0.3)",
                        }
                      : {
                          background:
                            plan.color === "#c4b5fd"
                              ? "linear-gradient(135deg,#7c3aed,#0891b2)"
                              : "linear-gradient(135deg,#d97706,#b45309)",
                          color: "white",
                          boxShadow: `0 4px 16px ${plan.bg}`,
                        }),
                  }}
                >
                  {isActive ? (
                    <>
                      <Check size={16} /> Current Plan
                    </>
                  ) : isBasic ? (
                    <>
                      <RefreshCw size={15} /> Switch to Basic (Free)
                    </>
                  ) : (
                    <>
                      <CreditCard size={15} /> Upgrade to {plan.name}
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            Payment History
          </h2>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {billingHistory.length} transaction{billingHistory.length === 1 ? "" : "s"} recorded
          </span>
        </div>

        <div
          style={{
            padding: "24px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 18,
          }}
        >
          {billingHistory.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <Receipt
                size={36}
                style={{
                  color: "var(--text-muted)",
                  margin: "0 auto 10px",
                  display: "block",
                  opacity: 0.35,
                }}
              />
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                No payment transactions yet
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>
                When you upgrade to Pro or Ultimate, invoice records will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {billingHistory.map((h, idx) => (
                <div
                  key={h.id || h.transactionId || idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    background: "rgba(0,0,0,0.22)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 12,
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: "rgba(124,58,237,0.15)",
                        border: "1px solid rgba(124,58,237,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#c4b5fd",
                      }}
                    >
                      <Receipt size={18} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "white",
                          }}
                        >
                          {h.plan}
                        </p>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 999,
                            background: "rgba(16,185,129,0.15)",
                            color: "#6ee7b7",
                            border: "1px solid rgba(16,185,129,0.3)",
                          }}
                        >
                          {h.status || "Completed"}
                        </span>
                      </div>
                      <p
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          color: "var(--text-muted)",
                          marginTop: 3,
                        }}
                      >
                        <Clock size={12} />
                        {typeof h.date === "string"
                          ? h.date.split("T")[0]
                          : new Date(h.date).toLocaleDateString()}
                        {h.transactionId && (
                          <span style={{ color: "rgba(255,255,255,0.35)" }}>
                            • {h.transactionId}
                          </span>
                        )}
                        {h.paymentMethod && (
                          <span style={{ color: "rgba(255,255,255,0.4)" }}>
                            • {h.paymentMethod}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#c4b5fd",
                      }}
                    >
                      {h.amount}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        display: "block",
                      }}
                    >
                      Billed / Month
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═════════════════════════════════════════════
          CHECKOUT PAYMENT MODAL
      ═════════════════════════════════════════════ */}
      <AnimatePresence>
        {checkoutPlan && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(12px)",
            }}
            onClick={() => !isProcessing && setCheckoutPlan(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 480,
                borderRadius: 22,
                background: "#0c1222",
                border: "1px solid rgba(124,58,237,0.4)",
                boxShadow:
                  "0 25px 60px rgba(0,0,0,0.8), 0 0 50px rgba(124,58,237,0.2)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Modal Top Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "18px 24px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(124,58,237,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#c4b5fd",
                    }}
                  >
                    <Lock size={16} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: 16,
                        fontWeight: 700,
                        color: "white",
                      }}
                    >
                      Secure Payment Checkout
                    </h3>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      256-Bit SSL Encrypted Transaction
                    </p>
                  </div>
                </div>

                {!isProcessing && (
                  <button
                    onClick={() => setCheckoutPlan(null)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Order Summary Box */}
              <div style={{ padding: "20px 24px 0" }}>
                <div
                  style={{
                    padding: "16px 18px",
                    borderRadius: 14,
                    background:
                      checkoutPlan.color === "#c4b5fd"
                        ? "rgba(124,58,237,0.15)"
                        : "rgba(245,158,11,0.12)",
                    border: `1px solid ${
                      checkoutPlan.color === "#c4b5fd"
                        ? "rgba(124,58,237,0.35)"
                        : "rgba(245,158,11,0.35)"
                    }`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: checkoutPlan.bg,
                        border: `1px solid ${checkoutPlan.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: checkoutPlan.color,
                      }}
                    >
                      {checkoutPlan.icon}
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontSize: 16,
                          fontWeight: 700,
                          color: "white",
                        }}
                      >
                        {checkoutPlan.name} Plan
                      </div>
                      <div style={{ fontSize: 12, color: checkoutPlan.color }}>
                        {checkoutPlan.credits}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontSize: 22,
                        fontWeight: 800,
                        color: "white",
                      }}
                    >
                      {checkoutPlan.price}
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      Billed monthly
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Form */}
              <form onSubmit={handleCompletePayment} style={{ padding: "20px 24px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.04em" }}>
                    PAYMENT DETAILS
                  </span>
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    style={{
                      background: "rgba(124,58,237,0.15)",
                      border: "1px solid rgba(124,58,237,0.3)",
                      color: "#c4b5fd",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 6,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Sparkles size={12} /> ⚡ Quick Fill Test Card
                  </button>
                </div>

                {/* Cardholder Name */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Full Name"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "white",
                      fontSize: 13,
                      outline: "none",
                    }}
                  />
                </div>

                {/* Card Number */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                    Card Number
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      style={{
                        width: "100%",
                        padding: "10px 42px 10px 14px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "white",
                        fontSize: 13,
                        fontFamily: "monospace",
                        letterSpacing: "0.08em",
                        outline: "none",
                      }}
                    />
                    <CreditCard
                      size={18}
                      style={{
                        position: "absolute",
                        right: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#c4b5fd",
                      }}
                    />
                  </div>
                </div>

                {/* Expiry, CVC, Zip */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                      Expires (MM/YY)
                    </label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="12/28"
                      maxLength={5}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "white",
                        fontSize: 13,
                        textAlign: "center",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                      CVC / CVV
                    </label>
                    <input
                      type="password"
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="888"
                      maxLength={4}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "white",
                        fontSize: 13,
                        textAlign: "center",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                      Postal Code
                    </label>
                    <input
                      type="text"
                      required
                      value={cardZip}
                      onChange={(e) => setCardZip(e.target.value)}
                      placeholder="94105"
                      maxLength={6}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "white",
                        fontSize: 13,
                        textAlign: "center",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                {/* Processing State or Submit Button */}
                {isProcessing ? (
                  <div
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: 12,
                      background: paymentSuccess
                        ? "rgba(16,185,129,0.2)"
                        : "rgba(124,58,237,0.2)",
                      border: `1px solid ${
                        paymentSuccess
                          ? "rgba(16,185,129,0.5)"
                          : "rgba(124,58,237,0.5)"
                      }`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      color: paymentSuccess ? "#6ee7b7" : "#c4b5fd",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {paymentSuccess ? (
                      <>
                        <CheckCircle2 size={18} />
                        <span>{processStep}</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        <span>{processStep}</span>
                      </>
                    )}
                  </div>
                ) : (
                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 15,
                      color: "white",
                      background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "transform 0.15s, opacity 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.92";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    <span>Pay {checkoutPlan.price} & Activate {checkoutPlan.name}</span>
                    <ArrowRight size={16} />
                  </button>
                )}

                {/* Trust Badges */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                    marginTop: 16,
                    fontSize: 11,
                    color: "var(--text-muted)",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <ShieldCheck size={13} color="#6ee7b7" /> Instant Activation
                  </span>
                  <span>•</span>
                  <span>Switch back to Basic anytime</span>
                  <span>•</span>
                  <span>No lock-in</span>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═════════════════════════════════════════════
          DOWNGRADE TO BASIC CONFIRMATION MODAL
      ═════════════════════════════════════════════ */}
      <AnimatePresence>
        {showDowngradeModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(12px)",
            }}
            onClick={() => setShowDowngradeModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 420,
                borderRadius: 20,
                background: "#0c1222",
                border: "1px solid rgba(16,185,129,0.35)",
                padding: "26px",
                boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(16,185,129,0.15)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6ee7b7",
                  marginBottom: 16,
                }}
              >
                <Zap size={22} />
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "white",
                  marginBottom: 8,
                }}
              >
                Switch to Basic Plan?
              </h3>

              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                  marginBottom: 20,
                }}
              >
                Your active subscription will change to the free **Basic Plan**.
                You will receive unlimited free generations, and your previous
                payment history will remain saved.
              </p>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowDowngradeModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDowngrade}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 10,
                    background: "linear-gradient(135deg,#059669,#0891b2)",
                    border: "none",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Confirm Switch
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

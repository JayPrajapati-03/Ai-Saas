import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  CreditCard,
  Clock,
  Zap,
  Shield,
  Star,
  Crown,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { useUsage } from "../context/UsageContext";
import RazorpayModal from "../components/RazorpayModal";

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
    rawCredits = 120,
    billingHistory,
    upgradePlan,
    switchToBasic,
    resumePlan,
    purchasedPlan,
    planExpiresAt,
    daysRemaining,
  } = useUsage();

  const location = useLocation();
  const navigate = useNavigate();
  const returnPath = location.state?.from || "/app";

  // Payment checkout modal state
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [successBanner, setSuccessBanner] = useState("");
  const [razorpayError, setRazorpayError] = useState(null); // { message, plan }
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Downgrade confirmation modal
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);

  // Payment History pagination
  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => { setCurrentPage(1); }, [billingHistory.length]);
  const totalPages = Math.max(1, Math.ceil(billingHistory.length / PAGE_SIZE));
  const pagedHistory = billingHistory.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Handle direct Razorpay Hosted Page redirect via Payment Links
  const handleRedirectToHostedPage = async (plan) => {
    try {
      setIsRedirecting(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/billing/create-payment-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan: plan.name, returnPath }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        setRazorpayError({
          message: data.message || "Failed to create Razorpay payment link.",
          plan,
        });
      }
    } catch (err) {
      setRazorpayError({
        message: err.message || "Network error connecting to payment server.",
        plan,
      });
    } finally {
      setIsRedirecting(false);
    }
  };

  // Handle successful Razorpay payment
  const handleRazorpaySuccess = async (plan, paymentDetails) => {
    await upgradePlan(plan.name, {
      paymentMethod: paymentDetails.paymentMethod,
      amount: paymentDetails.amount,
      transactionId: paymentDetails.paymentId,
    });

    setSuccessBanner(
      `🎉 Payment Successful! Your ${plan.name} Plan is now active with ${plan.credits}. Returning you back...`
    );

    setTimeout(() => {
      navigate(returnPath || "/app", { replace: true });
    }, 1200);
  };

  // Open checkout / resume for a plan
  const handleSelectPlan = async (plan) => {
    if (plan.name === activePlan && (activePlan === "Basic" || rawCredits > 0)) return;

    if (plan.name === "Basic") {
      setShowDowngradeModal(true);
      return;
    }

    // Check if plan has expired
    const isPlanExpired = planExpiresAt
      ? new Date() > new Date(planExpiresAt)
      : (daysRemaining !== null && daysRemaining <= 0);

    // If user is on Basic and this plan is their saved purchased plan — resume for free ONLY within validity!
    if (activePlan === "Basic" && purchasedPlan === plan.name && !isPlanExpired) {
      const result = await resumePlan();
      if (result.success) {
        setSuccessBanner(`⚡ ${plan.name} Plan resumed! ${daysRemaining ? `${daysRemaining} days remaining.` : ""}`);
        setTimeout(() => setSuccessBanner(""), 8000);
      } else {
        setRazorpayError({ message: result?.message || "Plan validity has expired. Please purchase a new plan.", plan });
      }
      return;
    }

    await handleRedirectToHostedPage(plan);
  };

  // Handle Razorpay Payment Link callback (redirect back with ?payment=razorpay_success&plan=Pro)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get("payment");
    const paidPlan = params.get("plan");
    const fromPath = params.get("from");

    if (paymentStatus === "razorpay_success" && paidPlan) {
      // Clear URL query parameters immediately to prevent duplicate execution
      navigate("/app/billing", { replace: true, state: { from: fromPath || "/app" } });

      const matchedPlan = plans.find((p) => p.name === paidPlan);
      if (matchedPlan) {
        handleRazorpaySuccess(matchedPlan, {
          paymentId: `rzp_${Date.now()}`,
          paymentMethod: "Razorpay Official Checkout",
          amount: matchedPlan.price,
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Confirm downgrade back to Basic — immediately removes the purchased plan
  const handleConfirmDowngrade = async () => {
    setShowDowngradeModal(false);
    const result = await switchToBasic();
    setSuccessBanner(
      result?.message || "🌱 Switched to Basic Plan! You now have unlimited free generations."
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
              ? purchasedPlan
                ? `Free tier active · Your ${purchasedPlan} Plan is saved (${daysRemaining !== null ? `${daysRemaining} days left` : "Active"}) · Switch back anytime!`
                : "Free tier · Unlimited generations included · Upgrade anytime"
              : "Billed monthly · Switch to Basic anytime to save credits"}
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
          {activePlan !== "Basic" ? (
            <span
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginTop: 6,
                display: "block",
              }}
            >
              {daysRemaining !== null
                ? `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`
                : "30 days / month"}
            </span>
          ) : purchasedPlan ? (
            <span
              style={{
                fontSize: 11,
                color: "#6ee7b7",
                marginTop: 6,
                display: "block",
                fontWeight: 600,
              }}
            >
              Saved: {purchasedPlan} ({daysRemaining !== null ? `${daysRemaining}d left` : "Active"})
            </span>
          ) : null}
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

                {/* Active Pill or Saved Validity Pill */}
                {isActive ? (
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
                ) : activePlan === "Basic" && purchasedPlan === plan.name ? (
                  (() => {
                    const isPlanExpired = planExpiresAt
                      ? new Date() > new Date(planExpiresAt)
                      : (daysRemaining !== null && daysRemaining <= 0);
                    return isPlanExpired ? (
                      <div
                        style={{
                          position: "absolute",
                          top: 14,
                          right: 14,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 999,
                          background: "rgba(239,68,68,0.18)",
                          color: "#f87171",
                          border: "1px solid rgba(239,68,68,0.35)",
                        }}
                      >
                        EXPIRED
                      </div>
                    ) : (
                      <div
                        style={{
                          position: "absolute",
                          top: 14,
                          right: 14,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 999,
                          background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.2))",
                          color: "#6ee7b7",
                          border: "1px solid rgba(16,185,129,0.4)",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Clock size={11} /> {daysRemaining !== null ? `${daysRemaining}d validity left` : "SAVED (ACTIVE)"}
                      </div>
                    );
                  })()
                ) : null}

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
                {(() => {
                  const isPlanExpired = planExpiresAt
                    ? new Date() > new Date(planExpiresAt)
                    : (daysRemaining !== null && daysRemaining <= 0);
                  const isResumable = activePlan === "Basic" && purchasedPlan === plan.name && !isPlanExpired;
                  const isDisabled = (isActive && (isBasic || rawCredits > 0)) || isRedirecting;
                  return (
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isDisabled}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: 12,
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: isDisabled ? "default" : "pointer",
                        transition: "all 0.2s",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        ...(isResumable
                          ? {
                              background: "linear-gradient(135deg,#059669,#0891b2)",
                              color: "white",
                              boxShadow: "0 4px 16px rgba(5,150,105,0.3)",
                            }
                          : isActive
                          ? rawCredits <= 0 && !isBasic
                            ? {
                                background: "linear-gradient(135deg,#f59e0b,#d97706)",
                                color: "white",
                                boxShadow: "0 4px 16px rgba(245,158,11,0.35)",
                              }
                            : {
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
                      {isResumable ? (
                        <><RefreshCw size={15} /> Resume {plan.name} ({daysRemaining !== null ? `${daysRemaining}d left` : "Active"}) · Free</>
                      ) : isActive ? (
                        rawCredits <= 0 && !isBasic ? (
                          <><Sparkles size={15} /> Purchase Credits ({plan.price})</>
                        ) : (
                          <><Check size={16} /> Current Plan</>
                        )
                      ) : isBasic ? (
                        <><RefreshCw size={15} /> Switch to Basic (Free)</>
                      ) : isPlanExpired && purchasedPlan === plan.name ? (
                        <><CreditCard size={15} /> Renew {plan.name} ({plan.price})</>
                      ) : (
                        <><CreditCard size={15} /> Upgrade to {plan.name}</>
                      )}
                    </button>
                  );
                })()}
              </motion.div>
            );
          })}
        </div>

        {/* Saved Plan Resume Banner */}
        {activePlan === "Basic" && purchasedPlan && planExpiresAt && new Date() < new Date(planExpiresAt) && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 16,
              padding: "14px 18px",
              background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.08))",
              border: "1px solid rgba(124,58,237,0.35)",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              color: "#c4b5fd",
            }}
          >
            <ShieldCheck size={16} style={{ flexShrink: 0 }} />
            <span>
              <strong>{purchasedPlan} Plan is saved</strong> — Switch back anytime for free.
              {daysRemaining !== null && ` (${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining)`}
            </span>
          </motion.div>
        )}

        {/* Billing Terms & Refund Policy Notice */}
        <div style={{
          marginTop: 20,
          padding: "14px 18px",
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.07)",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          fontSize: 12.5,
          color: "var(--text-muted)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Shield size={16} color="#a78bfa" style={{ flexShrink: 0 }} />
            <span>
              All purchases are processed securely with SSL encryption. Transactions and subscription renewals are governed by our{" "}
              <Link to="/terms" style={{ color: "#c4b5fd", textDecoration: "underline" }}>Terms of Service</Link>{" "}
              and{" "}
              <Link to="/privacy" style={{ color: "#c4b5fd", textDecoration: "underline" }}>Privacy Policy</Link>.
            </span>
          </div>
          <Link to="/terms#billing-refunds" style={{ color: "var(--text-secondary)", fontSize: 12, textDecoration: "none", fontWeight: 500 }}>
            Refund & Cancellation Policy →
          </Link>
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
              {pagedHistory.map((h, idx) => (
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
                        <p style={{ fontSize: 14, fontWeight: 600, color: "white" }}>
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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 9,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: currentPage === 1 ? "transparent" : "rgba(124,58,237,0.15)",
                      color: currentPage === 1 ? "var(--text-muted)" : "#c4b5fd",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: currentPage === 1 ? "default" : "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    ← Prev
                  </button>

                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    Page <strong style={{ color: "white" }}>{currentPage}</strong> of{" "}
                    <strong style={{ color: "white" }}>{totalPages}</strong>
                  </span>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 9,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: currentPage === totalPages ? "transparent" : "rgba(124,58,237,0.15)",
                      color: currentPage === totalPages ? "var(--text-muted)" : "#c4b5fd",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: currentPage === totalPages ? "default" : "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═════════════════════════════════════════════
          RAZORPAY REDIRECTING OVERLAY
      ═════════════════════════════════════════════ */}
      <AnimatePresence>
        {isRedirecting && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              background: "rgba(0, 0, 0, 0.82)",
              backdropFilter: "blur(14px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              style={{
                textAlign: "center",
                padding: "36px 32px",
                borderRadius: 22,
                background: "#0c1222",
                border: "1px solid rgba(99, 102, 241, 0.35)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.9)",
                maxWidth: 400,
                width: "100%",
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 18px",
                  boxShadow: "0 10px 25px rgba(99, 102, 241, 0.4)",
                }}
              >
                <RefreshCw
                  size={26}
                  color="white"
                  style={{ animation: "spin 1s linear infinite" }}
                />
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "white",
                  marginBottom: 8,
                }}
              >
                Connecting to Razorpay
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Redirecting you to the official secure payment gateway...
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═════════════════════════════════════════════
          RAZORPAY AUTHENTICATION / ERROR MODAL
      ═════════════════════════════════════════════ */}
      <AnimatePresence>
        {razorpayError && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              background: "rgba(0, 0, 0, 0.78)",
              backdropFilter: "blur(12px)",
            }}
            onClick={() => setRazorpayError(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 480,
                borderRadius: 20,
                background: "#0c1222",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                padding: "26px",
                boxShadow: "0 25px 60px rgba(0,0,0,0.85)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#f87171",
                  }}
                >
                  <AlertTriangle size={22} />
                </div>
                <button
                  type="button"
                  onClick={() => setRazorpayError(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  <X size={20} />
                </button>
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
                Razorpay Authentication Issue
              </h3>

              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  color: "#fca5a5",
                  fontSize: 13,
                  lineHeight: 1.5,
                  marginBottom: 16,
                }}
              >
                <strong>Error:</strong> {razorpayError.message}
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  marginBottom: 20,
                  background: "rgba(255,255,255,0.03)",
                  padding: 14,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p style={{ fontWeight: 600, color: "white", marginBottom: 6 }}>
                  Why this happens (HTTP 401):
                </p>
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  <li>Razorpay Key Secret was regenerated or does not match this Key ID.</li>
                  <li>The test account or key pair is deactivated in Razorpay Dashboard.</li>
                </ul>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {razorpayError.plan && (
                  <button
                    type="button"
                    onClick={() => {
                      const p = razorpayError.plan;
                      setRazorpayError(null);
                      setCheckoutPlan(p);
                    }}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      border: "none",
                      color: "white",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Sparkles size={16} />
                    Open Sandbox Demo Checkout (Test Now)
                  </button>
                )}

                {razorpayError.plan && (
                  <button
                    type="button"
                    disabled={isRedirecting}
                    onClick={() => handleRedirectToHostedPage(razorpayError.plan)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "white",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: isRedirecting ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <ExternalLink size={16} />
                    {isRedirecting ? "Generating link..." : "Try Razorpay Hosted Page (Redirect)"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setRazorpayError(null)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: 10,
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═════════════════════════════════════════════
          RAZORPAY CHECKOUT MODAL
      ═════════════════════════════════════════════ */}
      <RazorpayModal
        isOpen={Boolean(checkoutPlan)}
        plan={checkoutPlan}
        onClose={() => setCheckoutPlan(null)}
        onSuccess={(paymentDetails) =>
          handleRazorpaySuccess(checkoutPlan, paymentDetails)
        }
        returnPath={returnPath}
      />


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
                  lineHeight: 1.6,
                  marginBottom: 20,
                }}
              >
                Switching to Basic gives you <strong>unlimited free generations</strong>.
                <br />
                <br />
                <span style={{ color: "#34d399", fontWeight: 600, display: "block" }}>
                  ✓ Your {activePlan} Plan is NOT deleted or lost.
                </span>
                Your plan and credits remain safely saved and valid. You can freely switch back to{" "}
                <strong style={{ color: "white" }}>{activePlan} Plan</strong> anytime before it expires!
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

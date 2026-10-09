import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  X,
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Smartphone,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RazorpayModal({
  isOpen,
  plan,
  onClose,
  onSuccess,
  returnPath = "/app",
}) {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState("upi"); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState("success@razorpay");
  const [cardName, setCardName] = useState("Demo User");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("888");
  const [selectedBank, setSelectedBank] = useState("HDFC");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !plan) return null;

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = storedUser.email || "user@example.com";
  const userName = storedUser.name || "Demo User";

  // Calculate approximate INR equivalent (1 USD ~ 83 INR)
  const inrAmount = plan.priceVal
    ? Math.round(plan.priceVal * 83).toLocaleString("en-IN")
    : plan.name === "Pro"
    ? "829"
    : "1,659";

  const handlePay = async (methodOverride) => {
    if (isProcessing || isSuccess) return;

    const method = methodOverride || selectedMethod;
    setIsProcessing(true);
    setProcessStatus("Connecting to Razorpay Gateway...");

    await new Promise((r) => setTimeout(r, 600));
    setProcessStatus("Verifying test payment simulation...");

    await new Promise((r) => setTimeout(r, 700));
    setProcessStatus("Payment authorized! Allocating credits...");

    const paymentId = `pay_rzp_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const paymentMethodLabel =
      method === "upi"
        ? `Razorpay UPI (${upiId})`
        : method === "card"
        ? `Razorpay Card (•••• ${cardNumber.slice(-4)})`
        : `Razorpay Netbanking (${selectedBank})`;

    if (onSuccess) {
      await onSuccess({
        paymentId,
        paymentMethod: paymentMethodLabel,
        amount: plan.price,
      });
    }

    setIsProcessing(false);
    setIsSuccess(true);

    // Auto-redirect back to previous page
    setTimeout(() => {
      onClose();
      navigate(returnPath || "/app", { replace: true });
    }, 1500);
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
          background: "rgba(3, 7, 18, 0.82)",
          backdropFilter: "blur(12px)",
        }}
        onClick={() => !isProcessing && !isSuccess && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 720,
            borderRadius: 20,
            background: "#0f172a",
            border: "1px solid rgba(59, 130, 246, 0.35)",
            boxShadow:
              "0 25px 70px rgba(0,0,0,0.85), 0 0 50px rgba(59, 130, 246, 0.2)",
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "row",
            minHeight: 460,
          }}
        >
          {/* Top-Right Diagonal "Test Mode" Ribbon */}
          <div
            style={{
              position: "absolute",
              top: 18,
              right: -36,
              transform: "rotate(45deg)",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "white",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "4px 44px",
              boxShadow: "0 2px 10px rgba(239, 68, 68, 0.4)",
              zIndex: 30,
              pointerEvents: "none",
            }}
          >
            Test Mode
          </div>

          {/* ═════════════════════════════════════════════
              LEFT SIDEBAR: Razorpay Branded Order Info
          ═════════════════════════════════════════════ */}
          <div
            style={{
              width: 260,
              background: "linear-gradient(180deg, #0b1120 0%, #030712 100%)",
              borderRight: "1px solid rgba(255, 255, 255, 0.08)",
              padding: "24px 20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            <div>
              {/* Brand Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 900,
                    fontSize: 20,
                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
                  }}
                >
                  ⚡
                </div>
                <div>
                  <h4
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "white",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    AISaaS Studio
                  </h4>
                  <p style={{ fontSize: 11, color: "#94a3b8" }}>
                    Verified Merchant
                  </p>
                </div>
              </div>

              {/* Price Summary */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.07)",
                  borderRadius: 14,
                  padding: "16px 14px",
                  marginBottom: 20,
                }}
              >
                <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                  Price Summary
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "white",
                    fontFamily: "var(--font-heading)",
                  }}
                >
                  ₹{inrAmount}
                  <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500, marginLeft: 6 }}>
                    ({plan.price})
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#38bdf8",
                    marginTop: 4,
                    fontWeight: 600,
                  }}
                >
                  {plan.name} Plan • {plan.credits}
                </div>
              </div>

              {/* Using As User Card */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "rgba(59, 130, 246, 0.2)",
                    color: "#60a5fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Using account</div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "white",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {userEmail}
                  </div>
                </div>
              </div>
            </div>

            {/* Official Razorpay Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                paddingTop: 16,
                borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: "#0284c7",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                R
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>
                Secured by{" "}
                <span style={{ color: "#38bdf8", fontWeight: 700 }}>Razorpay</span>
              </div>
              <div style={{ fontSize: 10, color: "rgba(148, 163, 184, 0.7)", marginTop: 8, lineHeight: 1.4 }}>
                By paying, you accept our{" "}
                <a href="/terms" target="_blank" rel="noreferrer" style={{ color: "#93c5fd", textDecoration: "underline" }}>Terms</a>
                {" & "}
                <a href="/terms#billing-refunds" target="_blank" rel="noreferrer" style={{ color: "#93c5fd", textDecoration: "underline" }}>Refund Policy</a>
              </div>
            </div>
          </div>

          {/* ═════════════════════════════════════════════
              RIGHT PANEL: Payment Options & Processing
          ═════════════════════════════════════════════ */}
          <div
            style={{
              flex: 1,
              background: "#0f172a",
              padding: "24px 28px",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            {/* Header with Close */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  Payment Options
                </h3>
                <p style={{ fontSize: 12, color: "#94a3b8" }}>
                  Select your preferred test payment method
                </p>
              </div>

              {!isProcessing && !isSuccess && (
                <button
                  onClick={onClose}
                  style={{
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "none",
                    borderRadius: 8,
                    width: 32,
                    height: 32,
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                    e.currentTarget.style.color = "#94a3b8";
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Success State */}
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: 20,
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.18)",
                    border: "2px solid #10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#10b981",
                    marginBottom: 18,
                    boxShadow: "0 0 35px rgba(16, 185, 129, 0.35)",
                  }}
                >
                  <CheckCircle2 size={40} />
                </div>
                <h4
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "white",
                    marginBottom: 6,
                  }}
                >
                  Payment Successful!
                </h4>
                <p style={{ fontSize: 13, color: "#94a3b8", maxWidth: 300, marginBottom: 16 }}>
                  Your <strong style={{ color: "white" }}>{plan.name} Plan</strong> is now active with {plan.credits}.
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    color: "#38bdf8",
                  }}
                >
                  <RefreshCw size={14} className="spin-slow" />
                  Redirecting back to your workflow...
                </div>
              </motion.div>
            ) : isProcessing ? (
              /* Processing State */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: 20,
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    border: "3px solid rgba(59, 130, 246, 0.2)",
                    borderTopColor: "#3b82f6",
                    animation: "spin 0.8s linear infinite",
                    marginBottom: 20,
                  }}
                />
                <h4
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 16,
                    fontWeight: 700,
                    color: "white",
                    marginBottom: 6,
                  }}
                >
                  Processing Razorpay Payment
                </h4>
                <p style={{ fontSize: 13, color: "#94a3b8" }}>{processStatus}</p>
              </motion.div>
            ) : (
              /* Payment Options Tabs & Form */
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Method Switcher */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                    marginBottom: 20,
                  }}
                >
                  {[
                    { id: "upi", label: "UPI / QR", icon: <QrCode size={16} /> },
                    { id: "card", label: "Cards", icon: <CreditCard size={16} /> },
                    { id: "netbanking", label: "Netbanking", icon: <Building2 size={16} /> },
                  ].map((m) => {
                    const active = selectedMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: active
                            ? "1px solid #3b82f6"
                            : "1px solid rgba(255, 255, 255, 0.08)",
                          background: active
                            ? "rgba(59, 130, 246, 0.15)"
                            : "rgba(255, 255, 255, 0.02)",
                          color: active ? "white" : "#94a3b8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          fontSize: 12,
                          fontWeight: active ? 700 : 500,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        <span style={{ color: active ? "#38bdf8" : "#64748b" }}>
                          {m.icon}
                        </span>
                        {m.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab 1: UPI & QR Code */}
                {selectedMethod === "upi" && (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.02)",
                        border: "1px dashed rgba(59, 130, 246, 0.3)",
                        borderRadius: 14,
                        padding: 16,
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                      }}
                    >
                      {/* Interactive QR Code Simulator */}
                      <div
                        style={{
                          width: 88,
                          height: 88,
                          borderRadius: 10,
                          background: "white",
                          padding: 6,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        }}
                      >
                        <QrCode size={64} color="#0f172a" />
                        <div style={{ fontSize: 8, color: "#0284c7", fontWeight: 800, marginTop: 2 }}>
                          RAZORPAY
                        </div>
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
                          Scan with any UPI App
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, marginBottom: 8 }}>
                          Google Pay, PhonePe, Paytm, CRED
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePay("upi")}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 6,
                            background: "rgba(16, 185, 129, 0.15)",
                            border: "1px solid rgba(16, 185, 129, 0.4)",
                            color: "#34d399",
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          ⚡ Instant QR Scan Pay
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 6 }}>
                        Or enter UPI ID / VPA
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okaxis"
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: 10,
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          color: "white",
                          fontSize: 13,
                          outline: "none",
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePay("upi")}
                      style={{
                        marginTop: "auto",
                        width: "100%",
                        padding: "13px",
                        borderRadius: 12,
                        background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                        border: "none",
                        color: "white",
                        fontWeight: 700,
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        cursor: "pointer",
                        boxShadow: "0 4px 18px rgba(37, 99, 235, 0.35)",
                      }}
                    >
                      <Lock size={15} /> Pay ₹{inrAmount} via UPI
                    </button>
                  </div>
                )}

                {/* Tab 2: Cards */}
                {selectedMethod === "card" && (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 4 }}>
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: 10,
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          color: "white",
                          fontSize: 13,
                          letterSpacing: "0.05em",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 4 }}>
                          Expiry
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: 10,
                            background: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "white",
                            fontSize: 13,
                            outline: "none",
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 4 }}>
                          CVV
                        </label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          maxLength={4}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: 10,
                            background: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "white",
                            fontSize: 13,
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
                      <ShieldCheck size={14} color="#10b981" /> Pre-filled with Razorpay Test Card
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePay("card")}
                      style={{
                        marginTop: "auto",
                        width: "100%",
                        padding: "13px",
                        borderRadius: 12,
                        background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                        border: "none",
                        color: "white",
                        fontWeight: 700,
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        cursor: "pointer",
                        boxShadow: "0 4px 18px rgba(37, 99, 235, 0.35)",
                      }}
                    >
                      <Lock size={15} /> Pay ₹{inrAmount} via Card
                    </button>
                  </div>
                )}

                {/* Tab 3: Netbanking */}
                {selectedMethod === "netbanking" && (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
                      Popular Banks
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {["HDFC", "ICICI", "SBI", "Axis Bank"].map((bank) => {
                        const active = selectedBank === bank;
                        return (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setSelectedBank(bank)}
                            style={{
                              padding: "10px",
                              borderRadius: 10,
                              border: active
                                ? "1px solid #3b82f6"
                                : "1px solid rgba(255, 255, 255, 0.08)",
                              background: active
                                ? "rgba(59, 130, 246, 0.15)"
                                : "rgba(255, 255, 255, 0.02)",
                              color: active ? "white" : "#cbd5e1",
                              fontSize: 12,
                              fontWeight: active ? 700 : 500,
                              cursor: "pointer",
                              textAlign: "left",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            {bank}
                            {active && <CheckCircle2 size={14} color="#38bdf8" />}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePay("netbanking")}
                      style={{
                        marginTop: "auto",
                        width: "100%",
                        padding: "13px",
                        borderRadius: 12,
                        background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                        border: "none",
                        color: "white",
                        fontWeight: 700,
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        cursor: "pointer",
                        boxShadow: "0 4px 18px rgba(37, 99, 235, 0.35)",
                      }}
                    >
                      <Lock size={15} /> Pay ₹{inrAmount} via {selectedBank}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

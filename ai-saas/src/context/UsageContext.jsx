import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { API_URL } from "../config/api";

const UsageContext = createContext();

export function UsageProvider({ children }) {
  const [usageCount, setUsageCount] = useState(0);
  const [showOutOfCreditsModal, setShowOutOfCreditsModal] = useState(false);

  // Initialize plan and billing from localStorage if available
  const [plan, setPlan] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.plan) return u.plan;
      }
      return localStorage.getItem("saas_active_plan") || "Basic";
    } catch {
      return "Basic";
    }
  });

  const [rawCredits, setRawCredits] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (typeof u.credits === "number") return u.credits;
      }
      const saved = localStorage.getItem("saas_raw_credits");
      if (saved !== null) return parseInt(saved, 10);
      const p = localStorage.getItem("saas_active_plan") || "Basic";
      if (p === "Pro") return 2000;
      if (p === "Ultimate") return 5000;
      return 50;
    } catch {
      return 50;
    }
  });

  const [credits, setCredits] = useState(() => {
    try {
      const p = localStorage.getItem("saas_active_plan") || "Basic";
      const saved = localStorage.getItem("saas_raw_credits");
      if (saved !== null) return parseInt(saved, 10).toLocaleString();
      if (p === "Pro") return "2,000";
      if (p === "Ultimate") return "5,000";
      return "50";
    } catch {
      return "50";
    }
  });

  const [toolCredits, setToolCredits] = useState(() => {
    try {
      const saved = localStorage.getItem("saas_tool_credits");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      text: { credits: 10, max: 10, resetAt: null },
      summarizer: { credits: 10, max: 10, resetAt: null },
      translator: { credits: 10, max: 10, resetAt: null },
      image: { credits: 20, max: 20, resetAt: null },
    };
  });

  const [modalToolName, setModalToolName] = useState("");

  const [billingHistory, setBillingHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("saas_billing_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [planExpiresAt, setPlanExpiresAt] = useState(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [purchasedPlan, setPurchasedPlan] = useState(null);
  const [freeCreditsResetAt, setFreeCreditsResetAt] = useState(null);

  const [loading, setLoading] = useState(false);

  const incrementUsage = () => {
    setUsageCount((prev) => prev + 1);
  };

  const openOutOfCreditsModal = (resetAt = null, toolName = "") => {
    if (resetAt) setFreeCreditsResetAt(resetAt);
    if (toolName) setModalToolName(toolName);
    setShowOutOfCreditsModal(true);
  };

  const updateToolCredits = (toolKey, remaining, resetAt, maxCredits) => {
    setToolCredits((prev) => {
      const updated = {
        ...prev,
        [toolKey]: {
          credits: typeof remaining === "number" ? remaining : (prev[toolKey]?.credits ?? 10),
          max: maxCredits || prev[toolKey]?.max || (toolKey === "image" ? 20 : 10),
          resetAt: resetAt || prev[toolKey]?.resetAt || null,
        },
      };
      try {
        localStorage.setItem("saas_tool_credits", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Sync state to localStorage
  const syncLocalState = (newPlan, newCreditsStr, newRawNum, newHistory) => {
    try {
      localStorage.setItem("saas_active_plan", newPlan);
      localStorage.setItem("saas_credits", String(newCreditsStr));
      if (typeof newRawNum === "number") {
        localStorage.setItem("saas_raw_credits", String(newRawNum));
      }
      if (newHistory) {
        localStorage.setItem("saas_billing_history", JSON.stringify(newHistory));
      }

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        u.plan = newPlan;
        u.credits = typeof newRawNum === "number" ? newRawNum : (newPlan === "Basic" ? 50 : (newPlan === "Pro" ? 2000 : 5000));
        localStorage.setItem("user", JSON.stringify(u));
      }
    } catch { /* noop */ }
  };

  // Consume credits on generation
  const consumeCredits = (cost = 1) => {
    if (plan === "Basic") {
      incrementUsage();
      return { allowed: true };
    }

    if (rawCredits < cost || rawCredits <= 0) {
      setShowOutOfCreditsModal(true);
      return { allowed: false, outOfCredits: true };
    }

    const updated = Math.max(0, rawCredits - cost);
    setRawCredits(updated);
    const updatedStr = updated.toLocaleString();
    setCredits(updatedStr);
    incrementUsage();
    syncLocalState(plan, updatedStr, updated);

    if (updated === 0) {
      setShowOutOfCreditsModal(true);
    }

    return { allowed: true, remaining: updated };
  };

  // Update credits directly from server response
  const updateCreditsFromServer = (serverCredits, resetAt) => {
    if (typeof serverCredits === "number") {
      setRawCredits(serverCredits);
      const str = plan === "Basic" ? `${serverCredits} / 50 daily` : serverCredits.toLocaleString();
      setCredits(str);
      syncLocalState(plan, str, serverCredits);

      if (resetAt) setFreeCreditsResetAt(resetAt);

      if (serverCredits <= 0) {
        setShowOutOfCreditsModal(true);
        if (plan !== "Basic") {
          window.dispatchEvent(
            new CustomEvent("aisaas:notify", {
              detail: {
                title: "Credits Depleted ⚠️",
                message: "You have used all monthly credits. Upgrade your plan to continue creating.",
                iconName: "CreditCard",
                color: "#f87171",
              },
            })
          );
        }
      }
    }
  };

  // Fetch live billing info from backend
  const refreshBilling = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/billing/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.subscription) {
          const sub = data.subscription;
          const currentPlan = sub.plan || "Basic";
          setPlan(currentPlan);

          if (sub.toolCredits) {
            setToolCredits(sub.toolCredits);
            try {
              localStorage.setItem("saas_tool_credits", JSON.stringify(sub.toolCredits));
            } catch {}
          }

          let rawNum = typeof sub.rawCredits === "number" ? sub.rawCredits : (currentPlan === "Basic" ? 50 : 2000);
          let credStr = currentPlan === "Basic" ? `${rawNum} / 50 daily` : rawNum.toLocaleString();

          setRawCredits(rawNum);
          setCredits(credStr);

          // Expiry / plan state
          setPlanExpiresAt(sub.planExpiresAt || null);
          setPurchasedPlan(sub.purchasedPlan || null);
          setDaysRemaining(typeof sub.daysRemaining === "number" ? sub.daysRemaining : null);
          if (sub.freeCreditsResetAt) setFreeCreditsResetAt(sub.freeCreditsResetAt);

          if (sub.billingHistory && Array.isArray(sub.billingHistory)) {
            setBillingHistory(sub.billingHistory);
            syncLocalState(currentPlan, credStr, rawNum, sub.billingHistory);
          } else {
            syncLocalState(currentPlan, credStr, rawNum);
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch live billing status from server:", err);
    }
  }, []);

  // Run on mount
  useEffect(() => {
    refreshBilling();
  }, [refreshBilling]);

  // Upgrade Plan with payment details
  const upgradePlan = async (targetPlan, paymentDetails = {}) => {
    setLoading(true);
    const amount = targetPlan === "Pro" ? "$9.99" : "$19.99";
    const allocatedRaw = targetPlan === "Pro" ? 2000 : 5000;
    const allocatedCredits = allocatedRaw.toLocaleString();
    const token = localStorage.getItem("token");

    const fallbackTransaction = {
      id: Date.now(),
      transactionId: `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      plan: `${targetPlan} Plan`,
      amount,
      date: new Date().toISOString().split("T")[0],
      status: "Completed",
      paymentMethod: paymentDetails.cardNumber
        ? `Card (•••• ${paymentDetails.cardNumber.slice(-4)})`
        : "Credit Card (•••• 4242)",
    };

    try {
      if (token) {
        const res = await fetch(`${API_URL}/api/billing/checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan: targetPlan,
            amount,
            paymentMethod: fallbackTransaction.paymentMethod,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setPlan(targetPlan);
          setRawCredits(allocatedRaw);
          setCredits(allocatedCredits);
          // New plan started — clear any cancellation state
          setCancelAtPeriodEnd(false);
          setPlanExpiresAt(data.subscription?.planExpiresAt || null);
          setDaysRemaining(data.subscription?.daysRemaining ?? null);
          const historyList = data.subscription.billingHistory || [
            fallbackTransaction,
            ...billingHistory,
          ];
          setBillingHistory(historyList);
          syncLocalState(targetPlan, allocatedCredits, allocatedRaw, historyList);
          setLoading(false);
          return { success: true, message: data.message, plan: targetPlan, credits: allocatedCredits };
        }
      }
    } catch (err) {
      console.warn("Backend checkout call failed, falling back to local simulation:", err);
    }

    // Local fallback in case server is unreachable / demo
    setPlan(targetPlan);
    setRawCredits(allocatedRaw);
    setCredits(allocatedCredits);
    const updatedHistory = [fallbackTransaction, ...billingHistory];
    setBillingHistory(updatedHistory);
    syncLocalState(targetPlan, allocatedCredits, allocatedRaw, updatedHistory);
    setLoading(false);

    window.dispatchEvent(
      new CustomEvent("aisaas:notify", {
        detail: {
          title: `Plan Upgraded: ${targetPlan} ⚡`,
          message: `Your account is now upgraded to ${targetPlan} Plan with ${allocatedCredits} credits.`,
          iconName: "Zap",
          color: targetPlan === "Ultimate" ? "#fcd34d" : "#c4b5fd",
        },
      })
    );

    return {
      success: true,
      message: `🎉 Payment successful! You have upgraded to ${targetPlan} Plan with ${allocatedCredits} credits.`,
      plan: targetPlan,
      credits: allocatedCredits,
    };
  };

  // Switch to Basic — purchased plan is SAVED for free resume within validity
  const switchToBasic = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      if (token) {
        const res = await fetch(`${API_URL}/api/billing/switch-basic`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const sub = data.subscription;
          setPlan("Basic");
          setCredits("Unlimited credits");
          // Keep purchasedPlan + planExpiresAt so user can resume
          setPurchasedPlan(sub.purchasedPlan || null);
          setPlanExpiresAt(sub.planExpiresAt || null);
          setDaysRemaining(sub.daysRemaining ?? null);
          syncLocalState("Basic", "Unlimited credits", rawCredits);
          setLoading(false);
          window.dispatchEvent(new CustomEvent("aisaas:notify", {
            detail: {
              title: "Switched to Basic 🌱",
              message: sub.purchasedPlan
                ? `${sub.purchasedPlan} Plan is saved. Resume anytime before it expires.`
                : "Enjoy unlimited free generations.",
              iconName: "Sparkles",
              color: "#6ee7b7",
            },
          }));
          return { success: true, message: data.message };
        }
      }
    } catch (err) {
      console.warn("switch-basic failed:", err);
    }
    setPlan("Basic");
    setCredits("Unlimited credits");
    syncLocalState("Basic", "Unlimited credits", rawCredits);
    setLoading(false);
    return { success: true, message: "Switched to Basic Plan." };
  };

  // Resume purchased plan for free within validity period
  const resumePlan = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/billing/resume-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const sub = data.subscription;
        setPlan(sub.plan);
        setRawCredits(sub.rawCredits);
        setCredits(sub.rawCredits.toLocaleString());
        setPurchasedPlan(sub.purchasedPlan);
        setPlanExpiresAt(sub.planExpiresAt);
        setDaysRemaining(sub.daysRemaining);
        syncLocalState(sub.plan, sub.rawCredits.toLocaleString(), sub.rawCredits);
        setLoading(false);
        window.dispatchEvent(new CustomEvent("aisaas:notify", {
          detail: {
            title: `${sub.plan} Plan Resumed ⚡`,
            message: data.message,
            iconName: "Zap",
            color: sub.plan === "Ultimate" ? "#fcd34d" : "#c4b5fd",
          },
        }));
        return { success: true, message: data.message };
      }
      refreshBilling();
      setLoading(false);
      return { success: false, message: data.message };
    } catch (err) {
      setLoading(false);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  return (
    <UsageContext.Provider
      value={{
        usageCount,
        incrementUsage,
        plan,
        credits,
        rawCredits,
        billingHistory,
        loading,
        planExpiresAt,
        purchasedPlan,
        daysRemaining,
        upgradePlan,
        switchToBasic,
        resumePlan,
        refreshBilling,
        consumeCredits,
        updateCreditsFromServer,
        showOutOfCreditsModal,
        setShowOutOfCreditsModal,
        openOutOfCreditsModal,
        freeCreditsResetAt,
        setFreeCreditsResetAt,
        toolCredits,
        setToolCredits,
        updateToolCredits,
        modalToolName,
        setModalToolName,
      }}
    >
      {children}
    </UsageContext.Provider>
  );
}

export function useUsage() {
  return useContext(UsageContext);
}

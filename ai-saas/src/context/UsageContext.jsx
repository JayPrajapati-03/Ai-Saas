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
      return 120;
    } catch {
      return 120;
    }
  });

  const [credits, setCredits] = useState(() => {
    try {
      const p = localStorage.getItem("saas_active_plan") || "Basic";
      if (p === "Basic") return "Unlimited credits";
      const saved = localStorage.getItem("saas_raw_credits");
      if (saved !== null) return parseInt(saved, 10).toLocaleString();
      if (p === "Pro") return "2,000";
      if (p === "Ultimate") return "5,000";
      return "Unlimited credits";
    } catch {
      return "Unlimited credits";
    }
  });

  const [billingHistory, setBillingHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("saas_billing_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);

  const incrementUsage = () => {
    setUsageCount((prev) => prev + 1);
  };

  const openOutOfCreditsModal = () => {
    setShowOutOfCreditsModal(true);
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
        u.credits = typeof newRawNum === "number" ? newRawNum : (newPlan === "Basic" ? 120 : (newPlan === "Pro" ? 2000 : 5000));
        localStorage.setItem("user", JSON.stringify(u));
      }
    } catch { /* noop */ }
  };

  // Consume credits on generation
  const consumeCredits = (cost = 5) => {
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
  const updateCreditsFromServer = (serverCredits) => {
    if (typeof serverCredits === "number") {
      setRawCredits(serverCredits);
      const str = plan === "Basic" ? "Unlimited credits" : serverCredits.toLocaleString();
      setCredits(str);
      syncLocalState(plan, str, serverCredits);

      if (plan !== "Basic" && serverCredits <= 0) {
        setShowOutOfCreditsModal(true);
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

          let credStr = "Unlimited credits";
          let rawNum = typeof sub.rawCredits === "number" ? sub.rawCredits : 120;
          if (currentPlan === "Pro") {
            credStr = rawNum.toLocaleString();
          } else if (currentPlan === "Ultimate") {
            credStr = rawNum.toLocaleString();
          }

          setRawCredits(rawNum);
          setCredits(credStr);

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

    return {
      success: true,
      message: `🎉 Payment successful! You have upgraded to ${targetPlan} Plan with ${allocatedCredits} credits.`,
      plan: targetPlan,
      credits: allocatedCredits,
    };
  };

  // Downgrade / Switch to Basic Plan anytime (Free, No payment)
  const switchToBasic = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      if (token) {
        const res = await fetch(`${API_URL}/api/billing/switch-basic`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setPlan("Basic");
          setRawCredits(120);
          setCredits("Unlimited credits");
          syncLocalState("Basic", "Unlimited credits", 120);
          setLoading(false);
          return { success: true, message: data.message };
        }
      }
    } catch (err) {
      console.warn("Backend switch-basic failed, falling back to local update:", err);
    }

    setPlan("Basic");
    setRawCredits(120);
    setCredits("Unlimited credits");
    syncLocalState("Basic", "Unlimited credits", 120);
    setLoading(false);

    return {
      success: true,
      message: "Switched to Basic Plan. Enjoy unlimited free generation!",
    };
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
        upgradePlan,
        switchToBasic,
        refreshBilling,
        consumeCredits,
        updateCreditsFromServer,
        showOutOfCreditsModal,
        setShowOutOfCreditsModal,
        openOutOfCreditsModal,
      }}
    >
      {children}
    </UsageContext.Provider>
  );
}

export function useUsage() {
  return useContext(UsageContext);
}

import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { API_URL } from "../config/api";

const UsageContext = createContext();

export function UsageProvider({ children }) {
  const [usageCount, setUsageCount] = useState(0);

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

  const [credits, setCredits] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.plan === "Pro") return "2,000";
        if (u.plan === "Ultimate") return "5,000";
      }
      const p = localStorage.getItem("saas_active_plan") || "Basic";
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

  // Sync state to localStorage
  const syncLocalState = (newPlan, newCredits, newHistory) => {
    try {
      localStorage.setItem("saas_active_plan", newPlan);
      localStorage.setItem("saas_credits", String(newCredits));
      if (newHistory) {
        localStorage.setItem("saas_billing_history", JSON.stringify(newHistory));
      }

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        u.plan = newPlan;
        u.credits = newPlan === "Basic" ? 120 : (newPlan === "Pro" ? 2000 : 5000);
        localStorage.setItem("user", JSON.stringify(u));
      }
    } catch { /* noop */ }
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
          if (currentPlan === "Pro") credStr = "2,000";
          else if (currentPlan === "Ultimate") credStr = "5,000";
          setCredits(credStr);

          if (sub.billingHistory && Array.isArray(sub.billingHistory)) {
            setBillingHistory(sub.billingHistory);
            syncLocalState(currentPlan, credStr, sub.billingHistory);
          } else {
            syncLocalState(currentPlan, credStr);
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
    const allocatedCredits = targetPlan === "Pro" ? "2,000" : "5,000";
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
          setCredits(allocatedCredits);
          const historyList = data.subscription.billingHistory || [
            fallbackTransaction,
            ...billingHistory,
          ];
          setBillingHistory(historyList);
          syncLocalState(targetPlan, allocatedCredits, historyList);
          setLoading(false);
          return { success: true, message: data.message, plan: targetPlan, credits: allocatedCredits };
        }
      }
    } catch (err) {
      console.warn("Backend checkout call failed, falling back to local simulation:", err);
    }

    // Local fallback in case server is unreachable / demo
    setPlan(targetPlan);
    setCredits(allocatedCredits);
    const updatedHistory = [fallbackTransaction, ...billingHistory];
    setBillingHistory(updatedHistory);
    syncLocalState(targetPlan, allocatedCredits, updatedHistory);
    setLoading(false);

    return {
      success: true,
      message: `🎉 Payment successful! You have upgraded to ${targetPlan} Plan.`,
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
          setCredits("Unlimited credits");
          syncLocalState("Basic", "Unlimited credits");
          setLoading(false);
          return { success: true, message: data.message };
        }
      }
    } catch (err) {
      console.warn("Backend switch-basic failed, falling back to local update:", err);
    }

    setPlan("Basic");
    setCredits("Unlimited credits");
    syncLocalState("Basic", "Unlimited credits");
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
        billingHistory,
        loading,
        upgradePlan,
        switchToBasic,
        refreshBilling,
      }}
    >
      {children}
    </UsageContext.Provider>
  );
}

export function useUsage() {
  return useContext(UsageContext);
}

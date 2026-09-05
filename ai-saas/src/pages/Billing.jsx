import { useState } from "react";
import { Check, CreditCard, Clock } from "lucide-react";

export default function Billing() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activePlan, setActivePlan] = useState("Basic");
  const [credits, setCredits] = useState("Unlimited credits");
  const [history, setHistory] = useState([]);

  const plans = [
    {
      name: "Basic",
      price: "Free",
      credits: "Unlimited credits",
      features: [
        "AI Text",
        "AI Summarizer",
        "Basic Translation",
        "Basic Image Generator",
      ],
    },
    {
      name: "Pro",
      price: "$9.99",
      credits: "2000 credits / month",
      features: [
        "AI Text (Fast)",
        "AI Summarizer Pro",
        "Image Generator",
        "Advanced Translator",
      ],
    },
    {
      name: "Ultimate",
      price: "$19.99",
      credits: "5000 credits / month",
      features: [
        "Ultra Fast AI",
        "Image HD Generation",
        "Priority Queue",
        "All Features Included",
      ],
    },
  ];

  const handleUpgrade = (plan) => {
    setActivePlan(plan.name);

    // Update credits based on plan
    if (plan.name === "Basic") {
      setCredits("Unlimited credits");
    } else if (plan.name === "Pro") {
      setCredits("2000");
    } else if (plan.name === "Ultimate") {
      setCredits("5000");
    }

    // Add to history if it's not free
    if (plan.price !== "Free") {
      const newTransaction = {
        id: Date.now(),
        plan: `${plan.name} Plan`,
        amount: plan.price,
        date: new Date().toISOString().split('T')[0]
      };
      setHistory([newTransaction, ...history]);
    }

    // Remove highlight after selection
    setSelectedPlan(null);
  };

  return (
    <div className="space-y-8">

      {/* Page Title */}
      <h1 className="text-3xl font-bold">
        Billing <span className="text-indigo-400">Center</span>
      </h1>

      {/* Current Plan */}
      <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
        <h2 className="text-xl font-semibold">Your Current Plan</h2>

        <p className="text-gray-300 mt-2">
          <span className="text-indigo-400 font-semibold">{activePlan} Plan</span> — renews monthly
        </p>

        <div className="mt-4 p-4 bg-black/20 rounded-xl border border-white/10">
          <p className="text-gray-300">Credits remaining:</p>
          <h1 className="text-4xl font-bold text-green-400 mt-1">{credits}</h1>
        </div>
      </div>

      {/* Pricing Plans */}
      <h2 className="text-2xl font-bold">Upgrade Your Plan</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <div
            key={index}
            onClick={() => setSelectedPlan(plan.name)}
            className={`p-6 rounded-2xl backdrop-blur-xl border cursor-pointer transition-all duration-300 ${selectedPlan === plan.name
              ? "bg-indigo-600/20 border-indigo-500 scale-105 shadow-lg shadow-indigo-500/20"
              : "bg-white/10 border-white/10 hover:border-white/30"
              }`}
          >
            <h3 className="text-2xl font-bold">{plan.name}</h3>
            <p className="text-3xl font-semibold mt-2">{plan.price}</p>
            <p className="text-gray-300 mt-1">{plan.credits}</p>

            <ul className="mt-4 space-y-2">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 whitespace-nowrap">
                  <Check size={18} className="text-green-400" /> {f}
                </li>
              ))}
            </ul>

            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                handleUpgrade(plan);
              }}
              className={`mt-6 w-full px-4 py-3 rounded-xl font-semibold transition ${selectedPlan === plan.name
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-white/10 hover:bg-white/20 text-gray-300"
                }`}
            >
              {activePlan === plan.name ? "Current Plan" : (selectedPlan === plan.name ? "Upgrade Now" : "Choose Plan")}
            </button>
          </div>
        ))}
      </div>

      {/* Payment History */}
      <div>
        <h2 className="text-2xl font-bold mt-6">Payment History</h2>

        <div className="mt-4 p-6 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl">
          {history.length === 0 ? (
            <p className="text-gray-300">No transactions found.</p>
          ) : (
            <div className="space-y-4">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/10"
                >
                  <div>
                    <p className="font-semibold">{h.plan}</p>
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      <Clock size={16} /> {h.date}
                    </p>
                  </div>
                  <p className="font-semibold text-indigo-400">{h.amount}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

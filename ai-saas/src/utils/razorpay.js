/**
 * Razorpay Standard Checkout Gateway Helper
 * Creates a backend Order then opens the official Razorpay Checkout popup.
 *
 * Flow:
 * 1. Backend creates Razorpay Order → returns { order_id, key_id }
 * 2. Frontend opens window.Razorpay({ key, order_id, ... }) popup
 * 3. User pays → handler fires → onSuccess() → plan upgraded in MongoDB
 */

const API_BASE = "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const loadRazorpaySDK = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Creates a Razorpay Order on the backend and opens the official popup.
 * Falls back to custom sandbox modal via onError if something goes wrong.
 */
export const openRazorpayCheckout = async ({
  plan,
  user,
  onSuccess,
  onDismiss,
  onError,
}) => {
  try {
    // Step 1: Load Razorpay SDK
    const isLoaded = await loadRazorpaySDK();
    if (!isLoaded || !window.Razorpay) {
      console.warn("[Razorpay] SDK failed to load.");
      if (onError) onError("Could not load Razorpay SDK.");
      return;
    }

    const priceVal = plan.priceVal || (plan.name === "Pro" ? 9.99 : 19.99);
    const amountInPaise = Math.round(priceVal * 83 * 100);

    // Step 2: Create backend Razorpay Order
    let orderId = null;
    let keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TlNP0PWHI4uhH5";

    try {
      const res = await fetch(`${API_BASE}/billing/create-order`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ plan: plan.name }),
      });

      const data = await res.json();
      console.log("[Razorpay] Order API response:", data);

      if (res.ok && data.success) {
        orderId = data.order.id;
        keyId = data.keyId || keyId;
        console.log("[Razorpay] Order created:", orderId);
      } else {
        // Backend returned an error — fall back to sandbox modal
        const errMsg = data.message || "Order creation failed";
        console.warn("[Razorpay] Order creation failed:", errMsg);
        if (onError) onError(errMsg);
        return;
      }
    } catch (fetchErr) {
      console.warn("[Razorpay] Network error on create-order:", fetchErr.message);
      if (onError) onError("Could not connect to payment server. Please check your connection.");
      return;
    }

    // Step 3: Open official Razorpay Checkout with the order_id
    const options = {
      key: keyId,
      amount: amountInPaise,
      currency: "INR",
      order_id: orderId,
      name: "AISaaS Studio",
      description: `${plan.name} Plan • ${plan.credits}`,
      prefill: {
        name: user?.name || "Demo User",
        email: user?.email || "user@example.com",
        contact: "9999999999",
      },
      notes: {
        plan: plan.name,
        credits: plan.credits,
      },
      theme: {
        color: plan.name === "Ultimate" ? "#8b5cf6" : "#6366f1",
      },
      handler: function (response) {
        console.log("[Razorpay] Payment success:", response);
        if (onSuccess) {
          onSuccess({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            paymentMethod: "Razorpay Official Checkout",
            amount: plan.price,
          });
        }
      },
      modal: {
        ondismiss: function () {
          console.log("[Razorpay] Modal dismissed by user.");
          if (onDismiss) onDismiss();
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (resp) => {
      console.error("[Razorpay] Payment failed:", resp.error);
      if (onError) onError(resp.error?.description || "Payment failed.");
    });
    rzp.open();
  } catch (err) {
    console.error("[Razorpay] Unexpected error:", err);
    if (onError) onError(err.message || "Could not launch Razorpay.");
  }
};

export const DAILY_FREE_CREDITS = 50;

/**
 * Checks if the user is on the Basic plan and if their 24-hour reset time has arrived.
 * If 24 hours have passed since credits were depleted, resets credits to 50.
 * Also initializes credits to 50 if user was undefined or had old unlimited values.
 */
export async function checkAndResetDailyCredits(user) {
  if (!user || user.plan !== "Basic") return false;

  const now = new Date();

  // If a reset time was set and that time has arrived:
  if (user.freeCreditsResetAt && now >= new Date(user.freeCreditsResetAt)) {
    user.credits = DAILY_FREE_CREDITS;
    user.freeCreditsResetAt = null;
    await user.save();
    return true;
  }

  // If user is on Basic but never had credits set (or credits is NaN):
  if (typeof user.credits !== "number" || isNaN(user.credits)) {
    user.credits = DAILY_FREE_CREDITS;
    await user.save();
    return true;
  }

  return false;
}

/**
 * Deducts credits for an operation.
 * Works uniformly for both Basic (50 daily credits) and Paid plans (Pro 2,000 / Ultimate 5,000).
 * If user does not have enough credits, returns { allowed: false, outOfCredits: true, message, remainingCredits, freeCreditsResetAt }
 * If Basic user reaches 0 credits (or < 5 min cost), sets freeCreditsResetAt to exactly 24 hours from now.
 */
export async function deductCredits(user, cost) {
  await checkAndResetDailyCredits(user);

  const currentCredits = user.credits ?? 0;
  if (currentCredits < cost) {
    // If not already scheduled for Basic plan, set 24h renewal from now
    if (user.plan === "Basic" && !user.freeCreditsResetAt) {
      user.freeCreditsResetAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();
    }

    return {
      success: false,
      outOfCredits: true,
      remainingCredits: currentCredits,
      freeCreditsResetAt: user.freeCreditsResetAt,
      message:
        user.plan === "Basic"
          ? "You have used your daily free credits. Upgrade to a paid plan for instant credits, or wait 24 hours for daily renewal."
          : "You have 0 credits remaining on your plan. Please purchase credits or renew on the Billing page.",
    };
  }

  // Deduct credits
  user.credits = Math.max(0, currentCredits - cost);

  // If Basic user just depleted credits below minimum tool cost (5 credits):
  if (user.plan === "Basic" && user.credits < 5 && !user.freeCreditsResetAt) {
    user.freeCreditsResetAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  await user.save();
  return {
    success: true,
    remainingCredits: user.credits,
    freeCreditsResetAt: user.freeCreditsResetAt,
  };
}

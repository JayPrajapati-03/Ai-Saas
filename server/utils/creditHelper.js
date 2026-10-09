export const TOTAL_DAILY_FREE_CREDITS = 50;

export const TOOL_LIMITS = {
  text: {
    name: "Text Generator",
    dailyCredits: 10,
    cost: 1,
    unit: "prompt",
  },
  summarizer: {
    name: "Summarizer",
    dailyCredits: 10,
    cost: 1,
    unit: "summary",
  },
  translator: {
    name: "Translator",
    dailyCredits: 10,
    cost: 1,
    unit: "translation",
  },
  image: {
    name: "Image Generator",
    dailyCredits: 20,
    cost: 5,
    unit: "image",
  },
};

/**
 * Initializes and resets any tool credits whose 24-hour window has expired.
 * Sums remaining credits to user.credits.
 */
export function ensureAndResetAllToolCredits(user) {
  if (!user || user.plan !== "Basic") return false;

  if (!user.toolCredits) {
    user.toolCredits = {};
  }

  const now = new Date();
  let modified = false;

  for (const [key, config] of Object.entries(TOOL_LIMITS)) {
    if (!user.toolCredits[key]) {
      user.toolCredits[key] = {
        credits: config.dailyCredits,
        resetAt: null,
      };
      modified = true;
    }

    const tool = user.toolCredits[key];

    // Check if 24 hours elapsed from when tool was depleted
    if (tool.resetAt && now >= new Date(tool.resetAt)) {
      tool.credits = config.dailyCredits;
      tool.resetAt = null;
      modified = true;
    }

    // Sanitize any NaN or missing values
    if (typeof tool.credits !== "number" || isNaN(tool.credits)) {
      tool.credits = config.dailyCredits;
      modified = true;
    }
  }

  // Sync overall user credits to the sum of all 4 tools (max 50)
  const total =
    (user.toolCredits.text?.credits ?? 10) +
    (user.toolCredits.summarizer?.credits ?? 10) +
    (user.toolCredits.translator?.credits ?? 10) +
    (user.toolCredits.image?.credits ?? 20);

  if (user.credits !== total) {
    user.credits = total;
    modified = true;
  }

  return modified;
}

/**
 * Backwards compatibility helper for overall daily check.
 */
export async function checkAndResetDailyCredits(user) {
  if (!user || user.plan !== "Basic") return false;
  const changed = ensureAndResetAllToolCredits(user);
  if (changed) {
    await user.save();
  }
  return changed;
}

/**
 * Deduct credits specifically for a tool (text, summarizer, translator, image).
 * Basic Plan:
 *   - Text: 10 credits/day, 1 credit/use (10 uses/day)
 *   - Summarizer: 10 credits/day, 1 credit/use (10 uses/day)
 *   - Translator: 10 credits/day, 1 credit/use (10 uses/day)
 *   - Image: 20 credits/day, 5 credits/image (4 images/day)
 *   - Once a tool's credits are used up, that tool is locked for 24h from depletion.
 * Paid Plan (Pro/Ultimate):
 *   - Shared monthly balance, costs 1 credit (or 5 for image).
 */
export async function deductToolCredits(user, toolKey) {
  const config = TOOL_LIMITS[toolKey];
  if (!config) {
    throw new Error(`Unknown tool key: ${toolKey}`);
  }

  // Handle Paid Plans (Pro / Ultimate)
  if (user.plan !== "Basic") {
    const cost = config.cost;
    const currentCredits = user.credits ?? 0;

    if (currentCredits < cost) {
      return {
        success: false,
        outOfCredits: true,
        tool: toolKey,
        toolName: config.name,
        cost,
        remainingCredits: currentCredits,
        freeCreditsResetAt: null,
        message: `You have 0 credits remaining on your ${user.plan} plan. Please upgrade or add credits on the Billing page.`,
      };
    }

    user.credits = Math.max(0, currentCredits - cost);
    await user.save();

    return {
      success: true,
      tool: toolKey,
      toolName: config.name,
      cost,
      remainingCredits: user.credits,
      maxCredits: null,
      totalCredits: user.credits,
      freeCreditsResetAt: null,
    };
  }

  // Handle Basic Plan
  ensureAndResetAllToolCredits(user);

  const tool = user.toolCredits[toolKey];
  const currentCredits = tool.credits ?? 0;
  const cost = config.cost;

  // Check if out of credits for this tool
  if (currentCredits < cost) {
    if (!tool.resetAt) {
      tool.resetAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      user.markModified("toolCredits");
      await user.save();
    }

    return {
      success: false,
      outOfCredits: true,
      tool: toolKey,
      toolName: config.name,
      cost,
      remainingCredits: currentCredits,
      maxCredits: config.dailyCredits,
      freeCreditsResetAt: tool.resetAt,
      message: `You have used all daily credits for ${config.name} (${config.dailyCredits} credits/day). Please wait 24 hours for renewal or upgrade to a paid plan.`,
    };
  }

  // Deduct
  tool.credits = Math.max(0, currentCredits - cost);

  // If now depleted below cost, set 24h reset timer
  if (tool.credits < cost && !tool.resetAt) {
    tool.resetAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  // Update total credits pool
  user.credits =
    (user.toolCredits.text?.credits ?? 10) +
    (user.toolCredits.summarizer?.credits ?? 10) +
    (user.toolCredits.translator?.credits ?? 10) +
    (user.toolCredits.image?.credits ?? 20);

  user.markModified("toolCredits");
  await user.save();

  return {
    success: true,
    tool: toolKey,
    toolName: config.name,
    cost,
    remainingCredits: tool.credits,
    maxCredits: config.dailyCredits,
    totalCredits: user.credits,
    freeCreditsResetAt: tool.resetAt,
  };
}

/**
 * Generic deduct credits wrapper for backward compatibility.
 */
export async function deductCredits(user, costOrTool = "text") {
  if (typeof costOrTool === "string" && TOOL_LIMITS[costOrTool]) {
    return deductToolCredits(user, costOrTool);
  }
  return deductToolCredits(user, "text");
}

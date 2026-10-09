import OpenAI from "openai";
import User from "../models/User.js";
import History from "../models/History.js";
import { deductToolCredits } from "../utils/creditHelper.js";

export const translateText = async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "API key not configured.",
      });
    }

    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "AI Web App",
      },
    });

    const { text, targetLanguage } = req.body;
    const userId = req.user.id; // Assuming auth middleware sets req.user

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Text is required for translation.",
      });
    }

    if (!targetLanguage || targetLanguage.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Target language is required.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Credits check (1 credit per translation, 10 credits/day max on Basic)
    const creditResult = await deductToolCredits(user, "translator");
    if (!creditResult.success) {
      return res.status(403).json({
        success: false,
        outOfCredits: true,
        message: creditResult.message,
        remainingCredits: creditResult.remainingCredits,
        maxCredits: creditResult.maxCredits,
        freeCreditsResetAt: creditResult.freeCreditsResetAt,
        tool: "translator",
      });
    }

    const completion = await client.chat.completions.create({
      model: "meta-llama/llama-3.1-70b-instruct",
      messages: [
        {
          role: "system",
          content:
            "You are a professional translator. Translate text accurately while preserving meaning. Do NOT add extra information.",
        },
        {
          role: "user",
          content: `Translate the following text to ${targetLanguage}:\n\n${text}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const translated = completion.choices[0].message.content;

    // Increment usage
    user.todayUsage = (user.todayUsage || 0) + 1;
    user.totalUsage = (user.totalUsage || 0) + 1;
    await user.save();

    // Save to History
    await History.create({
      user: userId,
      type: "translate",
      title: "Translation Completed",
      content: `Translated to ${targetLanguage}`,
    });

    res.json({
      success: true,
      translated,
      remainingCredits: creditResult.remainingCredits,
      maxCredits: creditResult.maxCredits,
      totalCredits: creditResult.totalCredits ?? user.credits,
      freeCreditsResetAt: creditResult.freeCreditsResetAt,
      tool: "translator",
    });

  } catch (error) {
    console.error("Translator Error:", error);
    res.status(500).json({
      success: false,
      message: "Translation failed.",
      error: error?.message,
    });
  }
};

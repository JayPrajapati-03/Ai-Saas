import OpenAI from "openai";
import User from "../models/User.js";
import History from "../models/History.js";
import { deductToolCredits } from "../utils/creditHelper.js";

export const summarizeText = async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
      return res.status(500).json({
        success: false,
        message: "OpenRouter API key not configured. Please get a free API key from https://openrouter.ai/keys and add it to server/.env as OPENROUTER_API_KEY",
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

    const { text } = req.body;
    const userId = req.user.id; // Assuming auth middleware sets req.user

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Text is required to summarize.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Credits check (1 credit per summary, 10 credits/day max on Basic)
    const creditResult = await deductToolCredits(user, "summarizer");
    if (!creditResult.success) {
      return res.status(403).json({
        success: false,
        outOfCredits: true,
        message: creditResult.message,
        remainingCredits: creditResult.remainingCredits,
        maxCredits: creditResult.maxCredits,
        freeCreditsResetAt: creditResult.freeCreditsResetAt,
        tool: "summarizer",
      });
    }

    const completion = await client.chat.completions.create({
      model: "meta-llama/llama-3.1-70b-instruct",
      messages: [
        {
          role: "system",
          content:
            "You are an expert summarizer. Produce clear, concise, human-like summaries. Remove filler and focus on main points.",
        },
        {
          role: "user",
          content: `Summarize the following text:\n\n${text}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 350,
    });

    const output = completion.choices[0].message.content;

    // Increment usage (user already saved inside deductCredits)
    user.todayUsage = (user.todayUsage || 0) + 1;
    user.totalUsage = (user.totalUsage || 0) + 1;
    await user.save();

    // Save to History
    await History.create({
      user: userId,
      type: "summary",
      title: "Summary Created",
      content: text.substring(0, 100) + "...", // Store truncated input
    });

    res.json({
      success: true,
      summary: output,
      remainingCredits: creditResult.remainingCredits,
      maxCredits: creditResult.maxCredits,
      totalCredits: creditResult.totalCredits ?? user.credits,
      freeCreditsResetAt: creditResult.freeCreditsResetAt,
      tool: "summarizer",
    });

  } catch (error) {
    console.error("Summarizer Error:", error);
    res.status(500).json({
      success: false,
      message: "Summarization failed.",
      error: error?.message,
    });
  }
};

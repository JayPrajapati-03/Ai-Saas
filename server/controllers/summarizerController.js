import OpenAI from "openai";
import User from "../models/User.js";
import History from "../models/History.js";

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

    // Credits usage check for paid plans
    const summaryCost = 5;
    if (user.plan && user.plan !== "Basic") {
      if ((user.credits || 0) < summaryCost) {
        return res.status(403).json({
          success: false,
          outOfCredits: true,
          message: "You have 0 credits remaining. Please purchase credits again on the Billing page to continue summarizing.",
          remainingCredits: user.credits || 0,
        });
      }
      user.credits = Math.max(0, (user.credits || 0) - summaryCost);
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

    // Increment usage
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
      remainingCredits: user.credits,
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

import OpenAI from "openai";
import User from "../models/User.js";
import History from "../models/History.js";
import { deductToolCredits } from "../utils/creditHelper.js";

export const generateText = async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
      return res.status(500).json({
        success: false,
        message: "OpenRouter API key not configured. Please get a free API key from https://openrouter.ai/keys and add it to server/.env as OPENROUTER_API_KEY",
      });
    }

    const { prompt, tone = "Professional" } = req.body;
    const userId = req.user.id; // Assuming auth middleware sets req.user

    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Credits usage check (1 credit per prompt, 10 credits/day max on Basic)
    const creditResult = await deductToolCredits(user, "text");
    if (!creditResult.success) {
      return res.status(403).json({
        success: false,
        outOfCredits: true,
        message: creditResult.message,
        remainingCredits: creditResult.remainingCredits,
        maxCredits: creditResult.maxCredits,
        freeCreditsResetAt: creditResult.freeCreditsResetAt,
        tool: "text",
      });
    }

    const toneInstructions = {
      Professional: "Write in a professional, polished, authoritative, and business-appropriate tone.",
      Creative: "Write in an expressive, imaginative, vivid, and story-driven tone.",
      Casual: "Write in a casual, conversational, relaxed, and friendly everyday tone.",
      Formal: "Write in a formal, well-structured, precise, and academically rigorous tone.",
      Persuasive: "Write in a highly persuasive, compelling, inspiring, and action-oriented tone.",
    };

    const toneInstruction = toneInstructions[tone] || `Write in a ${tone} tone.`;

    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:5173",   // your frontend URL
        "X-Title": "AI Web App",                   // your project title
      },
    });

    const completion = await client.chat.completions.create({
      model: "meta-llama/llama-3.1-70b-instruct",   // FREE & powerful
      messages: [
        {
          role: "system",
          content: `You are an expert AI content writer. Adhere strictly to the requested tone: ${toneInstruction} Generate the content directly based on the user's prompt without preamble, conversational remarks, or metadata.`
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const output = completion.choices[0].message.content;

    // Increment usage
    user.todayUsage = (user.todayUsage || 0) + 1;
    user.totalUsage = (user.totalUsage || 0) + 1;

    // Check Level Up
    if (user.totalUsage >= 500 && user.userLevel !== "Platinum") {
      user.userLevel = "Platinum";
    } else if (user.totalUsage >= 200 && user.userLevel !== "Gold" && user.userLevel !== "Platinum") {
      user.userLevel = "Gold";
    } else if (user.totalUsage >= 50 && user.userLevel === "Bronze") {
      user.userLevel = "Silver";
    }

    await user.save();

    // Save to History
    await History.create({
      user: userId,
      type: "text",
      title: `AI Text (${tone})`,
      content: prompt, // Store the prompt
    });

    res.json({
      success: true,
      output,
      remainingCredits: creditResult.remainingCredits,
      maxCredits: creditResult.maxCredits,
      totalCredits: creditResult.totalCredits ?? user.credits,
      freeCreditsResetAt: creditResult.freeCreditsResetAt,
      tool: "text",
    });

  } catch (error) {
    console.error("OpenRouter Error:", error);
    res.status(500).json({
      success: false,
      message: "OpenRouter AI request failed",
      error: error?.message,
    });
  }
};

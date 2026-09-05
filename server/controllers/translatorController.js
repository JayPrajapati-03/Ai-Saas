import OpenAI from "openai";
import User from "../models/User.js";
import History from "../models/History.js";

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

    // Increment today's usage
    await User.findByIdAndUpdate(userId, { $inc: { todayUsage: 1 } });

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

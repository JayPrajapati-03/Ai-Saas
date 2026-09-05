import OpenAI from "openai";

export const paraphraseText = async (req, res) => {
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

    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Text is required for paraphrasing.",
      });
    }

    const completion = await client.chat.completions.create({
      model: "meta-llama/llama-3.1-70b-instruct",
      messages: [
        {
          role: "system",
          content:
            "You are a professional paraphraser. Rewrite text in a natural, fluent, and human-sounding way while keeping the original meaning. Do NOT shorten or summarize. Maintain clarity.",
        },
        {
          role: "user",
          content: `Paraphrase the following text:\n\n${text}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const output = completion.choices[0].message.content;

    res.json({
      success: true,
      paraphrased: output,
    });

  } catch (error) {
    console.error("Paraphraser Error:", error);
    res.status(500).json({
      success: false,
      message: "Paraphrasing failed.",
      error: error?.message,
    });
  }
};

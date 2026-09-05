import OpenAI from "openai";
import ChatSession from "../models/ChatSession.js";
import User from "../models/User.js"; // optional for some endpoints

// helper: trim context to last N messages (simple window)
const trimMessages = (messages, maxMessages = 12) => {
  if (!messages || messages.length <= maxMessages) return messages;
  return messages.slice(-maxMessages);
};

export const createSession = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { title, systemPrompt } = req.body;

    const session = await ChatSession.create({
      user: userId,
      title: title || "New Chat",
      systemPrompt: systemPrompt || "You are a helpful assistant.",
      messages: [
        { role: "system", content: systemPrompt || "You are a helpful assistant." },
      ],
    });

    res.json({ success: true, session });
  } catch (err) {
    console.error("CreateSession Error:", err);
    res.status(500).json({ success: false, message: "Failed to create session", error: err?.message });
  }
};

export const listSessions = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessions = await ChatSession.find({ user: userId })
      .select("title updatedAt messages")
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json({ success: true, sessions });
  } catch (err) {
    console.error("ListSessions Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch sessions", error: err?.message });
  }
};

export const getSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const session = await ChatSession.findOne({ _id: id, user: userId });
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    res.json({ success: true, session });
  } catch (err) {
    console.error("GetSession Error:", err);
    res.status(500).json({ success: false, message: "Failed to get session", error: err?.message });
  }
};

export const clearSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const session = await ChatSession.findOne({ _id: id, user: userId });
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });

    session.messages = [{ role: "system", content: session.systemPrompt || "You are a helpful assistant." }];
    session.updatedAt = new Date();
    await session.save();

    res.json({ success: true, session });
  } catch (err) {
    console.error("ClearSession Error:", err);
    res.status(500).json({ success: false, message: "Failed to clear session", error: err?.message });
  }
};

/**
 * sendMessage
 * body: { sessionId, message } - message is user content string
 * returns assistant reply and stores messages to DB
 */
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { sessionId, message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    // fetch or create session
    let session = null;
    if (sessionId) {
      session = await ChatSession.findOne({ _id: sessionId, user: userId });
    }
    if (!session) {
      // If no session provided or not found, create a new one with default system prompt
      session = await ChatSession.create({
        user: userId,
        title: "New Chat",
        systemPrompt: "You are a helpful assistant.",
        messages: [{ role: "system", content: "You are a helpful assistant." }],
      });
    }

    // push user message to session.messages
    session.messages.push({ role: "user", content: message });
    // prepare messages to send to model
    const windowMessages = trimMessages(session.messages, 12); // keep last 12 messages

    // transform to provider format
    const modelMessages = windowMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

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

    // call OpenRouter / OpenAI-compatible chat completion
    const completion = await client.chat.completions.create({
      model: "meta-llama/llama-3.1-70b-instruct",
      messages: modelMessages,
      temperature: 0.6,
      max_tokens: 512,
    });

    const assistantContent = completion.choices?.[0]?.message?.content || "";

    // save assistant reply
    session.messages.push({ role: "assistant", content: assistantContent });
    session.title = session.title === "New Chat" && message.length < 60
      ? message.slice(0, 60)
      : session.title;
    session.updatedAt = new Date();
    await session.save();

    res.json({
      success: true,
      sessionId: session._id,
      reply: assistantContent,
      session,
    });
  } catch (err) {
    console.error("SendMessage Error:", err);
    res.status(500).json({ success: false, message: "Failed to send message", error: err?.message });
  }
};

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useUsage } from "../context/UsageContext";
import { API_URL } from "../config/api";

export default function TextGenerator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const { incrementUsage } = useUsage();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setOutput("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setOutput("Please login to use this feature.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/ai/generate-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (response.ok) {
        setOutput(data.output);
        incrementUsage();
      } else {
        setOutput(`Error: ${data.message || "Failed to generate text"}`);
      }
    } catch (error) {
      setOutput("Network error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-8">

      {/* Page Title */}
      <h1 className="text-3xl font-bold">
        Text Generator <span className="text-indigo-400">AI</span>
      </h1>

      {/* Prompt Input Box */}
      <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
        <h2 className="text-lg font-semibold mb-3">Enter Your Prompt</h2>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want the AI to write..."
          className="w-full h-40 p-4 bg-black/20 border border-white/10 rounded-xl text-white outline-none resize-none"
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-4 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="animate-spin" size={20} />}
          Generate
        </button>
      </div>

      {/* Output Box */}
      <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
        <h2 className="text-lg font-semibold mb-3">Output</h2>

        <div className="min-h-32 p-4 bg-black/20 rounded-xl border border-white/10 text-gray-200 whitespace-pre-wrap">
          {loading
            ? "AI is generating..."
            : output || "Your AI-generated text will appear here."}
        </div>
      </div>
    </div>
  );
}

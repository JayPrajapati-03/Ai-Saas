import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useUsage } from "../context/UsageContext";
import { API_URL } from "../config/api";

export default function Summarizer() {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const { incrementUsage } = useUsage();

  const handleSummarize = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setSummary("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setSummary("Please login to use this feature.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/ai/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();

      if (response.ok) {
        setSummary(data.summary);
        incrementUsage();
      } else {
        setSummary(`Error: ${data.message || "Failed to summarize text"}`);
      }
    } catch (error) {
      setSummary("Network error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-8">

      {/* Page Title */}
      <h1 className="text-3xl font-bold">
        Summarizer <span className="text-indigo-400">AI</span>
      </h1>

      {/* Input Section */}
      <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
        <h2 className="text-lg font-semibold mb-3">Paste Long Content</h2>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste or type your lengthy text here..."
          className="w-full h-56 p-4 bg-black/20 border border-white/10 rounded-xl text-white outline-none resize-none"
        />

        <button
          onClick={handleSummarize}
          disabled={loading}
          className="mt-4 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="animate-spin" size={20} />}
          Summarize
        </button>
      </div>

      {/* Summary Output */}
      <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
        <h2 className="text-lg font-semibold mb-3">Summary</h2>

        <div className="min-h-32 p-4 bg-black/20 rounded-xl border border-white/10 text-gray-200 whitespace-pre-wrap">
          {loading
            ? "Summarizing..."
            : summary || "Your summarized text will appear here."}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Loader2, ArrowRightLeft } from "lucide-react";
import { useUsage } from "../context/UsageContext";
import { API_URL } from "../config/api";

export default function Translator() {
  const [inputText, setInputText] = useState("");
  const [fromLang, setFromLang] = useState("en");
  const [toLang, setToLang] = useState("hi");
  const [loading, setLoading] = useState(false);
  const [outputText, setOutputText] = useState("");
  const { incrementUsage } = useUsage();

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "ja", name: "Japanese" },
    { code: "zh", name: "Chinese" },
  ];

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setOutputText("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setOutputText("Please login to use this feature.");
        setLoading(false);
        return;
      }

      // Find the full language name for better AI context
      const targetLangName = languages.find((l) => l.code === toLang)?.name || toLang;

      const response = await fetch(`${API_URL}/api/ai/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: inputText,
          targetLanguage: targetLangName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOutputText(data.translated);
        incrementUsage();
      } else {
        setOutputText(`Error: ${data.message || "Failed to translate"}`);
      }
    } catch (error) {
      setOutputText("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const swapLanguages = () => {
    const prev = fromLang;
    setFromLang(toLang);
    setToLang(prev);
  };

  return (
    <div className="space-y-8">

      {/* Page Title */}
      <h1 className="text-3xl font-bold">
        Translator <span className="text-indigo-400">AI</span>
      </h1>

      {/* Input Section */}
      <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">

        <h2 className="text-lg font-semibold mb-3">Enter Text</h2>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type or paste the text to translate..."
          className="w-full h-40 p-4 bg-black/20 border border-white/10 rounded-xl text-white outline-none resize-none"
        />

        {/* Language Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

          {/* From */}
          <div>
            <label className="text-sm text-gray-300">From Language</label>
            <select
              value={fromLang}
              onChange={(e) => setFromLang(e.target.value)}
              className="w-full p-3 mt-1 rounded-xl bg-black/20 border border-white/10 text-white outline-none"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex items-end justify-center">
            <button
              onClick={swapLanguages}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition"
            >
              <ArrowRightLeft size={22} />
            </button>
          </div>

          {/* To */}
          <div>
            <label className="text-sm text-gray-300">To Language</label>
            <select
              value={toLang}
              onChange={(e) => setToLang(e.target.value)}
              className="w-full p-3 mt-1 rounded-xl bg-black/20 border border-white/10 text-white outline-none"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Translate Button */}
        <button
          onClick={handleTranslate}
          disabled={loading}
          className="mt-5 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="animate-spin" size={20} />}
          Translate
        </button>
      </div>

      {/* Output Section */}
      <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
        <h2 className="text-lg font-semibold mb-3">Translated Text</h2>

        <div className="min-h-32 p-4 bg-black/20 rounded-xl border border-white/10 text-gray-200 whitespace-pre-wrap">
          {loading
            ? "Translating..."
            : outputText || "Your translated text will appear here."}
        </div>
      </div>
    </div>
  );
}

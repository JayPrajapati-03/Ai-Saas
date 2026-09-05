import { useState, useEffect } from "react";
import { Loader2, Download, Sparkles, AlertCircle, ImageIcon } from "lucide-react";
import { useUsage } from "../context/UsageContext";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("512x512");
  const [loading, setLoading] = useState(false);
  const [loadingSecs, setLoadingSecs] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const { incrementUsage } = useUsage();

  // Elapsed seconds timer during generation
  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingSecs(0);
      interval = setInterval(() => {
        setLoadingSecs((prev) => prev + 1);
      }, 1000);
    } else {
      setLoadingSecs(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setImageUrl("");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s safety timeout

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to generate images.");
        setLoading(false);
        clearTimeout(timeoutId);
        return;
      }

      const response = await fetch("http://localhost:5000/api/image/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt, size }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok && data.success && data.image) {
        setImageUrl(data.image);
        incrementUsage();
      } else {
        setError(data.message || "Failed to generate image. Please try again.");
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        setError("Generation took longer than 35s. Please try again.");
      } else {
        console.error("Error generating image:", err);
        setError("Network error: Unable to communicate with the server. Please try again.");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleImageError = () => {
    setError("Failed to render the image data. Please try generating again.");
    setImageUrl("");
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      if (imageUrl.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = `ai-image-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `ai-image-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }
    } catch (e) {
      window.open(imageUrl, "_blank");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <h1 className="text-3xl font-bold flex items-center gap-3">
        Image Generator <span className="text-indigo-400">AI</span>
        <Sparkles className="text-indigo-400" size={28} />
      </h1>

      {/* Prompt + Controls */}
      <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg">
        <h2 className="text-lg font-semibold mb-3">Enter Prompt</h2>

        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the image you want to generate (e.g. sunset over mountains, futuristic robot)..."
          className="w-full p-4 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 transition"
        />

        {/* Image Size */}
        <div className="mt-5">
          <h3 className="font-semibold mb-2">Select Size</h3>
          <select
            value={size}
            onChange={(e) => {
              setSize(e.target.value);
              setError("");
            }}
            className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white outline-none focus:border-indigo-500 transition"
          >
            <option value="256x256">256 × 256 (Fast)</option>
            <option value="512x512">512 × 512 (Standard)</option>
            <option value="1024x1024">1024 × 1024 (HD)</option>
          </select>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="mt-5 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Generating ({loadingSecs}s)...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Generate Image
            </>
          )}
        </button>
      </div>

      {/* Output Section */}
      <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <ImageIcon size={20} className="text-indigo-400" />
          Generated Image
        </h2>

        {/* Error Notice */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-400 hover:text-red-200 font-bold px-1 text-base leading-none"
            >
              ✕
            </button>
          </div>
        )}

        <div className="min-h-64 flex items-center justify-center bg-black/20 rounded-xl border border-white/10 p-6">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="animate-spin text-indigo-400" size={40} />
              <div className="animate-pulse text-gray-300 font-medium">
                Generating image with AI... ({loadingSecs}s)
              </div>
              <p className="text-xs text-gray-400">
                {loadingSecs < 8
                  ? "Fetching rendering, usually takes 3 to 8 seconds"
                  : "Rendering high details, almost done..."}
              </p>
            </div>
          ) : imageUrl ? (
            <div className="flex flex-col items-center gap-5 w-full">
              <div className="relative group max-w-lg w-full flex justify-center">
                <img
                  src={imageUrl}
                  alt={prompt || "Generated AI image"}
                  className="rounded-xl border border-white/10 shadow-2xl max-w-full max-h-[512px] object-contain transition-transform duration-300 hover:scale-[1.01]"
                  onError={handleImageError}
                />
              </div>

              <button
                onClick={handleDownload}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 transition rounded-xl flex items-center gap-2 text-white font-medium shadow-lg hover:shadow-indigo-500/30"
              >
                <Download size={18} /> Download Image
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <ImageIcon size={48} className="mx-auto mb-2 opacity-30" />
              <p>Your generated image will appear here.</p>
              <p className="text-xs text-gray-500 mt-1">Enter a prompt above and click &quot;Generate Image&quot;</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

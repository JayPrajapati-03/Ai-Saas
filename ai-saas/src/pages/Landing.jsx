import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      {/* NAVBAR */}
      <nav className="w-full flex items-center justify-between px-10 py-6">
        <h1 className="text-2xl font-bold tracking-wide">
          <span className="text-indigo-500">AI</span>SaaS
        </h1>

        <div className="space-x-6">
          <Link to="/login" className="text-gray-300 hover:text-white">
            Login
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="flex flex-col items-center text-center mt-20 px-5">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold max-w-3xl leading-tight"
        >
          Build Smarter With{" "}
          <span className="text-indigo-500">AI-Powered Tools</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-gray-300 mt-6 max-w-2xl text-lg"
        >
          Generate content, summarize text, create images, translate languages,
          and more — all in one unified AI platform.
        </motion.p>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-10"
        >
          <Link
            to="/register"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-7 py-3 rounded-xl text-lg font-medium"
          >
            Get Started <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>

      {/* FEATURES SECTION */}
      <div className="mt-32 grid md:grid-cols-3 gap-10 px-10 pb-20 max-w-6xl mx-auto">
        <FeatureCard
          icon={<Sparkles size={32} />}
          title="AI Content"
          desc="Generate articles, responses and more in seconds."
        />
        <FeatureCard
          icon={<Zap size={32} />}
          title="Image Generation"
          desc="Create HD AI images from simple prompts."
        />
        <FeatureCard
          icon={<Shield size={32} />}
          title="Secure Platform"
          desc="Protected access, tokens, and secure API usage."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-center hover:bg-white/10 transition"
    >
      <div className="flex justify-center text-indigo-400">{icon}</div>
      <h3 className="text-xl font-semibold mt-4">{title}</h3>
      <p className="text-gray-300 mt-2">{desc}</p>
    </motion.div>
  );
}

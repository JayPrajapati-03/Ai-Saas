import { useEffect, useState } from "react";
import { Sparkles, FileText, ImageIcon, Languages, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useUsage } from "../context/UsageContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "../config/api";

export default function DashboardHome() {
  const [userName, setUserName] = useState("User");
  const [stats, setStats] = useState({
    credits: "∞",
    todayUsage: 0,
    userLevel: "Bronze"
  });

  const { usageCount } = useUsage();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.name) {
          setUserName(user.name);
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_URL}/api/auth/stats`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (data.success) {
          // Override credits for Bronze users to show infinity
          if (data.stats.userLevel === "Bronze") {
            data.stats.credits = "∞";
          }
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch user stats", error);
      }
    };

    fetchStats();
  }, []);

  // Check for level up
  useEffect(() => {
    const prevLevel = localStorage.getItem("userLevel");
    if (stats.userLevel && prevLevel && stats.userLevel !== prevLevel) {
      // Logic to ensure it's an upgrade
      const levels = ["Bronze", "Silver", "Gold", "Platinum"];
      if (levels.indexOf(stats.userLevel) > levels.indexOf(prevLevel)) {
        toast.success(`🎉 Congratulations! You reached ${stats.userLevel} Level!`, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      }
    }
    if (stats.userLevel) {
      localStorage.setItem("userLevel", stats.userLevel);
    }
  }, [stats.userLevel]);


  const quickTools = [
    {
      title: "Text Generator",
      desc: "Generate creative, professional, or custom AI text.",
      icon: <Sparkles size={26} />,
      path: "/app/text-generator",
    },
    {
      title: "Summarizer",
      desc: "Summarize long content into short meaningful text.",
      icon: <FileText size={26} />,
      path: "/app/summarizer",
    },
    {
      title: "Image Generator",
      desc: "Generate stunning AI images instantly.",
      icon: <ImageIcon size={26} />,
      path: "/app/image-generator",
    },
    {
      title: "Translator",
      desc: "Translate text between multiple languages.",
      icon: <Languages size={26} />,
      path: "/app/translator",
    },
  ];

  return (
    <div className="space-y-8">
      <ToastContainer />

      {/* Welcome Card */}
      <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
        <h1 className="text-3xl font-bold">
          Welcome back, <span className="text-indigo-400">{userName}</span> 👋
        </h1>
        <p className="text-gray-300 mt-2">
          Explore your AI dashboard and start creating magic.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Credits */}
        <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
          <h2 className="text-lg font-semibold">Remaining Credits</h2>
          <h1 className="text-4xl font-bold mt-2 text-indigo-400">{stats.credits}</h1>
          <p className="text-gray-400 mt-2 text-sm">
            You have enough credits for today’s tasks.
          </p>
        </div>

        {/* Usage */}
        <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
          <h2 className="text-lg font-semibold">Today’s Usage</h2>
          <h1 className="text-4xl font-bold mt-2 text-green-400">{usageCount}</h1>
          <p className="text-gray-400 mt-2 text-sm">Prompts used</p>
        </div>

        {/* Rank */}
        <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
          <h2 className="text-lg font-semibold">User Level</h2>
          <h1 className="text-4xl font-bold mt-2 text-yellow-400">{stats.userLevel}</h1>
          <p className="text-gray-400 mt-2 text-sm">Keep using tools to level up.</p>
        </div>

      </div>

      {/* Quick Tools */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Tools</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {quickTools.map((tool, index) => (
            <Link
              key={index}
              to={tool.path}
              className="p-6 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/20 hover:scale-[1.03] transition-all flex flex-col gap-3"
            >
              <div className="p-3 bg-white/10 rounded-xl w-fit text-indigo-300">
                {tool.icon}
              </div>

              <h3 className="text-lg font-semibold">{tool.title}</h3>
              <p className="text-gray-300 text-sm">{tool.desc}</p>

              <div className="mt-auto flex items-center gap-2 text-indigo-300">
                <span>Start</span>
                <ArrowRight size={20} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

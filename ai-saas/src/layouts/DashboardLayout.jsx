import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Sparkles,
  FileText,
  ImageIcon,
  Languages,
  Clock,
  CreditCard,
  Settings,
  Menu,
  X,
} from "lucide-react";

export default function DashboardLayout() {
  const [open, setOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/app" },
    { name: "Text Generator", icon: Sparkles, path: "/app/text-generator" },
    { name: "Summarizer", icon: FileText, path: "/app/summarizer" },
    { name: "Image Generator", icon: ImageIcon, path: "/app/image-generator" },
    { name: "Translator", icon: Languages, path: "/app/translator" },
    { name: "History", icon: Clock, path: "/app/history" },
    { name: "Billing", icon: CreditCard, path: "/app/billing" },
    { name: "Admin", icon: Settings, path: "/app/admin" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">

      {/* SIDEBAR */}
      <div
        className={`${
          open ? "w-64" : "w-16"
        } bg-white/10 backdrop-blur-xl border-r border-white/10 p-4 transition-all duration-300 relative`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between">
          {open && (
            <h2 className="text-2xl font-bold">
              <span className="text-indigo-500">AI</span>Panel
            </h2>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Sidebar Menu */}
        <div className="mt-10 space-y-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                title={!open ? item.name : undefined}
                className={`flex items-center rounded-xl transition-all duration-200 ${
                  open ? "gap-3 px-4 py-3" : "justify-center py-3.5"
                } ${
                  isActive
                    ? "bg-indigo-600 shadow-lg shadow-indigo-600/30"
                    : "bg-white/5 hover:bg-white/15"
                }`}
              >
                <Icon size={open ? 20 : 22} strokeWidth={isActive ? 2.5 : 2} />
                {open && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative">

        {/* NAVBAR */}
        <div className="w-full px-6 py-4 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between relative z-10">
          <h1 className="text-xl font-semibold">Welcome to Your Dashboard</h1>
          <div className="flex items-center gap-4 text-gray-300 relative z-10">
          <div className="relative">
            <button
              id="profile-button"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {(() => {
                const userData = localStorage.getItem("user");
                if (userData) {
                  try {
                    const user = JSON.parse(userData);
                    return user.name ? user.name.charAt(0).toUpperCase() : "U";
                  } catch {
                    return "U";
                  }
                }
                return "U";
              })()}
            </button>

            {menuOpen && (
              <div
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="profile-button"
                tabIndex={-1}
              className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-xl bg-white ring-1 ring-black ring-opacity-95 z-50 focus:outline-none text-black"
              >
                <div className="py-1" role="none">
                  <span className="block px-4 py-2 text-sm whitespace-nowrap">{(() => {
                    const userData = localStorage.getItem("user");
                    if (userData) {
                      try {
                        const user = JSON.parse(userData);
                        return user.email || "";
                      } catch {
                        return "";
                      }
                    }
                    return "";
                  })()}</span>
                  <button
                    type="button"
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* PAGE CONTENT (Outlet renders child pages) */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

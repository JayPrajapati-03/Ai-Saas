import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, Sparkles, FileText, ImageIcon, Languages,
  Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, Clock
} from "lucide-react";
import { API_URL } from "../config/api";

const filterTabs = [
  { id: "all",       label: "All",       color: "#c4b5fd", bg: "rgba(124,58,237,0.2)"  },
  { id: "text",      label: "Text",      color: "#c4b5fd", bg: "rgba(124,58,237,0.15)" },
  { id: "summary",   label: "Summary",   color: "#6ee7b7", bg: "rgba(16,185,129,0.15)" },
  { id: "image",     label: "Images",    color: "#f9a8d4", bg: "rgba(236,72,153,0.15)" },
  { id: "translate", label: "Translate", color: "#fcd34d", bg: "rgba(245,158,11,0.15)" },
];

const typeConfig = {
  text:      { icon: Sparkles,   color: "#c4b5fd", bg: "rgba(124,58,237,0.15)", border: "rgba(124,58,237,0.3)" },
  summary:   { icon: FileText,   color: "#6ee7b7", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.3)" },
  image:     { icon: ImageIcon,  color: "#f9a8d4", bg: "rgba(236,72,153,0.15)", border: "rgba(236,72,153,0.3)" },
  translate: { icon: Languages,  color: "#fcd34d", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)" },
};

export default function History() {
  const [filter, setFilter]           = useState("all");
  const [search, setSearch]           = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { setError("Please login to view history."); setLoading(false); return; }
      const res = await fetch(`${API_URL}/api/history`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setHistoryData(data.history || []);
      else setError(data.message || "Failed to load history.");
    } catch { setError("Network error. Could not fetch history."); }
    finally { setLoading(false); }
  };

  const handleFilterChange = (f) => { setFilter(f); setCurrentPage(1); };
  const handleSearchChange = (e) => { setSearch(e.target.value); setCurrentPage(1); };
  const clearSearch = () => { setSearch(""); setCurrentPage(1); };

  const filteredData = historyData.filter(item => {
    const matchesFilter = filter === "all" || item.type === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch = q === "" || (item.title?.toLowerCase().includes(q)) || (item.content?.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validPage  = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validPage - 1) * itemsPerPage;
  const endIndex   = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredData.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    if (validPage <= 3) pages.push(1, 2, 3, 4, "...", totalPages);
    else if (validPage >= totalPages - 2) pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    else pages.push(1, "...", validPage - 1, validPage, validPage + 1, "...", totalPages);
    return pages;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Clock size={22} style={{ color: "#a5b4fc" }} />
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em" }}>
              Activity <span className="gradient-text">History</span>
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>All your AI tool activity in one place</p>
          </div>
        </div>
        <div style={{ padding: "8px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Total: </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "white", fontFamily: "var(--font-heading)" }}>{historyData.length}</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}> records</span>
        </div>
      </motion.div>

      {/* Filter + Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        {/* Filter tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {filterTabs.map(tab => {
            const count = tab.id === "all" ? historyData.length : historyData.filter(i => i.type === tab.id).length;
            const isActive = filter === tab.id;
            return (
              <button key={tab.id} onClick={() => handleFilterChange(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 10,
                  fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", border: "1px solid",
                  ...(isActive
                    ? { background: tab.bg, borderColor: tab.color + "80", color: tab.color, boxShadow: `0 0 12px ${tab.bg}` }
                    : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-secondary)" }),
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "white"; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text-secondary)"; }}}
              >
                {tab.label}
                <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 999, background: isActive ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.3)", color: isActive ? tab.color : "var(--text-muted)" }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        {/* Search */}
        <div style={{ position: "relative", width: 280 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input type="text" placeholder="Search title or prompt..." value={search} onChange={handleSearchChange}
            className="input-premium" style={{ paddingLeft: 36, paddingRight: search ? 36 : 14, fontSize: 13 }} />
          {search && (
            <button onClick={clearSearch}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", padding: 2 }}>
              <X size={14} />
            </button>
          )}
        </div>
      </motion.div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="shimmer" style={{ height: 80, borderRadius: 14 }} />
            ))}
          </div>
        ) : error ? (
          <div style={{ padding: 32, textAlign: "center", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 16 }}>
            <p style={{ color: "#fca5a5" }}>{error}</p>
          </div>
        ) : currentItems.length === 0 ? (
          <div style={{ padding: "48px 32px", textAlign: "center", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16 }}>
            <Clock size={40} style={{ color: "var(--text-muted)", margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
            <p style={{ color: "var(--text-secondary)", marginBottom: 12 }}>
              {search.trim() ? `No results for "${search}"` : "No history records in this category"}
            </p>
            {search && (
              <button onClick={clearSearch} className="btn-ghost" style={{ fontSize: 13 }}>Clear Search</button>
            )}
          </div>
        ) : (
          currentItems.map((item, idx) => {
            const cfg = typeConfig[item.type] || typeConfig.text;
            const Icon = cfg.icon;
            return (
              <motion.div key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 14,
                  padding: "16px 20px",
                  background: "var(--bg-card)",
                  border: `1px solid ${cfg.border}`,
                  borderLeft: `3px solid ${cfg.color}`,
                  borderRadius: 14,
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = `0 0 16px ${cfg.border}`; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={17} style={{ color: cfg.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{item.title}</h3>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, textTransform: "capitalize" }}>{item.type}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {item.content || "No content details"}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5 }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && totalItems > itemsPerPage && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ padding: "16px 20px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Showing <strong style={{ color: "white" }}>{totalItems === 0 ? 0 : startIndex + 1}</strong> – <strong style={{ color: "white" }}>{endIndex}</strong> of <strong style={{ color: "white" }}>{totalItems}</strong>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {[
              { icon: ChevronsLeft, action: () => setCurrentPage(1), disabled: validPage === 1 },
              { icon: ChevronLeft,  action: () => setCurrentPage(p => Math.max(1, p - 1)), disabled: validPage === 1 },
            ].map(({ icon: Icon, action, disabled }, i) => (
              <button key={i} onClick={action} disabled={disabled}
                style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", display: "flex", alignItems: "center", justifyContent: "center", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.3 : 1, color: "var(--text-secondary)", transition: "all 0.15s" }}
                onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "white"; }}}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                <Icon size={14} />
              </button>
            ))}
            {getPageNumbers().map((p, i) => p === "..." ? (
              <span key={`e${i}`} style={{ padding: "0 4px", color: "var(--text-muted)", fontSize: 13 }}>…</span>
            ) : (
              <button key={`p${p}`} onClick={() => setCurrentPage(p)}
                style={{
                  width: 34, height: 34, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid", transition: "all 0.15s",
                  ...(validPage === p
                    ? { background: "linear-gradient(135deg,#7c3aed,#0891b2)", borderColor: "transparent", color: "white", boxShadow: "0 0 12px rgba(124,58,237,0.4)" }
                    : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-secondary)" }),
                }}>
                {p}
              </button>
            ))}
            {[
              { icon: ChevronRight,  action: () => setCurrentPage(p => Math.min(totalPages, p + 1)), disabled: validPage === totalPages },
              { icon: ChevronsRight, action: () => setCurrentPage(totalPages), disabled: validPage === totalPages },
            ].map(({ icon: Icon, action, disabled }, i) => (
              <button key={i} onClick={action} disabled={disabled}
                style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", display: "flex", alignItems: "center", justifyContent: "center", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.3 : 1, color: "var(--text-secondary)", transition: "all 0.15s" }}
                onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "white"; }}}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                <Icon size={14} />
              </button>
            ))}
          </div>
          <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: 12, outline: "none", cursor: "pointer", fontFamily: "var(--font-body)" }}>
            <option value={10} style={{ background: "#0f1629" }}>10 / page</option>
            <option value={25} style={{ background: "#0f1629" }}>25 / page</option>
            <option value={50} style={{ background: "#0f1629" }}>50 / page</option>
          </select>
        </motion.div>
      )}
    </div>
  );
}

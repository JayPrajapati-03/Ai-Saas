import { useState, useEffect } from "react";
import {
  Search,
  Sparkles,
  FileText,
  ImageIcon,
  Languages,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X
} from "lucide-react";
import { API_URL } from "../config/api";

export default function History() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to view history.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setHistoryData(data.history || []);
      } else {
        setError(data.message || "Failed to load history.");
      }
    } catch (err) {
      setError("Network error. Could not fetch history.");
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 whenever filter or search query changes
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearch("");
    setCurrentPage(1);
  };

  const getIcon = (type) => {
    switch (type) {
      case "text": return <Sparkles size={20} className="text-indigo-400" />;
      case "summary": return <FileText size={20} className="text-emerald-400" />;
      case "image": return <ImageIcon size={20} className="text-pink-400" />;
      case "translate": return <Languages size={20} className="text-amber-400" />;
      default: return <Sparkles size={20} className="text-gray-400" />;
    }
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case "text": return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
      case "summary": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "image": return "bg-pink-500/20 text-pink-300 border-pink-500/30";
      case "translate": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  // Filter items matching category and search
  const filteredData = historyData.filter((item) => {
    const matchesFilter = filter === "all" || item.type === filter;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.content && item.content.toLowerCase().includes(query));

    return matchesFilter && matchesSearch;
  });

  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (validPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredData.slice(startIndex, endIndex);

  // Generate page numbers array with ellipses
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    if (validPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (validPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", validPage - 1, validPage, validPage + 1, "...", totalPages);
    }
    return pages;
  };

  const filterTabs = [
    { id: "all", label: "All" },
    { id: "text", label: "Text" },
    { id: "summary", label: "Summary" },
    { id: "image", label: "Images" },
    { id: "translate", label: "Translate" },
  ];

  return (
    <div className="space-y-8">

      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-3xl font-bold">
          Activity <span className="text-indigo-400">History</span>
        </h1>
        <div className="text-sm text-gray-400">
          Total Records: <span className="font-semibold text-white">{historyData.length}</span>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((btn) => {
            const count = btn.id === "all"
              ? historyData.length
              : historyData.filter(item => item.type === btn.id).length;

            return (
              <button
                key={btn.id}
                onClick={() => handleFilterChange(btn.id)}
                className={`px-4 py-2 rounded-xl font-semibold transition text-sm flex items-center gap-2 ${
                  filter === btn.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "bg-white/10 hover:bg-white/20 text-gray-300"
                }`}
              >
                <span>{btn.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  filter === btn.id ? "bg-white/20 text-white" : "bg-black/30 text-gray-400"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-72">
          <Search className="absolute top-3 left-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search title or prompt..."
            value={search}
            onChange={handleSearchChange}
            className="w-full p-2.5 pl-10 pr-9 bg-black/20 rounded-xl border border-white/10 text-white placeholder-gray-400 outline-none focus:border-indigo-500 transition text-sm"
          />
          {search && (
            <button
              onClick={clearSearch}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-14">
            <Loader2 className="animate-spin text-indigo-500" size={36} />
          </div>
        ) : error ? (
          <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="p-12 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-center space-y-3">
            <p className="text-gray-300 text-base">
              {search.trim()
                ? `No activities found matching "${search}" in ${filter.toUpperCase()}.`
                : `No history records found in this category.`}
            </p>
            {search.trim() && (
              <button
                onClick={clearSearch}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 transition rounded-xl text-white text-sm font-medium"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          currentItems.map((item) => (
            <div
              key={item._id}
              className="p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-white/20 transition flex items-start gap-4"
            >
              {/* Type Icon */}
              <div className="p-3 bg-black/30 rounded-xl h-fit border border-white/5 shrink-0">
                {getIcon(item.type)}
              </div>

              {/* Content Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-base font-semibold text-white truncate">{item.title}</h3>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border capitalize ${getBadgeStyle(item.type)}`}>
                    {item.type}
                  </span>
                </div>
                <p className="text-gray-300 mt-1.5 text-sm line-clamp-2 break-words">
                  {item.content || "No details provided"}
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls at Bottom */}
      {!loading && !error && totalItems > itemsPerPage && (
        <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">

          {/* Showing Entries Info */}
          <div className="text-sm text-gray-300">
            Showing <span className="font-semibold text-white">{totalItems === 0 ? 0 : startIndex + 1}</span> to{" "}
            <span className="font-semibold text-white">{endIndex}</span> of{" "}
            <span className="font-semibold text-white">{totalItems}</span> results
          </div>

          {/* Items Per Page Selector */}
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span>Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-black/40 border border-white/15 text-white rounded-lg px-2.5 py-1 outline-none text-sm cursor-pointer hover:border-white/30 transition"
            >
              <option value={10} className="bg-gray-900 text-white">10 per page</option>
              <option value={25} className="bg-gray-900 text-white">25 per page</option>
              <option value={50} className="bg-gray-900 text-white">50 per page</option>
            </select>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-1.5">
            {/* First Page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={validPage === 1}
              title="First Page"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-25 disabled:cursor-not-allowed transition text-gray-300"
            >
              <ChevronsLeft size={16} />
            </button>

            {/* Previous Page */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validPage === 1}
              title="Previous Page"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-25 disabled:cursor-not-allowed transition text-gray-300"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page Number Buttons */}
            {getPageNumbers().map((pageNum, idx) =>
              pageNum === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-gray-500 select-none">
                  ...
                </span>
              ) : (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 rounded-lg font-medium text-sm transition ${
                    validPage === pageNum
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "bg-white/5 hover:bg-white/15 text-gray-300"
                  }`}
                >
                  {pageNum}
                </button>
              )
            )}

            {/* Next Page */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validPage === totalPages}
              title="Next Page"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-25 disabled:cursor-not-allowed transition text-gray-300"
            >
              <ChevronRight size={16} />
            </button>

            {/* Last Page */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={validPage === totalPages}
              title="Last Page"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-25 disabled:cursor-not-allowed transition text-gray-300"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

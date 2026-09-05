// Automatically strip trailing slashes to prevent double-slash 404 errors (e.g., //api/auth)
const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const API_URL = rawUrl.replace(/\/+$/, "");

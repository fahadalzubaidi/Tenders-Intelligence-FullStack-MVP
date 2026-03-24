import axios from "axios";

const BASE_URL = "http://localhost:8001";

const api = axios.create({ baseURL: BASE_URL });

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username, password) =>
    api.post("/api/auth/login", { username, password }),
  register: (data) => api.post("/api/auth/register", data),
  me: () => api.get("/api/auth/me"),
};

// ── Tenders ───────────────────────────────────────────────────────────────────
export const tendersApi = {
  kpi: () => api.get("/api/tenders/kpi"),
  smartFilters: (params) => api.get("/api/tenders/smart-filters", { params }),
  list: (params) => api.get("/api/tenders", { params }),
  detail: (id) => api.get(`/api/tenders/${id}`),
  sectorBreakdown: () => api.get("/api/tenders/sector-breakdown"),
  regionBreakdown: () => api.get("/api/tenders/region-breakdown"),
  topAgencies: (top_n = 10) => api.get("/api/tenders/top-agencies", { params: { top_n } }),
  topVendors: (top_n = 10) => api.get("/api/tenders/top-vendors", { params: { top_n } }),
};

// ── Vendors ───────────────────────────────────────────────────────────────────
export const vendorsApi = {
  list: (params) => api.get("/api/vendors", { params }),
  profile: (name) => api.get(`/api/vendors/${encodeURIComponent(name)}`),
};

// ── Market ────────────────────────────────────────────────────────────────────
export const marketApi = {
  smartFilters: (params) => api.get("/api/market/smart-filters", { params }),
  topCompanies: (params) => api.get("/api/market/top-companies", { params }),
  competitiveDensity: (params) => api.get("/api/market/competitive-density", { params }),
  pricingAnalysis: (params) => api.get("/api/market/pricing-analysis", { params }),
  sectorSpecialists: (min_wins) =>
    api.get("/api/market/sector-specialists", { params: { min_wins } }),
  regionSpecialists: (min_wins) =>
    api.get("/api/market/region-specialists", { params: { min_wins } }),
};

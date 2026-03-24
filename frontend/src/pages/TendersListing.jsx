import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { tendersApi } from "../api/client";
import { Search, Filter, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

const fmt = (n) =>
  n == null ? "—" : n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n);

const statusColors = {
  Awarded: "bg-green-500/15 text-green-400 border-green-500/30",
  Active: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Other: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

export default function TendersListing() {
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const PAGE_SIZE = 20;

  // Fetch smart filter options whenever active filters or search change.
  // Each dropdown only shows options that would yield at least one result
  // given all OTHER currently active filters.
  useEffect(() => {
    setFiltersLoading(true);
    const params = { ...filters };
    if (search) params.search = search;
    tendersApi
      .smartFilters(params)
      .then((r) => setFilterOptions(r.data))
      .finally(() => setFiltersLoading(false));
  }, [filters, search]);

  const fetchTenders = useCallback(() => {
    setLoading(true);
    tendersApi
      .list({ page, page_size: PAGE_SIZE, search: search || undefined, ...filters })
      .then((r) => {
        setTenders(r.data.items);
        setTotal(r.data.total);
        setTotalPages(r.data.total_pages);
      })
      .finally(() => setLoading(false));
  }, [page, search, filters]);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  const setFilter = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val || undefined }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearch("");
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length + (search ? 1 : 0);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tenders Listing</h1>
          <p className="text-gray-400 text-sm mt-1">{total.toLocaleString()} tenders found</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${
            showFilters || activeFilterCount > 0
              ? "bg-blue-600 border-blue-500 text-white"
              : "bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-600"
          }`}
        >
          <Filter size={15} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-white text-blue-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by tender name or ID..."
          className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">
              {filtersLoading ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block" />
                  Updating options…
                </span>
              ) : (
                <span>Selecting a filter narrows all other options automatically.</span>
              )}
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg px-3 py-1 transition"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {[
              { key: "sector", label: "Sector", opts: filterOptions.sectors },
              { key: "agency", label: "Agency", opts: filterOptions.agencies },
              { key: "region", label: "Region", opts: filterOptions.regions },
              { key: "city", label: "City", opts: filterOptions.cities },
              { key: "status_bucket", label: "Status", opts: filterOptions.statuses },
            ].map(({ key, label, opts }) => {
              const isActive = Boolean(filters[key]);
              const availableCount = (opts || []).length;
              return (
                <div key={key}>
                  <label className="block text-xs mb-1">
                    <span className={isActive ? "text-blue-400 font-medium" : "text-gray-400"}>
                      {label}
                    </span>
                    {!isActive && availableCount > 0 && (
                      <span className="text-gray-600 ml-1">({availableCount})</span>
                    )}
                  </label>
                  <select
                    value={filters[key] || ""}
                    onChange={(e) => setFilter(key, e.target.value)}
                    disabled={filtersLoading && !isActive}
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition ${
                      isActive
                        ? "border-blue-500/60 text-white"
                        : "border-gray-700 text-gray-200"
                    } disabled:opacity-50`}
                  >
                    <option value="">All</option>
                    {(opts || []).map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {["ID", "Tender Name", "Agency", "Sector", "Region", "Status", "Bids", "Awarded Value", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : tenders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-gray-500">No tenders found</td>
                </tr>
              ) : (
                tenders.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/40 transition cursor-pointer"
                    onClick={() => navigate(`/opportunity/${t.id}`)}
                  >
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{t.id}</td>
                    <td className="px-4 py-3 text-gray-200 max-w-xs">
                      <p className="truncate">{t.tenderName}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400 max-w-[160px]">
                      <p className="truncate">{t.agency}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{t.sector}</td>
                    <td className="px-4 py-3 text-gray-400">{t.region}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[t.status_bucket] || statusColors.Other}`}>
                        {t.status_bucket}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-center">{t.bid_count}</td>
                    <td className="px-4 py-3 text-gray-300 font-mono text-xs">
                      {t.awarded_value ? `SAR ${fmt(t.awarded_value)}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <ExternalLink size={14} className="text-gray-600 hover:text-blue-400 transition" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
          <p className="text-gray-500 text-xs">
            Page {page} of {totalPages} · {total.toLocaleString()} results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                    pg === page ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {pg}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

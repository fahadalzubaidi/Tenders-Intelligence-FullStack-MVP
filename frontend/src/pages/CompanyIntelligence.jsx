import { useEffect, useState } from "react";
import { vendorsApi, marketApi } from "../api/client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { Search, Trophy, TrendingUp, DollarSign, Building2 } from "lucide-react";

const fmt = (n) =>
  n == null ? "—" : n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n);

export default function CompanyIntelligence() {
  const [vendors, setVendors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [profile, setProfile] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ sectors: [], agencies: [] });
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [sector, setSector] = useState("");
  const [agency, setAgency] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Smart cross-filtering: each dropdown only shows options valid given the other
  useEffect(() => {
    setFiltersLoading(true);
    marketApi
      .smartFilters({ sector: sector || undefined, agency: agency || undefined })
      .then((r) => setFilterOptions(r.data))
      .finally(() => setFiltersLoading(false));
  }, [sector, agency]);

  useEffect(() => {
    setLoading(true);
    vendorsApi
      .list({ sector: sector || undefined, agency: agency || undefined, min_wins: 0 })
      .then((r) => setVendors(r.data))
      .finally(() => setLoading(false));
  }, [sector, agency]);

  const selectVendor = (name) => {
    setSelected(name);
    setProfileLoading(true);
    vendorsApi
      .profile(name)
      .then((r) => setProfile(r.data))
      .finally(() => setProfileLoading(false));
  };

  const filtered = vendors.filter((v) =>
    v.vendor_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Company Intelligence</h1>
        <p className="text-gray-400 text-sm mt-1">Analyze vendor performance and competitive positioning</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: vendor list */}
        <div className="xl:col-span-1 space-y-3">
          {/* Smart Filters */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600">
                {filtersLoading ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block" />
                    Updating…
                  </span>
                ) : "Smart filters"}
              </p>
              {(sector || agency) && (
                <button
                  onClick={() => { setSector(""); setAgency(""); }}
                  className="text-xs text-red-400 hover:text-red-300 transition"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={`block text-xs mb-1 ${sector ? "text-blue-400" : "text-gray-500"}`}>
                  Sector {!sector && filterOptions.sectors?.length > 0 && (
                    <span className="text-gray-600">({filterOptions.sectors.length})</span>
                  )}
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  disabled={filtersLoading && !sector}
                  className={`w-full bg-gray-800 border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500 transition disabled:opacity-50 ${
                    sector ? "border-blue-500/60 text-white" : "border-gray-700 text-gray-300"
                  }`}
                >
                  <option value="">All Sectors</option>
                  {(filterOptions.sectors || []).map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-xs mb-1 ${agency ? "text-blue-400" : "text-gray-500"}`}>
                  Agency {!agency && filterOptions.agencies?.length > 0 && (
                    <span className="text-gray-600">({filterOptions.agencies.length})</span>
                  )}
                </label>
                <select
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  disabled={filtersLoading && !agency}
                  className={`w-full bg-gray-800 border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500 transition disabled:opacity-50 ${
                    agency ? "border-blue-500/60 text-white" : "border-gray-700 text-gray-300"
                  }`}
                >
                  <option value="">All Agencies</option>
                  {(filterOptions.agencies || []).map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendors..."
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-9 pr-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Vendor list */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-800">
              <p className="text-gray-400 text-xs">{filtered.length} vendors</p>
            </div>
            <div className="overflow-y-auto max-h-[500px]">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                filtered.map((v) => (
                  <button
                    key={v.vendor_name}
                    onClick={() => selectVendor(v.vendor_name)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-800/50 hover:bg-gray-800/50 transition ${
                      selected === v.vendor_name ? "bg-blue-600/10 border-l-2 border-l-blue-500" : ""
                    }`}
                  >
                    <p className="text-gray-200 text-sm truncate">{v.vendor_name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-gray-500 text-xs">{v.participations} bids</span>
                      <span className="text-green-400 text-xs">{v.wins} wins</span>
                      <span className="text-gray-500 text-xs">{v.win_rate}%</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: profile */}
        <div className="xl:col-span-2">
          {!selected ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center h-64">
              <div className="text-center">
                <Building2 size={40} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">Select a vendor to view their profile</p>
              </div>
            </div>
          ) : profileLoading ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : profile ? (
            <div className="space-y-5">
              {/* Profile header */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h2 className="text-white font-bold text-lg mb-4">{profile.vendor_name}</h2>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Participations", value: profile.participations, icon: TrendingUp },
                    { label: "Wins", value: profile.wins, icon: Trophy },
                    { label: "Win Rate", value: `${profile.win_rate}%`, icon: TrendingUp },
                    { label: "Avg Bid", value: profile.avg_bid ? `SAR ${fmt(profile.avg_bid)}` : "—", icon: DollarSign },
                    { label: "Total Awarded", value: `SAR ${fmt(profile.total_awarded)}`, icon: DollarSign },
                    { label: "Sectors", value: profile.sectors?.length || 0, icon: Building2 },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-gray-800 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">{label}</p>
                      <p className="text-white font-bold text-lg mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-2 gap-5">
                {/* Win/Loss donut */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-3 text-sm">Wins vs Losses</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Wins", value: profile.wins },
                          { name: "Losses", value: profile.participations - profile.wins },
                        ]}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#374151" />
                      </Pie>
                      <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Bid history chart */}
                {profile.bid_history?.length > 0 && (
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <h3 className="text-white font-semibold mb-3 text-sm">Recent Bids</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={profile.bid_history.slice(0, 10)}>
                        <XAxis dataKey="tender_id" tick={false} />
                        <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                        <Tooltip
                          contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
                          formatter={(v) => [`SAR ${v?.toLocaleString()}`, "Bid"]}
                          labelFormatter={(l) => `Tender #${l}`}
                        />
                        <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                          {profile.bid_history.slice(0, 10).map((entry, i) => (
                            <Cell key={i} fill={entry.is_winner ? "#10b981" : "#3b82f6"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Sectors & Regions */}
              <div className="grid grid-cols-2 gap-5">
                {[
                  { label: "Active Sectors", items: profile.sectors },
                  { label: "Active Regions", items: profile.regions },
                ].map(({ label, items }) => (
                  <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <h3 className="text-white font-semibold mb-3 text-sm">{label}</h3>
                    <div className="flex flex-wrap gap-2">
                      {(items || []).map((item) => (
                        <span key={item} className="bg-gray-800 text-gray-300 text-xs px-2.5 py-1 rounded-full">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

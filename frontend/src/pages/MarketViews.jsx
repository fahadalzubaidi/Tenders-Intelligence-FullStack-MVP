import { useEffect, useState } from "react";
import { marketApi } from "../api/client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const fmt = (n) =>
  n == null ? "—" : n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n);

const densityColors = {
  High: "bg-red-500/15 text-red-400 border-red-500/30",
  Medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Low: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Single: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

const densityEmoji = { High: "🔥", Medium: "🟡", Low: "🟠", Single: "🧊" };

export default function MarketViews() {
  const [tab, setTab] = useState(0);
  const [filterOptions, setFilterOptions] = useState({ sectors: [], agencies: [] });
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [sector, setSector] = useState("");
  const [agency, setAgency] = useState("");

  const [topCompanies, setTopCompanies] = useState([]);
  const [density, setDensity] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(false);

  // Smart cross-filtering: each dropdown only shows options valid given the other
  useEffect(() => {
    setFiltersLoading(true);
    marketApi
      .smartFilters({
        sector: sector || undefined,
        agency: agency || undefined,
      })
      .then((r) => setFilterOptions(r.data))
      .finally(() => setFiltersLoading(false));
  }, [sector, agency]);

  useEffect(() => {
    setLoading(true);
    const params = { sector: sector || undefined, agency: agency || undefined };
    Promise.all([
      marketApi.topCompanies({ ...params, top_n: 25 }),
      marketApi.competitiveDensity(params),
      marketApi.pricingAnalysis(params),
    ]).then(([tc, d, p]) => {
      setTopCompanies(tc.data);
      setDensity(d.data);
      setPricing(p.data);
    }).finally(() => setLoading(false));
  }, [sector, agency]);

  const tabs = [
    { label: "🏆 Top Companies" },
    { label: "⚔️ Competitive Density" },
    { label: "💰 Pricing Analysis" },
  ];

  const densityCounts = density.reduce((acc, d) => {
    acc[d.density] = (acc[d.density] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Market Views</h1>
        <p className="text-gray-400 text-sm mt-1">Competitive intelligence and market analysis</p>
      </div>

      {/* Smart Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {filtersLoading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block" />
                Updating options…
              </span>
            ) : (
              <span>Selecting a filter narrows the other automatically.</span>
            )}
          </p>
          {(sector || agency) && (
            <button
              onClick={() => { setSector(""); setAgency(""); }}
              className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg px-3 py-1 transition"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={`block text-xs mb-1 ${sector ? "text-blue-400 font-medium" : "text-gray-400"}`}>
              Sector {!sector && filterOptions.sectors?.length > 0 && (
                <span className="text-gray-600">({filterOptions.sectors.length})</span>
              )}
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              disabled={filtersLoading && !sector}
              className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition disabled:opacity-50 ${
                sector ? "border-blue-500/60 text-white" : "border-gray-700 text-gray-200"
              }`}
            >
              <option value="">All Sectors</option>
              {(filterOptions.sectors || []).map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className={`block text-xs mb-1 ${agency ? "text-blue-400 font-medium" : "text-gray-400"}`}>
              Agency {!agency && filterOptions.agencies?.length > 0 && (
                <span className="text-gray-600">({filterOptions.agencies.length})</span>
              )}
            </label>
            <select
              value={agency}
              onChange={(e) => setAgency(e.target.value)}
              disabled={filtersLoading && !agency}
              className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition disabled:opacity-50 ${
                agency ? "border-blue-500/60 text-white" : "border-gray-700 text-gray-200"
              }`}
            >
              <option value="">All Agencies</option>
              {(filterOptions.agencies || []).map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {tabs.map((t, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === i ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Tab 0: Top Companies */}
          {tab === 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-4">Top 25 by Wins</h3>
                <ResponsiveContainer width="100%" height={500}>
                  <BarChart data={topCompanies} layout="vertical">
                    <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="vendor_name"
                      width={150}
                      tick={{ fill: "#9ca3af", fontSize: 10 }}
                      tickFormatter={(v) => v.length > 20 ? v.slice(0, 20) + "…" : v}
                    />
                    <Tooltip
                      contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
                      formatter={(v, n) => [v, n === "wins" ? "Wins" : n]}
                    />
                    <Bar dataKey="wins" radius={[0, 4, 4, 0]}>
                      {topCompanies.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={`hsl(${120 * (entry.win_rate / 100)}, 70%, 50%)`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-4">Summary Table</h3>
                <div className="overflow-auto max-h-[500px]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left text-xs text-gray-400 pb-2">#</th>
                        <th className="text-left text-xs text-gray-400 pb-2">Vendor</th>
                        <th className="text-right text-xs text-gray-400 pb-2">Wins</th>
                        <th className="text-right text-xs text-gray-400 pb-2">Win%</th>
                        <th className="text-right text-xs text-gray-400 pb-2">Awarded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCompanies.map((v, i) => (
                        <tr key={i} className="border-b border-gray-800/50">
                          <td className="py-2 text-gray-500 text-xs">{i + 1}</td>
                          <td className="py-2 text-gray-200 text-xs max-w-[160px]">
                            <p className="truncate">{v.vendor_name}</p>
                          </td>
                          <td className="py-2 text-right text-gray-300 text-xs">{v.wins}</td>
                          <td className="py-2 text-right text-xs">
                            <span className={`${v.win_rate >= 50 ? "text-green-400" : "text-gray-400"}`}>
                              {v.win_rate}%
                            </span>
                          </td>
                          <td className="py-2 text-right text-gray-400 font-mono text-xs">
                            {fmt(v.total_awarded)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 1: Competitive Density */}
          {tab === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-4 gap-4">
                {["High", "Medium", "Low", "Single"].map((d) => (
                  <div key={d} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                    <p className="text-2xl mb-1">{densityEmoji[d]}</p>
                    <p className="text-white text-xl font-bold">{densityCounts[d] || 0}</p>
                    <p className="text-gray-400 text-xs mt-1">{d} Competition</p>
                  </div>
                ))}
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-auto max-h-[500px]">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-900">
                      <tr className="border-b border-gray-800">
                        <th className="text-left text-xs text-gray-400 px-4 py-3">Tender</th>
                        <th className="text-left text-xs text-gray-400 px-4 py-3">Agency</th>
                        <th className="text-left text-xs text-gray-400 px-4 py-3">Sector</th>
                        <th className="text-center text-xs text-gray-400 px-4 py-3">Bids</th>
                        <th className="text-center text-xs text-gray-400 px-4 py-3">Density</th>
                        <th className="text-right text-xs text-gray-400 px-4 py-3">Awarded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {density.map((d, i) => (
                        <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="px-4 py-2.5 text-gray-200 text-xs max-w-[200px]">
                            <p className="truncate">{d.tenderName}</p>
                          </td>
                          <td className="px-4 py-2.5 text-gray-400 text-xs max-w-[140px]">
                            <p className="truncate">{d.agency}</p>
                          </td>
                          <td className="px-4 py-2.5 text-gray-400 text-xs">{d.sector}</td>
                          <td className="px-4 py-2.5 text-center text-gray-300 text-xs">{d.bid_count}</td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${densityColors[d.density]}`}>
                              {densityEmoji[d.density]} {d.density}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-400 font-mono text-xs">
                            {d.awarded_value ? `SAR ${fmt(d.awarded_value)}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Pricing Analysis */}
          {tab === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total Awarded", value: `SAR ${fmt(pricing.reduce((s, p) => s + (p.awarded_value || 0), 0))}` },
                  { label: "Lowest Contract", value: `SAR ${fmt(Math.min(...pricing.filter(p => p.awarded_value).map(p => p.awarded_value)))}` },
                  { label: "Highest Contract", value: `SAR ${fmt(Math.max(...pricing.filter(p => p.awarded_value).map(p => p.awarded_value)))}` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <p className="text-gray-400 text-xs">{label}</p>
                    <p className="text-white text-lg font-bold mt-1">{value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-auto max-h-[500px]">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-900">
                      <tr className="border-b border-gray-800">
                        <th className="text-left text-xs text-gray-400 px-4 py-3">Tender</th>
                        <th className="text-left text-xs text-gray-400 px-4 py-3">Sector</th>
                        <th className="text-right text-xs text-gray-400 px-4 py-3">Min Bid</th>
                        <th className="text-right text-xs text-gray-400 px-4 py-3">Max Bid</th>
                        <th className="text-right text-xs text-gray-400 px-4 py-3">Awarded</th>
                        <th className="text-right text-xs text-gray-400 px-4 py-3">Spread</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricing.map((p, i) => (
                        <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="px-4 py-2.5 text-gray-200 text-xs max-w-[200px]">
                            <p className="truncate">{p.tenderName}</p>
                          </td>
                          <td className="px-4 py-2.5 text-gray-400 text-xs">{p.sector}</td>
                          <td className="px-4 py-2.5 text-right text-gray-300 font-mono text-xs">
                            {p.min_bid ? `SAR ${fmt(p.min_bid)}` : "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-300 font-mono text-xs">
                            {p.max_bid ? `SAR ${fmt(p.max_bid)}` : "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right text-green-400 font-mono text-xs">
                            {p.awarded_value ? `SAR ${fmt(p.awarded_value)}` : "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-400 font-mono text-xs">
                            {p.bid_spread ? `SAR ${fmt(p.bid_spread)}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

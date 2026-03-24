import { useEffect, useState } from "react";
import { marketApi } from "../api/client";
import { Lightbulb, MapPin, Star } from "lucide-react";

export default function MarketInsights() {
  const [sectorSpecialists, setSectorSpecialists] = useState([]);
  const [regionSpecialists, setRegionSpecialists] = useState([]);
  const [minWins, setMinWins] = useState(2);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      marketApi.sectorSpecialists(minWins),
      marketApi.regionSpecialists(minWins),
    ]).then(([ss, rs]) => {
      setSectorSpecialists(ss.data);
      setRegionSpecialists(rs.data);
    }).finally(() => setLoading(false));
  }, [minWins]);

  // Top specialist per sector
  const topPerSector = Object.values(
    sectorSpecialists.reduce((acc, s) => {
      if (!acc[s.top_sector] || s.concentration_pct > acc[s.top_sector].concentration_pct) {
        acc[s.top_sector] = s;
      }
      return acc;
    }, {})
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Market Insights</h1>
          <p className="text-gray-400 text-sm mt-1">Vendor specialization and market concentration analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-gray-400 text-sm">Min wins:</label>
          <input
            type="number"
            min={1}
            value={minWins}
            onChange={(e) => setMinWins(Number(e.target.value))}
            className="w-16 bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Sector Specialists", value: sectorSpecialists.length, icon: Star, color: "text-blue-400" },
              { label: "Region Specialists", value: regionSpecialists.length, icon: MapPin, color: "text-purple-400" },
              { label: "Sectors with Specialists", value: topPerSector.length, icon: Lightbulb, color: "text-amber-400" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
                <Icon size={24} className={color} />
                <div>
                  <p className="text-gray-400 text-xs">{label}</p>
                  <p className="text-white text-2xl font-bold">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Top specialist per sector */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Top Specialist per Sector (≥80% concentration)</h3>
            {topPerSector.length === 0 ? (
              <p className="text-gray-500 text-sm">No specialists found with current threshold</p>
            ) : (
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-xs text-gray-400 pb-2">Sector</th>
                      <th className="text-left text-xs text-gray-400 pb-2">Top Specialist</th>
                      <th className="text-right text-xs text-gray-400 pb-2">Wins in Sector</th>
                      <th className="text-right text-xs text-gray-400 pb-2">Total Wins</th>
                      <th className="text-right text-xs text-gray-400 pb-2">Concentration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPerSector.map((s, i) => (
                      <tr key={i} className="border-b border-gray-800/50">
                        <td className="py-2.5 text-gray-200 text-xs font-medium">{s.top_sector}</td>
                        <td className="py-2.5 text-gray-300 text-xs max-w-[200px]">
                          <p className="truncate">{s.vendor_name}</p>
                        </td>
                        <td className="py-2.5 text-right text-gray-300 text-xs">{s.wins_in_sector}</td>
                        <td className="py-2.5 text-right text-gray-400 text-xs">{s.total_wins}</td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${s.concentration_pct}%` }}
                              />
                            </div>
                            <span className="text-blue-400 text-xs font-medium">{s.concentration_pct}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* All sector specialists */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">
                All Sector Specialists ({sectorSpecialists.length})
              </h3>
              <div className="overflow-auto max-h-80 space-y-2">
                {sectorSpecialists.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-800/50 rounded-lg px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 text-xs truncate">{s.vendor_name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{s.top_sector}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-blue-400 text-xs font-bold">{s.concentration_pct}%</p>
                      <p className="text-gray-500 text-xs">{s.wins_in_sector}/{s.total_wins} wins</p>
                    </div>
                  </div>
                ))}
                {sectorSpecialists.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">No sector specialists found</p>
                )}
              </div>
            </div>

            {/* Region specialists */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">
                Region Specialists ≥90% ({regionSpecialists.length})
              </h3>
              <div className="overflow-auto max-h-80 space-y-2">
                {regionSpecialists.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-800/50 rounded-lg px-3 py-2.5">
                    <MapPin size={14} className="text-purple-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 text-xs truncate">{s.vendor_name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{s.top_region}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-purple-400 text-xs font-bold">{s.concentration_pct}%</p>
                      <p className="text-gray-500 text-xs">{s.wins_in_region}/{s.total_wins} wins</p>
                    </div>
                  </div>
                ))}
                {regionSpecialists.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">No region specialists found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

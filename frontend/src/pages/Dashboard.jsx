import { useEffect, useState } from "react";
import { tendersApi } from "../api/client";
import KpiCard from "../components/KpiCard";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  FileText, Award, Users, DollarSign, TrendingUp,
} from "lucide-react";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"];

const fmt = (n) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(0)}K`
    : String(n ?? 0);

export default function Dashboard() {
  const [kpi, setKpi] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [regions, setRegions] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      tendersApi.kpi(),
      tendersApi.sectorBreakdown(),
      tendersApi.regionBreakdown(),
      tendersApi.topAgencies(10),
      tendersApi.topVendors(10),
    ]).then(([k, s, r, a, v]) => {
      setKpi(k.data);
      setSectors(s.data.slice(0, 8));
      setRegions(r.data.slice(0, 8));
      setAgencies(a.data);
      setVendors(v.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">KSA Procurement Intelligence Overview</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard title="Total Tenders" value={kpi?.total_tenders?.toLocaleString()} icon={FileText} color="blue" />
        <KpiCard title="Awarded" value={kpi?.awarded_tenders?.toLocaleString()} icon={Award} color="green" />
        <KpiCard title="Unique Vendors" value={kpi?.unique_vendors?.toLocaleString()} icon={Users} color="purple" />
        <KpiCard
          title="Total Awarded Value"
          value={`SAR ${fmt(kpi?.total_awarded_value)}`}
          icon={DollarSign}
          color="amber"
        />
        <KpiCard
          title="Avg Bidders"
          value={kpi?.avg_bidders?.toFixed(1)}
          icon={TrendingUp}
          color="rose"
          subtitle="per tender"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sectors bar */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Tenders by Sector</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sectors} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="sector"
                width={140}
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                tickFormatter={(v) => v.length > 18 ? v.slice(0, 18) + "…" : v}
              />
              <Tooltip
                contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
                labelStyle={{ color: "#f9fafb" }}
                itemStyle={{ color: "#93c5fd" }}
              />
              <Bar dataKey="total_tenders" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Regions pie */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Tenders by Region</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={regions}
                dataKey="total_tenders"
                nameKey="region"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={2}
              >
                {regions.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
                labelStyle={{ color: "#f9fafb" }}
              />
              <Legend
                formatter={(v) => <span style={{ color: "#9ca3af", fontSize: 12 }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top agencies */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Top Spending Agencies</h3>
          <div className="space-y-2">
            {agencies.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-gray-500 text-xs w-5 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-200 text-sm truncate">{a.agency}</p>
                  <div className="mt-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(a.total_value / (agencies[0]?.total_value || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-gray-400 text-xs font-mono shrink-0">
                  SAR {fmt(a.total_value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top vendors */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Top Winning Vendors</h3>
          <div className="space-y-2">
            {vendors.map((v, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-gray-500 text-xs w-5 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-200 text-sm truncate">{v.vendor_name}</p>
                  <p className="text-gray-500 text-xs">{v.wins} wins · {v.win_rate}% win rate</p>
                </div>
                <span className="text-gray-400 text-xs font-mono shrink-0">
                  SAR {fmt(v.total_awarded)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

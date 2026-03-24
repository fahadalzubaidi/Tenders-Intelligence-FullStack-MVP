import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tendersApi } from "../api/client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { ArrowLeft, Building2, MapPin, Calendar, Clock, DollarSign, Users, CheckCircle, XCircle } from "lucide-react";

const fmt = (n) =>
  n == null ? "—" : n >= 1_000_000 ? `SAR ${(n / 1_000_000).toFixed(2)}M` : `SAR ${n.toLocaleString()}`;

const statusColors = {
  Awarded: "bg-green-500/15 text-green-400 border-green-500/30",
  Active: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Other: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    tendersApi
      .detail(id)
      .then((r) => setTender(r.data))
      .catch(() => setError("Tender not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Opportunity Detail</h1>
        <p className="text-gray-400 mb-4">Select a tender from the listing to view its details.</p>
        <button
          onClick={() => navigate("/tenders")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          <ArrowLeft size={15} /> Go to Tenders Listing
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="p-6">
        <p className="text-red-400">{error || "Tender not found"}</p>
        <button onClick={() => navigate("/tenders")} className="mt-4 text-blue-400 hover:underline text-sm">
          ← Back to listing
        </button>
      </div>
    );
  }

  const chartData = tender.proposals.map((p) => ({
    name: p.vendor_name.length > 20 ? p.vendor_name.slice(0, 20) + "…" : p.vendor_name,
    price: p.price,
    is_winner: p.is_winner,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate("/tenders")}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition"
      >
        <ArrowLeft size={15} /> Back to Tenders
      </button>

      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-gray-400 text-xs font-mono mb-1">#{tender.id}</p>
            <h1 className="text-xl font-bold text-white leading-snug">{tender.tenderName}</h1>
          </div>
          <span className={`shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[tender.status_bucket] || statusColors.Other}`}>
            {tender.status_bucket}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Building2, label: "Agency", value: tender.agency },
            { icon: MapPin, label: "Location", value: `${tender.city}, ${tender.region}` },
            { icon: Calendar, label: "Deadline", value: tender.deadline ? new Date(tender.deadline).toLocaleDateString() : "—" },
            { icon: Clock, label: "Contract Period", value: tender.contract_days ? `${tender.contract_days} days` : "—" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <Icon size={15} className="text-gray-400" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">{label}</p>
                <p className="text-gray-200 text-sm font-medium mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bid metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Bids", value: tender.bid_count, icon: Users },
          { label: "Min Bid", value: fmt(tender.min_bid), icon: DollarSign },
          { label: "Max Bid", value: fmt(tender.max_bid), icon: DollarSign },
          { label: "Awarded Value", value: fmt(tender.awarded_value), icon: CheckCircle },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={15} className="text-gray-500" />
              <p className="text-gray-400 text-xs">{label}</p>
            </div>
            <p className="text-white text-lg font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Chart + Table */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bid comparison chart */}
        {chartData.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Bid Comparison</h3>
            <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 40)}>
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
                  formatter={(v) => [`SAR ${v?.toLocaleString()}`, "Bid"]}
                />
                <Bar dataKey="price" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.is_winner ? "#10b981" : "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-500" /><span className="text-gray-400 text-xs">Winner</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-500" /><span className="text-gray-400 text-xs">Bidder</span></div>
            </div>
          </div>
        )}

        {/* Proposals table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">All Proposals ({tender.proposals.length})</h3>
          <div className="overflow-auto max-h-80">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-xs text-gray-400 pb-2">Vendor</th>
                  <th className="text-right text-xs text-gray-400 pb-2">Bid (SAR)</th>
                  <th className="text-center text-xs text-gray-400 pb-2">Tech</th>
                  <th className="text-center text-xs text-gray-400 pb-2">Winner</th>
                </tr>
              </thead>
              <tbody>
                {tender.proposals.map((p, i) => (
                  <tr key={i} className={`border-b border-gray-800/50 ${p.is_winner ? "bg-green-500/5" : ""}`}>
                    <td className="py-2 pr-3 text-gray-200 text-xs max-w-[180px]">
                      <p className="truncate">{p.vendor_name}</p>
                    </td>
                    <td className="py-2 text-right text-gray-300 font-mono text-xs">
                      {p.price?.toLocaleString() ?? "—"}
                    </td>
                    <td className="py-2 text-center">
                      {p.technical_match ? (
                        <CheckCircle size={14} className="text-green-400 mx-auto" />
                      ) : (
                        <XCircle size={14} className="text-gray-600 mx-auto" />
                      )}
                    </td>
                    <td className="py-2 text-center">
                      {p.is_winner ? (
                        <CheckCircle size={14} className="text-green-400 mx-auto" />
                      ) : (
                        <span className="text-gray-700">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

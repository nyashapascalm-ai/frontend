"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Summary = {
  totalEarnings: number;
  earnings30d: number;
  totalClicks: number;
  clicksToday: number;
  totalProducts: number;
  totalContent: number;
  topProduct: string | null;
};

type ProductStat = {
  id: number;
  name: string;
  category?: string;
  network?: string;
  price: number;
  commissionRate?: number;
  status: string;
  slug?: string;
  profitabilityScore?: number;
  trendScore?: number;
  totalClicks: number;
  clicksToday: number;
  clicks7d: number;
  clicks30d: number;
  estimatedEarnings: number;
  earnings30d: number;
  contentCount: number;
};

const API = "https://backend-production-c3f5.up.railway.app";

export default function Dashboard() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [products, setProducts] = useState<ProductStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertEmail, setAlertEmail] = useState("nyashapascalm@gmail.com");
  const [alertStatus, setAlertStatus] = useState("");
  const [checkingAlerts, setCheckingAlerts] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetch(`${API}/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setSummary(data.summary);
        setProducts(data.products);
        setLoading(false);
      });
  }, []);

  async function checkAlerts() {
    setCheckingAlerts(true);
    setAlertStatus("");
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/alerts/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email: alertEmail }),
    });
    const data = await res.json();
    if (data.alerts?.length > 0) {
      setAlertStatus(`Alert sent! ${data.alerts.length} spike(s) detected.`);
    } else {
      setAlertStatus("No spikes detected right now.");
    }
    setCheckingAlerts(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-400">Loading dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/")} className="text-sm text-gray-500 hover:text-gray-700">← Products</button>
            <h1 className="text-2xl font-bold text-gray-900">Revenue Dashboard</h1>
          </div>
          <span className="text-sm text-gray-500">{summary?.totalProducts} products</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-1">Total Est. Earnings</p>
            <p className="text-3xl font-bold text-green-600">${summary?.totalEarnings}</p>
            <p className="text-xs text-gray-400 mt-1">All time</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-1">Earnings (30 days)</p>
            <p className="text-3xl font-bold text-blue-600">${summary?.earnings30d}</p>
            <p className="text-xs text-gray-400 mt-1">Last 30 days</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-1">Total Clicks</p>
            <p className="text-3xl font-bold text-purple-600">{summary?.totalClicks}</p>
            <p className="text-xs text-green-500 mt-1">{summary?.clicksToday} today</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-1">Top Product</p>
            <p className="text-lg font-bold text-gray-900 truncate">{summary?.topProduct ?? "—"}</p>
            <p className="text-xs text-gray-400 mt-1">{summary?.totalContent} pieces of content</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Trend Alerts</h2>
          <div className="flex items-center gap-3">
            <input
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="your@email.com"
              value={alertEmail}
              onChange={e => setAlertEmail(e.target.value)}
            />
            <button
              onClick={checkAlerts}
              disabled={checkingAlerts}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {checkingAlerts ? "Checking..." : "Check Alerts"}
            </button>
          </div>
          {alertStatus && (
            <p className={`text-sm mt-3 ${alertStatus.includes("sent") ? "text-green-600" : "text-gray-500"}`}>
              {alertStatus}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Product Performance</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Product</th>
                <th className="px-6 py-3 text-right">Clicks</th>
                <th className="px-6 py-3 text-right">7d</th>
                <th className="px-6 py-3 text-right">Commission</th>
                <th className="px-6 py-3 text-right">Est. Earnings</th>
                <th className="px-6 py-3 text-right">30d Earnings</th>
                <th className="px-6 py-3 text-right">Trend</th>
                <th className="px-6 py-3 text-right">Content</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push("/")}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-700 rounded-lg w-8 h-8 flex items-center justify-center font-bold text-sm">{p.name[0]}</div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {p.network && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">{p.network}</span>}
                          {p.category && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{p.category}</span>}
                          <span className={`text-xs px-1.5 py-0.5 rounded ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{p.status}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-700">{p.totalClicks}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-700">{p.clicks7d}</td>
                  <td className="px-6 py-4 text-right text-sm text-orange-600">{p.commissionRate ? `${p.commissionRate}%` : "—"}</td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">${p.estimatedEarnings}</td>
                  <td className="px-6 py-4 text-right text-sm text-blue-600">${p.earnings30d}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${(p.trendScore ?? 0) >= 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.trendScore ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-700">{p.contentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
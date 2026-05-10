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
  awinRevenue: number;
  awinTransactions: number;
  awinPending: number;
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
  const [importStatus, setImportStatus] = useState("");
  const [importing, setImporting] = useState(false);
  const [autoTagStatus, setAutoTagStatus] = useState("");
  const [autoTagging, setAutoTagging] = useState(false);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkTypes, setBulkTypes] = useState({ tiktok: true, blog: false, instagram: false });
  const [reportStatus, setReportStatus] = useState("");
  const [sendingReport, setSendingReport] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    loadDashboard(token);
  }, []);

  async function loadDashboard(token: string) {
    const res = await fetch(`${API}/dashboard`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setSummary(data.summary);
    setProducts(data.products);
    setLoading(false);
  }

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

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportStatus("");
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API}/import/csv`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    setImportStatus(data.message || "Import complete!");
    setImporting(false);
    if (res.ok) loadDashboard(token!);
  }

  async function handleAutoTag() {
    setAutoTagging(true);
    setAutoTagStatus("");
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/products/autotag`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ force: true }),
    });
    const data = await res.json();
    setAutoTagStatus(data.message || "Done!");
    setAutoTagging(false);
    loadDashboard(token!);
  }

  async function handleBulkGenerate() {
    setBulkGenerating(true);
    setBulkStatus("");
    const token = localStorage.getItem("token");
    const types = Object.entries(bulkTypes).filter(([_, v]) => v).map(([k]) => k);
    if (types.length === 0) { setBulkStatus("Select at least one content type."); setBulkGenerating(false); return; }
    const res = await fetch(`${API}/content/generate-bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ types }),
    });
    const data = await res.json();
    setBulkStatus(data.message || "Done!");
    setBulkGenerating(false);
    loadDashboard(token!);
  }

  async function sendWeeklyReport() {
    setSendingReport(true);
    setReportStatus("");
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/reports/weekly`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email: alertEmail }),
    });
    const data = await res.json();
    setReportStatus(data.message || "Report sent!");
    setSendingReport(false);
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
            <button onClick={() => router.push("/")} className="text-sm text-gray-500 hover:text-gray-700">Back to Products</button>
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
            <p className="text-sm text-gray-500 mb-1">Earnings 30 days</p>
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

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-orange-400">
            <p className="text-sm text-gray-500 mb-1">Awin Real Revenue (30d)</p>
            <p className="text-3xl font-bold text-orange-600">£{summary?.awinRevenue ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">Actual commissions earned</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-orange-400">
            <p className="text-sm text-gray-500 mb-1">Awin Transactions (30d)</p>
            <p className="text-3xl font-bold text-gray-900">{summary?.awinTransactions ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">Total sales recorded</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-yellow-400">
            <p className="text-sm text-gray-500 mb-1">Pending Transactions</p>
            <p className="text-3xl font-bold text-yellow-600">{summary?.awinPending ?? 0}</p>
            <p className="text-xs text-gray-400 mt-1">Awaiting validation</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Bulk Generate Content</h2>
            <p className="text-sm text-gray-500 mb-3">Generate content for all active products at once.</p>
            <div className="flex gap-4 mb-4">
              {(["tiktok", "blog", "instagram"] as const).map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkTypes[type]}
                    onChange={e => setBulkTypes(prev => ({ ...prev, [type]: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
            <button
              onClick={handleBulkGenerate}
              disabled={bulkGenerating}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50 w-full"
            >
              {bulkGenerating ? "Generating... (this may take a while)" : "Generate for All Products"}
            </button>
            {bulkStatus && <p className="text-sm text-green-600 mt-3">{bulkStatus}</p>}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Auto-Tag Niches</h2>
            <p className="text-sm text-gray-500 mb-4">Use AI to automatically classify all products into the right niche categories.</p>
            <button
              onClick={handleAutoTag}
              disabled={autoTagging}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50 w-full"
            >
              {autoTagging ? "Tagging..." : "Auto-Tag All Products"}
            </button>
            {autoTagStatus && <p className="text-sm text-green-600 mt-3">{autoTagStatus}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
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
                {checkingAlerts ? "..." : "Check"}
              </button>
            </div>
            {alertStatus && (
              <p className={`text-sm mt-3 ${alertStatus.includes("sent") ? "text-green-600" : "text-gray-500"}`}>
                {alertStatus}
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Weekly Report</h2>
            <p className="text-sm text-gray-500 mb-4">Send a full performance report to your inbox right now.</p>
            <button
              onClick={sendWeeklyReport}
              disabled={sendingReport}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50 w-full"
            >
              {sendingReport ? "Sending..." : "Send Weekly Report"}
            </button>
            {reportStatus && <p className="text-sm text-green-600 mt-3">{reportStatus}</p>}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Bulk Import Products</h2>
            <button
              onClick={() => window.open(`${API}/import/template`, "_blank")}
              className="text-sm text-blue-600 hover:text-blue-700 underline block mb-3"
            >
              Download CSV template
            </button>
            <label className="block">
              <input type="file" accept=".csv" className="hidden" onChange={handleImport} disabled={importing} />
              <div className="border-2 border-dashed border-gray-300 rounded-lg px-4 py-4 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 cursor-pointer transition text-center">
                {importing ? "Importing..." : "Click to upload CSV"}
              </div>
            </label>
            {importStatus && <p className="text-sm text-green-600 mt-2">{importStatus}</p>}
          </div>
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
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
const CATEGORIES = [
  "Baby & Parenting",
  "Home & Garden",
  "Tech & AI Tools",
  "Health & Wellness",
  "Pet Care",
  "Finance and Insurance",
  "Travel and Outdoors",
  "Start up and Investment",
  "Parenting",
  "Home Office",
  "AI Tools",
  "Education",
  "Business",
  "Furniture",
  "Fashion",
  "Beauty",
  "Fitness",
];

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
  const [bulkTypes, setBulkTypes] = useState({ tiktok: false, blog: true, instagram: false });
  const [reportStatus, setReportStatus] = useState("");
  const [sendingReport, setSendingReport] = useState(false);
  const [publishingBlogs, setPublishingBlogs] = useState(false);
  const [blogPublishStatus, setBlogPublishStatus] = useState("");
  const [pinning, setPinning] = useState(false);
  const [pinStatus, setPinStatus] = useState("");
  const [addingImages, setAddingImages] = useState(false);
  const [imageStatus, setImageStatus] = useState("");
  const [sendingWeeklyDeals, setSendingWeeklyDeals] = useState(false);
  const [weeklyDealsStatus, setWeeklyDealsStatus] = useState("");

  const [compCategory, setCompCategory] = useState("Baby & Parenting");
  const [compMaxPrice, setCompMaxPrice] = useState("500");
  const [compTitle, setCompTitle] = useState("");
  const [generatingComparison, setGeneratingComparison] = useState(false);
  const [comparisonStatus, setComparisonStatus] = useState("");
  const [publishingComparison, setPublishingComparison] = useState(false);
  const [lastComparisonId, setLastComparisonId] = useState<number | null>(null);

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
    setAlertStatus(data.alerts?.length > 0 ? `Alert sent! ${data.alerts.length} spike(s) detected.` : "No spikes detected right now.");
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

  async function handleSendWeeklyDeals() {
    setSendingWeeklyDeals(true);
    setWeeklyDealsStatus("");
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/send-weekly-deals`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setWeeklyDealsStatus(data.message || "Done!");
    setSendingWeeklyDeals(false);
  }

  async function handlePublishAllBlogs() {
    setPublishingBlogs(true);
    setBlogPublishStatus("");
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/wordpress/publish-all-blogs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setBlogPublishStatus(data.message || "Done!");
    setPublishingBlogs(false);
    loadDashboard(token!);
  }

  async function handlePinAllProducts() {
    setPinning(true);
    setPinStatus("");
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/pinterest/pin-all-products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setPinStatus(data.message || "Done!");
    setPinning(false);
  }

  async function handleAddFeaturedImages() {
    setAddingImages(true);
    setImageStatus("");
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/images/add-featured-images`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setImageStatus(data.message || "Done!");
    setAddingImages(false);
  }

  async function handleGenerateComparison() {
    setGeneratingComparison(true);
    setComparisonStatus("");
    setLastComparisonId(null);
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/content/generate-comparison`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        category: compCategory,
        maxPrice: compMaxPrice,
        title: compTitle || undefined,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setComparisonStatus(`✅ ${data.message} — comparing ${data.productsCompared} products`);
      setLastComparisonId(data.content?.id || null);
    } else {
      setComparisonStatus(`❌ ${data.error}`);
    }
    setGeneratingComparison(false);
  }

  async function handlePublishComparison() {
    if (!lastComparisonId) return;
    setPublishingComparison(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/wordpress/publish/${lastComparisonId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setComparisonStatus(`✅ Published! ${data.postUrl}`);
    } else {
      setComparisonStatus(`❌ Publish failed: ${data.error}`);
    }
    setPublishingComparison(false);
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
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-1">Earnings 30 days</p>
            <p className="text-3xl font-bold text-blue-600">${summary?.earnings30d}</p>
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
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-orange-400">
            <p className="text-sm text-gray-500 mb-1">Awin Transactions (30d)</p>
            <p className="text-3xl font-bold text-gray-900">{summary?.awinTransactions ?? 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 border-l-4 border-yellow-400">
            <p className="text-sm text-gray-500 mb-1">Pending Transactions</p>
            <p className="text-3xl font-bold text-yellow-600">{summary?.awinPending ?? 0}</p>
          </div>
        </div>

        {/* Comparison Post Generator */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-purple-100">
          <h2 className="font-semibold text-gray-900 mb-1 text-lg">🏆 Comparison Post Generator</h2>
          <p className="text-sm text-gray-500 mb-4">Generate "Best X under £Y" style posts that rank faster and convert 3-5x better than single product reviews.</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={compCategory}
                onChange={e => setCompCategory(e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max Price (£)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={compMaxPrice}
                onChange={e => setCompMaxPrice(e.target.value)}
                placeholder="500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Custom Title (optional)</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={compTitle}
                onChange={e => setCompTitle(e.target.value)}
                placeholder={`Best ${compCategory} Under £${compMaxPrice} UK 2026`}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerateComparison}
              disabled={generatingComparison}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition disabled:opacity-50"
            >
              {generatingComparison ? "Generating... (30-60 secs)" : "Generate Comparison Post"}
            </button>
            {lastComparisonId && (
              <button
                onClick={handlePublishComparison}
                disabled={publishingComparison}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition disabled:opacity-50"
              >
                {publishingComparison ? "Publishing..." : "Publish to WordPress →"}
              </button>
            )}
          </div>
          {comparisonStatus && (
            <p className={`text-sm mt-3 ${comparisonStatus.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
              {comparisonStatus}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Bulk Generate Content</h2>
            <div className="flex gap-4 mb-4">
              {(["tiktok", "blog", "instagram"] as const).map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={bulkTypes[type]} onChange={e => setBulkTypes(prev => ({ ...prev, [type]: e.target.checked }))} className="rounded" />
                  <span className="text-sm text-gray-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
            <button onClick={handleBulkGenerate} disabled={bulkGenerating} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50 w-full">
              {bulkGenerating ? "Generating..." : "Generate for All Products"}
            </button>
            {bulkStatus && <p className="text-sm text-green-600 mt-3">{bulkStatus}</p>}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Publish to WordPress</h2>
            <p className="text-sm text-gray-500 mb-4">Auto-publish all draft blog posts to mumdeals.co.uk.</p>
            <button onClick={handlePublishAllBlogs} disabled={publishingBlogs} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50 w-full">
              {publishingBlogs ? "Publishing..." : "Publish All Blog Posts"}
            </button>
            {blogPublishStatus && <p className="text-sm text-green-600 mt-3">{blogPublishStatus}</p>}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Add Featured Images</h2>
            <p className="text-sm text-gray-500 mb-4">Auto-fetch images from Unsplash for all published posts.</p>
            <button onClick={handleAddFeaturedImages} disabled={addingImages} className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50 w-full">
              {addingImages ? "Adding Images..." : "Add Featured Images"}
            </button>
            {imageStatus && <p className="text-sm text-green-600 mt-3">{imageStatus}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Pin to Pinterest</h2>
            <p className="text-sm text-gray-500 mb-4">Auto-pin all active products to your board.</p>
            <button onClick={handlePinAllProducts} disabled={pinning} className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50 w-full">
              {pinning ? "Pinning..." : "Pin All Products"}
            </button>
            {pinStatus && <p className="text-sm mt-3 text-green-600">{pinStatus}</p>}
            <p className="text-xs text-gray-400 mt-2">⚠️ Requires Pinterest API approval</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Auto-Tag Niches</h2>
            <p className="text-sm text-gray-500 mb-4">AI classifies all products into the right niche categories.</p>
            <button onClick={handleAutoTag} disabled={autoTagging} className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50 w-full">
              {autoTagging ? "Tagging..." : "Auto-Tag All Products"}
            </button>
            {autoTagStatus && <p className="text-sm text-green-600 mt-3">{autoTagStatus}</p>}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Weekly Report</h2>
            <p className="text-sm text-gray-500 mb-4">Send a full performance report to your inbox.</p>
            <button onClick={sendWeeklyReport} disabled={sendingReport} className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50 w-full">
              {sendingReport ? "Sending..." : "Send Weekly Report"}
            </button>
            {reportStatus && <p className="text-sm text-green-600 mt-3">{reportStatus}</p>}
          </div>
        </div>

        {/* Email & Subscribers */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-pink-100">
          <h2 className="font-semibold text-gray-900 mb-1 text-lg">📧 Email & Subscribers</h2>
          <p className="text-sm text-gray-500 mb-4">Send your weekly deals email to all active subscribers. Auto-picks top 6 products by commission rate.</p>
          <div className="flex gap-3">
            <button
              onClick={handleSendWeeklyDeals}
              disabled={sendingWeeklyDeals}
              className="bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition disabled:opacity-50"
            >
              {sendingWeeklyDeals ? "Sending..." : "📨 Send Weekly Deals Email"}
            </button>
            
              href={`${API}/subscribers`}
              target="_blank"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-5 py-2 rounded-lg transition"
            >
              View Subscribers
            </a>
          </div>
          {weeklyDealsStatus && (
            <p className="text-sm mt-3 text-green-600">{weeklyDealsStatus}</p>
          )}
          <p className="text-xs text-gray-400 mt-3">⚡ Runs automatically every Monday at 9am once cron is set up</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Bulk Import Products</h2>
            <label className="block">
              <input type="file" accept=".csv" className="hidden" onChange={handleImport} disabled={importing} />
              <div className="border-2 border-dashed border-gray-300 rounded-lg px-4 py-4 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 cursor-pointer transition text-center">
                {importing ? "Importing..." : "Click to upload CSV"}
              </div>
            </label>
            {importStatus && <p className="text-sm text-green-600 mt-2">{importStatus}</p>}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Quick Links</h2>
            <div className="space-y-2">
              <a href="https://mumdeals.co.uk" target="_blank" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <span className="text-sm font-medium text-gray-700">WordPress Site</span>
                <span className="text-xs text-gray-400">View →</span>
              </a>
              <a href="https://uk.pinterest.com/mumcircle3/baby-parenting-deals/" target="_blank" className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition">
                <span className="text-sm font-medium text-red-700">Pinterest Board</span>
                <span className="text-xs text-red-400">View →</span>
              </a>
              <a href="https://ui.awin.com/awin/affiliate/2660114" target="_blank" className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                <span className="text-sm font-medium text-blue-700">Awin Dashboard</span>
                <span className="text-xs text-blue-400">View →</span>
              </a>
              <a href="https://search.google.com/search-console" target="_blank" className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition">
                <span className="text-sm font-medium text-green-700">Search Console</span>
                <span className="text-xs text-green-400">View →</span>
              </a>
            </div>
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
                <th className="px-6 py-3 text-right">Content</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-700 rounded-lg w-8 h-8 flex items-center justify-center font-bold text-sm">{p.name[0]}</div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {p.network && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">{p.network}</span>}
                          {p.category && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{p.category}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-700">{p.totalClicks}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-700">{p.clicks7d}</td>
                  <td className="px-6 py-4 text-right text-sm text-orange-600">{p.commissionRate ? `${p.commissionRate}%` : "—"}</td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">${p.estimatedEarnings}</td>
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
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  affiliateLink?: string;
  commissionRate?: number;
  network?: string;
  category?: string;
  status: string;
  slug?: string;
};

type Content = {
  id: number;
  type: string;
  title: string;
  scriptText: string;
  caption: string;
  hashtags: string;
  thumbnailPrompt: string;
  cta: string;
  status: string;
  createdAt: string;
};

type Stats = {
  total: number;
  today: number;
};

const API = "https://backend-production-c3f5.up.railway.app";
const TRACK_BASE = "https://backend-production-c3f5.up.railway.app/track/go";

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", affiliateLink: "", commissionRate: "", network: "", category: "", status: "active", slug: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [content, setContent] = useState<Content[]>([]);
  const [generating, setGenerating] = useState(false);
  const [contentType, setContentType] = useState("tiktok");
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    const res = await fetch(`${API}/products`);
    setProducts(await res.json());
    setLoading(false);
  }

  async function loadContent(productId: number) {
    const t = localStorage.getItem("token");
    const res = await fetch(`${API}/content/${productId}`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    setContent(await res.json());
  }

  async function loadStats(productId: number) {
    const t = localStorage.getItem("token");
    const res = await fetch(`${API}/track/stats/${productId}`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    if (res.ok) setStats(await res.json());
  }

  async function handleSubmit() {
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API}/products/${editingId}` : `${API}/products`;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        commissionRate: form.commissionRate ? parseFloat(form.commissionRate) : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setErrors(data.errors || {}); return; }
    setForm({ name: "", description: "", price: "", affiliateLink: "", commissionRate: "", network: "", category: "", status: "active", slug: "" });
    setEditingId(null);
    setErrors({});
    setShowForm(false);
    loadProducts();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this product?")) return;
    await fetch(`${API}/products/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    loadProducts();
  }

  async function handleGenerate(productId: number) {
    setGenerating(true);
    const t = token || localStorage.getItem("token");
    const res = await fetch(`${API}/content/generate/${productId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
      body: JSON.stringify({ type: contentType }),
    });
    const data = await res.json();
    if (res.ok) setContent(prev => [data, ...prev]);
    setGenerating(false);
  }

  async function handleDeleteContent(id: number) {
    const t = token || localStorage.getItem("token");
    await fetch(`${API}/content/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${t}` } });
    setContent(prev => prev.filter(c => c.id !== id));
  }

  function handleEdit(p: Product) {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description || "", price: String(p.price), affiliateLink: p.affiliateLink || "", commissionRate: p.commissionRate ? String(p.commissionRate) : "", network: p.network || "", category: p.category || "", status: p.status || "active", slug: p.slug || "" });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  function handleSelectProduct(p: Product) {
    setSelectedProduct(p);
    setStats(null);
    loadContent(p.id);
    loadStats(p.id);
  }

  const networks = ["Amazon", "Awin", "Impact", "ClickBank", "Other"];
  const categories = ["AI Tools", "Finance", "Fitness", "Home Office", "Tech", "Other"];

  if (selectedProduct) {
    const trackingUrl = selectedProduct.slug ? `${TRACK_BASE}/${selectedProduct.slug}` : null;
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedProduct(null)} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
              <h1 className="text-2xl font-bold text-gray-900">📝 {selectedProduct.name}</h1>
            </div>
            {token && (
              <div className="flex items-center gap-3">
                <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" value={contentType} onChange={e => setContentType(e.target.value)}>
                  <option value="tiktok">TikTok Script</option>
                  <option value="blog">Blog Post</option>
                  <option value="instagram">Instagram Post</option>
                </select>
                <button onClick={() => handleGenerate(selectedProduct.id)} disabled={generating} className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition disabled:opacity-50">
                  {generating ? "Generating..." : "✨ Generate Content"}
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-8 py-8 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-sm text-gray-500">Total Clicks</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.total ?? "—"}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-sm text-gray-500">Clicks Today</p>
              <p className="text-3xl font-bold text-green-600">{stats?.today ?? "—"}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-sm text-gray-500">Commission</p>
              <p className="text-3xl font-bold text-orange-600">{selectedProduct.commissionRate ? `${selectedProduct.commissionRate}%` : "—"}</p>
            </div>
          </div>

          {trackingUrl && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-sm font-medium text-gray-700 mb-2">🔗 Tracking Link</p>
              <div className="flex items-center gap-3">
                <code className="bg-gray-100 rounded-lg px-3 py-2 text-sm flex-1 truncate">{trackingUrl}</code>
                <button onClick={() => navigator.clipboard.writeText(trackingUrl)} className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg transition">Copy</button>
                <a href={trackingUrl} target="_blank" className="text-sm bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg transition">Test</a>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {content.length === 0 ? (
              <p className="text-center text-gray-400 py-12">No content yet. Click Generate Content to create some!</p>
            ) : (
              content.map(c => (
                <div key={c.id} className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{c.type.toUpperCase()}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{c.status}</span>
                    </div>
                    <button onClick={() => handleDeleteContent(c.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{c.title}</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">Script / Content</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{c.scriptText}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-blue-600 mb-1">Caption</p>
                      <p className="text-sm text-gray-800">{c.caption}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-green-600 mb-1">Hashtags</p>
                      <p className="text-sm text-gray-800">{c.hashtags}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-orange-600 mb-1">CTA</p>
                      <p className="text-sm text-gray-800">{c.cta}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-purple-600 mb-1">Thumbnail Prompt</p>
                      <p className="text-sm text-gray-800">{c.thumbnailPrompt}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">🛍️ AI Affiliate Engine</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{products.length} products</span>
            {token ? (
              <>
                <button onClick={() => { setShowForm(!showForm); setEditingId(null); }} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition">
                  {showForm ? "Cancel" : "+ Add Product"}
                </button>
                <button onClick={handleLogout} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition">Logout</button>
              </>
            ) : (
              <button onClick={() => router.push("/login")} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition">Admin Login</button>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-8 py-8 space-y-6">
        {token && showForm && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">{editingId ? "Edit Product" : "Add New Product"}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Product name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                <input className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price[0]}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Short description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Affiliate Link</label>
                <input className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://..." value={form.affiliateLink} onChange={e => setForm({ ...form, affiliateLink: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.network} onChange={e => setForm({ ...form, network: e.target.value })}>
                  <option value="">Select network</option>
                  {networks.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate (%)</label>
                <input className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 10" type="number" value={form.commissionRate} onChange={e => setForm({ ...form, commissionRate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (for tracking link)</label>
                <input className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. jasper" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition">{editingId ? "Update Product" : "Add Product"}</button>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2 rounded-lg transition">Cancel</button>
            </div>
          </div>
        )}
        <div className="space-y-3">
          {loading ? (
            <p className="text-center text-gray-400 py-12">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No products yet. Add one above!</p>
          ) : (
            products.map(p => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between hover:shadow-md transition cursor-pointer" onClick={() => handleSelectProduct(p)}>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 text-blue-700 rounded-xl w-12 h-12 flex items-center justify-center text-xl font-bold">{p.name[0]}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{p.name}</h3>
                      {p.network && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{p.network}</span>}
                      {p.category && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{p.category}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{p.status}</span>
                    </div>
                    <p className="text-sm text-gray-500">{p.description || "No description"}</p>
                    {p.commissionRate && <p className="text-xs text-orange-600 mt-0.5">Commission: {p.commissionRate}%</p>}
                    {p.slug && <p className="text-xs text-blue-500 mt-0.5">🔗 /track/go/{p.slug}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                  <span className="text-green-600 font-bold text-lg">${p.price.toFixed(2)}</span>
                  {token && (
                    <>
                      <button onClick={() => handleEdit(p)} className="text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-medium px-3 py-1.5 rounded-lg transition">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="text-sm bg-red-100 hover:bg-red-200 text-red-600 font-medium px-3 py-1.5 rounded-lg transition">Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
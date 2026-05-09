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
  profitabilityScore?: number;
  trendScore?: number;
  status: string;
};

const API = "https://backend-production-c3f5.up.railway.app/products";

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({
    name: "", description: "", price: "",
    affiliateLink: "", commissionRate: "", network: "",
    category: "", profitabilityScore: "", trendScore: "", status: "active",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    const res = await fetch(API);
    setProducts(await res.json());
    setLoading(false);
  }

  async function handleSubmit() {
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API}/${editingId}` : API;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        commissionRate: form.commissionRate ? parseFloat(form.commissionRate) : undefined,
        profitabilityScore: form.profitabilityScore ? parseFloat(form.profitabilityScore) : undefined,
        trendScore: form.trendScore ? parseFloat(form.trendScore) : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setErrors(data.errors || {}); return; }
    setForm({ name: "", description: "", price: "", affiliateLink: "", commissionRate: "", network: "", category: "", profitabilityScore: "", trendScore: "", status: "active" });
    setEditingId(null);
    setErrors({});
    setShowForm(false);
    loadProducts();
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
    loadProducts();
  }

  function handleEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name, description: p.description || "", price: String(p.price),
      affiliateLink: p.affiliateLink || "", commissionRate: p.commissionRate ? String(p.commissionRate) : "",
      network: p.network || "", category: p.category || "",
      profitabilityScore: p.profitabilityScore ? String(p.profitabilityScore) : "",
      trendScore: p.trendScore ? String(p.trendScore) : "", status: p.status || "active",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancel() {
    setEditingId(null);
    setForm({ name: "", description: "", price: "", affiliateLink: "", commissionRate: "", network: "", category: "", profitabilityScore: "", trendScore: "", status: "active" });
    setErrors({});
    setShowForm(false);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  const networks = ["Amazon", "Awin", "Impact", "ClickBank", "Other"];
  const categories = ["AI Tools", "Finance", "Fitness", "Home Office", "Tech", "Other"];

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
                <button onClick={handleLogout} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition">
                  Logout
                </button>
              </>
            ) : (
              <button onClick={() => router.push("/login")} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition">
                Admin Login
              </button>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition">
                {editingId ? "Update Product" : "Add Product"}
              </button>
              <button onClick={handleCancel} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2 rounded-lg transition">
                Cancel
              </button>
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
              <div key={p.id} className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 text-blue-700 rounded-xl w-12 h-12 flex items-center justify-center text-xl font-bold">
                    {p.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{p.name}</h3>
                      {p.network && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{p.network}</span>}
                      {p.category && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{p.category}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{p.status}</span>
                    </div>
                    <p className="text-sm text-gray-500">{p.description || "No description"}</p>
                    {p.commissionRate && <p className="text-xs text-orange-600 mt-0.5">Commission: {p.commissionRate}%</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
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
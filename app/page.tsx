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
                  {showForm ? "Cancel" : "＋ Add Product"}
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
            <h2 className="text-lg font-semibold text-gray-800 mb-5">{editingId ? "✏️ Edit Product" : "➕ Add New Product"}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label
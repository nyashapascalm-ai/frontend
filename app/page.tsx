"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
};

const API = "https://backend-production-c3f5.up.railway.app/products";

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", description: "", price: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

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
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
    });
    const data = await res.json();
    if (!res.ok) { setErrors(data.errors || {}); return; }
    setForm({ name: "", description: "", price: "" });
    setEditingId(null);
    setErrors({});
    loadProducts();
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });
    loadProducts();
  }

  function handleEdit(p: Product) {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description || "", price: String(p.price) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancel() {
    setEditingId(null);
    setForm({ name: "", description: "", price: "" });
    setErrors({});
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-8 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">🛍️ Product Manager</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{products.length} products</span>
            {token ? (
              <button onClick={handleLogout} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition">
                Logout
              </button>
            ) : (
              <button onClick={() => router.push("/login")} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition">
                Admin Login
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-8 space-y-8">
        {token && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              {editingId ? "✏️ Edit Product" : "➕ Add New Product"}
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Product name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Short description (optional)"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  type="number"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price[0]}</p>}
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition"
                >
                  {editingId ? "Update Product" : "Add Product"}
                </button>
                {editingId && (
                  <button
                    onClick={handleCancel}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {loading ? (
            <p className="text-center text-gray-400 py-12">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No products yet.</p>
          ) : (
            products.map(p => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 text-blue-700 rounded-xl w-12 h-12 flex items-center justify-center text-xl font-bold">
                    {p.name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{p.name}</h3>
                    <p className="text-sm text-gray-500">{p.description || "No description"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-green-600 font-bold text-lg">${p.price.toFixed(2)}</span>
                  {token && (
                    <>
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-medium px-3 py-1.5 rounded-lg transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-sm bg-red-100 hover:bg-red-200 text-red-600 font-medium px-3 py-1.5 rounded-lg transition"
                      >
                        Delete
                      </button>
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
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Feed = {
  id: string;
  name: string;
  products: number;
  currency: string;
};

type FeedProduct = {
  name: string;
  description: string;
  price: number;
  currency: string;
  affiliateLink: string;
  category: string;
  network: string;
  imageUrl: string;
  inStock: string;
};

const API = "https://backend-production-c3f5.up.railway.app";

const COMMISSION_RATES: Record<string, number> = {
  "112637": 8,
  "60005": 10,
  "71935": 12,
  "97411": 7,
  "101126": 10,
  "115013": 15,
  "443": 8,
};

export default function AwinPage() {
  const router = useRouter();
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<Feed | null>(null);
  const [products, setProducts] = useState<FeedProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingFeeds, setLoadingFeeds] = useState(true);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState("");
  const [commission, setCommission] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetch(`${API}/awin/feeds`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setFeeds(data); setLoadingFeeds(false); });
  }, []);

  async function loadProducts(feed: Feed, searchTerm = "") {
    setLoading(true);
    setProducts([]);
    setSelected(new Set());
    setImportStatus("");
    const token = localStorage.getItem("token");
    const url = `${API}/awin/feed-products/${feed.id}?limit=100${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();

    let filtered = data.products || [];

    if (minPrice) filtered = filtered.filter((p: FeedProduct) => p.price >= parseFloat(minPrice));
    if (maxPrice) filtered = filtered.filter((p: FeedProduct) => p.price <= parseFloat(maxPrice));
    if (inStockOnly) filtered = filtered.filter((p: FeedProduct) => p.inStock === "1");

    setProducts(filtered);
    setTotal(data.total || 0);
    setLoading(false);
  }

  async function handleBulkImport() {
    if (selected.size === 0) return;
    setImporting(true);
    setImportStatus("");
    const token = localStorage.getItem("token");
    const toImport = Array.from(selected).map(i => ({
      ...products[i],
      commissionRate: commission ? parseFloat(commission) : (selectedFeed ? COMMISSION_RATES[selectedFeed.id] : undefined),
    }));
    const res = await fetch(`${API}/awin/import-bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ products: toImport }),
    });
    const data = await res.json();
    setImportStatus(data.message || "Import complete!");
    setSelected(new Set());
    setImporting(false);
  }

  function toggleSelect(i: number) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(products.map((_, i) => i)));
  }

  function estimatedValue(price: number, feedId: string) {
    const rate = commission ? parseFloat(commission) : (COMMISSION_RATES[feedId] || 10);
    return ((price * rate) / 100).toFixed(2);
  }

  if (loadingFeeds) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-400">Loading feeds...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/")} className="text-sm text-gray-500 hover:text-gray-700">← Products</button>
            <h1 className="text-2xl font-bold text-gray-900">Awin Product Discovery</h1>
          </div>
          {selected.size > 0 && (
            <button
              onClick={handleBulkImport}
              disabled={importing}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {importing ? "Importing..." : `Import ${selected.size} Products`}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8 space-y-6">
        {importStatus && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-700 font-medium">{importStatus}</p>
          </div>
        )}

        {!selectedFeed ? (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Select a feed to browse products:</h2>
            <div className="grid grid-cols-3 gap-4">
              {feeds.map(f => (
                <div
                  key={f.id}
                  onClick={() => { setSelectedFeed(f); setCommission(String(COMMISSION_RATES[f.id] || "")); loadProducts(f); }}
                  className="bg-white rounded-2xl shadow-sm p-5 cursor-pointer hover:shadow-md transition"
                >
                  <h3 className="font-semibold text-gray-900">{f.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{f.products.toLocaleString()} products</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{f.currency}</span>
                    {COMMISSION_RATES[f.id] && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{COMMISSION_RATES[f.id]}% commission</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => { setSelectedFeed(null); setProducts([]); }} className="text-sm text-gray-500 hover:text-gray-700">← Back to feeds</button>
                <h2 className="font-semibold text-gray-900">{selectedFeed.name} — {total.toLocaleString()} results</h2>
              </div>
              {products.length > 0 && (
                <button onClick={selectAll} className="text-sm text-blue-600 hover:text-blue-700">Select All ({products.length})</button>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4 grid grid-cols-5 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Search products</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. pram, dress, sofa..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && loadProducts(selectedFeed, search)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min price (£)</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  type="number"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max price (£)</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="999"
                  type="number"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Commission %</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10"
                  type="number"
                  value={commission}
                  onChange={e => setCommission(e.target.value)}
                />
              </div>
              <div className="col-span-4 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="rounded" />
                  <span className="text-sm text-gray-700">In stock only</span>
                </label>
                <button
                  onClick={() => loadProducts(selectedFeed, search)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>

            {loading ? (
              <p className="text-center text-gray-400 py-12">Loading products...</p>
            ) : (
              <div className="space-y-3">
                {products.map((p, i) => (
                  <div
                    key={i}
                    onClick={() => toggleSelect(i)}
                    className={`bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4 cursor-pointer transition ${selected.has(i) ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"}`}
                  >
                    <input type="checkbox" checked={selected.has(i)} onChange={() => toggleSelect(i)} className="w-4 h-4 rounded" onClick={e => e.stopPropagation()} />
                    {p.imageUrl && (
                      <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded-lg border border-gray-100" onError={e => (e.currentTarget.style.display = "none")} />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{p.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {p.category && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{p.category}</span>}
                        {p.inStock === "1" && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">In Stock</span>}
                        <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                          Est. commission: £{estimatedValue(p.price, selectedFeed.id)}
                        </span>
                      </div>
                    </div>
                    <span className="text-green-600 font-bold">£{p.price.toFixed(2)}</span>
                  </div>
                ))}
                {products.length === 0 && !loading && (
                  <p className="text-center text-gray-400 py-12">No products match your filters. Try adjusting them.</p>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
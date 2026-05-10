"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Programme = {
  id: number;
  name: string;
  description: string;
  logoUrl: string;
  displayUrl: string;
  clickThroughUrl: string;
  currencyCode: string;
  status: string;
  primarySector: string;
};

const API = "https://backend-production-c3f5.up.railway.app";

export default function AwinPage() {
  const router = useRouter();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<number | null>(null);
  const [imported, setImported] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetch(`${API}/awin/programmes`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setProgrammes(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  async function handleImport(programme: Programme) {
    setImporting(programme.id);
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}/awin/import-product`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: programme.name,
        description: programme.description?.slice(0, 200),
        price: 0,
        affiliateLink: programme.clickThroughUrl,
        network: "Awin",
        category: programme.primarySector,
        currency: programme.currencyCode,
      }),
    });
    if (res.ok) setImported(prev => [...prev, programme.id]);
    setImporting(null);
  }

  const filtered = programmes.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.primarySector?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-400">Loading Awin programmes...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/")} className="text-sm text-gray-500 hover:text-gray-700">← Products</button>
            <h1 className="text-2xl font-bold text-gray-900">Awin Programmes</h1>
          </div>
          <span className="text-sm text-gray-500">{programmes.length} programmes joined</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8 space-y-6">
        <input
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search programmes by name or sector..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm p-5 flex gap-4">
              <img src={p.logoUrl} alt={p.name} className="w-16 h-16 object-contain rounded-lg border border-gray-100" onError={e => (e.currentTarget.style.display = "none")} />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{p.primarySector}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{p.status}</span>
                      <span className="text-xs text-gray-500">{p.currencyCode}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleImport(p)}
                    disabled={importing === p.id || imported.includes(p.id)}
                    className={`text-sm font-medium px-3 py-1.5 rounded-lg transition ${imported.includes(p.id) ? "bg-green-100 text-green-700" : "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"}`}
                  >
                    {importing === p.id ? "Importing..." : imported.includes(p.id) ? "Imported!" : "Import"}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{p.description}</p>
                <a href={p.displayUrl} target="_blank" className="text-xs text-blue-500 hover:underline mt-1 block">{p.displayUrl}</a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = "https://backend-production-c3f5.up.railway.app";
const SIZES = [
  { name: "Leaderboard", dimensions: "728x90", description: "Top of page banner" },
  { name: "Billboard", dimensions: "970x250", description: "Homepage hero banner" },
  { name: "Medium Rectangle", dimensions: "300x250", description: "Sidebar ad" },
  { name: "Half Page", dimensions: "300x600", description: "Large sidebar ad" },
  { name: "Mobile Banner", dimensions: "320x50", description: "Mobile top banner" },
  { name: "Large Rectangle", dimensions: "336x280", description: "In-content ad" },
  { name: "Site Skin", dimensions: "Custom", description: "Full site branding takeover" },
];
const POSITIONS = ["homepage-hero","homepage-sidebar","homepage-bottom","category-top","category-sidebar","post-top","post-middle","post-bottom","site-skin","mobile-top"];

export default function AdsManager() {
  const router = useRouter();
  const [ads, setAds] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title:"",advertiser:"",size:"Leaderboard",position:"homepage-hero",mediaUrl:"",linkUrl:"",altText:"",startDate:"",endDate:"",fee:"",notes:"" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    loadAds(token!);
  }, []);

  async function loadAds(token: string) {
    setLoading(true);
    const [a, s] = await Promise.all([
      fetch(API+"/ads", { headers: { Authorization: "Bearer "+token } }),
      fetch(API+"/ads/summary", { headers: { Authorization: "Bearer "+token } }),
    ]);
    setAds(await a.json());
    setSummary(await s.json());
    setLoading(false);
  }

  function resetForm() {
    setForm({ title:"",advertiser:"",size:"Leaderboard",position:"homepage-hero",mediaUrl:"",linkUrl:"",altText:"",startDate:"",endDate:"",fee:"",notes:"" });
    setEditId(null); setShowForm(false); setStatus("");
  }

  async function handleSave() {
    const token = localStorage.getItem("token");
    setSaving(true); setStatus("");
    const res = await fetch(editId ? API+"/ads/"+editId : API+"/ads", {
      method: editId ? "PUT" : "POST",
      headers: { Authorization: "Bearer "+token, "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) { setStatus("Saved!"); resetForm(); loadAds(token!); }
    else setStatus("Error: "+data.error);
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this ad?")) return;
    const token = localStorage.getItem("token");
    await fetch(API+"/ads/"+id, { method: "DELETE", headers: { Authorization: "Bearer "+token } });
    loadAds(token!);
  }

  function handleEdit(ad: any) {
    setForm({ title:ad.title,advertiser:ad.advertiser,size:ad.size,position:ad.position,mediaUrl:ad.mediaUrl,linkUrl:ad.linkUrl,altText:ad.altText||"",startDate:ad.startDate?.split("T")[0]||"",endDate:ad.endDate?.split("T")[0]||"",fee:ad.fee||"",notes:ad.notes||"" });
    setEditId(ad.id); setShowForm(true);
  }

  const now = new Date();
  const isExpired = (ad) => new Date(ad.endDate) < now;
  const isActive = (ad) => ad.status==="active" && new Date(ad.startDate)<=now && new Date(ad.endDate)>=now;

  return (
    <div style={{ minHeight:"100vh", background:"#f8f9fa", padding:"24px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>

        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24, background:"white", padding:"20px 24px", borderRadius:12, border:"1px solid #e5e7eb" }}>
          <div style={{ width:48, height:48, borderRadius:"50%", background:"#e91e8c", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:600, fontSize:16 }}>AD</div>
          <div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:600, color:"#111" }}>Ad Manager</h1>
            <p style={{ margin:0, fontSize:13, color:"#6b7280" }}>Manage private adverts, sponsorships and site branding</p>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
            <button onClick={() => router.push("/dashboard")} style={{ padding:"8px 16px", borderRadius:8, border:"1px solid #e5e7eb", background:"white", cursor:"pointer", fontSize:13, color:"#6b7280" }}>Back to dashboard</button>
            <button onClick={() => { resetForm(); setShowForm(true); }} style={{ padding:"8px 16px", borderRadius:8, border:"none", background:"#e91e8c", color:"white", cursor:"pointer", fontSize:13, fontWeight:600 }}>+ New Ad</button>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
          {[
            { label:"Total ads", value:summary?.total??0, color:"#111" },
            { label:"Active now", value:summary?.active??0, color:"#16a34a" },
            { label:"Expired", value:summary?.expired??0, color:"#dc2626" },
            { label:"Total revenue", value:"£"+(summary?.totalRevenue??0), color:"#e91e8c" },
          ].map(m => (
            <div key={m.label} style={{ background:"#f3f4f6", borderRadius:8, padding:"16px", textAlign:"center" }}>
              <div style={{ fontSize:12, color:"#6b7280", marginBottom:4 }}>{m.label}</div>
              <div style={{ fontSize:24, fontWeight:600, color:m.color }}>{loading?"...":m.value}</div>
            </div>
          ))}
        </div>

        <div style={{ background:"white", borderRadius:12, border:"1px solid #e5e7eb", padding:"20px 24px", marginBottom:24 }}>
          <h3 style={{ margin:"0 0 16px", fontSize:15, fontWeight:600 }}>Standard ad sizes</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:10 }}>
            {SIZES.map(s => (
              <div key={s.name} style={{ background:"#f9fafb", borderRadius:8, padding:"12px", border:"1px solid #e5e7eb" }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#111" }}>{s.name}</div>
                <div style={{ fontSize:12, color:"#e91e8c", fontWeight:500 }}>{s.dimensions}</div>
                <div style={{ fontSize:11, color:"#6b7280", marginTop:2 }}>{s.description}</div>
              </div>
            ))}
          </div>
        </div>

        {showForm && (
          <div style={{ background:"white", borderRadius:12, border:"2px solid #e91e8c", padding:"24px", marginBottom:24 }}>
            <h3 style={{ margin:"0 0 20px", fontSize:16, fontWeight:600 }}>{editId?"Edit ad":"Create new ad"}</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {[
                { label:"Ad title *", key:"title", placeholder:"e.g. Summer Campaign 2026" },
                { label:"Advertiser *", key:"advertiser", placeholder:"e.g. Mamas and Papas" },
                { label:"Media URL * (image or video)", key:"mediaUrl", placeholder:"https://..." },
                { label:"Click URL *", key:"linkUrl", placeholder:"https://..." },
                { label:"Alt text", key:"altText", placeholder:"e.g. Summer sale 20% off" },
                { label:"Fee (GBP)", key:"fee", placeholder:"e.g. 500" },
                { label:"Start date *", key:"startDate", type:"date" },
                { label:"End date *", key:"endDate", type:"date" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:4 }}>{f.label}</label>
                  <input type={f.type||"text"} value={form[f.key]} onChange={e => setForm({...form,[f.key]:e.target.value})} placeholder={f.placeholder||""} style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:"1px solid #e5e7eb", fontSize:14, boxSizing:"border-box" }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:4 }}>Ad size *</label>
                <select value={form.size} onChange={e => setForm({...form,size:e.target.value})} style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:"1px solid #e5e7eb", fontSize:14 }}>
                  {SIZES.map(s => <option key={s.name} value={s.name}>{s.name} ({s.dimensions})</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:4 }}>Position *</label>
                <select value={form.position} onChange={e => setForm({...form,position:e.target.value})} style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:"1px solid #e5e7eb", fontSize:14 }}>
                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={{ fontSize:12, fontWeight:500, color:"#374151", display:"block", marginBottom:4 }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} placeholder="Any notes about this campaign..." rows={2} style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:"1px solid #e5e7eb", fontSize:14, boxSizing:"border-box" }} />
              </div>
            </div>
            {status && <p style={{ fontSize:13, color:status.includes("Error")?"#dc2626":"#16a34a", marginTop:12 }}>{status}</p>}
            <div style={{ display:"flex", gap:8, marginTop:16 }}>
              <button onClick={handleSave} disabled={saving} style={{ padding:"10px 24px", borderRadius:8, border:"none", background:"#e91e8c", color:"white", cursor:"pointer", fontSize:14, fontWeight:600 }}>{saving?"Saving...":editId?"Update ad":"Create ad"}</button>
              <button onClick={resetForm} style={{ padding:"10px 24px", borderRadius:8, border:"1px solid #e5e7eb", background:"white", cursor:"pointer", fontSize:14, color:"#6b7280" }}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ background:"white", borderRadius:12, border:"1px solid #e5e7eb", padding:"20px 24px" }}>
          <h3 style={{ margin:"0 0 16px", fontSize:15, fontWeight:600 }}>All ads ({ads.length})</h3>
          {loading ? <p style={{ color:"#6b7280" }}>Loading...</p> : ads.length===0 ? (
            <div style={{ textAlign:"center", padding:"40px 0", color:"#9ca3af" }}>
              <div style={{ fontSize:40, marginBottom:8 }}>📢</div>
              <p style={{ margin:0, fontSize:14 }}>No ads yet. Click New Ad to create your first campaign!</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {ads.map(ad => (
                <div key={ad.id} style={{ border:"1px solid "+(isActive(ad)?"#86efac":isExpired(ad)?"#fca5a5":"#e5e7eb"), borderRadius:10, padding:"16px 20px", background:isActive(ad)?"#f0fdf4":isExpired(ad)?"#fef2f2":"#f9fafb" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                        <span style={{ fontSize:14, fontWeight:600, color:"#111" }}>{ad.title}</span>
                        <span style={{ fontSize:11, padding:"2px 8px", borderRadius:6, fontWeight:500, background:isActive(ad)?"#dcfce7":isExpired(ad)?"#fee2e2":"#f3f4f6", color:isActive(ad)?"#16a34a":isExpired(ad)?"#dc2626":"#6b7280" }}>{isActive(ad)?"Live":isExpired(ad)?"Expired":"Scheduled"}</span>
                        <span style={{ fontSize:11, padding:"2px 8px", borderRadius:6, background:"#dbeafe", color:"#1d4ed8" }}>{ad.size}</span>
                        <span style={{ fontSize:11, padding:"2px 8px", borderRadius:6, background:"#f3e8ff", color:"#7c3aed" }}>{ad.position}</span>
                      </div>
                      <div style={{ fontSize:12, color:"#6b7280", display:"flex", gap:16, flexWrap:"wrap" }}>
                        <span>Advertiser: <strong>{ad.advertiser}</strong></span>
                        {ad.fee && <span>Fee: <strong>GBP{ad.fee}</strong></span>}
                        <span>Impressions: <strong>{ad.impressions}</strong></span>
                        <span>Clicks: <strong>{ad.clicks}</strong></span>
                        <span>{new Date(ad.startDate).toLocaleDateString("en-GB")} to {new Date(ad.endDate).toLocaleDateString("en-GB")}</span>
                      </div>
                      {ad.mediaUrl && (
                        <div style={{ marginTop:8 }}>
                          <a href={ad.mediaUrl} target="_blank" rel="noreferrer" style={{ fontSize:12, color:"#1d4ed8" }}>Preview media</a>
                          <span style={{ margin:"0 8px", color:"#d1d5db" }}>|</span>
                          <a href={ad.linkUrl} target="_blank" rel="noreferrer" style={{ fontSize:12, color:"#1d4ed8" }}>Visit link</a>
                        </div>
                      )}
                    </div>
                    <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                      <button onClick={() => handleEdit(ad)} style={{ padding:"6px 12px", borderRadius:6, border:"1px solid #e5e7eb", background:"white", cursor:"pointer", fontSize:12 }}>Edit</button>
                      <button onClick={() => handleDelete(ad.id)} style={{ padding:"6px 12px", borderRadius:6, border:"1px solid #fca5a5", background:"#fee2e2", cursor:"pointer", fontSize:12, color:"#dc2626" }}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
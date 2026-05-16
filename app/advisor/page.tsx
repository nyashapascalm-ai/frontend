"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = "https://backend-production-c3f5.up.railway.app";

export default function Advisor() {
  const router = useRouter();
  const [summary, setSummary] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("subscriptions");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetch(`${API}/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setSummary(d.summary))
      .catch(() => {});
  }, []);

  const tabs = ["subscriptions","services","sop","kpis","alerts"];

  return (
    <div style={{ minHeight:"100vh", background:"#f8f9fa", padding:"24px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>

        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24, background:"white", padding:"20px 24px", borderRadius:12, border:"1px solid #e5e7eb" }}>
          <div style={{ width:48, height:48, borderRadius:"50%", background:"#e91e8c", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:600, fontSize:16 }}>MD</div>
          <div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:600, color:"#111" }}>System advisor</h1>
            <p style={{ margin:0, fontSize:13, color:"#6b7280" }}>MumDeals operations hub — last reviewed May 2026</p>
          </div>
          <div style={{ marginLeft:"auto" }}>
            <button onClick={() => router.push("/dashboard")} style={{ padding:"8px 16px", borderRadius:8, border:"1px solid #e5e7eb", background:"white", cursor:"pointer", fontSize:13, color:"#6b7280" }}>← Back to dashboard</button>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
          {[
            { label:"Active services", value:"14", color:"#16a34a" },
            { label:"Monthly cost", value:"~£47", color:"#111" },
            { label:"Posts live", value: summary ? String(summary.totalContent) : "...", color:"#111" },
            { label:"Renewals this month", value:"2", color:"#d97706" },
          ].map(m => (
            <div key={m.label} style={{ background:"#f3f4f6", borderRadius:8, padding:"16px", textAlign:"center" }}>
              <div style={{ fontSize:12, color:"#6b7280", marginBottom:4 }}>{m.label}</div>
              <div style={{ fontSize:24, fontWeight:600, color:m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ padding:"8px 16px", borderRadius:8, fontSize:13, cursor:"pointer", fontWeight:500, background:activeTab===t?"#dbeafe":"white", color:activeTab===t?"#1d4ed8":"#6b7280", border:activeTab===t?"1px solid #93c5fd":"1px solid #e5e7eb" }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
          ))}
        </div>

        {activeTab==="subscriptions" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {[
              { section:"Infrastructure", items:[
                { name:"Railway (backend hosting)", detail:"Renews monthly — auto-pay", cost:"~£5/mo", status:"Active", color:"#16a34a", bg:"#dcfce7" },
                { name:"Vercel (frontend hosting)", detail:"Free tier — no expiry", cost:"Free", status:"Active", color:"#16a34a", bg:"#dcfce7" },
                { name:"Neon PostgreSQL", detail:"Free tier — monitor usage", cost:"Free", status:"Active", color:"#16a34a", bg:"#dcfce7" },
                { name:"WordPress / mumdeals.co.uk", detail:"Domain + hosting — check renewal date", cost:"~£120/yr", status:"Check date", color:"#d97706", bg:"#fef3c7" },
              ]},
              { section:"AI & Content", items:[
                { name:"Anthropic API (Claude)", detail:"Pay-as-you-go — monitor spend", cost:"Usage", status:"Active", color:"#16a34a", bg:"#dcfce7" },
                { name:"Unsplash API", detail:"Demo tier 50 req/hr — production pending", cost:"Free", status:"Pending", color:"#d97706", bg:"#fef3c7" },
              ]},
              { section:"Affiliate Networks", items:[
                { name:"Awin (publisher 2660114)", detail:"Token: 7c2db1e6 — no expiry", cost:"Free", status:"Active", color:"#16a34a", bg:"#dcfce7" },
                { name:"Amazon Associates (mumdeals04-21)", detail:"Must make 3 sales in 180 days", cost:"Free", status:"Urgent", color:"#dc2626", bg:"#fee2e2" },
                { name:"Impact (Jasper, Grammarly, Canva)", detail:"No expiry — keep links active", cost:"Free", status:"Active", color:"#16a34a", bg:"#dcfce7" },
              ]},
              { section:"Marketing & Social", items:[
                { name:"Pinterest API", detail:"App review pending — write scopes needed", cost:"Free", status:"Pending", color:"#d97706", bg:"#fef3c7" },
                { name:"Resend (email)", detail:"Free tier: 3,000 emails/mo", cost:"Free", status:"Active", color:"#16a34a", bg:"#dcfce7" },
                { name:"cron-job.org", detail:"Runs every Monday 9am", cost:"Free", status:"Active", color:"#16a34a", bg:"#dcfce7" },
              ]},
            ].map(group => (
              <div key={group.section} style={{ background:"white", borderRadius:12, border:"1px solid #e5e7eb", padding:"20px 24px" }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#6b7280", marginBottom:12 }}>{group.section}</div>
                {group.items.map((item,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:i<group.items.length-1?"1px solid #f3f4f6":"none" }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:500, color:"#111" }}>{item.name}</div>
                      <div style={{ fontSize:12, color:"#6b7280", marginTop:2 }}>{item.detail}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0, marginLeft:16 }}>
                      <div style={{ fontSize:13, fontWeight:500, marginBottom:4 }}>{item.cost}</div>
                      <span style={{ fontSize:11, padding:"2px 8px", borderRadius:6, fontWeight:500, background:item.bg, color:item.color }}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab==="services" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16 }}>
            {[
              { name:"Backend API", desc:"Express/TypeScript on Railway. Content generation, WordPress, tracking, email, Pinterest.", link:"https://backend-production-c3f5.up.railway.app", icon:"🖥️", bg:"#dcfce7" },
              { name:"Admin dashboard", desc:"Next.js on Vercel. Manage products, generate content, publish posts, send emails.", link:"https://frontend-five-phi-78.vercel.app/dashboard", icon:"📊", bg:"#dbeafe" },
              { name:"WordPress site", desc:"123+ blog posts, category pages and all legal pages.", link:"https://mumdeals.co.uk/wp-admin", icon:"🌐", bg:"#fef3c7" },
              { name:"Neon PostgreSQL", desc:"Cloud database — products, content, clicks, subscribers.", link:"https://console.neon.tech", icon:"🗄️", bg:"#dcfce7" },
              { name:"GitHub backend", desc:"Push to main triggers Railway auto-deploy.", link:"https://github.com/nyashapascalm-ai/backend", icon:"💻", bg:"#dbeafe" },
              { name:"GitHub frontend", desc:"Push to main triggers Vercel auto-deploy.", link:"https://github.com/nyashapascalm-ai/frontend", icon:"💻", bg:"#dbeafe" },
              { name:"Resend email", desc:"Weekly deals digest every Monday 9am from deals@mumdeals.co.uk", link:"https://resend.com/dashboard", icon:"📧", bg:"#fef3c7" },
              { name:"Pinterest board", desc:"Baby & Parenting Deals. App review pending for write access.", link:"https://pinterest.com/mumcircle3", icon:"📌", bg:"#fee2e2" },
              { name:"Awin affiliate", desc:"Primary affiliate network. Publisher ID: 2660114.", link:"https://ui.awin.com", icon:"🔗", bg:"#dcfce7" },
              { name:"Railway dashboard", desc:"Backend hosting and environment variables.", link:"https://railway.app", icon:"🚂", bg:"#f3f4f6" },
              { name:"cron-job.org", desc:"Triggers weekly email every Monday 9am.", link:"https://cron-job.org", icon:"⏰", bg:"#fef3c7" },
              { name:"Google Search Console", desc:"NOT SET UP YET — submit sitemap to start tracking organic traffic.", link:"https://search.google.com/search-console", icon:"🔍", bg:"#fee2e2" },
            ].map(s => (
              <div key={s.name} style={{ background:"white", borderRadius:12, border:"1px solid #e5e7eb", padding:"20px" }}>
                <div style={{ width:36, height:36, borderRadius:8, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10, fontSize:18 }}>{s.icon}</div>
                <div style={{ fontSize:14, fontWeight:600, color:"#111", marginBottom:4 }}>{s.name}</div>
                <div style={{ fontSize:12, color:"#6b7280", lineHeight:1.5, marginBottom:10 }}>{s.desc}</div>
                <a href={s.link} target="_blank" rel="noreferrer" style={{ fontSize:12, color:"#1d4ed8" }}>Open ↗</a>
              </div>
            ))}
          </div>
        )}

        {activeTab==="sop" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {[
              { period:"Every day (15 mins)", steps:[
                { title:"Check dashboard metrics", desc:"Open dashboard → check clicks today, top product, earnings." },
                { title:"Generate 2 comparison posts", desc:"Use comparison generator for categories with fewer posts. Publish immediately." },
                { title:"Check Awin transactions", desc:"ui.awin.com → Reports → check for new commissions or declined transactions." },
              ]},
              { period:"Every week (Monday)", steps:[
                { title:"Weekly email auto-sends at 9am", desc:"Check Resend dashboard to confirm delivery. Target: 40%+ open rate." },
                { title:"Import new Awin products", desc:"Dashboard → Awin → Import bulk products. Generate content immediately." },
                { title:"Run content refresher", desc:"Dashboard → Content Refresher → refresh stale posts (6+ months old)." },
                { title:"Pin new products to Pinterest", desc:"Once write access approved — Dashboard → Pinterest → Pin all." },
              ]},
              { period:"Every month", steps:[
                { title:"Review top 10 posts by clicks", desc:"Add more comparison posts in top categories. Update stale prices." },
                { title:"Check all subscription renewals", desc:"Review System Advisor. Confirm Railway, domain and all API keys valid." },
                { title:"Add 1 new affiliate programme", desc:"Research and join a new Awin or Impact programme. Import and publish within the week." },
                { title:"Generate sponsored post", desc:"Dashboard → Sponsored Posts → generate for high-earning product." },
                { title:"Submit Google Search Console sitemap", desc:"search.google.com/search-console → Add property → Submit mumdeals.co.uk/sitemap.xml" },
              ]},
            ].map(group => (
              <div key={group.period} style={{ background:"white", borderRadius:12, border:"1px solid #e5e7eb", padding:"20px 24px" }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#6b7280", marginBottom:12 }}>{group.period}</div>
                {group.steps.map((step,i) => (
                  <div key={i} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom:i<group.steps.length-1?"1px solid #f3f4f6":"none" }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background:"#dbeafe", color:"#1d4ed8", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, flexShrink:0 }}>{i+1}</div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:500, color:"#111", marginBottom:2 }}>{step.title}</div>
                      <div style={{ fontSize:12, color:"#6b7280", lineHeight:1.5 }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab==="kpis" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16 }}>
            {[
              { section:"Traffic", kpis:[
                { name:"Monthly visitors", target:"5,000/mo by month 3", status:"Growing", color:"#1d4ed8", bg:"#dbeafe" },
                { name:"Click-through rate", target:"3%+ on affiliate links", status:"Track", color:"#1d4ed8", bg:"#dbeafe" },
                { name:"Posts published", target:"10 new posts/week", status:"123 live", color:"#16a34a", bg:"#dcfce7" },
                { name:"Comparison posts", target:"2 per day", status:"In progress", color:"#d97706", bg:"#fef3c7" },
              ]},
              { section:"Revenue", kpis:[
                { name:"Monthly affiliate revenue", target:"£500/mo by month 6", status:"Building", color:"#d97706", bg:"#fef3c7" },
                { name:"Awin commissions", target:"£200/mo", status:"Track", color:"#1d4ed8", bg:"#dbeafe" },
                { name:"Amazon Associates", target:"3 sales in 180 days (required)", status:"Urgent", color:"#dc2626", bg:"#fee2e2" },
                { name:"Email subscribers", target:"500 by month 3", status:"Track", color:"#1d4ed8", bg:"#dbeafe" },
              ]},
              { section:"SEO", kpis:[
                { name:"Google indexed pages", target:"100+ pages indexed", status:"Set up GSC", color:"#dc2626", bg:"#fee2e2" },
                { name:"Organic clicks/mo", target:"1,000/mo by month 4", status:"Track", color:"#1d4ed8", bg:"#dbeafe" },
                { name:"Post word count", target:"500+ words per post", status:"Met", color:"#16a34a", bg:"#dcfce7" },
                { name:"FAQ on every post", target:"Required for schema markup", status:"Done", color:"#16a34a", bg:"#dcfce7" },
              ]},
              { section:"Social", kpis:[
                { name:"Pinterest followers", target:"500 by month 3", status:"Pending API", color:"#d97706", bg:"#fef3c7" },
                { name:"Pinterest pins/day", target:"5 pins/day once approved", status:"Pending", color:"#d97706", bg:"#fef3c7" },
                { name:"Email open rate", target:"35%+ weekly", status:"Track", color:"#1d4ed8", bg:"#dbeafe" },
                { name:"New subscribers/week", target:"+20 new/week", status:"Track", color:"#1d4ed8", bg:"#dbeafe" },
              ]},
            ].map(group => (
              <div key={group.section} style={{ background:"white", borderRadius:12, border:"1px solid #e5e7eb", padding:"20px 24px" }}>
                <div style={{ fontSize:13, fontWeight:600, color:"#6b7280", marginBottom:12 }}>{group.section}</div>
                {group.kpis.map((kpi,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:i<group.kpis.length-1?"1px solid #f3f4f6":"none" }}>
                    <div>
                      <div style={{ fontSize:13, color:"#111" }}>{kpi.name}</div>
                      <div style={{ fontSize:11, color:"#9ca3af" }}>{kpi.target}</div>
                    </div>
                    <span style={{ fontSize:11, padding:"2px 8px", borderRadius:6, fontWeight:500, background:kpi.bg, color:kpi.color, flexShrink:0, marginLeft:8 }}>{kpi.status}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab==="alerts" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#6b7280", marginBottom:4 }}>Action required</div>
            {[
              { type:"error", title:"Amazon Associates", msg:"Must generate 3 qualifying sales within 180 days or account closes. Promote Audible trial links — £5 per signup." },
              { type:"error", title:"Google Search Console", msg:"Not set up yet. Go to search.google.com/search-console → add mumdeals.co.uk → submit sitemap." },
              { type:"warning", title:"Pinterest API", msg:"Write access pending app review. Submit video demo. Expected approval: 1–5 business days." },
              { type:"warning", title:"Unsplash API", msg:"Demo tier 50 req/hr. Apply for production at unsplash.com/oauth/applications." },
              { type:"warning", title:"Home & Garden images", msg:"Products 11–14 showing wrong images. Remove featured image in WordPress editor then re-run add-featured-images." },
            ].map((a,i) => (
              <div key={i} style={{ background:a.type==="error"?"#fee2e2":"#fef3c7", border:`1px solid ${a.type==="error"?"#fca5a5":"#fde68a"}`, borderRadius:10, padding:"12px 16px", display:"flex", gap:10 }}>
                <span style={{ fontSize:16, flexShrink:0 }}>{a.type==="error"?"🔴":"🟡"}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:a.type==="error"?"#dc2626":"#d97706", marginBottom:2 }}>{a.title}</div>
                  <div style={{ fontSize:12, color:a.type==="error"?"#991b1b":"#92400e", lineHeight:1.5 }}>{a.msg}</div>
                </div>
              </div>
            ))}
            <div style={{ fontSize:13, fontWeight:600, color:"#6b7280", marginTop:8, marginBottom:4 }}>All good</div>
            {[
              "123 posts live with FAQ, schema markup, correct categories, featured images and affiliate tracking.",
              "Weekly email cron running every Monday 9am. Bot filtering active. Click tracking live.",
              "All legal pages live: Privacy Policy, Terms & Conditions, Contact, About Us.",
              "8 categories in WordPress navigation menu with correct slugs.",
              "Awin, Impact and Amazon Associates all connected and tracking.",
            ].map((msg,i) => (
              <div key={i} style={{ background:"#dcfce7", border:"1px solid #86efac", borderRadius:10, padding:"12px 16px", display:"flex", gap:10 }}>
                <span style={{ fontSize:16, flexShrink:0 }}>✅</span>
                <div style={{ fontSize:12, color:"#166534", lineHeight:1.5 }}>{msg}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

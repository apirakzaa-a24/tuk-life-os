import React, { useMemo, useState } from "react";
import {
  Activity,
  Bot,
  CalendarDays,
  Camera,
  Car,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Database,
  FileText,
  HeartPulse,
  Home,
  Mic,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  WalletCards,
  Wrench,
} from "lucide-react";
import "./index.css";

const BUILD = {
  app: "TUK LIFE OS",
  version: "v6.0 Professional",
  sprint: "Sprint 7",
  buildDate: "2026.06.26",
  buildName: "AI Assistant + Version Badge",
  status: "Active",
};

const cards = [
  { label: "Life Vault", value: "18", note: "ข้อมูลชีวิตทั้งหมด", icon: Database },
  { label: "Timeline", value: "42", note: "เหตุการณ์ล่าสุด", icon: CalendarDays },
  { label: "Health", value: "Active", note: "โหมดสุขภาพพร้อมใช้งาน", icon: HeartPulse },
  { label: "Finance", value: "81K", note: "รายรับหลัก/เดือน", icon: WalletCards },
  { label: "Vehicles", value: "2", note: "BYD Seal 7 + Honda City", icon: Car },
  { label: "Satys Work", value: "Live", note: "PM/BM + Machine System", icon: Wrench },
];

const actions = [
  { title: "AI Camera", icon: Camera, desc: "ถ่ายอาหาร/บิล" },
  { title: "Voice AI", icon: Mic, desc: "สั่งงานด้วยเสียง" },
  { title: "Add Timeline", icon: Plus, desc: "บันทึกเหตุการณ์" },
  { title: "Scan Receipt", icon: ReceiptText, desc: "อ่านใบเสร็จ" },
  { title: "Upload File", icon: Upload, desc: "เพิ่มเอกสาร" },
  { title: "Ask AI", icon: Bot, desc: "ถามจากฐานข้อมูล" },
];

const timeline = [
  "08:00 Work at Satys",
  "12:00 Lunch + expense log",
  "17:00 Review machine / supplier",
  "21:00 Gym + English practice",
];

const aiMemory = [
  "คุณทำงานที่ Satys Electric และดูแลงาน PM/BM, เครื่องจักร, Supplier",
  "รถหลัก: BYD Seal 7 สีดำ และ Honda City 2010",
  "เป้าหมาย: ทำ TUK LIFE OS ให้ใช้งานจริงบนมือถือ + Google Sheets",
];

function VersionBadge() {
  return (
    <div className="version-badge" title="System Version">
      <ShieldCheck size={16} />
      <div>
        <strong>{BUILD.version}</strong>
        <span>{BUILD.sprint} · {BUILD.buildDate}</span>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: any) {
  return (
    <section className="panel">
      <div className="panel-title">
        <Icon size={19} />
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const aiAnswer = useMemo(() => {
    if (!query.trim()) return "ลองถาม AI เช่น ‘ฉันมีรถอะไรบ้าง’, ‘วันนี้ควรทำอะไร’, หรือ ‘สรุปสุขภาพวันนี้’";
    const q = query.toLowerCase();
    if (q.includes("รถ")) return "คุณมีรถ 2 คัน: BYD Seal 7 และ Honda City 2010 ระบบ Vehicle จะเก็บประกัน, PM, ค่าใช้จ่าย และประวัติซ่อมไว้ให้";
    if (q.includes("เงิน") || q.includes("finance")) return "รายรับหลัก 81,000 บาท/เดือน ระบบ Finance จะเชื่อม Google Sheets เพื่อสรุปรายรับ รายจ่าย หนี้ และงบประมาณ";
    if (q.includes("สุขภาพ") || q.includes("health")) return "ระบบ Health จะเก็บน้ำหนัก แคลอรี ออกกำลังกาย อาหาร และให้ AI วิเคราะห์แนวโน้มรายวัน";
    return "AI รับคำถามแล้ว: Sprint 7 เพิ่มโครงสร้าง AI Query เบื้องต้น พร้อมต่อ Google Sheets/Drive ใน Sprint ถัดไป";
  }, [query]);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">T</div>
          <div>
            <h1>TUK LIFE OS</h1>
            <p>{BUILD.sprint}</p>
          </div>
        </div>
        <nav>
          {[Home, Database, CalendarDays, Bot, HeartPulse, WalletCards, Car, Wrench, Settings].map((Icon, idx) => (
            <button key={idx} className={idx === 0 ? "active" : ""}>
              <Icon size={18} />
              <span>{["Dashboard", "Life Vault", "Timeline", "AI", "Health", "Finance", "Vehicle", "Satys", "Settings"][idx]}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="content">
        <header className="hero">
          <div>
            <p className="eyebrow"><Sparkles size={16} /> Dashboard นี้เป็น Sprint 7 ถ้าเห็นหน้านี้ แปลว่าโค้ดใหม่ถูกติดตั้งแล้ว ✅</p>
            <h1>Good evening, TUK</h1>
            <p className="subtitle">AI-ready Personal Operating System สำหรับชีวิต งาน สุขภาพ การเงิน รถ และ Satys Work</p>
          </div>
          <VersionBadge />
        </header>

        <div className="grid cards-grid">
          {cards.map((card) => (
            <article className="stat-card" key={card.label}>
              <card.icon size={22} />
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.note}</small>
            </article>
          ))}
        </div>

        <div className="dashboard-grid">
          <Section title="AI Command Center" icon={Bot}>
            <div className="ai-box">
              <div className="search-line">
                <Search size={18} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ถาม AI จากฐานข้อมูลชีวิตของคุณ..." />
              </div>
              <div className="answer"><Sparkles size={18} /> {aiAnswer}</div>
            </div>
          </Section>

          <Section title="Quick Actions" icon={Plus}>
            <div className="action-grid">
              {actions.map((a) => (
                <button className="action" key={a.title}>
                  <a.icon size={21} />
                  <strong>{a.title}</strong>
                  <small>{a.desc}</small>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Today Timeline" icon={CalendarDays}>
            <div className="timeline">
              {timeline.map((item, i) => <div className="timeline-item" key={item}><CheckCircle2 size={17} /><span>{item}</span><ChevronRight size={16} /></div>)}
            </div>
          </Section>

          <Section title="AI Memory Preview" icon={Cloud}>
            <div className="memory-list">
              {aiMemory.map((m) => <div className="memory" key={m}><FileText size={16} /> {m}</div>)}
            </div>
          </Section>
        </div>

        <footer className="bottom-version">
          <span>{BUILD.app}</span>
          <b>{BUILD.version}</b>
          <span>{BUILD.sprint}</span>
          <span>{BUILD.buildName}</span>
        </footer>
      </section>

      <nav className="bottom-nav">
        <Home /><CalendarDays /><Plus /><Bot /><Settings />
      </nav>
    </main>
  );
}

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
  Link2,
  Mic,
  Plus,
  ReceiptText,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Table2,
  Upload,
  WalletCards,
  Wrench,
} from "lucide-react";
import "./index.css";
import {
  defaultSheetConfig,
  loadSheetConfig,
  saveSheetConfig,
  testGoogleSheetsConnection,
  type SheetConfig,
  type SyncStatus,
} from "./services/googleSheets";

const BUILD = {
  app: "TUK LIFE OS",
  version: "v6.0 Professional",
  sprint: "Sprint 8",
  buildDate: "2026.06.26",
  buildName: "Google Sheets Sync Foundation",
  status: "Active",
};

const cards = [
  { label: "Life Vault", value: "18", note: "ข้อมูลชีวิตทั้งหมด", icon: Database },
  { label: "Timeline", value: "42", note: "เหตุการณ์ล่าสุด", icon: CalendarDays },
  { label: "Health", value: "Active", note: "อาหาร/น้ำหนัก/ออกกำลังกาย", icon: HeartPulse },
  { label: "Finance", value: "81K", note: "รายรับหลัก/เดือน", icon: WalletCards },
  { label: "Vehicles", value: "2", note: "BYD Seal 7 + Honda City", icon: Car },
  { label: "Sheets", value: "Ready", note: "ฐานข้อมูลหลัก Sprint 8", icon: Table2 },
];

const actions = [
  { title: "Sync Now", icon: RefreshCw, desc: "ซิงก์ Google Sheets" },
  { title: "AI Camera", icon: Camera, desc: "ถ่ายอาหาร/บิล" },
  { title: "Voice AI", icon: Mic, desc: "สั่งงานด้วยเสียง" },
  { title: "Add Timeline", icon: Plus, desc: "บันทึกเหตุการณ์" },
  { title: "Scan Receipt", icon: ReceiptText, desc: "อ่านใบเสร็จ" },
  { title: "Upload File", icon: Upload, desc: "เพิ่มเอกสาร" },
];

const tabs = ["Profile", "Vehicle", "Health", "Finance", "Work", "Goals", "Timeline", "Calendar", "Settings"];

const timeline = [
  "08:00 Work at Satys",
  "12:00 Lunch + expense log",
  "17:00 Review machine / supplier",
  "21:00 Gym + English practice",
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

function Section({ title, icon: Icon, children, wide = false }: any) {
  return (
    <section className={wide ? "panel panel-wide" : "panel"}>
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
  const [config, setConfig] = useState<SheetConfig>(() => loadSheetConfig());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [syncMessage, setSyncMessage] = useState("Sprint 8 เตรียมฐาน Google Sheets แล้ว — กรอก Web App URL เพื่อทดสอบการเชื่อมต่อ");

  const aiAnswer = useMemo(() => {
    if (!query.trim()) return "ลองถาม AI เช่น ‘ข้อมูลอยู่ในชีตไหน’, ‘ฉันมีรถอะไรบ้าง’, หรือ ‘สรุปการเงินวันนี้’";
    const q = query.toLowerCase();
    if (q.includes("sheet") || q.includes("ชีต")) return "Sprint 8 เพิ่ม Google Sheets Foundation แล้ว ข้อมูลหลักจะแยกเป็นแท็บ Profile, Vehicle, Health, Finance, Work, Goals และ Timeline";
    if (q.includes("รถ")) return "Vehicle จะเชื่อมแท็บ Vehicle ใน Google Sheets เพื่อเก็บ BYD Seal 7, Honda City, ประกัน, PM และค่าใช้จ่าย";
    if (q.includes("เงิน") || q.includes("finance")) return "Finance จะเชื่อมแท็บ Finance เพื่ออ่านรายรับ รายจ่าย หนี้ งบประมาณ และสรุปรายเดือน";
    if (q.includes("สุขภาพ") || q.includes("health")) return "Health จะเชื่อมแท็บ Health เพื่อเก็บอาหาร น้ำหนัก แคลอรี การออกกำลังกาย และให้ AI วิเคราะห์แนวโน้ม";
    return "AI รับคำถามแล้ว: Sprint 8 พร้อมเชื่อมฐานข้อมูล Google Sheets เพื่อให้ AI อ่านข้อมูลจริงใน Sprint ถัดไป";
  }, [query]);

  function updateConfig(key: keyof SheetConfig, value: string) {
    const next = { ...config, [key]: value };
    setConfig(next);
    saveSheetConfig(next);
  }

  async function handleTestConnection() {
    setSyncStatus("checking");
    setSyncMessage("กำลังทดสอบการเชื่อมต่อ Google Sheets...");
    const result = await testGoogleSheetsConnection(config);
    setSyncStatus(result.ok ? "connected" : "error");
    const next = { ...config, lastSync: result.ok ? new Date().toLocaleString("th-TH") : config.lastSync };
    setConfig(next);
    saveSheetConfig(next);
    setSyncMessage(result.message);
  }

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
            <p className="eyebrow"><Sparkles size={16} /> Dashboard นี้เป็น Sprint 8 ถ้าเห็นหน้านี้ แปลว่าโค้ดใหม่ถูกติดตั้งแล้ว ✅</p>
            <h1>Good evening, TUK</h1>
            <p className="subtitle">Google Sheets Sync Foundation — ฐานข้อมูลหลักของ TUK LIFE OS เริ่มวางโครงสร้างแล้ว</p>
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
          <Section title="Google Sheets Database" icon={Table2} wide>
            <div className="sync-grid">
              <div className="sync-card main-sync">
                <div className="sync-status-line">
                  <span className={`status-dot ${syncStatus}`}></span>
                  <strong>{syncStatus === "connected" ? "Connected" : syncStatus === "checking" ? "Checking" : syncStatus === "error" ? "Need Setup" : "Ready to Setup"}</strong>
                </div>
                <p>{syncMessage}</p>
                <div className="form-grid">
                  <label>
                    Google Apps Script Web App URL
                    <input value={config.webAppUrl} onChange={(e) => updateConfig("webAppUrl", e.target.value)} placeholder="https://script.google.com/macros/s/.../exec" />
                  </label>
                  <label>
                    Google Sheet ID
                    <input value={config.sheetId} onChange={(e) => updateConfig("sheetId", e.target.value)} placeholder="ใส่ Sheet ID ของฐานข้อมูลหลัก" />
                  </label>
                  <label>
                    Owner
                    <input value={config.owner} onChange={(e) => updateConfig("owner", e.target.value)} placeholder="TUK" />
                  </label>
                  <label>
                    Last Sync
                    <input value={config.lastSync} readOnly />
                  </label>
                </div>
                <div className="sync-buttons">
                  <button onClick={handleTestConnection}><Link2 size={17} /> Test Connection</button>
                  <button onClick={() => { const next = { ...defaultSheetConfig }; setConfig(next); saveSheetConfig(next); setSyncStatus("idle"); setSyncMessage("รีเซ็ตการตั้งค่าแล้ว"); }}><RefreshCw size={17} /> Reset</button>
                  <button onClick={() => { saveSheetConfig(config); setSyncMessage("บันทึกการตั้งค่าไว้ในเครื่องแล้ว"); }}><Save size={17} /> Save</button>
                </div>
              </div>
              <div className="sync-card">
                <h3>Tabs ที่ระบบเตรียมใช้</h3>
                <div className="tab-list">
                  {tabs.map((tab) => <span key={tab}>{tab}</span>)}
                </div>
                <p className="muted">Sprint 8 ยังเป็น Foundation: ตั้งค่า, บันทึก config, และทดสอบ Web App URL ก่อน Sprint 9 จะเริ่มอ่าน/เขียนข้อมูลจริง</p>
              </div>
            </div>
          </Section>

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
              {timeline.map((item) => <div className="timeline-item" key={item}><CheckCircle2 size={17} /><span>{item}</span><ChevronRight size={16} /></div>)}
            </div>
          </Section>

          <Section title="Next Sprint Plan" icon={Cloud}>
            <div className="memory-list">
              <div className="memory"><FileText size={16} /> Sprint 9: Google Drive Storage + Media Library</div>
              <div className="memory"><FileText size={16} /> Sprint 10: Camera AI + OCR Food/Receipt</div>
              <div className="memory"><FileText size={16} /> Sprint 11: Voice AI + Voice Command</div>
            </div>
          </Section>
        </div>

        <footer className="bottom-version">
          <span>{BUILD.app}</span>
          <b>{BUILD.version}</b>
          <span>{BUILD.sprint}</span>
          <span>{BUILD.buildName}</span>
          <span>{BUILD.status}</span>
        </footer>
      </section>

      <nav className="bottom-nav">
        <Home /><Table2 /><Plus /><Bot /><Settings />
      </nav>
    </main>
  );
}

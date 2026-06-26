import React, { useMemo, useState } from "react";
import {
  Activity,
  Bell,
  BookOpen,
  CalendarDays,
  Camera,
  Car,
  CheckCircle2,
  ChevronRight,
  Cloud,
  CreditCard,
  Database,
  FileText,
  HeartPulse,
  Home,
  LineChart,
  Menu,
  Mic,
  Moon,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Trash2,
  Upload,
  User,
  Wallet,
  Wrench,
  X,
} from "lucide-react";
import "./index.css";

type ModuleKey =
  | "dashboard"
  | "life"
  | "timeline"
  | "calendar"
  | "health"
  | "finance"
  | "vehicles"
  | "work"
  | "ai"
  | "settings";

type TimelineItem = {
  id: number;
  time: string;
  title: string;
  type: string;
  detail: string;
  locked?: boolean;
};

type VaultItem = {
  id: number;
  category: string;
  title: string;
  value: string;
  locked?: boolean;
};

const modules = [
  { key: "dashboard", label: "Dashboard", icon: Home },
  { key: "life", label: "Life Vault", icon: Database },
  { key: "timeline", label: "Timeline", icon: Timer },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "health", label: "Health", icon: HeartPulse },
  { key: "finance", label: "Finance", icon: Wallet },
  { key: "vehicles", label: "Vehicles", icon: Car },
  { key: "work", label: "Satys Work", icon: Wrench },
  { key: "ai", label: "AI Query", icon: Sparkles },
  { key: "settings", label: "Settings", icon: Settings },
] as const;

const initialVault: VaultItem[] = [
  { id: 1, category: "Profile", title: "ชื่อเล่น", value: "TUK", locked: true },
  { id: 2, category: "Work", title: "บริษัท", value: "Satys Electric", locked: true },
  { id: 3, category: "Vehicle", title: "รถหลัก", value: "BYD Seal 7", locked: false },
  { id: 4, category: "Vehicle", title: "รถสำรอง", value: "Honda City 2010", locked: false },
  { id: 5, category: "Finance", title: "รายได้", value: "81,000 บาท/เดือน", locked: true },
];

const initialTimeline: TimelineItem[] = [
  {
    id: 1,
    time: "08:00",
    title: "เริ่มงาน Satys",
    type: "Work",
    detail: "เช็ก PM / BM / เครื่องจักร / Supplier",
    locked: true,
  },
  {
    id: 2,
    time: "12:00",
    title: "บันทึกอาหารกลางวัน",
    type: "Health",
    detail: "เพิ่มแคลอรี่และรูปอาหารได้",
  },
  {
    id: 3,
    time: "17:30",
    title: "ตรวจค่าใช้จ่ายวันนี้",
    type: "Finance",
    detail: "บันทึกค่าใช้จ่ายและใบเสร็จ",
  },
  {
    id: 4,
    time: "21:00",
    title: "Gym / Cardio",
    type: "Health",
    detail: "บันทึกน้ำหนักและการออกกำลังกาย",
  },
];

const todayCards = [
  { label: "Timeline วันนี้", value: "4", note: "รายการสำคัญ", icon: Timer },
  { label: "Life Vault", value: "5", note: "ข้อมูลชีวิต", icon: Database },
  { label: "สุขภาพ", value: "Active", note: "พร้อมบันทึก", icon: HeartPulse },
  { label: "การเงิน", value: "Track", note: "รายรับ/รายจ่าย", icon: Wallet },
];

function App() {
  const [active, setActive] = useState<ModuleKey>("dashboard");
  const [vault, setVault] = useState<VaultItem[]>(initialVault);
  const [timeline, setTimeline] = useState<TimelineItem[]>(initialTimeline);
  const [quickOpen, setQuickOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [newTimeline, setNewTimeline] = useState({ time: "", title: "", type: "Life", detail: "" });
  const [newVault, setNewVault] = useState({ category: "Life", title: "", value: "" });

  const filteredVault = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return vault;
    return vault.filter((item) =>
      `${item.category} ${item.title} ${item.value}`.toLowerCase().includes(q)
    );
  }, [query, vault]);

  const aiAnswer = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return "พิมพ์ถามข้อมูล เช่น ฉันมีรถอะไรบ้าง, รายได้เท่าไหร่, วันนี้ต้องทำอะไร";
    if (q.includes("รถ")) {
      return "คุณมีรถที่บันทึกไว้ 2 คัน: BYD Seal 7 และ Honda City 2010";
    }
    if (q.includes("รายได้") || q.includes("เงินเดือน")) {
      return "รายได้ที่บันทึกไว้ล่าสุดคือ 81,000 บาท/เดือน";
    }
    if (q.includes("วันนี้") || q.includes("ทำอะไร")) {
      return "วันนี้มีงาน Satys, บันทึกอาหาร, ตรวจค่าใช้จ่าย และออกกำลังกาย 21:00";
    }
    return "พบข้อมูลที่เกี่ยวข้องใน Life Vault และ Timeline ด้านล่าง สามารถเพิ่ม/แก้ไข/ลบข้อมูลได้";
  }, [query]);

  const addTimeline = () => {
    if (!newTimeline.title.trim()) return;
    setTimeline((items) => [
      {
        id: Date.now(),
        time: newTimeline.time || "ตอนนี้",
        title: newTimeline.title,
        type: newTimeline.type,
        detail: newTimeline.detail || "บันทึกใหม่จาก Quick Add",
      },
      ...items,
    ]);
    setNewTimeline({ time: "", title: "", type: "Life", detail: "" });
  };

  const addVault = () => {
    if (!newVault.title.trim() || !newVault.value.trim()) return;
    setVault((items) => [
      {
        id: Date.now(),
        category: newVault.category,
        title: newVault.title,
        value: newVault.value,
      },
      ...items,
    ]);
    setNewVault({ category: "Life", title: "", value: "" });
  };

  const deleteTimeline = (id: number) => {
    setTimeline((items) => items.filter((item) => item.id !== id || item.locked));
  };

  const deleteVault = (id: number) => {
    setVault((items) => items.filter((item) => item.id !== id || item.locked));
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">T</div>
          <div>
            <h1>TUK LIFE OS</h1>
            <p>v6.0 Sprint 3</p>
          </div>
        </div>

        <nav className="nav-list">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.key}
                className={`nav-item ${active === m.key ? "active" : ""}`}
                onClick={() => setActive(m.key)}
              >
                <Icon size={18} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sync-card">
          <Cloud size={18} />
          <div>
            <b>Google Sync Ready</b>
            <span>Sheets / Drive layer prepared</span>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">AI Powered Personal Operating System</p>
            <h2>{moduleTitle(active)}</h2>
          </div>
          <div className="top-actions">
            <button className="icon-button">
              <Search size={18} />
            </button>
            <button className="icon-button">
              <Bell size={18} />
            </button>
            <button className="primary-button" onClick={() => setQuickOpen(true)}>
              <Plus size={18} /> Quick Add
            </button>
          </div>
        </header>

        <section className="sprint-banner">
          <Sparkles size={20} />
          <div>
            <b>Dashboard นี้เป็น Sprint 3 ถ้าเห็นหน้านี้ แปลว่าโค้ดใหม่ถูกติดตั้งแล้ว ✅</b>
            <span>เพิ่ม Life Vault + Timeline ที่เพิ่ม/ลบข้อมูลได้ และ AI Query จำลองจากข้อมูลจริงในแอป</span>
          </div>
        </section>

        {active === "dashboard" && (
          <Dashboard
            timeline={timeline}
            vault={vault}
            setActive={setActive}
            onQuick={() => setQuickOpen(true)}
          />
        )}

        {active === "life" && (
          <LifeVault
            items={filteredVault}
            newVault={newVault}
            setNewVault={setNewVault}
            addVault={addVault}
            deleteVault={deleteVault}
            query={query}
            setQuery={setQuery}
          />
        )}

        {active === "timeline" && (
          <TimelinePage
            items={timeline}
            newTimeline={newTimeline}
            setNewTimeline={setNewTimeline}
            addTimeline={addTimeline}
            deleteTimeline={deleteTimeline}
          />
        )}

        {active === "ai" && (
          <AIPage query={query} setQuery={setQuery} aiAnswer={aiAnswer} vault={filteredVault} />
        )}

        {["calendar", "health", "finance", "vehicles", "work", "settings"].includes(active) && (
          <PlaceholderPage active={active} />
        )}
      </main>

      <nav className="bottom-nav">
        {modules.slice(0, 5).map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.key}
              className={active === m.key ? "active" : ""}
              onClick={() => setActive(m.key)}
            >
              <Icon size={18} />
              <span>{m.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </nav>

      {quickOpen && (
        <div className="modal-backdrop" onClick={() => setQuickOpen(false)}>
          <div className="quick-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3>Quick Add</h3>
                <p>เพิ่มข้อมูลเข้า Timeline หรือ Life Vault อย่างรวดเร็ว</p>
              </div>
              <button className="icon-button" onClick={() => setQuickOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="quick-grid">
              <button onClick={() => setActive("timeline") || setQuickOpen(false)}>
                <Timer /> Timeline
              </button>
              <button onClick={() => setActive("life") || setQuickOpen(false)}>
                <Database /> Life Vault
              </button>
              <button onClick={() => setActive("health") || setQuickOpen(false)}>
                <HeartPulse /> Health
              </button>
              <button onClick={() => setActive("finance") || setQuickOpen(false)}>
                <Wallet /> Expense
              </button>
              <button onClick={() => setActive("vehicles") || setQuickOpen(false)}>
                <Car /> Vehicle
              </button>
              <button onClick={() => setActive("ai") || setQuickOpen(false)}>
                <Camera /> AI Camera
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function moduleTitle(active: ModuleKey) {
  const map: Record<ModuleKey, string> = {
    dashboard: "Dashboard",
    life: "Life Vault",
    timeline: "Timeline",
    calendar: "Calendar",
    health: "Health",
    finance: "Finance",
    vehicles: "Vehicles",
    work: "Satys Work",
    ai: "AI Query",
    settings: "Settings",
  };
  return map[active];
}

function Dashboard({
  timeline,
  vault,
  setActive,
  onQuick,
}: {
  timeline: TimelineItem[];
  vault: VaultItem[];
  setActive: (key: ModuleKey) => void;
  onQuick: () => void;
}) {
  return (
    <div className="dashboard-grid">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Good Evening</p>
          <h3>สวัสดี TUK — วันนี้ระบบพร้อมทำงานแล้ว</h3>
          <p>
            Sprint 3 เพิ่มฐานข้อมูลชีวิตและ Timeline ที่ใช้งานได้จริงในหน้าเว็บ
            ขั้นต่อไปจะเชื่อม Google Sheets ให้ข้อมูลไม่หาย
          </p>
        </div>
        <div className="hero-actions">
          <button className="primary-button" onClick={onQuick}>
            <Plus size={18} /> เพิ่มข้อมูล
          </button>
          <button className="secondary-button" onClick={() => setActive("ai")}>
            <Sparkles size={18} /> ถาม AI
          </button>
        </div>
      </section>

      <section className="stats-grid">
        {todayCards.map((card) => {
          const Icon = card.icon;
          return (
            <div className="stat-card" key={card.label}>
              <Icon size={22} />
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.note}</small>
            </div>
          );
        })}
      </section>

      <section className="panel-card">
        <div className="section-head">
          <div>
            <h3>Today's Focus</h3>
            <p>สิ่งที่ควรโฟกัสวันนี้</p>
          </div>
          <Target size={20} />
        </div>
        <div className="focus-list">
          {["PM Machine", "บันทึกอาหาร", "Finance Review", "Gym 21:00"].map((item) => (
            <div className="focus-item" key={item}>
              <CheckCircle2 size={18} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-card">
        <div className="section-head">
          <div>
            <h3>AI Summary</h3>
            <p>สรุปจากข้อมูลในระบบ</p>
          </div>
          <Sparkles size={20} />
        </div>
        <p className="ai-text">
          วันนี้มี Timeline {timeline.length} รายการ และ Life Vault {vault.length} รายการ
          ระบบพร้อมต่อ Google Sheets / Drive ใน Sprint ถัดไป
        </p>
      </section>

      <section className="wide-card">
        <div className="section-head">
          <div>
            <h3>Timeline ล่าสุด</h3>
            <p>เหตุการณ์สำคัญวันนี้</p>
          </div>
          <button className="link-button" onClick={() => setActive("timeline")}>
            ดูทั้งหมด <ChevronRight size={16} />
          </button>
        </div>
        <div className="timeline-mini">
          {timeline.slice(0, 4).map((item) => (
            <div className="timeline-row" key={item.id}>
              <b>{item.time}</b>
              <div>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function LifeVault({
  items,
  newVault,
  setNewVault,
  addVault,
  deleteVault,
  query,
  setQuery,
}: {
  items: VaultItem[];
  newVault: { category: string; title: string; value: string };
  setNewVault: React.Dispatch<React.SetStateAction<{ category: string; title: string; value: string }>>;
  addVault: () => void;
  deleteVault: (id: number) => void;
  query: string;
  setQuery: (value: string) => void;
}) {
  return (
    <div className="page-stack">
      <section className="panel-card">
        <div className="section-head">
          <div>
            <h3>Life Vault</h3>
            <p>ฐานข้อมูลชีวิตถาวร เช่น โปรไฟล์ รถ บ้าน งาน การเงิน</p>
          </div>
          <ShieldCheck size={20} />
        </div>

        <div className="form-grid">
          <input
            value={newVault.category}
            onChange={(e) => setNewVault((s) => ({ ...s, category: e.target.value }))}
            placeholder="หมวด เช่น Vehicle"
          />
          <input
            value={newVault.title}
            onChange={(e) => setNewVault((s) => ({ ...s, title: e.target.value }))}
            placeholder="ชื่อข้อมูล เช่น รถหลัก"
          />
          <input
            value={newVault.value}
            onChange={(e) => setNewVault((s) => ({ ...s, value: e.target.value }))}
            placeholder="รายละเอียด เช่น BYD Seal 7"
          />
          <button className="primary-button" onClick={addVault}>
            <Plus size={18} /> เพิ่มข้อมูล
          </button>
        </div>

        <div className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหา Life Vault เช่น รถ รายได้ Satys"
          />
        </div>
      </section>

      <section className="vault-grid">
        {items.map((item) => (
          <div className="vault-card" key={item.id}>
            <div>
              <span>{item.category}</span>
              <h4>{item.title}</h4>
              <p>{item.value}</p>
            </div>
            <button
              className={`trash-button ${item.locked ? "locked" : ""}`}
              onClick={() => deleteVault(item.id)}
              title={item.locked ? "ข้อมูลมาตรฐานห้ามลบ" : "ลบข้อมูล"}
            >
              {item.locked ? <ShieldCheck size={16} /> : <Trash2 size={16} />}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}

function TimelinePage({
  items,
  newTimeline,
  setNewTimeline,
  addTimeline,
  deleteTimeline,
}: {
  items: TimelineItem[];
  newTimeline: { time: string; title: string; type: string; detail: string };
  setNewTimeline: React.Dispatch<React.SetStateAction<{ time: string; title: string; type: string; detail: string }>>;
  addTimeline: () => void;
  deleteTimeline: (id: number) => void;
}) {
  return (
    <div className="page-stack">
      <section className="panel-card">
        <div className="section-head">
          <div>
            <h3>Timeline</h3>
            <p>ทุกเหตุการณ์ในชีวิตจะถูกเก็บย้อนหลังและค้นหาได้</p>
          </div>
          <Timer size={20} />
        </div>

        <div className="form-grid timeline-form">
          <input
            value={newTimeline.time}
            onChange={(e) => setNewTimeline((s) => ({ ...s, time: e.target.value }))}
            placeholder="เวลา เช่น 19:40"
          />
          <input
            value={newTimeline.type}
            onChange={(e) => setNewTimeline((s) => ({ ...s, type: e.target.value }))}
            placeholder="ประเภท เช่น Food"
          />
          <input
            value={newTimeline.title}
            onChange={(e) => setNewTimeline((s) => ({ ...s, title: e.target.value }))}
            placeholder="หัวข้อ เช่น กินขนมปัง"
          />
          <input
            value={newTimeline.detail}
            onChange={(e) => setNewTimeline((s) => ({ ...s, detail: e.target.value }))}
            placeholder="รายละเอียด"
          />
          <button className="primary-button" onClick={addTimeline}>
            <Plus size={18} /> เพิ่ม Timeline
          </button>
        </div>
      </section>

      <section className="timeline-list">
        {items.map((item) => (
          <div className="timeline-card" key={item.id}>
            <div className="time-pill">{item.time}</div>
            <div className="timeline-content">
              <span>{item.type}</span>
              <h4>{item.title}</h4>
              <p>{item.detail}</p>
            </div>
            <button
              className={`trash-button ${item.locked ? "locked" : ""}`}
              onClick={() => deleteTimeline(item.id)}
            >
              {item.locked ? <ShieldCheck size={16} /> : <Trash2 size={16} />}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}

function AIPage({
  query,
  setQuery,
  aiAnswer,
  vault,
}: {
  query: string;
  setQuery: (value: string) => void;
  aiAnswer: string;
  vault: VaultItem[];
}) {
  return (
    <div className="page-stack">
      <section className="ai-panel">
        <div className="section-head">
          <div>
            <h3>AI Query</h3>
            <p>ถามข้อมูลจาก Life Vault และ Timeline</p>
          </div>
          <Sparkles size={22} />
        </div>
        <div className="ai-input">
          <Mic size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ลองพิมพ์: ฉันมีรถอะไรบ้าง"
          />
          <button>
            <Sparkles size={18} />
          </button>
        </div>
        <div className="ai-answer">
          <b>AI Answer</b>
          <p>{aiAnswer}</p>
        </div>
      </section>

      <section className="vault-grid">
        {vault.map((item) => (
          <div className="vault-card" key={item.id}>
            <div>
              <span>{item.category}</span>
              <h4>{item.title}</h4>
              <p>{item.value}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function PlaceholderPage({ active }: { active: string }) {
  const config: Record<string, { icon: React.ReactNode; title: string; text: string }> = {
    calendar: {
      icon: <CalendarDays />,
      title: "Calendar",
      text: "Sprint ถัดไปจะเพิ่มปฏิทินรายวัน/รายเดือน พร้อมดูย้อนหลังจาก Timeline",
    },
    health: {
      icon: <HeartPulse />,
      title: "Health",
      text: "เตรียมเพิ่มน้ำหนัก แคลอรี่ ออกกำลังกาย รูปอาหาร และ AI วิเคราะห์อาหาร",
    },
    finance: {
      icon: <CreditCard />,
      title: "Finance",
      text: "เตรียมเพิ่มรายรับ รายจ่าย หนี้ สินทรัพย์ ใบเสร็จ และ OCR",
    },
    vehicles: {
      icon: <Car />,
      title: "Vehicles",
      text: "เตรียมเพิ่มข้อมูลรถ ประกัน ภาษี ซ่อมบำรุง และแจ้งเตือน",
    },
    work: {
      icon: <Wrench />,
      title: "Satys Work",
      text: "เตรียมเพิ่ม PM/BM เครื่องจักร Supplier Email และ Spare Part",
    },
    settings: {
      icon: <Settings />,
      title: "Settings",
      text: "เตรียมเพิ่ม Google Sheets, Google Drive, Theme, Security, Backup",
    },
  };

  const c = config[active];
  return (
    <section className="placeholder-card">
      <div className="placeholder-icon">{c.icon}</div>
      <h3>{c.title}</h3>
      <p>{c.text}</p>
      <div className="coming-grid">
        <span>Google Sheets Ready</span>
        <span>PWA Ready</span>
        <span>Mobile Ready</span>
        <span>AI Ready</span>
      </div>
    </section>
  );
}

export default App;

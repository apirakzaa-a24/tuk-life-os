import React, { useMemo, useState } from 'react';
import './index.css';

type NavKey =
  | 'dashboard'
  | 'timeline'
  | 'calendar'
  | 'life'
  | 'health'
  | 'finance'
  | 'vehicle'
  | 'work'
  | 'ai'
  | 'settings';

type TimelineItem = {
  time: string;
  icon: string;
  title: string;
  desc: string;
  type: string;
};

type Card = {
  title: string;
  value: string;
  note: string;
  icon: string;
};

const navItems: { key: NavKey; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Home', icon: '🏠' },
  { key: 'timeline', label: 'Timeline', icon: '🕒' },
  { key: 'calendar', label: 'Calendar', icon: '📅' },
  { key: 'life', label: 'Life Vault', icon: '🧠' },
  { key: 'health', label: 'Health', icon: '❤️' },
  { key: 'finance', label: 'Finance', icon: '💰' },
  { key: 'vehicle', label: 'Vehicle', icon: '🚗' },
  { key: 'work', label: 'Satys Work', icon: '🏭' },
  { key: 'ai', label: 'AI', icon: '🤖' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

const focusList = ['Review Dashboard', 'Gym 21:00', 'English 30 min', 'Finance Review'];

const timeline: TimelineItem[] = [
  { time: '06:30', icon: '⚖️', title: 'Weight Check', desc: 'Record weight and body condition', type: 'Health' },
  { time: '08:00', icon: '🏭', title: 'Satys Work', desc: 'PM / supplier / machine follow up', type: 'Work' },
  { time: '12:00', icon: '🍱', title: 'Lunch Log', desc: 'Use AI Camera to record food', type: 'Health' },
  { time: '18:30', icon: '💰', title: 'Expense Review', desc: 'Scan receipt or add expense', type: 'Finance' },
  { time: '21:00', icon: '🏋️', title: 'Workout', desc: 'Gym, walk, jump rope, Apple Watch', type: 'Health' },
];

const cards: Card[] = [
  { title: 'Health', value: '62.2 kg', note: 'Target: lean body / calories tracking', icon: '❤️' },
  { title: 'Finance', value: '฿81,000', note: 'Income base / expense sync soon', icon: '💰' },
  { title: 'Vehicles', value: '2 cars', note: 'BYD Seal 7 + Honda City 2010', icon: '🚗' },
  { title: 'Satys Work', value: '4 focus', note: 'Machine, PM, supplier, project', icon: '🏭' },
];

const vaultItems = [
  ['👤', 'Profile', 'Name, age, address, phone, emergency data'],
  ['🏠', 'Places', 'Home, condo, work, rental rooms'],
  ['🚗', 'Vehicles', 'Cars, insurance, tax, mileage, service history'],
  ['💳', 'Accounts', 'Bank, card, debt, investment, assets'],
  ['📄', 'Documents', 'Receipts, PDF, warranty, contracts'],
  ['👥', 'People', 'Family, supplier, friends, emergency contacts'],
];

function App() {
  const [active, setActive] = useState<NavKey>('dashboard');
  const [quickOpen, setQuickOpen] = useState(false);

  const currentTitle = useMemo(() => navItems.find((item) => item.key === active)?.label ?? 'Dashboard', [active]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">T</div>
          <div>
            <h1>TUK LIFE OS</h1>
            <p>v6 Sprint 2</p>
          </div>
        </div>

        <nav className="side-nav">
          {navItems.map((item) => (
            <button key={item.key} onClick={() => setActive(item.key)} className={active === item.key ? 'active' : ''}>
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sync-card">
          <p>Cloud Status</p>
          <strong>Google Sheets Ready</strong>
          <span>Drive image compression planned</span>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">Personal Operating System</p>
            <h2>{currentTitle}</h2>
          </div>
          <div className="top-actions">
            <button className="ghost">🔍 Search</button>
            <button className="primary" onClick={() => setActive('ai')}>🤖 Ask AI</button>
          </div>
        </header>

        {active === 'dashboard' && <Dashboard onGo={setActive} />}
        {active === 'timeline' && <Timeline />}
        {active === 'calendar' && <Calendar />}
        {active === 'life' && <LifeVault />}
        {active === 'health' && <ModulePage icon="❤️" title="Health" subtitle="Food, calories, weight, exercise, sleep" />}
        {active === 'finance' && <ModulePage icon="💰" title="Finance" subtitle="Income, expense, debt, budget, receipt AI" />}
        {active === 'vehicle' && <ModulePage icon="🚗" title="Vehicle" subtitle="BYD Seal 7, Honda City, service, tax, insurance" />}
        {active === 'work' && <ModulePage icon="🏭" title="Satys Work" subtitle="PM, BM, machine, supplier, PO, projects" />}
        {active === 'ai' && <AIPage />}
        {active === 'settings' && <Settings />}
      </main>

      <button className="fab" onClick={() => setQuickOpen(!quickOpen)}>＋</button>
      {quickOpen && <QuickAdd onClose={() => setQuickOpen(false)} />}

      <nav className="bottom-nav">
        {navItems.slice(0, 5).map((item) => (
          <button key={item.key} onClick={() => setActive(item.key)} className={active === item.key ? 'active' : ''}>
            <span>{item.icon}</span>
            <small>{item.label}</small>
          </button>
        ))}
      </nav>
    </div>
  );
}

function Dashboard({ onGo }: { onGo: (key: NavKey) => void }) {
  return (
    <section className="page-stack">
      <div className="hero-card">
        <div>
          <p className="eyebrow">Good Evening, TUK</p>
          <h1>Today Command Center</h1>
          <p>Dashboard นี้เป็น Sprint 2 ถ้าเห็นหน้านี้ แปลว่าโค้ดใหม่ถูกติดตั้งแล้ว ✅</p>
        </div>
        <div className="hero-actions">
          <button onClick={() => onGo('ai')}>🎤 Voice AI</button>
          <button onClick={() => onGo('ai')}>📷 AI Camera</button>
        </div>
      </div>

      <div className="focus-grid">
        <div className="panel large">
          <div className="panel-title">
            <h3>🔥 Today's Focus</h3>
            <button onClick={() => onGo('timeline')}>View Timeline</button>
          </div>
          <div className="focus-list">
            {focusList.map((item, index) => (
              <div className="focus-item" key={item}>
                <span>{index + 1}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel ai-summary">
          <h3>🤖 AI Summary</h3>
          <p>วันนี้ควรโฟกัสงาน Satys ก่อน 17:00 แล้วค่อยบันทึกอาหาร/ออกกำลังกายตอนเย็น ระบบ Google Sheets จะเป็นฐานข้อมูลหลักใน Sprint ถัดไป</p>
        </div>
      </div>

      <div className="metric-grid">
        {cards.map((card) => (
          <div className="metric-card" key={card.title}>
            <span className="metric-icon">{card.icon}</span>
            <p>{card.title}</p>
            <strong>{card.value}</strong>
            <small>{card.note}</small>
          </div>
        ))}
      </div>

      <div className="split-grid">
        <Timeline compact />
        <div className="panel">
          <div className="panel-title">
            <h3>⚡ Quick Actions</h3>
          </div>
          <div className="quick-grid">
            {['Add Timeline', 'Add Expense', 'Add Weight', 'Scan Food', 'Scan Receipt', 'Open Settings'].map((action) => (
              <button key={action}>{action}</button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Timeline({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? 'panel' : 'page-stack'}>
      <div className="panel-title">
        <h3>🕒 Today Timeline</h3>
        <button>+ Add Event</button>
      </div>
      <div className="timeline-list">
        {timeline.map((item) => (
          <article className="timeline-item" key={`${item.time}-${item.title}`}>
            <div className="time">{item.time}</div>
            <div className="dot">{item.icon}</div>
            <div>
              <strong>{item.title}</strong>
              <p>{item.desc}</p>
              <span>{item.type}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Calendar() {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <section className="page-stack">
      <div className="panel-title standalone">
        <h3>📅 Life Calendar</h3>
        <button>June 2026</button>
      </div>
      <div className="calendar-grid">
        {days.map((day) => (
          <div className="calendar-day" key={day}>
            <strong>{day}</strong>
            <span>{day % 3 === 0 ? '❤️ 💰' : day % 5 === 0 ? '🚗 🏭' : '📝'}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function LifeVault() {
  return (
    <section className="page-stack">
      <div className="hero-card small">
        <div>
          <p className="eyebrow">Life Database</p>
          <h1>Life Vault</h1>
          <p>คลังข้อมูลชีวิตที่ AI จะใช้ตอบคำถาม เช่น รถ ที่อยู่ เอกสาร การเงิน สุขภาพ และงาน</p>
        </div>
      </div>
      <div className="vault-grid">
        {vaultItems.map(([icon, title, desc]) => (
          <div className="vault-card" key={title}>
            <span>{icon}</span>
            <strong>{title}</strong>
            <p>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ModulePage({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <section className="page-stack">
      <div className="hero-card small">
        <div>
          <p className="eyebrow">Module</p>
          <h1>{icon} {title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="module-grid">
        <div className="panel">
          <h3>Database</h3>
          <p>เพิ่ม / แก้ไข / ลบ / Sync Google Sheets</p>
        </div>
        <div className="panel">
          <h3>Timeline Link</h3>
          <p>ทุกข้อมูลจะลง Timeline และ Calendar</p>
        </div>
        <div className="panel">
          <h3>AI Assistant</h3>
          <p>ถาม AI ได้จากข้อมูลจริงในโมดูลนี้</p>
        </div>
      </div>
    </section>
  );
}

function AIPage() {
  return (
    <section className="page-stack">
      <div className="hero-card small">
        <div>
          <p className="eyebrow">AI Command</p>
          <h1>🤖 Ask Your Life OS</h1>
          <p>พิมพ์ พูด ถ่ายรูป หรือสแกนบิล เพื่อบันทึกข้อมูลลงระบบ</p>
        </div>
      </div>
      <div className="ai-console">
        <div className="chat-bubble ai">สวัสดี TUK วันนี้ต้องการให้ผมช่วยบันทึกอะไร?</div>
        <div className="ai-input-row">
          <button>🎤</button>
          <input placeholder="เช่น วันนี้กินข้าวมันไก่ / ฉันมีรถกี่คัน" />
          <button>📷</button>
          <button className="primary">Send</button>
        </div>
      </div>
    </section>
  );
}

function Settings() {
  return (
    <section className="page-stack">
      <div className="settings-grid">
        {[
          ['👤 Profile & Account', 'Name, photo, address, emergency data'],
          ['☁️ Google Sync', 'Sheets, Drive, backup, last sync'],
          ['🤖 AI Settings', 'Voice, camera, language, privacy'],
          ['🔐 Security', 'PIN, Face ID, private modules'],
          ['📲 PWA', 'Install app, offline cache, notification'],
          ['🎨 Theme', 'Dark, glass, compact, premium'],
        ].map(([title, desc]) => (
          <div className="panel" key={title}>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuickAdd({ onClose }: { onClose: () => void }) {
  return (
    <div className="quick-modal">
      <div className="quick-sheet">
        <div className="panel-title">
          <h3>Quick Add</h3>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="quick-grid">
          {['Food Photo', 'Receipt', 'Expense', 'Weight', 'Vehicle', 'Work Task', 'Journal', 'Document'].map((item) => (
            <button key={item}>{item}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

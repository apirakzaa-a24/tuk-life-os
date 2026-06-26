import React, { useMemo, useState } from 'react';
import './index.css';

type ViewKey = 'dashboard' | 'calendar' | 'timeline' | 'life' | 'health' | 'finance' | 'vehicle' | 'work' | 'ai' | 'settings';

type TimelineItem = {
  id: number;
  time: string;
  title: string;
  type: string;
  note: string;
};

const navItems: { key: ViewKey; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { key: 'calendar', label: 'Calendar', icon: '📅' },
  { key: 'timeline', label: 'Timeline', icon: '🕒' },
  { key: 'life', label: 'Life Vault', icon: '🧬' },
  { key: 'health', label: 'Health', icon: '❤️' },
  { key: 'finance', label: 'Finance', icon: '💰' },
  { key: 'vehicle', label: 'Vehicle', icon: '🚗' },
  { key: 'work', label: 'Satys Work', icon: '🏭' },
  { key: 'ai', label: 'AI Center', icon: '🤖' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

const timeline: TimelineItem[] = [
  { id: 1, time: '08:00', title: 'Satys work start', type: 'Work', note: 'Maintenance / supplier / machine follow-up' },
  { id: 2, time: '12:00', title: 'Lunch & food log', type: 'Health', note: 'Save calories and photo to Timeline' },
  { id: 3, time: '17:00', title: 'Finance review', type: 'Finance', note: 'Expense, debt, daily balance' },
  { id: 4, time: '21:00', title: 'Gym / cardio', type: 'Health', note: 'Workout and Apple Watch calories' },
];

const calendarDays = [
  { day: 'Mon', date: '22', focus: 'PM', status: 'done' },
  { day: 'Tue', date: '23', focus: 'Finance', status: 'done' },
  { day: 'Wed', date: '24', focus: 'Vehicle', status: 'done' },
  { day: 'Thu', date: '25', focus: 'AI Build', status: 'active' },
  { day: 'Fri', date: '26', focus: 'Sprint 4', status: 'active' },
  { day: 'Sat', date: '27', focus: 'Health', status: 'todo' },
  { day: 'Sun', date: '28', focus: 'Planning', status: 'todo' },
];

function App() {
  const [view, setView] = useState<ViewKey>('dashboard');
  const [query, setQuery] = useState('');

  const activeTitle = useMemo(() => navItems.find((n) => n.key === view)?.label ?? 'Dashboard', [view]);

  return (
    <main className="os-shell">
      <aside className="sidebar">
        <div className="brand-card">
          <div className="brand-icon">T</div>
          <div>
            <h1>TUK LIFE OS</h1>
            <p>v6 Sprint 4 Calendar + Timeline</p>
          </div>
        </div>
        <nav className="side-nav">
          {navItems.map((item) => (
            <button key={item.key} className={view === item.key ? 'active' : ''} onClick={() => setView(item.key)}>
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Sprint 4 installed ✅</p>
            <h2>{activeTitle}</h2>
            <span>Dashboard นี้เป็น Sprint 4 ถ้าเห็นหน้านี้ แปลว่าโค้ดใหม่ถูกติดตั้งแล้ว ✅</span>
          </div>
          <div className="top-actions">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ถาม AI / ค้นหาชีวิต..." />
            <button>+ Quick Add</button>
          </div>
        </header>

        {view === 'dashboard' && <Dashboard setView={setView} />}
        {view === 'calendar' && <CalendarView />}
        {view === 'timeline' && <TimelineView />}
        {view !== 'dashboard' && view !== 'calendar' && view !== 'timeline' && <ModuleView view={view} />}
      </section>

      <nav className="bottom-nav">
        {navItems.slice(0, 5).map((item) => (
          <button key={item.key} className={view === item.key ? 'active' : ''} onClick={() => setView(item.key)}>
            <span>{item.icon}</span>
            <small>{item.label}</small>
          </button>
        ))}
      </nav>
    </main>
  );
}

function Dashboard({ setView }: { setView: (v: ViewKey) => void }) {
  return (
    <div className="grid dashboard-grid">
      <section className="hero-card wide">
        <p className="eyebrow">AI Powered Personal Operating System</p>
        <h3>สวัสดี TUK — วันนี้ระบบพร้อมทำงาน</h3>
        <p>รวมสุขภาพ การเงิน รถ งาน Satys ปฏิทิน และ Timeline ไว้ในที่เดียว</p>
        <div className="hero-actions">
          <button onClick={() => setView('timeline')}>เปิด Timeline</button>
          <button onClick={() => setView('calendar')} className="secondary">เปิด Calendar</button>
        </div>
      </section>

      <MetricCard title="Today Focus" value="5 Tasks" note="งานสำคัญวันนี้" icon="🔥" />
      <MetricCard title="Health" value="Active" note="พร้อมบันทึกอาหารและฟิตเนส" icon="❤️" />
      <MetricCard title="Finance" value="Track" note="ตรวจรายรับรายจ่าย" icon="💰" />
      <MetricCard title="AI Brain" value="Online" note="พร้อมตอบจากฐานข้อมูล" icon="🤖" />

      <section className="panel wide">
        <div className="section-head">
          <h3>Today Calendar</h3>
          <button onClick={() => setView('calendar')}>ดูทั้งหมด</button>
        </div>
        <div className="calendar-strip">
          {calendarDays.map((d) => (
            <div className={`day-card ${d.status}`} key={d.date}>
              <b>{d.day}</b>
              <strong>{d.date}</strong>
              <span>{d.focus}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel wide">
        <div className="section-head">
          <h3>Timeline ล่าสุด</h3>
          <button onClick={() => setView('timeline')}>เพิ่ม Timeline</button>
        </div>
        <div className="timeline-list compact">
          {timeline.map((item) => (
            <article key={item.id}>
              <time>{item.time}</time>
              <div>
                <h4>{item.title}</h4>
                <p>{item.note}</p>
              </div>
              <span>{item.type}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function CalendarView() {
  return (
    <div className="page-stack">
      <section className="panel wide">
        <p className="eyebrow">Sprint 4 Feature</p>
        <h3>📅 Smart Calendar</h3>
        <p>ปฏิทินสำหรับดูย้อนหลัง บันทึกเป้าหมาย งาน สุขภาพ การเงิน รถ และ Timeline รายวัน</p>
        <div className="month-grid">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
            <button key={date} className={date === 26 ? 'today' : date % 5 === 0 ? 'has-event' : ''}>
              <strong>{date}</strong>
              <span>{date === 26 ? 'Sprint 4' : date % 5 === 0 ? 'Event' : ''}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function TimelineView() {
  return (
    <div className="page-stack">
      <section className="panel wide">
        <div className="section-head">
          <div>
            <p className="eyebrow">Sprint 4 Feature</p>
            <h3>🕒 Life Timeline</h3>
          </div>
          <button>+ Add Timeline</button>
        </div>
        <div className="timeline-list">
          {timeline.concat(timeline).map((item, index) => (
            <article key={`${item.id}-${index}`}>
              <time>{item.time}</time>
              <div>
                <h4>{item.title}</h4>
                <p>{item.note}</p>
              </div>
              <span>{item.type}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ModuleView({ view }: { view: ViewKey }) {
  const item = navItems.find((n) => n.key === view);
  return (
    <div className="page-stack">
      <section className="panel wide module-panel">
        <p className="eyebrow">TUK LIFE OS v6</p>
        <h3>{item?.icon} {item?.label}</h3>
        <p>โมดูลนี้เตรียมไว้สำหรับ Sprint ถัดไป จะเชื่อม Google Sheets, Google Drive และ AI Memory</p>
        <div className="module-actions">
          <button>เพิ่มข้อมูล</button>
          <button className="secondary">แก้ไขข้อมูล</button>
          <button className="secondary">Sync Google Sheets</button>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ title, value, note, icon }: { title: string; value: string; note: string; icon: string }) {
  return (
    <section className="metric-card">
      <span>{icon}</span>
      <p>{title}</p>
      <h3>{value}</h3>
      <small>{note}</small>
    </section>
  );
}

export default App;

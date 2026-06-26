import React, { useMemo, useState } from 'react';
import './index.css';

type NavKey = 'dashboard' | 'vehicle' | 'work' | 'timeline' | 'settings';

type Vehicle = {
  id: string;
  name: string;
  model: string;
  status: string;
  nextService: string;
  cost: string;
};

type Machine = {
  id: string;
  name: string;
  area: string;
  status: string;
  nextPm: string;
};

const vehicles: Vehicle[] = [
  { id: 'VEH-001', name: 'BYD Seal 7', model: 'EV • Black', status: 'Active', nextService: 'Check tires / software', cost: '฿17,796/mo' },
  { id: 'VEH-002', name: 'Honda City 2010', model: 'Dual Fuel', status: 'Active', nextService: 'Insurance / tax check', cost: '฿4,851/mo' },
];

const machines: Machine[] = [
  { id: 'MC-001', name: 'WG-825 Wire Bending', area: 'Satys • Wire Harness', status: 'Monitor length stability', nextPm: 'Weekly check' },
  { id: 'MC-002', name: 'Komax Gamma 253/255', area: 'Production', status: 'PM ready', nextPm: 'Monthly PM' },
  { id: 'MC-003', name: 'Injection 40 Ton Trial', area: 'Evaluation', status: 'Trial machine', nextPm: 'Trial review' },
];

const timeline = [
  '08:00 Satys work / machine follow up',
  '12:00 Log food + finance',
  '17:30 Review vehicle / expense',
  '21:00 Gym + Health check',
];

function StatusPill({ children }: { children: React.ReactNode }) {
  return <span className="status-pill">{children}</span>;
}

function Header() {
  return (
    <header className="hero-card">
      <div>
        <p className="eyebrow">TUK LIFE OS v6 • Sprint 6</p>
        <h1>Vehicle + Satys Work Command Center</h1>
        <p className="hero-copy">Dashboard นี้เป็น Sprint 6 ถ้าเห็นหน้านี้ แปลว่าโค้ดใหม่ถูกติดตั้งแล้ว ✅</p>
      </div>
      <div className="sync-box">
        <span>Google Sheets</span>
        <strong>Ready</strong>
        <small>Vehicle / Work / Timeline</small>
      </div>
    </header>
  );
}

function Dashboard() {
  const totalMonthlyVehicleCost = useMemo(() => '฿22,647', []);
  return (
    <section className="page-grid">
      <Header />

      <div className="stats-grid">
        <div className="stat-card">
          <span>Vehicles</span>
          <strong>2</strong>
          <small>BYD Seal 7 + Honda City</small>
        </div>
        <div className="stat-card">
          <span>Vehicle Cost</span>
          <strong>{totalMonthlyVehicleCost}</strong>
          <small>monthly loan tracking</small>
        </div>
        <div className="stat-card">
          <span>Satys Machines</span>
          <strong>3</strong>
          <small>PM / trial / issue follow up</small>
        </div>
        <div className="stat-card">
          <span>AI Actions</span>
          <strong>6</strong>
          <small>scan, voice, add, sync</small>
        </div>
      </div>

      <div className="two-column">
        <section className="panel">
          <div className="panel-head">
            <h2>🚗 Vehicle Overview</h2>
            <StatusPill>Database ready</StatusPill>
          </div>
          <div className="list-stack">
            {vehicles.map((vehicle) => (
              <article className="list-item" key={vehicle.id}>
                <div>
                  <strong>{vehicle.name}</strong>
                  <p>{vehicle.model}</p>
                </div>
                <div className="item-meta">
                  <span>{vehicle.cost}</span>
                  <small>{vehicle.nextService}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>🏢 Satys Work</h2>
            <StatusPill>PM/BM tracker</StatusPill>
          </div>
          <div className="list-stack">
            {machines.map((machine) => (
              <article className="list-item" key={machine.id}>
                <div>
                  <strong>{machine.name}</strong>
                  <p>{machine.area}</p>
                </div>
                <div className="item-meta">
                  <span>{machine.nextPm}</span>
                  <small>{machine.status}</small>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>⚡ Quick Actions</h2>
          <StatusPill>Mobile ready</StatusPill>
        </div>
        <div className="action-grid">
          <button>+ Add Vehicle</button>
          <button>+ Add Machine</button>
          <button>📷 Scan Receipt</button>
          <button>🎤 Voice AI</button>
          <button>📅 Add PM</button>
          <button>☁️ Sync Sheets</button>
        </div>
      </section>
    </section>
  );
}

function VehiclePage() {
  return (
    <section className="page-grid">
      <div className="section-title">
        <p className="eyebrow">Vehicle Database</p>
        <h1>รถทั้งหมดของคุณ</h1>
        <p>ออกแบบให้ต่อกับ Google Sheets แท็บ Vehicles ใน Sprint ถัดไป</p>
      </div>
      <div className="card-grid">
        {vehicles.map((vehicle) => (
          <article className="feature-card" key={vehicle.id}>
            <span>{vehicle.id}</span>
            <h2>{vehicle.name}</h2>
            <p>{vehicle.model}</p>
            <ul>
              <li>Status: {vehicle.status}</li>
              <li>Next: {vehicle.nextService}</li>
              <li>Cost: {vehicle.cost}</li>
            </ul>
            <button className="secondary-btn">View Details</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkPage() {
  return (
    <section className="page-grid">
      <div className="section-title">
        <p className="eyebrow">Satys Work Database</p>
        <h1>เครื่องจักร / PM / BM / Supplier</h1>
        <p>หน้านี้เตรียมสำหรับเก็บงาน Satys, เครื่องจักร, PM/BM, Trial และ Supplier</p>
      </div>
      <div className="card-grid">
        {machines.map((machine) => (
          <article className="feature-card" key={machine.id}>
            <span>{machine.id}</span>
            <h2>{machine.name}</h2>
            <p>{machine.area}</p>
            <ul>
              <li>PM: {machine.nextPm}</li>
              <li>Note: {machine.status}</li>
            </ul>
            <button className="secondary-btn">Open Work Record</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function TimelinePage() {
  return (
    <section className="page-grid">
      <div className="section-title">
        <p className="eyebrow">Universal Timeline</p>
        <h1>ไทม์ไลน์วันนี้</h1>
      </div>
      <div className="timeline-line">
        {timeline.map((item, index) => (
          <div className="timeline-row" key={item}>
            <div className="timeline-dot">{index + 1}</div>
            <p>{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SettingsPage() {
  return (
    <section className="page-grid">
      <div className="section-title">
        <p className="eyebrow">Settings Center</p>
        <h1>ตั้งค่าระบบ</h1>
        <p>Google Sheets, Drive, Backup, AI, Security จะถูกเชื่อมจริงใน Sprint ถัดไป</p>
      </div>
      <div className="card-grid">
        {['Google Sheets', 'Google Drive', 'AI Voice', 'AI Camera', 'Backup / Restore', 'Security'].map((item) => (
          <article className="feature-card" key={item}>
            <span>Ready</span>
            <h2>{item}</h2>
            <p>เตรียมโครงสร้างไว้สำหรับเชื่อมต่อจริง</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [active, setActive] = useState<NavKey>('dashboard');
  const screens: Record<NavKey, React.ReactNode> = {
    dashboard: <Dashboard />,
    vehicle: <VehiclePage />,
    work: <WorkPage />,
    timeline: <TimelinePage />,
    settings: <SettingsPage />,
  };

  const navItems: { key: NavKey; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'Home', icon: '🏠' },
    { key: 'vehicle', label: 'Vehicle', icon: '🚗' },
    { key: 'work', label: 'Satys', icon: '🏢' },
    { key: 'timeline', label: 'Timeline', icon: '📅' },
    { key: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="logo-mark">T</div>
          <div>
            <strong>TUK LIFE OS</strong>
            <small>v6 Sprint 6</small>
          </div>
        </div>
        <nav>
          {navItems.map((item) => (
            <button className={active === item.key ? 'nav-active' : ''} key={item.key} onClick={() => setActive(item.key)}>
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="content-shell">{screens[active]}</section>

      <nav className="bottom-nav">
        {navItems.map((item) => (
          <button className={active === item.key ? 'nav-active' : ''} key={item.key} onClick={() => setActive(item.key)}>
            <span>{item.icon}</span>
            <small>{item.label}</small>
          </button>
        ))}
      </nav>
    </main>
  );
}

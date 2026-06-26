import type { ModuleKey } from '../types';
import { VersionBadge } from './VersionBadge';

const nav: Array<{ key: ModuleKey; label: string; icon: string }> = [
  { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { key: 'life', label: 'Life Vault', icon: '🧠' },
  { key: 'timeline', label: 'Timeline', icon: '🕒' },
  { key: 'calendar', label: 'Calendar', icon: '📅' },
  { key: 'health', label: 'Health', icon: '❤️' },
  { key: 'finance', label: 'Finance', icon: '💰' },
  { key: 'vehicle', label: 'Vehicle', icon: '🚗' },
  { key: 'work', label: 'Satys Work', icon: '🏭' },
  { key: 'ai', label: 'AI', icon: '🤖' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

export function AppShell({ active, onChange, children }: { active: ModuleKey; onChange: (key: ModuleKey) => void; children: React.ReactNode }) {
  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandIcon">T</div>
          <div>
            <h1>TUK LIFE OS</h1>
            <p>Personal Operating System</p>
          </div>
        </div>
        <nav className="navList">
          {nav.map((item) => (
            <button key={item.key} className={active === item.key ? 'navItem active' : 'navItem'} onClick={() => onChange(item.key)}>
              <span>{item.icon}</span>
              <b>{item.label}</b>
            </button>
          ))}
        </nav>
      </aside>

      <main className="mainArea">
        <header className="topbar">
          <div>
            <p className="eyebrow">Sprint 8 Full Release</p>
            <h2>ระบบหลักพร้อมต่อ Google Sheets</h2>
          </div>
          <VersionBadge />
        </header>
        {children}
      </main>

      <nav className="bottomNav">
        {nav.slice(0, 5).map((item) => (
          <button key={item.key} className={active === item.key ? 'bottomItem active' : 'bottomItem'} onClick={() => onChange(item.key)}>
            <span>{item.icon}</span>
            <small>{item.label.split(' ')[0]}</small>
          </button>
        ))}
      </nav>
    </div>
  );
}

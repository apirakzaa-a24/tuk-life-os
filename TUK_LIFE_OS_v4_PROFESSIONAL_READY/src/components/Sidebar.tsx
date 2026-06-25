import { modules } from '../data/modules';

type Props = { active: string; onSelect: (key: string) => void };

export default function Sidebar({ active, onSelect }: Props) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">🚀</div>
        <div>
          <h1>TUK LIFE OS</h1>
          <span>v4 Professional</span>
        </div>
      </div>
      <nav className="nav">
        {modules.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.key} className={active === item.key ? 'nav-item active' : 'nav-item'} onClick={() => onSelect(item.key)}>
              <Icon size={18} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

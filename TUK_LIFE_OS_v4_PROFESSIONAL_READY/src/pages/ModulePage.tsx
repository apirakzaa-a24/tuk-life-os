import { modules } from '../data/modules';

type Props = { active: string };
export default function ModulePage({ active }: Props) {
  const mod = modules.find((m) => m.key === active) ?? modules[0];
  const Icon = mod.icon;
  return (
    <main className="content">
      <header className="hero compact">
        <div className="module-icon large"><Icon size={34} /></div>
        <div>
          <p className="eyebrow">TUK LIFE OS Module</p>
          <h2>{mod.name}</h2>
          <p>{mod.desc}</p>
        </div>
      </header>
      <section className="panel">
        <h3>Professional Build Plan</h3>
        <div className="roadmap">
          <div><strong>Phase 1</strong><span>UI + Data Model</span></div>
          <div><strong>Phase 2</strong><span>Database + Sync</span></div>
          <div><strong>Phase 3</strong><span>AI Automation</span></div>
          <div><strong>Phase 4</strong><span>Mobile Release</span></div>
        </div>
      </section>
    </main>
  );
}

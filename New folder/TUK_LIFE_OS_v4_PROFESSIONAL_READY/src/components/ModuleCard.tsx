import type { ComponentType } from 'react';

type Props = { name: string; desc: string; status: string; icon: ComponentType<{ size?: number }> };
export default function ModuleCard({ name, desc, status, icon: Icon }: Props) {
  return (
    <article className="module-card">
      <div className="module-icon"><Icon size={22} /></div>
      <div>
        <h3>{name}</h3>
        <p>{desc}</p>
        <span className="pill">{status}</span>
      </div>
    </article>
  );
}

import type { Metric } from '../types';

export function MetricCard({ metric }: { metric: Metric }) {
  return (
    <div className={`metricCard ${metric.tone ?? 'blue'}`}>
      <div className="metricIcon">{metric.icon}</div>
      <p>{metric.label}</p>
      <h3>{metric.value}</h3>
      <span>{metric.helper}</span>
    </div>
  );
}

export function Panel({ title, icon, children, action }: { title: string; icon?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="panel">
      <div className="panelHead">
        <h3>{icon} {title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

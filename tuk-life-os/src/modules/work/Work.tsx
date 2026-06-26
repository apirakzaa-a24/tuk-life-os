import { Panel } from '../../components/Cards';
import { workItems } from '../../data/mockData';

export function Work() {
  return <Panel title="Satys Work" icon="🏭"><div className="listCards">{workItems.map(w => <div className="listCard" key={w.title}><b>{w.title}</b><span>{w.machine}</span><small>Priority {w.priority} · {w.status}</small></div>)}</div></Panel>;
}

import { Panel } from '../../components/Cards';
import { vehicles } from '../../data/mockData';

export function Vehicle() {
  return <Panel title="Vehicle Database" icon="🚗"><div className="listCards">{vehicles.map(v => <div className="listCard" key={v.name}><b>{v.name}</b><span>{v.costThisMonth}</span><small>{v.nextService}</small></div>)}</div></Panel>;
}

import { Panel } from '../../components/Cards';
import { financeItems } from '../../data/mockData';

export function Finance() {
  return <Panel title="Finance" icon="💰"><div className="listCards">{financeItems.map(item => <div className="listCard" key={item.name}><b>{item.name}</b><span>{item.amount}</span><small>{item.type}</small></div>)}</div></Panel>;
}

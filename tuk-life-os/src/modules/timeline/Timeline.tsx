import { Panel } from '../../components/Cards';
import { timeline } from '../../data/mockData';

export function Timeline() {
  return <Panel title="Timeline" icon="🕒"><div className="timelineList">{timeline.map(item => <article className="timelineItem" key={item.time}><time>{item.time}</time><div><b>{item.title}</b><p>{item.detail}</p></div><span>{item.category}</span></article>)}</div></Panel>;
}

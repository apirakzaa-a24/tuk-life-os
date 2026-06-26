import { Panel } from '../../components/Cards';

export function Calendar() {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  return <Panel title="Calendar" icon="📅"><div className="calendarGrid">{days.map(day => <button key={day} className={day === new Date().getDate() ? 'day active' : 'day'}>{day}</button>)}</div></Panel>;
}

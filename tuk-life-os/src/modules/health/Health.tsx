import { MetricCard, Panel } from '../../components/Cards';
import { todayMetrics } from '../../data/mockData';

export function Health() {
  return <div className="pageStack"><Panel title="Health" icon="❤️"><div className="metricGrid compact">{todayMetrics.filter(m => ['น้ำหนัก','แคลอรี่','ออกกำลังกาย'].includes(m.label)).map(metric => <MetricCard key={metric.label} metric={metric} />)}</div></Panel><Panel title="Health Plan" icon="🏋️"><p className="muted">พร้อมเชื่อม AI Camera เพื่อวิเคราะห์อาหาร และบันทึกแคลอรี่ลง Google Sheets</p></Panel></div>;
}

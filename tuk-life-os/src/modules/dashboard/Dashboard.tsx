import { MetricCard, Panel } from '../../components/Cards';
import { financeItems, googleSheetsTables, quickActions, timeline, todayMetrics, vehicles, workItems } from '../../data/mockData';
import { getGoogleSheetsStatus, saveRecord } from '../../services/googleSheets';
import { todayThai } from '../../utils/format';

export function Dashboard() {
  const sheets = getGoogleSheetsStatus();

  async function quickSave(label: string) {
    await saveRecord('timeline_events', { title: label, source: 'quick_action' });
    alert(`บันทึก ${label} ลง local database แล้ว`);
  }

  return (
    <div className="pageStack">
      <section className="heroPanel">
        <div>
          <p className="eyebrow">Dashboard นี้เป็น Sprint 8 ถ้าเห็นหน้านี้ แปลว่าโค้ดใหม่ถูกติดตั้งแล้ว ✅</p>
          <h1>สวัสดีครับ TUK</h1>
          <p>{todayThai()} · TUK LIFE OS v6.0 Professional</p>
        </div>
        <div className="syncBox">
          <span className={`syncDot ${sheets.status}`}></span>
          <b>Google Sheets Foundation</b>
          <small>{sheets.message}</small>
        </div>
      </section>

      <div className="metricGrid">
        {todayMetrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
      </div>

      <div className="dashboardGrid">
        <Panel title="Quick Actions" icon="⚡">
          <div className="quickGrid">
            {quickActions.map((item) => (
              <button key={item.label} className="quickAction" onClick={() => quickSave(item.label)}>
                <span>{item.icon}</span>
                <b>{item.label}</b>
                <small>{item.desc}</small>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="AI Summary" icon="🤖">
          <div className="aiBox">
            <p>วันนี้ควรโฟกัส 4 เรื่อง: งาน Satys, สุขภาพ, การเงิน และจัดฐานข้อมูล Google Sheets ให้พร้อม Sync</p>
            <ul>
              <li>รถในระบบ: {vehicles.length} คัน</li>
              <li>รายการการเงินตัวอย่าง: {financeItems.length} รายการ</li>
              <li>งาน Satys ที่ต้องติดตาม: {workItems.length} รายการ</li>
            </ul>
          </div>
        </Panel>
      </div>

      <Panel title="Today Timeline" icon="🕒">
        <div className="timelineList">
          {timeline.map((item) => (
            <article key={`${item.time}-${item.title}`} className="timelineItem">
              <time>{item.time}</time>
              <div><b>{item.title}</b><p>{item.detail}</p></div>
              <span>{item.category}</span>
            </article>
          ))}
        </div>
      </Panel>

      <Panel title="Google Sheets Tables Ready" icon="☁️">
        <div className="tableChips">
          {googleSheetsTables.map((table) => <span key={table}>{table}</span>)}
        </div>
      </Panel>
    </div>
  );
}

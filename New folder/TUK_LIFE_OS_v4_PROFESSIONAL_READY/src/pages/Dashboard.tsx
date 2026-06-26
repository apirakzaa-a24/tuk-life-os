import MetricCard from '../components/MetricCard';
import ModuleCard from '../components/ModuleCard';
import { modules, todayTasks } from '../data/modules';

export default function Dashboard() {
  return (
    <main className="content">
      <header className="hero">
        <div>
          <p className="eyebrow">AI Powered Personal Operating System</p>
          <h2>สวัสดี TUK — วันนี้ระบบพร้อมทำงานแล้ว</h2>
          <p>Mobile-first dashboard สำหรับจัดการชีวิต งาน Satys การเงิน สุขภาพ ท่องเที่ยว และ AI Brain ในที่เดียว</p>
        </div>
        <div className="hero-card">
          <span>System Status</span>
          <strong>Operational</strong>
          <small>Ready for Android • iPhone • Web</small>
        </div>
      </header>

      <section className="metrics-grid">
        <MetricCard title="Today Focus" value="5 Tasks" note="งานสำคัญวันนี้" />
        <MetricCard title="Health Mode" value="Active" note="พร้อมบันทึกอาหารและฟิตเนส" />
        <MetricCard title="Finance" value="Track" note="เตรียมระบบรายรับรายจ่าย" />
        <MetricCard title="AI Brain" value="Online" note="พร้อมต่อ API ใน Phase 2" />
      </section>

      <section className="panel two-col">
        <div>
          <h3>Today Command Center</h3>
          <ul className="task-list">
            {todayTasks.map((task) => <li key={task}>{task}</li>)}
          </ul>
        </div>
        <div className="ai-box">
          <h3>AI Brief</h3>
          <p>ระบบนี้ถูกออกแบบให้ต่อกับ Gemini/OpenAI, Google Calendar, Gmail, Drive และฐานข้อมูลส่วนตัวในอนาคต</p>
          <button>Prepare AI Memory</button>
        </div>
      </section>

      <section>
        <div className="section-title">
          <h3>Core Modules</h3>
          <span>{modules.length} modules</span>
        </div>
        <div className="modules-grid">
          {modules.map((m) => <ModuleCard key={m.key} {...m} />)}
        </div>
      </section>
    </main>
  );
}

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Bot,
  CalendarDays,
  Camera,
  Car,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Database,
  FileText,
  HeartPulse,
  Home,
  Mic,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Wallet,
  Wrench,
  X,
} from 'lucide-react';
import './index.css';

type ModuleKey = 'dashboard' | 'timeline' | 'calendar' | 'ai' | 'health' | 'finance' | 'vehicle' | 'work' | 'profile' | 'settings';

type TimelineItem = {
  id: string;
  date: string;
  time: string;
  type: string;
  title: string;
  note?: string;
  amount?: number;
  image?: string;
};

type Vehicle = {
  id: string;
  name: string;
  brand: string;
  model: string;
  year?: string;
  plate?: string;
  nextDue?: string;
  note?: string;
};

type HealthLog = {
  id: string;
  date: string;
  weight?: number;
  calories?: number;
  sugar?: number;
  fat?: number;
  protein?: number;
  note?: string;
};

type FinanceItem = {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  title: string;
  amount: number;
  note?: string;
};

type AppData = {
  profile: {
    name: string;
    nickname: string;
    company: string;
    email: string;
    phone: string;
    address: string;
    avatar?: string;
  };
  timeline: TimelineItem[];
  vehicles: Vehicle[];
  health: HealthLog[];
  finance: FinanceItem[];
  settings: {
    googleSheetUrl: string;
    googleDriveFolder: string;
    imageQuality: number;
    syncStatus: string;
    darkMode: boolean;
  };
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);
const uid = (prefix = 'ID') => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;

const defaultData: AppData = {
  profile: {
    name: 'Apirak Mueanmanas',
    nickname: 'TUK',
    company: 'Satys Electric Thailand',
    email: 'apirakzaa@gmail.com',
    phone: '',
    address: '',
  },
  vehicles: [
    { id: 'VEH-001', name: 'BYD Seal 7', brand: 'BYD', model: 'Seal 7', year: '2025', note: 'Black EV' },
    { id: 'VEH-002', name: 'Honda City', brand: 'Honda', model: 'City', year: '2010', note: 'Daily / backup car' },
  ],
  health: [
    { id: 'HLT-001', date: todayISO(), weight: 62.2, calories: 0, note: 'Latest starting value' },
  ],
  finance: [
    { id: 'FIN-001', date: todayISO(), type: 'income', category: 'Salary', title: 'Monthly income', amount: 81000 },
  ],
  timeline: [
    { id: 'TIM-001', date: todayISO(), time: '08:00', type: 'work', title: 'Satys Work', note: 'Review daily dashboard and PM tasks' },
    { id: 'TIM-002', date: todayISO(), time: '21:00', type: 'health', title: 'Workout', note: 'Gym / cardio / English after workout' },
  ],
  settings: {
    googleSheetUrl: '',
    googleDriveFolder: '',
    imageQuality: 0.72,
    syncStatus: 'Local only',
    darkMode: true,
  },
};

function loadData(): AppData {
  try {
    const raw = localStorage.getItem('tuk-life-os-v6');
    if (!raw) return defaultData;
    return { ...defaultData, ...JSON.parse(raw) };
  } catch {
    return defaultData;
  }
}

function saveData(data: AppData) {
  localStorage.setItem('tuk-life-os-v6', JSON.stringify(data));
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <p className="muted">{label}</p>
        <h3>{value}</h3>
        {sub && <small>{sub}</small>}
      </div>
    </div>
  );
}

function Section({ title, icon, children, action }: { title: string; icon?: React.ReactNode; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="panel">
      <div className="section-head">
        <div className="section-title">{icon}{title}</div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="empty"><Sparkles size={18} /><b>{title}</b><span>{text}</span></div>;
}

function App() {
  const [active, setActive] = useState<ModuleKey>('dashboard');
  const [data, setData] = useState<AppData>(loadData);
  const [query, setQuery] = useState('');
  const [quickOpen, setQuickOpen] = useState(false);

  useEffect(() => saveData(data), [data]);
  useEffect(() => {
    document.documentElement.dataset.theme = data.settings.darkMode ? 'dark' : 'light';
  }, [data.settings.darkMode]);

  const totalIncome = useMemo(() => data.finance.filter(x => x.type === 'income').reduce((s, x) => s + x.amount, 0), [data.finance]);
  const totalExpense = useMemo(() => data.finance.filter(x => x.type === 'expense').reduce((s, x) => s + x.amount, 0), [data.finance]);
  const latestWeight = data.health.slice().sort((a, b) => b.date.localeCompare(a.date))[0]?.weight;
  const todayTimeline = data.timeline.filter(x => x.date === todayISO()).sort((a, b) => a.time.localeCompare(b.time));

  const addTimeline = (item: Partial<TimelineItem>) => {
    const next: TimelineItem = {
      id: uid('TIM'),
      date: item.date || todayISO(),
      time: item.time || nowTime(),
      type: item.type || 'note',
      title: item.title || 'New item',
      note: item.note || '',
      amount: item.amount,
      image: item.image,
    };
    setData(prev => ({ ...prev, timeline: [next, ...prev.timeline] }));
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `tuk-life-os-backup-${todayISO()}.json`;
    a.click();
  };

  const importBackup = async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text);
    setData({ ...defaultData, ...parsed });
  };

  const nav = [
    ['dashboard', Home, 'Home'], ['timeline', CalendarDays, 'Timeline'], ['ai', Bot, 'AI'], ['health', HeartPulse, 'Health'], ['finance', Wallet, 'Finance'], ['vehicle', Car, 'Vehicle'], ['work', Wrench, 'Satys'], ['profile', ShieldCheck, 'Profile'], ['settings', Settings, 'Settings'],
  ] as const;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="logo">T</div><div><b>TUK LIFE OS</b><small>v6.0 Professional</small></div></div>
        <nav>
          {nav.map(([key, Icon, label]) => <button key={key} className={active === key ? 'active' : ''} onClick={() => setActive(key)}><Icon size={19} />{label}</button>)}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="muted">Good {new Date().getHours() < 18 ? 'Day' : 'Evening'}, {data.profile.nickname}</p>
            <h1>{active === 'dashboard' ? 'Personal Operating System' : nav.find(([k]) => k === active)?.[2]}</h1>
          </div>
          <div className="searchbox"><Search size={18} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ask AI or search BYD, expense, food, Satys..." /></div>
        </header>

        {active === 'dashboard' && <Dashboard data={data} totalIncome={totalIncome} totalExpense={totalExpense} latestWeight={latestWeight} todayTimeline={todayTimeline} setActive={setActive} />}
        {active === 'timeline' && <Timeline data={data} setData={setData} addTimeline={addTimeline} />}
        {active === 'calendar' && <CalendarPage data={data} />}
        {active === 'ai' && <AIPage data={data} setData={setData} addTimeline={addTimeline} />}
        {active === 'health' && <HealthPage data={data} setData={setData} addTimeline={addTimeline} />}
        {active === 'finance' && <FinancePage data={data} setData={setData} addTimeline={addTimeline} />}
        {active === 'vehicle' && <VehiclePage data={data} setData={setData} addTimeline={addTimeline} />}
        {active === 'work' && <WorkPage addTimeline={addTimeline} data={data} />}
        {active === 'profile' && <ProfilePage data={data} setData={setData} />}
        {active === 'settings' && <SettingsPage data={data} setData={setData} exportBackup={exportBackup} importBackup={importBackup} />}
      </main>

      <button className="fab" onClick={() => setQuickOpen(true)}><Plus /></button>
      {quickOpen && <QuickAdd close={() => setQuickOpen(false)} addTimeline={addTimeline} setActive={setActive} />}

      <nav className="bottom-nav">
        {(['dashboard', 'timeline', 'ai', 'health', 'settings'] as ModuleKey[]).map(k => {
          const item = nav.find(([key]) => key === k)!;
          const Icon = item[1];
          return <button key={k} className={active === k ? 'active' : ''} onClick={() => setActive(k)}><Icon size={20} /><span>{item[2]}</span></button>;
        })}
      </nav>
    </div>
  );
}

function Dashboard({ data, totalIncome, totalExpense, latestWeight, todayTimeline, setActive }: any) {
  return <div className="grid-page">
    <section className="hero-card">
      <div><p className="pill">AI DAILY BRIEF</p><h2>วันนี้โฟกัสงานสำคัญ สุขภาพ และฐานข้อมูลชีวิต</h2><p>Dashboard นี้จะเป็นศูนย์กลางของ Health, Finance, Vehicle, Satys Work, Timeline และ Google Sheets.</p></div>
      <button onClick={() => setActive('ai')}>Open AI <ChevronRight size={16}/></button>
    </section>
    <div className="stats-grid">
      <StatCard icon={<HeartPulse/>} label="Weight" value={latestWeight ? `${latestWeight} kg` : '-'} sub="latest log" />
      <StatCard icon={<Wallet/>} label="Balance" value={`${(totalIncome - totalExpense).toLocaleString()} ฿`} sub="local database" />
      <StatCard icon={<Car/>} label="Vehicles" value={`${data.vehicles.length}`} sub="cars in vault" />
      <StatCard icon={<CalendarDays/>} label="Today" value={`${todayTimeline.length}`} sub="timeline items" />
    </div>
    <div className="two-col">
      <Section title="Today Timeline" icon={<CalendarDays/>}>{todayTimeline.length ? todayTimeline.map((x: TimelineItem) => <div className="row" key={x.id}><span className="time">{x.time}</span><div><b>{x.title}</b><small>{x.note}</small></div></div>) : <EmptyState title="No timeline" text="Add first item from + button" />}</Section>
      <Section title="Quick Actions" icon={<Sparkles/>}><div className="quick-grid"><button onClick={() => setActive('health')}>Add Weight</button><button onClick={() => setActive('finance')}>Add Expense</button><button onClick={() => setActive('vehicle')}>Add Vehicle</button><button onClick={() => setActive('ai')}>AI Camera</button></div></Section>
    </div>
  </div>;
}

function Timeline({ data, setData, addTimeline }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; addTimeline: any }) {
  const [title, setTitle] = useState('');
  const remove = (id: string) => setData(p => ({ ...p, timeline: p.timeline.filter(x => x.id !== id) }));
  return <div className="grid-page"><Section title="Add Timeline" icon={<Plus/>}><div className="form-row"><input value={title} onChange={e => setTitle(e.target.value)} placeholder="เช่น กินข้าว, PM Machine, เติมไฟรถ"/><button onClick={() => { addTimeline({ title, type: 'manual' }); setTitle(''); }}>Save</button></div></Section><Section title="All Timeline" icon={<CalendarDays/>}>{data.timeline.map(x => <div className="row timeline-row" key={x.id}><span className="time">{x.date}<br/>{x.time}</span>{x.image && <img src={x.image} /> }<div><b>{x.title}</b><small>{x.note || x.type}</small></div><button className="icon-btn" onClick={() => remove(x.id)}><Trash2 size={16}/></button></div>)}</Section></div>;
}

function CalendarPage({ data }: { data: AppData }) {
  const grouped = data.timeline.reduce((acc, item) => { acc[item.date] = (acc[item.date] || 0) + 1; return acc; }, {} as Record<string, number>);
  return <Section title="Life Calendar" icon={<CalendarDays/>}><div className="calendar-grid">{Array.from({ length: 30 }).map((_, i) => { const d = new Date(); d.setDate(d.getDate() - 14 + i); const key = d.toISOString().slice(0,10); return <div className="day" key={key}><b>{d.getDate()}</b><small>{key.slice(5)}</small>{grouped[key] && <span>{grouped[key]} items</span>}</div>; })}</div></Section>;
}

function AIPage({ data, setData, addTimeline }: { data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; addTimeline: any }) {
  const [answer, setAnswer] = useState('ถามผมได้ เช่น “ฉันมีรถกี่คัน”, “วันนี้กินอะไร”, “สรุปการเงิน”');
  const fileRef = useRef<HTMLInputElement>(null);
  const ask = (q: string) => {
    const lower = q.toLowerCase();
    if (lower.includes('รถ')) setAnswer(`คุณมีรถ ${data.vehicles.length} คัน: ${data.vehicles.map(v => v.name).join(', ')}`);
    else if (lower.includes('เงิน') || lower.includes('expense')) setAnswer(`มีรายการการเงิน ${data.finance.length} รายการ รายรับ/รายจ่ายจะเชื่อม Google Sheets ใน Sprint ถัดไป`);
    else if (lower.includes('น้ำหนัก')) setAnswer(`น้ำหนักล่าสุด ${data.health[0]?.weight || '-'} kg`);
    else setAnswer('AI Local Mode: ผมจะอ่านจากฐานข้อมูลในเครื่องก่อน และต่อไปจะเชื่อม Google Sheets + AI Vision');
  };
  const onImage = async (file: File) => {
    const compressed = await compressImage(file, data.settings.imageQuality);
    addTimeline({ title: 'AI Camera Capture', type: 'media', note: 'รูปถูกบีบอัดแล้วเพื่อประหยัดพื้นที่ Google Drive', image: compressed });
    setAnswer('บันทึกรูปลง Timeline แล้ว ต่อไปจะเพิ่ม OCR วิเคราะห์อาหาร/บิลและ Sync Google Drive');
  };
  return <div className="grid-page"><Section title="AI Assistant" icon={<Bot/>}><div className="ai-box"><p>{answer}</p><div className="form-row"><input placeholder="พิมพ์คำถามถึง AI" onKeyDown={e => { if (e.key === 'Enter') ask((e.target as HTMLInputElement).value); }} /><button onClick={() => ask('ฉันมีรถกี่คัน')}>Ask</button></div><div className="quick-grid"><button onClick={() => fileRef.current?.click()}><Camera size={16}/> AI Camera</button><button onClick={() => setAnswer('Voice AI พร้อมวางโครงสร้างแล้ว ต้องเปิดสิทธิ์ไมค์บน HTTPS/PWA') }><Mic size={16}/> Voice</button><button><ReceiptText size={16}/> Receipt</button></div><input ref={fileRef} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && onImage(e.target.files[0])} /></div></Section></div>;
}

function HealthPage({ data, setData, addTimeline }: any) {
  const [weight, setWeight] = useState('');
  const add = () => { const item = { id: uid('HLT'), date: todayISO(), weight: Number(weight), calories: 0, note: 'Manual log' }; setData((p: AppData) => ({ ...p, health: [item, ...p.health] })); addTimeline({ title: `Weight ${weight} kg`, type: 'health' }); setWeight(''); };
  return <div className="grid-page"><Section title="Health Log" icon={<HeartPulse/>}><div className="form-row"><input value={weight} onChange={e => setWeight(e.target.value)} placeholder="น้ำหนัก kg"/><button onClick={add}>Save</button></div>{data.health.map((h: HealthLog) => <div className="row" key={h.id}><b>{h.date}</b><span>{h.weight || '-'} kg</span><small>{h.note}</small></div>)}</Section></div>;
}

function FinancePage({ data, setData, addTimeline }: any) {
  const [title, setTitle] = useState(''); const [amount, setAmount] = useState('');
  const add = (type: 'income'|'expense') => { const item = { id: uid('FIN'), date: todayISO(), type, category: type, title, amount: Number(amount), note: '' }; setData((p: AppData) => ({ ...p, finance: [item, ...p.finance] })); addTimeline({ title: `${type}: ${title}`, type: 'finance', amount: Number(amount) }); setTitle(''); setAmount(''); };
  return <div className="grid-page"><Section title="Finance" icon={<Wallet/>}><div className="form-row"><input value={title} onChange={e => setTitle(e.target.value)} placeholder="รายการ เช่น 7-Eleven"/><input value={amount} onChange={e => setAmount(e.target.value)} placeholder="จำนวนเงิน"/><button onClick={() => add('expense')}>Expense</button><button onClick={() => add('income')}>Income</button></div>{data.finance.map((f: FinanceItem) => <div className="row" key={f.id}><b>{f.title}</b><span>{f.amount.toLocaleString()} ฿</span><small>{f.type} · {f.date}</small></div>)}</Section></div>;
}

function VehiclePage({ data, setData, addTimeline }: any) {
  const [name, setName] = useState('');
  const add = () => { const item = { id: uid('VEH'), name, brand: '', model: '', note: '' }; setData((p: AppData) => ({ ...p, vehicles: [item, ...p.vehicles] })); addTimeline({ title: `Add vehicle: ${name}`, type: 'vehicle' }); setName(''); };
  return <div className="grid-page"><Section title="Vehicles" icon={<Car/>}><div className="form-row"><input value={name} onChange={e => setName(e.target.value)} placeholder="เพิ่มรถ เช่น BYD Seal 7"/><button onClick={add}>Add</button></div>{data.vehicles.map((v: Vehicle) => <div className="vehicle-card" key={v.id}><Car/><div><b>{v.name}</b><small>{v.brand} {v.model} {v.year}</small><p>{v.note}</p></div></div>)}</Section></div>;
}

function WorkPage({ addTimeline }: any) {
  return <div className="grid-page"><Section title="Satys Work Center" icon={<Wrench/>}><div className="quick-grid"><button onClick={() => addTimeline({ title: 'PM Machine', type: 'work' })}>PM Machine</button><button onClick={() => addTimeline({ title: 'Supplier Follow-up', type: 'work' })}>Supplier</button><button onClick={() => addTimeline({ title: 'PO Review', type: 'work' })}>PO</button><button onClick={() => addTimeline({ title: 'Machine Issue', type: 'work' })}>BM/Repair</button></div></Section></div>;
}

function ProfilePage({ data, setData }: any) {
  const p = data.profile;
  const update = (k: string, v: string) => setData((d: AppData) => ({ ...d, profile: { ...d.profile, [k]: v } }));
  return <div className="grid-page"><Section title="Life Profile" icon={<ShieldCheck/>}><div className="profile-card"><div className="avatar">{p.nickname.slice(0,1)}</div><div className="form-stack"><input value={p.name} onChange={e => update('name', e.target.value)} /><input value={p.nickname} onChange={e => update('nickname', e.target.value)} /><input value={p.company} onChange={e => update('company', e.target.value)} /><input value={p.email} onChange={e => update('email', e.target.value)} /><textarea value={p.address} onChange={e => update('address', e.target.value)} placeholder="ที่อยู่ / Life Database" /></div></div></Section></div>;
}

function SettingsPage({ data, setData, exportBackup, importBackup }: any) {
  return <div className="grid-page"><Section title="Settings & Cloud" icon={<Settings/>}><div className="settings-list"><label>Google Sheet URL<input value={data.settings.googleSheetUrl} onChange={e => setData((p: AppData) => ({...p, settings:{...p.settings, googleSheetUrl:e.target.value}}))} placeholder="Paste Apps Script / Sheet URL" /></label><label>Google Drive Folder<input value={data.settings.googleDriveFolder} onChange={e => setData((p: AppData) => ({...p, settings:{...p.settings, googleDriveFolder:e.target.value}}))} placeholder="Drive folder link" /></label><label>Image Quality<input type="range" min="0.35" max="0.9" step="0.05" value={data.settings.imageQuality} onChange={e => setData((p: AppData) => ({...p, settings:{...p.settings, imageQuality:Number(e.target.value)}}))}/></label><button onClick={() => setData((p: AppData) => ({...p, settings:{...p.settings, darkMode:!p.settings.darkMode}}))}>Toggle Theme</button><button onClick={exportBackup}><Cloud size={16}/> Export Backup</button><label className="upload-btn"><Upload size={16}/> Import Backup<input type="file" hidden accept="application/json" onChange={e => e.target.files?.[0] && importBackup(e.target.files[0])}/></label></div></Section></div>;
}

function QuickAdd({ close, addTimeline, setActive }: any) {
  return <div className="modal-backdrop"><div className="modal"><button className="close" onClick={close}><X/></button><h2>Quick Add</h2><div className="quick-grid"><button onClick={() => { addTimeline({ title: 'New Note', type: 'note' }); close(); }}>Timeline</button><button onClick={() => { setActive('finance'); close(); }}>Expense</button><button onClick={() => { setActive('health'); close(); }}>Health</button><button onClick={() => { setActive('ai'); close(); }}>AI Camera</button></div></div></div>;
}

async function compressImage(file: File, quality = 0.72): Promise<string> {
  const img = new Image();
  const reader = new FileReader();
  const dataUrl = await new Promise<string>((resolve) => { reader.onload = () => resolve(reader.result as string); reader.readAsDataURL(file); });
  img.src = dataUrl;
  await new Promise(resolve => { img.onload = resolve; });
  const max = 1600;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}

export default App;

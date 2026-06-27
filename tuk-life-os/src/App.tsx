import React, { useEffect, useMemo, useRef, useState } from 'react';
import { exportAll, importAll, readStore, writeStore } from './utils/storage';
import { localAiAnswer } from './services/ai';
import { syncToGoogleSheets } from './services/googleSheets';
import { createDriveNote } from './services/googleDrive';

type Page = 'dashboard'|'life'|'timeline'|'calendar'|'ai'|'camera'|'voice'|'health'|'finance'|'vehicles'|'work'|'drive'|'settings';
type Item = { id: string; title: string; note?: string; amount?: number; category?: string; date: string; image?: string; status?: string };

const VERSION = '1.0.0 Professional';
const BUILD = '2026.06.27';
const nav: {key: Page; label: string; icon: string}[] = [
  {key:'dashboard',label:'Dashboard',icon:'🏠'}, {key:'life',label:'Life Vault',icon:'🧠'}, {key:'timeline',label:'Timeline',icon:'🕒'},
  {key:'calendar',label:'Calendar',icon:'📅'}, {key:'ai',label:'AI Assistant',icon:'🤖'}, {key:'camera',label:'Camera AI',icon:'📷'},
  {key:'voice',label:'Voice AI',icon:'🎙️'}, {key:'health',label:'Health',icon:'❤️'}, {key:'finance',label:'Finance',icon:'💰'},
  {key:'vehicles',label:'Vehicles',icon:'🚗'}, {key:'work',label:'Satys Work',icon:'🏭'}, {key:'drive',label:'Drive/Backup',icon:'☁️'}, {key:'settings',label:'Settings',icon:'⚙️'},
];

const seedVehicles: Item[] = [
  {id:'v1', title:'BYD Seal 7', note:'EV / Insurance / PM / Tax', date:new Date().toISOString(), status:'Active'},
  {id:'v2', title:'Honda City 2010', note:'Maintenance / Fuel / Insurance', date:new Date().toISOString(), status:'Active'},
];

function uid(){ return Math.random().toString(36).slice(2,10); }
function today(){ return new Date().toLocaleDateString('th-TH', { day:'2-digit', month:'long', year:'numeric' }); }

function useData() {
  const [timeline,setTimeline] = useState<Item[]>(() => readStore('timeline', []));
  const [health,setHealth] = useState<Item[]>(() => readStore('health', []));
  const [finance,setFinance] = useState<Item[]>(() => readStore('finance', [{id:'f1', title:'ค่าใช้จ่ายวันนี้', amount:549, category:'Daily', date:new Date().toISOString()}]));
  const [vehicles,setVehicles] = useState<Item[]>(() => readStore('vehicles', seedVehicles));
  const [work,setWork] = useState<Item[]>(() => readStore('work', [{id:'w1', title:'Satys PM / BM', note:'Machine, spare part, supplier, projects', date:new Date().toISOString(), status:'Open'}]));
  const [lifeVault,setLifeVault] = useState<Item[]>(() => readStore('lifeVault', []));
  const [calendar,setCalendar] = useState<Item[]>(() => readStore('calendar', []));
  const [settings,setSettings] = useState<any>(() => readStore('settings', { name:'TUK', targetWeight:59, googleSheetsUrl:'', mobileMode:true, notifications:true }));
  useEffect(()=>writeStore('timeline', timeline),[timeline]);
  useEffect(()=>writeStore('health', health),[health]);
  useEffect(()=>writeStore('finance', finance),[finance]);
  useEffect(()=>writeStore('vehicles', vehicles),[vehicles]);
  useEffect(()=>writeStore('work', work),[work]);
  useEffect(()=>writeStore('lifeVault', lifeVault),[lifeVault]);
  useEffect(()=>writeStore('calendar', calendar),[calendar]);
  useEffect(()=>writeStore('settings', settings),[settings]);
  return {timeline,setTimeline,health,setHealth,finance,setFinance,vehicles,setVehicles,work,setWork,lifeVault,setLifeVault,calendar,setCalendar,settings,setSettings};
}

function Sidebar({page,setPage}:{page:Page; setPage:(p:Page)=>void}){
  return <aside className="sidebar"><div className="brand"><div className="logo">T</div><div><b>TUK LIFE OS</b><small>Personal Operating System</small></div></div><nav>{nav.map(n=><button key={n.key} onClick={()=>setPage(n.key)} className={page===n.key?'active':''}><span>{n.icon}</span>{n.label}</button>)}</nav></aside>
}
function VersionBadge(){ return <div className="version"><b>TUK LIFE OS Professional</b><span>Version {VERSION}</span><span>Full Release v1</span><span>Build {BUILD}</span></div> }
function Card({children, className=''}:{children:React.ReactNode; className?:string}){ return <section className={'card '+className}>{children}</section> }
function Stat({icon,label,value}:{icon:string;label:string;value:string|number}){ return <div className="stat"><span>{icon}</span><small>{label}</small><b>{value}</b></div> }
function TextInput({placeholder,onAdd}:{placeholder:string;onAdd:(v:string)=>void}){ const [v,setV]=useState(''); return <div className="inputRow"><input value={v} onChange={e=>setV(e.target.value)} placeholder={placeholder}/><button onClick={()=>{if(v.trim()){onAdd(v);setV('')}}}>เพิ่ม</button></div> }
function List({items}:{items:Item[]}){ return <div className="list">{items.length?items.slice(0,8).map(i=><div className="listItem" key={i.id}><div><b>{i.title}</b><small>{i.note || i.category || new Date(i.date).toLocaleString('th-TH')}</small></div>{i.amount!=null&&<strong>{i.amount} บาท</strong>}</div>):<p className="muted">ยังไม่มีข้อมูล</p>}</div> }

function Dashboard({data,setPage}:{data:any; setPage:(p:Page)=>void}){
  const totalExpense = data.finance.reduce((s:number,i:Item)=>s+(Number(i.amount)||0),0);
  return <>
    <header className="top"><div><h1>สวัสดีครับ {data.settings.name}</h1><p>Dashboard นี้เป็น TUK LIFE OS v1.0 Full Mobile Ready ถ้าเห็นหน้านี้ แปลว่าโค้ดใหม่ติดตั้งสำเร็จ ✅</p></div><VersionBadge/></header>
    <Card className="hero"><span className="pill">FULL RELEASE v1</span><h2>TUK LIFE OS Professional</h2><p>ระบบชีวิตส่วนตัวบนมือถือและคอม: AI, Camera, Voice, Google Sheets, Drive, Health, Finance, Vehicle, Satys Work, Timeline และ PWA ในโปรเจกต์เดียว</p><button onClick={()=>setPage('timeline')}>Quick Add</button></Card>
    <div className="quickGrid"><button onClick={()=>setPage('health')}>บันทึกสุขภาพ</button><button onClick={()=>setPage('camera')}>สแกนอาหาร/บิล</button><button onClick={()=>setPage('finance')}>เพิ่มค่าใช้จ่าย</button><button onClick={()=>setPage('vehicles')}>เพิ่มรถ</button><button onClick={()=>setPage('work')}>เพิ่มงาน Satys</button><button onClick={()=>setPage('ai')}>AI ถามข้อมูล</button></div>
    <div className="stats"><Stat icon="❤️" label="Health" value={`${data.settings.targetWeight} kg goal`}/><Stat icon="💰" label="Finance" value={`${totalExpense} บาท`}/><Stat icon="🚗" label="Vehicles" value={data.vehicles.length}/><Stat icon="🏭" label="Satys Work" value={data.work.length}/></div>
    <div className="grid2"><Card><h3>Timeline ล่าสุด</h3><List items={data.timeline}/></Card><Card><h3>AI Summary</h3><p>วันนี้มี Finance {data.finance.length} รายการ, Health {data.health.length} รายการ, รถ {data.vehicles.length} คัน และงาน Satys {data.work.length} รายการ</p></Card></div>
  </>
}
function SimplePage({title,desc,items,onAdd}:{title:string;desc:string;items:Item[];onAdd:(v:string)=>void}){ return <><Header title={title} desc={desc}/><Card><TextInput placeholder={`เพิ่ม ${title}`} onAdd={onAdd}/><List items={items}/></Card></> }
function Header({title,desc}:{title:string;desc:string}){ return <header className="top"><div><h1>{title}</h1><p>{desc}</p></div><VersionBadge/></header> }

function CameraPage({data}:{data:any}){
  const [img,setImg]=useState('');
  const fileRef=useRef<HTMLInputElement>(null);
  function onFile(e:React.ChangeEvent<HTMLInputElement>){ const f=e.target.files?.[0]; if(!f)return; const r=new FileReader(); r.onload=()=>setImg(String(r.result)); r.readAsDataURL(f); }
  return <><Header title="Camera AI" desc="ถ่าย/อัปโหลดรูปอาหาร ใบเสร็จ หรือเครื่องจักร แล้วบันทึกเข้า Life OS"/><Card><input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile}/>{img&&<img className="preview" src={img}/>}<p className="muted">ระบบนี้บันทึกรูปในเครื่องก่อน ขั้นต่อไปสามารถเชื่อม AI Vision จริงและ Google Drive ได้</p></Card></>
}
function VoicePage(){ const [text,setText]=useState(''); function start(){ const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition; if(!SR){setText('เครื่องนี้ยังไม่รองรับ Speech Recognition');return} const r=new SR(); r.lang='th-TH'; r.onresult=(e:any)=>setText(e.results[0][0].transcript); r.start(); } return <><Header title="Voice AI" desc="พูดเพื่อบันทึก หรือสั่งงานระบบ"/><Card><button onClick={start}>เริ่มพูด</button><h3>{text||'ยังไม่มีเสียง'}</h3></Card></> }
function AiPage({data}:{data:any}){ const [q,setQ]=useState(''); const [ans,setAns]=useState(''); return <><Header title="AI Assistant" desc="AI Local ตอบจากข้อมูลใน TUK LIFE OS"/><Card><div className="inputRow"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="ถาม เช่น วันนี้ใช้เงินเท่าไหร่"/><button onClick={()=>setAns(localAiAnswer(q,data))}>ถาม AI</button></div><div className="answer">{ans||'พร้อมตอบคำถามจากข้อมูลของคุณ'}</div></Card></> }
function DrivePage({data}:{data:any}){ const [msg,setMsg]=useState(''); async function sync(){ const res=await syncToGoogleSheets(data.settings.googleSheetsUrl, exportAll()); setMsg(res.message); } function backup(){ createDriveNote(`TUK_LIFE_OS_BACKUP_${Date.now()}.json`, JSON.stringify(exportAll(),null,2)); } return <><Header title="Google Sheets / Drive / Backup" desc="ซิงก์ฐานข้อมูลหลักและสำรองข้อมูล"/><Card><button onClick={sync}>Sync Google Sheets</button><button onClick={backup}>Export Backup File</button><p>{msg}</p></Card></> }
function SettingsPage({data}:{data:any}){ const [raw,setRaw]=useState(''); return <><Header title="Settings" desc="ตั้งค่าระบบ ชื่อ เป้าหมาย และ Google Sheets"/><Card><label>ชื่อ</label><input value={data.settings.name} onChange={e=>data.setSettings({...data.settings,name:e.target.value})}/><label>เป้าหมายน้ำหนัก</label><input value={data.settings.targetWeight} onChange={e=>data.setSettings({...data.settings,targetWeight:e.target.value})}/><label>Google Apps Script Web App URL</label><input value={data.settings.googleSheetsUrl} onChange={e=>data.setSettings({...data.settings,googleSheetsUrl:e.target.value})}/><textarea placeholder="วาง JSON backup เพื่อ import" value={raw} onChange={e=>setRaw(e.target.value)} /><button onClick={()=>{try{importAll(JSON.parse(raw));location.reload()}catch{alert('JSON ไม่ถูกต้อง')}}}>Import Backup</button></Card></> }

export default function App(){
  const data=useData(); const [page,setPage]=useState<Page>('dashboard');
  const add = (setter:any, arr:Item[], title:string, extra={}) => setter([{id:uid(), title, date:new Date().toISOString(), ...extra}, ...arr]);
  const content = useMemo(()=>{
    switch(page){
      case 'dashboard': return <Dashboard data={data} setPage={setPage}/>;
      case 'life': return <SimplePage title="Life Vault" desc="ข้อมูลชีวิต เป้าหมาย เอกสาร ความทรงจำ" items={data.lifeVault} onAdd={(v)=>add(data.setLifeVault,data.lifeVault,v)}/>;
      case 'timeline': return <SimplePage title="Timeline" desc="บันทึกเหตุการณ์รายวัน" items={data.timeline} onAdd={(v)=>add(data.setTimeline,data.timeline,v)}/>;
      case 'calendar': return <SimplePage title="Calendar" desc="ตารางนัดหมายและกิจกรรม" items={data.calendar} onAdd={(v)=>add(data.setCalendar,data.calendar,v)}/>;
      case 'health': return <SimplePage title="Health" desc="น้ำหนัก อาหาร แคลอรี่ ออกกำลังกาย นอน" items={data.health} onAdd={(v)=>add(data.setHealth,data.health,v)}/>;
      case 'finance': return <SimplePage title="Finance" desc="รายรับ รายจ่าย หนี้ งบประมาณ ลงทุน" items={data.finance} onAdd={(v)=>add(data.setFinance,data.finance,v,{amount:Number(prompt('จำนวนเงินกี่บาท?')||0),category:'Manual'})}/>;
      case 'vehicles': return <SimplePage title="Vehicles" desc="BYD Seal 7 / Honda City / PM / Tax / Insurance" items={data.vehicles} onAdd={(v)=>add(data.setVehicles,data.vehicles,v)}/>;
      case 'work': return <SimplePage title="Satys Work" desc="PM BM Machine Spare Part Supplier Project" items={data.work} onAdd={(v)=>add(data.setWork,data.work,v)}/>;
      case 'ai': return <AiPage data={data}/>;
      case 'camera': return <CameraPage data={data}/>;
      case 'voice': return <VoicePage/>;
      case 'drive': return <DrivePage data={data}/>;
      case 'settings': return <SettingsPage data={data}/>;
    }
  },[page,data]);
  return <div className="app"><Sidebar page={page} setPage={setPage}/><main>{content}</main><div className="bottomNav">{nav.slice(0,6).map(n=><button key={n.key} className={page===n.key?'active':''} onClick={()=>setPage(n.key)}><span>{n.icon}</span><small>{n.label.split(' ')[0]}</small></button>)}</div></div>
}

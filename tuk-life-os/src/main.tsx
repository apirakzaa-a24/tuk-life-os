import React,{useMemo,useState} from 'react';
import { createRoot } from 'react-dom/client';
import { AppDataProvider, useAppData } from './context/AppDataProvider';
import { MODULES, MODULE_MAP } from './data/modules';
import type { LifeRecord, ModuleKey, Priority, RecordKind, Status } from './types/database';
import AIAssistant from './AIAssistant';
import type { AIEntry } from './aiTypes';
import { getSavedLang, humanLabel, kindLabel, moduleLabel, modulePurpose, priorityLabel, saveLang, statusLabel, type Lang, ui } from './i18n';
import './style.css';
import './aiStyles.css';

const pageModules=MODULES;
const now=()=>new Date().toISOString();
const today=()=>new Date().toISOString().slice(0,10);

function subLinks(module:ModuleKey, subModule:string){
  return (MODULE_MAP[module]?.subModules.find(s=>s.key===subModule)?.linksTo||[]).map(m=>({module:m,note:'auto linked by sub-module'}));
}
function blank(module:ModuleKey):LifeRecord{
  const first=MODULE_MAP[module]?.subModules[0]?.key||'general';
  return {id:crypto.randomUUID(),module,subModule:first,kind:'log',title:'',detail:'',date:today(),currency:'THB',priority:'medium',status:'active',tags:[],fields:{},progress:0,linkedTo:subLinks(module,first),createdAt:now(),updatedAt:now()};
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="field"><span>{label}</span>{children}</label>}
function Stat({label,value,sub}:{label:string;value:string|number;sub?:string}){return <div className="stat"><b>{value}</b><span>{label}</span>{sub&&<small>{sub}</small>}</div>}
function LanguageSwitch({lang,setLang}:{lang:Lang;setLang:(lang:Lang)=>void}){
  const t=ui(lang);
  const change=(next:Lang)=>{setLang(next); saveLang(next);};
  return <div className="languageSwitch" title={t.language}>
    <button className={lang==='th'?'active':''} onClick={()=>change('th')}>TH</button>
    <button className={lang==='en'?'active':''} onClick={()=>change('en')}>EN</button>
  </div>;
}

function Dashboard({lang}:{lang:Lang}){
  const t=ui(lang);
  const {summary,records,db}=useAppData();
  const latest=records.slice().sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,8);
  const moduleCounts=pageModules.map(m=>({m,count:records.filter(r=>r.module===m.key).length,sub:m.subModules.length}));
  return <div className="space">
    <section className="hero"><div><div className="eyebrow">{t.localFirst}</div><h1>TUK OS v5.1</h1><p>{t.dashboardIntro}</p></div><div className="heroCard"><b>{db.version}</b><span>{t.singleSource}</span><small>{t.updated}: {new Date(db.profile.updatedAt).toLocaleString(lang==='th'?'th-TH':'en-US')}</small></div></section>
    <div className="stats"><Stat label={t.totalRecords} value={summary.total}/><Stat label={t.active} value={summary.active}/><Stat label={t.waiting} value={summary.waiting}/><Stat label={t.done} value={summary.done}/><Stat label={t.financeNet} value={`${summary.financeNet.toLocaleString()} THB`}/><Stat label={t.healthFitness} value={summary.healthMetrics}/><Stat label={t.travelPlans} value={summary.travelPlans}/><Stat label={t.vehicleItems} value={summary.vehicleItems}/></div>
    <div className="two"><div className="card"><h2>{t.mainAndSub}</h2><div className="moduleGrid">{moduleCounts.map(({m,count,sub})=><div className="moduleMini" key={m.key}><div><b>{m.icon} {moduleLabel(m.key,m.label,lang)}</b><span>{sub} {t.subModules}</span></div><strong>{count}</strong></div>)}</div></div><div className="card"><h2>{t.latestRecords}</h2><RecordList lang={lang} records={latest}/></div></div>
  </div>;
}
function RecordList({records,onEdit,lang}:{records:LifeRecord[];onEdit?:(r:LifeRecord)=>void;lang:Lang}){
  const t=ui(lang);
  const {remove}=useAppData();
  if(!records.length)return <div className="empty">{t.noData}</div>;
  return <div className="recordList">{records.map(r=>{const module=MODULE_MAP[r.module]; const sub=module?.subModules.find(s=>s.key===r.subModule); return <article className="record" key={r.id}><div className="recordMain"><div className="recordTop"><h3>{r.title||t.noTitle}</h3><span>{module?.icon} {moduleLabel(r.module,module?.label||r.module,lang)}</span></div><p>{r.detail||'-'}</p><div className="chips"><i>{humanLabel(sub?.key||r.subModule,sub?.label||r.subModule,lang)}</i><i>{kindLabel(r.kind,lang)}</i><i>{statusLabel(r.status,lang)}</i><i>{priorityLabel(r.priority,lang)}</i>{r.linkedTo?.map(l=><i key={l.module}>↔ {moduleLabel(l.module,MODULE_MAP[l.module]?.label||l.module,lang)}</i>)}{r.amount!==undefined&&<i>{r.amount.toLocaleString()} {r.unit||r.currency||''}</i>}{r.targetAmount!==undefined&&<i>{t.target} {r.targetAmount.toLocaleString()} {r.unit||''}</i>}{r.tags.map(t=><i key={t}>#{t}</i>)}</div>{typeof r.progress==='number'&&<div className="progress"><em style={{width:`${Math.max(0,Math.min(100,r.progress))}%`}}/></div>}</div><div className="buttons">{onEdit&&<button className="ghost" onClick={()=>onEdit(r)}>{t.edit}</button>}<button className="danger" onClick={()=>confirm(t.deleteConfirm)&&remove(r.id)}>{t.delete}</button></div></article>})}</div>;
}
function ModulePage({moduleKey,lang}:{moduleKey:ModuleKey;lang:Lang}){
  const t=ui(lang);
  const mod=MODULE_MAP[moduleKey];
  const {byModule,upsert}=useAppData();
  const [editing,setEditing]=useState<LifeRecord>(blank(moduleKey));
  const [q,setQ]=useState('');
  const [subFilter,setSubFilter]=useState('all');
  const selectedSub=mod.subModules.find(s=>s.key===editing.subModule)||mod.subModules[0];
  const records=useMemo(()=>byModule(moduleKey).filter(r=>subFilter==='all'||r.subModule===subFilter).filter(r=>(r.title+' '+r.detail+' '+r.tags.join(' ')+' '+r.subModule).toLowerCase().includes(q.toLowerCase())),[byModule,moduleKey,q,subFilter]);
  const save=()=>{if(!editing.title.trim())return alert(t.requiredTitle); upsert({...editing,updatedAt:now(),tags:Array.isArray(editing.tags)?editing.tags:String(editing.tags).split(',').map(x=>x.trim()).filter(Boolean)}); setEditing(blank(moduleKey));};
  const setField=(name:string,value:string)=>setEditing({...editing,fields:{...editing.fields,[name]:value}});
  return <div className="space"><section className="moduleHeader" style={{borderColor:mod.color}}><div><div className="eyebrow">{mod.icon} {moduleLabel(moduleKey,mod.label,lang)}</div><h1>{modulePurpose(moduleKey,mod.purpose,lang)}</h1><p>{t.hasSubModulesPrefix} {mod.subModules.length} {t.subModules} {t.selectSubAndSave}</p></div><input className="search" placeholder={t.search} value={q} onChange={e=>setQ(e.target.value)}/></section><div className="subScroll">{mod.subModules.map(s=><button key={s.key} className={subFilter===s.key?'active':''} onClick={()=>setSubFilter(s.key)}>{humanLabel(s.key,s.label,lang)}</button>)}<button className={subFilter==='all'?'active':''} onClick={()=>setSubFilter('all')}>{t.all}</button></div><div className="two wideLeft"><div className="card"><h2>{t.addEdit}</h2><div className="form"><Field label={t.subModule}><select value={editing.subModule} onChange={e=>setEditing({...editing,subModule:e.target.value,linkedTo:subLinks(moduleKey,e.target.value)})}>{mod.subModules.map(s=><option key={s.key} value={s.key}>{humanLabel(s.key,s.label,lang)}</option>)}</select></Field><Field label={t.recordKind}><select value={editing.kind} onChange={e=>setEditing({...editing,kind:e.target.value as RecordKind})}>{['transaction','goal','task','log','asset','document','reminder','plan','metric','checklist','note'].map(x=><option key={x} value={x}>{kindLabel(x,lang)}</option>)}</select></Field><Field label={t.title}><input value={editing.title} onChange={e=>setEditing({...editing,title:e.target.value})} placeholder={t.titlePlaceholder}/></Field><Field label={t.date}><input type="date" value={editing.date} onChange={e=>setEditing({...editing,date:e.target.value})}/></Field><Field label={t.dueDate}><input type="date" value={editing.dueDate||''} onChange={e=>setEditing({...editing,dueDate:e.target.value})}/></Field><Field label={t.amount}><input type="number" value={editing.amount??''} onChange={e=>setEditing({...editing,amount:e.target.value?Number(e.target.value):undefined})}/></Field><Field label={t.target}><input type="number" value={editing.targetAmount??''} onChange={e=>setEditing({...editing,targetAmount:e.target.value?Number(e.target.value):undefined})}/></Field><Field label={t.unit}><input value={editing.unit||''} onChange={e=>setEditing({...editing,unit:e.target.value})} placeholder="THB, kg, kcal, %, km"/></Field><Field label={t.progress}><input type="number" min="0" max="100" value={editing.progress??0} onChange={e=>setEditing({...editing,progress:Number(e.target.value)})}/></Field><Field label={t.priority}><select value={editing.priority} onChange={e=>setEditing({...editing,priority:e.target.value as Priority})}>{['low','medium','high','critical'].map(x=><option key={x} value={x}>{priorityLabel(x,lang)}</option>)}</select></Field><Field label={t.status}><select value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value as Status})}>{['planned','active','waiting','done','paused','archived'].map(x=><option key={x} value={x}>{statusLabel(x,lang)}</option>)}</select></Field><Field label={t.tags}><input value={editing.tags.join(', ')} onChange={e=>setEditing({...editing,tags:e.target.value.split(',').map(x=>x.trim()).filter(Boolean)})} placeholder={t.tagsPlaceholder}/></Field><label className="field full"><span>{t.detail}</span><textarea value={editing.detail} onChange={e=>setEditing({...editing,detail:e.target.value})} placeholder={t.detailPlaceholder}/></label><div className="suggest full"><b>{t.suggestedFields} {humanLabel(selectedSub.key,selectedSub.label,lang)}</b><p>{selectedSub.description}</p><div className="fieldGrid">{selectedSub.suggestedFields.map(f=><Field key={f} label={humanLabel(f,f,lang)}><input value={String(editing.fields[f]??'')} onChange={e=>setField(f,e.target.value)} placeholder={humanLabel(f,f,lang)}/></Field>)}</div><div className="chips">{selectedSub.examples.map(e=><i key={e}>{e}</i>)}{selectedSub.linksTo?.map(l=><i key={l}>{t.linkedWith} {moduleLabel(l,MODULE_MAP[l]?.label||l,lang)}</i>)}</div></div><div className="toolbar full"><button onClick={save}>{t.save}</button><button className="ghost" onClick={()=>setEditing(blank(moduleKey))}>{t.clearForm}</button></div></div></div><div className="card"><h2>{t.recordsInModule} ({records.length})</h2><RecordList lang={lang} records={records} onEdit={setEditing}/></div></div></div>;
}
function Settings({lang,setLang}:{lang:Lang;setLang:(lang:Lang)=>void}){
  const t=ui(lang);
  const {db,reset,exportBackup,importBackup}=useAppData();
  return <div className="space"><div className="card"><h1>{t.settingsTitle}</h1><p>{t.settingsIntro} version {db.version}</p><div className="toolbar"><LanguageSwitch lang={lang} setLang={setLang}/><button onClick={exportBackup}>{t.exportBackup}</button><label className="importBtn">{t.importBackup}<input hidden type="file" accept="application/json" onChange={e=>e.target.files?.[0]&&importBackup(e.target.files[0])}/></label><button className="danger" onClick={()=>confirm(t.resetConfirm)&&reset()}>{t.resetSeed}</button></div><pre>{JSON.stringify({records:db.records.length,updatedAt:db.profile.updatedAt,syncReady:db.settings.syncReady,storage:'localStorage',cloud:t.plannedNext},null,2)}</pre></div></div>;
}
function App(){
  const [page,setPage]=useState<ModuleKey|'dashboard'|'settings'|'ai'>('dashboard');
  const [lang,setLang]=useState<Lang>(()=>getSavedLang());
  const {upsert}=useAppData();
  const t=ui(lang);
  function saveAIToModule(entry:AIEntry){
    const target=(entry.targetModule||'notes') as ModuleKey;
    const mod=MODULE_MAP[target]||MODULE_MAP.notes;
    const first=mod.subModules[0]?.key||'general';
    const record:LifeRecord={
      id:crypto.randomUUID(),
      module:target,
      subModule:first,
      kind:'note',
      title:entry.title||'AI Assistant Note',
      detail:`${entry.originalText}\n\n${t.aiSummary}: ${entry.aiSummary}\n${t.suggestedAction}: ${entry.suggestedAction}`,
      date:today(),
      amount:entry.amount,
      unit:entry.unit,
      currency:'THB',
      priority:'medium',
      status:'active',
      tags:['ai',...(entry.tags||[])],
      fields:{source:'AI Assistant',inputType:entry.inputType,aiEntryId:entry.id,aiConfidence:entry.confidence||0,attachments:JSON.stringify((entry.attachments||[]).map(file=>({id:file.id,name:file.name,type:file.type,kind:file.kind,size:file.size,compressedSize:file.compressedSize,compressionRatio:file.compressionRatio,thumbnail:file.thumbnail,dataUrl:file.dataUrl}))),extractedFields:JSON.stringify(entry.extractedFields||[])},
      progress:0,
      linkedTo:[{module:'notes' as ModuleKey,note:t.createdFromAI}],
      createdAt:now(),
      updatedAt:now()
    };
    upsert(record);
  }
  return <div className="app"><aside><div className="brand"><div className="logo">T</div><div><b>TUK OS v5.1</b><span>{t.singleSource}</span></div></div><div className="sideLang"><LanguageSwitch lang={lang} setLang={setLang}/></div><nav><button className={page==='dashboard'?'active':''} onClick={()=>setPage('dashboard')}>📊 {t.dashboard}</button><button className={page==='ai'?'active':''} onClick={()=>setPage('ai')}>🤖 {t.aiAssistant}</button>{pageModules.map(m=><button key={m.key} className={page===m.key?'active':''} onClick={()=>setPage(m.key)}>{m.icon} {moduleLabel(m.key,m.label,lang)}</button>)}<button className={page==='settings'?'active':''} onClick={()=>setPage('settings')}>⚙️ {t.settings}</button></nav></aside><main>{page==='dashboard'?<Dashboard lang={lang}/>:page==='settings'?<Settings lang={lang} setLang={setLang}/>:page==='ai'?<AIAssistant onSendToModule={saveAIToModule}/>:<ModulePage moduleKey={page} lang={lang}/>}</main></div>;
}
createRoot(document.getElementById('root')!).render(<AppDataProvider><App/></AppDataProvider>);

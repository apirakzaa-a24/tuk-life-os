import type { AppDatabase, LifeRecord, ModuleKey } from '../../types/database';
import { createSeedDatabase } from '../../data/seed';
const KEY='tuk_os_v5_enterprise_life_erp_database';
const eventName='tuk-os-v5-db-updated';
function touch(db:AppDatabase):AppDatabase{return {...db,profile:{...db.profile,updatedAt:new Date().toISOString()}}}
export const storageService={
 key:KEY,
 load():AppDatabase{try{const raw=localStorage.getItem(KEY); if(!raw){const seed=createSeedDatabase(); this.save(seed); return seed;} const parsed=JSON.parse(raw) as AppDatabase; if(!parsed.records||!Array.isArray(parsed.records)) throw new Error('Invalid DB'); return parsed;}catch{const seed=createSeedDatabase(); this.save(seed); return seed;}},
 save(db:AppDatabase){localStorage.setItem(KEY,JSON.stringify(touch(db))); window.dispatchEvent(new CustomEvent(eventName));},
 reset(){const seed=createSeedDatabase(); this.save(seed); return seed;},
 upsert(db:AppDatabase,record:LifeRecord):AppDatabase{const exists=db.records.some(r=>r.id===record.id); const nextRecord={...record,updatedAt:new Date().toISOString(),createdAt:record.createdAt||new Date().toISOString()}; const records=exists?db.records.map(r=>r.id===record.id?nextRecord:r):[nextRecord,...db.records]; const next={...db,records}; this.save(next); return next;},
 remove(db:AppDatabase,id:string):AppDatabase{const next={...db,records:db.records.filter(r=>r.id!==id)}; this.save(next); return next;},
 byModule(db:AppDatabase,module:ModuleKey){return db.records.filter(r=>r.module===module||r.linkedTo?.some(l=>l.module===module)).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));},
 export(db:AppDatabase){const blob=new Blob([JSON.stringify(touch(db),null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`TUK_OS_v5_BACKUP_${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);},
 async import(file:File):Promise<AppDatabase>{const text=await file.text(); const db=JSON.parse(text) as AppDatabase; if(!db.records||!Array.isArray(db.records)) throw new Error('ไฟล์ Backup ไม่ถูกต้อง'); this.save(db); return db;},
 subscribe(callback:()=>void){const handler=()=>callback(); window.addEventListener('storage',handler); window.addEventListener(eventName,handler as EventListener); return()=>{window.removeEventListener('storage',handler); window.removeEventListener(eventName,handler as EventListener)}}
};

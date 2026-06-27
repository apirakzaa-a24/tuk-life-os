import React,{createContext,useContext,useMemo,useState,useEffect} from 'react';
import type { AppDatabase, DashboardSummary, LifeRecord, ModuleKey } from '../types/database';
import { storageService } from '../services/storage/storageService';
import { createSummary } from '../utils/summary';
type Ctx={db:AppDatabase; records:LifeRecord[]; summary:DashboardSummary; upsert:(r:LifeRecord)=>void; remove:(id:string)=>void; reset:()=>void; exportBackup:()=>void; importBackup:(f:File)=>Promise<void>; byModule:(m:ModuleKey)=>LifeRecord[]};
const AppDataContext=createContext<Ctx|null>(null);
export function AppDataProvider({children}:{children:React.ReactNode}){const [db,setDb]=useState<AppDatabase>(()=>storageService.load()); useEffect(()=>storageService.subscribe(()=>setDb(storageService.load())),[]); const summary=useMemo(()=>createSummary(db),[db]); const value:Ctx={db,records:db.records,summary,upsert:r=>setDb(storageService.upsert(db,r)),remove:id=>setDb(storageService.remove(db,id)),reset:()=>setDb(storageService.reset()),exportBackup:()=>storageService.export(db),importBackup:async f=>setDb(await storageService.import(f)),byModule:m=>storageService.byModule(db,m)}; return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>}
export function useAppData(){const ctx=useContext(AppDataContext); if(!ctx) throw new Error('useAppData must be used inside AppDataProvider'); return ctx;}

import type { AppDatabase, LifeRecord, ModuleKey, RecordKind } from '../types/database';
import { MODULES } from './modules';
const now = new Date().toISOString();
const today = new Date().toISOString().slice(0,10);
const rec=(module:ModuleKey,subModule:string,kind:RecordKind,title:string,detail:string,amount?:number,unit?:string,progress?:number,tags:string[]=[]):LifeRecord=>({id:crypto.randomUUID(),module,subModule,kind,title,detail,date:today,amount,unit,currency:'THB',progress,priority:'medium',status:'active',tags,fields:{},createdAt:now,updatedAt:now});
export const createSeedDatabase=():AppDatabase=>({
 version:'5.1.0-connected-fitness-travel-local',
 profile:{name:'TUK OS v5.1 Connected Fitness Travel ERP',owner:'Apirak / Tuk',updatedAt:now},
 settings:{theme:'dark',currency:'THB',syncReady:true,appMode:'local-first-enterprise'},
 records:[
  rec('finance','income','transaction','เงินเดือนหลัก','รายรับประจำ ใช้เป็นฐาน cash flow และ budget',81000,'THB',100,['salary','income']),
  rec('finance','debt','transaction','ผ่อน BYD Seal 7','บันทึกงวดรถ BYD เพื่อเชื่อม Vehicle + Finance',17796,'THB',10,['BYD','loan']),
  rec('finance','debt','transaction','ผ่อนคอนโด','ภาระผ่อนบ้าน/คอนโดรายเดือน',9800,'THB',40,['condo','mortgage']),
  rec('health','body-dashboard','metric','น้ำหนักล่าสุด','ใช้ติดตามน้ำหนัก BMI และเป้าหมายหุ่น lean',62.21,'kg',55,['weight','body']),
  rec('health','nutrition','log','บันทึกอาหารตัวอย่าง','ตัวอย่างการบันทึกอาหาร/แคลอรี/โปรตีน',0,'kcal',0,['food','calories']),
  rec('travel','trip-dashboard','plan','Beijing Trip Plan','ทริปตัวอย่างพร้อมงบ itinerary flight hotel packing photo plan',30000,'THB',20,['Beijing','Universal','Great Wall']),
  rec('vehicle','garage','asset','BYD Seal 7','โปรไฟล์รถหลัก ค่าใช้จ่าย ประกัน charging maintenance',0,'THB',70,['BYD','EV']),
  rec('vehicle','garage','asset','Honda City 2010','รถคันเก่า ประวัติซ่อม maintenance และค่าใช้จ่าย',0,'THB',70,['Honda','City']),
  rec('fitness','jump-rope','log','Jump Rope 3,000 ครั้ง','บันทึกกระโดดเชือกละเอียด เชื่อม Health/Goals/Win File',3000,'jumps',60,['jump-rope','cardio']),
  rec('fitness','workout-planner','plan','Lean Body Training Plan','โปรแกรมออกกำลังกายเพื่อหุ่น lean พร้อมตารางและ recovery',0,'%',35,['lean','program']),
  rec('travel','photo-plan','plan','Beijing Photo Shot List','แผนถ่ายรูป IG/Reels จุดถ่าย รูปชุด และ caption',0,'shots',20,['photo','IG']),
  rec('travel','packing','checklist','Travel Packing Master','รายการจัดกระเป๋า เอกสาร ยา power bank outfit',0,'%',15,['packing','documents']),
  rec('goals','year-goals','goal','เป้าหมายหลัก 2026','รวมเป้าหมายเงิน สุขภาพ ภาษา งาน และท่องเที่ยว',0,'%',35,['2026','master']),
  rec('work','supplier','task','ติดตาม Supplier เครื่องจักร','ติดตามราคา/ทดลองเครื่อง/เงื่อนไขซื้อ',0,'THB',30,['supplier','machine']),
  rec('machine','trial','plan','ทดลองเครื่อง 40 ตัน','บันทึกผลทดลอง 1 เดือนและตัดสินใจซื้อ',0,'%',25,['trial','injection']),
  rec('learning','english','goal','English speaking goal','ฝึกพูดอังกฤษให้คล่อง ใช้กับงานและท่องเที่ยว',0,'hour',25,['English']),
  rec('family','baby-items','checklist','ของใช้เด็กแรกเกิด','รายการของต้องเตรียมสำหรับเด็กแรกเกิด',0,'THB',10,['baby','shopping']),
  rec('home','interior','plan','ตกแต่งห้องให้ดูทันสมัย','TV wall ตู้โชว์ ไฟ LED หลังโซฟา',0,'THB',15,['interior']),
  rec('reminders','follow-up','reminder','ตามงานสำคัญ','ใช้เก็บสิ่งที่ต้องตามและ deadline',0,'%',0,['follow-up'])
 ]
});
export const getSeedCoverage=()=>MODULES.map(m=>({module:m.label,subModules:m.subModules.length}));

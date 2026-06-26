import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import GenericPage from './pages/GenericPage';
const descriptions: Record<string,string>={
'Life Vault':'ฐานข้อมูลชีวิตทั้งหมดของ TUK เช่น โปรไฟล์ ที่อยู่ รถ เอกสาร และข้อมูลสำคัญตลอดชีวิต',
'Timeline':'บันทึกทุกเหตุการณ์ อาหาร บิล งาน สุขภาพ และรูปภาพ พร้อมค้นย้อนหลัง',
'Calendar':'ปฏิทินชีวิต งาน สุขภาพ และแจ้งเตือน',
'AI Assistant':'ผู้ช่วย AI สำหรับถามข้อมูลจากฐานข้อมูลชีวิต',
'Camera AI':'ถ่ายรูปอาหาร บิล เอกสาร แล้วให้ AI วิเคราะห์',
'Voice AI':'พูดสั่งงาน เพิ่มข้อมูล และถามตอบด้วยเสียง',
'Health':'น้ำหนัก แคลอรี่ การนอน ออกกำลังกาย เป้าหมายสุขภาพ',
'Finance':'รายรับ รายจ่าย หนี้ งบประมาณ และสรุปการเงิน',
'Vehicles':'BYD Seal 7, Honda City, PM, ประกัน, ภาษี และค่าใช้จ่ายรถ',
'Satys Work':'PM/BM เครื่องจักร Spare Part Supplier Email และโปรเจกต์งาน',
'Settings':'ตั้งค่า Google Sheets, Drive, Theme, PWA, Backup และ User'
};
export default function App(){const [active,setActive]=useState('Dashboard');return <div className="app"><Sidebar active={active} setActive={setActive}/><div className="main"><Topbar/>{active==='Dashboard'?<Dashboard/>:<GenericPage title={active} desc={descriptions[active]||'TUK LIFE OS Module'}/>}</div></div>}

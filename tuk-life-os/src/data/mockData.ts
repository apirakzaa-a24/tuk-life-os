import type { FinanceItem, Metric, TimelineItem, Vehicle, WorkItem } from '../types';

export const appVersion = {
  product: 'TUK LIFE OS',
  version: 'v6.0 Professional',
  sprint: 'Sprint 8 Full Professional',
  build: '2026.06.27',
  codename: 'Google Sheets Foundation + Modular Architecture',
};

export const todayMetrics: Metric[] = [
  { label: 'ค่าใช้จ่ายวันนี้', value: '549 บาท', helper: 'ดึงเข้าฐานข้อมูลพร้อม Sync', icon: '💸', tone: 'blue' },
  { label: 'แคลอรี่', value: 'ยังไม่มีข้อมูล', helper: 'พร้อมรับข้อมูลจากรูปอาหาร', icon: '🍱', tone: 'orange' },
  { label: 'ออกกำลังกาย', value: 'ยังไม่มีข้อมูล', helper: 'พร้อมบันทึก Apple Watch/Manual', icon: '🏃', tone: 'green' },
  { label: 'เรียนอังกฤษ', value: 'ยังไม่มีข้อมูล', helper: 'เป้าหมายพูดคล่อง Nov 2026', icon: '📚', tone: 'purple' },
  { label: 'น้ำหนัก', value: '62.21 kg', helper: 'เป้าหมาย lean physique', icon: '⚖️', tone: 'pink' },
];

export const quickActions = [
  { label: 'ถ่ายอาหาร', icon: '📷', desc: 'AI วิเคราะห์อาหาร' },
  { label: 'เพิ่มค่าใช้จ่าย', icon: '💳', desc: 'บันทึก Finance' },
  { label: 'เพิ่ม Timeline', icon: '🕒', desc: 'บันทึกชีวิต' },
  { label: 'สแกนบิล', icon: '🧾', desc: 'OCR ใบเสร็จ' },
  { label: 'ถาม AI', icon: '🤖', desc: 'ค้นหาฐานข้อมูล' },
  { label: 'เพิ่มรถ', icon: '🚗', desc: 'Vehicle DB' },
  { label: 'งาน Satys', icon: '🏭', desc: 'PM/BM/Machine' },
  { label: 'สำรองข้อมูล', icon: '☁️', desc: 'Backup/Restore' },
];

export const timeline: TimelineItem[] = [
  { time: '08:00', title: 'เริ่มงาน Satys', detail: 'ติดตาม PM/BM และงาน Machine', category: 'Work' },
  { time: '12:00', title: 'บันทึกอาหารกลางวัน', detail: 'พร้อมเชื่อม AI Camera/Food Analysis', category: 'Health' },
  { time: '17:00', title: 'สรุปงานประจำวัน', detail: 'บันทึกงานสำคัญเข้า Timeline', category: 'Work' },
  { time: '21:00', title: 'Gym / English', detail: 'ออกกำลัง + เรียนภาษาอังกฤษ', category: 'Life' },
];

export const vehicles: Vehicle[] = [
  { name: 'BYD Seal 7 EV', nextService: 'เช็กกล้อง / ประกัน / ค่าใช้จ่าย', costThisMonth: '17,796 บาท', status: 'Active' },
  { name: 'Honda City 2010', nextService: 'ติดตามซ่อม / ผ่อนคงเหลือ', costThisMonth: '4,851 บาท', status: 'Active' },
];

export const financeItems: FinanceItem[] = [
  { name: 'เงินเดือน Satys', amount: '81,000 บาท', type: 'income' },
  { name: 'คอนโด', amount: '9,800 บาท', type: 'debt' },
  { name: 'BYD Seal 7', amount: '17,796 บาท', type: 'debt' },
  { name: 'Bangkok Bank Credit Card', amount: '128,644.48 บาท', type: 'debt' },
];

export const workItems: WorkItem[] = [
  { title: 'Machine trial 1 month', machine: 'Injection machine', status: 'Evaluate before purchase', priority: 'สูง' },
  { title: 'Wire bending accuracy', machine: 'WG-825', status: 'Stepper vs Servo improvement', priority: 'สูง' },
  { title: 'PM/BM tracking', machine: 'Komax / Kappa / Gamma', status: 'Prepare database', priority: 'กลาง' },
  { title: 'TRD801 evaluation', machine: 'Double-end crimping', status: 'Request borrow for trial', priority: 'กลาง' },
];

export const googleSheetsTables = [
  'profile_master',
  'timeline_events',
  'health_logs',
  'finance_transactions',
  'vehicle_assets',
  'work_tasks',
  'ai_memory',
  'settings',
];

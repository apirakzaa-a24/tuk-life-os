import { Brain, CalendarDays, Car, Dumbbell, FolderKanban, Home, LineChart, Plane, Settings, Wrench, BookOpen, WalletCards } from 'lucide-react';

export const modules = [
  { key: 'dashboard', name: 'Home Dashboard', icon: Home, desc: 'ภาพรวมชีวิต งาน สุขภาพ การเงิน และเป้าหมาย', status: 'Live' },
  { key: 'ai', name: 'AI Brain', icon: Brain, desc: 'หน่วยความจำส่วนตัวและผู้ช่วย AI ของ TUK', status: 'Design' },
  { key: 'calendar', name: 'Smart Calendar', icon: CalendarDays, desc: 'ตารางชีวิต งาน นัดหมาย และ reminder', status: 'Ready' },
  { key: 'finance', name: 'Finance OS', icon: WalletCards, desc: 'รายรับ รายจ่าย หนี้ รถ บ้าน และเป้าหมายเงิน', status: 'Ready' },
  { key: 'health', name: 'Health & Gym', icon: Dumbbell, desc: 'น้ำหนัก ออกกำลังกาย อาหาร การนอน และ Apple Watch', status: 'Ready' },
  { key: 'work', name: 'Satys Work', icon: FolderKanban, desc: 'งานโรงงาน เครื่องจักร PM BM อะไหล่ Supplier', status: 'Ready' },
  { key: 'maintenance', name: 'Maintenance System', icon: Wrench, desc: 'Machine issues, PM schedule, spare parts, history', status: 'Ready' },
  { key: 'vehicle', name: 'Vehicle Manager', icon: Car, desc: 'BYD Seal 7, Honda City, insurance, service, tax', status: 'Ready' },
  { key: 'travel', name: 'Travel Planner', icon: Plane, desc: 'Trip budget, checklist, itinerary, photo plan', status: 'Ready' },
  { key: 'knowledge', name: 'Knowledge Base', icon: BookOpen, desc: 'เอกสาร ความรู้ เมล งาน technical และ personal memory', status: 'Ready' },
  { key: 'analytics', name: 'Analytics', icon: LineChart, desc: 'KPI ชีวิต เป้าหมาย และ performance dashboard', status: 'Ready' },
  { key: 'settings', name: 'Settings', icon: Settings, desc: 'Theme, account, integrations, security', status: 'Ready' }
];

export const todayTasks = [
  'Review Satys work dashboard',
  'Log food and workout',
  'Check finance summary',
  'Plan tomorrow calendar',
  'Update AI memory notes'
];

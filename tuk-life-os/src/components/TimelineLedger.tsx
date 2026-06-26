import React, { useState, useEffect, useMemo } from 'react';
import { translateText } from '../utils/translation';
import {
  Clock, DollarSign, Heart, Car, Briefcase, Plus, Search, Check, AlertCircle, Info, Sparkles, Filter, Trash2, Globe, Calendar, Plane, Activity, MapPin, Flame, Zap, Database, Folder, CheckCircle2, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { logAudit } from '../utils/audit';
import { safeLocalStorage } from '../utils/storage';
import { TimelineItemActions } from './TimelineItemActions';
import { TimelineItem } from './TimelineItem';
import { QuickActionsGrid } from './QuickActionsGrid';
import { VoiceQuickEntry } from './VoiceQuickEntry';

interface TimelineEvent {
  id: string;
  timestamp: string;
  timeLabel: string;
  category: 'finance' | 'health' | 'garage' | 'work' | 'travel' | 'lifestyle';
  type?: string;
  subject: string;
  value: string;
  unit: string;
  isIncome?: boolean;
  details: string;
  tags: string[];
  status: 'sent' | 'failed' | 'simulated' | 'DELETED' | 'resolved' | 'ignored';
  sheetTarget: string;
}

const formatDetailDate = (timestampStr: string | undefined, lang: 'th' | 'en') => {
  if (!timestampStr) return '';
  try {
    const cleanStr = timestampStr.includes(' ') && !timestampStr.includes('T') ? timestampStr.replace(' ', 'T') : timestampStr;
    const date = new Date(cleanStr);
    if (isNaN(date.getTime())) {
      return timestampStr; // Fallback
    }
    if (lang === 'th') {
      const day = date.getDate();
      const monthsTh = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      const month = monthsTh[date.getMonth()];
      const yearBe = date.getFullYear() + 543;
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day} ${month} ${yearBe} เวลา ${hours}:${minutes} น.`;
    } else {
      const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthsEn[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampmStr = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${month} ${day}, ${year} at ${displayHours}:${minutes} ${ampmStr}`;
    }
  } catch (e) {
    return timestampStr;
  }
};

const getCategoryLabel = (category: string, lang: 'th' | 'en') => {
  if (lang === 'en') return category;
  const mapping: Record<string, string> = {
    finance: 'การเงิน',
    health: 'สุขภาพ',
    work: 'งาน',
    garage: 'รถยนต์',
    lifestyle: 'ไลฟ์สไตล์',
    food: 'อาหาร',
    simulated: 'ข้อมูลจำลอง'
  };
  return mapping[category.toLowerCase()] || category;
};

export default function TimelineLedger({
  language = 'th',
  isSimplifiedMode = false
}: {
  language?: 'th' | 'en';
  isSimplifiedMode?: boolean;
}) {
  const t = {
    th: {
      headline: 'ไทม์ไลน์บันทึกประวัติเหตุการณ์ (Live Timeline)',
      subheadline: 'รวบรวมทุกเรื่องราวและข้อมูลการดำเนินชีวิตรายวัน พลิกแพลงจัดเก็บเป็นตารางเชิงสัมพันธ์ (Relational Rows) เฝ้าดูได้แบบเรียลไทม์',
      quickAdd: 'เพิ่มรายการด่วน',
      addHeader: 'เพิ่มบันทึกลงสารบัญส่วนตัวด้วยตนเอง',
      category: 'หมวดหมู่',
      subject: 'หัวข้อเหตุการณ์ / บันทึกประวัติ',
      subjectPlaceholder: 'เช่น ค่าล้างรถด่วนสีลม หรือ ค่าน้ำตาลในเลือดหลังอาหาร',
      amountFinance: 'จำนวนเงิน (บาท)',
      amountMetric: 'ค่าหน่วยบันทึก',
      transactionType: 'ประเภทธุรกรรม:',
      expense: 'รายจ่าย 🔴',
      income: 'รายรับ 🟢',
      eventDate: 'วันที่ระบุในปฏิทิน (Event Date)',
      eventTime: 'ระบุเวลาเหตุการณ์ (Event Time)',
      detailsLabel: 'คำอธิบายเพิ่มเติม (รายละเอียดของแถวลงตาราง)',
      detailsPlaceholder: 'เช่น บิลเลขที่ #1024 ชาร์จบัตรเครดิต หรือ บันทึกจากคลินิก',
      tagsLabel: 'แท็กแยกหมวดหมู่ (โปรดคั่นด้วยเครื่องหมายจุลภาค ,)',
      cancel: 'ยกเลิก',
      saving: 'กำลังบันทึก...',
      saveEvent: 'บันทึกเหตุการณ์ประวัติ',
      all: 'ทั้งหมด',
      finance: 'การเงิน',
      health: 'สุขภาพ',
      garage: 'รถยนต์',
      work: 'การงาน',
      travel: 'การเดินทาง',
      lifestyle: 'ไลฟ์สไตล์',
      searchPlaceholder: 'ค้นหาไทม์ไลน์บรรยาย...',
      calendarHeader: 'ปฏิทินเลือกดูแยกเป็นรายวัน (Chrono Calendar Workspace)',
      calendarSub: 'คลิกที่วันบนปฏิทินหรือแท็บด่วนเพื่อคัดกรองข้อมูลประวัติแบบเจาะจงเฉพาะวัน',
      clearFilter: 'แสดงประวัติทั้งหมด (Clear Date Filter)',
      allDays: 'ALL DAYS',
      today: 'วันนี้',
      yesterday: 'เมื่อวาน',
      noHistory: '📭 ไม่พบประวัติบันทึกภายใต้การกรองหรือคำค้นหานี้.',
      rowsCount: 'แถวบันทึก',
      todayHeader: '✨ วันนี้ (Today)',
      yesterdayHeader: '📅 เมื่อวานนี้ (Yesterday)',
      syncSuccess: 'SYNCED SUCCESS',
      localCache: '✓ LOCAL CACHE',
      syncFailure: '⚠️ SYNC FAILURE',
      synced: '🟢 ซิงก์แล้ว',
      failed: '🔴 ซิงก์ล้มเหลว',
      pending: '🟡 รอซิงก์',
      relationshipHeader: 'กลไกความสัมพันธ์ของพอร์ตไทม์ไลน์',
      relationshipDesc: 'ความสามารถพิเศษของระบบนี้คือการเชื่อมโยงข้อมูลแบบ Bi-directional (สองทิศทาง) ทุกรายการไทม์ไลน์ที่ท่านบันทึกด่วน จะถูกวิเคราะห์ความเหมาะสมและแยกประวัติบรรจุลงตารางส่วนย่อยที่เหมาะสมทันที (อาทิ FIN_TRANSACTIONS_V3 สำหรับค่าเครื่องดื่ม, GAR_LOGS_V3 สำหรับค่าเดินทาง) ช่วยเพิ่มความคล่องตัวให้กระจัดกระจายระบุทิศทางได้สมบูรณ์แบบ',
      confirmReset: 'ยืนยันที่จะคืนค่าเริ่มต้นของไทม์ไลน์บันทึกประวัติใช่หรือไม่?',
    },
    en: {
      headline: 'Chrono Event Log (Live Timeline)',
      subheadline: 'Aggregate weekly & daily logs into an integrated relational ledger. Monitor direct database synchronization in real-time.',
      quickAdd: 'Quick Add Event',
      addHeader: 'Manually Log an Event to personal database',
      category: 'Category',
      subject: 'Event Topic / Entry Title',
      subjectPlaceholder: 'e.g., Starbucks Coffee or Blood Pressure check',
      amountFinance: 'Amount (THB)',
      amountMetric: 'Value Metric',
      transactionType: 'Transaction Type:',
      expense: 'Expense 🔴',
      income: 'Income 🟢',
      eventDate: 'Calendar Event Date',
      eventTime: 'Event Time',
      detailsLabel: 'Additional Metadata (Database Row Details)',
      detailsPlaceholder: 'e.g., invoice #1040, SCB Credit Card, or Sleep metrics',
      tagsLabel: 'Classification Tags (Comma separated)',
      cancel: 'Cancel',
      saving: 'Saving to Database...',
      saveEvent: 'Submit Log Event',
      all: 'All',
      finance: 'Finance',
      health: 'Health',
      garage: 'Garage',
      work: 'Work Progress',
      travel: 'Travel',
      lifestyle: 'Lifestyle',
      searchPlaceholder: 'Search timeline logs...',
      calendarHeader: 'Chrono Calendar Workspace (Filter by Day)',
      calendarSub: 'Select a custom calendar day key or click below to filter history',
      clearFilter: 'Show All Records (Clear Date Filter)',
      allDays: 'ALL DAYS',
      today: 'Today',
      yesterday: 'Yesterday',
      noHistory: '📭 No records found matching the active description or tags.',
      rowsCount: 'Rows',
      todayHeader: '✨ Today',
      yesterdayHeader: '📅 Yesterday',
      syncSuccess: 'SYNCED SUCCESS',
      localCache: '✓ LOCAL CACHE',
      syncFailure: '⚠️ SYNC FAILURE',
      synced: '🟢 Synced',
      failed: '🔴 Sync Failed',
      pending: '🟡 Pending',
      relationshipHeader: 'Timeline Port Dispatch Relationship Schema',
      relationshipDesc: 'Our architecture leverages direct bi-directional synchronizations. Each quick entry automatically parses logic routes and logs dedicated metadata schema tables (like FIN_TRANSACTIONS_V3 for coffee purchases or HLT_HEALTH_METRICS_V3 for biometrics).',
      confirmReset: 'Confirm resetting interactive timeline history back to template baseline?',
    }
  };

  const curr = t[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'finance' | 'health' | 'garage' | 'work' | 'travel' | 'lifestyle'>('all');
  const [filterDate, setFilterDate] = useState('');
  const [dateFilterMode, setDateFilterMode] = useState<'today' | 'yesterday' | 'last7days' | 'all' | 'custom'>('today');
  const [viewMonth, setViewMonth] = useState(new Date());
  const [presetSearch, setPresetSearch] = useState('');
  const [templates, setTemplates] = useState<any[]>(() => JSON.parse(localStorage.getItem('templates') || '[]'));
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [translations, setTranslations] = useState<Record<string, Partial<TimelineEvent>>>({});
  
  useEffect(() => {
    if (language === 'en') { setTranslations({}); return; }
    const translateAll = async () => {
        const newTrans: Record<string, Partial<TimelineEvent>> = {};
        for (const event of timelineEvents) {
            newTrans[event.id] = {
                subject: await translateText(event.subject, 'th'),
                details: await translateText(event.details, 'th'),
            };
        }
        setTranslations(newTrans);
    };
    translateAll();
  }, [timelineEvents, language]);
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isMetadataCollapsed, setIsMetadataCollapsed] = useState(true);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const saveTemplate = () => {
    const newTemplate = { id: Date.now(), ...newEvent };
    const updated = [...templates, newTemplate];
    setTemplates(updated);
    localStorage.setItem('templates', JSON.stringify(updated));
  };
  const deleteTemplate = (id: number) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    localStorage.setItem('templates', JSON.stringify(updated));
  };
const FOOD_PRESETS = [
  { label: 'ข้าวกะเพราหมู', value: 'ข้าวกะเพราหมู', category: 'Rice' },
  { label: 'ข้าวกะเพราไก่', value: 'ข้าวกะเพราไก่', category: 'Rice' },
  { label: 'ข้าวกะเพราเนื้อ', value: 'ข้าวกะเพราเนื้อ', category: 'Rice' },
  { label: 'ข้าวไข่เจียว', value: 'ข้าวไข่เจียว', category: 'Rice' },
  { label: 'ข้าวมันไก่', value: 'ข้าวมันไก่', category: 'Rice' },
  { label: 'ข้าวหมูแดง', value: 'ข้าวหมูแดง', category: 'Rice' },
  { label: 'ข้าวขาหมู', value: 'ข้าวขาหมู', category: 'Rice' },
  { label: 'ข้าวผัด', value: 'ข้าวผัด', category: 'Rice' },
  { label: 'ข้าวผัดกุ้ง', value: 'ข้าวผัดกุ้ง', category: 'Rice' },
  { label: 'ข้าวผัดปู', value: 'ข้าวผัดปู', category: 'Rice' },
  { label: 'ผัดไทย', value: 'ผัดไทย', category: 'Noodles' },
  { label: 'ราดหน้า', value: 'ราดหน้า', category: 'Noodles' },
  { label: 'ผัดซีอิ๊ว', value: 'ผัดซีอิ๊ว', category: 'Noodles' },
  { label: 'ก๋วยเตี๋ยวเรือ', value: 'ก๋วยเตี๋ยวเรือ', category: 'Noodles' },
  { label: 'ก๋วยเตี๋ยวหมู', value: 'ก๋วยเตี๋ยวหมู', category: 'Noodles' },
  { label: 'ก๋วยเตี๋ยวไก่', value: 'ก๋วยเตี๋ยวไก่', category: 'Noodles' },
  { label: 'เย็นตาโฟ', value: 'เย็นตาโฟ', category: 'Noodles' },
  { label: 'ส้มตำ', value: 'ส้มตำ', category: 'Protein' },
  { label: 'ลาบหมู', value: 'ลาบหมู', category: 'Protein' },
  { label: 'น้ำตกหมู', value: 'น้ำตกหมู', category: 'Protein' },
  { label: 'ไก่ย่าง', value: 'ไก่ย่าง', category: 'Protein' },
  { label: 'อเมริกาโน่', value: 'อเมริกาโน่', category: 'Drinks' },
  { label: 'ลาเต้', value: 'ลาเต้', category: 'Drinks' },
  { label: 'คาปูชิโน่', value: 'คาปูชิโน่', category: 'Drinks' },
  { label: 'มอคค่า', value: 'มอคค่า', category: 'Drinks' },
  { label: 'ชาไทย', value: 'ชาไทย', category: 'Drinks' },
  { label: 'ชาเขียว', value: 'ชาเขียว', category: 'Drinks' },
  { label: 'โกโก้', value: 'โกโก้', category: 'Drinks' },
  { label: 'นมสด', value: 'นมสด', category: 'Drinks' },
  { label: 'เวย์โปรตีน', value: 'เวย์โปรตีน', category: 'Drinks' },
  { label: 'น้ำเปล่า', value: 'น้ำเปล่า', category: 'Drinks' },
  { label: 'กล้วย', value: 'กล้วย', category: 'Fruit' },
  { label: 'แอปเปิ้ล', value: 'แอปเปิ้ล', category: 'Fruit' },
  { label: 'แตงโม', value: 'แตงโม', category: 'Fruit' },
  { label: 'ส้ม', value: 'ส้ม', category: 'Fruit' },
  { label: 'มะม่วง', value: 'มะม่วง', category: 'Fruit' },
];

const MOOD_PRESETS = [
    { label: '😀 มีความสุข', value: '😀' }, { label: '🙂 ดี', value: '🙂' }, { label: '😐 ปกติ', value: '😐' }, { label: '😴 ง่วง', value: '😴' }, { label: '😫 เหนื่อย', value: '😫' },
    { label: '😡 โกรธ', value: '😡' }, { label: '😢 เศร้า', value: '😢' }, { label: '🤩 ตื่นเต้น', value: '🤩' }, { label: '😰 กังวล', value: '😰' }, { label: '💪 มีกำลังใจ', value: '💪' }
];
const EXERCISE_PRESETS = [
    { label: '🏃 วิ่ง', value: '🏃' }, { label: '🚶 เดิน', value: '🚶' }, { label: '🏋️ เวท', value: '🏋️' }, { label: '🚴 ปั่นจักรยาน', value: '🚴' }, 
    { label: '🪢 กระโดดเชือก', value: '🪢' }, { label: '🏊 ว่ายน้ำ', value: '🏊' }, { label: '🧘 โยคะ', value: '🧘' }, { label: '🔥 HIIT', value: '🔥' }
];
const FUEL_PRESETS = [
    { label: 'PTT', value: 'PTT' }, { label: 'Bangchak', value: 'Bangchak' }, { label: 'Shell', value: 'Shell' }, { label: 'Caltex', value: 'Caltex' },
    { label: 'PT', value: 'PT' }, { label: 'Esso', value: 'Esso' }, { label: 'Susco', value: 'Susco' }
];
const WORK_PRESETS = [
    { label: '📧 Email', value: '📧' }, { label: '🤝 Meeting', value: '🤝' }, { label: '📦 Purchase', value: '📦' }, { label: '🔧 PM', value: '🔧' },
    { label: '🚨 BM', value: '🚨' }, { label: '📊 Report', value: '📊' }, { label: '🏭 Production Support', value: '🏭' }, { label: '📋 Audit', value: '📋' }, { label: '📁 Project', value: '📁' }
];

const LOCATION_PRESETS = [
    { label: '🏠 หมู่บ้านนิรันดร์วิลล์ 10', value: '🏠 หมู่บ้านนิรันดร์วิลล์ 10' },
    { label: '🏭 Satys Electric (Thailand) Co., Ltd.', value: '🏭 Satys Electric (Thailand) Co., Ltd.' },
    { label: '☕ Café Amazon', value: '☕ Café Amazon' },
    { label: '🍽️ Yes Bangplee', value: '🍽️ Yes Bangplee' },
    { label: '⛽ PTT', value: '⛽ PTT' },
    { label: '⛽ Bangchak', value: '⛽ Bangchak' },
    { label: '⛽ Shell', value: '⛽ Shell' },
    { label: '⛽ Caltex', value: '⛽ Caltex' },
    { label: '🛒 7-Eleven', value: '🛒 7-Eleven' },
    { label: '🏥 Clinic / Hospital', value: '🏥 Clinic / Hospital' },
    { label: '🦷 Dental Clinic', value: '🦷 Dental Clinic' },
    { label: '🏋️ Gym', value: '🏋️ Gym' },
    { label: '✈️ Airport', value: '✈️ Airport' },
    { label: '🏨 Hotel', value: '🏨 Hotel' },
];

const getRecent = (type: string) => JSON.parse(localStorage.getItem(`recent_${type}`) || '[]');
const getFrequent = (type: string) => {
    const frequent = JSON.parse(localStorage.getItem(`frequent_${type}`) || '{}');
    return Object.entries(frequent)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 5)
        .map(([label]) => ({ label, value: label }));
};

const updatePresetData = (type: string, item: string) => {
    const recent = getRecent(type);
    const updatedRecent = [item, ...recent.filter((i: string) => i !== item)].slice(0, 5);
    localStorage.setItem(`recent_${type}`, JSON.stringify(updatedRecent));
    
    const frequent = JSON.parse(localStorage.getItem(`frequent_${type}`) || '{}');
    frequent[item] = (frequent[item] || 0) + 1;
    localStorage.setItem(`frequent_${type}`, JSON.stringify(frequent));
};

const PresetPicker = ({ type, items, onSelect, placeholder, presetSearch, setPresetSearch }: { type: string, items: { label: string, value: string }[], onSelect: (val: string) => void, placeholder: string, presetSearch: string, setPresetSearch: (s: string) => void }) => {
  const recent = getRecent(type).map((label: string) => ({ label, value: label }));
  const frequent = getFrequent(type);
  const filtered = items.filter(i => i.label.toLowerCase().includes(presetSearch.toLowerCase()));
  
  return (
    <div className="col-span-2 space-y-2">
      <input type="text" placeholder={placeholder} value={presetSearch} onChange={(e) => setPresetSearch(e.target.value)} className="w-full border rounded p-2 text-xs" />
      {!presetSearch && (
        <>
            <div className="text-[10px] font-bold text-slate-500">⭐ ใช้บ่อย</div>
            <div className="grid grid-cols-4 gap-1">
                {frequent.map(i => <button type="button" key={i.value} onClick={() => { onSelect(i.value); updatePresetData(type, i.value); }} className="p-1 rounded bg-teal-50 text-[10px] truncate">{i.label}</button>)}
            </div>
            <div className="text-[10px] font-bold text-slate-500">🕘 ล่าสุด</div>
            <div className="grid grid-cols-4 gap-1">
                {recent.map(i => <button type="button" key={i.value} onClick={() => { onSelect(i.value); updatePresetData(type, i.value); }} className="p-1 rounded bg-slate-50 text-[10px] truncate">{i.label}</button>)}
            </div>
        </>
      )}
      {presetSearch && (
         <div className="grid grid-cols-4 gap-1">
            {filtered.map(i => (
                <button type="button" key={i.value} onClick={() => { onSelect(i.value); updatePresetData(type, i.value); }} className="p-1 rounded bg-slate-100 text-[10px] truncate">
                    {i.label}
                </button>
            ))}
         </div>
      )}
    </div>
  );
};
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [webAppUrl, setWebAppUrl] = useState(() => {
    return safeLocalStorage.getItem('tuk_life_web_app_url') || '';
  });

  // Custom Toast & Confirmation modal states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const getEventLocation = (event: TimelineEvent) => {
    // Check if there are specific tags first
    const locTags = (event.tags || []).filter(tag => 
      tag && !['#income', '#consulting', '#expense', '#work', '#prius', '#fuel', '#weight', '#sleep', '#health-score', '#easy-entry'].includes(tag.toLowerCase())
    );
    if (locTags.length > 0) {
      return locTags[0].replace('#', '').toUpperCase();
    }
    
    const subject = event.subject || '';
    // Look for parentheses in subject
    const match = subject.match(/\(([^)]+)\)/);
    if (match) {
      return match[1];
    }
    
    // Look for common locations
    const subjLow = subject.toLowerCase();
    const detLow = (event.details || '').toLowerCase();
    if (subjLow.includes('silom') || detLow.includes('silom')) return 'Silom Rd';
    if (subjLow.includes('emquartier') || detLow.includes('emquartier')) return 'EmQuartier';
    if (subjLow.includes('scb') || detLow.includes('scb')) return 'SCB Bank';
    if (subjLow.includes('คาลเท็กซ์')) return 'Silom Rd';
    if (event.category === 'health') return language === 'th' ? 'ที่บ้าน' : 'At Home';
    if (event.category === 'work') return language === 'th' ? 'ออฟฟิศ' : 'Office';
    return language === 'th' ? 'กรุงเทพฯ' : 'Bangkok';
  };

  const getEventMetricBadge = (event: TimelineEvent) => {
    if (event.category === 'finance') {
      const isIncome = event.isIncome;
      return (
        <span className={`text-[11px] font-mono font-extrabold px-2 py-0.5 rounded ${isIncome ? 'bg-emerald-50 text-emerald-700 border border-emerald-250/20' : 'bg-rose-50 text-rose-700 border border-rose-250/20'}`}>
          {isIncome ? '+' : '-'}{event.value} {event.unit}
        </span>
      );
    }
    if (event.category === 'health') {
      return (
        <span className="text-[11px] font-mono font-extrabold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-150/20 flex items-center gap-1">
          <Flame className="w-3 h-3 text-rose-500 shrink-0" />
          {event.value} {event.unit} {event.unit === 'kg' && '• 320 kcal'}
        </span>
      );
    }
    if (event.category === 'work') {
      return (
        <span className="text-[11px] font-mono font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-150/20 flex items-center gap-1">
          <Clock className="w-3 h-3 text-blue-500 shrink-0" />
          {event.value} {event.unit}
        </span>
      );
    }
    if (event.category === 'garage' || event.category === 'travel') {
      return (
        <span className="text-[11px] font-mono font-extrabold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-150/20 flex items-center gap-1">
          <Car className="w-3 h-3 text-amber-600 shrink-0" />
          {event.value} {event.unit}
        </span>
      );
    }
    return (
      <span className="text-[11px] font-mono font-extrabold px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200">
        {event.value} {event.unit}
      </span>
    );
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Form states
  const [activeEasyTab, setActiveEasyTab] = useState<'expense' | 'food' | 'health' | 'work' | 'vehicle' | 'lifestyle' | null>(null);

  const [newEvent, setNewEvent] = useState({
    category: 'finance' as 'finance' | 'health' | 'garage' | 'work' | 'travel' | 'lifestyle',
    type: '',
    subject: '',
    value: '',
    unit: 'THB',
    isIncome: false,
    details: '',
    tags: '',
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5)
  });

  // Synchronize preset defaults whenever the easy tab changes
  useEffect(() => {
    if (activeEasyTab) {
      let category: any = 'finance';
      let unit = 'THB';
      let isIncome = false;
      let subject = '';
      let tags = '';

      if (activeEasyTab === 'food') {
        category = 'health';
        unit = 'kcal';
        subject = language === 'th' ? 'กินมื้ออาหารอร่อย' : 'Meal Break';
        tags = '#food';
      } else if (activeEasyTab === 'health') {
        category = 'health';
        unit = 'kg';
        subject = language === 'th' ? 'ชั่งน้ำหนักยามเช้า' : 'Weight Measurement';
        tags = '#weight';
      } else if (activeEasyTab === 'work') {
        category = 'work';
        unit = 'Minutes';
        subject = language === 'th' ? 'จัดการงานสรุปโครงการ' : 'Resolve Project Milestone';
        tags = '#work';
      } else if (activeEasyTab === 'vehicle') {
        category = 'garage';
        unit = 'Liters';
        subject = language === 'th' ? 'เติมน้ำมัน Caltex' : 'Refill Fuel';
        tags = '#fuel';
      } else if (activeEasyTab === 'lifestyle') {
        category = 'lifestyle';
        unit = 'Rating';
        subject = language === 'th' ? 'อ่านหนังสือ / นั่งสมาธิ' : 'Leisure hour';
        tags = '#lifestyle';
      } else {
        category = 'finance';
        unit = 'THB';
        subject = language === 'th' ? 'ซื้อของกินของใช้' : 'Grocery purchase';
        tags = '#expense';
      }

      setNewEvent({
        category,
        subject,
        value: '',
        unit,
        isIncome,
        details: '',
        tags,
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toTimeString().slice(0, 5)
      });
    }
  }, [activeEasyTab, language]);

  const [submitting, setSubmitting] = useState(false);
  const [isFormAdvanced, setIsFormAdvanced] = useState(false);

  // Load baseline events & local updates
  useEffect(() => {
    const loadEvents = () => {
      const savedEvents = safeLocalStorage.getItem('tuk_life_timeline_events');
      if (savedEvents) {
        try {
          setTimelineEvents(JSON.parse(savedEvents));
        } catch (e) {
          initializeBaseline();
        }
      } else {
        initializeBaseline();
      }
    };

    loadEvents();

    window.addEventListener('timeline-updated', loadEvents);
    return () => {
      window.removeEventListener('timeline-updated', loadEvents);
    };
  }, []);

  const initializeBaseline = () => {
    const today = new Date().toISOString().slice(0, 10);
    const baseline: TimelineEvent[] = [
      {
        id: 'baseline-1',
        timestamp: `${today} 18:30:00`,
        timeLabel: '18:30 (วันนี้)',
        category: 'finance',
        subject: 'เงินเข้าบัญชีงานที่ปรึกษา (Consulting Fee)',
        value: '15,000.00',
        unit: 'THB',
        isIncome: true,
        details: 'เงินฝากเข้าธนาคารไทยพาณิชย์ (SCB) ในนาม Apirak Consulting',
        tags: ['#income', '#consulting', '#scb'],
        status: 'simulated',
        sheetTarget: 'FIN_TRANSACTIONS_V3'
      },
      {
        id: 'baseline-2',
        timestamp: `${today} 17:45:00`,
        timeLabel: '17:45 (วันนี้)',
        category: 'garage',
        subject: 'เติมน้ำมัน คาลเท็กซ์ ถนนสีลม (Caltex Silom)',
        value: '35.50',
        unit: 'Liters',
        details: 'เติมน้ำมันรถยนต์ Toyota Prius เกรด Gasohol 95 / บันทึกเลขไมล์ 124,350 กม.',
        tags: ['#prius', '#fuel', '#caltex'],
        status: 'simulated',
        sheetTarget: 'GAR_LOGS_V3'
      },
      {
        id: 'baseline-3',
        timestamp: `${today} 13:00:00`,
        timeLabel: '13:00 (วันนี้)',
        category: 'work',
        subject: 'ตรวจรับงานสถาปัตยกรรมและทดสอบ API ตารางข้อมูล',
        value: '180',
        unit: 'Minutes',
        details: 'ทำระบบตรวจแบบข้อมูลโมดูล Google Sheets Webhook ร่วมกับที่ปรึกษา',
        tags: ['#work', '#consulting'],
        status: 'simulated',
        sheetTarget: 'WRK_TIME_LOGS_V3'
      },
      {
        id: 'baseline-4',
        timestamp: `${today} 08:30:00`,
        timeLabel: '08:30 (วันนี้)',
        category: 'finance',
        subject: 'กาแฟสตาร์บัคส์ ดิ เอ็มควอเทียร์ (Starbucks)',
        value: '450.00',
        unit: 'THB',
        isIncome: false,
        details: 'ชาร์จบัตรเครดิต อาหารและเครื่องดื่มเช้าวันนี้',
        tags: ['#coffee', '#food', '#emquartier'],
        status: 'simulated',
        sheetTarget: 'FIN_TRANSACTIONS_V3'
      },
      {
        id: 'baseline-5',
        timestamp: `${today} 07:15:00`,
        timeLabel: '07:15 (วันนี้)',
        category: 'health',
        subject: 'บันทึกดัชนีสุขภาพตอนเช้า (Morning Biometrics)',
        value: '72.5',
        unit: 'kg',
        details: 'ค่าน้ำหนักตัวเสถียรดี, คะแนนการนอนหลับ 88/100 (Deep sleep พักผ่อนเต็มอิ่ม)',
        tags: ['#weight', '#sleep', '#health-score'],
        status: 'simulated',
        sheetTarget: 'HLT_HEALTH_METRICS_V3'
      }
    ];
    setTimelineEvents(baseline);
    safeLocalStorage.setItem('tuk_life_timeline_events', JSON.stringify(baseline));
  };

  const handleUpdateStatus = (event: TimelineEvent, newStatus: 'resolved' | 'ignored') => {
    const updatedEvents = timelineEvents.map(e => e.id === event.id ? {...e, status: newStatus} : e);
    setTimelineEvents(updatedEvents);
    safeLocalStorage.setItem('tuk_life_timeline_events', JSON.stringify(updatedEvents));
    logAudit('Updated Status', 'Timeline', event.id, 'SUCCESS', `Action: Changed status to ${newStatus}`);
    window.dispatchEvent(new Event('timeline-updated'));
  };

  const handleClearHistory = () => {
    setShowResetConfirm(true);
  };

  const handleDelete = (event: TimelineEvent) => {
    const updatedEvents = timelineEvents.map(e => e.id === event.id ? {...e, status: 'DELETED'} : e);
    setTimelineEvents(updatedEvents);
    safeLocalStorage.setItem('tuk_life_timeline_events', JSON.stringify(updatedEvents));
    logAudit('Deleted', 'Timeline', event.id, 'SUCCESS', `Action: Deleted ${event.subject}`);
    window.dispatchEvent(new Event('timeline-updated'));
  };

  const handleEdit = (event: TimelineEvent) => {
    console.log('DEBUG: handleEdit clicked for', event.id);
    setIsAddingEvent(true);
    setEditingEventId(event.id);
    setNewEvent({
      category: event.category || 'finance',
      type: event.type || '',
      subject: event.subject || '',
      value: (event.value || '').replace(/,/g, ''),
      unit: event.unit || 'THB',
      isIncome: event.isIncome || false,
      details: event.details || '',
      tags: event.tags ? event.tags.join(', ') : '',
      date: event.timestamp ? event.timestamp.slice(0, 10) : new Date().toISOString().slice(0, 10),
      time: event.timestamp ? event.timestamp.slice(11, 16) : new Date().toTimeString().slice(0, 5)
    });
  };
  const handleAddSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newEvent.type && newEvent.subject) {
        updatePresetData(newEvent.type, newEvent.subject);
    }
    
    // Validation
    const valFloat = parseFloat(newEvent.value.replace(/,/g, ''));
    if (!newEvent.subject.trim() || isNaN(valFloat)) {
      setToast({ message: language === 'th' ? 'กรุณากรอกข้อมูลให้ถูกต้อง!' : 'Please enter valid data!', type: 'error' });
      return;
    }

    // Real Data Quality Guard
    let isValid = true;
    if (newEvent.category === 'health') {
        if (newEvent.type === 'weight' && (valFloat < 30 || valFloat > 150)) isValid = false;
        if (newEvent.type === 'sleep' && (valFloat < 0 || valFloat > 16)) isValid = false;
        if (newEvent.type === 'calories' && (valFloat < 0 || valFloat > 6000)) isValid = false;
        if (newEvent.type === 'exercise' && (valFloat < 0 || valFloat > 300)) isValid = false;
    } else if (newEvent.category === 'finance') {
        if (valFloat <= 0) isValid = false;
    } else if (newEvent.category === 'work') {
        if (newEvent.type === 'work_hours' && (valFloat < 0 || valFloat > 24)) isValid = false;
        if (newEvent.type === 'english_study' && (valFloat < 0 || valFloat > 600)) isValid = false;
    } else if (newEvent.category === 'garage') {
        if (newEvent.type === 'fuel' && valFloat <= 0) isValid = false;
        if (newEvent.type === 'odometer') {
            const previousOdoEvent = timelineEvents.find(e => e.category === 'garage' && e.type === 'odometer');
            if (previousOdoEvent && valFloat <= parseFloat(previousOdoEvent.value.replace(/,/g, ''))) isValid = false;
        }
    }
    
    if (!newEvent.date || !newEvent.time) isValid = false;

    if (!isValid) {
      setToast({ message: 'กรุณาตรวจสอบข้อมูลอีกครั้ง', type: 'error' });
      return;
    }

    // Duplicate Check
    const customDate = newEvent.date || new Date().toISOString().slice(0, 10);
    const customTime = newEvent.time || new Date().toTimeString().slice(0, 5);
    const currentTime = new Date(`${customDate}T${customTime}:00`).getTime();
    
    const isDuplicate = timelineEvents.some(e => 
        e.category === newEvent.category &&
        e.type === newEvent.type &&
        e.subject === newEvent.subject &&
        (parseFloat(newEvent.value) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) === e.value &&
        e.timestamp.startsWith(customDate) &&
        Math.abs(new Date(e.timestamp).getTime() - currentTime) < 300000 // 5 minutes
    );

    if (isDuplicate) {
      setToast({ message: 'รายการนี้ถูกบันทึกแล้ว', type: 'error' });
      return;
    }

    setSubmitting(true);
    // const customTime = newEvent.time || new Date().toTimeString().slice(0, 5); // REMOVED
    const dateStr = customDate.replace(/-/g, '');
    const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

    // Map sheet targets based on category
    let sheetTarget = 'MASTER_LOGS_ACTIVE';
    if (newEvent.category === 'finance') sheetTarget = 'FIN_TRANSACTIONS_V3';
    else if (newEvent.category === 'health') sheetTarget = 'HLT_HEALTH_METRICS_V3';
    else if (newEvent.category === 'garage') sheetTarget = 'GAR_LOGS_V3';
    else if (newEvent.category === 'work') sheetTarget = 'WRK_TIME_LOGS_V3';
    else if (newEvent.category === 'travel') sheetTarget = 'TRA_LEISURE_LOGS_V3';
    else if (newEvent.category === 'lifestyle') sheetTarget = 'LIF_MEMORIES_LOGS_V3';

    const tagsArr = newEvent.tags
      ? newEvent.tags.split(',').map(t => t.trim().startsWith('#') ? t.trim() : `#${t.trim()}`)
      : [`#${newEvent.category}`, '#easy-entry'];

    const todayStr = new Date().toISOString().slice(0, 10);
    const timeLabelSuffix = customDate === todayStr ? (language === 'th' ? 'วันนี้' : 'Today') : (language === 'th' ? 'บันทึกย้อนหลัง' : 'Retroactive');

    let updatedEvents: TimelineEvent[];
    let newTimelineItem: TimelineEvent;

    if (editingEventId) {
      updatedEvents = timelineEvents.map(e => e.id === editingEventId ? {
        ...e,
        timestamp: `${customDate} ${customTime}:00`,
        timeLabel: `${customTime} (${timeLabelSuffix})`,
        category: newEvent.category,
        type: newEvent.type,
        subject: newEvent.subject,
        value: parseFloat(newEvent.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        unit: newEvent.unit,
        isIncome: newEvent.category === 'finance' ? newEvent.isIncome : undefined,
        details: newEvent.details,
        tags: tagsArr,
        sheetTarget
      } : e);
      newTimelineItem = updatedEvents.find(e => e.id === editingEventId)!;
      setEditingEventId(null);
    } else {
      newTimelineItem = {
        id: `custom-${Date.now()}`,
        timestamp: `${customDate} ${customTime}:00`,
        timeLabel: `${customTime} (${timeLabelSuffix})`,
        category: newEvent.category,
        type: newEvent.type,
        subject: newEvent.subject,
        value: parseFloat(newEvent.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        unit: newEvent.unit,
        isIncome: newEvent.category === 'finance' ? newEvent.isIncome : undefined,
        details: newEvent.details || (language === 'th' ? 'บันทึกกิจกรรมไลฟ์สไตล์ทั่วไป ปลอดภัยและเรียบง่าย' : 'General activity logged securely and simply.'),
        tags: tagsArr,
        status: 'simulated',
        sheetTarget
      };
      updatedEvents = [newTimelineItem, ...timelineEvents];
    }

    // Attempt direct real-time dispatch if WebApp URL is present
    const currentUrl = safeLocalStorage.getItem('tuk_life_web_app_url') || webAppUrl;
    if (currentUrl) {
      try {
        let payload: any = {};
        if (newEvent.category === 'finance') {
          payload = {
            transaction_id: `FIN-TXN-${dateStr}-${randSuffix}`,
            timestamp: newTimelineItem.timestamp,
            account_source_id: 'FIN-ACC-01',
            account_dest_id: '',
            flow_type: newEvent.isIncome ? 'RECEIPT' : 'EXPENSE',
            amount_thb: newEvent.value,
            category_code: 'FIN_FOOD',
            recipient: newEvent.subject,
            invoice_attachment: ''
          };
        } else if (newEvent.category === 'health') {
          payload = {
            metric_id: `HLT-MTR-${dateStr}`,
            date: customDate,
            weight_kg: newEvent.value,
            systolic_bp: '120',
            diastolic_bp: '80',
            resting_heart_rate: '65',
            notes: newEvent.details || 'Timeline-driven metric log'
          };
        } else if (newEvent.category === 'garage') {
          payload = {
            garage_log_id: `GAR-LOG-${dateStr}-${randSuffix}`,
            vehicle_id: 'GAR-VEH-01',
            log_type: 'FUEL',
            odometer_km: '124400',
            fuel_liters: newEvent.value,
            diagnostic_details: newEvent.details || 'Timeline Caltex refill'
          };
        } else {
          payload = {
            time_log_id: `WRK-LOG-${dateStr}-${randSuffix}`,
            project_id: 'WRK-PRJ-01',
            timestamp_start: `${customDate} 09:00:00`,
            timestamp_end: `${customDate} 11:00:00`,
            spent_minutes: newEvent.value,
            task_details: newEvent.details || 'Timeline-driven work log',
            billing_status: 'UNBILLED'
          };
        }

        const response = await fetch(currentUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'appendRow',
            sheetName: sheetTarget,
            rowData: payload
          }),
          redirect: 'follow'
        });

        if (response.ok) {
          const resJson = await response.json();
          if (resJson.status === 'success') {
            newTimelineItem.status = 'sent';
          }
        }
      } catch (err) {
        console.warn('Real Google Sheets dispatch skipped or failed, appending locally.');
      }
    }

    setTimelineEvents(updatedEvents);
    safeLocalStorage.setItem('tuk_life_timeline_events', JSON.stringify(updatedEvents));
    logAudit(editingEventId ? 'Edited' : 'Created', 'Timeline', newTimelineItem.id, 'SUCCESS', `Action: ${newEvent.type} ${newEvent.subject} ${newEvent.value} ${newEvent.unit}`);
    window.dispatchEvent(new Event('timeline-updated'));
    setToast({
      message: language === 'th' ? '✅ บันทึกข้อมูลแล้ว' : '✅ Saved successfully',
      type: 'success'
    });

    // Reset form states
    setNewEvent({
      category: 'finance',
      subject: '',
      value: '',
      unit: 'THB',
      isIncome: false,
      details: '',
      tags: '',
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5)
    });
    setIsAddingEvent(false);
    setSubmitting(false);
  };

  // Dynamic KPIs for Today Cockpit
  const cockpitStats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);

    const todayEvents = timelineEvents.filter(ev => ev.timestamp && ev.timestamp.startsWith(todayStr));
    const monthEvents = timelineEvents.filter(ev => ev.timestamp && ev.timestamp.startsWith(currentMonthPrefix));

    // Get Goals
    const savedGoals = safeLocalStorage.getItem('tuk_life_goals_standards');
    const goals = savedGoals ? JSON.parse(savedGoals) : {};
    
    // Progress helpers
    const calcProgress = (current: number, goal: number) => goal > 0 ? Math.min(100, (current / goal) * 100).toFixed(0) : 0;
    const formatGoal = (val: string | undefined | null) => val && val.trim() !== '' ? parseFloat(val) : null;

    const latestHealthEvent = timelineEvents.find(ev => ev.category === 'health' && (ev.unit === 'kg' || (ev.subject || '').toLowerCase().includes('น้ำหนัก') || (ev.subject || '').toLowerCase().includes('weight')));
    let weightVal = language === 'th' ? "ยังไม่มีข้อมูล" : "No data";
    let weightProg = "";
    if (latestHealthEvent) {
      const val = parseFloat(latestHealthEvent.value.replace(/,/g, ''));
      weightVal = `${val.toFixed(1)} kg`;
      const targetWeight = formatGoal(goals.targetWeight);
      weightProg = targetWeight !== null ? ` (${val.toFixed(1)}/${targetWeight}kg)` : (language === 'th' ? " (ยังไม่ได้ตั้งเป้า)" : " (No target)");
    }

    const latestSleepEvent = timelineEvents.find(ev => ev.category === 'health' && (((ev.subject || '').toLowerCase().includes('นอน') || (ev.subject || '').toLowerCase().includes('sleep'))));
    let sleepVal = language === 'th' ? "ยังไม่มีข้อมูล" : "No data";
    if (latestSleepEvent) {
      const valNum = parseFloat(latestSleepEvent.value.replace(/,/g, ''));
      sleepVal = `${valNum > 24 ? (valNum / 10).toFixed(1) : valNum.toFixed(1)} ชม.`;
    }

    const calEvents = todayEvents.filter(ev => ev.category === 'health' && (((ev.unit || '').toLowerCase().includes('cal') || (ev.subject || '').toLowerCase().includes('กิน') || (ev.subject || '').toLowerCase().includes('แคล') || (ev.subject || '').toLowerCase().includes('kcal'))));
    let todayCalories = 0;
    if (calEvents.length > 0) {
      todayCalories = calEvents.reduce((sum, ev) => sum + parseFloat(ev.value.replace(/,/g, '') || '0'), 0);
    }
    const calGoal = formatGoal(goals.dailyCaloriesGoal);
    const calProg = calGoal !== null ? calcProgress(todayCalories, calGoal) : null;

    const todayFinanceExpenses = todayEvents.filter(ev => ev.category === 'finance' && !ev.isIncome);
    const todaySpending = todayFinanceExpenses.reduce((sum, ev) => sum + parseFloat(ev.value.replace(/,/g, '') || '0'), 0);

    const monthlyFinanceExpenses = monthEvents.filter(ev => ev.category === 'finance' && !ev.isIncome);
    const monthlySpending = monthlyFinanceExpenses.reduce((sum, ev) => sum + parseFloat(ev.value.replace(/,/g, '') || '0'), 0);
    const spendingLimit = formatGoal(goals.monthlySpendingLimit?.replace(/,/g, ''));
    const financeProg = spendingLimit !== null ? calcProgress(monthlySpending, spendingLimit) : null;

    const todayTasks = todayEvents.filter(ev => ev.category === 'work').length;
    const totalTodayHours = todayEvents.filter(ev => ev.category === 'work').reduce((sum, ev) => {
      const v = parseFloat(ev.value.replace(/,/g, '') || '0');
      return sum + (ev.unit === 'Minutes' ? v / 60 : v);
    }, 0);
    
    // Monthly hours
    const monthHours = monthEvents.filter(ev => ev.category === 'work').reduce((sum, ev) => {
      const v = parseFloat(ev.value.replace(/,/g, '') || '0');
      return sum + (ev.unit === 'Minutes' ? v / 60 : v);
    }, 0);
    const workTarget = formatGoal(goals.monthlyWorkTarget);
    const workProg = workTarget !== null ? calcProgress(monthHours, workTarget) : null;

    const todayLifestyleEvents = todayEvents.filter(ev => ev.category === 'lifestyle' || ev.category === 'travel');
    const todayActivitiesCount = todayLifestyleEvents.length;

    return {
      weight: weightVal,
      weightProg: weightProg,
      sleep: sleepVal,
      calories: calGoal !== null ? `${todayCalories.toLocaleString()} / ${calGoal.toLocaleString()} kcal` : (language === 'th' ? "ยังไม่ได้ตั้งเป้า" : "No target"),
      calProg: calProg !== null ? `${calProg}%` : "0%",
      todaySpending: todaySpending.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' THB',
      monthlySpending: monthlySpending.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' THB',
      financeProg: financeProg !== null ? `${financeProg}%` : "0%",
      todayTasksCount: todayTasks,
      todayHours: totalTodayHours.toFixed(1),
      monthHours: monthHours.toFixed(1),
      monthWorkTarget: workTarget || 0,
      workProg: workProg !== null ? `${workProg}%` : "0%",
      todayActivitiesCount,
      hasCalGoal: calGoal !== null,
      hasFinanceGoal: spendingLimit !== null,
      hasWorkGoal: workTarget !== null
    };
  }, [timelineEvents, language]);

  // Filter events based on search query & selected filter category & date filter
  const filteredEvents = timelineEvents.filter(event => {
    if (event.status === 'DELETED') return false;
    const matchesSearch = (event.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (event.details || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (event.tags && event.tags.some(t => (t || '').toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesCategory = selectedFilter === 'all' || event.category === selectedFilter;

    const eventDateStr = event.timestamp ? event.timestamp.substring(0, 10) : '';
    
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    
    let matchesDate = false;
    if (dateFilterMode === 'all') {
      matchesDate = true;
    } else if (dateFilterMode === 'today') {
      matchesDate = eventDateStr === todayStr;
    } else if (dateFilterMode === 'yesterday') {
      matchesDate = eventDateStr === yesterdayStr;
    } else if (dateFilterMode === 'last7days') {
      const d = new Date(eventDateStr);
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      matchesDate = d >= sevenDaysAgo;
    } else if (dateFilterMode === 'custom') {
      matchesDate = !filterDate || eventDateStr === filterDate;
    }
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  // Group filtered events by date (YYYY-MM-DD)
  const groupedEvents = useMemo(() => {
    const filteredEvents = timelineEvents.filter(event => {
      if (event.status === 'DELETED') return false;
      const trans = translations[event.id] || {};
      const subject = (trans.subject || event.subject || '').toLowerCase();
      const details = (trans.details || event.details || '').toLowerCase();
      const matchesSearch = subject.includes(searchQuery.toLowerCase()) ||
                            details.includes(searchQuery.toLowerCase()) ||
                            (event.tags && event.tags.some(t => (t || '').toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesCategory = selectedFilter === 'all' || event.category === selectedFilter;

      const eventDateStr = event.timestamp ? event.timestamp.substring(0, 10) : '';
      
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      
      let matchesDate = false;
      if (dateFilterMode === 'all') {
        matchesDate = true;
      } else if (dateFilterMode === 'today') {
        matchesDate = eventDateStr === todayStr;
      } else if (dateFilterMode === 'yesterday') {
        matchesDate = eventDateStr === yesterdayStr;
      } else if (dateFilterMode === 'last7days') {
        const d = new Date(eventDateStr);
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        matchesDate = d >= sevenDaysAgo;
      } else if (dateFilterMode === 'custom') {
        matchesDate = !filterDate || eventDateStr === filterDate;
      }
      
      return matchesSearch && matchesCategory && matchesDate;
    });

    return filteredEvents.reduce<Record<string, TimelineEvent[]>>((groups, event) => {
      const dateStr = event.timestamp ? event.timestamp.substring(0, 10) : new Date().toISOString().substring(0, 10);
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      // Inject translated fields here!
      const trans = translations[event.id] || {};
      groups[dateStr].push({ ...event, ...trans });
      return groups;
    }, {});
  }, [timelineEvents, translations, searchQuery, selectedFilter, dateFilterMode, filterDate]);

  // Sort dates descending
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => b.localeCompare(a));

  const getFriendlyDateHeader = (dateStr: string) => {
    try {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      if (dateStr === todayStr) {
        return language === 'th' ? "✨ วันนี้ (Today)" : "✨ Today";
      } else if (dateStr === yesterdayStr) {
        return language === 'th' ? "📅 เมื่อวานนี้ (Yesterday)" : "📅 Yesterday";
      }

      const dateParts = dateStr.split('-');
      if (dateParts.length === 3) {
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const day = parseInt(dateParts[2], 10);
        const d = new Date(year, month, day);
        
        return d.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  const getCategoryEmoji = (subject: string, category: string) => {
    const subLow = (subject || '').toLowerCase();
    if (subLow.includes('pad see ew') || subLow.includes('ผัดซีอิ๊ว') || subLow.includes('อาหาร') || subLow.includes('food') || subLow.includes('บะหมี่') || subLow.includes('noodles') || subLow.includes('กิน') || subLow.includes('ทาน')) return '🍜';
    if (subLow.includes('coffee') || subLow.includes('กาแฟ') || subLow.includes('starbucks') || subLow.includes('สตาร์บัคส์')) return '☕';
    if (subLow.includes('run') || subLow.includes('วิ่ง') || subLow.includes('exercise') || subLow.includes('ออกกำลังกาย')) return '🏃';
    if (subLow.includes('sleep') || subLow.includes('นอน') || subLow.includes('หลับ') || subLow.includes('ค่านอน')) return '😴';
    if (subLow.includes('money') || subLow.includes('เงิน') || subLow.includes('fee') || subLow.includes('โอน')) return '💰';
    if (subLow.includes('fuel') || subLow.includes('น้ำมัน') || subLow.includes('คาลเท็กซ์')) return '⛽';
    if (subLow.includes('weight') || subLow.includes('น้ำหนัก')) return '⚖️';
    
    switch (category) {
      case 'finance': return '💵';
      case 'health': return '❤️';
      case 'garage': return '🚗';
      case 'work': return '💼';
      case 'travel': return '✈️';
      case 'lifestyle': return '🌸';
      default: return '📌';
    }
  };

  const getCategoryConfig = (category: 'finance' | 'health' | 'garage' | 'work' | 'travel' | 'lifestyle') => {
    switch (category) {
      case 'finance':
        return {
          icon: <DollarSign className="w-4 h-4 text-emerald-500" />,
          colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
          dotColor: 'bg-emerald-505 ring-emerald-100',
          label: language === 'th' ? 'การเงิน' : 'Finance'
        };
      case 'health':
        return {
          icon: <Heart className="w-4 h-4 text-rose-500" />,
          colorClass: 'bg-rose-50 text-rose-800 border-rose-200/60',
          dotColor: 'bg-rose-500 ring-rose-100',
          label: language === 'th' ? 'สุขภาพ' : 'Health'
        };
      case 'garage':
        return {
          icon: <Car className="w-4 h-4 text-amber-500" />,
          colorClass: 'bg-amber-50 text-amber-800 border-amber-200/60',
          dotColor: 'bg-amber-500 ring-amber-100',
          label: language === 'th' ? 'รถยนต์' : 'Garage'
        };
      case 'work':
        return {
          icon: <Briefcase className="w-4 h-4 text-blue-500" />,
          colorClass: 'bg-blue-50 text-blue-800 border-blue-200/60',
          dotColor: 'bg-blue-505 ring-blue-100',
          label: language === 'th' ? 'การงาน' : 'Work'
        };
      case 'travel':
        return {
          icon: <Plane className="w-4 h-4 text-purple-500" />,
          colorClass: 'bg-purple-50 text-purple-800 border-purple-200/60',
          dotColor: 'bg-purple-500 ring-purple-100',
          label: language === 'th' ? 'การเดินทาง' : 'Travel'
        };
      case 'lifestyle':
        return {
          icon: <Activity className="w-4 h-4 text-pink-500" />,
          colorClass: 'bg-pink-50 text-pink-800 border-pink-200/60',
          dotColor: 'bg-pink-505 ring-pink-100',
          label: language === 'th' ? 'ไลฟ์สไตล์' : 'Lifestyle'
        };
    }
  };

  return (
    <div className="p-4 space-y-6">
      <QuickActionsGrid language={language} onActionSelect={(cat, sub, typ) => setNewEvent(p => ({ ...p, category: cat as any, subject: sub, type: typ }))} />
      <VoiceQuickEntry language={language} onSave={(data) => { setNewEvent(data); handleAddSubmit({ preventDefault: () => {} } as any); }} />
      <div className="bg-white border p-4 rounded-xl shadow-sm">
        <h3 className="font-bold text-xs uppercase text-slate-800 mb-4">{language === 'th' ? 'เพิ่มรายการด่วน' : 'Quick Add'}</h3>
        <form onSubmit={handleAddSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {newEvent.type === 'calories' ? (
              <PresetPicker type="food" items={FOOD_PRESETS} onSelect={(val) => setNewEvent(p => ({...p, subject: val}))} placeholder="Search Food..." presetSearch={presetSearch} setPresetSearch={setPresetSearch} />
            ) : newEvent.type === 'mood' ? (
              <PresetPicker type="mood" items={MOOD_PRESETS} onSelect={(val) => setNewEvent(p => ({...p, subject: val}))} placeholder="Search Mood..." presetSearch={presetSearch} setPresetSearch={setPresetSearch} />
            ) : newEvent.type === 'exercise' ? (
              <PresetPicker type="exercise" items={EXERCISE_PRESETS} onSelect={(val) => setNewEvent(p => ({...p, subject: val}))} placeholder="Search Exercise..." presetSearch={presetSearch} setPresetSearch={setPresetSearch} />
            ) : newEvent.type === 'fuel' ? (
              <PresetPicker type="fuel" items={FUEL_PRESETS} onSelect={(val) => setNewEvent(p => ({...p, subject: val}))} placeholder="Search Station..." presetSearch={presetSearch} setPresetSearch={setPresetSearch} />
            ) : newEvent.type === 'work_hours' ? (
              <PresetPicker type="work" items={WORK_PRESETS} onSelect={(val) => setNewEvent(p => ({...p, subject: val}))} placeholder="Search Task..." presetSearch={presetSearch} setPresetSearch={setPresetSearch} />
            ) : (
              <input type="text" placeholder={curr.subjectPlaceholder} value={newEvent.subject} onChange={(e) => setNewEvent({ ...newEvent, subject: e.target.value })} className="col-span-2 border rounded p-2 text-xs" required />
            )}
            <input type="number" placeholder={curr.amountMetric} value={newEvent.value} onChange={(e) => setNewEvent({ ...newEvent, value: e.target.value })} className="border rounded p-2 text-xs col-span-2" required />
          </div>

          <button type="button" onClick={() => setIsFormAdvanced(!isFormAdvanced)} className="text-xs font-bold text-indigo-600 block">
            {isFormAdvanced ? '▲ ซ่อนตัวเลือกเพิ่มเติม' : '▼ ตัวเลือกเพิ่มเติม'}
          </button>

          {isFormAdvanced && (
            <div className="grid grid-cols-2 gap-2 mt-2 p-2 bg-slate-50 rounded-lg border">
                <button type="button" onClick={saveTemplate} className="col-span-2 bg-amber-500 text-white font-bold p-2 rounded text-xs">⭐ {language === 'th' ? 'บันทึกเป็นเทมเพลต' : 'Save as Template'}</button>
                <div className="col-span-2 space-y-1">
                    <div className="text-[10px] font-bold text-slate-500">⭐ {language === 'th' ? 'เทมเพลตของฉัน' : 'My Templates'}</div>
                    <div className="grid grid-cols-2 gap-1">
                        {templates.map((t, idx) => (
                            <button type="button" key={t.id || `tpl-${idx}`} onClick={() => setNewEvent(t)} className="p-1 rounded bg-amber-50 text-[10px] truncate text-left">{t.subject}</button>
                        ))}
                    </div>
                </div>

                <div className="col-span-2 space-y-2">
                    <PresetPicker type="location" items={LOCATION_PRESETS} onSelect={(val) => setNewEvent(p => ({...p, details: p.details ? `${p.details}, ${val}` : val}))} placeholder="Search Location..." presetSearch={presetSearch} setPresetSearch={setPresetSearch} />
                    <button type="button" onClick={() => {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                                (pos) => setNewEvent(p => ({...p, details: p.details ? `${p.details}, ${pos.coords.latitude}, ${pos.coords.longitude}` : `${pos.coords.latitude}, ${pos.coords.longitude}`})),
                                (err) => alert('Geolocation failed')
                            );
                        }
                    }} className="w-full bg-slate-200 p-2 rounded text-xs font-bold">📍 ใช้ตำแหน่งปัจจุบัน</button>
                </div>

                <select value={newEvent.category} onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as any })} className="border rounded p-2 text-xs col-span-2">
                  <option value="finance">Finance</option>
                  <option value="health">Health</option>
                  <option value="garage">Garage</option>
                  <option value="work">Work</option>
                  <option value="travel">Travel</option>
                  <option value="lifestyle">Lifestyle</option>
                </select>
                <input type="text" placeholder={curr.detailsLabel} value={newEvent.details} onChange={(e) => setNewEvent({ ...newEvent, details: e.target.value })} className="col-span-2 border rounded p-2 text-xs" />
            </div>
          )}

          <button type="submit" className="w-full bg-teal-500 text-white font-bold p-2 rounded text-xs" disabled={submitting}>
            {submitting ? curr.saving : language === 'th' ? 'บันทึก Timeline' : 'Save Timeline'}
          </button>
        </form>
      </div>
      
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700">ปฏิทินบันทึกย้อนหลัง</label>
        <div className="bg-white border rounded-lg p-3 cursor-pointer" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
           <div className="flex justify-between items-center text-xs font-bold text-slate-700">
               <span>📅 {language === 'th' ? 'วันที่เลือก: ' : 'Selected Date: '} {filterDate || (language === 'th' ? 'ทั้งหมด' : 'All')}</span>
               <span>{isCalendarOpen ? '▲' : '▼'}</span>
           </div>
           <div className="text-[10px] text-slate-500 mt-1">
               {language === 'th' ? 'รายการวันนี้: ' : 'Today\'s records: '} {timelineEvents.filter(e => e.timestamp?.startsWith(new Date().toISOString().slice(0, 10))).length}
           </div>
           <div className="flex gap-2 mt-2">
               <button onClick={(e) => { e.stopPropagation(); setDateFilterMode('today'); setFilterDate(new Date().toISOString().slice(0, 10)); setIsCalendarOpen(false); }} className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold">วันนี้</button>
               <button onClick={(e) => { e.stopPropagation(); setDateFilterMode('yesterday'); const y = new Date(); y.setDate(y.getDate() - 1); setFilterDate(y.toISOString().slice(0, 10)); setIsCalendarOpen(false); }} className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold">เมื่อวาน</button>
               <button onClick={(e) => { e.stopPropagation(); setDateFilterMode('all'); setFilterDate(''); setIsCalendarOpen(false); }} className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold">ทั้งหมด</button>
           </div>
        </div>
        {isCalendarOpen && (
            <div className="bg-white border rounded-lg p-3 mt-1">

          <div className="flex justify-between items-center mb-3">
            <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1))}>&lt;</button>
            <span className="text-xs font-bold">{viewMonth.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}</span>
            <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1))}>&gt;</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-500 mb-1">
            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay() }, (_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate() }, (_, i) => {
               const day = i + 1;
               const dateStr = `${viewMonth.getFullYear()}-${(viewMonth.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
               const count = timelineEvents.filter(e => e.timestamp?.startsWith(dateStr) && e.status !== 'DELETED').length;
               return (
                 <button key={day} onClick={() => { setFilterDate(dateStr); setDateFilterMode('custom'); }} className={`text-[10px] p-1 rounded ${filterDate === dateStr && dateFilterMode === 'custom' ? 'bg-teal-100' : 'hover:bg-slate-50'}`}>
                   {day}
                   {count > 0 && <div className="text-[8px] text-teal-600 font-bold">{count}</div>}
                 </button>
               );
            })}
          </div>
        </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="ค้นหา Timeline…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded p-2 text-xs flex-1"
        />
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value as any)}
          className="border rounded p-2 text-xs"
        >
          <option value="all">ทั้งหมด</option>
          <option value="finance">Finance</option>
          <option value="health">Health</option>
          <option value="work">Work</option>
          <option value="garage">Garage</option>
          <option value="travel">Travel</option>
          <option value="lifestyle">Lifestyle</option>
        </select>
      </div>

      <div className="space-y-4">
        {sortedDates.map(dateGroup => (
           <div key={dateGroup} className="bg-white border rounded-xl p-4 shadow-sm">
             <h4 className="font-bold text-xs text-slate-700 mb-3">{getFriendlyDateHeader(dateGroup)}</h4>
             <div className="space-y-2">
               {groupedEvents[dateGroup].map((event, index) => (
                 <React.Fragment key={event.id || `evt-${index}`}>
                 <div onClick={() => setSelectedEvent(event)} className="border rounded-lg p-3 text-xs flex justify-between items-start cursor-pointer hover:bg-slate-50">
                   <div>
                     <div className="font-bold text-slate-900">{event.subject}</div>
                     <div className="text-slate-500 mt-1">
                       {event.timeLabel} • {curr[event.category as keyof typeof curr] || event.category} • {event.value} {event.unit}
                     </div>
                     <div className="mt-1 text-[10px] font-bold">
                       {event.status === 'sent' ? curr.synced :
                        event.status === 'failed' ? curr.failed :
                        curr.pending}
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <button onClick={() => handleEdit(event)} className="text-teal-600 font-bold">แก้ไข</button>
                     <button onClick={() => handleDelete(event)} className="text-rose-600 font-bold">ลบ</button>
                   </div>
                 </div>
                 {selectedEvent && selectedEvent.id === event.id && ( /* detail */
                     <div className="bg-white border rounded-xl p-4 shadow-sm mt-2">
                      {/* 1. Header Updated */}
                      <div className="flex justify-between items-start mb-3 gap-2 border-b pb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-slate-100 rounded-lg flex-shrink-0">
                            {selectedEvent.category === 'finance' && <DollarSign className="w-4 h-4 text-slate-600" />}
                            {selectedEvent.category === 'health' && <Heart className="w-4 h-4 text-slate-600" />}
                            {selectedEvent.category === 'work' && <Briefcase className="w-4 h-4 text-slate-600" />}
                            {selectedEvent.category === 'garage' && <Car className="w-4 h-4 text-slate-600" />}
                            {['food', 'lifestyle'].includes(selectedEvent.category) && <Sparkles className="w-4 h-4 text-slate-600" />}
                            {!['finance', 'health', 'work', 'garage', 'food', 'lifestyle'].includes(selectedEvent.category) && <Info className="w-4 h-4 text-slate-600" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-sm text-slate-800">{translations[selectedEvent.id]?.subject || selectedEvent.subject}</h4>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-sm text-emerald-600">{selectedEvent.value} {selectedEvent.unit}</div>
                          <div className="text-[10px] text-slate-400">{language === 'th' ? 'จำนวนเงิน' : 'Amount'}</div>
                        </div>
                      </div>

                      {/* 2. Summary Row */}
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg mb-4">
                         <div className="flex items-center gap-1.5 min-w-0">
                           <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                           <span className="truncate">
                             <strong>{language === 'th' ? 'วันที่: ' : 'Date: '}</strong>
                             {formatDetailDate(selectedEvent.timestamp, language)}
                           </span>
                         </div>
                         <div className="flex items-center gap-1.5 min-w-0">
                           <Folder className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                           <span className="truncate">
                             <strong>{language === 'th' ? 'หมวดหมู่: ' : 'Category: '}</strong>
                             {getCategoryLabel(selectedEvent.category, language)}
                           </span>
                         </div>
                         <div className="flex items-center gap-1.5 min-w-0">
                           <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                           <span className="truncate">
                             <strong>{language === 'th' ? 'สถานที่: ' : 'Location: '}</strong>
                             {getEventLocation(timelineEvents.find(e => e.id === selectedEvent?.id) || selectedEvent) || (language === 'th' ? 'ไม่ระบุ' : 'N/A')}
                           </span>
                         </div>
                         <div className="flex items-center gap-1.5 min-w-0">
                           <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                             selectedEvent.status === 'sent' || selectedEvent.status === 'synced' ? 'bg-emerald-500' : 'bg-amber-500'
                           }`} />
                           <span className="truncate">
                             <strong>{language === 'th' ? 'สถานะ: ' : 'Status: '}</strong>
                             {language === 'th' ? (selectedEvent.status === 'sent' || selectedEvent.status === 'synced' ? 'ซิงก์แล้ว' : 'อยู่ระหว่างดำเนินการ') : (selectedEvent.status === 'sent' || selectedEvent.status === 'synced' ? 'Synced' : 'Pending')}
                           </span>
                         </div>

                      </div>

                      {/* 3. Main Details */}
                      <div className="mb-4">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          {language === 'th' ? 'รายละเอียด' : 'Notes'}
                        </div>
                        <div className="text-xs text-slate-700 bg-slate-50 border border-slate-100 p-3 rounded-lg whitespace-pre-line leading-relaxed">
                          {translations[selectedEvent.id]?.details || selectedEvent.details || (language === 'th' ? 'ไม่มีรายละเอียดเพิ่มเติม' : 'No details available')}
                        </div>
                      </div>

                      {/* 4. Metadata Section */}
                      <div className="border-t pt-3 mt-3">
                        <button onClick={() => setIsMetadataCollapsed(!isMetadataCollapsed)} className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 mb-2 hover:text-slate-800 transition-colors">
                          <span>{language === 'th' ? 'ข้อมูลเพิ่มเติม' : 'Metadata'}</span>
                          {isMetadataCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                        </button>
                        {!isMetadataCollapsed && (
                          <div className="text-[10px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1.5 font-mono">
                            <p><strong>{language === 'th' ? 'แท็ก' : 'Tags'}:</strong> {selectedEvent.tags?.join(', ') || 'None'}</p>
                            <p><strong>{language === 'th' ? 'แหล่งที่มา' : 'Source'}:</strong> {selectedEvent.sheetTarget || 'N/A'}</p>
                            <p><strong>{language === 'th' ? 'ข้อมูล OCR' : 'Raw OCR'}:</strong> {selectedEvent.rawOcr || 'N/A'}</p>
                            <p><strong>{language === 'th' ? 'รหัสฐานข้อมูล' : 'Database ID'}:</strong> {selectedEvent.id}</p>
                          </div>
                        )}
                      </div>

                      <button onClick={(e) => { e.stopPropagation(); setSelectedEvent(null); }} className="mt-4 w-full bg-slate-800 p-2 rounded text-xs font-bold text-white transition-colors hover:bg-slate-900">
                        {language === 'th' ? 'ปิดรายละเอียด' : 'Close'}
                      </button>
                    </div>
                  )}
                 </React.Fragment>
               ))}
             </div>
           </div>
        ))}
      </div>
    </div>
  );
}

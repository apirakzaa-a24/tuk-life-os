import type { AIEntry, AIInputType, AIModuleTarget, AIQuickCommandResult, AIRecordKind } from './aiTypes';

const STORAGE_KEY = 'tuk_os_ai_entries_v1';

const moduleKeywords: Record<AIModuleTarget, string[]> = {
  dashboard: ['dashboard', 'สรุป', 'ภาพรวม'],
  finance: ['เงิน', 'รายจ่าย', 'รายรับ', 'หนี้', 'ผ่อน', 'บัตร', 'บาท', 'thb', 'ราคา', 'งบ', 'ลงทุน', 'ค่าใช้จ่าย'],
  health: ['สุขภาพ', 'น้ำหนัก', 'ป่วย', 'ยา', 'นอน', 'แคลอรี', 'อาหาร', 'ความดัน', 'น้ำตาล', 'kg', 'kcal'],
  fitness: ['ออกกำลังกาย', 'วิ่ง', 'เวท', 'ยิม', 'กระโดดเชือก', 'jump', 'rope', 'workout', 'run', 'kcal'],
  travel: ['เที่ยว', 'ทริป', 'บิน', 'โรงแรม', 'visa', 'passport', 'beijing', 'hanoi', 'ญี่ปุ่น', 'เดินทาง'],
  vehicle: ['รถ', 'byd', 'honda', 'ยาง', 'ซ่อม', 'ประกันรถ', 'ภาษีรถ', 'ชาร์จ', 'ev'],
  work: ['งาน', 'satys', 'supplier', 'po', 'email', 'หัวหน้า', 'ประชุม', 'follow'],
  machine: ['เครื่องจักร', 'motor', 'komax', 'wg-825', 'trd801', 'injection', 'pm', 'bm', 'สกรู'],
  learning: ['เรียน', 'อังกฤษ', 'จีน', 'ศัพท์', 'speaking', 'ภาษา'],
  home: ['บ้าน', 'ห้อง', 'เช่า', 'ตกแต่ง', 'โซฟา', 'ตู้', 'ไฟ'],
  family: ['ลูก', 'แฟน', 'ครอบครัว', 'เด็ก', 'นัดหมอ'],
  goals: ['เป้าหมาย', 'goal', 'mission', 'สำเร็จ'],
  habits: ['habit', 'กิจวัตร', 'ทุกวัน', 'streak'],
  winfile: ['win', 'สำเร็จ', 'achievement', 'ภูมิใจ'],
  notes: ['note', 'โน้ต', 'จด', 'ข้อความ', 'ไอเดีย'],
  shopping: ['ซื้อ', 'ของ', 'shopping', 'ราคา', 'ลิสต์'],
  documents: ['เอกสาร', 'resume', 'pdf', 'ใบ', 'สัญญา', 'คู่มือ'],
  reminders: ['เตือน', 'นัด', 'deadline', 'ตาม', 'รอ', 'remind'],
};

function id(): string {
  return `ai_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

export function detectTargetModule(text: string): AIModuleTarget {
  const value = normalize(text);
  let best: AIModuleTarget = 'notes';
  let bestScore = 0;

  for (const [module, keywords] of Object.entries(moduleKeywords) as [AIModuleTarget, string[]][]) {
    const score = keywords.reduce((sum, keyword) => sum + (value.includes(keyword.toLowerCase()) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = module;
    }
  }
  return best;
}

export function detectKind(text: string): AIRecordKind {
  const value = normalize(text);
  if (/(จ่าย|ซื้อ|ราคา|บาท|thb|ผ่อน|รายรับ|รายจ่าย)/i.test(value)) return 'transaction';
  if (/(เป้าหมาย|goal|ลด|เพิ่ม|ภายใน|target)/i.test(value)) return 'goal';
  if (/(ต้อง|todo|ทำ|ตาม|รอ|deadline|เตือน)/i.test(value)) return 'task';
  if (/(น้ำหนัก|kg|kcal|กิโล|ชั่วโมง|ครั้ง|เปอร์เซ็น|%)/i.test(value)) return 'metric';
  if (/(แผน|plan|ทริป|ตาราง|schedule)/i.test(value)) return 'plan';
  return 'note';
}

export function extractAmount(text: string): { amount?: number; unit?: string } {
  const match = text.match(/([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+)\s*(บาท|thb|kg|กก|kcal|cal|km|กม|ครั้ง|%|เปอร์เซ็นต์)?/i);
  if (!match) return {};
  return {
    amount: Number(match[1].replace(/,/g, '')),
    unit: match[2] || undefined,
  };
}

export function analyzeText(text: string, inputType: AIInputType = 'chat'): AIQuickCommandResult {
  const targetModule = detectTargetModule(text);
  const kind = detectKind(text);
  const amount = extractAmount(text);
  const shortText = text.trim().slice(0, 80) || 'AI Note';
  const tags = [targetModule, kind].filter(Boolean);

  return {
    targetModule,
    kind,
    title: shortText,
    summary: `AI วิเคราะห์ว่าเกี่ยวกับ ${targetModule} ประเภท ${kind}`,
    suggestedAction: `บันทึกข้อมูลนี้เข้าโมดูล ${targetModule} และตรวจรายละเอียดอีกครั้ง`,
    amount: amount.amount,
    unit: amount.unit,
    tags,
  };
}

export function calculateExpression(expression: string): string {
  const safe = expression.replace(/[^0-9+\-*/().%\s]/g, '');
  if (!safe.trim()) return 'กรุณาใส่สูตรคำนวณ เช่น 17796*12 หรือ 81000-30000';
  try {
    // Local calculator only. Input is sanitized to basic math characters above.
    // eslint-disable-next-line no-new-func
    const result = Function(`return (${safe})`)();
    if (typeof result !== 'number' || Number.isNaN(result)) return 'คำนวณไม่ได้';
    return new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(result);
  } catch {
    return 'สูตรไม่ถูกต้อง';
  }
}

export function createAIEntry(params: {
  inputType: AIInputType;
  text: string;
  targetModule?: AIModuleTarget;
  attachmentName?: string;
  attachmentPreview?: string;
}): AIEntry {
  const analyzed = analyzeText(params.text, params.inputType);
  const now = new Date().toISOString();
  return {
    id: id(),
    createdAt: now,
    updatedAt: now,
    inputType: params.inputType,
    targetModule: params.targetModule || analyzed.targetModule,
    kind: analyzed.kind,
    title: analyzed.title,
    originalText: params.text,
    aiSummary: analyzed.summary,
    suggestedAction: analyzed.suggestedAction,
    amount: analyzed.amount,
    unit: analyzed.unit,
    tags: analyzed.tags,
    linkedTo: [params.targetModule || analyzed.targetModule],
    attachmentName: params.attachmentName,
    attachmentPreview: params.attachmentPreview,
  };
}

export function getAIEntries(): AIEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAIEntry(entry: AIEntry): AIEntry[] {
  const next = [entry, ...getAIEntries()];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function deleteAIEntry(entryId: string): AIEntry[] {
  const next = getAIEntries().filter((entry) => entry.id !== entryId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearAIEntries(): void {
  localStorage.removeItem(STORAGE_KEY);
}

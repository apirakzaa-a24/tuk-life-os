import type { AIAnalysisResult, AIAttachment, AIEntry, AIInputType, AIModuleTarget, AIRecordKind } from './aiTypes';

const STORAGE_KEY = 'tuk_os_ai_entries_v2';
const LEGACY_KEY = 'tuk_os_ai_entries_v1';

const moduleKeywords: Record<AIModuleTarget, string[]> = {
  finance: ['เงิน', 'รายจ่าย', 'รายรับ', 'หนี้', 'ผ่อน', 'บัตร', 'บาท', 'thb', 'ราคา', 'งบ', 'ลงทุน', 'ค่าใช้จ่าย', 'receipt', 'invoice', 'total', 'vat'],
  health: ['สุขภาพ', 'น้ำหนัก', 'ป่วย', 'ยา', 'นอน', 'แคลอรี', 'อาหาร', 'ความดัน', 'น้ำตาล', 'kg', 'kcal', 'bmi', 'calorie'],
  fitness: ['ออกกำลังกาย', 'วิ่ง', 'เวท', 'ยิม', 'กระโดดเชือก', 'jump', 'rope', 'workout', 'run', 'steps', 'ก้าว'],
  travel: ['เที่ยว', 'ทริป', 'บิน', 'โรงแรม', 'visa', 'passport', 'beijing', 'hanoi', 'ญี่ปุ่น', 'เดินทาง', 'booking', 'flight'],
  vehicle: ['รถ', 'byd', 'honda', 'ยาง', 'ซ่อม', 'ประกันรถ', 'ภาษีรถ', 'ชาร์จ', 'ev', 'ไมล์', 'น้ำมัน'],
  work: ['งาน', 'satys', 'supplier', 'po', 'email', 'หัวหน้า', 'ประชุม', 'follow', 'meeting', 'ลูกค้า'],
  machine: ['เครื่องจักร', 'motor', 'komax', 'wg-825', 'trd801', 'injection', 'pm', 'bm', 'สกรู', 'maintenance', 'error'],
  learning: ['เรียน', 'อังกฤษ', 'จีน', 'ศัพท์', 'speaking', 'ภาษา', 'study'],
  home: ['บ้าน', 'ห้อง', 'เช่า', 'ตกแต่ง', 'โซฟา', 'ตู้', 'ไฟ', 'ซ่อมบ้าน'],
  family: ['ลูก', 'แฟน', 'ครอบครัว', 'เด็ก', 'นัดหมอ', 'baby'],
  goals: ['เป้าหมาย', 'goal', 'mission', 'ลด', 'เพิ่ม', 'ภายใน'],
  habits: ['habit', 'กิจวัตร', 'ทุกวัน', 'streak', 'น้ำ', 'ดื่มน้ำ'],
  winfile: ['win', 'สำเร็จ', 'achievement', 'ภูมิใจ', 'ผลงาน', 'หลักฐาน'],
  notes: ['note', 'โน้ต', 'จด', 'ข้อความ', 'ไอเดีย', 'idea'],
  shopping: ['ซื้อ', 'ของ', 'shopping', 'ราคา', 'ลิสต์', 'product', 'สินค้า'],
  documents: ['เอกสาร', 'resume', 'pdf', 'ใบ', 'สัญญา', 'คู่มือ', 'document', 'scan'],
  reminders: ['เตือน', 'นัด', 'deadline', 'ตาม', 'รอ', 'remind', 'due', 'appointment'],
};

function id(prefix = 'ai'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

function safeJson<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function createAttachmentId(): string {
  return id('att');
}

export function detectTargetModule(text: string, attachments: AIAttachment[] = []): AIModuleTarget {
  const attachmentText = attachments.map((file) => `${file.name} ${file.type} ${file.textContent || ''}`).join(' ');
  const value = normalize(`${text} ${attachmentText}`);
  let best: AIModuleTarget = 'notes';
  let bestScore = 0;

  for (const [module, keywords] of Object.entries(moduleKeywords) as [AIModuleTarget, string[]][]) {
    const score = keywords.reduce((sum, keyword) => sum + (value.includes(keyword.toLowerCase()) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = module;
    }
  }

  const hasImage = attachments.some((file) => file.kind === 'image');
  if (bestScore === 0 && hasImage) return 'documents';
  return best;
}

export function detectKind(text: string, inputType: AIInputType, target: AIModuleTarget): AIRecordKind {
  const value = normalize(text);
  if (inputType === 'calculator') return target === 'finance' ? 'transaction' : 'metric';
  if (/(จ่าย|ซื้อ|ราคา|บาท|thb|ผ่อน|รายรับ|รายจ่าย|total|vat|receipt|invoice)/i.test(value)) return 'transaction';
  if (/(เป้าหมาย|goal|ลด|เพิ่ม|ภายใน|target)/i.test(value)) return 'goal';
  if (/(ต้อง|todo|ทำ|ตาม|รอ|deadline|เตือน|นัด)/i.test(value)) return 'task';
  if (/(น้ำหนัก|kg|kcal|กิโล|ชั่วโมง|ครั้ง|เปอร์เซ็น|%|bmi|steps|ก้าว)/i.test(value)) return 'metric';
  if (/(แผน|plan|ทริป|ตาราง|schedule)/i.test(value)) return 'plan';
  if (/(เอกสาร|pdf|scan|ใบ|สัญญา|คู่มือ)/i.test(value)) return 'document';
  if (target === 'reminders') return 'reminder';
  return 'note';
}

export function extractAmount(text: string): { amount?: number; unit?: string } {
  const match = text.match(/([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+)\s*(บาท|thb|kg|กก|kcal|cal|km|กม|ครั้ง|ก้าว|steps|%|เปอร์เซ็นต์)?/i);
  if (!match) return {};
  return {
    amount: Number(match[1].replace(/,/g, '')),
    unit: match[2] || undefined,
  };
}

function extractFields(text: string, attachments: AIAttachment[], amount?: number, unit?: string) {
  const fields = [] as AIAnalysisResult['extractedFields'];
  if (amount !== undefined) fields.push({ key: 'amount', label: 'amount', value: amount, confidence: 92 });
  if (unit) fields.push({ key: 'unit', label: 'unit', value: unit, confidence: 88 });
  if (attachments.length) fields.push({ key: 'attachments', label: 'files', value: attachments.length, confidence: 99 });
  const dateMatch = text.match(/(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|วันนี้|พรุ่งนี้|today|tomorrow)/i);
  if (dateMatch) fields.push({ key: 'dateText', label: 'date', value: dateMatch[1], confidence: 80 });
  const lower = normalize(text);
  if (lower.includes('receipt') || lower.includes('ใบเสร็จ') || attachments.some((file) => /receipt|invoice|bill/i.test(file.name))) {
    fields.push({ key: 'documentType', label: 'document type', value: 'receipt/invoice', confidence: 78 });
  }
  return fields;
}

export function analyzeText(text: string, inputType: AIInputType = 'chat', attachments: AIAttachment[] = [], forcedTarget?: AIModuleTarget): AIAnalysisResult {
  const targetModule = forcedTarget || detectTargetModule(text, attachments);
  const kind = detectKind(text, inputType, targetModule);
  const amount = extractAmount(text);
  const source = text.trim() || (attachments.length ? `วิเคราะห์ไฟล์ ${attachments.map((file) => file.name).join(', ')}` : 'AI Note');
  const shortText = source.slice(0, 90);
  const attachmentTags = attachments.map((file) => file.kind).filter(Boolean);
  const tags = Array.from(new Set(['ai', targetModule, kind, inputType, ...attachmentTags]));
  const confidence = Math.min(99, 62 + (amount.amount !== undefined ? 12 : 0) + (attachments.length ? 15 : 0) + (targetModule !== 'notes' ? 10 : 0));
  const fields = extractFields(source, attachments, amount.amount, amount.unit);

  return {
    targetModule,
    kind,
    title: shortText,
    summary: `AI วิเคราะห์แล้วควรบันทึกเข้า ${targetModule} ประเภท ${kind}${attachments.length ? ` พร้อมไฟล์แนบ ${attachments.length} ไฟล์` : ''}`,
    aiSummary: `AI วิเคราะห์แล้วควรบันทึกเข้า ${targetModule} ประเภท ${kind}${attachments.length ? ` พร้อมไฟล์แนบ ${attachments.length} ไฟล์` : ''}`,
    suggestedAction: confidence >= 80 ? 'ตรวจสอบข้อมูลแล้วกดบันทึกเข้าระบบหลัก' : 'ข้อมูลยังไม่ชัด ควรตรวจทานก่อนบันทึก หรือบันทึกเป็น Notes',
    amount: amount.amount,
    unit: amount.unit,
    tags,
    confidence,
    extractedFields: fields,
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
  attachments?: AIAttachment[];
}): AIEntry {
  const attachments = params.attachments || [];
  const analyzed = analyzeText(params.text, params.inputType, attachments, params.targetModule);
  const now = new Date().toISOString();
  return {
    id: id(),
    createdAt: now,
    updatedAt: now,
    inputType: params.inputType,
    originalText: params.text,
    ...analyzed,
    linkedTo: [analyzed.targetModule],
    attachments,
    attachmentName: attachments[0]?.name,
    attachmentPreview: attachments[0]?.thumbnail || attachments[0]?.dataUrl,
  };
}

export function getAIEntries(): AIEntry[] {
  const current = safeJson<AIEntry[]>(localStorage.getItem(STORAGE_KEY), []);
  if (current.length) return current;
  const legacy = safeJson<any[]>(localStorage.getItem(LEGACY_KEY), []);
  return legacy.map((entry) => ({ ...entry, attachments: [], confidence: 60, extractedFields: [] })) as AIEntry[];
}

export function saveAIEntry(entry: AIEntry): AIEntry[] {
  const next = [entry, ...getAIEntries()].slice(0, 300);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function updateAIEntry(entry: AIEntry): AIEntry[] {
  const next = getAIEntries().map((item) => (item.id === entry.id ? { ...entry, updatedAt: new Date().toISOString() } : item));
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

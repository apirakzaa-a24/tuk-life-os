export type SheetConnectionStatus = 'not_configured' | 'ready_mock' | 'connected' | 'error';

export const googleSheetsConfig = {
  mode: 'mock-first',
  description: 'Sprint 8 foundation: prepared service layer for Google Sheets sync. Replace endpoint with Apps Script Web App URL when ready.',
  requiredSheets: [
    'profile_master',
    'timeline_events',
    'health_logs',
    'finance_transactions',
    'vehicle_assets',
    'work_tasks',
    'ai_memory',
    'settings',
  ],
};

export function getGoogleSheetsStatus(): { status: SheetConnectionStatus; message: string } {
  const endpoint = localStorage.getItem('TUK_GOOGLE_SHEETS_ENDPOINT');
  if (!endpoint) {
    return {
      status: 'ready_mock',
      message: 'พร้อมเชื่อม Google Sheets: ยังไม่ได้ใส่ Apps Script Web App URL',
    };
  }
  return { status: 'connected', message: 'ตั้งค่า Endpoint แล้ว พร้อม Sync ข้อมูล' };
}

export async function saveRecord(table: string, payload: Record<string, unknown>) {
  const endpoint = localStorage.getItem('TUK_GOOGLE_SHEETS_ENDPOINT');
  const record = {
    id: crypto.randomUUID?.() ?? String(Date.now()),
    table,
    payload,
    createdAt: new Date().toISOString(),
  };
  const localKey = `TUK_LOCAL_${table}`;
  const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
  localStorage.setItem(localKey, JSON.stringify([record, ...existing]));

  if (!endpoint) return { ok: true, mode: 'local_mock', record };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
  return { ok: res.ok, mode: 'google_sheets', record };
}

export function getLocalRecords(table: string) {
  return JSON.parse(localStorage.getItem(`TUK_LOCAL_${table}`) || '[]');
}

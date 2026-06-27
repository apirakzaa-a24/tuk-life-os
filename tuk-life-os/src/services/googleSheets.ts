export type SyncStatus = 'not_configured' | 'ready' | 'success' | 'error';

export async function syncToGoogleSheets(webAppUrl: string, payload: unknown): Promise<{status: SyncStatus; message: string}> {
  if (!webAppUrl) return { status: 'not_configured', message: 'ยังไม่ได้ใส่ Google Apps Script Web App URL' };
  try {
    await fetch(webAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'TUK_LIFE_OS', createdAt: new Date().toISOString(), payload }),
    });
    return { status: 'success', message: 'ส่งข้อมูลไป Google Sheets แล้ว' };
  } catch (e) {
    return { status: 'error', message: 'ส่งข้อมูลไม่สำเร็จ ตรวจ URL/Permission' };
  }
}

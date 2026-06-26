export type SyncStatus = "idle" | "checking" | "connected" | "error";

export type SheetConfig = {
  webAppUrl: string;
  sheetId: string;
  owner: string;
  lastSync: string;
};

const STORAGE_KEY = "tuk-life-os-google-sheets-config";

export const defaultSheetConfig: SheetConfig = {
  webAppUrl: "",
  sheetId: "",
  owner: "TUK",
  lastSync: "ยังไม่เคย Sync",
};

export function loadSheetConfig(): SheetConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultSheetConfig, ...JSON.parse(raw) } : defaultSheetConfig;
  } catch {
    return defaultSheetConfig;
  }
}

export function saveSheetConfig(config: SheetConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export async function testGoogleSheetsConnection(config: SheetConfig): Promise<{ ok: boolean; message: string }> {
  if (!config.webAppUrl.trim()) {
    return { ok: false, message: "ยังไม่ได้ใส่ Google Apps Script Web App URL" };
  }

  try {
    const url = new URL(config.webAppUrl);
    url.searchParams.set("action", "ping");
    const response = await fetch(url.toString(), { method: "GET" });
    if (!response.ok) {
      return { ok: false, message: `เชื่อมต่อไม่ได้: HTTP ${response.status}` };
    }
    return { ok: true, message: "เชื่อมต่อ Google Sheets ได้แล้ว" };
  } catch (error) {
    return { ok: false, message: "URL ยังไม่ถูกต้อง หรือ Web App ยังไม่ได้ Deploy" };
  }
}

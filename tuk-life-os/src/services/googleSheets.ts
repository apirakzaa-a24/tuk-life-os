export type SheetStatus = 'ready-to-configure' | 'connected' | 'offline';
export const googleSheetsService = {
  status: 'ready-to-configure' as SheetStatus,
  endpoint: '',
  async sync(moduleName: string, payload: unknown) {
    console.log('[Google Sheets Sync Placeholder]', moduleName, payload);
    return { ok: true, mode: 'mock', moduleName };
  },
};

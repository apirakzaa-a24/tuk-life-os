/**
 * TUK LIFE OS Google Sheets Sync - V5.1 Patch
 * Deploy as Web App:
 * Execute as: Me
 * Who has access: Anyone with the link (or your account only if using auth layer later)
 */
const SHEET_NAMES = [
  'Profile','Addresses','Contacts','Properties','Vehicles','Health','Finance','Work','Goals','Documents','Media','Timeline','Chat','Friends','Calls','AI_Memory','Settings','Trash','Data_Center'
];

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, app: 'TUK LIFE OS Sync', version: '5.1' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents || '{}');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheets_(ss);
  writeCollection_(ss, 'Profile', data.profile || []);
  writeCollection_(ss, 'Addresses', data.addresses || []);
  writeCollection_(ss, 'Contacts', data.contacts || []);
  writeCollection_(ss, 'Properties', data.properties || []);
  writeCollection_(ss, 'Vehicles', data.vehicles || []);
  writeCollection_(ss, 'Health', data.health || []);
  writeCollection_(ss, 'Finance', data.finance || []);
  writeCollection_(ss, 'Work', data.work || []);
  writeCollection_(ss, 'Goals', data.goals || []);
  writeCollection_(ss, 'Documents', data.documents || []);
  writeCollection_(ss, 'Media', data.media || []);
  writeCollection_(ss, 'Timeline', data.timeline || []);
  writeCollection_(ss, 'Chat', data.chat || []);
  writeCollection_(ss, 'Friends', data.friends || []);
  writeCollection_(ss, 'Calls', data.calls || []);
  writeCollection_(ss, 'AI_Memory', data.aiMemory || []);
  writeCollection_(ss, 'Trash', data.trash || []);
  writeCollection_(ss, 'Settings', [data.settings || {}]);
  writeDataCenter_(ss, data);
  return ContentService.createTextOutput(JSON.stringify({ ok: true, syncedAt: new Date().toISOString(), version:'5.1' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function ensureSheets_(ss) {
  SHEET_NAMES.forEach(name => { if (!ss.getSheetByName(name)) ss.insertSheet(name); });
}

function writeCollection_(ss, sheetName, rows) {
  const sh = ss.getSheetByName(sheetName);
  sh.clearContents();
  rows = Array.isArray(rows) ? rows : [];
  const allKeys = Array.from(new Set(rows.flatMap(r => Object.keys(flatten_(r)))));
  if (allKeys.length === 0) { sh.getRange(1,1).setValue('No data'); return; }
  sh.getRange(1,1,1,allKeys.length).setValues([allKeys]);
  const values = rows.map(r => { const f=flatten_(r); return allKeys.map(k => f[k] ?? ''); });
  if (values.length) sh.getRange(2,1,values.length,allKeys.length).setValues(values);
  sh.autoResizeColumns(1, Math.min(allKeys.length, 30));
}

function flatten_(obj) {
  const out = {};
  Object.keys(obj || {}).forEach(k => {
    const v = obj[k];
    if (k === 'dataUrl' && typeof v === 'string') out[k] = '[base64 image stored in app backup]';
    else out[k] = (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v;
  });
  return out;
}

function writeDataCenter_(ss, data) {
  const sh = ss.getSheetByName('Data_Center');
  sh.clearContents();
  const modules = ['profile','addresses','contacts','properties','vehicles','health','finance','work','goals','documents','media','timeline','chat','friends','calls','aiMemory','trash'];
  const rows = [['Module','Count','Last Sync','Version']].concat(modules.map(m => [m, ((data[m] || []).length || 0), new Date(), '5.1']));
  sh.getRange(1,1,rows.length,4).setValues(rows);
  sh.autoResizeColumns(1,4);
}

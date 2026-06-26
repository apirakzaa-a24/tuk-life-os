import { useState } from 'react';
import { Panel } from '../../components/Cards';
import { getGoogleSheetsStatus, googleSheetsConfig } from '../../services/googleSheets';

export function Settings() {
  const [endpoint, setEndpoint] = useState(localStorage.getItem('TUK_GOOGLE_SHEETS_ENDPOINT') || '');
  const status = getGoogleSheetsStatus();
  function save() { localStorage.setItem('TUK_GOOGLE_SHEETS_ENDPOINT', endpoint); alert('บันทึก Google Sheets Endpoint แล้ว'); }
  return <div className="pageStack"><Panel title="Settings" icon="⚙️"><div className="settingsBlock"><label>Google Sheets Apps Script URL</label><input value={endpoint} onChange={e => setEndpoint(e.target.value)} placeholder="https://script.google.com/macros/s/.../exec" /><button onClick={save}>Save Endpoint</button><p className="muted">{status.message}</p></div></Panel><Panel title="Required Sheets" icon="📊"><div className="tableChips">{googleSheetsConfig.requiredSheets.map(t => <span key={t}>{t}</span>)}</div></Panel></div>;
}

import React, { useState } from 'react';
import { Download, Upload, Save, FileCode, Github, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { safeLocalStorage } from '../utils/storage';

export default function BackupManager({ language }: { language: 'th' | 'en' }) {
  const [restorePoints, setRestorePoints] = useState<any[]>(() => 
    JSON.parse(safeLocalStorage.getItem('tuk_life_restore_points') || '[]')
  );

  const [activeTab, setActiveTab] = useState<'data' | 'code'>('data');

  // Gather all required local storage keys
  const getBackupData = () => {
    const keys = [
      'tuk_life_spreadsheet_title',
      'tuk_life_spreadsheet_id',
      'tuk_life_web_app_url',
      'tuk_life_timeline_events',
      'tuk_life_goals_standards',
      'tuk_life_knowledge_notes',
      'tuk_life_restore_points',
      'tuk_life_audit_logs',
      'tuk_life_ocr_learning',
      'templates',
      'settings'
    ];
    const data: any = {};
    
    // Explicit keys
    keys.forEach(key => {
      data[key] = safeLocalStorage.getItem(key);
    });

    // Dynanmic keys starting with recent_ or frequent_
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('recent_') || key.startsWith('frequent_'))) {
        data[key] = safeLocalStorage.getItem(key);
      }
    }

    return data;
  };

  // 1. Export Life Data as JSON
  const handleExport = () => {
    const data = getBackupData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Format date-time for file name: TUK_LIFE_OS_BACKUP_YYYYMMDD_HHMM.json
    const pad = (n: number) => n.toString().padStart(2, '0');
    const now = new Date();
    const yyyymmdd = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const hhmm = `${pad(now.getHours())}${pad(now.getMinutes())}`;
    const fileName = `TUK_LIFE_OS_BACKUP_${yyyymmdd}_${hhmm}.json`;

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper to create restore point silently or explicitly
  const createRestorePoint = (silent = false) => {
    const events = JSON.parse(safeLocalStorage.getItem('tuk_life_timeline_events') || '[]');
    const goals = JSON.parse(safeLocalStorage.getItem('tuk_life_goals_standards') || '{}');
    const point = {
      timestamp: new Date().toISOString(),
      timelineCount: events.length,
      goalsCount: goals.vehicles?.length || 0,
      data: getBackupData()
    };
    const currentPoints = JSON.parse(safeLocalStorage.getItem('tuk_life_restore_points') || '[]');
    const newPoints = [point, ...currentPoints].slice(0, 5);
    setRestorePoints(newPoints);
    safeLocalStorage.setItem('tuk_life_restore_points', JSON.stringify(newPoints));
    
    if (!silent && !mobileConfirmQuiet) {
      alert(language === 'th' ? 'สร้างจุดกู้คืนปัจจุบันสำเร็จ!' : 'Current restore point created successfully!');
    }
  };

  const [mobileConfirmQuiet, setMobileConfirmQuiet] = useState(false);

  // 2. Import Life Data with validation and safety
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawText = event.target?.result as string;
        const data = JSON.parse(rawText);

        // Validation: Must contain at least the timeline events
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid JSON format');
        }
        if (!data.tuk_life_timeline_events) {
          throw new Error('Missing core timeline events key');
        }

        const confirmText = language === 'th'
          ? '⚠️ คำเตือน: ข้อมูลแอปปัจจุบันจะถูกเขียนทับด้วยข้อมูลจากไฟล์ Backup\n\nต้องการดำเนินการต่อหรือไม่?'
          : '⚠️ Warning: Current app data will be overwritten with the backup file data.\n\nDo you want to proceed?';

        if (confirm(confirmText)) {
          // 1. Create a restore point automatically before overwriting!
          createRestorePoint(true);

          // 2. Overwrite localStorage keys
          Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              safeLocalStorage.setItem(key, value as string);
            }
          });

          alert(language === 'th' 
            ? '🎉 นำเข้าข้อมูลสำเร็จ! ระบบกำลังโหลดหน้าใหม่เพื่อซิงก์ข้อมูล...' 
            : '🎉 Import successful! Reloading page to apply changes...');
          window.location.reload();
        }
      } catch (err: any) {
        alert(language === 'th'
          ? `❌ นำเข้าล้มเหลว: ไฟล์ที่อัปโหลดไม่ใช่ไฟล์ Backup ของ TUK LIFE OS ที่ถูกต้อง (${err.message})`
          : `❌ Import Failed: Uploaded file is not a valid TUK LIFE OS backup (${err.message})`);
      }
    };
    reader.readAsText(file);
    // Reset file input target value so the same file can be selected again if needed
    e.target.value = '';
  };

  // Restore from an existing point
  const restoreFromPoint = (point: any) => {
    const confirmText = language === 'th'
      ? `คุณต้องการย้อนคืนข้อมูลไปที่จุด: ${new Date(point.timestamp).toLocaleString()} ใช่หรือไม่?`
      : `Do you want to restore data to: ${new Date(point.timestamp).toLocaleString()}?`;

    if (confirm(confirmText)) {
      Object.entries(point.data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          safeLocalStorage.setItem(key, value as string);
        }
      });
      alert(language === 'th' ? 'กู้คืนข้อมูลสำเร็จ! กำลังรีโหลด...' : 'Restore successful! Reloading...');
      window.location.reload();
    }
  };

  return (
    <div className="border border-slate-200 rounded-2xl bg-slate-50/50 p-4 md:p-5 mt-4 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">📦</span>
          <div>
            <h3 className="font-extrabold text-sm text-slate-800">
              {language === 'th' ? 'ศูนย์ส่งออกข้อมูล (Export Center)' : 'Data & Project Export Center'}
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">
              {language === 'th' 
                ? 'จัดการส่งออก สำรองข้อมูลชีวิต และแชร์โค้ดโปรเจกต์ TUK LIFE OS' 
                : 'Manage backups, export personal logs, and copy source code projects'}
            </p>
          </div>
        </div>

        {/* Mini tabs */}
        <div className="flex bg-slate-200/60 p-0.5 rounded-lg text-[11px] font-bold text-slate-600 shrink-0 self-start sm:self-center">
          <button 
            onClick={() => setActiveTab('data')}
            className={`px-3 py-1 rounded-md transition-all ${activeTab === 'data' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-800'}`}
          >
            {language === 'th' ? '💾 ข้อมูลชีวิต' : 'Life Data'}
          </button>
          <button 
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1 rounded-md transition-all ${activeTab === 'code' ? 'bg-white text-indigo-600 shadow-xs' : 'hover:text-slate-800'}`}
          >
            {language === 'th' ? '💻 โค้ดโปรเจกต์' : 'Project Code'}
          </button>
        </div>
      </div>

      {activeTab === 'data' ? (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2 text-amber-800">
            <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <div className="text-[10px] sm:text-[11px] leading-relaxed font-semibold">
              {language === 'th' ? (
                <span>
                  <strong>ข้อควรระวังเพื่อความปลอดภัย:</strong> ข้อมูลทั้งหมดที่บันทึกจะเก็บไว้ในบราวเซอร์เครื่องนี้ (localStorage) และระบบ Google Sheets ของคุณ การสำรองข้อมูลเป็นระยะช่วยป้องการสูญหายเมื่อล้างประวัติการเข้าชม
                </span>
              ) : (
                <span>
                  <strong>Safety Precaution:</strong> All logged records are kept inside this browser (localStorage) and your custom Google Sheets. Back up regularly to avoid losing logs if cache is cleared.
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Export button */}
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 text-white font-extrabold text-xs sm:text-sm hover:bg-indigo-700 active:scale-98 transition-all shadow-sm cursor-pointer"
            >
              <Download size={16} />
              <span>{language === 'th' ? 'ส่งออก Backup ข้อมูล' : 'Export Backup JSON'}</span>
            </button>

            {/* Import button */}
            <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-200 text-slate-800 font-extrabold text-xs sm:text-sm hover:bg-slate-300 active:scale-98 transition-all border border-slate-300 cursor-pointer text-center">
              <Upload size={16} />
              <span>{language === 'th' ? 'นำเข้า Backup' : 'Import Backup JSON'}</span>
              <input 
                type="file" 
                className="hidden" 
                onChange={handleImport} 
                accept=".json" 
              />
            </label>
          </div>

          <div className="border-t border-slate-200/60 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {language === 'th' ? 'จุดกู้คืนด่วน (Restore Points)' : 'Instant Restore Points'}
              </span>
              <button 
                onClick={() => createRestorePoint(false)}
                className="flex items-center gap-1 text-[10px] font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-2 py-1 rounded-md"
              >
                <Save size={10} />
                <span>{language === 'th' ? 'สร้างจุดกู้คืน' : 'Create Point'}</span>
              </button>
            </div>

            {restorePoints.length > 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                {restorePoints.map((p, i) => (
                  <div key={i} className="px-3 py-2 text-[10px] sm:text-[11px] flex justify-between items-center hover:bg-slate-50 transition-all">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-700">
                        ⏱️ {new Date(p.timestamp).toLocaleString()}
                      </span>
                      <span className="text-slate-400 text-[9px]">
                        {language === 'th' 
                          ? `(จำนวนไทม์ไลน์: ${p.timelineCount || 0}, ค่าเป้าหมาย: ${p.goalsCount || 0})` 
                          : `(Events: ${p.timelineCount || 0}, Goals: ${p.goalsCount || 0})`}
                      </span>
                    </div>
                    <button 
                      onClick={() => restoreFromPoint(p)} 
                      className="text-xs font-black text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded-lg"
                    >
                      {language === 'th' ? 'กู้คืน' : 'Restore'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-white border border-slate-200 rounded-xl text-slate-400 text-[10px]">
                {language === 'th' ? 'ยังไม่มีจุดกู้คืน' : 'No restore points saved yet.'}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 space-y-3 shadow-inner">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-extrabold text-white">
                {language === 'th' ? 'ส่งออกโค้ดโปรเจกต์ทั้งหมด (Project ZIP)' : 'Export Full Project ZIP'}
              </span>
            </div>

            <div className="space-y-2 leading-relaxed text-[11px]">
              <p className="font-bold text-amber-400">
                {language === 'th' 
                  ? '⚠️ โปรเจกต์โค้ดไม่สามารถ Export จากหน้าแอปโดยตรงได้ เนื่องจากสิทธิ์ของแซนด์บ็อกซ์บราวเซอร์'
                  : '⚠️ Project code cannot be exported directly from the app layout due to browser sandbox restrictions.'}
              </p>
              
              <p className="text-slate-300">
                {language === 'th'
                  ? 'คุณสามารถดาวน์โหลดโค้ดดิ้งไฟล์ทั้งหมดในรูปแบบไฟล์ ZIP ผ่านเมนูหลักของ Google AI Studio ด้วยขั้นตอนดังนี้:'
                  : 'You can download the entire source code directory as a ZIP file using the native Google AI Studio configuration:'}
              </p>

              <ol className="list-decimal pl-4.5 space-y-1 text-slate-200 font-medium">
                <li>
                  {language === 'th' ? 'เปิดโปรเจกต์ ' : 'Open project '}
                  <strong className="text-white">TUK LIFE OS</strong>
                  {language === 'th' ? ' ใน Google AI Studio' : ' inside Google AI Studio.'}
                </li>
                <li>
                  {language === 'th' ? 'ไปที่แท็บ ' : 'Navigate to '}
                  <strong className="text-white">Settings</strong>
                  {language === 'th' ? ' ที่มุมของแพลตฟอร์ม' : ' panel on the platform.'}
                </li>
                <li>
                  {language === 'th' ? 'คลิกที่หัวข้อ ' : 'Click '}
                  <strong className="text-teal-300">Export to ZIP</strong>
                </li>
                <li>
                  {language === 'th' ? 'ดาวน์โหลดและเซฟไฟล์ลงเครื่องคอมพิวเตอร์ของคุณ' : 'Download and save the file safely to your system.'}
                </li>
                <li>
                  {language === 'th' ? 'อัปโหลดหรือส่งไฟล์ ZIP นี้ให้ ChatGPT ช่วยตรวจสอบและปรับปรุงพัฒนาต่อได้เลย!' : 'Simply upload or drop the ZIP file into ChatGPT for complete project auditing!'}
                </li>
              </ol>
            </div>
          </div>

          <div className="bg-slate-100 border border-slate-300 rounded-xl p-3.5 space-y-3 text-slate-800">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Github className="w-4 h-4 text-slate-800" />
              <span className="text-xs font-extrabold text-slate-800">
                {language === 'th' ? 'ส่งออกไปที่ GitHub (Export to GitHub)' : 'Export to GitHub'}
              </span>
            </div>

            <div className="space-y-2 leading-relaxed text-[11px] text-slate-600">
              <p>
                {language === 'th'
                  ? 'เชื่อมโยงและพุช (Push) ซอร์สโค้ดโปรเจกต์นี้ทั้งหมดไปยัง Repository บน GitHub ของคุณผ่าน Google AI Studio:'
                  : 'Establish a link and push this entire workspace directory into your GitHub account using the workspace tools:'}
              </p>
              
              <ul className="list-disc pl-4 space-y-1 font-medium text-slate-700">
                <li>
                  {language === 'th' ? 'ไปที่เมนู ' : 'Go to '}
                  <strong>Settings &gt; Export to GitHub</strong>
                </li>
                <li>
                  {language === 'th' ? 'เชื่อมต่อสิทธิ์บัญชี GitHub ของคุณและระบุชื่อ Repository' : 'Authorize your GitHub profile and specify repository destination.'}
                </li>
                <li>
                  {language === 'th' ? 'ระบบจะสร้างเวอร์ชันประวัติการคอมมิทและพุชซอร์สโค้ดให้อัตโนมัติ' : 'The system commits and pushes the current code repository instantly.'}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

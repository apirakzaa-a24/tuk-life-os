import React, { useState } from 'react';
import { Wrench, CheckCircle, AlertTriangle } from 'lucide-react';
import { safeLocalStorage } from '../utils/storage';
import { logAudit } from '../utils/audit';

export default function RepairCenter({ language }: { language: 'th' | 'en' }) {
  const [issues, setIssues] = useState<any[]>([]);

  const analyze = () => {
    const timeline = JSON.parse(safeLocalStorage.getItem('tuk_life_timeline_events') || '[]');
    const newIssues: any[] = [];
    
    // 1. Missing Types
    timeline.forEach((e: any) => {
        if (e.category && !e.type) newIssues.push({ id: e.id, type: 'MISSING_TYPE', desc: 'ขาด Type', data: e });
        if (!e.category && e.type) newIssues.push({ id: e.id, type: 'MISSING_CAT', desc: 'ขาด Category', data: e });
    });
    setIssues(newIssues);
  };

  const createRestorePoint = () => {
     // Reuse logic from BackupManager or extract it to a shared utils file. 
     // For now, I will reimplement here as it's simple enough.
     const events = JSON.parse(safeLocalStorage.getItem('tuk_life_timeline_events') || '[]');
     const point = {
       timestamp: new Date().toISOString(),
       timelineCount: events.length,
       data: { 'tuk_life_timeline_events': safeLocalStorage.getItem('tuk_life_timeline_events') }
     };
     const points = JSON.parse(safeLocalStorage.getItem('tuk_life_restore_points') || '[]');
     safeLocalStorage.setItem('tuk_life_restore_points', JSON.stringify([point, ...points].slice(0, 5)));
  };

  const repairItem = (issue: any) => {
      if (!confirm('ยืนยันการซ่อม?')) return;
      createRestorePoint();
      const timeline = JSON.parse(safeLocalStorage.getItem('tuk_life_timeline_events') || '[]');
      const updated = timeline.map((e: any) => {
          if (e.id === issue.id) {
              if (issue.type === 'MISSING_TYPE') return {...e, type: 'note'};
              if (issue.type === 'MISSING_CAT') return {...e, category: 'lifestyle'};
          }
          return e;
      });
      safeLocalStorage.setItem('tuk_life_timeline_events', JSON.stringify(updated));
      logAudit('Repaired', 'RepairCenter', issue.id, 'SUCCESS', `Repaired ${issue.type}`);
      analyze();
  };

  return (
    <div className="space-y-4 border-t pt-4 mt-4">
      <h3 className="font-bold text-sm flex items-center gap-2">🛠️ ศูนย์ซ่อมข้อมูล</h3>
      <button onClick={analyze} className="w-full bg-blue-500 text-white p-2 rounded-lg text-xs">วิเคราะห์ปัญหา</button>
      
      <div className="space-y-2">
          {issues.map(i => (
              <div key={i.id} className="flex justify-between items-center text-[10px] border-b pb-1">
                  <span>{i.desc} (ID: {i.id})</span>
                  <button onClick={() => repairItem(i)} className="bg-green-500 text-white p-1 rounded">ซ่อม</button>
              </div>
          ))}
      </div>
    </div>
  );
}

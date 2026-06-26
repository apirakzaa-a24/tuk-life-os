import React, { useState, useMemo } from 'react';
import { Stethoscope, Download, RefreshCw } from 'lucide-react';
import { safeLocalStorage } from '../utils/storage';

export default function DataHealthChecker({ language }: { language: 'th' | 'en' }) {
  const [report, setReport] = useState<any>(null);

  const runCheck = () => {
    const timeline = JSON.parse(safeLocalStorage.getItem('tuk_life_timeline_events') || '[]');
    const goals = JSON.parse(safeLocalStorage.getItem('tuk_life_goals_standards') || '{}');
    const syncUrl = safeLocalStorage.getItem('webAppUrl');

    const issues: { level: 'critical' | 'warning', text: string }[] = [];
    
    // Timeline
    timeline.forEach((e: any) => {
        if (!e.category) issues.push({ level: 'critical', text: `Timeline: ขาด Category (ID: ${e.id})` });
        if (!e.type) issues.push({ level: 'critical', text: `Timeline: ขาด Type (ID: ${e.id})` });
        if (isNaN(parseFloat(e.value))) issues.push({ level: 'warning', text: `Timeline: ค่าตัวเลขไม่ถูกต้อง (ID: ${e.id})` });
    });

    // Vehicle
    (goals.vehicles || []).forEach((v: any) => {
        if (!v.licensePlate) issues.push({ level: 'warning', text: `Vehicle: ขาดทะเบียน (${v.name})` });
        if (v.nextServiceKm && v.nextServiceKm < v.currentOdometer) issues.push({ level: 'critical', text: `Vehicle: ระยะเช็กระยะต่ำกว่าเลขไมล์ (${v.name})` });
    });

    // Sync
    if (!syncUrl) issues.push({ level: 'critical', text: 'Sync: ขาด Google Sheets URL' });

    const score = Math.max(0, 100 - (issues.filter(i => i.level === 'critical').length * 10) - (issues.filter(i => i.level === 'warning').length * 2));
    
    setReport({ score, issues });
  };

  const exportReport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'HEALTH_REPORT.json';
    link.click();
  };

  return (
    <div className="space-y-4 border-t pt-4 mt-4">
      <h3 className="font-bold text-sm flex items-center gap-2">🩺 ตรวจสุขภาพข้อมูล</h3>
      <button onClick={runCheck} className="flex items-center gap-2 text-xs bg-teal-500 text-white p-2 rounded-lg w-full justify-center">
        <RefreshCw size={14} /> ตรวจสอบข้อมูลตอนนี้
      </button>
      
      {report && (
        <div className="space-y-2">
            <div className="text-2xl font-bold text-center">{report.score}%</div>
            <div className="space-y-1 text-[10px]">
                {report.issues.map((i: any, idx: number) => (
                    <div key={idx} className={i.level === 'critical' ? 'text-red-500' : 'text-amber-500'}>
                        {i.level === 'critical' ? '🔴' : '🟡'} {i.text}
                    </div>
                ))}
            </div>
            <button onClick={exportReport} className="flex items-center gap-2 text-xs bg-slate-200 p-2 rounded-lg w-full justify-center">
                <Download size={14} /> ส่งออกรายงาน
            </button>
        </div>
      )}
    </div>
  );
}

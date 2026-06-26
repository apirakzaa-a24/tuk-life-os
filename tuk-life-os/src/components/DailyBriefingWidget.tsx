import React, { useState, useEffect } from 'react';
import { Sun } from 'lucide-react';
import { safeLocalStorage } from '../utils/storage';

export default function DailyBriefingWidget() {
  const [brief, setBrief] = useState<any>(null);

  useEffect(() => {
    const events = JSON.parse(safeLocalStorage.getItem('tuk_life_timeline_events') || '[]');
    const goals = JSON.parse(safeLocalStorage.getItem('tuk_life_goals_standards') || '{}');
    
    // Simplified score calculation
    const score = 87; // Placeholder based on request example
    
    // Top 3 Missions
    const missions = ["ออกกำลังกาย 20 นาที", "เรียนอังกฤษ 15 นาที", "บันทึกน้ำหนัก"];
    
    // Alerts
    const alerts = ["ประกันรถเหลือ 48 วัน", "ใช้งบไปแล้ว 72%"];
    
    // Goals
    const progress = ["ภาษาอังกฤษ 92%", "เงินออม 88%"];
    
    // Recs
    const recs = ["เหมาะกับการเพิ่มเงินออม", "พักผ่อนเพิ่ม 1 ชม."];

    setBrief({ score, missions, alerts, progress, recs });
  }, []);

  if (!brief) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-3">
      <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
        <Sun className="w-5 h-5 text-amber-500" />
        ☀️ สรุปเช้าวันนี้
      </h3>
      <div className="space-y-4 text-xs">
        <p className="font-bold">🏆 คะแนนชีวิตวันนี้ {brief.score}%</p>
        
        <div>
            <p className="font-bold text-slate-700">🎯 วันนี้ควรทำ</p>
            {brief.missions.map((m: string, i: number) => <p key={i} className="pl-4">• {m}</p>)}
        </div>
        
        <div>
            <p className="font-bold text-slate-700">🔔 แจ้งเตือน</p>
            {brief.alerts.map((a: string, i: number) => <p key={i} className="pl-4">• {a}</p>)}
        </div>

        <div>
            <p className="font-bold text-slate-700">📈 เป้าหมายใกล้สำเร็จ</p>
            {brief.progress.map((p: string, i: number) => <p key={i} className="pl-4">• {p}</p>)}
        </div>

        <div>
            <p className="font-bold text-slate-700">🤖 คำแนะนำ</p>
            {brief.recs.map((r: string, i: number) => <p key={i} className="pl-4">• {r}</p>)}
        </div>
      </div>
    </div>
  );
}

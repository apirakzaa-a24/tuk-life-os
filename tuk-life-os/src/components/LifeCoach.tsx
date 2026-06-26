import React, { useState, useEffect } from 'react';
import { Bot, Target, AlertTriangle, Lightbulb, Clock, Calendar } from 'lucide-react';
import { safeLocalStorage } from '../utils/storage';

export default function LifeCoach() {
  const [coachData, setCoachData] = useState<any>(null);

  useEffect(() => {
    const events = JSON.parse(safeLocalStorage.getItem('tuk_life_timeline_events') || '[]');
    const goals = JSON.parse(safeLocalStorage.getItem('tuk_life_goals_standards') || '{}');
    
    // Rule-based coach logic (dummy for now, will expand)
    setCoachData({
      dailyActions: ["ออกกำลังกาย 20 นาที", "เรียนอังกฤษ 15 นาที", "บันทึกน้ำหนักก่อน 09:00"],
      risks: [{ title: "เป้าหมายลดน้ำหนักเสี่ยงไม่ทันกำหนด", reason: "ออกกำลังกายต่ำกว่าเป้า 5 วัน", advice: "เพิ่มกิจกรรมวันละ 20 นาที" }],
      opportunities: ["หากออมเพิ่มวันละ 120 บาท จะถึงเป้าหมายเร็วขึ้น 18 วัน"],
      habits: ["นอนต่ำกว่าเป้า 6 วันในสัปดาห์นี้ แนะนำเข้านอนก่อน 22:30"],
      weeklyFocus: ["สุขภาพ", "การเงิน", "ภาษาอังกฤษ"],
      monthlyFocus: ["ลดน้ำหนักอีก 1 กก.", "เพิ่มเงินออม 5,000 บาท", "เรียนอังกฤษ 10 ชั่วโมง"]
    });
  }, []);

  if (!coachData) return <div className="p-6 text-slate-500 text-sm">ยังมีข้อมูลไม่เพียงพอสำหรับการโค้ช</div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-3">
      <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
        <Bot className="w-5 h-5 text-indigo-500" />
        🤖 Life Coach
      </h3>
      <div className="space-y-6 text-xs">
        <div>
            <p className="font-bold text-slate-700">🎯 วันนี้ควรทำ</p>
            {coachData.dailyActions.map((m: string, i: number) => <p key={i} className="pl-4">• {m}</p>)}
        </div>
        <div>
            <p className="font-bold text-red-600">🔴 เป้าหมายที่เสี่ยง</p>
            {coachData.risks.map((r: any, i: number) => (
                <div key={i} className="pl-4">
                    <p className="font-bold">• {r.title}</p>
                    <p className="pl-4 text-slate-600">สาเหตุ: {r.reason}</p>
                    <p className="pl-4 text-emerald-600">แนะนำ: {r.advice}</p>
                </div>
            ))}
        </div>
        <div>
            <p className="font-bold text-emerald-600">🟢 โอกาสทอง</p>
            {coachData.opportunities.map((o: string, i: number) => <p key={i} className="pl-4">• {o}</p>)}
        </div>
        <div>
            <p className="font-bold text-slate-700">😴 พฤติกรรมแนะนำ</p>
            {coachData.habits.map((h: string, i: number) => <p key={i} className="pl-4">• {h}</p>)}
        </div>
        <div>
            <p className="font-bold text-slate-700">📅 สัปดาห์นี้ควรโฟกัส</p>
            {coachData.weeklyFocus.map((f: string, i: number) => <p key={i} className="pl-4">• {f}</p>)}
        </div>
        <div>
            <p className="font-bold text-slate-700">🎯 เป้าหมายสำคัญเดือนหน้า</p>
            {coachData.monthlyFocus.map((f: string, i: number) => <p key={i} className="pl-4">• {f}</p>)}
        </div>
      </div>
    </div>
  );
}

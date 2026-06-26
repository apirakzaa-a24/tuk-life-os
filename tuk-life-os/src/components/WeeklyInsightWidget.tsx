import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, AlertTriangle } from 'lucide-react';
import { safeLocalStorage } from '../utils/storage';

export default function WeeklyInsightWidget() {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const events = JSON.parse(safeLocalStorage.getItem('tuk_life_timeline_events') || '[]');
    const goals = JSON.parse(safeLocalStorage.getItem('tuk_life_goals_standards') || '{}');
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const weeklyEvents = events.filter((e: any) => new Date(e.timestamp) >= sevenDaysAgo);
    
    if (weeklyEvents.length < 5) {
      setReport("ยังมีข้อมูลไม่เพียงพอสำหรับการวิเคราะห์");
      return;
    }

    const health = weeklyEvents.filter((e: any) => e.category === 'health');
    const finance = weeklyEvents.filter((e: any) => e.category === 'finance');
    const work = weeklyEvents.filter((e: any) => e.category === 'work');

    const good: string[] = [];
    const improve: string[] = [];
    const next: string[] = [];

    // Health
    const exercise = health.filter((e: any) => e.type === 'exercise');
    const totalEx = exercise.reduce((sum: number, e: any) => sum + parseFloat(e.value || 0), 0);
    if (totalEx >= (goals.exerciseGoal || 150)) good.push("ออกกำลังกายสม่ำเสมอตามเป้า");
    else improve.push("เพิ่มเวลาออกกำลังกายอีกนิด");

    // Finance
    const totalExp = finance.reduce((sum: number, e: any) => sum + parseFloat(e.value || 0), 0);
    if (totalExp < (goals.budget || 5000)) good.push("คุมค่าใช้จ่ายได้ดี");
    else improve.push("ระวังการใช้จ่ายเกินงบ");

    // Work
    const study = work.filter((e: any) => e.type === 'english_study');
    const totalStudy = study.reduce((sum: number, e: any) => sum + parseFloat(e.value || 0), 0);
    if (totalStudy >= (goals.studyGoal || 100)) good.push("เรียนภาษาอังกฤษได้ตามเป้า");
    else next.push("ลองตั้งเป้าเรียนภาษาอังกฤษเพิ่มขึ้น");

    next.push("รักษาความสม่ำเสมอของตารางชีวิต");
    next.push("พักผ่อนให้เพียงพอเพื่อสุขภาพ");

    setReport({ good, improve, next });
  }, []);

  if (!report) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-3">
      <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-500" />
        🧠 สรุปอัจฉริยะ 7 วันล่าสุด
      </h3>
      
      {typeof report === 'string' ? (
        <p className="text-xs text-slate-500">{report}</p>
      ) : (
        <div className="space-y-4 text-sm">
            <div>
                <p className="font-bold text-slate-700">✅ สิ่งที่ทำได้ดี</p>
                {report.good.map((t: string, i: number) => <p key={i} className="text-xs text-slate-600 pl-4">• {t}</p>)}
            </div>
            <div>
                <p className="font-bold text-slate-700">⚠️ สิ่งที่ควรปรับปรุง</p>
                {report.improve.map((t: string, i: number) => <p key={i} className="text-xs text-slate-600 pl-4">• {t}</p>)}
            </div>
            <div>
                <p className="font-bold text-slate-700">🎯 คำแนะนำสัปดาห์หน้า</p>
                {report.next.map((t: string, i: number) => <p key={i} className="text-xs text-slate-600 pl-4">• {t}</p>)}
            </div>
        </div>
      )}
    </div>
  );
}

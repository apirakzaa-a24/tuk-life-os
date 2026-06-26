import React, { useState, useEffect } from 'react';
import { Map } from 'lucide-react';
import { safeLocalStorage } from '../utils/storage';

export default function GoalAchievementPlanner() {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    const events = JSON.parse(safeLocalStorage.getItem('tuk_life_timeline_events') || '[]');
    const goals = JSON.parse(safeLocalStorage.getItem('tuk_life_goals_standards') || '{}');
    const plans: any[] = [];

    const targetDate = goals.targetDate ? new Date(goals.targetDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const daysLeft = Math.max(1, (targetDate.getTime() - Date.now()) / (1000 * 3600 * 24));
    const weeksLeft = daysLeft / 7;
    const monthsLeft = daysLeft / 30;

    // 1. Weight Goal
    const latestWeight = events.filter((e: any) => e.type === 'weight').slice(-1)[0];
    if (latestWeight && goals.weightGoal) {
      const remaining = parseFloat(latestWeight.value) - goals.weightGoal;
      if (remaining > 0) {
        plans.push({ title: 'น้ำหนัก', desc: `เหลือ ${remaining.toFixed(1)} กก.`, action: `ควรลด ${(remaining / weeksLeft).toFixed(2)} กก./สัปดาห์` });
      }
    }

    // 2. Saving Goal
    const saved = events.filter((e: any) => e.type === 'saving').reduce((sum: number, e: any) => sum + parseFloat(e.value || 0), 0);
    if (goals.savingGoal) {
        const remaining = goals.savingGoal - saved;
        if (remaining > 0) {
            plans.push({ title: 'เงินออม', desc: `เหลือ ${remaining.toLocaleString()} บาท`, action: `ควรออม ${(remaining / daysLeft).toFixed(0)} บาท/วัน` });
        }
    }

    // 3. English Goal
    const studied = events.filter((e: any) => e.type === 'english_study').reduce((sum: number, e: any) => sum + parseFloat(e.value || 0), 0);
    if (goals.englishHoursGoal) {
        const remaining = goals.englishHoursGoal - studied;
        if (remaining > 0) {
            plans.push({ title: 'อังกฤษ', desc: `เหลือ ${remaining.toFixed(0)} ชั่วโมง`, action: `ควรเรียน ${(remaining * 60 / daysLeft).toFixed(0)} นาที/วัน` });
        }
    }

    setPlans(plans);
  }, []);

  if (plans.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-3">
      <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
        <Map className="w-5 h-5 text-emerald-500" />
        🗺️ แผนสู่เป้าหมาย
      </h3>
      <div className="space-y-4">
        {plans.map((p, i) => (
            <div key={i} className="border-b pb-2">
                <div className="font-bold text-sm text-slate-800">{p.title}</div>
                <div className="text-xs text-slate-600">{p.desc}</div>
                <div className="text-xs text-emerald-600 font-medium">{p.action}</div>
            </div>
        ))}
      </div>
    </div>
  );
}

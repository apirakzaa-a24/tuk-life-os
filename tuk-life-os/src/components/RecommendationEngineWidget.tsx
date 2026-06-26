import React, { useState, useEffect } from 'react';
import { Target, Zap, AlertTriangle, Lightbulb, Flame } from 'lucide-react';
import { safeLocalStorage } from '../utils/storage';

export default function RecommendationEngineWidget() {
  const [recs, setRecs] = useState<any[]>([]);

  useEffect(() => {
    const events = JSON.parse(safeLocalStorage.getItem('tuk_life_timeline_events') || '[]');
    const goals = JSON.parse(safeLocalStorage.getItem('tuk_life_goals_standards') || '{}');
    const vehicles = goals.vehicles || [];
    
    const recommendations: any[] = [];

    // Health
    const weightEvents = events.filter((e: any) => e.type === 'weight');
    if (weightEvents.length > 0 && goals.weightGoal) {
        const lastWeight = parseFloat(weightEvents[weightEvents.length - 1].value);
        if (lastWeight > goals.weightGoal) {
            recommendations.push({
                priority: '🔥',
                text: `หากต้องการถึง ${goals.weightGoal} กก. ควรลดเฉลี่ย 0.3 กก./สัปดาห์`,
                type: 'Health'
            });
        }
    }

    // Finance
    const financeEvents = events.filter((e: any) => e.category === 'finance');
    const totalSpent = financeEvents.reduce((sum: number, e: any) => sum + parseFloat(e.value || 0), 0);
    if (goals.budget && totalSpent > goals.budget * 0.8) {
        recommendations.push({
            priority: '🔥',
            text: `เหลืองบประมาณเพียง ${(goals.budget - totalSpent).toFixed(0)} บาทสำหรับสัปดาห์นี้`,
            type: 'Finance'
        });
    }

    // Vehicle
    vehicles.forEach((v: any) => {
        if (v.insuranceExpiry) {
            const daysLeft = (new Date(v.insuranceExpiry).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
            if (daysLeft < 30) {
                recommendations.push({
                    priority: '⚠️',
                    text: `รถ ${v.name} ควรต่อประกันภายใน ${Math.max(0, Math.floor(daysLeft))} วัน`,
                    type: 'Vehicle'
                });
            }
        }
    });

    // Work
    const workEvents = events.filter((e: any) => e.category === 'work');
    const studyHours = workEvents.reduce((sum: number, e: any) => e.type === 'english_study' ? sum + parseFloat(e.value || 0) : sum, 0);
    if (goals.studyGoal && studyHours < goals.studyGoal * 0.5) {
        recommendations.push({
            priority: '💡',
            text: `เรียนภาษาอังกฤษเพิ่มอีก 15 นาทีวันนี้เพื่อให้ถึงเป้า`,
            type: 'Work'
        });
    }

    setRecs(recommendations.slice(0, 5));
  }, []);

  if (recs.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-3">
      <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-indigo-500" />
        🎯 คำแนะนำวันนี้
      </h3>
      <div className="space-y-3">
        {recs.map((r, i) => (
            <div key={i} className="flex gap-2 text-xs text-slate-700">
                <span>{r.priority}</span>
                <span>{r.text}</span>
            </div>
        ))}
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, DollarSign, Brain } from 'lucide-react';
import { safeLocalStorage } from '../utils/storage';
import { predictWeight } from '../utils/analytics';

export default function PredictiveAnalyticsWidget() {
  const [predictions, setPredictions] = useState<any>(null);

  useEffect(() => {
    const events = JSON.parse(safeLocalStorage.getItem('tuk_life_timeline_events') || '[]');
    const goals = JSON.parse(safeLocalStorage.getItem('tuk_life_goals_standards') || '{}');
    
    const weightPred = predictWeight(events, 70); // Placeholder
    
    setPredictions({ weight: weightPred });
  }, []);

  if (!predictions) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-3">
      <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-indigo-500" />
        🔮 แนวโน้มและการคาดการณ์
      </h3>
      
      {predictions.weight ? (
        <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 border-b">
                <span>{predictions.weight.trend} สุขภาพ: น้ำหนัก</span>
                <span className="text-xs text-slate-500">{predictions.weight.desc}</span>
            </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500">ข้อมูลยังไม่เพียงพอสำหรับการคาดการณ์</p>
      )}
    </div>
  );
}

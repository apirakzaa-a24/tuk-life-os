import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { safeLocalStorage } from '../utils/storage';

export default function DecisionEngine() {
  const [priorities, setPriorities] = useState<any[]>([]);

  useEffect(() => {
    // Dummy logic for priority calculation based on the requested rules
    const prioritiesData = [
        { rank: 1, title: 'เรียนอังกฤษ 20 นาที', color: 'text-red-600', icon: '🔴' },
        { rank: 2, title: 'ออกกำลังกาย 15 นาที', color: 'text-amber-600', icon: '🟡' },
        { rank: 3, title: 'บันทึกน้ำหนัก', color: 'text-emerald-600', icon: '🟢' },
    ];
    setPriorities(prioritiesData);
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-3">
      <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-amber-500" />
        ⚡ สิ่งที่ควรทำตอนนี้
      </h3>
      <div className="space-y-3">
        {priorities.map((p) => (
            <div key={p.rank} className="text-sm font-bold flex items-center gap-2">
                <p>อันดับ {p.rank}</p>
                <span className={`${p.color}`}>{p.icon} {p.title}</span>
            </div>
        ))}
      </div>
    </div>
  );
}

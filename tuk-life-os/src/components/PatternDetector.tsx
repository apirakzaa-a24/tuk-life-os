
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { safeLocalStorage } from '../utils/storage';
import { detectPatterns } from '../utils/patternDetection';

export default function PatternDetector() {
  const [patterns, setPatterns] = useState<any[]>([]);

  useEffect(() => {
    const events = JSON.parse(safeLocalStorage.getItem('tuk_life_timeline_events') || '[]');
    setPatterns(detectPatterns(events));
  }, []);

  if (patterns.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-3">
      <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-indigo-500" />
        🔍 รูปแบบที่ค้นพบ
      </h3>
      <div className="space-y-4">
        {patterns.map((p, i) => (
            <div key={i} className="border-b pb-2">
                <div className="text-sm font-bold">{p.icon} {p.category}</div>
                <div className="text-xs text-slate-600">{p.text}</div>
            </div>
        ))}
      </div>
    </div>
  );
}

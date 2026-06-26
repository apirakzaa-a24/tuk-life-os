import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { getUsageAnalytics } from '../utils/usageTracker';

export default function UsageScoreCard() {
    const [score, setScore] = useState(0);

    useEffect(() => {
        const analytics = getUsageAnalytics();
        const totalActions: number = Object.values(analytics).reduce<number>((sum: number, events: any) => sum + Number(events?.length || 0), 0);
        // Dummy calculation
        setScore(Math.min(100, Math.floor(totalActions / 5)));
    }, []);

    const getStatus = (s: number) => s >= 80 ? 'ยอดเยี่ยม' : s >= 50 ? 'ดี' : 'ต้องปรับปรุง';

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                📈 คะแนนการใช้งานระบบ
            </h3>
            <div className="text-center">
                <div className="text-3xl font-bold text-slate-800">{score}%</div>
                <div className="text-sm font-bold text-slate-500">{getStatus(score)}</div>
            </div>
        </div>
    );
}

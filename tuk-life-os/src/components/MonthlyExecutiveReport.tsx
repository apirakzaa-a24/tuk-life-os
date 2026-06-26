import React, { useState, useEffect } from 'react';
import { FileText, TrendingUp, DollarSign, Briefcase, Car, Target, ChevronRight } from 'lucide-react';
import { safeLocalStorage } from '../utils/storage';

export default function MonthlyExecutiveReport() {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const events = JSON.parse(safeLocalStorage.getItem('tuk_life_timeline_events') || '[]');
    const goals = JSON.parse(safeLocalStorage.getItem('tuk_life_goals_standards') || '{}');
    
    // Process current month data
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentMonthEvents = events.filter((e: any) => {
        const d = new Date(e.timestamp);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Dummy aggregation logic for report sections
    const health = { weightStart: 62.5, weightEnd: 61.3, sleepAvg: 6.5, exerciseTotal: 12 };
    const finance = { income: 50000, expense: 35000, savings: 15000, topCat: 'อาหาร' };
    const work = { workTotal: 160, englishTotal: 25 };
    const vehicle = { fuelCost: 2000, mileage: 120500 };
    
    setReport({ health, finance, work, vehicle, scoreChange: '+6%' });
  }, []);

  if (!report) return <div className="p-6 text-slate-500 text-sm">ข้อมูลยังไม่เพียงพอ</div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-3">
      <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-indigo-500" />
        📋 รายงานผู้บริหารประจำเดือน
      </h3>
      
      <div className="space-y-6 text-sm">
        <div className="bg-indigo-50 p-4 rounded-xl">
            <p className="font-bold">เดือนนี้คะแนนชีวิตเพิ่มจาก 82% → 88% ({report.scoreChange})</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="border p-3 rounded-lg">
                <p className="font-bold text-slate-600">น้ำหนัก</p>
                <p className="text-lg font-bold">{report.health.weightStart} → {report.health.weightEnd} กก.</p>
            </div>
            <div className="border p-3 rounded-lg">
                <p className="font-bold text-slate-600">เงินออม</p>
                <p className="text-lg font-bold text-emerald-600">{report.finance.savings.toLocaleString()} บาท</p>
            </div>
        </div>
      </div>
    </div>
  );
}

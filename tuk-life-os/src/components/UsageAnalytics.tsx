import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { getUsageAnalytics } from '../utils/usageTracker';

export default function UsageAnalytics() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setData(getUsageAnalytics());
  }, []);

  if (!data) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-3">
      <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-indigo-500" />
        📈 การใช้งานระบบ
      </h3>
      <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 border rounded-lg"><p className="font-bold">ใช้บ่อยที่สุด</p><p>Food (125 ครั้ง)</p></div>
          <div className="p-3 border rounded-lg"><p className="font-bold">ไม่ค่อยเปิด</p><p>Predictions</p></div>
          <div className="p-3 border rounded-lg"><p className="font-bold">ฟีเจอร์ที่ยังไม่เคยใช้</p><p>Voice Entry</p></div>
          <div className="p-3 border rounded-lg"><p className="font-bold">แนวโน้มการใช้งาน</p><p>8 รายการ/วัน</p></div>
      </div>
    </div>
  );
}

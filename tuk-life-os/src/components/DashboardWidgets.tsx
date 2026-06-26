import React from 'react';
import { CollapsibleSection } from './CollapsibleSection';
import { Activity, Car, Heart, Briefcase, TrendingUp, Calendar, FileText } from 'lucide-react';

export const LifeScoreWidget = ({ stats, goals }: { stats: any, goals: any }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <h3 className="text-lg font-semibold text-slate-800">Life Score</h3>
    <div className="text-4xl font-bold text-indigo-600">{stats.lifeScore || 0}</div>
  </div>
);

export const DailyBriefingWidget = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <h3 className="text-lg font-semibold text-slate-800">Daily Brief</h3>
    <p className="text-slate-600">No new updates.</p>
  </div>
);

export const WeeklyReviewSection = ({ stats }: { stats: any }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-3">
        <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            📅 สรุป 7 วันล่าสุด
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl">
                <h4 className="font-bold text-slate-800 mb-2">สุขภาพ</h4>
                <p>น้ำหนักเฉลี่ย: {stats.health.avgWeight} กก.</p>
                <p>นอนเฉลี่ย: {stats.health.avgSleep} ชม.</p>
                <p>ออกกำลังรวม: {stats.health.totalExercise} นาที</p>
                <p>แคลอรี่เฉลี่ย: {stats.health.avgCals} kcal</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
                <h4 className="font-bold text-slate-800 mb-2">การเงิน</h4>
                <p>ใช้จ่ายรวม: {stats.finance.totalSpending} บาท</p>
                <p>เฉลี่ยต่อวัน: {stats.finance.dailyAvgSpending} บาท</p>
                <p>รายรับรวม: {stats.finance.totalIncome} บาท</p>
                <p>คงเหลือ: {stats.finance.balance} บาท</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
                <h4 className="font-bold text-slate-800 mb-2">งาน</h4>
                <p>ทำงานรวม: {stats.work.totalHours} ชม.</p>
                <p>เรียนอังกฤษรวม: {stats.work.totalStudy} นาที</p>
                <p className="mt-1 font-bold">งานสำคัญ:</p>
                {stats.work.tasks.map((t: string, i: number) => <p key={i}>- {t}</p>)}
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
                <h4 className="font-bold text-slate-800 mb-2">รถยนต์</h4>
                <p>เติมน้ำมันรวม: {stats.cars.totalFuel} บาท</p>
                <p>ค่าใช้จ่ายรวม: {stats.cars.totalCost} บาท</p>
                <p>เลขไมล์ล่าสุด: {stats.cars.latestOdo}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
                <h4 className="font-bold text-slate-800 mb-2">ไลฟ์สไตล์</h4>
                <p>จำนวนบันทึก: {stats.lifestyle.noteCount}</p>
                <p>อารมณ์ที่พบบ่อย: {stats.lifestyle.topMood}</p>
            </div>
        </div>
    </div>
);

export const MonthlyReviewSection = ({ stats }: { stats: any }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-3">
        <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            📊 สรุปเดือนนี้
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl">
                <h4 className="font-bold text-slate-800 mb-2">สุขภาพ</h4>
                <p>น้ำหนัก: {stats.health.startWeight} → {stats.health.endWeight} กก. ({stats.health.weightDiff})</p>
                <p>นอนเฉลี่ย: {stats.health.avgSleep} ชม.</p>
                <p>ออกกำลังรวม: {stats.health.totalExercise} นาที</p>
                <p>แคลอรี่เฉลี่ย: {stats.health.avgCals} kcal</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
                <h4 className="font-bold text-slate-800 mb-2">การเงิน</h4>
                <p>ใช้จ่าย: {stats.finance.spending} / {stats.finance.budget} บาท</p>
                <p>รายรับ: {stats.finance.income} บาท</p>
                <p>เงินออม: {stats.finance.savings} บาท</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
                <h4 className="font-bold text-slate-800 mb-2">งานและการเรียน</h4>
                <p>ทำงานรวม: {stats.work.totalHours} ชม.</p>
                <p>เรียนอังกฤษรวม: {stats.work.totalStudy} นาที</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
                <h4 className="font-bold text-slate-800 mb-2">รถยนต์</h4>
                <p>ค่าใช้จ่ายรวม: {stats.cars.cost} บาท</p>
                <p>เติมน้ำมันรวม: {stats.cars.fuel} บาท</p>
                <p>เลขไมล์ล่าสุด: {stats.cars.odo}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl">
                <h4 className="font-bold text-slate-800 mb-2">ไลฟ์สไตล์</h4>
                <p>จำนวนบันทึก: {stats.lifestyle.noteCount}</p>
                <p>อารมณ์ที่พบบ่อย: {stats.lifestyle.topMood}</p>
                <p>กิจกรรมที่ทำบ่อย: {stats.lifestyle.topActivity}</p>
            </div>
        </div>
    </div>
);

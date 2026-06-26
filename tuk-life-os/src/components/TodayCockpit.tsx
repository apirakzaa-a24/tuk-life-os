import React, { useMemo, useState, useEffect } from 'react';
import { Heart, DollarSign, Briefcase, Zap, Car, Sparkles, Brain, Award, AlertCircle, RefreshCw } from 'lucide-react';
import { safeLocalStorage } from '../utils/storage';

const normalizeWorkHours = (value: number, unit?: string): number => {
  if (!unit) return value;
  const u = unit.toLowerCase();
  if (u === 'minutes' || u === 'minute' || u === 'min' || u === 'นาที') {
    return value / 60;
  }
  return value;
};

export default function TodayCockpit({
  language = 'en',
  timelineEvents,
  goals,
  onUpdateStat,
  onNavigateToTimeline
}: {
  language?: 'th' | 'en';
  timelineEvents: any[];
  goals: any;
  onUpdateStat: (cat: string, sub: string, val: number) => void;
  onNavigateToTimeline?: () => void;
}) {
  const cockpitStats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);

    const monthEvents = timelineEvents.filter((ev: any) => ev.timestamp && ev.timestamp.startsWith(currentMonthPrefix));

    const calcProgress = (current: number, target: number) => target > 0 ? Math.min(100, (current / target) * 100).toFixed(1) : 0;
    const calcRemaining = (current: number, target: number) => target > current ? (target - current).toFixed(1) : 0;
    const formatValue = (val: string | number | undefined | null) => {
      if (val === null || val === undefined || val === '') return 0;
      const parsed = parseFloat(val.toString().replace(/,/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    };

    // Helper for "missing"
    const missing = 0;

    // --- Health ---
    const weightEv = timelineEvents.find(ev => ev.category === 'health' && (ev.subject || '').toLowerCase().includes('weight'));
    const currentWeight = formatValue(weightEv?.value);
    const targetWeight = formatValue(goals.targetWeight);
    
    const sleepEvs = monthEvents.filter(ev => ev.category === 'health' && (ev.subject || '').toLowerCase().includes('sleep'));
    const currentSleep = sleepEvs.reduce((sum, ev) => sum + formatValue(ev.value), 0) / (monthEvents.length || 1);
    const targetSleep = formatValue(goals.targetSleepHours);

    const calEvs = monthEvents.filter(ev => ev.category === 'health' && (ev.subject || '').toLowerCase().includes('calorie'));
    const currentCals = calEvs.reduce((sum, ev) => sum + formatValue(ev.value), 0);
    const targetCals = formatValue(goals.dailyCaloriesGoal);

    const exerciseEvs = monthEvents.filter(ev => ev.category === 'health' && (ev.subject || '').toLowerCase().includes('exercise'));
    const currentExercise = exerciseEvs.reduce((sum, ev) => sum + formatValue(ev.value), 0);
    const targetExercise = goals.exerciseGoal || '0';

    // --- Finance ---
    const expenses = monthEvents.filter(ev => ev.category === 'finance' && !ev.isIncome);
    const income = monthEvents.filter(ev => ev.category === 'finance' && ev.isIncome);
    const currentSpending = expenses.reduce((sum, ev) => sum + formatValue(ev.value), 0);
    const targetSpending = formatValue(goals.monthlySpendingLimit);
    
    const currentSavings = income.reduce((sum, ev) => sum + formatValue(ev.value), 0) - currentSpending;
    const targetSavings = formatValue(goals.savingGoal);
    
    const currentDebt = formatValue(goals.currentDebt);
    const targetDebt = formatValue(goals.debtReductionGoal); 

    // --- Work ---
    const workEvs = monthEvents.filter(ev => ev.category === 'work');
    const currentHours = workEvs.reduce((sum, ev) => sum + normalizeWorkHours(formatValue(ev.value), ev.unit), 0);
    const targetHours = formatValue(goals.monthlyWorkTarget);

    const studyEvs = monthEvents.filter(ev => ev.category === 'study' || (ev.subject || '').toLowerCase().includes('english'));
    const currentStudy = studyEvs.reduce((sum, ev) => sum + formatValue(ev.value), 0);
    const targetStudy = formatValue(goals.englishStudyGoal);

    // --- Car ---
    const odometerEvs = timelineEvents.filter(ev => ev.category === 'garage' && ((ev.subject || '').toLowerCase().includes('ไมล์') || (ev.subject || '').toLowerCase().includes('odometer')));
    const currentOdo = odometerEvs.length > 0 ? formatValue(odometerEvs[odometerEvs.length - 1].value) : 0;
    const targetOdoService = formatValue(goals.vehicles?.[0]?.nextServiceKm);

    return {
      health: {
        weight: { current: currentWeight, target: targetWeight, progress: calcProgress(currentWeight, targetWeight), remaining: calcRemaining(currentWeight, targetWeight) },
        sleep: { current: currentSleep.toFixed(1), target: targetSleep, progress: calcProgress(currentSleep, targetSleep), remaining: calcRemaining(currentSleep, targetSleep) },
        calories: { current: currentCals.toFixed(0), target: targetCals, progress: calcProgress(currentCals, targetCals), remaining: calcRemaining(currentCals, targetCals) },
        exercise: { current: currentExercise.toFixed(0), target: targetExercise, progress: 'N/A', remaining: 'N/A' }
      },
      finance: {
        spending: { current: currentSpending, target: targetSpending, progress: calcProgress(currentSpending, targetSpending), remaining: calcRemaining(currentSpending, targetSpending) },
        savings: { current: currentSavings, target: targetSavings, progress: calcProgress(currentSavings, targetSavings), remaining: calcRemaining(currentSavings, targetSavings) },
        debt: { current: currentDebt, target: targetDebt, progress: calcProgress(currentDebt, targetDebt), remaining: calcRemaining(currentDebt, targetDebt) }
      },
      work: {
        hours: { current: currentHours, target: targetHours, progress: calcProgress(currentHours, targetHours), remaining: calcRemaining(currentHours, targetHours) },
        study: { current: currentStudy, target: targetStudy, progress: calcProgress(currentStudy, targetStudy), remaining: calcRemaining(currentStudy, targetStudy) },
        goals: goals.importantWorkGoals || 'No goals set'
      },
      car: {
        odometer: { current: currentOdo, target: targetOdoService, progress: calcProgress(currentOdo, targetOdoService), remaining: calcRemaining(currentOdo, targetOdoService) },
        nextService: goals.vehicles?.[0]?.nextServiceKm || 'N/A',
        insurance: goals.vehicles?.[0]?.insuranceExpiryDate || 'N/A',
        tax: goals.vehicles?.[0]?.taxExpiryDate || 'N/A'
      }
    };
  }, [timelineEvents, goals]);

  // Today Intelligence Summary & Life Score Calculation
  const todaySummaryStats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayEvents = timelineEvents.filter((ev: any) => ev.timestamp && ev.timestamp.startsWith(todayStr));

    const formatValue = (val: string | number | undefined | null) => {
      if (val === null || val === undefined || val === '') return 0;
      const parsed = parseFloat(val.toString().replace(/,/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    };

    // --- 1. Finance: Use today's expense events ---
    const todaySpending = todayEvents
      .filter((ev: any) => ev.category === 'finance' && !ev.isIncome)
      .reduce((sum: number, ev: any) => sum + formatValue(ev.value), 0);
    const targetDailySpending = formatValue(goals.monthlySpendingLimit) / 30 || 1000;

    // --- 2. Calories: Use today's calorie events ---
    const todayCalories = todayEvents
      .filter((ev: any) => ev.category === 'health' && (ev.subject || '').toLowerCase().includes('calorie'))
      .reduce((sum: number, ev: any) => sum + formatValue(ev.value), 0);
    const targetCalories = formatValue(goals.dailyCaloriesGoal) || 2000;

    // --- 3. Exercise: Use today's exercise duration ---
    const todayExercise = todayEvents
      .filter((ev: any) => ev.category === 'health' && (ev.subject || '').toLowerCase().includes('exercise'))
      .reduce((sum: number, ev: any) => sum + formatValue(ev.value), 0);
    const targetExercise = parseFloat(goals.exerciseGoal) || 30;

    // --- 4. English: Keep as minutes ---
    const todayStudy = todayEvents
      .filter((ev: any) => ev.category === 'study' || (ev.subject || '').toLowerCase().includes('english') || ev.type === 'english_study')
      .reduce((sum: number, ev: any) => sum + formatValue(ev.value), 0);
    let monthlyStudyMins = parseFloat(goals.englishStudyGoal) || 30;
    if (goals.englishStudyGoal && goals.englishStudyGoal.toLowerCase().includes('hour')) {
      monthlyStudyMins = monthlyStudyMins * 60;
    }
    const targetDailyStudy = monthlyStudyMins / 30 || 30;

    // --- 5. Weight: Use latest weight entry ---
    const sortedWeightEvents = [...timelineEvents]
      .filter((ev: any) => ev.category === 'health' && ((ev.subject || '').toLowerCase().includes('weight') || ev.type === 'weight'))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const latestWeight = sortedWeightEvents.length > 0 ? formatValue(sortedWeightEvents[0].value) : 0;
    const targetWeight = formatValue(goals.targetWeight);

    // --- 6. Work: If unit is minutes, divide by 60. If unit is hours, use as is. ---
    const todayWorkHours = todayEvents
      .filter((ev: any) => ev.category === 'work' || ev.type === 'work_hours')
      .reduce((sum: number, ev: any) => sum + normalizeWorkHours(formatValue(ev.value), ev.unit), 0);
    const targetWorkHours = formatValue(goals.dailyWorkGoal) || 8;

    // --- 7. Vehicle data ---
    const odometerEvs = timelineEvents.filter((ev: any) => ev.category === 'garage' && ((ev.subject || '').toLowerCase().includes('ไมล์') || (ev.subject || '').toLowerCase().includes('odometer')));
    const currentOdo = odometerEvs.length > 0 ? formatValue(odometerEvs[odometerEvs.length - 1].value) : 0;
    const targetOdoService = formatValue(goals.vehicles?.[0]?.nextServiceKm);
    const hasCarData = (goals.vehicles && goals.vehicles.length > 0) || currentOdo > 0;

    // --- Score Calculations ---
    // 1) สุขภาพ
    let calScore = todayCalories === 0 ? 100 : (todayCalories <= targetCalories ? 100 : Math.max(0, 100 - ((todayCalories - targetCalories) / targetCalories) * 100));
    let exScore = targetExercise > 0 ? Math.min(100, (todayExercise / targetExercise) * 100) : 100;
    let wScore = targetWeight > 0 && latestWeight > 0 ? Math.max(0, 100 - (Math.abs(latestWeight - targetWeight) / targetWeight) * 150) : 100;
    const healthScore = Math.round((calScore + exScore + wScore) / 3);

    // 2) การเงิน
    const financeScore = todaySpending <= targetDailySpending ? 100 : Math.max(0, 100 - ((todaySpending - targetDailySpending) / targetDailySpending) * 100);

    // 3) งาน
    const workScore = targetWorkHours > 0 ? Math.min(100, (todayWorkHours / targetWorkHours) * 100) : 100;

    // 4) การเรียนรู้
    const learningScore = targetDailyStudy > 0 ? Math.min(100, (todayStudy / targetDailyStudy) * 100) : 100;

    // 5) รถยนต์
    let carScore = 100;
    if (hasCarData) {
      if (currentOdo > 0 && targetOdoService > currentOdo) {
        const remaining = targetOdoService - currentOdo;
        if (remaining < 0) carScore = 0;
        else if (remaining < 1000) carScore = Math.round((remaining / 1000) * 100);
      }
    }

    // Overall Life Score
    let totalCategories = 4;
    let scoreSum = healthScore + financeScore + workScore + learningScore;
    if (hasCarData) {
      scoreSum += carScore;
      totalCategories += 1;
    }
    const totalLifeScore = Math.round(scoreSum / totalCategories);

    return {
      todaySpending,
      targetDailySpending,
      todayCalories,
      targetCalories,
      todayExercise,
      targetExercise,
      todayStudy,
      targetDailyStudy,
      latestWeight,
      targetWeight,
      todayWorkHours,
      targetWorkHours,
      hasCarData,
      currentOdo,
      targetOdoService,
      healthScore,
      financeScore,
      workScore,
      learningScore,
      carScore,
      totalLifeScore
    };
  }, [timelineEvents, goals]);

  const getLabel = (enKey: string) => {
    if (language !== 'th') return enKey;
    const translations: Record<string, string> = {
      'Health': 'สุขภาพ',
      'Finance': 'การเงิน',
      'Work': 'งาน',
      'Vehicle': 'รถยนต์',
      'Weight': 'น้ำหนัก',
      'Sleep': 'การนอน',
      'Calories': 'แคลอรี่',
      'Exercise': 'ออกกำลังกาย',
      'Spending': 'ใช้เงิน',
      'Spending Today': 'ใช้เงินวันนี้',
      'Spending Month': 'ใช้เงินเดือนนี้',
      'Savings': 'เงินออม',
      'Debt': 'หนี้',
      'Emergency Fund': 'เงินฉุกเฉิน',
      'Hours Today': 'ชั่วโมงงานวันนี้',
      'Hours Month': 'ชั่วโมงงานเดือนนี้',
      'English Study': 'เรียนอังกฤษ',
      'Odometer': 'เลขไมล์',
    };
    return translations[enKey] || enKey;
  };

  const KpiCard = ({
    icon,
    label,
    valObj,
    unit,
    category,
    subject,
    onUpdateStat
  }: {
    icon: string;
    label: string;
    valObj: any;
    unit: string;
    category?: string;
    subject?: string;
    onUpdateStat?: (cat: string, sub: string, change: number) => void;
  }) => {
    const current = valObj?.current;
    const target = valObj?.target;
    const progress = valObj?.progress;

    const hasVal = current !== null && current !== undefined && current !== '' && current !== 0 && current !== '0' && current !== '0.0';
    const targetNum = parseFloat(target);
    const hasTarget = target !== null && target !== undefined && target !== '' && target !== 0 && target !== '0' && target !== '0.0' && !isNaN(targetNum) && targetNum > 0;

    const displayVal = hasVal ? `${current} ${unit}` : (language === 'th' ? 'รอบันทึกข้อมูล' : 'Pending...');
    const displayTarget = hasTarget ? `${target} ${unit}` : (language === 'th' ? 'ไม่มีเป้าหมาย' : 'No target set');

    const isClickable = !!onNavigateToTimeline;

    return (
      <div 
        onClick={isClickable ? onNavigateToTimeline : undefined}
        className={`relative bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-xs hover:bg-white/15 transition-all flex flex-col justify-between min-h-[76px] ${isClickable ? 'cursor-pointer select-none hover:border-teal-500/30' : ''}`}
      >
        <div className="flex items-start text-slate-300 font-semibold text-xs pr-4">
          <span className="text-base shrink-0 mr-1">{icon}</span>
          <span className="font-bold text-xs text-slate-200 break-words leading-tight max-w-[90%] truncate">{getLabel(label)}</span>
          
          {isClickable && (
            <span className="absolute top-1.5 right-2 text-slate-400 font-extrabold text-sm opacity-60">
              ›
            </span>
          )}
        </div>
        <div className="my-0.5">
          <div className={`tracking-tight ${hasVal ? 'text-white text-base sm:text-[18px] font-black' : 'text-slate-500 font-medium text-[11px] italic'}`}>
            {displayVal}
          </div>
        </div>
        
        {/* Progress Bar & Footer */}
        {hasTarget ? (
          <div className="mt-0.5 pt-0.5 border-t border-white/5 flex flex-col gap-0.5 text-[10px] text-slate-300">
            <div className="w-full bg-white/10 rounded-full h-0.5 overflow-hidden mt-0.5">
              <div 
                className="bg-teal-400 h-full rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(100, Math.max(0, parseFloat(progress || 0)))}%` }}
              />
            </div>
            <div className="flex items-center justify-between gap-1 mt-0.5">
              <div className="truncate text-slate-400 text-[9px]">
                <span className="font-medium">{language === 'th' ? 'เป้า:' : 'Goal:'}</span>{' '}
                <span className="font-semibold text-teal-300">{displayTarget}</span>
              </div>
              {hasVal && progress !== null && progress !== undefined && progress !== '0' && progress !== 0 && progress !== '0.0' && (
                <span className="text-teal-300 font-bold text-[9px] shrink-0">
                  {parseFloat(progress).toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-0.5 pt-0.5 border-t border-white/5 text-[9px] text-slate-500 italic">
            {language === 'th' ? 'ไม่มีเป้าหมาย' : 'No target set'}
          </div>
        )}
      </div>
    );
  };

  const dayProgress = useMemo(() => {
    const now = new Date();
    return (now.getHours() + now.getMinutes() / 60) / 24;
  }, []);
  const isDayMoreThan75Percent = dayProgress > 0.75;

  const checkWarning = (stats: any[]) => isDayMoreThan75Percent && stats.some(s => parseFloat(s.progress) < 50);

  return (
    <div className="space-y-6">
      {/* 🏆 LIFE SCORE CARD */}
      <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-teal-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/[0.05] rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏆</span>
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                {language === 'th' ? 'คะแนนชีวิต' : 'LIFE SCORE'}
              </h2>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-white tracking-tight leading-none">
                  {todaySummaryStats.totalLifeScore}
                </span>
                <span className="text-xs font-semibold text-slate-400">/ 100</span>
              </div>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full border text-xs font-extrabold flex items-center gap-1 shadow-sm ${
            todaySummaryStats.totalLifeScore >= 85
              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
              : todaySummaryStats.totalLifeScore >= 70
                ? 'text-sky-400 border-sky-500/30 bg-sky-500/10'
                : todaySummaryStats.totalLifeScore >= 50
                  ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                  : 'text-rose-400 border-rose-500/30 bg-rose-500/10'
          }`}>
            <span>✨</span>
            <span>
              {(() => {
                const score = todaySummaryStats.totalLifeScore;
                if (score >= 85) return language === 'th' ? 'ยอดเยี่ยม' : 'Excellent';
                if (score >= 70) return language === 'th' ? 'ดี' : 'Good';
                if (score >= 50) return language === 'th' ? 'ต้องปรับปรุง' : 'Needs Improvement';
                return language === 'th' ? 'เสี่ยง' : 'At Risk';
              })()}
            </span>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="mt-3">
          <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-2">
            {language === 'th' ? 'สัดส่วนคะแนนแยกตามด้าน' : 'Life Area Breakdown'}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { icon: '❤️', label: language === 'th' ? 'สุขภาพ' : 'Health', score: todaySummaryStats.healthScore },
              { icon: '💰', label: language === 'th' ? 'การเงิน' : 'Finance', score: todaySummaryStats.financeScore },
              { icon: '💼', label: language === 'th' ? 'งาน' : 'Work', score: todaySummaryStats.workScore },
              { icon: '📚', label: language === 'th' ? 'การเรียนรู้' : 'Learning', score: todaySummaryStats.learningScore },
              { icon: '🚗', label: language === 'th' ? 'รถยนต์' : 'Vehicle', score: todaySummaryStats.hasCarData ? todaySummaryStats.carScore : null }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-2 flex flex-col justify-between min-h-[52px] hover:bg-white/10 transition-all">
                <div className="flex items-center gap-1 text-[11px] text-slate-300 font-bold">
                  <span>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                <div className="mt-0.5 text-sm font-extrabold text-white">
                  {item.score !== null ? `${item.score}%` : (language === 'th' ? 'รอบันทึกข้อมูล' : 'No data')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🌞 วันนี้ของ TUK */}
      <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-2 mb-2.5 border-b border-white/5 pb-1.5">
          <span className="text-lg">🌞</span>
          <h3 className="text-base sm:text-[18px] font-black text-white">
            {language === 'th' ? 'วันนี้ของ TUK' : 'Today of TUK'}
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            {
              icon: '💰',
              label: language === 'th' ? 'ใช้เงินวันนี้' : 'Spending Today',
              value: todaySummaryStats.todaySpending,
              target: todaySummaryStats.targetDailySpending,
              unit: language === 'th' ? 'บาท' : 'THB',
              emptyText: language === 'th' ? 'รอบันทึกข้อมูล' : 'Pending...',
              isSpending: true,
            },
            {
              icon: '🍔',
              label: language === 'th' ? 'แคลอรี่วันนี้' : 'Calories Intake',
              value: todaySummaryStats.todayCalories,
              target: todaySummaryStats.targetCalories,
              unit: 'kcal',
              emptyText: language === 'th' ? 'รอบันทึกข้อมูล' : 'Pending...',
            },
            {
              icon: '🏃',
              label: language === 'th' ? 'ออกกำลังกาย' : 'Exercise Duration',
              value: todaySummaryStats.todayExercise,
              target: todaySummaryStats.targetExercise,
              unit: language === 'th' ? 'นาที' : 'min',
              emptyText: language === 'th' ? 'รอบันทึกข้อมูล' : 'Pending...',
            },
            {
              icon: '📚',
              label: language === 'th' ? 'เรียนอังกฤษ' : 'English Study',
              value: todaySummaryStats.todayStudy,
              target: todaySummaryStats.targetDailyStudy,
              unit: language === 'th' ? 'นาที' : 'min',
              emptyText: language === 'th' ? 'รอบันทึกข้อมูล' : 'Pending...',
            },
            {
              icon: '⚖️',
              label: language === 'th' ? 'น้ำหนักล่าสุด' : 'Latest Weight',
              value: todaySummaryStats.latestWeight,
              target: todaySummaryStats.targetWeight,
              unit: 'kg',
              emptyText: language === 'th' ? 'รอบันทึกข้อมูล' : 'Pending...',
              isWeight: true,
            },
            {
              icon: '💼',
              label: language === 'th' ? 'งานวันนี้' : 'Work Hours Today',
              value: todaySummaryStats.todayWorkHours,
              target: todaySummaryStats.targetWorkHours,
              unit: language === 'th' ? 'ชม.' : 'hrs',
              emptyText: language === 'th' ? 'รอบันทึกข้อมูล' : 'Pending...',
            }
          ].map((item, idx) => {
            const hasVal = item.value > 0;
            const displayVal = hasVal 
              ? (item.target && item.target > 0 && !item.isWeight
                  ? `${item.value.toLocaleString(undefined, { maximumFractionDigits: 1 })} / ${item.target.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${item.unit}`
                  : `${item.value.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${item.unit}`
                )
              : null;

            return (
              <div key={idx} className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 p-2 px-2.5 py-1.5 rounded-xl flex items-start gap-2 transition-all">
                <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold text-slate-400 truncate">
                    {item.label}
                  </div>
                  <div className="mt-0.5">
                    {hasVal ? (
                      <span className="text-xs sm:text-sm font-black text-white">
                        {displayVal}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500 italic">
                        {item.emptyText}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED CATEGORIES BELOW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ❤️ Health */}
        <div className="space-y-2">
          <h4 className="text-[18px] sm:text-[20px] font-bold text-slate-200 flex items-center gap-1.5">
            <span>❤️</span>
            <span>{getLabel('Health')}</span>
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <KpiCard icon="⚖️" label="Weight" valObj={cockpitStats.health.weight} unit="kg" category="health" subject="weight" onUpdateStat={onUpdateStat} />
            <KpiCard icon="😴" label="Sleep" valObj={cockpitStats.health.sleep} unit={language === 'th' ? 'ชม.' : 'hrs'} category="health" subject="sleep" onUpdateStat={onUpdateStat} />
            <KpiCard icon="🍽️" label="Calories" valObj={cockpitStats.health.calories} unit="kcal" category="health" subject="calories" onUpdateStat={onUpdateStat} />
            <KpiCard icon="🏃" label="Exercise" valObj={cockpitStats.health.exercise} unit={language === 'th' ? 'นาที' : 'min'} category="health" subject="exercise" onUpdateStat={onUpdateStat} />
          </div>
        </div>

        {/* 💰 Finance */}
        <div className="space-y-2">
          <h4 className="text-[18px] sm:text-[20px] font-bold text-slate-200 flex items-center gap-1.5">
            <span>💰</span>
            <span>{getLabel('Finance')}</span>
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <KpiCard icon="💰" label="Spending" valObj={cockpitStats.finance.spending} unit={language === 'th' ? 'บาท' : 'THB'} category="finance" subject="spending" onUpdateStat={onUpdateStat} />
            <KpiCard icon="🏦" label="Savings" valObj={cockpitStats.finance.savings} unit={language === 'th' ? 'บาท' : 'THB'} category="finance" subject="savings" onUpdateStat={onUpdateStat} />
            <KpiCard icon="💳" label="Debt" valObj={cockpitStats.finance.debt} unit={language === 'th' ? 'บาท' : 'THB'} category="finance" subject="debt" onUpdateStat={onUpdateStat} />
          </div>
        </div>

        {/* 💼 Work */}
        <div className="space-y-2">
          <h4 className="text-[18px] sm:text-[20px] font-bold text-slate-200 flex items-center gap-1.5">
            <span>💼</span>
            <span>{getLabel('Work')}</span>
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <KpiCard icon="💼" label="Hours" valObj={cockpitStats.work.hours} unit={language === 'th' ? 'ชม.' : 'hours'} category="work" subject="hours" onUpdateStat={onUpdateStat} />
            <KpiCard icon="📚" label="English" valObj={cockpitStats.work.study} unit={language === 'th' ? 'นาที' : 'min'} category="work" subject="study" onUpdateStat={onUpdateStat} />
          </div>
          <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-[10px] text-slate-300">
            <div className="font-bold text-slate-400 mb-0.5">{language === 'th' ? 'เป้าหมายสำคัญ:' : 'Important Goal:'}</div>
            <div>{cockpitStats.work.goals || (language === 'th' ? 'รอบันทึกข้อมูล' : 'No target set')}</div>
          </div>
        </div>

        {/* 🚗 Vehicle */}
        <div className="space-y-2">
          <h4 className="text-[18px] sm:text-[20px] font-bold text-slate-200 flex items-center gap-1.5">
            <span>🚗</span>
            <span>{getLabel('Vehicle')}</span>
          </h4>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 shadow-lg flex flex-col gap-2">
            {/* Row 1: Odometer & Next Service */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/[0.02] p-2 rounded-xl border border-white/5 flex flex-col">
                <span className="font-semibold text-slate-400 text-[10px] flex items-center gap-1">
                  <span>📈</span>
                  <span>{language === 'th' ? 'เลขไมล์สะสม' : 'Odometer'}</span>
                </span>
                <span className="text-[15px] sm:text-[16px] font-extrabold text-white mt-0.5 leading-tight">
                  {cockpitStats.car.odometer.current ? `${cockpitStats.car.odometer.current.toLocaleString()} กม.` : (language === 'th' ? 'รอบันทึกข้อมูล' : 'No data')}
                </span>
              </div>
              <div className="bg-white/[0.02] p-2 rounded-xl border border-white/5 flex flex-col">
                <span className="font-semibold text-slate-400 text-[10px] flex items-center gap-1">
                  <span>🔧</span>
                  <span>{language === 'th' ? 'เช็กระยะถัดไป' : 'Next Service'}</span>
                </span>
                <span className="text-[15px] sm:text-[16px] font-extrabold text-teal-300 mt-0.5 leading-tight">
                  {typeof cockpitStats.car.nextService === 'number' || !isNaN(parseFloat(cockpitStats.car.nextService))
                    ? `${parseFloat(cockpitStats.car.nextService.toString().replace(/,/g, '')).toLocaleString()} กม.`
                    : (cockpitStats.car.nextService || 'N/A')}
                </span>
              </div>
            </div>

            {/* Row 2: Remaining Distance */}
            <div className="bg-white/[0.02] p-2 rounded-xl border border-white/5 flex flex-col">
              <span className="font-semibold text-slate-400 text-[10px] flex items-center gap-1">
                <span>⏳</span>
                <span>{language === 'th' ? 'ระยะทางคงเหลือก่อนเข้าศูนย์' : 'Remaining Distance'}</span>
              </span>
              <span className="text-[15px] sm:text-[16px] font-extrabold text-amber-400 mt-0.5 leading-tight">
                {(() => {
                  const nextServiceVal = parseFloat(cockpitStats.car.nextService.toString().replace(/,/g, ''));
                  const currentOdoVal = cockpitStats.car.odometer.current;
                  if (!isNaN(nextServiceVal) && currentOdoVal > 0) {
                    const diff = nextServiceVal - currentOdoVal;
                    return `${diff.toLocaleString()} กม.`;
                  }
                  return language === 'th' ? 'รอบันทึกข้อมูล' : 'No data';
                })()}
              </span>
            </div>

            {/* Row 3: Insurance & Tax */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/[0.02] p-2 rounded-xl border border-white/5 flex flex-col">
                <span className="font-semibold text-slate-400 text-[10px] flex items-center gap-1">
                  <span>🛡️</span>
                  <span>{language === 'th' ? 'หมดอายุประกัน' : 'Insurance Expiry'}</span>
                </span>
                <span className="text-[15px] sm:text-[16px] font-extrabold text-white mt-0.5 leading-tight">
                  {cockpitStats.car.insurance || 'N/A'}
                </span>
              </div>
              <div className="bg-white/[0.02] p-2 rounded-xl border border-white/5 flex flex-col">
                <span className="font-semibold text-slate-400 text-[10px] flex items-center gap-1">
                  <span>📄</span>
                  <span>{language === 'th' ? 'หมดอายุภาษี' : 'Tax Expiry'}</span>
                </span>
                <span className="text-[15px] sm:text-[16px] font-extrabold text-white mt-0.5 leading-tight">
                  {cockpitStats.car.tax || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

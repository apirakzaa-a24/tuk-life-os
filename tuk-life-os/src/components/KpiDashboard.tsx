import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import OverviewTab from './OverviewTab';
import TodayCockpit from './TodayCockpit';
const InsightsTab = lazy(() => import('./InsightsTab'));
const ToolsTab = lazy(() => import('./ToolsTab'));
import { CollapsibleSection } from './CollapsibleSection';
import {
  Activity, DollarSign, Car, Briefcase, Heart, Check,
  AlertTriangle, Play, Smartphone, Calendar, Database,
  ArrowRight, ShieldCheck, RefreshCw, Send, CheckSquare,
  Clock, Flame, TrendingUp, Sparkles, Server, Cpu, HardDrive, Bell, Trophy, FileText, BarChart2,
  LayoutDashboard, BrainCircuit, Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { safeLocalStorage } from '../utils/storage';

const normalizeWorkHours = (value: number, unit?: string): number => {
  if (!unit) return value;
  const u = unit.toLowerCase();
  if (u === 'minutes' || u === 'minute' || u === 'min' || u === 'นาที') {
    return value / 60;
  }
  return value;
};

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
    <div className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
  </div>
);

export default function KpiDashboard({
  isSimplifiedMode = false,
  language = 'en',
  onNavigateToTimeline
}: {
  isSimplifiedMode?: boolean;
  language?: 'th' | 'en';
  onNavigateToTimeline?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'tools'>('overview');
  const [activeSegment, setActiveSegment] = useState<'finance' | 'health' | 'garage' | 'work'>('finance');
  const [backupSchedule, setBackupSchedule] = useState<'daily' | 'weekly' | 'manual'>('daily');
  const [backingUp, setBackingUp] = useState<boolean>(false);
  
  // Mobile simulator state
  const [mobileScreen, setMobileScreen] = useState<'home' | 'metrics'>('home');
  const [simWeight, setSimWeight] = useState('');
  const [simulatorStatus, setSimulatorStatus] = useState<string | null>(null);
  const [showKB, setShowKB] = useState(false);
  const [backupLogs, setBackupLogs] = useState<string[]>(['✓ Backup initialized', '✓ Cleanup verified']);

  const executeMobileAction = (action: string) => {
    if (simulatorStatus) return; // Already running
    setSimulatorStatus(`Executing: ${action}...`);
    setTimeout(() => {
      setSimulatorStatus(null);
    }, 2000);
  };

  const runManualBackup = () => {
    setBackingUp(true);
    setTimeout(() => {
      setBackingUp(false);
    }, 1800);
  };

  // Load goals from storage
  const [goals, setGoals] = useState(() => {
    try {
      const data = safeLocalStorage.getItem('tuk_life_goals_standards');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error parsing tuk_life_goals_standards', e);
    }
    return {};
  });

  const [timelineEvents, setTimelineEvents] = useState(() => {
    try {
      const data = safeLocalStorage.getItem('tuk_life_timeline_events');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error parsing tuk_life_timeline_events', e);
    }
    return [];
  });

  // Persist timelineEvents changes
  useEffect(() => {
    safeLocalStorage.setItem('tuk_life_timeline_events', JSON.stringify(timelineEvents));
  }, [timelineEvents]);

  const handleUpdateStat = (category: string, subject: string, change: number) => {
    const now = new Date();
    const newEvent = {
      timestamp: now.toISOString(),
      category: category,
      subject: subject,
      value: change.toString(),
      unit: 'Manual Adjustment'
    };
    setTimelineEvents(prev => [...prev, newEvent]);
  };

  const cockpitStats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);

    const todayEvents = timelineEvents.filter((ev: any) => ev.timestamp && ev.timestamp.startsWith(todayStr));
    const monthEvents = timelineEvents.filter((ev: any) => ev.timestamp && ev.timestamp.startsWith(currentMonthPrefix));

    const calcProgress = (current: number, target: number) => target > 0 ? Math.min(100, (current / target) * 100).toFixed(0) : 0;
    const calcRemaining = (current: number, target: number) => target > current ? (target - current).toFixed(1) : 0;
    const formatValue = (val: string | number | undefined | null) => {
      if (val === null || val === undefined || val === '') return 0;
      const parsed = parseFloat(val.toString().replace(/,/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    };

    const getTarget = (val: string | number | undefined) => {
        const parsed = formatValue(val);
        return parsed > 0 ? parsed : null;
    }

    // --- Health ---
    const weightEv = todayEvents.find(ev => ev.category === 'health' && (ev.type === 'weight' || (ev.subject || '').toLowerCase().includes('weight')));
    const currentWeight = weightEv ? formatValue(weightEv.value) : null;
    const targetWeight = getTarget(goals.targetWeight);
    
    const sleepEvs = todayEvents.filter(ev => ev.category === 'health' && (ev.type === 'sleep' || (ev.subject || '').toLowerCase().includes('sleep')));
    const currentSleep = sleepEvs.reduce((sum, ev) => sum + formatValue(ev.value), 0);
    const targetSleep = getTarget(goals.targetSleepHours);

    const calEvs = todayEvents.filter(ev => ev.category === 'health' && (ev.type === 'calories' || (ev.subject || '').toLowerCase().includes('calorie')));
    const currentCals = calEvs.reduce((sum, ev) => sum + formatValue(ev.value), 0);
    const targetCals = getTarget(goals.dailyCaloriesGoal);

    const exerciseEvs = todayEvents.filter(ev => ev.category === 'health' && (ev.type === 'exercise' || (ev.subject || '').toLowerCase().includes('exercise')));
    const currentExercise = exerciseEvs.reduce((sum, ev) => sum + formatValue(ev.value), 0);
    const targetExercise = getTarget(goals.exerciseGoal);

    // --- Finance ---
    const expenses = todayEvents.filter(ev => (ev.type === 'expense' || (ev.category === 'finance' && !ev.isIncome)));
    const monthlyExpenses = monthEvents.filter(ev => (ev.type === 'expense' || (ev.category === 'finance' && !ev.isIncome)));
    const income = monthEvents.filter(ev => (ev.type === 'income' || (ev.category === 'finance' && ev.isIncome)));
    const currentSpendingToday = expenses.reduce((sum, ev) => sum + formatValue(ev.value), 0);
    const targetSpendingToday = getTarget(goals.dailySpendingGoal);
    const currentSpendingMonthly = monthlyExpenses.reduce((sum, ev) => sum + formatValue(ev.value), 0);
    const targetSpendingMonthly = getTarget(goals.monthlySpendingLimit);
    
    const currentSavings = income.reduce((sum, ev) => sum + formatValue(ev.value), 0) - currentSpendingMonthly;
    const targetSavings = getTarget(goals.savingGoal);
    
    const currentDebt = formatValue(goals.currentDebt);
    const targetDebt = getTarget(goals.debtReductionGoal); 

    // --- Work ---
    const workEvs = todayEvents.filter(ev => (ev.type === 'work_hours' || ev.category === 'work'));
    const workEvsMonth = monthEvents.filter(ev => (ev.type === 'work_hours' || ev.category === 'work'));
    const currentHoursToday = workEvs.reduce((sum, ev) => sum + normalizeWorkHours(formatValue(ev.value), ev.unit), 0);
    const targetHoursToday = getTarget(goals.dailyWorkGoal);
    const currentHoursMonthly = workEvsMonth.reduce((sum, ev) => sum + normalizeWorkHours(formatValue(ev.value), ev.unit), 0);
    const targetHoursMonthly = getTarget(goals.monthlyWorkTarget);

    const studyEvs = todayEvents.filter(ev => (ev.type === 'english_study' || ev.category === 'study' || (ev.subject || '').toLowerCase().includes('english')));
    const currentStudy = studyEvs.reduce((sum, ev) => sum + formatValue(ev.value), 0);
    const targetStudyToday = getTarget(goals.dailyStudyGoal);

    // --- Car ---
    const activeVehicles = (goals.vehicles || []).filter(v => v.status === 'ACTIVE');
    const carStats = activeVehicles.map(v => {
        const odometerEvs = timelineEvents.filter(ev => ev.category === 'garage' && (ev.type === 'odometer' || (ev.subject || '').toLowerCase().includes((v.name || '').toLowerCase()) || (v.licensePlate && (ev.subject || '').toLowerCase().includes((v.licensePlate || '').toLowerCase()))));
        const currentOdo = odometerEvs.length > 0 ? formatValue(odometerEvs[odometerEvs.length - 1].value) : formatValue(v.currentOdometer);
        const targetOdoService = getTarget(v.nextServiceKm);
        
        return {
            vehicleName: v.name,
            odometer: { current: currentOdo, target: targetOdoService, progress: targetOdoService ? calcProgress(currentOdo, targetOdoService) : null, remaining: targetOdoService ? calcRemaining(currentOdo, targetOdoService) : null },
            nextService: targetOdoService,
            insurance: v.insuranceExpiryDate || null,
            tax: v.taxExpiryDate || null
        };
    });

    return {
      health: {
        weight: { current: currentWeight, target: targetWeight, progress: currentWeight && targetWeight ? calcProgress(currentWeight, targetWeight) : null, remaining: currentWeight && targetWeight ? calcRemaining(currentWeight, targetWeight) : null },
        sleep: { current: currentSleep, target: targetSleep, progress: targetSleep ? calcProgress(currentSleep, targetSleep) : null, remaining: targetSleep ? calcRemaining(currentSleep, targetSleep) : null },
        calories: { current: currentCals, target: targetCals, progress: targetCals ? calcProgress(currentCals, targetCals) : null, remaining: targetCals ? calcRemaining(currentCals, targetCals) : null },
        exercise: { current: currentExercise, target: targetExercise, progress: targetExercise ? calcProgress(currentExercise, targetExercise) : null, remaining: targetExercise ? calcRemaining(currentExercise, targetExercise) : null }
      },
      finance: {
        spendingToday: { current: currentSpendingToday, target: targetSpendingToday, progress: targetSpendingToday ? calcProgress(currentSpendingToday, targetSpendingToday) : null, remaining: targetSpendingToday ? calcRemaining(currentSpendingToday, targetSpendingToday) : null },
        spendingMonthly: { current: currentSpendingMonthly, target: targetSpendingMonthly, progress: targetSpendingMonthly ? calcProgress(currentSpendingMonthly, targetSpendingMonthly) : null, remaining: targetSpendingMonthly ? calcRemaining(currentSpendingMonthly, targetSpendingMonthly) : null },
        savings: { current: currentSavings, target: targetSavings, progress: targetSavings ? calcProgress(currentSavings, targetSavings) : null, remaining: targetSavings ? calcRemaining(currentSavings, targetSavings) : null },
        debt: { current: currentDebt, target: targetDebt, progress: targetDebt ? calcProgress(currentDebt, targetDebt) : null, remaining: targetDebt ? calcRemaining(currentDebt, targetDebt) : null },
        emergencyFund: { current: formatValue(goals.currentEmergencyFund), target: getTarget(goals.emergencyFundGoal), progress: getTarget(goals.emergencyFundGoal) ? calcProgress(formatValue(goals.currentEmergencyFund), getTarget(goals.emergencyFundGoal)!) : null, remaining: getTarget(goals.emergencyFundGoal) ? calcRemaining(formatValue(goals.currentEmergencyFund), getTarget(goals.emergencyFundGoal)!) : null }
      },
      work: {
        hoursToday: { current: currentHoursToday, target: targetHoursToday, progress: targetHoursToday ? calcProgress(currentHoursToday, targetHoursToday) : null, remaining: targetHoursToday ? calcRemaining(currentHoursToday, targetHoursToday) : null },
        hoursMonthly: { current: currentHoursMonthly, target: targetHoursMonthly, progress: targetHoursMonthly ? calcProgress(currentHoursMonthly, targetHoursMonthly) : null, remaining: targetHoursMonthly ? calcRemaining(currentHoursMonthly, targetHoursMonthly) : null },
        study: { current: currentStudy, target: targetStudyToday, progress: targetStudyToday ? calcProgress(currentStudy, targetStudyToday) : null, remaining: targetStudyToday ? calcRemaining(currentStudy, targetStudyToday) : null },
        goals: goals.importantWorkGoals || null
      },
      cars: carStats
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
    const hasTarget = target !== null && target !== undefined && target !== '' && target !== 0 && target !== '0' && target !== '0.0';

    const displayVal = hasVal ? `${current} ${unit}` : (language === 'th' ? 'ยังไม่มีข้อมูล' : 'No data yet');
    const displayTarget = hasTarget ? `${target} ${unit}` : (language === 'th' ? 'ยังไม่ได้ตั้งเป้า' : 'No target set');

    return (
      <div className="relative bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[95px]">
        <div className="flex items-start text-slate-500 font-semibold text-xs pr-7">
          <span className="text-base shrink-0 mt-0.5 mr-1.5">{icon}</span>
          <span className="font-bold text-[16px] sm:text-[17px] text-slate-800 break-words leading-tight max-w-[90%]">{getLabel(label)}</span>
          
          {onNavigateToTimeline && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToTimeline();
              }}
              className="absolute top-2 right-2 text-[14px] text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-all cursor-pointer z-10 flex items-center justify-center w-6 h-6"
              title={hasVal ? (language === 'th' ? 'ดูรายละเอียด' : 'Details') : (language === 'th' ? 'เพิ่มข้อมูล' : 'Add Entry')}
            >
              👁
            </button>
          )}
        </div>
        <div className="my-1">
          <div className={`tracking-tight ${hasVal ? 'text-slate-900 text-[32px] font-bold' : 'text-slate-400 font-medium text-[15px]'}`}>
            {displayVal}
          </div>
        </div>
        
        {/* Progress Bar & Footer */}
        <div className="mt-1 pt-1 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-600">
          {hasTarget && (
            <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden mt-0.5">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(100, Math.max(0, parseFloat(progress || 0)))}%` }}
              />
            </div>
          )}
          <div className="flex items-center justify-between gap-1">
            <div className="truncate text-slate-500">
              <span className="font-medium text-[11px]">{language === 'th' ? 'เป้าหมาย:' : 'Target:'}</span>{' '}
              <span className={`font-semibold text-[11px] ${hasTarget ? 'text-slate-800' : 'italic'}`}>{displayTarget}</span>
            </div>
            {hasVal && hasTarget && progress !== null && progress !== undefined && progress !== '0' && progress !== 0 && progress !== '0.0' && (
              <span className="text-indigo-600 font-bold text-[11px] shrink-0">
                {parseFloat(progress).toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const monthlyStats = useMemo(() => {
    const currentMonthPrefix = new Date().toISOString().slice(0, 7);
    const monthEvents = timelineEvents.filter((ev: any) => ev.timestamp && ev.timestamp.startsWith(currentMonthPrefix));
    
    const formatValue = (val: string | number | undefined | null) => {
      if (val === null || val === undefined || val === '') return 0;
      const parsed = parseFloat(val.toString().replace(/,/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    };

    const weightEvs = monthEvents.filter(ev => ev.type === 'weight').sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const startWeight = weightEvs.length > 0 ? formatValue(weightEvs[0].value) : 0;
    const endWeight = weightEvs.length > 0 ? formatValue(weightEvs[weightEvs.length - 1].value) : 0;
    const sleepEvs = monthEvents.filter(ev => ev.type === 'sleep').map(ev => formatValue(ev.value)).filter(v => v > 0);
    const calEvs = monthEvents.filter(ev => ev.type === 'calories').map(ev => formatValue(ev.value)).filter(v => v > 0);
    
    const spending = monthEvents.filter(ev => ev.type === 'expense' || (ev.category === 'finance' && !ev.isIncome)).reduce((sum, ev) => sum + formatValue(ev.value), 0);
    const income = monthEvents.filter(ev => ev.type === 'income' || (ev.category === 'finance' && ev.isIncome)).reduce((sum, ev) => sum + formatValue(ev.value), 0);

    const workHrs = monthEvents.filter(ev => ev.type === 'work_hours' || ev.category === 'work').reduce((sum, ev) => sum + normalizeWorkHours(formatValue(ev.value), ev.unit), 0);
    const studyHrs = monthEvents.filter(ev => ev.type === 'english_study' || ev.category === 'study').reduce((sum, ev) => sum + formatValue(ev.value), 0);

    const cars = {
        fuel: monthEvents.filter(ev => ev.category === 'garage' && ev.type === 'fuel').reduce((sum, ev) => sum + formatValue(ev.value), 0),
        cost: monthEvents.filter(ev => ev.category === 'garage' && ev.type === 'expense').reduce((sum, ev) => sum + formatValue(ev.value), 0),
        odo: monthEvents.filter(ev => ev.category === 'garage' && ev.type === 'odometer').sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]?.value || 'ยังไม่มีข้อมูล'
    };

    const lifestyle = {
        total: monthEvents.filter(ev => ev.category === 'lifestyle').length,
        moods: monthEvents.filter(ev => ev.type === 'mood').map(ev => ev.value),
        activities: monthEvents.filter(ev => ev.category === 'lifestyle').map(ev => ev.subject)
    };

    return {
        health: { 
            startWeight, endWeight, weightDiff: (endWeight - startWeight).toFixed(1),
            avgSleep: sleepEvs.length > 0 ? (sleepEvs.reduce((a, b) => a + b, 0) / sleepEvs.length).toFixed(1) : 'ยังไม่มีข้อมูล',
            totalExercise: monthEvents.filter(ev => ev.type === 'exercise').reduce((sum, ev) => sum + formatValue(ev.value), 0),
            avgCals: calEvs.length > 0 ? (calEvs.reduce((a, b) => a + b, 0) / calEvs.length).toFixed(0) : 'ยังไม่มีข้อมูล'
        },
        finance: { spending, budget: formatValue(goals.monthlySpendingLimit), income, savings: income - spending, debt: 0 },
        work: { totalHours: workHrs, totalStudy: studyHrs, progress: 'ยังไม่มีข้อมูล' },
        cars,
        lifestyle: { 
            noteCount: lifestyle.total, 
            topMood: lifestyle.moods.length > 0 ? lifestyle.moods.reduce((a, b, i, arr) => (arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b)) : '-',
            topActivity: lifestyle.activities.length > 0 ? lifestyle.activities.reduce((a, b, i, arr) => (arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b)) : '-'
        }
    };
  }, [timelineEvents, goals]);

  const weeklyStats = useMemo(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last7DaysEvents = timelineEvents.filter((ev: any) => new Date(ev.timestamp) >= sevenDaysAgo);
    
    const formatValue = (val: string | number | undefined | null) => {
      if (val === null || val === undefined || val === '') return 0;
      const parsed = parseFloat(val.toString().replace(/,/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    };

    const health = {
        weights: last7DaysEvents.filter(ev => ev.type === 'weight').map(ev => formatValue(ev.value)).filter(v => v > 0),
        sleeps: last7DaysEvents.filter(ev => ev.type === 'sleep').map(ev => formatValue(ev.value)).filter(v => v > 0),
        exercises: last7DaysEvents.filter(ev => ev.type === 'exercise').reduce((sum, ev) => sum + formatValue(ev.value), 0),
        cals: last7DaysEvents.filter(ev => ev.type === 'calories').map(ev => formatValue(ev.value)).filter(v => v > 0),
    };

    const avg = (arr: number[]) => arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 'ยังไม่มีข้อมูล';

    const finance = {
        totalSpending: last7DaysEvents.filter(ev => (ev.type === 'expense' || (ev.category === 'finance' && !ev.isIncome))).reduce((sum, ev) => sum + formatValue(ev.value), 0),
        totalIncome: last7DaysEvents.filter(ev => (ev.type === 'income' || (ev.category === 'finance' && ev.isIncome))).reduce((sum, ev) => sum + formatValue(ev.value), 0),
    };

    const work = {
        totalHours: last7DaysEvents.filter(ev => (ev.type === 'work_hours' || ev.category === 'work')).reduce((sum, ev) => sum + normalizeWorkHours(formatValue(ev.value), ev.unit), 0),
        totalStudy: last7DaysEvents.filter(ev => (ev.type === 'english_study' || ev.category === 'study')).reduce((sum, ev) => sum + formatValue(ev.value), 0),
        tasks: last7DaysEvents.filter(ev => ev.category === 'work').map(ev => ev.subject),
    };

    const cars = {
        totalFuel: last7DaysEvents.filter(ev => ev.category === 'garage' && ev.type === 'fuel').reduce((sum, ev) => sum + formatValue(ev.value), 0),
        totalCost: last7DaysEvents.filter(ev => ev.category === 'garage' && ev.type === 'expense').reduce((sum, ev) => sum + formatValue(ev.value), 0),
        latestOdo: last7DaysEvents.filter(ev => ev.category === 'garage' && ev.type === 'odometer').sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]?.value || 'ยังไม่มีข้อมูล'
    };

    const lifestyle = {
        noteCount: last7DaysEvents.filter(ev => ev.category === 'lifestyle').length,
        moods: last7DaysEvents.filter(ev => ev.type === 'mood').map(ev => ev.value),
    };

    return {
        health: { avgWeight: avg(health.weights), avgSleep: avg(health.sleeps), totalExercise: health.exercises, avgCals: avg(health.cals) },
        finance: { totalSpending: finance.totalSpending, dailyAvgSpending: (finance.totalSpending / 7).toFixed(1), totalIncome: finance.totalIncome, balance: (finance.totalIncome - finance.totalSpending).toFixed(1) },
        work: { totalHours: work.totalHours, totalStudy: work.totalStudy, tasks: work.tasks.slice(0, 3) },
        cars: cars,
        lifestyle: { noteCount: lifestyle.noteCount, topMood: lifestyle.moods.length > 0 ? lifestyle.moods.reduce((a, b, i, arr) => (arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b)) : '-' }
    };
  }, [timelineEvents]);

  const AlertSection = ({ stats, goals }: { stats: any, goals: any }) => {
    const alerts: { text: string, priority: 'red' | 'yellow' }[] = [];
    const now = new Date();
    
    // Vehicle alerts
    (goals.vehicles || []).forEach((v: any) => {
        if (v.insuranceExpiryDate && (new Date(v.insuranceExpiryDate).getTime() - now.getTime()) / (1000*60*60*24) < 60) {
            alerts.push({ text: `${v.name} ประกันจะหมดอายุใน ${Math.max(0, Math.round((new Date(v.insuranceExpiryDate).getTime() - now.getTime()) / (1000*60*60*24)))} วัน`, priority: 'red' });
        }
        if (v.taxExpiryDate && (new Date(v.taxExpiryDate).getTime() - now.getTime()) / (1000*60*60*24) < 60) {
            alerts.push({ text: `${v.name} ภาษีจะหมดอายุใน ${Math.max(0, Math.round((new Date(v.taxExpiryDate).getTime() - now.getTime()) / (1000*60*60*24)))} วัน`, priority: 'red' });
        }
        if (v.nextServiceKm && (v.nextServiceKm - v.currentOdometer) < 1000) {
            alerts.push({ text: `${v.name} ควรเช็กระยะในอีก ${v.nextServiceKm - v.currentOdometer} กม.`, priority: 'yellow' });
        }
    });

    // Health alerts
    if (stats.health.weight.current === null) alerts.push({ text: "วันนี้ยังไม่มีบันทึกน้ำหนัก", priority: 'yellow' });
    if (stats.health.sleep.current && stats.health.sleep.target && stats.health.sleep.current < stats.health.sleep.target) alerts.push({ text: "ชั่วโมงนอนต่ำกว่าเป้า", priority: 'yellow' });
    if (stats.health.exercise.current && stats.health.exercise.target && stats.health.exercise.current < stats.health.exercise.target) alerts.push({ text: "การออกกำลังกายต่ำกว่าเป้า", priority: 'yellow' });
    if (stats.health.calories.current && stats.health.calories.target && stats.health.calories.current > stats.health.calories.target) alerts.push({ text: "แคลอรี่เกินเป้า", priority: 'red' });

    // Finance alerts
    if (stats.finance.spendingToday.current && stats.finance.spendingToday.target && stats.finance.spendingToday.current > stats.finance.spendingToday.target) alerts.push({ text: "ใช้เงินเกินเป้าหมายรายวัน", priority: 'red' });
    if (stats.finance.spendingMonthly.current && stats.finance.spendingMonthly.target && stats.finance.spendingMonthly.current > (stats.finance.spendingMonthly.target * 0.8)) alerts.push({ text: "ใช้เงินเดือนนี้เกิน 80% แล้ว", priority: 'red' });

    // Work/Study
    if (stats.work.hoursToday.current && stats.work.hoursToday.target && stats.work.hoursToday.current < stats.work.hoursToday.target) alerts.push({ text: "ชั่วโมงทำงานต่ำกว่าเป้าวันนี้", priority: 'yellow' });
    if (stats.work.study.current === 0) alerts.push({ text: "ยังไม่มีบันทึกเรียนอังกฤษวันนี้", priority: 'yellow' });

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-3">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-500" />
                🔔 แจ้งเตือนสำคัญ
            </h3>
            {alerts.length === 0 ? (
                <p className="text-xs text-slate-500">วันนี้ไม่มีแจ้งเตือนสำคัญ</p>
            ) : (
                <div className="space-y-2">
                    {alerts.slice(0, 5).map((a, i) => (
                        <div key={i} className={`p-3 rounded-xl text-xs font-bold border-l-4 ${a.priority === 'red' ? 'bg-red-50 border-red-500 text-red-900' : 'bg-amber-50 border-amber-500 text-amber-900'}`}>
                            {a.text}
                        </div>
                    ))}
                    {alerts.length > 5 && <p className="text-[10px] text-slate-400">ดูทั้งหมด...</p>}
                </div>
            )}
        </div>
    );
  };

  const DailyMissions = ({ stats, goals }: { stats: any, goals: any }) => {
    const missions = useMemo(() => {
        const list = [];
        const now = new Date();

        // Health
        if (stats.health.weight.current === null) list.push({ text: "⚖️ ชั่งน้ำหนักวันนี้", priority: 3, completed: false });
        if (stats.health.sleep.current !== null && stats.health.sleep.target && stats.health.sleep.current < stats.health.sleep.target) list.push({ text: `😴 พักผ่อนเพิ่มอีก ${stats.health.sleep.remaining} ชม.`, priority: 2, completed: false });
        if (stats.health.exercise.current !== null && stats.health.exercise.target && stats.health.exercise.current < stats.health.exercise.target) list.push({ text: `🏃 ออกกำลังกายอีก ${stats.health.exercise.remaining} นาที`, priority: 2, completed: false });
        if (stats.health.calories.current !== null && stats.health.calories.target && stats.health.calories.current < stats.health.calories.target) list.push({ text: `🍜 รับพลังงานเพิ่มอีก ${stats.health.calories.remaining} kcal`, priority: 1, completed: false });

        // Finance
        if (stats.finance.spendingToday.current !== null && stats.finance.spendingToday.target && stats.finance.spendingToday.current < stats.finance.spendingToday.target) list.push({ text: "💰 ควบคุมงบประมาณต่อ", priority: 1, completed: false });
        if (stats.finance.spendingToday.current !== null && stats.finance.spendingToday.target && stats.finance.spendingToday.current > stats.finance.spendingToday.target) list.push({ text: "🚨 หยุดใช้จ่ายฟุ่มเฟือยวันนี้", priority: 3, completed: false });
        if (stats.finance.savings.current !== null && stats.finance.savings.target && stats.finance.savings.current < stats.finance.savings.target) list.push({ text: `🏦 เพิ่มเงินออมอีก ${stats.finance.savings.remaining} บาท`, priority: 2, completed: false });

        // Work
        if (stats.work.hoursToday.current !== null && stats.work.hoursToday.target && stats.work.hoursToday.current < stats.work.hoursToday.target) list.push({ text: `💼 ทำงานอีก ${stats.work.hoursToday.remaining} ชม.`, priority: 2, completed: false });
        if (stats.work.study.current !== null && stats.work.study.target && stats.work.study.current < stats.work.study.target) list.push({ text: `📚 เรียนอังกฤษอีก ${stats.work.study.remaining} นาที`, priority: 2, completed: false });

        // Vehicle
        (goals.vehicles || []).forEach((v: any) => {
            if (v.insuranceExpiryDate && (new Date(v.insuranceExpiryDate).getTime() - now.getTime()) / (1000*60*60*24) < 60) list.push({ text: `🚗 ต่ออายุประกัน ${v.name}`, priority: 3, completed: false });
            if (v.taxExpiryDate && (new Date(v.taxExpiryDate).getTime() - now.getTime()) / (1000*60*60*24) < 60) list.push({ text: `🚗 ต่อภาษี ${v.name}`, priority: 3, completed: false });
            if (v.nextServiceKm && (v.nextServiceKm - v.currentOdometer) < 1000) list.push({ text: `🔧 เตรียมเข้าศูนย์ตรวจเช็ก ${v.name}`, priority: 3, completed: false });
        });

        return list.sort((a,b) => b.priority - a.priority).slice(0, 8);
    }, [stats, goals]);

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-3">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-teal-500" />
                🎯 ภารกิจวันนี้
            </h3>
            <div className="space-y-2">
                {missions.length === 0 ? <p className="text-xs text-slate-500">วันนี้ไม่มีภารกิจใหม่</p> : 
                    missions.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-xs">
                            <span>{m.completed ? '✅' : '⭕'}</span>
                            <span className={m.completed ? 'line-through text-slate-400' : 'font-bold text-slate-800'}>{m.text}</span>
                        </div>
                    ))
                }
            </div>
        </div>
    );
  };

  const LifeScoreWidget = ({ stats, goals }: { stats: any, goals: any }) => {
    const scores = useMemo(() => {
        const getHealthScore = () => {
            let s = 0;
            if (stats.health.weight.current !== null) s += 25;
            if (stats.health.sleep.current !== null && stats.health.sleep.target) s += Math.min(25, (stats.health.sleep.current / stats.health.sleep.target) * 25);
            if (stats.health.exercise.current !== null && stats.health.exercise.target) s += Math.min(25, (stats.health.exercise.current / stats.health.exercise.target) * 25);
            if (stats.health.calories.current !== null && stats.health.calories.target) s += Math.min(25, (stats.health.calories.current / stats.health.calories.target) * 25);
            return s;
        };
        const getFinanceScore = () => {
            let s = 0;
            if (stats.finance.spendingToday.current !== null && stats.finance.spendingToday.target) s += Math.min(50, (stats.finance.spendingToday.current / stats.finance.spendingToday.target) < 1 ? 50 : 0);
            if (stats.finance.savings.current !== null && stats.finance.savings.target) s += Math.min(50, (stats.finance.savings.current / stats.finance.savings.target) * 50);
            return s;
        };
        const getWorkScore = () => {
            let s = 0;
            if (stats.work.hoursToday.current !== null && stats.work.hoursToday.target) s += Math.min(50, (stats.work.hoursToday.current / stats.work.hoursToday.target) * 50);
            if (stats.work.study.current !== null && stats.work.study.target) s += Math.min(50, (stats.work.study.current / stats.work.study.target) * 50);
            return s;
        };
        const getVehicleScore = () => {
            let s = 100;
            (goals.vehicles || []).forEach((v: any) => {
                if (v.insuranceExpiryDate && (new Date(v.insuranceExpiryDate).getTime() - Date.now()) / (1000*60*60*24) < 30) s -= 25;
                if (v.taxExpiryDate && (new Date(v.taxExpiryDate).getTime() - Date.now()) / (1000*60*60*24) < 30) s -= 25;
                if (v.nextServiceKm && (v.nextServiceKm - v.currentOdometer) < 500) s -= 25;
            });
            return Math.max(0, s);
        };
        return { health: getHealthScore(), finance: getFinanceScore(), work: getWorkScore(), vehicle: getVehicleScore() };
    }, [stats, goals]);

    const total = Math.round((scores.health + scores.finance + scores.work + scores.vehicle) / 4);
    const getStatus = (s: number) => s >= 90 ? 'ดีเยี่ยม' : s >= 75 ? 'ดี' : s >= 50 ? 'ต้องปรับปรุง' : 'ต้องรีบแก้ไข';

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-3">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                🏆 TUK LIFE SCORE
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-xs">
                <p>Health: {scores.health.toFixed(0)}%</p>
                <p>Finance: {scores.finance.toFixed(0)}%</p>
                <p>Work: {scores.work.toFixed(0)}%</p>
                <p>Vehicle: {scores.vehicle.toFixed(0)}%</p>
            </div>
            <div className="text-center bg-slate-50 p-4 rounded-xl">
                <div className="text-3xl font-bold text-slate-800">{total}%</div>
                <div className="text-sm font-bold text-slate-500">{getStatus(total)}</div>
            </div>
        </div>
    );
  };

  const AICoach = ({ stats }: { stats: any }) => {
    const recommendations = [];

    // Exercise
    if (stats.health.exercise.progress !== null && parseInt(stats.health.exercise.progress) < 100) {
        recommendations.push(`วันนี้ยังขาดออกกำลังกายอีก ${stats.health.exercise.remaining} นาที`);
    }

    // Calories
    if (stats.health.calories.current !== null && stats.health.calories.target !== null && stats.health.calories.current < stats.health.calories.target) {
        recommendations.push(`วันนี้ยังทานได้อีก ${stats.health.calories.remaining} kcal`);
    }

    // Finance (Budget)
    if (stats.finance.spendingToday.current !== null && stats.finance.spendingToday.target !== null && stats.finance.spendingToday.current > stats.finance.spendingToday.target) {
         recommendations.push(`วันนี้ใช้เงินเกินเป้าไป ${stats.finance.spendingToday.current - stats.finance.spendingToday.target} บาท`);
    }

    // English
    if (stats.work.study.progress !== null && parseInt(stats.work.study.progress) < 100) {
        recommendations.push(`วันนี้ยังขาดเรียนอังกฤษอีก ${stats.work.study.remaining} นาที`);
    }

    // Sleep
    if (stats.health.sleep.current !== null && stats.health.sleep.target !== null && stats.health.sleep.current < stats.health.sleep.target) {
        recommendations.push(`เมื่อคืนคุณนอนน้อยกว่าเป้า ${stats.health.sleep.target - stats.health.sleep.current} ชั่วโมง`);
    }

    if (recommendations.length === 0) {
        recommendations.push("วันนี้ทำได้ดีมาก เป้าหมายหลักครบแล้ว");
    }

    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-3">
             <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                {language === 'th' ? '🤖 โค้ชส่วนตัววันนี้' : '🤖 Personal AI Coach'}
            </h3>
            <ul className="space-y-2">
                {recommendations.slice(0, 5).map((rec, idx) => (
                    <li key={idx} className="bg-indigo-50 text-indigo-900 p-2 rounded-lg text-xs font-bold">{rec}</li>
                ))}
            </ul>
        </div>
    );
  }

  const DailyProgressSummary = ({ stats }: { stats: any }) => (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-3">
        <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-500" />
            {language === 'th' ? '📊 วันนี้เหลืออีก' : '📊 Today Remaining'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px]">
            <div className="bg-slate-50 p-3 rounded-xl">
                <div className="text-slate-500">{language === 'th' ? 'นอนอีก' : 'Sleep'}</div>
                <div className="text-lg font-black text-slate-900">{stats.health.sleep.remaining || 0} <span className="text-[10px] font-normal">ชม.</span></div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
                <div className="text-slate-500">{language === 'th' ? 'ออกกำลังกายอีก' : 'Exercise'}</div>
                <div className="text-lg font-black text-slate-900">{stats.health.exercise.remaining || 0} <span className="text-[10px] font-normal">นาที</span></div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
                <div className="text-slate-500">{language === 'th' ? 'เรียนอังกฤษอีก' : 'Study'}</div>
                <div className="text-lg font-black text-slate-900">{stats.work.study.remaining || 0} <span className="text-[10px] font-normal">นาที</span></div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
                <div className="text-slate-500">{language === 'th' ? 'ใช้เงินได้อีก' : 'Budget'}</div>
                <div className="text-lg font-black text-slate-900">{stats.finance.spendingToday.remaining || 0} <span className="text-[10px] font-normal">บาท</span></div>
            </div>
        </div>
    </div>
  );

  const DailyProgressSection = ({ stats }: { stats: any }) => (
    <div className="space-y-6">
      <div className="space-y-3.5">
        <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
          <span>❤️</span>
          <span>{getLabel('Health')}</span>
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <KpiCard icon="⚖️" label="Weight" valObj={stats.health.weight} unit="kg" category="health" subject="weight" onUpdateStat={handleUpdateStat} />
          <KpiCard icon="😴" label="Sleep" valObj={stats.health.sleep} unit={language === 'th' ? 'ชม.' : 'hrs'} category="health" subject="sleep" onUpdateStat={handleUpdateStat} />
          <KpiCard icon="🍽️" label="Calories" valObj={stats.health.calories} unit="kcal" category="health" subject="calories" onUpdateStat={handleUpdateStat} />
          <KpiCard icon="🏃" label="Exercise" valObj={stats.health.exercise} unit={language === 'th' ? 'นาที' : 'min'} category="health" subject="exercise" onUpdateStat={handleUpdateStat} />
        </div>
      </div>
    </div>
  );

  const MorningRoutineWidget = () => {
    const [weight, setWeight] = useState('');
    const [sleep, setSleep] = useState('');
    const [mood, setMood] = useState('🙂');
    const [plan, setPlan] = useState('');
    const [error, setError] = useState('');
    const [odometer, setOdometer] = useState('');

    const handleSave = () => {
        if ((weight && (parseFloat(weight) < 30 || parseFloat(weight) > 150)) ||
            (sleep && (parseFloat(sleep) < 0 || parseFloat(sleep) > 16)) ||
            (odometer && (parseFloat(odometer) < 0))) {
            setError('กรุณาตรวจสอบข้อมูลอีกครั้ง');
            return;
        }
        
        const now = new Date();
        const timestamp = now.toISOString();
        const events = [
            weight && { id: `morning-weight-${Date.now()}`, timestamp, category: 'health', type: 'weight', subject: 'Weight', value: weight, unit: 'kg', status: 'simulated', details: 'Morning Routine', tags: ['#weight', '#morning'], sheetTarget: 'HLT_HEALTH_METRICS_V3' },
            sleep && { id: `morning-sleep-${Date.now()}`, timestamp, category: 'health', type: 'sleep', subject: 'Sleep', value: sleep, unit: 'hours', status: 'simulated', details: 'Morning Routine', tags: ['#sleep', '#morning'], sheetTarget: 'HLT_HEALTH_METRICS_V3' },
            mood && { id: `morning-mood-${Date.now()}`, timestamp, category: 'lifestyle', type: 'mood', subject: 'Mood', value: mood, unit: 'preset', status: 'simulated', details: 'Morning Routine', tags: ['#mood', '#morning'], sheetTarget: 'LIF_MEMORIES_LOGS_V3' },
            plan && { id: `morning-plan-${Date.now()}`, timestamp, category: 'work', type: 'plan', subject: 'Daily Plan', value: plan, unit: 'note', status: 'simulated', details: 'Morning Routine', tags: ['#plan', '#morning'], sheetTarget: 'LIF_MEMORIES_LOGS_V3' },
            odometer && { id: `morning-odo-${Date.now()}`, timestamp, category: 'garage', type: 'odometer', subject: 'Odometer', value: odometer, unit: 'km', status: 'simulated', details: 'Morning Routine', tags: ['#odometer', '#morning'], sheetTarget: 'GAR_VEHICLE_LOGS_V3' }
        ].filter(Boolean);
        
        setTimelineEvents(prev => [...events, ...prev]);
        setWeight(''); setSleep(''); setPlan(''); setOdometer(''); setError('');
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-3">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                🌅 เช็กอินตอนเช้า
            </h3>
            {error && <p className="text-red-500 text-xs mb-2 font-bold">{error}</p>}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <input type="number" placeholder="น้ำหนัก (kg)" value={weight} onChange={e => setWeight(e.target.value)} className="border rounded-xl p-3 text-xs" />
                <input type="number" placeholder="ชั่วโมงนอน" value={sleep} onChange={e => setSleep(e.target.value)} className="border rounded-xl p-3 text-xs" />
                <select value={mood} onChange={e => setMood(e.target.value)} className="border rounded-xl p-3 text-xs">
                    <option value="😀">😀</option><option value="🙂">🙂</option><option value="😐">😐</option><option value="😴">😴</option><option value="😫">😫</option>
                </select>
                <input type="text" placeholder="แผนวันนี้" value={plan} onChange={e => setPlan(e.target.value)} className="border rounded-xl p-3 text-xs" />
                <input type="number" placeholder="เลขไมล์" value={odometer} onChange={e => setOdometer(e.target.value)} className="border rounded-xl p-3 text-xs" />
            </div>
            <button onClick={handleSave} className="w-full bg-amber-500 text-white font-bold p-3 rounded-xl text-sm">บันทึกเช็กอินตอนเช้า</button>
        </div>
    );
  };

  const EveningRoutineWidget = () => {
    const [exercise, setExercise] = useState('');
    const [calories, setCalories] = useState('');
    const [expense, setExpense] = useState('');
    const [study, setStudy] = useState('');
    const [memory, setMemory] = useState('');
    const [error, setError] = useState('');

    const handleSave = () => {
        if ((exercise && (parseFloat(exercise) < 0 || parseFloat(exercise) > 300)) ||
            (calories && (parseFloat(calories) < 0 || parseFloat(calories) > 6000)) ||
            (expense && parseFloat(expense) <= 0) ||
            (study && (parseFloat(study) < 0 || parseFloat(study) > 600))) {
            setError('กรุณาตรวจสอบข้อมูลอีกครั้ง');
            return;
        }

        const now = new Date();
        const timestamp = now.toISOString();
        const events = [
            exercise && { id: `evening-ex-${Date.now()}`, timestamp, category: 'health', type: 'exercise', subject: 'Exercise', value: exercise, unit: 'min', status: 'simulated', details: 'Evening Routine', tags: ['#exercise', '#evening'], sheetTarget: 'HLT_HEALTH_METRICS_V3' },
            calories && { id: `evening-cal-${Date.now()}`, timestamp, category: 'health', type: 'calories', subject: 'Calories', value: calories, unit: 'kcal', status: 'simulated', details: 'Evening Routine', tags: ['#calories', '#evening'], sheetTarget: 'HLT_HEALTH_METRICS_V3' },
            expense && { id: `evening-exp-${Date.now()}`, timestamp, category: 'finance', type: 'expense', subject: 'Expense', value: expense, unit: 'THB', status: 'simulated', details: 'Evening Routine', tags: ['#expense', '#evening'], sheetTarget: 'FIN_EXPENSES_V3' },
            study && { id: `evening-study-${Date.now()}`, timestamp, category: 'work', type: 'english_study', subject: 'English Study', value: study, unit: 'min', status: 'simulated', details: 'Evening Routine', tags: ['#study', '#evening'], sheetTarget: 'WRK_WORK_LOGS_V3' },
            memory && { id: `evening-mem-${Date.now()}`, timestamp, category: 'lifestyle', type: 'memory', subject: 'Memory', value: memory, unit: 'note', status: 'simulated', details: 'Evening Routine', tags: ['#memory', '#evening'], sheetTarget: 'LIF_MEMORIES_LOGS_V3' }
        ].filter(Boolean);
        
        setTimelineEvents(prev => [...events, ...prev]);
        setExercise(''); setCalories(''); setExpense(''); setStudy(''); setMemory(''); setError('');
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-3">
            <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                🌙 สรุปตอนเย็น
            </h3>
            {error && <p className="text-red-500 text-xs mb-2 font-bold">{error}</p>}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <input type="number" placeholder="ออกกำลัง (นาที)" value={exercise} onChange={e => setExercise(e.target.value)} className="border rounded-xl p-3 text-xs" />
                <input type="number" placeholder="แคลอรี่" value={calories} onChange={e => setCalories(e.target.value)} className="border rounded-xl p-3 text-xs" />
                <input type="number" placeholder="ค่าใช้จ่าย" value={expense} onChange={e => setExpense(e.target.value)} className="border rounded-xl p-3 text-xs" />
                <input type="number" placeholder="เรียนอังกฤษ (นาที)" value={study} onChange={e => setStudy(e.target.value)} className="border rounded-xl p-3 text-xs" />
                <input type="text" placeholder="สิ่งที่ทำสำเร็จ" value={memory} onChange={e => setMemory(e.target.value)} className="border rounded-xl p-3 text-xs" />
            </div>
            <button onClick={handleSave} className="w-full bg-indigo-500 text-white font-bold p-3 rounded-xl text-sm">บันทึกสรุปตอนเย็น</button>
        </div>
    );
  };


  if (isSimplifiedMode) {
    return (
      <div className="space-y-8">
        {/* TODAY SUMMARY */}
        <div className="bg-slate-50/80 p-5 sm:p-6 rounded-3xl border border-slate-200/50 shadow-xs">
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 mb-4">
            <span>🌞</span>
            <span>{language === 'th' ? 'วันนี้ของ TUK' : 'Today of TUK'}</span>
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            <KpiCard
              icon="💰"
              label="Spending Today"
              valObj={cockpitStats.finance.spendingToday}
              unit={language === 'th' ? 'บาท' : 'THB'}
              category="finance"
              subject="spending"
              onUpdateStat={handleUpdateStat}
            />
            <KpiCard
              icon="🍽️"
              label="Calories"
              valObj={cockpitStats.health.calories}
              unit="kcal"
              category="health"
              subject="calories"
              onUpdateStat={handleUpdateStat}
            />
            <KpiCard
              icon="🏃"
              label="Exercise"
              valObj={cockpitStats.health.exercise}
              unit={language === 'th' ? 'นาที' : 'min'}
              category="health"
              subject="exercise"
              onUpdateStat={handleUpdateStat}
            />
            <KpiCard
              icon="📚"
              label="English Study"
              valObj={cockpitStats.work.study}
              unit={language === 'th' ? 'นาที' : 'min'}
              category="work"
              subject="study"
              onUpdateStat={handleUpdateStat}
            />
            <KpiCard
              icon="⚖️"
              label="Weight"
              valObj={cockpitStats.health.weight}
              unit="kg"
              category="health"
              subject="weight"
              onUpdateStat={handleUpdateStat}
            />
          </div>
        </div>

        {/* DETAILS SECTIONS */}
        <div className="space-y-8">
          {/* ❤️ สุขภาพ */}
          <div className="space-y-3.5">
            <h4 className="text-[22px] sm:text-[24px] font-bold text-slate-800 flex items-center gap-1.5">
              <span>❤️</span>
              <span>{getLabel('Health')}</span>
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <KpiCard icon="⚖️" label="Weight" valObj={cockpitStats.health.weight} unit="kg" category="health" subject="weight" onUpdateStat={handleUpdateStat} />
              <KpiCard icon="😴" label="Sleep" valObj={cockpitStats.health.sleep} unit={language === 'th' ? 'ชม.' : 'hrs'} category="health" subject="sleep" onUpdateStat={handleUpdateStat} />
              <KpiCard icon="🍽️" label="Calories" valObj={cockpitStats.health.calories} unit="kcal" category="health" subject="calories" onUpdateStat={handleUpdateStat} />
              <KpiCard icon="🏃" label="Exercise" valObj={cockpitStats.health.exercise} unit={language === 'th' ? 'นาที' : 'min'} category="health" subject="exercise" onUpdateStat={handleUpdateStat} />
            </div>
          </div>

          {/* 💰 การเงิน */}
          <div className="space-y-3.5">
            <h4 className="text-[22px] sm:text-[24px] font-bold text-slate-800 flex items-center gap-1.5">
              <span>💰</span>
              <span>{getLabel('Finance')}</span>
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
              <KpiCard icon="💰" label="Spending Today" valObj={cockpitStats.finance.spendingToday} unit={language === 'th' ? 'บาท' : 'THB'} category="finance" subject="spending" onUpdateStat={handleUpdateStat} />
              <KpiCard icon="📅" label="Spending Month" valObj={cockpitStats.finance.spendingMonthly} unit={language === 'th' ? 'บาท' : 'THB'} />
              <KpiCard icon="🏦" label="Savings" valObj={cockpitStats.finance.savings} unit={language === 'th' ? 'บาท' : 'THB'} category="finance" subject="savings" onUpdateStat={handleUpdateStat} />
              <KpiCard icon="💳" label="Debt" valObj={cockpitStats.finance.debt} unit={language === 'th' ? 'บาท' : 'THB'} category="finance" subject="debt" onUpdateStat={handleUpdateStat} />
              <KpiCard icon="🛡️" label="Emergency Fund" valObj={cockpitStats.finance.emergencyFund} unit={language === 'th' ? 'บาท' : 'THB'} />
            </div>
          </div>

          {/* 💼 งาน */}
          <div className="space-y-3.5">
            <h4 className="text-[22px] sm:text-[24px] font-bold text-slate-800 flex items-center gap-1.5">
              <span>💼</span>
              <span>{getLabel('Work')}</span>
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5">
              <KpiCard icon="💼" label="Hours Today" valObj={cockpitStats.work.hoursToday} unit={language === 'th' ? 'ชม.' : 'hours'} category="work" subject="hours" onUpdateStat={handleUpdateStat} />
              <KpiCard icon="⏳" label="Hours Month" valObj={cockpitStats.work.hoursMonthly} unit={language === 'th' ? 'ชม.' : 'hours'} />
              <KpiCard icon="📚" label="English Study" valObj={cockpitStats.work.study} unit={language === 'th' ? 'นาที' : 'min'} category="work" subject="study" onUpdateStat={handleUpdateStat} />
            </div>
          </div>

          {/* 🚗 รถยนต์ */}
          <div className="space-y-3.5">
            <h4 className="text-[22px] sm:text-[24px] font-bold text-slate-800 flex items-center gap-1.5">
              <span>🚗</span>
              <span>{getLabel('Vehicle')}</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cockpitStats.cars.map((car: any) => (
                <div key={car.vehicleName} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                    <span className="text-lg">🚗</span>
                    <span className="font-extrabold text-slate-800 text-sm">{car.vehicleName}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <KpiCard icon="📈" label="Odometer" valObj={car.odometer} unit="กม." category="garage" subject="odometer" onUpdateStat={handleUpdateStat} />
                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100/80 text-xs text-slate-600 flex flex-col justify-center space-y-2">
                      <div className="font-bold text-slate-700 mb-0.5">{language === 'th' ? 'กำหนดการสำคัญ' : 'Key Dates'}</div>
                      <div className="flex justify-between border-b border-slate-100/50 pb-1">
                        <span>{language === 'th' ? 'เช็กระยะถัดไป:' : 'Next Service:'}</span>
                        <span className="font-mono font-bold text-slate-800">{car.nextService || 'N/A'} km</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100/50 pb-1">
                        <span>{language === 'th' ? 'หมดอายุประกัน:' : 'Insurance Expiry:'}</span>
                        <span className="font-mono font-bold text-slate-800">{car.insurance || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{language === 'th' ? 'หมดอายุภาษี:' : 'Tax Expiry:'}</span>
                        <span className="font-mono font-bold text-slate-800">{car.tax || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* FUTURISTIC MASTER CONTROL TOWER HEADER */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6.5 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        {/* UPPER GRID HUD METADATA */}
        <div className="absolute right-6 top-6 hidden md:flex items-center gap-4 text-[10px] font-mono text-slate-400">
        </div>

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase font-mono tracking-widest bg-gradient-to-r from-teal-400 to-cyan-300 text-slate-950 px-2.5 py-1 rounded-md border border-teal-400/20 shadow-lg">
              ✨ TUK LIFE OS CONTROL TOWER
            </span>
            <h2 className="text-2xl font-black tracking-tight mt-3 text-white flex items-center gap-2">
              แดชบอร์ดศูนย์ควบคุมข้อมูลอัจฉริยะ 
              <span className="text-teal-400 text-xs font-mono font-normal">v3.0</span>
            </h2>
            <p className="text-slate-300 text-xs mt-1.5 leading-relaxed max-w-xl">
              รายงานสถิติแบบรวมศูนย์ วิเคราะห์สถานะสุขภาพ แผนการเงิน บันทึกการใช้รถยนต์ Prius และข้อมูลชั่วโมงการทำงานจาก Google Sheets ให้สวยงาม ทันสมัย พร้อมใช้สแกนและตรวจสอบข้อมูลทุกมิติในหน้าต่างเดียว
            </p>
          </div>
          <div className="flex gap-2 self-stretch md:self-auto">
            <button
              onClick={runManualBackup}
              disabled={backingUp}
              className="w-full md:w-auto bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-600 hover:to-cyan-500 text-slate-950 text-xs font-bold py-3 px-4.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/10 cursor-pointer disabled:opacity-55"
            >
              <RefreshCw className={`w-4 h-4 ${backingUp ? 'animate-spin' : ''}`} />
              {backingUp ? "กำลังจัดเก็บสำรอง..." : "เก็บสำรองข้อมูลด่วน (Sync to Drive)"}
            </button>
          </div>
        </div>

        {/* 4 CORE KPI MODERN BENTO CELLS */}
        <TodayCockpit language={language} timelineEvents={timelineEvents} goals={goals} onUpdateStat={handleUpdateStat} onNavigateToTimeline={onNavigateToTimeline} />
      </div>

      {/* 1. TOP HERO CARD, 2. TODAY STATUS, etc. */}

      {/* TABS */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'insights', label: 'Insights', icon: BrainCircuit },
          { id: 'tools', label: 'Tools', icon: Wrench },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === 'overview' && (
          <OverviewTab stats={cockpitStats} goals={goals} />
        )}
        {activeTab === 'insights' && (
          <Suspense fallback={<LoadingSkeleton />}>
            <InsightsTab weeklyStats={weeklyStats} monthlyStats={monthlyStats} />
          </Suspense>
        )}
        {activeTab === 'tools' && (
          <Suspense fallback={<LoadingSkeleton />}>
            <ToolsTab language={language} />
          </Suspense>
        )}
      </div>

        {/* PANEL 1: ADVANCED SEGMENT VISUALS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-indigo-500 tracking-wider">ส่วนทดสอบวิเคราะห์และตรวจสอบ</span>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 uppercase mt-1">
              <Activity className="w-4 h-4 text-slate-700 animate-pulse" /> เจาะลึกดัชนีย่อยตามโมดูลหลัก
            </h3>
            <p className="text-slate-500 text-[11px] mt-1.5 leading-relaxed">
              สแนปชอตพารามิเตอร์ข้อมูลชีวิต และสุขภาพโครงสร้างชีวภาพจากการเชื่อมโยงชีต Google Sheets ที่ดึงมาจัดหมวดหมู่ล่าสุด
            </p>
          </div>

          {/* ACTIVE Radars */}
          {activeSegment === 'finance' && (
            <div className="space-y-4 text-xs flex-1">
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex flex-col gap-1.5">
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded w-fit font-bold">FINANCIAL CONTINGENCY</span>
                <p className="text-slate-750 text-[11px] mt-1leading-relaxed">
                  กระแสเงินคงชีพของคลัง (วิเคราะห์จากอัตราใช้จ่ายเฉลี่ย) และมีทรัพย์เป้าหมายสำรองสะท้อนสถานะความมั่นคงที่ปลอดภัยสูงสุดสำหรับการรองรับสเกลชีวิต
                </p>
              </div>
              <div className="space-y-3 pt-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>คลังเงินสำรองฉุกเฉิน</span>
                    <span className="font-mono text-emerald-600">{cockpitStats.finance.emergencyFund.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${cockpitStats.finance.emergencyFund.progress || 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-805">
                    <span>ภาระหนี้สิน</span>
                    <span className="font-mono text-slate-500">{cockpitStats.finance.debt.progress || 0}% (ปลอดภัย)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-emerald-400 h-2 rounded-full transition-all duration-300" style={{ width: `${cockpitStats.finance.debt.progress || 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSegment === 'health' && (
            <div className="space-y-4 text-xs flex-1">
              <div className="bg-rose-50/40 p-4 rounded-xl border border-rose-100">
                <span className="text-[10px] font-mono bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded w-fit font-extrabold uppercase">VITAL HEALTH SANITY</span>
                <p className="text-slate-750 text-[11px] mt-2 leading-relaxed">
                  ดัชนีมวลกาย BMI ล่าสุดอยู่ที่ <strong>21.8</strong> อยู่ในเกณฑ์มาตรฐานสมส่วนสุขภาพดี (เป้าหมายประเทศแถบเอเชียคือ 18.5 - 22.9) นอนหลับลึกเต็มประสิทธิภาพ
                </p>
              </div>
              <div className="space-y-3 pt-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>โภชนาการแคลอรีต่อวัน (เป้าหมาย 2,200 KCAL)</span>
                    <span className="font-mono text-rose-600">1,950 KCAL (Clean diet)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-rose-500 h-2 rounded-full transition-all duration-300" style={{ width: '88%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-808">
                    <span>อัตราเป้าหมายการออกกำลังกายคาร์ดิโอรายสัปดาห์</span>
                    <span className="font-mono text-indigo-600">135/150 นาที</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 leading-normal italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                💤 ยอดเฉลี่ยบันทึกการนอนหลับ 7 ชม. 42 นาที อ้างอิงจากข้อมูลตัวสแกน Google form ledger อย่างเป็นระเบียบ
              </div>
            </div>
          )}

          {activeSegment === 'garage' && (
            <div className="space-y-4 text-xs flex-1">
              <div className="bg-amber-50/45 p-4 rounded-xl border border-amber-100">
                <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded w-fit font-extrabold uppercase">VEHICLE LOGISTICS LOG</span>
                <p className="text-slate-755 text-[11px] mt-2 leading-relaxed">
                  รถยนต์คันโปรด: <strong>Prius 1.8 Hybrid (ขาวมุก)</strong> ทะเบียน 4กธ-4235. ขับขี่นุ่มนวล ประหยัดน้ำมันสูงสุด ประกันชั้น 1 และภาษีเหลือรอบต่ออายุใน 92 วัน
                </p>
              </div>
              <div className="space-y-3 pt-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>ระยะทางไปเช็กบริการรอบถัดไป (เป้า 125,000 กม.)</span>
                    <span className="font-mono text-amber-600">เหลือ 3,160 กม.</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-amber-500 h-2 rounded-full transition-all duration-300" style={{ width: '91%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>ระยะทางขับเฉลี่ยรายสัปดาห์</span>
                    <span className="font-mono text-slate-500">240 กม. / สัปดาห์</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-amber-400 h-2 rounded-full transition-all duration-300" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSegment === 'work' && (
            <div className="space-y-4 text-xs flex-1">
              <div className="bg-blue-50/45 p-4 rounded-xl border border-blue-100">
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded w-fit font-bold uppercase">CONSULTING OPERATIONS</span>
                <p className="text-slate-755 text-[11px] mt-2 leading-relaxed">
                  อัตราจ้างให้ปรึกษาล็อกคงที่ฐานสัญญา <strong>1,500 บาท/ชั่วโมง</strong> มีโครงการที่อยู่ระหว่างกำกับสแตนด์บาย 3 โครงการขนาดใหญ่
                </p>
              </div>
              <div className="space-y-3 pt-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>จำนวนชั่วโมงคำนวณส่งมอบผลงาน (โควตา 160 ชม./เดือน)</span>
                    <span className="font-mono text-blue-600">142 ชม. (88% โควตา)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '88%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>สถานะส่งเอกสารเบิกจ่ายและเคลียร์เช็คบัญชีรายเดือน</span>
                    <span className="font-mono text-emerald-600">เรียบร้อย 12/12 รายการ</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block mb-1">AppSheet Google Sheet Formula Safe:</span>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded font-bold text-[9px] border border-emerald-500/20">
                100% COMPLIANT
              </span>
              <p className="text-slate-300 text-[10px]">หลีกเลี่ยงการใช้สูตรซับซ้อนในตัวชีตเพื่อกันชีตหน่วงในมือถือ</p>
            </div>
          </div>
        </div>

        {/* PANEL 2: TO-DRIVE BACKUP TRIGGERS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-indigo-500 tracking-wider">ส่วนบริการจัดการความปลอดภัยของข้อมูล</span>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 uppercase mt-1">
              <Database className="w-4 h-4 text-slate-700" /> แผงควบคุมการจัดเก็บสำรอง (DRIVE CONSOLE)
            </h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              ปกป้องข้อมูลสูญหายโดยการกำหนดสคริปต์ให้แพ็กไฟล์ ZIP ตารางข้อมูลทั้งหมดจัดขึ้น Google Drive ตลอดไปอย่างมีระนาบระเบียบ
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="block text-slate-700 font-bold mb-2">กำหนดความถี่ของการสำรอง (Backup Interval):</span>
              <div className="grid grid-cols-3 gap-2">
                {(['daily', 'weekly', 'manual'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setBackupSchedule(mode)}
                    className={`py-2 px-2 rounded-lg border font-mono font-bold text-[10px] uppercase flex items-center justify-center gap-1 cursor-pointer transition-all ${
                      backupSchedule === mode
                        ? 'bg-slate-900 border-slate-900 text-teal-400 shadow-sm'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {mode === 'daily' && <Clock className="w-3 h-3" />}
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-slate-700 font-bold mb-2 uppercase tracking-wider text-[9px] text-slate-450">รายการประวัติการเก็บ ZIP ล่าสุด:</span>
              <div className="bg-slate-950 text-slate-350 font-mono text-[9px] p-3.5 rounded-xl space-y-2 max-h-[160px] overflow-y-auto shadow-inner border border-slate-900 leading-relaxed">
                {backupLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-2 border-b border-slate-900 pb-1.5 last:border-0 last:pb-0">
                    <span className="text-teal-400 font-black shrink-0">✓</span>
                    <p className="text-[8.5px] text-slate-300">{log.replace(/✓/g, '').trim()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[10px] bg-slate-50 text-slate-600 p-3.5 rounded-xl border border-slate-200 leading-relaxed font-sans">
            🚀 <strong>สคริปต์ทำความสะอาดอัตโนมัติ:</strong> ทุกๆ เที่ยงคืน ระบบ Apps Script จะคำนวณลบไฟล์สำรองหมดอายุ (เกิน 30 วัน) เพื่อรักษาระดับพื้นที่ว่างของ Google Drive อย่างมีระเบียบวินัย
          </div>
        </div>

        {/* PANEL 3: MOBILE INTERACTION SIMULATOR (APPSHEET PREVIEW) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-indigo-500 tracking-wider">ส่วนจำลองการใช้งานบนอุปกรณ์เคลื่อนที่</span>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 uppercase mt-1">
              <Smartphone className="w-4 h-4 text-slate-700 animate-bounce" /> จำลองหน้าจอสมาร์ตโฟน AppSheet
            </h3>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              จำลองกลไกหน้าอินเทอร์เฟซผู้ใช้ในมือถือ Appsheet สำหรับคีย์และส่งข้อมูลธุรกรรม น้ำหนัก และกิจกรรมต่างๆ ลงเซิร์ฟเวอร์
            </p>
          </div>

          {/* ULTRA-MODERN PHONE FRAME */}
          <div className="relative mx-auto w-[240px] h-[340px] bg-slate-950 rounded-[32px] border-6 border-slate-900 shadow-xl p-3 flex flex-col justify-between overflow-hidden text-[10px] font-sans">
            
            {/* PHONE NOTCH / DYNAMIC ISLAND */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-3 bg-slate-900 rounded-full z-20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-slate-800 rounded-full"></div>
            </div>

            {/* PHONE TOP HEADER */}
            <div className="flex justify-between items-center bg-slate-900/60 px-2.5 py-1.5 rounded-lg text-slate-300 font-bold text-[8.5px] border-b border-slate-800/20 mt-1">
              <span className="text-teal-400 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> TUK LIFE OS
              </span>
              <span className="text-slate-400 font-mono">12:35</span>
            </div>

            {/* PHONE INTERACTIVE DISPLAY CANVAS */}
            <div className="flex-1 bg-white my-2.5 rounded-2xl p-2.5 flex flex-col justify-between overflow-y-auto relative shadow-inner">
              <AnimatePresence mode="wait">
                {mobileScreen === 'home' && (
                  <motion.div
                    key="mobile-home"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-2 flex-grow flex flex-col"
                  >
                    <div className="bg-gradient-to-br from-slate-950 to-indigo-950 text-white p-2.5 rounded-xl text-center mt-1 border border-slate-850">
                      <p className="font-bold text-[8px] tracking-widest text-teal-300 font-mono uppercase">FINANCES</p>
                      <h4 className="font-black text-xs mt-0.5 text-white">380,420 THB</h4>
                      <p className="text-[7.5px] text-slate-400 font-mono">Cached Balance Validated</p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 px-0.5">
                      <button
                        onClick={() => executeMobileAction('SCB Card Transaction Log')}
                        className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-800 text-[8.5px] font-bold text-center cursor-pointer transition-all shadow-2xs hover:scale-[1.02]"
                      >
                        💳 บันทึกรูด SCB
                      </button>
                      <button
                        onClick={() => setMobileScreen('metrics')}
                        className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-800 text-[8.5px] font-bold text-center cursor-pointer transition-all shadow-2xs hover:scale-[1.02]"
                      >
                        ⚖️ น้ำหนักตัวล่าสุด
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-2 flex-1">
                      <p className="font-bold text-slate-400 text-[7.5px] uppercase tracking-wider mb-1">สถิติล่าสุดในชีต:</p>
                      <div className="space-y-1 max-h-[75px] overflow-y-auto">
                        <div className="bg-slate-50/70 p-1.5 rounded-lg flex justify-between items-center border border-slate-100 text-[8px]">
                          <span className="font-bold text-slate-700">ชำระเครดิตการ์ด</span>
                          <span className="text-red-600 font-bold font-mono">-1,240.50</span>
                        </div>
                        <div className="bg-slate-50/70 p-1.5 rounded-lg flex justify-between items-center border border-slate-100 text-[8px]">
                          <span className="font-bold text-slate-700">น้ำมัน Toyota</span>
                          <span className="text-red-600 font-bold font-mono">-5,840.00</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {mobileScreen === 'metrics' && (
                  <motion.div
                    key="mobile-input"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-2.5 text-slate-800 flex-1 flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 border-b border-slate-150 pb-1.5 flex items-center justify-between">
                        <span>⚖️ บันทึกน้ำหนักตัว</span>
                        <button onClick={() => setMobileScreen('home')} className="text-indigo-600 hover:underline font-bold">ย้อนกลับ</button>
                      </h4>
                      <div className="space-y-1.5 mt-2">
                        <label className="block font-bold text-slate-500 text-[8px] uppercase">ป้อนน้ำหนักเป็นกิโลกรัม (KG):</label>
                        <input
                          type="number"
                          value={simWeight}
                          onChange={(e) => setSimWeight(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-205 px-2 py-1.5 rounded-lg font-mono outline-none text-slate-800 text-xs font-bold focus:ring-2 focus:ring-teal-400"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        executeMobileAction(`Logged biometric body parameters weight ${simWeight} kg`);
                        setMobileScreen('home');
                      }}
                      className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-bold p-2.5 rounded-lg border hover:opacity-90 cursor-pointer text-center text-[9px] shadow-sm hover:scale-[1.01] transition-transform"
                    >
                      ✓ ตกลงบันทึกลง Google Sheets
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SIMULATOR NOTIFIER */}
              {simulatorStatus && (
                <div className="absolute inset-x-2 bottom-2 bg-slate-950 text-teal-300 font-mono text-[7.5px] p-2.5 rounded-xl border border-teal-500/30 leading-normal shadow-lg text-center backdrop-blur-md">
                  {simulatorStatus}
                </div>
              )}
            </div>

            {/* PHONE HOME BUTTON */}
            <div className="mx-auto w-12 h-1 bg-slate-700 hover:bg-white rounded-full cursor-pointer transition-colors" onClick={() => setMobileScreen('home')}></div>
          </div>

          <div className="text-[9.5px] text-slate-400 text-center font-mono flex items-center justify-center gap-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            Apps Sheet Mobile Integration Layer verified active
          </div>
        </div>

      </div>
    );
}

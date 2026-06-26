import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet, Database, Play, Check, AlertCircle, RefreshCw, Sparkles, Send,
  PlusCircle, Info, Trash2, Heart, DollarSign, Car, Briefcase, Activity, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { safeLocalStorage } from '../utils/storage';

interface LiveRowLog {
  id: string;
  timestamp: string;
  sheetName: string;
  category: string;
  subject: string;
  value: string;
  status: 'sent' | 'failed' | 'simulated';
  errorDetail?: string;
}

export default function LiveRegistry({ 
  isSimplifiedMode = false,
  language = 'th',
  isSyncing = false,
  lastSyncedTime = '',
  syncTimer = 0,
  triggerAutoSync = () => Promise.resolve()
}: { 
  isSimplifiedMode?: boolean;
  language?: string;
  isSyncing?: boolean;
  lastSyncedTime?: string;
  syncTimer?: number;
  triggerAutoSync?: () => Promise<void>;
}) {
  const [webAppUrl, setWebAppUrl] = useState<string>(() => {
    return safeLocalStorage.getItem('tuk_life_web_app_url') || '';
  });
  const [isUrlValid, setIsUrlValid] = useState<boolean>(() => {
    const url = safeLocalStorage.getItem('tuk_life_web_app_url') || '';
    return url.startsWith('https://') && url.includes('script.google.com');
  });
  const [spreadsheetTitle, setSpreadsheetTitle] = useState<string>(() => {
    return safeLocalStorage.getItem('tuk_life_spreadsheet_title') || '';
  });
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    return safeLocalStorage.getItem('tuk_life_spreadsheet_id') || '';
  });
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>(() => {
    return safeLocalStorage.getItem('tuk_life_spreadsheet_title') ? 'success' : 'idle';
  });
  const [testErrorMessage, setTestErrorMessage] = useState<string | null>(null);

  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Easy Mode States
  const [easyTab, setEasyTab] = useState<'expense' | 'food' | 'health' | 'vehicle' | 'work'>('expense');
  const [easySaveSuccess, setEasySaveSuccess] = useState<boolean>(false);
  const [exerciseMinutes, setExerciseMinutes] = useState<string>('30');
  const [vehicleCost, setVehicleCost] = useState<string>('');
  const [vehicleLocation, setVehicleLocation] = useState<string>('');

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Selected Target Table
  const [activeSheetName, setActiveSheetName] = useState<
    'FIN_TRANSACTIONS_V3' | 'HLT_HEALTH_METRICS_V3' | 'GAR_LOGS_V3' | 'WRK_TIME_LOGS_V3' | 'MASTER_LOGS_ACTIVE'
  >('FIN_TRANSACTIONS_V3');

  // Form Fields State
  const [financeFields, setFinanceFields] = useState({
    transaction_id: '',
    timestamp: '',
    account_source_id: 'FIN-ACC-01',
    account_dest_id: '',
    flow_type: 'EXPENSE',
    amount_thb: '450.00',
    category_code: 'FIN_FOOD',
    recipient: 'Starbucks Coffee',
    invoice_attachment: ''
  });

  const [healthFields, setHealthFields] = useState({
    metric_id: '',
    date: '',
    weight_kg: '72.5',
    systolic_bp: '120',
    diastolic_bp: '80',
    resting_heart_rate: '65',
    sleep_hours: '8.0',
    sleep_score: '88',
    activity_calories: '450',
    water_ml: '2200',
    notes: 'Feeling active and hydrated.'
  });

  const [garageFields, setGarageFields] = useState({
    garage_log_id: '',
    vehicle_id: 'GAR-VEH-01',
    log_type: 'FUEL',
    odometer_km: '124350',
    fuel_liters: '35.5',
    transaction_ref: '',
    diagnostic_details: 'Standard Caltex 95 Refueling.'
  });

  const [workFields, setWorkFields] = useState({
    time_log_id: '',
    project_id: 'WRK-PRJ-01',
    timestamp_start: '',
    timestamp_end: '',
    spent_minutes: '120',
    task_details: 'Consulting review and API schema verification with Apirak Consulting.',
    billing_status: 'UNBILLED'
  });

  const [masterFields, setMasterFields] = useState({
    log_id: '',
    timestamp: '',
    main_category: 'FINANCE',
    type: 'EXPENSE',
    subject: 'Direct ledger entry',
    details: 'Written directly from Tuk Life OS App Registry Hub.',
    ref_transaction_id: '',
    ref_vehicle_id: '',
    ref_project_id: '',
    ref_medical_id: '',
    value_result: '450.00',
    unit: 'THB',
    tags: '#auto, #manual-registry',
    mood: '2_GOOD'
  });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [logMessages, setLogMessages] = useState<LiveRowLog[]>([]);

  // Automatically refresh IDs/timestamps when active tab or seeds change
  useEffect(() => {
    generateAllIds();
  }, [activeSheetName]);

  useEffect(() => {
    if (isSimplifiedMode) {
      if (easyTab === 'expense') setActiveSheetName('FIN_TRANSACTIONS_V3');
      else if (easyTab === 'food') setActiveSheetName('MASTER_LOGS_ACTIVE');
      else if (easyTab === 'health') setActiveSheetName('HLT_HEALTH_METRICS_V3');
      else if (easyTab === 'vehicle') setActiveSheetName('GAR_LOGS_V3');
      else if (easyTab === 'work') setActiveSheetName('WRK_TIME_LOGS_V3');
    }
  }, [easyTab, isSimplifiedMode]);

  const generateAllIds = () => {
    const rawNow = new Date();
    const dateStr = rawNow.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = rawNow.toTimeString().slice(0, 8);
    const fullTimestamp = `${rawNow.toISOString().slice(0, 10)} ${timeStr}`;
    const dateOnly = rawNow.toISOString().slice(0, 10);
    const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

    setFinanceFields(prev => ({
      ...prev,
      transaction_id: `FIN-TXN-${dateStr}-${randSuffix}`,
      timestamp: fullTimestamp
    }));

    setHealthFields(prev => ({
      ...prev,
      metric_id: `HLT-MTR-${dateStr}`,
      date: dateOnly
    }));

    setGarageFields(prev => ({
      ...prev,
      garage_log_id: `GAR-LOG-${dateStr}-${randSuffix}`,
      transaction_ref: `FIN-TXN-${dateStr}-${randSuffix}`
    }));

    setWorkFields(prev => ({
      ...prev,
      time_log_id: `WRK-LOG-${dateStr}-${randSuffix}`,
      timestamp_start: `${dateOnly} 09:00:00`,
      timestamp_end: `${dateOnly} 11:00:00`
    }));

    setMasterFields(prev => ({
      ...prev,
      log_id: `TL-${dateStr}-${randSuffix}`,
      timestamp: fullTimestamp
    }));
  };

  const handleSaveUrl = (url: string) => {
    setWebAppUrl(url);
    safeLocalStorage.setItem('tuk_life_web_app_url', url);
    setTestStatus('idle');
    setTestErrorMessage(null);
  };

  const testConnection = async () => {
    if (!webAppUrl.trim()) {
      setTestStatus('failed');
      setTestErrorMessage('Please supply a Google Apps Script Web App URL first.');
      return;
    }
    setTestStatus('testing');
    setTestErrorMessage(null);

    try {
      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({ action: 'ping' }),
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`Server returned status code: ${response.status}`);
      }

      const rawData = await response.json();
      if (rawData.status === 'success') {
        setTestStatus('success');
        const title = rawData.spreadsheetName || 'TUK LIFE OS MASTER BOOK';
        const id = rawData.spreadsheetId || '';
        setSpreadsheetTitle(title);
        setSpreadsheetId(id);
        safeLocalStorage.setItem('tuk_life_spreadsheet_title', title);
        safeLocalStorage.setItem('tuk_life_spreadsheet_id', id);
        window.dispatchEvent(new Event('spreadsheet-connection-changed'));
      } else {
        throw new Error(rawData.message || 'Verification return message was invalid.');
      }
    } catch (err: any) {
      console.error(err);
      setTestStatus('failed');
      setTestErrorMessage(
        err.message || 'Network request failed. Make sure you selected Access: "Anyone" and Deployed as "Web app".'
      );
    }
  };

  // Seed Presets For Instant Fill
  const selectPreset = (type: 'coffee' | 'weight' | 'fuel' | 'work') => {
    generateAllIds();
    const rawNow = new Date();
    const dateStr = rawNow.toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

    if (type === 'coffee') {
      setActiveSheetName('FIN_TRANSACTIONS_V3');
      setFinanceFields(prev => ({
        ...prev,
        transaction_id: `FIN-TXN-${dateStr}-${randSuffix}`,
        amount_thb: '450.00',
        flow_type: 'EXPENSE',
        category_code: 'FIN_FOOD',
        recipient: 'Starbucks Coffee EmQuartier',
        invoice_attachment: 'https://drive.google.com/open?id=demo_receipt_starbucks'
      }));
    } else if (type === 'weight') {
      setActiveSheetName('HLT_HEALTH_METRICS_V3');
      setHealthFields(prev => ({
        ...prev,
        metric_id: `HLT-MTR-${dateStr}`,
        weight_kg: '71.8',
        sleep_hours: '8.2',
        sleep_score: '91',
        activity_calories: '520',
        water_ml: '2500',
        notes: 'Morning weigh-in weight stable, clean diet yesterday.'
      }));
    } else if (type === 'fuel') {
      setActiveSheetName('GAR_LOGS_V3');
      setGarageFields(prev => ({
        ...prev,
        garage_log_id: `GAR-LOG-${dateStr}-${randSuffix}`,
        odometer_km: '124380',
        fuel_liters: '36.8',
        transaction_ref: `FIN-TXN-${dateStr}-${randSuffix}`,
        diagnostic_details: 'Premium Gasohol 95 Caltex - Silom Road'
      }));
    } else if (type === 'work') {
      setActiveSheetName('WRK_TIME_LOGS_V3');
      setWorkFields(prev => ({
        ...prev,
        time_log_id: `WRK-LOG-${dateStr}-${randSuffix}`,
        spent_minutes: '180',
        task_details: 'Completed modular integration of live Google Sheets webhook and test diagnostics client.',
        billing_status: 'UNBILLED'
      }));
    }
  };

  // Submission handler
  const handleLiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    let payloadRow: any = {};
    let chosenSheet = activeSheetName;

    // Apply Easy Mode automatic value intercepts
    if (isSimplifiedMode) {
      if (easyTab === 'expense') {
        chosenSheet = 'FIN_TRANSACTIONS_V3';
        // Auto-assign hidden/constant properties
        financeFields.flow_type = 'EXPENSE';
        financeFields.category_code = 'FIN_LIFESTYLE';
      } else if (easyTab === 'food') {
        chosenSheet = 'MASTER_LOGS_ACTIVE';
        masterFields.main_category = 'HEALTH';
        masterFields.type = 'DIET';
        masterFields.unit = 'kcal';
        masterFields.tags = '#food, #diet';
      } else if (easyTab === 'health') {
        chosenSheet = 'HLT_HEALTH_METRICS_V3';
        healthFields.notes = `Weight: ${healthFields.weight_kg} kg | Sleep: ${healthFields.sleep_hours} hrs | Exercise: ${exerciseMinutes} mins`;
        healthFields.systolic_bp = '120';
        healthFields.diastolic_bp = '80';
        healthFields.resting_heart_rate = '70';
        healthFields.sleep_score = '85';
        // Estimate activity calories from exercise minutes
        healthFields.activity_calories = String(parseFloat(exerciseMinutes || '0') * 7);
        healthFields.water_ml = '2000';
      } else if (easyTab === 'vehicle') {
        chosenSheet = 'GAR_LOGS_V3';
        garageFields.diagnostic_details = `Cost: ${vehicleCost} THB | Location: ${vehicleLocation}`;
        // Estimate fuel liters based on Caltex 95 price/L ~ 38 THB
        garageFields.fuel_liters = String((parseFloat(vehicleCost || '0') / 38).toFixed(2));
        garageFields.log_type = 'FUEL';
      } else if (easyTab === 'work') {
        chosenSheet = 'WRK_TIME_LOGS_V3';
        workFields.project_id = 'WRK-PRJ-01';
      }
    }

    // Collate data based on the chosen sheet tab
    if (chosenSheet === 'FIN_TRANSACTIONS_V3') {
      payloadRow = { ...financeFields };
    } else if (chosenSheet === 'HLT_HEALTH_METRICS_V3') {
      payloadRow = { ...healthFields };
    } else if (chosenSheet === 'GAR_LOGS_V3') {
      payloadRow = { ...garageFields };
    } else if (chosenSheet === 'WRK_TIME_LOGS_V3') {
      payloadRow = { ...workFields };
    } else if (chosenSheet === 'MASTER_LOGS_ACTIVE') {
      payloadRow = { ...masterFields };
    }

    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);
    const timestampStr = now.toISOString().slice(0, 19).replace('T', ' ');

    // Build timeline ledger item
    let timelineCategory: 'finance' | 'health' | 'garage' | 'work' = 'finance';
    let subjectStr = '';
    let valStr = '0.00';
    let unitStr = 'THB';
    let detailStr = '';
    let isIncomeValue: boolean | undefined = undefined;
    let tagsArr: string[] = [];

    if (chosenSheet === 'FIN_TRANSACTIONS_V3') {
      timelineCategory = 'finance';
      subjectStr = financeFields.recipient || 'ธุรกรรมประเภทค่าใช้จ่าย/รายรับ';
      const parsedAmt = parseFloat(financeFields.amount_thb || '0');
      valStr = isNaN(parsedAmt) ? '0.00' : parsedAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      unitStr = 'THB';
      isIncomeValue = financeFields.flow_type === 'RECEIPT';
      detailStr = `• จ่ายผ่านบัญชี: ${financeFields.account_source_id}\n• รายละเอียด: บันทึกรายการลงบัญชีเรียบร้อย (${financeFields.category_code})`;
      tagsArr = ['#finance', `#${financeFields.category_code ? financeFields.category_code.toLowerCase() : 'expense'}`];
    } else if (chosenSheet === 'HLT_HEALTH_METRICS_V3') {
      timelineCategory = 'health';
      subjectStr = 'บันทึกตัวชีวัดและสุขภาพชีวภาพส่วนบุคคล';
      valStr = healthFields.weight_kg;
      unitStr = 'kg';
      detailStr = `• ดัชนีน้ำหนักตัว: ${healthFields.weight_kg} kg | ระดับชีพจร: ${healthFields.resting_heart_rate} bpm\n• ค่าแรงดันโลหิต: ${healthFields.systolic_bp}/${healthFields.diastolic_bp} mmHg\n• นัยสำคัญ: พักผ่อนนอนหลับ ${healthFields.sleep_hours} ชม. (คะแนนจิตภาพ: ${healthFields.sleep_score}/100)\n• รายละเอียดบันทึกเพิ่มเติม: ${healthFields.notes || 'รวบรวมค่าวัดรายวันเรียบร้อย'}`;
      tagsArr = ['#health', '#biometrics', '#health-sync'];
    } else if (chosenSheet === 'GAR_LOGS_V3') {
      timelineCategory = 'garage';
      subjectStr = `ดูแลรักษายานพาหนะ (${garageFields.log_type})`;
      const parsedLtrs = parseFloat(garageFields.fuel_liters || '0');
      valStr = isNaN(parsedLtrs) ? '0.00' : parsedLtrs.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
      unitStr = 'Liters';
      detailStr = `• รหัสรถ / ยานพหนะ: ${garageFields.vehicle_id}\n• ทะเบียนเป้าหมาย: ทั้งสิ้น ${parseFloat(garageFields.odometer_km || '0').toLocaleString()} กม.\n• บันทึกจากฝ่ายบำรุงและรายงานอาการ: ${garageFields.diagnostic_details}`;
      tagsArr = ['#garage', `#refuel-${garageFields.log_type.toLowerCase()}`];
    } else if (chosenSheet === 'WRK_TIME_LOGS_V3') {
      timelineCategory = 'work';
      subjectStr = 'บันทึกประวัติการปฏิบัติหน้าทีกิจการงาน';
      valStr = workFields.spent_minutes;
      unitStr = 'Minutes';
      detailStr = `• รหัสโครงการพอร์ตงาน: ${workFields.project_id}\n• กิจกรรมที่ทำ: ${workFields.task_details}\n• ช่วงระเบียบเวลา: ${workFields.timestamp_start} ถึง ${workFields.timestamp_end}\n• สถานะการหักลบ: ${workFields.billing_status}`;
      tagsArr = ['#work', `#prj-${workFields.project_id.toLowerCase()}`];
    } else if (chosenSheet === 'MASTER_LOGS_ACTIVE') {
      const rawCatStr = (masterFields.main_category || 'finance').toLowerCase();
      timelineCategory = rawCatStr === 'health' ? 'health' : rawCatStr === 'garage' ? 'garage' : rawCatStr === 'work' ? 'work' : 'finance';
      subjectStr = masterFields.subject || 'ประวัติบันทึกแบบส่วนรวม';
      const parsedVal = parseFloat(masterFields.value_result || '0');
      valStr = isNaN(parsedVal) ? '0.00' : parsedVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      unitStr = masterFields.unit || 'THB';
      detailStr = `• หมวดใหญ่: ${masterFields.main_category} [ประเภทย่อย: ${masterFields.type}]\n• รายละเอียด: ${masterFields.details}`;
      tagsArr = masterFields.tags ? masterFields.tags.split(',').map(t => t.trim()) : ['#master'];
    }

    const tEventId = `custom-form-${Date.now()}`;
    const newTimelineItem: any = {
      id: tEventId,
      timestamp: timestampStr,
      timeLabel: `${timeStr} (บันทึกจากฟอร์ม)`,
      category: timelineCategory,
      subject: subjectStr,
      value: valStr,
      unit: unitStr,
      isIncome: isIncomeValue,
      details: detailStr,
      tags: tagsArr.map(t => t.startsWith('#') ? t : `#${t}`),
      status: 'simulated',
      sheetTarget: chosenSheet
    };

    const newLogItem: LiveRowLog = {
      id: tEventId,
      timestamp: new Date().toLocaleTimeString(),
      sheetName: chosenSheet,
      category: chosenSheet === 'FIN_TRANSACTIONS_V3' ? 'FINANCE' : chosenSheet === 'HLT_HEALTH_METRICS_V3' ? 'HEALTH' : chosenSheet === 'GAR_LOGS_V3' ? 'GARAGE' : 'WORK/SYSTEM',
      subject: subjectStr,
      value: `${valStr} ${unitStr}`,
      status: 'simulated'
    };

    // Prepend to timeline local storage
    const savedEvents = safeLocalStorage.getItem('tuk_life_timeline_events');
    let currentEventsList = [];
    if (savedEvents) {
      try {
        currentEventsList = JSON.parse(savedEvents);
      } catch (err) {
        currentEventsList = [];
      }
    }
    const updatedEventsList = [newTimelineItem, ...currentEventsList];
    safeLocalStorage.setItem('tuk_life_timeline_events', JSON.stringify(updatedEventsList));
    window.dispatchEvent(new Event('timeline-updated'));

    if (!webAppUrl.trim()) {
      newLogItem.status = 'simulated';
      setLogMessages(prev => [newLogItem, ...prev]);
      generateAllIds();
      setToast({
        message: `💡 บันทึกลงไทม์ไลน์และแคชเวิร์กสเปซจำลองสำเร็จเรียบร้อย! (เชื่อมโยงตาราง "${chosenSheet}" เรียบร้อย หากต้องการเชื่อมโยงฐานข้อมูลแผ่นงานจริง โปรดกรอก Web App URL)`,
        type: 'info'
      });
      setSubmitting(false);
      if (isSimplifiedMode) {
        setEasySaveSuccess(true);
      }
      return;
    }

    try {
      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'appendRow',
          sheetName: chosenSheet,
          rowData: payloadRow
        }),
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`Connection dropped: status code ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.status === 'success') {
        newLogItem.status = 'sent';
        newTimelineItem.status = 'sent';
        // Re-update local storage with synced status
        safeLocalStorage.setItem('tuk_life_timeline_events', JSON.stringify([newTimelineItem, ...currentEventsList]));
        window.dispatchEvent(new Event('timeline-updated'));

        setLogMessages(prev => [newLogItem, ...prev]);
        generateAllIds(); // regen reference IDs for next log
        setToast({
          message: `🎉 บันทึกส่งข้อมูลลงตาราง "${chosenSheet}" บน Google Sheets สำเร็จ และอัปเดตบนไทม์ไลน์แล้ว!`,
          type: 'success'
        });
        if (isSimplifiedMode) {
          setEasySaveSuccess(true);
        }
      } else {
        throw new Error(resJson.message || 'Sheets script rejected validation.');
      }
    } catch (err: any) {
      console.error(err);
      newLogItem.status = 'failed';
      newLogItem.errorDetail = err.message || 'Check App Script deployment / webapp status.';
      setLogMessages(prev => [newLogItem, ...prev]);
      setToast({
        message: `⚠️ Spreadsheet Write Error: ${err.message || 'Network Failure.'} บันทึกรายการลงใน Local Cache สำเร็จ`,
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isSimplifiedMode) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        {easySaveSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-lg flex flex-col items-center justify-center min-h-[220px]"
          >
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full mb-3.5 ring-4 ring-emerald-500/5">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-800">
              {language === 'th' ? 'บันทึกสำเร็จ' : 'บันทึกสำเร็จ'}
            </h3>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
              {language === 'th' ? 'ข้อมูลถูกจัดส่งลงในบัญชีเรียบร้อยแล้ว' : 'Data successfully piped to Spreadsheet!'}
            </p>
            <button
              type="button"
              onClick={() => {
                setEasySaveSuccess(false);
                setFinanceFields(prev => ({ ...prev, amount_thb: '', recipient: '', invoice_attachment: '' }));
                setMasterFields(prev => ({ ...prev, subject: '', value_result: '', details: '' }));
                setHealthFields(prev => ({ ...prev, weight_kg: '', sleep_hours: '' }));
                setExerciseMinutes('30');
                setVehicleCost('');
                setVehicleLocation('');
                setGarageFields(prev => ({ ...prev, odometer_km: '' }));
                setWorkFields(prev => ({ ...prev, task_details: '', spent_minutes: '' }));
              }}
              className="mt-6 w-full max-w-[180px] bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black py-2 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              {language === 'th' ? 'บันทึกรายการเพิ่ม' : 'Add Another Entry'}
            </button>
          </motion.div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="grid grid-cols-5 gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
              {[
                { id: 'expense', emoji: '💸', label: language === 'th' ? 'จ่าย' : 'Spend' },
                { id: 'food', emoji: '🍜', label: language === 'th' ? 'อาหาร' : 'Food' },
                { id: 'health', emoji: '💖', label: language === 'th' ? 'สุขภาพ' : 'Health' },
                { id: 'vehicle', emoji: '🚗', label: language === 'th' ? 'เดินทาง' : 'Drive' },
                { id: 'work', emoji: '💼', label: language === 'th' ? 'งาน' : 'Work' }
              ].map((tab) => {
                const isActive = easyTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setEasyTab(tab.id)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-white text-indigo-600 shadow-3xs border border-slate-200/50'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
                    }`}
                  >
                    <span className="text-base mb-0.5 transform active:scale-95 transition-transform">{tab.emoji}</span>
                    <span className="text-[9px] font-bold tracking-tight">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleLiveSubmit} className="space-y-4">
              {easyTab === 'expense' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'th' ? 'จำนวนเงิน (บาท)' : 'Amount (THB)'}
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      step="0.01"
                      value={financeFields.amount_thb}
                      onChange={(e) => setFinanceFields({ ...financeFields, amount_thb: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'th' ? 'ชื่อรายการ / หมายเหตุ' : 'Title / Note'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={language === 'th' ? 'เช่น ค่าน้ำ, ค่าของกิน' : 'e.g. Starbucks, Groceries'}
                      value={financeFields.recipient}
                      onChange={(e) => setFinanceFields({ ...financeFields, recipient: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'th' ? 'สถานที่' : 'Location'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'th' ? 'เช่น สยาม, เซ็นทรัล' : 'e.g. Siam Paragon'}
                      value={financeFields.invoice_attachment}
                      onChange={(e) => setFinanceFields({ ...financeFields, invoice_attachment: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'th' ? 'วิธีการชำระเงิน' : 'Payment Method'}
                    </label>
                    <select
                      value={financeFields.account_source_id}
                      onChange={(e) => setFinanceFields({ ...financeFields, account_source_id: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="SCB-ACC-01">💳 {language === 'th' ? 'บัญชีออมทรัพย์ SCB (01)' : 'SCB Savings Account (01)'}</option>
                      <option value="SCB-CARD-02">💳 {language === 'th' ? 'บัตรเครดิต SCB (02)' : 'SCB Credit Card (02)'}</option>
                      <option value="CASH">💵 {language === 'th' ? 'เงินสด (Cash)' : 'Cash'}</option>
                    </select>
                  </div>
                </div>
              )}

              {easyTab === 'food' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'th' ? 'ชื่ออาหาร' : 'Food Name'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={language === 'th' ? 'เช่น สลัดผักผัดไท' : 'e.g. Caesar Salad, Pad Thai'}
                      value={masterFields.subject}
                      onChange={(e) => setMasterFields({ ...masterFields, subject: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'th' ? 'แคลอรี่ (kcal)' : 'Calories (kcal)'}
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 350"
                      value={masterFields.value_result}
                      onChange={(e) => setMasterFields({ ...masterFields, value_result: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'th' ? 'สถานที่' : 'Location'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'th' ? 'ระบุสถานที่ร้านอาหาร' : 'e.g. Central Food Court'}
                      value={masterFields.details}
                      onChange={(e) => setMasterFields({ ...masterFields, details: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {easyTab === 'health' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'th' ? 'น้ำหนักตัว (กก.)' : 'Weight (kg)'}
                    </label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      placeholder="e.g. 70.0"
                      value={healthFields.weight_kg}
                      onChange={(e) => setHealthFields({ ...healthFields, weight_kg: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'th' ? 'ชั่วโมงการนอนหลับ' : 'Sleep Hours'}
                    </label>
                    <input
                      type="number"
                      required
                      step="0.1"
                      placeholder="e.g. 7.5"
                      value={healthFields.sleep_hours}
                      onChange={(e) => setHealthFields({ ...healthFields, sleep_hours: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all font-mono font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'th' ? 'เวลาออกกำลังกาย (นาที)' : 'Exercise Minutes'}
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 30"
                      value={exerciseMinutes}
                      onChange={(e) => setExerciseMinutes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all font-mono"
                    />
                  </div>
                </div>
              )}

              {easyTab === 'vehicle' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'th' ? 'ยานพาหนะ' : 'Vehicle'}
                    </label>
                    <select
                      value={garageFields.vehicle_id}
                      onChange={(e) => setGarageFields({ ...garageFields, vehicle_id: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="GAR-VEH-01">🚗 {language === 'th' ? 'โตโยต้า พริอุส (GAR-VEH-01)' : 'Toyota Prius (GAR-VEH-01)'}</option>
                      <option value="GAR-VEH-02">🚗 {language === 'th' ? 'ฮอนด้า ซีวิค (GAR-VEH-02)' : 'Honda Civic (GAR-VEH-02)'}</option>
                      <option value="GAR-VEH-03">🛵 {language === 'th' ? 'เวสป้า GTS (GAR-VEH-03)' : 'Vespa GTS (GAR-VEH-03)'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'th' ? 'ค่าเชื้อเพลิง / ค่าเช็คบริการ (บาท)' : 'Fuel Cost / Service Cost (THB)'}
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      value={vehicleCost}
                      onChange={(e) => setVehicleCost(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'th' ? 'สถานที่' : 'Location'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'th' ? 'เช่น ปั๊มบางจาก สีลม' : 'e.g. PTT Sukhumvit'}
                      value={vehicleLocation}
                      onChange={(e) => setVehicleLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'th' ? 'เลขไมล์สะสม (ถ้ามี)' : 'Odometer (if available)'}
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 124350"
                      value={garageFields.odometer_km}
                      onChange={(e) => setGarageFields({ ...garageFields, odometer_km: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all font-mono"
                    />
                  </div>
                </div>
              )}

              {easyTab === 'work' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'th' ? 'ชื่องาน / รายละเอียด' : 'Task Title'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={language === 'th' ? 'เช่น ตรวจโค้ด, ตรวจสอบ API' : 'e.g. Consulting, Design System'}
                      value={workFields.task_details}
                      onChange={(e) => setWorkFields({ ...workFields, task_details: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'th' ? 'ระยะเวลาที่ใช้ (นาที)' : 'Duration (Minutes)'}
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 60"
                      value={workFields.spent_minutes}
                      onChange={(e) => setWorkFields({ ...workFields, spent_minutes: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'th' ? 'สถานะกิลด์การค้า (Status)' : 'Status'}
                    </label>
                    <select
                      value={workFields.billing_status}
                      onChange={(e) => setWorkFields({ ...workFields, billing_status: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="UNBILLED">💸 {language === 'th' ? 'ยังไม่ได้ออกบิล (unbilled)' : 'Unbilled hours accumulated'}</option>
                      <option value="BILLED">💼 {language === 'th' ? 'ส่งประวัติเรียกเก็บแล้ว (billed)' : 'Billed / Invoiced'}</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-black text-xs rounded-xl tracking-wide shadow-md transition-all duration-150 disabled:opacity-50 select-none flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {language === 'th' ? 'กำลังบันทึก...' : 'Saving...'}
                    </>
                  ) : (
                    language === 'th' ? 'บันทึกลง Google Sheets' : 'บันทึกลง Google Sheets'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-[11px] leading-tight font-semibold shadow-md ${
                toast.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : toast.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-indigo-50 border-indigo-100 text-indigo-800'
              }`}
            >
              <span className="truncate max-w-[280px]">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Auto Save Status Section */}
      {!isSimplifiedMode && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-indigo-500" />
            {language === 'th' ? 'สถานะการซิงก์ Google Sheets' : 'Google Sheets Sync Status'}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold">
              <div className={`w-3 h-3 rounded-full ${!webAppUrl ? 'bg-slate-400' : (isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500')} `} />
              {!webAppUrl ? (language === 'th' ? 'ยังไม่ได้เชื่อมต่อ' : 'Not Connected') : (isSyncing ? (language === 'th' ? 'กำลังซิงก์...' : 'Syncing...') : (language === 'th' ? 'บันทึกสำเร็จ' : 'Sync Successful'))}
            </div>
            <div className="text-xs text-slate-500">
              {language === 'th' ? 'บันทึกล่าสุด:' : 'Last synced:'} {lastSyncedTime || '-'}
            </div>
            <div className="text-xs text-slate-500">
              {language === 'th' ? 'ซิงก์ถัดไปใน:' : 'Next sync in:'} {Math.floor(syncTimer / 60)}:{(syncTimer % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <button
            onClick={triggerAutoSync}
            disabled={!isUrlValid || isSyncing}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 rounded-xl tracking-wide shadow-sm transition-all duration-150 disabled:opacity-50 select-none flex items-center justify-center gap-2"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {language === 'th' ? 'กำลังบันทึก...' : 'Saving...'}
              </>
            ) : !webAppUrl ? (
              language === 'th' ? 'ยังไม่ได้เชื่อมต่อ Google Sheets' : 'Google Sheets Not Connected'
            ) : (
              language === 'th' ? 'บันทึกลง Google Sheets ตอนนี้' : 'Save to Google Sheets Now'
            )}
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
          {language === 'th' ? 'การเชื่อมต่อ Google Sheets' : 'Google Sheets Connection'}
        </h2>


        {/* Connection Status */}
        {testStatus === 'success' ? (
          <div className="flex items-center text-emerald-600 gap-2 font-bold mb-6 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
            <div className="w-3 h-3 bg-emerald-500 rounded-full" /> 🟢 เชื่อมต่อแล้ว
          </div>
        ) : (
          <div className="flex items-center text-amber-600 gap-2 font-bold mb-6 bg-amber-50 p-3 rounded-xl border border-amber-100">
            <div className="w-3 h-3 bg-amber-500 rounded-full" /> 🟠 ยังไม่ได้เชื่อมต่อ
          </div>
        )}

        {/* SpreadSheet Info */}
        {(spreadsheetTitle || spreadsheetId) && (
          <div className="text-xs text-slate-600 space-y-1 mb-6 bg-slate-50 p-4 rounded-xl">
            <p className="font-bold">ชื่อไฟล์: {spreadsheetTitle || 'ไม่พบชื่อ'}</p>
            <p className="font-mono">Spreadsheet ID: {spreadsheetId || 'ไม่พบ ID'}</p>
          </div>
        )}

          {/* Web App URL Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              ลิงก์เชื่อมต่อ Google Sheet
            </label>
            <input
              type="text"
              placeholder="วางลิงก์ Web App URL ที่นี่"
              value={webAppUrl}
              onChange={(e) => {
                const url = e.target.value;
                setWebAppUrl(url);
                setIsUrlValid(url.startsWith('https://') && url.includes('script.google.com'));
              }}
              className={`w-full bg-slate-50 border ${!isUrlValid && webAppUrl.length > 0 ? 'border-rose-500' : 'border-slate-300'} rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all`}
            />
            {!isUrlValid && webAppUrl.length > 0 && (
              <p className="text-xs text-rose-500 font-bold mt-1">ลิงก์ไม่ถูกต้อง กรุณาใส่ Google Apps Script Web App URL</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleSaveUrl(webAppUrl)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all"
              disabled={!isUrlValid && webAppUrl.length > 0}
            >
              บันทึกลิงก์
            </button>
            <button
              onClick={testConnection}
              disabled={!isUrlValid || testStatus === 'testing'}
              className="flex-1 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 text-xs font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50"
            >
              {testStatus === 'testing' ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}
            </button>
          </div>
        </div>

        {/* Backup and Recovery System */}
        <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            สำรองข้อมูลและกู้คืน
          </h3>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                const data: Record<string, string> = {};
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && key.startsWith('tuk_life_')) {
                    data[key] = localStorage.getItem(key) || '';
                  }
                }
                const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `tuk_life_backup_${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              📦 สำรองข้อมูลตอนนี้
            </button>
            <label className="flex-1">
              <input
                type="file"
                className="hidden"
                accept=".json"
                onChange={(e) => {
                  if (!e.target.files || e.target.files.length === 0) return;
                  if (!confirm("คุณต้องการกู้คืนข้อมูลหรือไม่? ข้อมูลปัจจุบันจะถูกเขียนทับ")) return;

                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const data = JSON.parse(event.target?.result as string);
                    for (const key in data) {
                      localStorage.setItem(key, data[key]);
                    }
                    window.location.reload();
                  };
                  reader.readAsText(e.target.files[0]);
                }}
              />
              <div className="w-full h-full bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50 text-xs font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
                ♻️ กู้คืนข้อมูล
              </div>
            </label>
          </div>
          <p className="text-[10px] text-slate-500 italic">
            * ระบบจะสำรองข้อมูลเฉพาะคีย์ของ TUK LIFE OS เท่านั้น
          </p>
        </div>
      </div>
    </div>
  );
}

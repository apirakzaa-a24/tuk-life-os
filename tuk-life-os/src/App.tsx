import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Activity,
  Heart,
  DollarSign,
  Car,
  Briefcase,
  Plane,
  Target,
  TrendingUp,
  Percent,
  Stethoscope,
  Sparkles,
  Eye,
  Settings,
  Database,
  Copy,
  Check,
  Search,
  Download,
  Scale,
  Network,
  ArrowRight,
  AlertCircle,
  BookOpen,
  Info,
  ChevronRight,
  Code,
  FileSpreadsheet,
  Trash2,
  PlusCircle,
  Edit3,
  Camera,
  CheckSquare,
  List,
  Calendar,
  RotateCcw,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MODULES_DATA,
  REDESIGNED_MODULES_DATA,
  PEER_REVIEW_ITEMS,
  GOOGLE_APPS_SCRIPT_TEMPLATE,
  V3_APPS_SCRIPT,
  ColumnDefinition,
  SheetSchema,
  ModuleSchema,
  ReviewItem
} from './schemaData';
import AiIngestor from './components/AiIngestor';
import KpiDashboard from './components/KpiDashboard';
import LiveRegistry from './components/LiveRegistry';
import TimelineLedger from './components/TimelineLedger';
import GoalsAndStandards from './components/GoalsAndStandards';
import BackupManager from './components/BackupManager';
import AuditLogViewer from './components/AuditLogViewer';
import DataHealthChecker from './components/DataHealthChecker';
import RepairCenter from './components/RepairCenter';
import DeveloperCenter from './components/DeveloperCenter';
import KnowledgeBase from './components/KnowledgeBase';
import { safeLocalStorage } from './utils/storage';

export default function App() {
  const [selectedMainTab, setSelectedMainTab] = useState<string>('timeline'); 
  const [activeEasyTab, setActiveEasyTab] = useState<'expense' | 'food' | 'health' | 'work' | 'vehicle' | 'lifestyle' | null>(null);
  const [language, setLanguage] = useState<'th' | 'en'>('th');
  const [isSimplifiedMode, setIsSimplifiedMode] = useState<boolean>(true);
  const [schemaEdition, setSchemaEdition] = useState<'legacy' | 'v3'>('legacy');
  const [selectedSheetIndex, setSelectedSheetIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [guideSubTab, setGuideSubTab] = useState<string>('manual');
  const [manualTopic, setManualTopic] = useState<string>('all');
  const [customSeeds, setCustomSeeds] = useState<{
    scb_id: string;
    license_plate: string;
    hourly_rate: string;
    weight_kg: string;
  } | null>(null);

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const tooltipTimeoutRef = useRef<any>(null);

  // Auto-Sync & Permanent Connection States
  const [spreadsheetTitle, setSpreadsheetTitle] = useState<string>(() => {
    return safeLocalStorage.getItem('tuk_life_spreadsheet_title') || '';
  });
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    return safeLocalStorage.getItem('tuk_life_spreadsheet_id') || '';
  });
  const [webAppUrl, setWebAppUrl] = useState<string>(() => {
    return safeLocalStorage.getItem('tuk_life_web_app_url') || '';
  });
  const [syncTimer, setSyncTimer] = useState<number>(300); // 5 minutes = 300 seconds
  const [unsyncedCount, setUnsyncedCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState<boolean>(() => {
    const saved = safeLocalStorage.getItem('tuk_life_auto_sync_enabled');
    return saved !== 'false';
  });

  useEffect(() => {
    safeLocalStorage.setItem('tuk_life_auto_sync_enabled', isAutoSyncEnabled.toString());
  }, [isAutoSyncEnabled]);

  // Sync function to push to sheets
  const triggerAutoSync = async () => {
    const currentUrl = safeLocalStorage.getItem('tuk_life_web_app_url') || '';
    if (!currentUrl.trim()) {
      return; // No connected script URL
    }

    const saved = safeLocalStorage.getItem('tuk_life_timeline_events');
    if (!saved) return;

    let events: any[] = [];
    try {
      events = JSON.parse(saved);
    } catch (e) {
      return;
    }

    const pending = events.filter((e: any) => e.status === 'simulated' || e.status === 'failed');
    if (pending.length === 0) {
      setSyncTimer(300);
      return;
    }

    setIsSyncing(true);
    setSyncError(null);
    let successCount = 0;

    for (const event of pending) {
      try {
        const dateStr = event.timestamp ? event.timestamp.substring(0, 10).replace(/-/g, '') : new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        
        let payload: any = {};
        if (event.category === 'finance') {
          payload = {
            transaction_id: `FIN-TXN-${dateStr}-${randSuffix}`,
            timestamp: event.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19),
            account_source_id: 'FIN-ACC-01',
            account_dest_id: '',
            flow_type: event.isIncome ? 'RECEIPT' : 'EXPENSE',
            amount_thb: event.value ? event.value.replace(/,/g, '') : '0.00',
            category_code: 'FIN_FOOD',
            recipient: event.subject,
            invoice_attachment: ''
          };
        } else if (event.category === 'health') {
          payload = {
            metric_id: `HLT-MTR-${dateStr}`,
            date: event.timestamp ? event.timestamp.substring(0, 10) : new Date().toISOString().slice(0, 10),
            weight_kg: event.value ? event.value.replace(/,/g, '') : '72.5',
            systolic_bp: '120',
            diastolic_bp: '80',
            resting_heart_rate: '65',
            notes: event.details || 'Sync auto metric log'
          };
        } else if (event.category === 'garage') {
          payload = {
            garage_log_id: `GAR-LOG-${dateStr}-${randSuffix}`,
            vehicle_id: 'GAR-VEH-01',
            log_type: 'FUEL',
            odometer_km: '124400',
            fuel_liters: event.value ? event.value.replace(/,/g, '') : '0.00',
            diagnostic_details: event.details || 'Sync auto refuel'
          };
        } else {
          payload = {
            time_log_id: `WRK-LOG-${dateStr}-${randSuffix}`,
            project_id: 'WRK-PRJ-01',
            timestamp_start: `${event.timestamp ? event.timestamp.substring(0, 10) : new Date().toISOString().slice(0, 10)} 09:00:00`,
            timestamp_end: `${event.timestamp ? event.timestamp.substring(0, 10) : new Date().toISOString().slice(0, 10)} 11:00:00`,
            spent_minutes: event.value ? event.value.replace(/,/g, '') : '0',
            task_details: event.details || 'Sync auto work log',
            billing_status: 'UNBILLED'
          };
        }

        const response = await fetch(currentUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'appendRow',
            sheetName: event.sheetTarget,
            rowData: payload
          }),
          redirect: 'follow'
        });

        if (response.ok) {
          const resJson = await response.json();
          if (resJson.status === 'success') {
            event.status = 'sent';
            successCount++;
          }
        }
      } catch (err: any) {
        console.warn('Auto sync row bypass: ', event.id, err);
      }
    }

    // Save back updated events
    safeLocalStorage.setItem('tuk_life_timeline_events', JSON.stringify(events));
    window.dispatchEvent(new Event('timeline-updated'));
    
    setIsSyncing(false);
    setLastSyncedTime(new Date().toLocaleTimeString());
    setSyncTimer(300); // reset countdown
  };

  // Monitor count profiles and updates
  useEffect(() => {
    const updateStats = () => {
      const savedUrl = safeLocalStorage.getItem('tuk_life_web_app_url') || '';
      const savedTitle = safeLocalStorage.getItem('tuk_life_spreadsheet_title') || '';
      const savedId = safeLocalStorage.getItem('tuk_life_spreadsheet_id') || '';
      
      setWebAppUrl(savedUrl);
      setSpreadsheetTitle(savedTitle);
      setSpreadsheetId(savedId);

      const savedEvents = safeLocalStorage.getItem('tuk_life_timeline_events');
      if (savedEvents) {
        try {
          const parsed = JSON.parse(savedEvents);
          const unsynced = parsed.filter((e: any) => e.status === 'simulated' || e.status === 'failed');
          setUnsyncedCount(unsynced.length);
        } catch (e) {}
      }
    };

    updateStats();

    window.addEventListener('timeline-updated', updateStats);
    window.addEventListener('spreadsheet-connection-changed', updateStats);
    const poller = setInterval(updateStats, 4000);

    return () => {
      window.removeEventListener('timeline-updated', updateStats);
      window.removeEventListener('spreadsheet-connection-changed', updateStats);
      clearInterval(poller);
    };
  }, []);

  // Timer interval clock ticking
  useEffect(() => {
    if (!isAutoSyncEnabled) return;
    const timerInterval = setInterval(() => {
      setSyncTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isAutoSyncEnabled]);

  // Execute synchronization when the timer reaches zero
  useEffect(() => {
    if (syncTimer === 0) {
      setSyncTimer(300); // Reset timer immediately to prevent infinite tight loops on early returns
      triggerAutoSync();
    }
  }, [syncTimer]);

  const activeModulesList = useMemo(() => {
    return schemaEdition === 'legacy' ? MODULES_DATA : REDESIGNED_MODULES_DATA;
  }, [schemaEdition]);

  // Scaler calculator states
  const [years, setYears] = useState<number>(10);
  const [frequency, setFrequency] = useState<{ [key: string]: number }>({
    master: 5, // logs per day
    health: 1, // logs per day
    finance: 3, // logs per day
    garage: 1, // logs per week
    work: 2, // logs per day
    travel: 20, // logs per year
    goals: 5, // items per year
    invest: 15, // purchases per month
    debt: 1, // amortizations per month
    medical: 6, // visits per year
    dental: 2, // checkups per year
    eyecare: 2, // prescription reviews per year
  });

  const iconMap: { [key: string]: any } = {
    Activity,
    Heart,
    DollarSign,
    Car,
    Briefcase,
    Plane,
    Target,
    TrendingUp,
    Percent,
    Stethoscope,
    Sparkles,
    Eye,
    Settings,
  };

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    const results: { moduleName: string; moduleId: string; sheetName: string; col: ColumnDefinition }[] = [];

    activeModulesList.forEach((mod) => {
      mod.sheets.forEach((sheet) => {
        sheet.columns.forEach((col) => {
          if (
            col.name.toLowerCase().includes(query) ||
            (col.thaiName && col.thaiName.toLowerCase().includes(query)) ||
            col.description.toLowerCase().includes(query) ||
            col.type.toLowerCase().includes(query) ||
            (col.validation && col.validation.toLowerCase().includes(query))
          ) {
            results.push({
              moduleName: mod.name,
              moduleId: mod.id,
              sheetName: sheet.displayName,
              col,
            });
          }
        });
      });
    });
    return results;
  }, [searchQuery, activeModulesList]);

  const activeScript = useMemo(() => {
    let script = schemaEdition === 'legacy' ? GOOGLE_APPS_SCRIPT_TEMPLATE : V3_APPS_SCRIPT;
    if (schemaEdition === 'v3' && customSeeds) {
      script = script
        .replace(/'FIN-ACC-01'/g, `'${customSeeds.scb_id}'`)
        .replace(/'SCB Main checking account'/g, `'SCB Account [${customSeeds.scb_id}]'`)
        .replace(/'4กธ-4235'/g, `'${customSeeds.license_plate}'`)
        .replace(/'1500.00'/g, `'${Number(customSeeds.hourly_rate || 1500).toFixed(2)}'`)
        .replace(/'72.5'/g, `'${Number(customSeeds.weight_kg || 72.5).toFixed(2)}'`);
    }
    return script;
  }, [schemaEdition, customSeeds]);

  const fallbackCopy = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Fallback copy failed: ', err);
    }
  };

  const handleCopyCode = () => {
    try {
      if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(activeScript)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch((err) => {
            console.warn('Navigator clipboard failed, falling back...', err);
            fallbackCopy(activeScript);
          });
      } else {
        fallbackCopy(activeScript);
      }
    } catch (e) {
      console.warn('Navigator clipboard threw, falling back...', e);
      fallbackCopy(activeScript);
    }
  };

  // Export full schema documentation file
  const handleExportMarkdown = () => {
    let md = `# TUK LIFE OS - Google Sheets Database Schema Blueprint\n`;
    md += `Generated on: ${new Date().toLocaleDateString()} - Architecture by Senior Database Architect\n\n`;
    md += `This document serves as the absolute single source of truth for the TUK LIFE OS sheet design. Optimized for AppSheet integrations, Google Apps Script automation, and LLM context prompts.\n\n`;

    activeModulesList.forEach((mod) => {
      md += `\n## Module: ${mod.name}\n`;
      md += `${mod.description}\n\n`;

      mod.sheets.forEach((sheet) => {
        md += `### Sheet: ${sheet.sheetName} (${sheet.displayName})\n`;
        md += `**Purpose:** ${sheet.purpose}\n`;
        md += `**Primary Key (ID):** \`${sheet.primaryKey}\`\n\n`;

        md += `| Column Name | Thai Alias | Type | PK? | Relationship / Reference | Validation Rule | Example Value | Description |\n`;
        md += `|---|---|---|---|---|---|---|---|\n`;

        sheet.columns.forEach((col) => {
          const pkStr = col.primaryKey ? '✅ YES' : '';
          const fkStr = col.foreignKeyRef ? `Ref \`${col.foreignKeyRef}\`` : '-';
          md += `| \`${col.name}\` | ${col.thaiName || '-'} | ${col.type} | ${pkStr} | ${fkStr} | \`${col.validation}\` | \`${col.example}\` | ${col.description} |\n`;
        });
        md += `\n`;
      });
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'TUK_LIFE_OS_DB_Blueprint.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute Scaling Numbers
  const scalingAnalysis = useMemo(() => {
    let grandTotalRows = 0;
    let grandTotalCells = 0;
    const itemsList: {
      name: string;
      annualRows: number;
      tenYearRows: number;
      columnsCount: number;
      tenYearCells: number;
    }[] = [];

    activeModulesList.forEach((mod) => {
      mod.sheets.forEach((sheet) => {
        let annualMultiplier = 365; // logs per day default
        const normalizedId = mod.id.replace('_v3', '');
        let rate = frequency[normalizedId] || 1;

        if (normalizedId === 'garage') {
          // logs per week
          annualMultiplier = 52;
        } else if (normalizedId === 'travel' || normalizedId === 'goals') {
          // logs per year directly
          annualMultiplier = 1;
        } else if (normalizedId === 'invest' || normalizedId === 'debt') {
          // logs per month
          annualMultiplier = 12;
        } else if (normalizedId === 'medical' || normalizedId === 'dental' || normalizedId === 'eyecare' || normalizedId === 'system_configs' || normalizedId === 'system_configs_v3') {
          // logs per year directly
          annualMultiplier = 1;
        }

        const annualRows = Math.ceil(rate * annualMultiplier);
        const tenYearRows = annualRows * years;
        const columnsCount = sheet.columns.length;
        const tenYearCells = tenYearRows * columnsCount;

        grandTotalRows += tenYearRows;
        grandTotalCells += tenYearCells;

        itemsList.push({
          name: sheet.displayName,
          annualRows,
          tenYearRows,
          columnsCount,
          tenYearCells,
        });
      });
    });

    const googleSheetsCellLimit = 10000000; // 10 million limits in Google Sheets as of recent updates
    const percentageOfLimit = (grandTotalCells / googleSheetsCellLimit) * 100;

    return {
      grandTotalRows,
      grandTotalCells,
      itemsList,
      percentageOfLimit,
      alertMessage:
        percentageOfLimit > 60
          ? '⚠️ Warning: Near maximum spreadsheet cellular bounds. Implement Yearly Chronological Partitioning for sheets!'
          : '✅ Excellent: Structure is extremely safe and light-weight. Will scale comfortably for 10+ years within a single workbook.',
    };
  }, [years, frequency, activeModulesList]);

  const activeModule = activeModulesList.find((mod) => mod.id === selectedMainTab);
  const activeSheet = activeModule?.sheets[selectedSheetIndex] || activeModule?.sheets[0];

  // Helper for rendering icons
  const getIcon = (iconName: string, className = 'w-5 h-5') => {
    const Comp = iconMap[iconName] || Database;
    return <Comp className={className} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col selection:bg-teal-100">
      {/* HEADER BAR */}
      <header className={`bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 px-6 ${isSimplifiedMode ? 'py-2.5' : 'py-4'} shadow-md transition-all duration-300`}>
        <div className="max-w-7xl mx-auto">
          {isSimplifiedMode ? (
            /* EASY MODE HEADER */
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-tr from-teal-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-teal-500/10">
                  <Database className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-extrabold tracking-tight">TUK LIFE OS</h1>
                  <p className="text-[10px] text-teal-400 font-bold leading-normal">
                    {language === 'th' ? 'สวัสดีตอนบ่าย คุณ Tuk' : 'Good Afternoon, Tuk'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono font-medium text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/80">
                  {language === 'th' ? '23 มิถุนายน 2569' : '23 June 2026'}
                </span>
              </div>
            </div>
          ) : (
            /* DEVELOPER MODE HEADER */
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-tr from-teal-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-teal-500/10">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] tracking-widest font-mono font-semibold border px-2 py-0.5 rounded-full uppercase transition-all duration-300 ${
                      schemaEdition === 'legacy' 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                        : 'bg-teal-500/25 text-teal-300 border-teal-500/40 font-bold animate-pulse'
                    }`}>
                      SPEC: {schemaEdition === 'legacy' ? 'v2.4 (LEGACY)' : 'v3.0 (REDESIGNED)'}
                    </span>
                    <span className="text-[10px] tracking-widest font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase">
                      AppSheet Ready
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight mt-0.5">TUK LIFE OS</h1>
                </div>
              </div>

              {/* AUTOMATIC SYNC & PERSISTENT CONNECTION HUD */}
              <div className="flex flex-wrap items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl shadow-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${webAppUrl ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="text-[11px] font-bold text-slate-300">
                    {language === 'th' ? 'กูเกิลชีท:' : 'Google Sheets:'}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-100 max-w-[150px] truncate" title={spreadsheetTitle || 'No active connection'}>
                    {spreadsheetTitle ? `🟢 ${spreadsheetTitle}` : (language === 'th' ? 'ยังไม่ได้เชื่อมต่อ' : 'Unlinked')}
                  </span>
                </div>
                
                <div className="w-px h-4 bg-slate-800" />
                
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-[10px] font-semibold text-slate-400">
                    {language === 'th' ? 'บันทึกอัตโนมัติ (ทุก 5 นาที):' : 'Auto-Sync Time:'}
                  </span>
                  {isSyncing ? (
                    <span className="text-[10px] font-mono font-bold text-indigo-400 animate-pulse">
                      {language === 'th' ? 'กำลังส่ง...' : 'Syncing...'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-teal-300">
                      {Math.floor(syncTimer / 60)}:{(syncTimer % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>

                {unsyncedCount > 0 && (
                  <>
                    <div className="w-px h-4 bg-slate-800" />
                    <button
                      onClick={triggerAutoSync}
                      disabled={isSyncing}
                      className="text-[10px] bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-200 border border-cyan-400/30 px-2.5 py-1 rounded font-black transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Force Instant Google Sheets Synchronization"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                      </span>
                      <span>{unsyncedCount} {language === 'th' ? 'คิวที่ค้าง (กดเพื่อซิงก์)' : 'pending (Sync Now)'}</span>
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                {/* Easy Mode Toggle Selector */}
                <div className="flex bg-slate-950/80 border border-slate-800 rounded-xl p-1 shrink-0">
                  <button
                    onClick={() => {
                      setIsSimplifiedMode(true);
                      if (!['live-registry', 'ai-ingestor', 'dashboard', 'timeline'].includes(selectedMainTab)) {
                        setSelectedMainTab('timeline');
                      }
                    }}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      isSimplifiedMode
                        ? 'bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="โหมดอย่างง่าย (Easy Mode)"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{language === 'th' ? 'โหมด Easy' : 'Easy Mode'}</span>
                  </button>
                  <button
                    onClick={() => setIsSimplifiedMode(false)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      !isSimplifiedMode
                        ? 'bg-gradient-to-tr from-slate-700 to-slate-600 text-white shadow-xs border border-slate-550'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="โหมดนักพัฒนา (Developer Mode)"
                  >
                    <Code className="w-3 h-3" />
                    <span>{language === 'th' ? 'โหมดนักพัฒนา' : 'Developer'}</span>
                  </button>
                </div>

                {/* Bilingual Flag Toggle Selector */}
                <div className="flex bg-slate-950/80 border border-slate-800 rounded-xl p-1 shrink-0">
                  <button
                    onClick={() => setLanguage('th')}
                    title="ภาษาไทย (Thai Language)"
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      language === 'th'
                        ? 'bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    TH 🇹🇭
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    title="English Language"
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      language === 'en'
                        ? 'bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    EN 🇺🇸
                  </button>
                </div>

                <button
                  onClick={handleExportMarkdown}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> {language === 'th' ? 'ส่งออกข้อมูล (.md)' : 'Export Schema (.md)'}
                </button>
                <button
                  onClick={() => {
                    setSelectedMainTab('bootstrapper');
                  }}
                  className="bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-600 hover:to-cyan-500 text-slate-950 text-sm font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-teal-500/10 cursor-pointer"
                >
                  <Code className="w-4 h-4" /> {language === 'th' ? 'รับสคริปต์แอป' : 'Get Apps Script'}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* UNIFIED DESIGN BANNER - Hidden in Easy Mode */}
      {!isSimplifiedMode && (
        <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 text-white py-4 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-4xl">
              <h3 className="text-sm md:text-base font-black tracking-wider flex items-center gap-1.5 uppercase font-mono text-teal-300">
                💎 ระบบคลังข้อมูลชีวิตแบบรวมศูนย์ (TUK LIFE MASTER WORKSPACE - UNIFIED VERSION)
              </h3>
              <p className="text-[11px] md:text-xs text-slate-300 mt-1 leading-relaxed">
                {language === 'th' 
                  ? 'ยินดีต้อนรับสู่ระบบควบคุมฐานข้อมูล TUK LIFE OS เชื่อมโยง Google Sheets และระบบจัดสรรโมดูลย่อย (Sub-Modules) พร้อมซิงก์ข้อมูลอัจฉริยะทุกๆ 5 นาที ตลอดชีพจนกว่าคุณจะเปลี่ยนลิงก์ปลั๊กอิน'
                  : 'Welcome to the unified TUK LIFE OS workspace controller. Access quick-logging utilities, AI scanners, and real-time sheet schemas in one unified layout with 5-minute background synchronization.'}
              </p>
            </div>
            <div className="shrink-0 flex flex-wrap gap-2">
              <span className="text-[10px] font-mono font-bold bg-teal-500/10 text-teal-300 px-2.5 py-1 rounded-lg border border-teal-500/20">
                {language === 'th' ? '⚡ ซิงก์ฉลาดเรียลไทม์' : '⚡ Smart Sync Active'}
              </span>
              <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                📊 20 {language === 'th' ? 'เทเบิลอ้างอิงอัจฉริยะ' : 'Relational Tables'}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-6 p-6">
        
        {/* SIDE BAR NAVIGATION */}
        <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-5">
          {/* SIDEBAR MAIN MENU */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
            {true ? (
              <>
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-550 tracking-wider">🌟 เมนูเริ่มใช้งานด่วน (QUICK ACTIONS)</span>
                </div>
                <nav className="p-3">
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {[
                      {
                        id: 'ai-ingestor',
                        emoji: '📸',
                        title: language === 'th' ? '1. สแกนสลิปด้วย AI' : '1. Scan Slip with AI',
                        subtitle: '',
                        activeClass: 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-550/20',
                        inactiveClass: 'text-emerald-700 bg-emerald-50/40 hover:bg-emerald-50 border border-emerald-100/40'
                      },
                      {
                        id: 'dashboard',
                        emoji: '📊',
                        title: language === 'th' ? '2. แดชบอร์ดสรุปสถิติ' : '2. Stat Summary Dashboard',
                        subtitle: '',
                        activeClass: 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-sm ring-2 ring-teal-500/20',
                        inactiveClass: 'text-teal-700 bg-teal-50/40 hover:bg-teal-50 border border-teal-100/40'
                      },
                      {
                        id: 'timeline',
                        emoji: '🕒',
                        title: language === 'th' ? '3. ไทม์ไลน์บันทึกประวัติ' : '3. History Timeline Ledger',
                        subtitle: '',
                        activeClass: 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-sm ring-2 ring-indigo-555/20',
                        inactiveClass: 'text-slate-755 bg-slate-50 hover:bg-slate-100 border border-slate-205'
                      },
                      {
                        id: 'knowledge-base',
                        emoji: '📚',
                        title: language === 'th' ? '4. คลังความรู้' : '4. Knowledge Base',
                        subtitle: '',
                        activeClass: 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-sm ring-2 ring-indigo-555/20',
                        inactiveClass: 'text-slate-755 bg-slate-50 hover:bg-slate-100 border border-slate-205'
                      }
                    ].map((btn) => {
                      const isActive = selectedMainTab === btn.id && !searchQuery;
                      return (
                        <div key={btn.id} className="relative group">
                          {/* Circle Card Button */}
                          <button
                            onClick={() => {
                              setSelectedMainTab(btn.id);
                              setSearchQuery('');
                              setActiveTooltip(btn.id);
                              if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
                              tooltipTimeoutRef.current = setTimeout(() => {
                                setActiveTooltip(null);
                              }, 3000);
                            }}
                            onPointerDown={() => {
                              setActiveTooltip(btn.id);
                            }}
                            onPointerLeave={() => {
                              setActiveTooltip(null);
                            }}
                            className={`w-full aspect-square flex items-center justify-center rounded-2xl text-[24.5px] transition-all duration-200 cursor-pointer ${
                              isActive ? btn.activeClass : btn.inactiveClass
                            }`}
                          >
                            <span className="transform group-hover:scale-110 active:scale-95 transition-transform duration-200 text-[26px]">
                              {btn.emoji}
                            </span>
                          </button>

                          {/* Hover/Tap Tooltip Label */}
                          <AnimatePresence>
                            {activeTooltip === btn.id && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                transition={{ duration: 0.12 }}
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 border border-slate-800 text-white rounded-xl shadow-xl text-center z-50 pointer-events-none min-w-[170px]"
                              >
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                                <span className="block text-[10.5px] font-mono font-extrabold leading-tight">{btn.title}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tiny Active Item Text Helper Bar underneath */}
                  <div className="text-center min-h-[16px] flex items-center justify-center font-bold text-[9.5px] tracking-tight text-slate-550 bg-slate-50/50 border border-slate-200/40 rounded-lg py-1 px-2.5 mt-1.5 transition-all">
                    {selectedMainTab === 'ai-ingestor' && (language === 'th' ? '📸 1. สแกนสลิปด้วย AI' : '📸 1. Scan Slip with AI')}
                    {selectedMainTab === 'dashboard' && (language === 'th' ? '📊 2. แดชบอร์ดสรุปสถิติ' : '📊 2. Stat Summary Dashboard')}
                    {selectedMainTab === 'timeline' && (language === 'th' ? '🕒 3. ไทม์ไลน์บันทึกประวัติ' : '🕒 3. History Timeline')}
                    {selectedMainTab === 'goals-standards' && (language === 'th' ? '🎯 เป้าหมายและมาตรฐาน' : '🎯 Goals & Standards')}
                    {selectedMainTab === 'settings' && (language === 'th' ? '⚙️ การตั้งค่าระบบ' : '⚙️ System Settings')}
                  </div>

                  {/* Small Menu Item for Goals & Standards */}
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setSelectedMainTab('goals-standards');
                        setSearchQuery('');
                      }}
                      className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl transition-all cursor-pointer ${
                        selectedMainTab === 'goals-standards'
                          ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold'
                      }`}
                      id="menu-goals-standards"
                    >
                      <div className="flex items-center gap-2">
                        <span>🎯</span>
                        <span>{language === 'th' ? 'เป้าหมายและมาตรฐาน' : 'Goals & Standards'}</span>
                      </div>
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-bold font-mono">
                        GOALS
                      </span>
                    </button>
                  </div>


                  {/* Settings toggles */}
                  <div className="pt-3 border-t border-slate-100 mt-2 space-y-1.5 text-center">
                    <button
                      onClick={() => {
                        setSelectedMainTab('settings');
                        setSearchQuery('');
                      }}
                      className={`w-full text-center text-[10px] py-1 block cursor-pointer transition-all ${
                        selectedMainTab === 'settings' 
                        ? 'text-indigo-600 font-bold bg-indigo-50 rounded-lg' 
                        : 'text-slate-500 hover:text-indigo-600'
                      }`}
                    >
                      {language === 'th' ? '⚙️ การตั้งค่าระบบ (Settings)' : '⚙️ System Settings'}
                    </button>
                    <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-400 font-mono">
                      <span>{language === 'th' ? 'เปลี่ยนภาษา:' : 'Language:'}</span>
                      <button
                        onClick={() => setLanguage('th')}
                        className={`px-1.5 py-0.5 rounded ${language === 'th' ? 'bg-teal-500/10 text-teal-600 font-bold border border-teal-500/20' : 'hover:text-slate-650'}`}
                      >
                        TH 🇹🇭
                      </button>
                      <button
                        onClick={() => setLanguage('en')}
                        className={`px-1.5 py-0.5 rounded ${language === 'en' ? 'bg-teal-500/10 text-teal-600 font-bold border border-teal-500/20' : 'hover:text-slate-650'}`}
                      >
                        EN 🇺🇸
                      </button>
                    </div>
                  </div>
                </nav>
              </>
            ) : (
              <>
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono">DATABASE MODULES</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-600">
                    {schemaEdition === 'legacy' ? 'v2.4' : 'v3.0'}
                  </span>
                </div>
                <nav className="p-1 space-y-1 max-h-[300px] overflow-y-auto">
                  {activeModulesList.map((mod) => (
                    <button
                      key={mod.id}
                      onClick={() => {
                        setSelectedMainTab(mod.id);
                        setSelectedSheetIndex(0);
                        setSearchQuery('');
                      }}
                      className={`w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                        selectedMainTab === mod.id && !searchQuery
                          ? 'bg-slate-900 text-white font-medium shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={selectedMainTab === mod.id && !searchQuery ? 'text-teal-400' : 'text-slate-500'}>
                          {getIcon(mod.icon, 'w-4.5 h-4.5')}
                        </span>
                        <span className="text-sm font-medium">{mod.name}</span>
                      </div>
                      {mod.isMain && (
                        <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20">
                          CENTRAL
                        </span>
                      )}
                    </button>
                  ))}
                </nav>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono">INTELLIGENCE & RESEARCH</span>
                </div>
                <nav className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      setSelectedMainTab('dashboard');
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                      selectedMainTab === 'dashboard' && !searchQuery
                        ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-bold shadow-md scale-[1.01]'
                        : 'text-slate-650 bg-teal-50/20 hover:bg-teal-50/70 border-l-4 border-teal-500 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className={`w-4.5 h-4.5 ${selectedMainTab === 'dashboard' ? 'text-white' : 'text-teal-500'}`} />
                      <span className="text-sm font-medium">Real-Time KPI Dashboard</span>
                    </div>
                    <span className="text-[8px] font-mono bg-teal-500 text-slate-950 px-1 py-0.5 rounded uppercase leading-none font-black animate-pulse">
                      NEW
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedMainTab('peer-review');
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                      selectedMainTab === 'peer-review' && !searchQuery
                        ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/10 scale-[1.01]'
                        : 'text-red-600 bg-red-50 hover:bg-red-100/70 border-l-4 border-red-500 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className={`w-4.5 h-4.5 ${selectedMainTab === 'peer-review' ? 'text-white' : 'text-red-500'}`} />
                      <span className="text-sm">10-Year Peer Review</span>
                    </div>
                    <span className="text-[8px] font-mono bg-red-500 text-white px-1 py-0.5 rounded uppercase leading-none font-black animate-pulse">
                      CRITICAL
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedMainTab('erd');
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center gap-3 text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                      selectedMainTab === 'erd' && !searchQuery
                        ? 'bg-slate-900 text-white font-medium shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Network className="w-4.5 h-4.5 text-indigo-505" />
                    <span className="text-sm font-medium">Relational ERD Mapper</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedMainTab('scale');
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center gap-3 text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                      selectedMainTab === 'scale' && !searchQuery
                        ? 'bg-slate-900 text-white font-medium shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Scale className="w-4.5 h-4.5 text-teal-500" />
                    <span className="text-sm font-medium">10-Year Scale Plan</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedMainTab('bootstrapper');
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center gap-3 text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                      selectedMainTab === 'bootstrapper' && !searchQuery
                        ? 'bg-slate-900 text-white font-medium shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Code className="w-4.5 h-4.5 text-amber-500" />
                    <span className="text-sm font-medium font-mono">Apps Script Bootstrapper</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedMainTab('ai-ingestor');
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                      selectedMainTab === 'ai-ingestor' && !searchQuery
                        ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/10 scale-[1.01]'
                        : 'text-slate-650 bg-emerald-50 hover:bg-emerald-100/70 border-l-4 border-emerald-500 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4.5 h-4.5 text-emerald-500" />
                      <span className="text-sm">AI Ingestion Engine</span>
                    </div>
                    <span className="text-[8px] font-mono bg-emerald-500 text-slate-950 px-1 py-0.5 rounded uppercase leading-none font-black animate-pulse">
                      API
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedMainTab('live-registry');
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                      selectedMainTab === 'live-registry' && !searchQuery
                        ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-bold shadow-md scale-[1.01]'
                        : 'text-slate-700 bg-indigo-50/25 hover:bg-indigo-100/50 border-l-4 border-indigo-500 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className={`w-4.5 h-4.5 ${selectedMainTab === 'live-registry' ? 'text-white' : 'text-indigo-500'}`} />
                      <span className="text-sm">Direct Sheet Registry</span>
                    </div>
                    <span className="text-[8px] font-mono bg-indigo-500 text-white px-1 py-0.5 rounded uppercase leading-none font-black animate-pulse">
                      LIVE
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedMainTab('guides');
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center gap-3 text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                      selectedMainTab === 'guides' && !searchQuery
                        ? 'bg-slate-900 text-white font-medium shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <BookOpen className="w-4.5 h-4.5 text-blue-500" />
                    <span className="text-sm font-medium">Architect Guidelines</span>
                  </button>
                </nav>
                <div className="pt-2.5 pb-2 border-t border-slate-100 mt-2">
                  <button
                    onClick={() => {
                      setIsSimplifiedMode(true);
                      if (!['live-registry', 'ai-ingestor', 'dashboard', 'timeline'].includes(selectedMainTab)) {
                        setSelectedMainTab('timeline');
                      }
                    }}
                    className="w-full text-center text-[10px] text-slate-400 hover:text-indigo-650 hover:underline font-mono py-1 block cursor-pointer transition-all"
                  >
                    🌟 สลับกลับเป็นโหมด Easy ใช้งานง่าย
                  </button>
                </div>
              </>
            )}
          </div>

          {/* SCALABILITY TIP CARD */}
          {!isSimplifiedMode && (
            <div className="bg-slate-900 text-white p-4.5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 -bottom-6 opacity-10">
                <Database className="w-36 h-36" />
              </div>
              <h4 className="text-sm font-bold text-teal-400 mb-1 flex items-center gap-1.5">
                <Info className="w-4 h-4" /> Architect Note
              </h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                Google Sheets allows 10M cells limit. TUK LIFE OS manages this efficiently by keeping detailed sub-ledgers separate, while mapping transactional updates into the compact, unified <strong>MASTER_LOGS_DB</strong> timeline.
              </p>
            </div>
          )}
        </aside>

        {/* WORKSTAGE MAIN LAYOUT */}
        <main className="flex-1 flex flex-col gap-6 overflow-hidden">
          
          <AnimatePresence mode="wait">
            
            {/* IF SHOWING SEARCH RESULTS */}
            {searchResults !== null ? (
              <motion.div
                key="search-results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Global Search Query</h2>
                    <p className="text-slate-500 text-xs">Matches for: "{searchQuery}" inside TUK LIFE OS Schema</p>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold">
                    {searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'}
                  </span>
                </div>

                {searchResults.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Search className="w-12 h-12 mx-auto stroke-1 mb-3 text-slate-300" />
                    <p className="text-sm font-medium">No direct column matches found</p>
                    <p className="text-xs text-slate-400 mt-1">Try searching "id", "timestamp", "weight" or "cost"</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {searchResults.map((res, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedMainTab(res.moduleId);
                          // Set correct active sheet based on matching query and guard against undefined module lists
                          const targetModule = activeModulesList.find((m) => m.id === res.moduleId);
                          const modIndex = targetModule ? targetModule.sheets.findIndex(
                            (s) => s.displayName === res.sheetName
                          ) : 0;
                          
                          setSelectedSheetIndex(modIndex >= 0 ? modIndex : 0);
                          setSearchQuery('');
                        }}
                        className="bg-slate-50 border border-slate-200 hover:border-teal-500/50 p-4 rounded-xl cursor-pointer transition-all group"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-slate-900 text-white font-bold px-2 py-0.5 rounded font-mono">
                              {res.col.name}
                            </span>
                            {res.col.thaiName && (
                              <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">
                                {res.col.thaiName}
                              </span>
                            )}
                            <span className="text-xs text-slate-500 font-mono italic">({res.col.type})</span>
                          </div>
                          <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold font-mono group-hover:bg-teal-500/10 group-hover:text-teal-600 transition-colors">
                            {res.moduleName} &rarr; {res.sheetName}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm mb-2">{res.col.description}</p>
                        <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-200/60 pt-2 bg-white/70 p-2 rounded-lg">
                          <div>
                            <span className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Rule:</span>{' '}
                            <code className="text-slate-700 font-mono text-[11px]">{res.col.validation}</code>
                          </div>
                          <div>
                            <span className="text-slate-400 uppercase tracking-widest text-[9px] font-bold">Example:</span>{' '}
                            <code className="text-slate-700 font-mono text-[11px]">{res.col.example}</code>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : selectedMainTab === 'peer-review' ? (
              /* PEER REVIEW AND REDESIGN VIEW */
              <motion.div
                key="peer-review-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* UPGRADE NOTIFICATION HERO */}
                <div className="bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent border border-red-500/20 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="bg-red-500 text-white p-3 rounded-xl shadow-lg shadow-red-500/10 shrink-0">
                      <AlertCircle className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] tracking-widest font-mono font-bold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full uppercase">
                        CRITICAL AUDIT & ARCHITECTURE REDESIGN
                      </span>
                      <h2 className="text-xl font-bold text-slate-800 tracking-tight">Peer Review & DB Redesign V3.0</h2>
                      <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
                        A strict review of the core TUK LIFE OS sheet schemas reveals 5 critical structural risks that will break AppSheet integration, introduce double-entry data drifts, and degrade UI responsiveness beyond 2-3 years.
                      </p>
                    </div>
                  </div>
                </div>

                {/* DB CORE EDITION SELECTION TOGGLE */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider font-mono">
                      Database Core Specification Selector
                    </h3>
                    <p className="text-slate-500 text-xs text-slate-500">
                      Choose which database specification blueprint to run across all views, calculators, schema sheets, and Apps Script compilers in this dashboard.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* STANDARD VERSION CARD */}
                    <div
                      onClick={() => setSchemaEdition('legacy')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        schemaEdition === 'legacy'
                          ? 'border-indigo-600 bg-indigo-50/20 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                            schemaEdition === 'legacy' ? 'border-indigo-600' : 'border-slate-300'
                          }`}>
                            {schemaEdition === 'legacy' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                          </span>
                          <span className="font-bold text-sm text-slate-800">Legacy Spec v2.4 (Current)</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                          SIMPLE HUB
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Features simple single-ledger <code>MASTER_LOGS_DB</code> using generic polymorphic reference columns. Prone to data divergence in financial cost items and unsupported polymorphism in AppSheet.
                      </p>
                    </div>

                    {/* REDESIGNED VERSION CARD */}
                    <div
                      onClick={() => setSchemaEdition('v3')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden ${
                        schemaEdition === 'v3'
                          ? 'border-teal-500 bg-teal-50/10 shadow-md shadow-teal-500/5'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="absolute right-0 top-0 text-[8px] font-black bg-teal-500 text-slate-950 px-2 py-0.5 rounded-bl tracking-widest font-mono uppercase">
                        RECOMMENDED
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                            schemaEdition === 'v3' ? 'border-teal-500' : 'border-slate-300'
                          }`}>
                            {schemaEdition === 'v3' && <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />}
                          </span>
                          <span className="font-bold text-sm text-slate-800">10-Year Redesigned v3.0</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold bg-teal-500 text-slate-950 px-2 py-0.5 rounded">
                          ROBUST LEDGER
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        Resolves polymorphic columns dynamically with standardized foreign keys. Unifies all costs into a single double-entry transactions sheet <code>FIN_TRANSACTIONS_V3</code>. Integrates rolling active sharding.
                      </p>
                    </div>
                  </div>
                </div>

                {/* PEER REVIEW CRITICAL DISCOVERY LIST */}
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider font-mono pt-2">
                  Identified Weaknesses & Architecture Review
                </h3>

                <div className="space-y-4">
                  {PEER_REVIEW_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl border p-6 shadow-sm space-y-4 transition-all duration-300 hover:shadow-md ${
                        item.severity === 'CRITICAL'
                          ? 'border-l-4 border-l-red-500 border-slate-200'
                          : item.severity === 'HIGH'
                          ? 'border-l-4 border-l-amber-500 border-slate-200'
                          : 'border-l-4 border-l-yellow-500 border-slate-200'
                      }`}
                    >
                      {/* WRAPPER ROW */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`text-[9px] font-black font-mono tracking-widest px-2 py-0.5 rounded ${
                            item.severity === 'CRITICAL'
                              ? 'bg-red-500 text-white'
                              : item.severity === 'HIGH'
                              ? 'bg-amber-500 text-white'
                              : 'bg-yellow-105 text-yellow-800'
                          }`}>
                            {item.severity}
                          </span>
                          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold font-mono">
                            {item.category}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono font-semibold">{item.id}</span>
                      </div>

                      {/* ISSUE CONTENT */}
                      <div className="space-y-2">
                        <h4 className="text-base font-bold text-slate-800">{item.title}</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-sans leading-relaxed">
                          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-red-500 font-bold uppercase tracking-wider text-[10px]">Diagnosed Weakness</span>
                            <p className="text-slate-700 font-medium">{item.weakness}</p>
                            <div className="pt-2 border-t border-slate-200/50 mt-2">
                              <span className="text-slate-400 font-semibold uppercase text-[9px] block">Root Cause Detail</span>
                              <p className="text-slate-600 mt-0.5">{item.why}</p>
                            </div>
                          </div>

                          <div className="space-y-1.5 p-3 rounded-xl bg-red-50/30 border border-red-100">
                            <span className="text-rose-700 font-bold uppercase tracking-wider text-[10px]">AppSheet & Maintenance Risk</span>
                            <p className="text-rose-950 font-medium">{item.risk}</p>
                          </div>
                        </div>
                      </div>

                      {/* REDESIGNED BLUEPRINT REMEDY */}
                      <div className="p-4 rounded-xl bg-teal-50/40 border border-teal-100 space-y-2 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-teal-800 uppercase tracking-widest text-[10px]">
                          <Sparkles className="w-4 h-4 text-teal-500" /> V3.0 Architectural Resolution
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium">
                          {item.redesignSolution}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* RECOMMENDATIONS SUMMARY BOX */}
                <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-sm">
                  <h3 className="font-bold text-teal-400 text-base mb-3 flex items-center gap-2">
                    <Check className="w-5 h-5 text-teal-400" /> 10+ Years Relational Engineering Action Plan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300 leading-relaxed">
                    <div className="space-y-2">
                      <span className="font-mono font-bold text-teal-400">1. UNIFY COST VECTORS</span>
                      <p>
                        Strip duplicate column costs from individual satellite sheets. Map all cash transaction parameters strictly inside <code>FIN_TRANSACTIONS_V3</code>. This guarantees instant matching status and avoids relational data drift.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <span className="font-mono font-bold text-teal-400">2. EXPLICIT RELATIONSHIPS</span>
                      <p>
                        Eliminate polymorphic references. Use independent, explicit nullable foreign keys inside the central ledger. This grants AppSheet clean static schema lookups, native dropdowns, and inverse reference subgrid insertions.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <span className="font-mono font-bold text-teal-400">3. TEMPORAL SHARDING ACTIVES</span>
                      <p>
                        Enforce a compact active-year calendar sheet (e.g. <code>MASTER_LOGS_ACTIVE</code>) limit of ~5K rows. Offload legacy chronological data automatically to static yearly archives via Apps Script to sustain immediate mobile access speeds.
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-slate-800/80 mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-slate-400 text-xs">
                      Ready to apply the redesigned architecture? Click the spec selector on top to change the browsable views in this app.
                    </p>
                    <button
                      onClick={() => {
                        setSchemaEdition('v3');
                        try {
                          if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        } catch (err) {
                          console.warn('scrollTo failed:', err);
                        }
                      }}
                      className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 uppercase tracking-wider transition-all shadow-lg shadow-teal-500/10 cursor-pointer"
                    >
                      Bootstrap Redesigned V3.0 Spec <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : selectedMainTab === 'erd' ? (
              /* RELATIONAL ERD MAPPER VIEW */
              <motion.div
                key="erd-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Network className="w-5.5 h-5.5 text-indigo-500" /> Relational Blueprint Entity Relationships
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">
                    Defines relational integrity and foreign-key references to enable 100% safe imports in AppSheet or sub-queries in Google Sheets.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* LEFT KEY CONCEPT SECTION */}
                  <div className="p-4 border border-indigo-100 bg-indigo-50/40 rounded-xl space-y-4">
                    <h3 className="font-bold text-indigo-900 text-sm uppercase tracking-wider font-mono">
                      Master Chronological Hub Principle
                    </h3>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Instead of a traditional highly segmented relational grid (which slows down Google Sheets due to cross-sheet formula dependencies), the <strong>TUK LIFE OS uses an Event-Hub architectural style</strong>.
                    </p>
                    <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside">
                      <li>
                        <strong>Primary Key Integration</strong>: Major sub-tables integrate a <code>timeline_ref</code> field.
                      </li>
                      <li>
                        <strong>Bi-directional Lookup</strong>: Connects highly structured metrics (e.g. eye prescription) to the central, chronological <code>MASTER_LOGS_DB</code> ledger.
                      </li>
                      <li>
                        <strong>Efficient AppSheet UX</strong>: Users update a fast-form, and relational hooks automatically map specific rows using standardized <code>Ref</code> configurations.
                      </li>
                    </ul>
                  </div>

                  {/* KEY PATHWAYS MAP */}
                  <div className="p-4 border border-slate-200 rounded-xl space-y-3.5 bg-slate-50">
                    <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider font-mono">
                      Active Key References (Foreign Key Maps)
                    </h3>
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-700">
                          <span>HLT_WORKOUTS</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span>MASTER_LOGS_DB</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          <code>timeline_ref</code> referencing <code>log_id</code> for calendar metrics
                        </p>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-700">
                          <span>FIN_TRANSACTIONS</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span>FIN_ACCOUNTS</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          <code>f_account_source_id</code> referencing <code>account_id</code> as wallet debit
                        </p>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-700">
                          <span>GAR_LOGS</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span>GAR_VEHICLES</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          <code>f_vehicle_id</code> referencing <code>vehicle_id</code> to track vehicle history
                        </p>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-700">
                          <span>WRK_TIME_LOGS</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span>WRK_PROJECTS</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          <code>f_project_id</code> referencing <code>project_id</code> to compile timesheets
                        </p>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-700">
                          <span>TRV_ITINERARIES</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span>TRV_TRIPS</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          <code>f_trip_id</code> referencing <code>trip_id</code> to map trip plans
                        </p>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-700">
                          <span>INV_TRANSACTIONS</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span>INV_PORTFOLIO</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          <code>f_asset_ticker</code> referencing <code>asset_ticker</code> to update positions
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RELATIONSHIP TOPOGRAPHIC VIEW */}
                <div className="p-5 border border-slate-200 rounded-xl bg-slate-50">
                  <h3 className="font-bold text-slate-800 text-sm mb-4">Relational Node Hierarchy</h3>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
                    
                    {/* HUB */}
                    <div className="bg-amber-500 text-slate-950 p-4 rounded-xl border border-amber-600 shadow-md w-full md:w-56 text-center">
                      <div className="text-xs font-bold uppercase tracking-widest opacity-80">Timeline Ledger</div>
                      <h4 className="font-mono font-black text-sm mt-1">MASTER_LOGS_DB</h4>
                      <div className="text-[10px] bg-slate-900/10 border border-slate-950/20 px-1 py-0.5 rounded mt-2 font-mono">
                        Contains All Chrono Ref Keys
                      </div>
                    </div>

                    <div className="hidden md:flex flex-col gap-1 items-center">
                      <div className="h-0.5 w-12 bg-indigo-200"></div>
                      <div className="text-[9px] font-mono text-slate-400">f_ref_keys</div>
                    </div>

                    {/* SATELLITES */}
                    <div className="grid grid-cols-2 gap-3 w-full md:flex-1">
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] font-bold text-rose-500">HEALTH</span>
                        <div className="font-mono text-xs font-bold mt-1">HLT_WORKOUTS</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] font-bold text-teal-600">GARAGE</span>
                        <div className="font-mono text-xs font-bold mt-1">GAR_LOGS</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] font-bold text-blue-500">WORK</span>
                        <div className="font-mono text-xs font-bold mt-1">WRK_TIME_LOGS</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] font-bold text-pink-500">TRAVEL</span>
                        <div className="font-mono text-xs font-bold mt-1">TRV_ITINERARIES</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] font-bold text-indigo-500">INVEST</span>
                        <div className="font-mono text-xs font-bold mt-1">INV_TRANSACTIONS</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] font-bold text-slate-700">MEDICAL</span>
                        <div className="font-mono text-xs font-bold mt-1">MED_RECORDS</div>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            ) : (!isSimplifiedMode && selectedMainTab === 'scale') ? (
              <motion.div
                key="scale-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Scale className="w-5.5 h-5.5 text-teal-500" /> 10+ Years Storage & Cell Density Calculator
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">
                    Calculate spreadsheet limits based on your planned data insertion frequencies. Avoid cell overload crashes before they happen.
                  </p>
                </div>

                {/* SLIDER SETTINGS */}
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
                  <h3 className="font-bold text-slate-700 text-sm mb-4 font-mono uppercase tracking-wider">
                    Adjust Your Operating Assumptions
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Horizon Goal: <strong>{years} Years</strong> scale</span>
                        <span className="text-slate-500">Max limit: 20 Yrs</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={years}
                        onChange={(e) => setYears(Number(e.target.value))}
                        className="w-full accent-teal-600 cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border-t border-slate-200 pt-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Timeline logs/day</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={frequency.master}
                          onChange={(e) => setFrequency({ ...frequency, master: Number(e.target.value) })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Daily Biometric entries</label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={frequency.health}
                          onChange={(e) => setFrequency({ ...frequency, health: Number(e.target.value) })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Finance Txns/day</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={frequency.finance}
                          onChange={(e) => setFrequency({ ...frequency, finance: Number(e.target.value) })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CALCULATION RESULTS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-center">
                    <span className="text-xs text-slate-500 font-medium font-mono uppercase">Estimated Total Rows</span>
                    <div className="text-3xl font-black text-slate-800 mt-1">
                      {scalingAnalysis.grandTotalRows.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">Accumulated over {years} years</span>
                  </div>

                  <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-center">
                    <span className="text-xs text-slate-500 font-medium font-mono uppercase">Calculated Cell Density</span>
                    <div className="text-3xl font-black text-teal-600 mt-1">
                      {scalingAnalysis.grandTotalCells.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">Google Sheets Cap is 10,000,000 cells</span>
                  </div>

                  <div className="bg-slate-900 text-teal-400 border border-slate-800 p-4 rounded-xl flex flex-col justify-center">
                    <span className="text-xs text-slate-400 font-medium font-mono uppercase">Spreadsheet Utilization</span>
                    <div className="text-3xl font-black mt-1">
                      {scalingAnalysis.percentageOfLimit.toFixed(2)} %
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full"
                        style={{ width: `${Math.min(scalingAnalysis.percentageOfLimit, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* ALERT */}
                <div className={`p-4 rounded-xl border text-sm flex items-start gap-3 ${
                  scalingAnalysis.percentageOfLimit > 60
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-teal-50 border-teal-100 text-teal-800'
                }`}>
                  <AlertCircle className={`w-5 h-5 shrink-0 ${scalingAnalysis.percentageOfLimit > 60 ? 'text-amber-500' : 'text-teal-600'}`} />
                  <div>
                    <h4 className="font-bold">Density Capacity Audit</h4>
                    <p className="mt-0.5 text-xs leading-relaxed opacity-90">{scalingAnalysis.alertMessage}</p>
                  </div>
                </div>

                {/* BREAKDOWN LIST */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <div className="p-3 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-mono text-xs font-bold text-slate-700">TAB-BY-TAB ESTIMATED CELL ACCUMULATIONS</h3>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto">
                    {scalingAnalysis.itemsList.map((item, idx) => (
                      <div key={idx} className="p-3 text-xs flex justify-between items-center bg-slate-50/20 hover:bg-slate-50">
                        <div>
                          <span className="font-bold text-slate-800">{item.name}</span>
                          <span className="text-slate-400 text-[10px] ml-2">({item.columnsCount} cols)</span>
                        </div>
                        <div className="text-right font-mono text-slate-600">
                          <div>{item.tenYearRows.toLocaleString()} rows</div>
                          <div className="text-[10px] text-slate-400">{item.tenYearCells.toLocaleString()} cells</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (!isSimplifiedMode && selectedMainTab === 'bootstrapper') ? (
              /* GOOGLE APPS SCRIPT CODE VIEWER */
              <motion.div
                key="bootstrapper-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Code className="w-5.5 h-5.5 text-amber-500" /> Google Apps Script Bootstrapper Code
                    </h2>
                    <p className="text-slate-500 text-xs mt-1">
                      Ready deployment script. Paste this into your Google Sheet's <strong>Extensions &gt; Apps Script</strong> to set up everything automatically in seconds.
                    </p>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-amber-400 text-xs font-bold font-mono px-3.5 py-2 rounded-lg flex items-center gap-2.5 shadow-sm transition-all focus:ring-2 focus:ring-amber-500/30 cursor-pointer self-start sm:self-auto"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-teal-400" /> Copied Script!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Code
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 border border-blue-100 bg-blue-50/40 rounded-xl">
                  <h4 className="text-xs font-bold text-blue-800 flex items-center gap-1.5 uppercase font-mono tracking-wide">
                    <Info className="w-4 h-4 text-blue-600" /> Deployment Steps
                  </h4>
                  <ol className="text-xs text-slate-600 mt-2 list-decimal list-inside space-y-1 leading-relaxed">
                    <li>Create a brand new blank spreadsheet on Google Sheets.</li>
                    <li>Go to the menu <strong>Extensions &gt; Apps Script</strong>.</li>
                    <li>Delete any placeholder code and paste this entire script.</li>
                    <li>Click the <strong>Save</strong> disk icon, select <code>{schemaEdition === 'legacy' ? 'bootstrapTukLifeOSDatabase' : 'bootstrapV3RelationalOS'}</code> and press <strong>Run</strong>.</li>
                    <li>Grant the standard Sheets Drive permission popup. All relational tabs are instantly formatted with color schemes and seed samples!</li>
                  </ol>
                </div>

                {schemaEdition === 'v3' && (
                  <div className="p-5 border border-amber-105 bg-amber-50/10 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase font-mono tracking-wide">
                      <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" /> OCR + AI Zero-Touch Ingestion Workflow
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Our redesigned V3 engine includes a fully automated <strong>Photo &rarr; Google Drive &rarr; Gemini &rarr; Google Sheets</strong> ingestion engine. It extracts complex unstructured layouts and automatically dispatches fields into relational tables:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-1.5">
                      <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-1">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1">🍎 Food Photos</div>
                        <div className="text-[10px] text-slate-500 leading-relaxed">Extracts calories count (KCAL) and macro nutrients, registering diet inputs in health metrics.</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-1">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1">🧾 Receipts</div>
                        <div className="text-[10px] text-slate-500 leading-relaxed">Captures grand total expense, vendor title, taxes, and items breakdown into transactions.</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-1">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1">💵 Bills</div>
                        <div className="text-[10px] text-slate-500 leading-relaxed">Extracts recurring invoices, due dates, account codes, and queues warning flags on unpaid balances.</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-1">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1">📂 Documents</div>
                        <div className="text-[10px] text-slate-500 leading-relaxed">Processes memos/certificates, indexing full OCR abstracts and tag sequences in chronicles.</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-100 space-y-1">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1">🚗 Vehicle Docs</div>
                        <div className="text-[10px] text-slate-500 leading-relaxed">Scans license plate numbers, updates tax/insurance expiration dates, and populates garage logs.</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-amber-800 font-mono mt-1 pt-1.5 border-t border-amber-100/50">
                      ℹ️ <strong>Activation Prompt:</strong> Add your Gemini API Key in Apps Script <i>Project Settings (⚙️) &rarr; Script Properties</i> as <code>GEMINI_API_KEY</code>. Upload photos directly to Drive, and execute <code>processPendingInboxItemsWithGemini</code>.
                    </div>
                  </div>
                )}

                <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-950">
                  <div className="bg-slate-900 px-4 py-2 flex justify-between items-center text-xs text-slate-400 font-mono border-b border-slate-800">
                    <span>{schemaEdition === 'legacy' ? 'TUK_LIFE_BOOTSTRAP_v2.4.js' : 'TUK_LIFE_BOOTSTRAP_v3.0.js'}</span>
                    <span className="text-teal-400">javascript</span>
                  </div>
                  <pre className="p-4 overflow-x-auto text-[11px] leading-relaxed font-mono text-slate-300 max-h-[500px]">
                    <code>{activeScript}</code>
                  </pre>
                </div>
              </motion.div>
            ) : selectedMainTab === 'ai-ingestor' ? (
              <motion.div
                key="ai-ingestor-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6"
              >
                <AiIngestor
                  isSimplifiedMode={isSimplifiedMode}
                  onCustomizeScript={(seeds) => {
                    setCustomSeeds(seeds);
                  }}
                />
              </motion.div>
            ) : selectedMainTab === 'settings' ? (
              <motion.div
                key="settings-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-500" />
                    {language === 'th' ? 'การตั้งค่าระบบ' : 'System Settings'}
                  </h2>
                  <LiveRegistry 
                    isSimplifiedMode={false} 
                    language={language}
                    isSyncing={isSyncing}
                    lastSyncedTime={lastSyncedTime}
                    syncTimer={syncTimer}
                    triggerAutoSync={triggerAutoSync}
                  />
                  <BackupManager language={language} />
                  <DeveloperCenter language={language} />
                  <AuditLogViewer language={language} />
                  <DataHealthChecker language={language} />
                  <RepairCenter language={language} />
                  
                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                    <h3 className="text-xs font-bold text-slate-800">Sync Controls</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Auto-Sync (5 mins)</span>
                      <button
                        onClick={() => setIsAutoSyncEnabled(!isAutoSyncEnabled)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${isAutoSyncEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-600'}`}
                      >
                        {isAutoSyncEnabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-800 mb-3">Advanced Developer Tools</h3>
                    <button
                      onClick={() => setIsSimplifiedMode(false)}
                      className="w-full text-center text-xs text-slate-500 hover:text-indigo-600 hover:underline font-mono py-2 block cursor-pointer transition-all border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100"
                    >
                      {language === 'th' ? '⚙️ เข้าสู่โหมดนักพัฒนา (Developer Mode)' : '⚙️ Enter Developer Mode'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : selectedMainTab === 'timeline' ? (
              <motion.div
                key="timeline-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <TimelineLedger
                  language={language}
                  isSimplifiedMode={isSimplifiedMode}
                />
              </motion.div>
            ) : selectedMainTab === 'dashboard' ? (
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <KpiDashboard isSimplifiedMode={isSimplifiedMode} language={language} onNavigateToTimeline={() => setSelectedMainTab('timeline')} />
              </motion.div>
            ) : selectedMainTab === 'goals-standards' ? (
              <motion.div
                key="goals-standards-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
              >
                <GoalsAndStandards language={language} />
              </motion.div>
            ) : selectedMainTab === 'knowledge-base' ? (
              <motion.div
                key="knowledge-base-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
              >
                <KnowledgeBase />
              </motion.div>
            ) : selectedMainTab === 'guides' ? (
              /* BEST PRACTICES & COMPATIBILITY ARTIFACTS */
              <motion.div
                key="guides-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6"
              >
                {/* Hub Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-5 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <BookOpen className="w-5.5 h-5.5 text-teal-600" /> TUK LIFE OS Operational Manuals Hub
                    </h2>
                    <p className="text-slate-500 text-xs mt-1">
                      Interactive system documentation, architectural audit map, and cloud-to-mobile operating guidelines.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setGuideSubTab('manual')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        guideSubTab === 'manual'
                          ? 'bg-slate-900 text-white shadow-sm font-bold'
                          : 'text-slate-650 hover:text-slate-900'
                      }`}
                    >
                      📖 User Manual
                    </button>
                    <button
                      onClick={() => setGuideSubTab('audit')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        guideSubTab === 'audit'
                          ? 'bg-slate-900 text-white shadow-sm font-bold'
                          : 'text-slate-650 hover:text-slate-900'
                      }`}
                    >
                      🔎 Audit & Answers
                    </button>
                    <button
                      onClick={() => setGuideSubTab('appsheet')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        guideSubTab === 'appsheet'
                          ? 'bg-slate-900 text-white shadow-sm font-bold'
                          : 'text-slate-650 hover:text-slate-900'
                      }`}
                    >
                      🛠️ AppSheet Setup
                    </button>
                    <button
                      onClick={() => setGuideSubTab('mobile')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        guideSubTab === 'mobile'
                          ? 'bg-slate-900 text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      📱 Mobile Guide
                    </button>
                    <button
                      onClick={() => setGuideSubTab('admin')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        guideSubTab === 'admin'
                          ? 'bg-slate-900 text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🛡️ Admin Manual
                    </button>
                    <button
                      onClick={() => setGuideSubTab('workflows')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        guideSubTab === 'workflows'
                          ? 'bg-slate-900 text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🔄 Workflows
                    </button>
                    <button
                      onClick={() => setGuideSubTab('troubleshoot')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        guideSubTab === 'troubleshoot'
                          ? 'bg-slate-900 text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🔧 Troubleshooting
                    </button>
                    <button
                      onClick={() => setGuideSubTab('backup')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        guideSubTab === 'backup'
                          ? 'bg-slate-900 text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      💾 Backup
                    </button>
                    <button
                      onClick={() => setGuideSubTab('roadmap')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        guideSubTab === 'roadmap'
                          ? 'bg-slate-900 text-white shadow-sm font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🔮 Roadmap
                    </button>
                  </div>
                </div>

                {/* Tab Content Display */}
                <div className="space-y-6">

                  {/* SUBTAB 1: ARCHITECT ARCHITECTURE AUDIT & ANSWERS */}
                  {guideSubTab === 'audit' && (
                    <div className="space-y-6 animate-fade-in text-slate-700">
                      {/* Executive Summary */}
                      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
                        <h3 className="font-bold text-teal-400 text-sm flex items-center gap-1.5 font-mono uppercase tracking-wider">
                          🔎 TUK LIFE OS v3.0 Deep Architectural Audit
                        </h3>
                        <p className="text-slate-350 text-xs leading-relaxed">
                          A rigorous analysis of current system boundaries, over-engineered aspects, maintenance risks, and scaling characteristics. This audit evaluates sheet configurations, OCR data structures, audit strategies, and recommends clean modifications.
                        </p>
                      </div>

                      {/* 5 Core Questions */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 text-sm font-mono uppercase border-b border-slate-100 pb-2">
                          Part I: Critical Architectural Questions
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1">
                              <span className="bg-teal-100 text-teal-800 text-[10px] font-mono px-1.5 py-0.5 rounded">Q1</span> 
                              What is missing from the current system?
                            </h5>
                            <ul className="text-xs text-slate-600 mt-2.5 space-y-1.5 list-disc list-inside leading-relaxed">
                              <li><strong>Offline Mutation Reconciliation Queue:</strong> No mechanism to resolve data synchronization overlaps when updating log rows while offline.</li>
                              <li><strong>AI Parser Fallback Handlers:</strong> No clean default layout or form to handle image files when the Gemini API returns failed extractions or times out due to cellular dropouts.</li>
                              <li><strong>Automated Finance Deduplicator:</strong> Lacks an automatic matching sheet between master logs and sub-ledger cards, which can lead to double-counted meal purchases.</li>
                            </ul>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1">
                              <span className="bg-teal-100 text-teal-800 text-[10px] font-mono px-1.5 py-0.5 rounded">Q2</span>
                              What parts are over-engineered or unnecessary?
                            </h5>
                            <ul className="text-xs text-slate-600 mt-2.5 space-y-1.5 list-disc list-inside leading-relaxed">
                              <li><strong>Granular Lookup Classes:</strong> Storing dental and eyecare subtopics inside a standalone lookup hierarchy instead of a flexible consolidated medical category tab.</li>
                              <li><strong>Dual Master Cache Buffering:</strong> Maintaining separate active and archive schemas to serve short-term data, which adds query complexity. Active filters can be handled on a single table using AppSheet views instead.</li>
                              <li><strong>Overly Complex Validation Enums:</strong> Strict string-matching rules inside spreadsheet cells that prevent manual quick entries.</li>
                            </ul>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1">
                              <span className="bg-teal-100 text-teal-800 text-[10px] font-mono px-1.5 py-0.5 rounded">Q3</span>
                              What parts present maintenance risks after 3-5 years?
                            </h5>
                            <ul className="text-xs text-slate-600 mt-2.5 space-y-1.5 list-disc list-inside leading-relaxed">
                              <li><strong>Brittle Column Layout References:</strong> Apps Script formulas targeting exact numerical coordinates (e.g. <code>Range(row, 4)</code>) will fail instantly if columns are moved or inserted.</li>
                              <li><strong>Inline Script Quota Failures:</strong> Relying on simple script triggers inside Google Sheets. These often fail or hit execution timeouts as the dataset grows over time.</li>
                              <li><strong>Drive File Nesting Degradation:</strong> Nested folder reference lookups will slow down dramatically when folders grow past thousands of image attachments.</li>
                            </ul>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1">
                              <span className="bg-teal-100 text-teal-800 text-[10px] font-mono px-1.5 py-0.5 rounded">Q4</span>
                              What parts will cause problems when scaling to 100K+ records?
                            </h5>
                            <ul className="text-xs text-slate-600 mt-2.5 space-y-1.5 list-disc list-inside leading-relaxed">
                              <li><strong>Spreadsheet Cell Limits:</strong> Google Sheets reaches its maximum cell and formula performance past 1 million cells, causing AppSheet sync operations to timeout.</li>
                              <li><strong>Concurrent Webhook Locking:</strong> Serial write locks in Apps Script triggers will fail when multiple logs or image streams arrive simultaneously.</li>
                              <li><strong>Unindexed Search Queries:</strong> Scanning across large raw text cells on mobile device applications will lag without indexed master columns.</li>
                            </ul>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-3">
                          <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1">
                            <span className="bg-teal-100 text-teal-800 text-[10px] font-mono px-1.5 py-0.5 rounded">Q5</span>
                            What data belongs in MASTER_LOGS versus dedicated sub-sheets?
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2.5 text-xs">
                            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                              <h6 className="font-bold text-teal-700">📋 Stored in MASTER_LOGS:</h6>
                              <ul className="list-disc list-inside space-y-1 text-slate-600">
                                <li>Chronological tracker events ("Went running", "Arrived at office")</li>
                                <li>Basic daily food logs with calorie counts</li>
                                <li>Ad-hoc quick text entries and standard emotion codes</li>
                                <li>Fast tracking indicators (Weight, Mood Index, Steps count)</li>
                              </ul>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                              <h6 className="font-bold text-amber-700">📂 Stored in Dedicated Sub-Sheets:</h6>
                              <ul className="list-disc list-inside space-y-1 text-slate-600">
                                <li>Detailed financial ledger items with payment fields</li>
                                <li>Deep vehicle health check records and fuel diagnostics</li>
                                <li>Detailed laboratory medical results and prescriptions</li>
                                <li>Document attachments and full JSON metadata buffers</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* System Components Review */}
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 text-sm font-mono uppercase border-b border-slate-100 pb-2">
                          Part II: Core Ingestion & Storage Review
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                          <div className="bg-white border border-slate-200 p-4.5 rounded-xl space-y-2">
                            <div className="font-bold text-slate-800 flex items-center gap-1">📂 Storage & DB Design</div>
                            <p className="text-slate-500 leading-relaxed">
                              The tabular structure relies on standard spreadsheet tabs. It lacks index caches, primary key autogeneration, and relational database integrity features. Added columns easily disrupt standard AppSheet layout grids.
                            </p>
                            <div className="text-[10px] text-amber-700 font-mono font-semibold">⚠️ Deficit: Formula recalculations lag on large tables.</div>
                          </div>

                          <div className="bg-white border border-slate-200 p-4.5 rounded-xl space-y-2">
                            <div className="font-bold text-slate-800 flex items-center gap-1">🤖 AI Inbox & OCR Workflow</div>
                            <p className="text-slate-500 leading-relaxed">
                              AppSheet sends files to Google Drive, triggering Apps Script to call Gemini for JSON extraction. If files upload slowly or have poor quality, processing fails silently with no status message in the queue.
                            </p>
                            <div className="text-[10px] text-amber-700 font-mono font-semibold">⚠️ Deficit: Apps Script quota limits block batched file uploads.</div>
                          </div>

                          <div className="bg-white border border-slate-200 p-4.5 rounded-xl space-y-2">
                            <div className="font-bold text-slate-800 flex items-center gap-1">💾 Backup & Audit Logs</div>
                            <p className="text-slate-500 leading-relaxed">
                              Audit logging tracks basic edits. Backups are entirely manual, requiring the administrator to copy files. It lacks point-in-time recovery, schema diff tracking, and automatic file compression.
                            </p>
                            <div className="text-[10px] text-amber-700 font-mono font-semibold">⚠️ Deficit: Cleared browser histories risk local change data.</div>
                          </div>
                        </div>
                      </div>

                      {/* Recommended Architectural Upgrades */}
                      <div className="bg-teal-50 border border-teal-200 p-4.5 rounded-xl text-xs space-y-2 text-teal-900 font-sans leading-relaxed">
                        <h4 className="font-bold text-teal-950 flex items-center gap-1">
                          ⚙️ Strategic Architectural Upgrades (Non-destructive)
                        </h4>
                        <ul className="list-decimal list-inside space-y-1.5 text-teal-800">
                          <li><strong>Column-Index Isolation:</strong> Modify the Apps Script code to fetch cells dynamically by column name string lookovers instead of hardcoded column address sequences.</li>
                          <li><strong>Asynchronous Extraction Queue:</strong> Change the OCR processing mechanism to run on a background timer, preventing lock-ups during concurrent mobile uploads.</li>
                          <li><strong>Automatic Yearly Database Partitions:</strong> Automatically split logs by year into sister spreadsheets (e.g. <code>Logs_2026</code>) to maintain fast performance on mobile.</li>
                          <li><strong>Offline Fallbacks:</strong> Cache user edits locally in AppSheet, uploading them with custom sync tags once a network connection is established.</li>
                        </ul>
                      </div>
                    </div>
                  )}


                  {/* SUBTAB 2: COMPLETE BEGINNER-FRIENDLY USER MANUAL */}
                  {guideSubTab === 'mobile' && (
                    <div className="space-y-6 animate-fade-in font-sans">
                      <div className="bg-emerald-50 text-emerald-990 bg-emerald-50/70 border border-emerald-100 p-4.5 rounded-2xl">
                        <h3 className="font-bold text-xs text-emerald-900 font-mono uppercase tracking-wide flex items-center gap-1.5">
                          📱 Quick Guide: How to use TUK LIFE OS Daily on Mobile
                        </h3>
                        <p className="text-xs mt-1 text-emerald-800">
                          A simple, step-by-step operating guide designed for non-technical users. Clean instructions with clear warnings tell you exactly how to manage your daily logs.
                        </p>
                      </div>

                      <div className="space-y-5 text-sm font-sans text-slate-600">
                        {/* 1. Add Life Log */}
                        <div className="border border-slate-150 rounded-xl p-4.5 bg-white space-y-2">
                          <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 font-mono">
                            <span className="bg-teal-100 text-teal-900 px-2 py-0.5 rounded text-[10px]">Step 01</span> 
                            How to Add a New Life Log
                          </h4>
                          <ol className="list-decimal list-inside text-xs space-y-1 pl-1 leading-relaxed text-slate-600">
                            <li>Launch the <strong>AppSheet app</strong> on your mobile phone.</li>
                            <li>Tap the <strong>Life Logs</strong> button in the bottom navigation menu.</li>
                            <li>Click the floating <strong>New Log (+ Add)</strong> icon at the bottom right of the screen.</li>
                            <li>Select a primary category (e.g., <code>HEALTH</code>, <code>TRAVEL</code>, <code>WORK</code>) from the dropdown list.</li>
                            <li>Type your status check-in or feeling description in the <strong>Notes</strong> text container, and hit <strong>Save</strong>.</li>
                          </ol>
                        </div>

                        {/* 2. Add Food records */}
                        <div className="border border-slate-150 rounded-xl p-4.5 bg-white space-y-2">
                          <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 font-mono">
                            <span className="bg-teal-100 text-teal-900 px-2 py-0.5 rounded text-[10px]">Step 02</span> 
                            How to Log Food & Diet Records
                          </h4>
                          <ol className="list-decimal list-inside text-xs space-y-1 pl-1 leading-relaxed text-slate-600">
                            <li>Navigate to the <strong>HEALTH Roster</strong> tab on your dashboard.</li>
                            <li>Select the <strong>Food Journal</strong> section and tap the <strong>+ icon</strong>.</li>
                            <li>Specify the dish name, meal type (e.g. Breakfast, Lunch, Dinner, Snack), and estimated calorie counts.</li>
                            <li>Input water consumption (e.g., 500 mL) to keep your hydration levels updated.</li>
                            <li>Press <strong>Save</strong>. Your progress calculations will refresh on your dashboard instantly!</li>
                          </ol>
                        </div>

                        {/* 3 & 4. Upload photo / Scan Receipt */}
                        <div className="border border-slate-150 rounded-xl p-4.5 bg-white space-y-2">
                          <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 font-mono">
                            <span className="bg-teal-100 text-teal-900 px-2 py-0.5 rounded text-[10px]">Steps 03 & 04</span> 
                            How to Scan Receipts & Upload Food Photos
                          </h4>
                          <ol className="list-decimal list-inside text-xs space-y-1 pl-1 leading-relaxed text-slate-600">
                            <li>Open the <strong>AI Intake Inbox</strong> tab at the bottom menu.</li>
                            <li>Tap the <strong>Camera</strong> icon to launch your mobile phone camera, or select <strong>Upload File</strong> to choose an image from your gallery.</li>
                            <li><strong>For Receipts:</strong> Lay the bill flat under good lighting and snap a clear photo showing the vendor name, prices, and the total amount.</li>
                            <li><strong>For Food:</strong> Capture your meal directly from above before eating so the food items are clearly visible.</li>
                            <li>Click <strong>Save Snapshot</strong>. The AI processing engine will automatically begin parsing the image in the background.</li>
                          </ol>
                        </div>

                        {/* 5 & 6. Review & Edit AI Data */}
                        <div className="border border-slate-150 rounded-xl p-4.5 bg-white space-y-2">
                          <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 font-mono">
                            <span className="bg-teal-100 text-teal-905 bg-teal-100 text-teal-900 px-2 py-0.5 rounded text-[10px]">Steps 05 & 06</span> 
                            How to Review and Edit AI-Extracted Records
                          </h4>
                          <ol className="list-decimal list-inside text-xs space-y-1 pl-1 leading-relaxed text-slate-600">
                            <li>Go to the <strong>Peer-Review Inbox</strong> tab. Items parsed by AI will appear with a yellow status dot.</li>
                            <li>Select the newly uploaded item to open the details view.</li>
                            <li><strong>Review the Extracted Data:</strong> Check fields like <em>Extracted Cost</em>, <em>Vendor Title</em>, and <em>Suggested Category</em> against your receipt image.</li>
                            <li><strong>Fix Incorrect Values:</strong> Tap the <strong>Edit (Pencil)</strong> icon inside the form if the AI misread any fields (e.g. mistaking 180 THB for 190 THB). Correct the value manually and hit <strong>Apply Changes</strong>.</li>
                            <li>Tap the green <strong>Approve & Push</strong> button to transfer the item to the persistent master log.</li>
                          </ol>
                        </div>

                        {/* 7. Delete & Archive */}
                        <div className="border border-slate-150 rounded-xl p-4.5 bg-white space-y-2">
                          <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 font-mono">
                            <span className="bg-teal-100 text-teal-900 px-2 py-0.5 rounded text-[10px]">Step 07</span> 
                            How to Archive or Delete Old Records
                          </h4>
                          <ol className="list-decimal list-inside text-xs space-y-1 pl-1 leading-relaxed text-slate-600">
                            <li>Select the specific log item you wish to remove from your roster.</li>
                            <li>To remove it completely, click the red <strong>Delete Trash</strong> icon and confirm your choice.</li>
                            <li>To preserve structural integrity, we recommend changing the status dropdown to <strong>ARCHIVED</strong> instead of deleting it. This hides the item from active views but keeps it available for historical counts.</li>
                          </ol>
                        </div>

                        {/* 8 & 9. Search & Dashboard */}
                        <div className="border border-slate-150 rounded-xl p-4.5 bg-white space-y-2">
                          <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 font-mono">
                            <span className="bg-teal-100 text-teal-905 bg-teal-100 text-teal-900 px-2 py-0.5 rounded text-[10px]">Steps 08 & 09</span> 
                            How to Search Old Records & View Dashboard
                          </h4>
                          <ol className="list-decimal list-inside text-xs space-y-1 pl-1 leading-relaxed text-slate-600">
                            <li><strong>Search Records:</strong> Tap the <strong>Magnifying Glass</strong> icon in your application header, enter search words (e.g. "Oil maintenance" or "Pizza"), and see instant, categorized results.</li>
                            <li><strong>View Dashboard summaries:</strong> Tap the <strong>Dashboard KPIs</strong> tab in the bottom bar to see active spend metrics, monthly calorie graphs, and check-in streak trends.</li>
                          </ol>
                        </div>

                        {/* 10 & 11. Sync & Backup */}
                        <div className="border border-slate-150 rounded-xl p-4.5 bg-white space-y-2">
                          <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 font-mono">
                            <span className="bg-teal-100 text-teal-900 px-2 py-0.5 rounded text-[10px]">Steps 10 & 11</span> 
                            How to Sync Custom Records & Run Google Sheets Backups
                          </h4>
                          <ol className="list-decimal list-inside text-xs space-y-1 pl-1 leading-relaxed text-slate-600">
                            <li><strong>Sheet Syncing:</strong> Mobile changes are saved locally first. Tap the circular <strong>Sync Arrow (🔄)</strong> in your AppSheet toolbar to sync your updates to Google Sheets instantly.</li>
                            <li><strong>Backup Spreadsheet Data:</strong> Log in to Google Drive on a tablet or desktop browser, copy the main database file, and rename it with your backup date (e.g., <code>TUK_LIFE_DB_Backup_20260622</code>).</li>
                          </ol>
                        </div>

                        {/* 12. Common Mistakes */}
                        <div className="border border-amber-200 rounded-xl p-4.5 bg-amber-50/50 space-y-2 text-amber-950">
                          <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1.5 font-mono">
                            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px]">Step 12</span> 
                            Avoiding Common Mistakes (Non-Technical Rules)
                          </h4>
                          <ul className="text-xs space-y-2 list-none">
                            <li><strong>❌ Writing notes inside the ID fields:</strong> Keep ID inputs clean like <code>TL-2026-001</code>. AppSheet uses this format to link records together. Do not write text descriptors like "Chicken" in ID boxes.</li>
                            <li><strong>❌ Taking blurry photos inside dark cars:</strong> AI engines cannot read blurry or dark photos. Turn on the car cabin light or place your receipt on a lit surface before snapping a photo.</li>
                            <li><strong>❌ Edits inside locked sheet cells:</strong> Don't modify the formulas grey columns on Google Sheets. This will break the automated AppSheet dashboards. Always apply your edits through the mobile app interface instead.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}


                  {/* SUBTAB 3: SYSTEM ADMINISTRATOR MANUAL */}
                  {guideSubTab === 'admin' && (
                    <div className="space-y-6 animate-fade-in font-sans">
                      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-805 border-slate-800 space-y-2">
                        <h3 className="font-bold text-teal-400 text-xs font-mono uppercase tracking-wide">
                          🛡️ TUK LIFE OS System Administrator Manual
                        </h3>
                        <p className="text-slate-300 text-xs leading-relaxed">
                          Technical instructions for managing system settings, deploying Google Apps Scripts, connecting secret keys, configuring folder pathways, and managing permissions keys.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-5 text-xs text-slate-700">
                        {/* Environment Keys */}
                        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5">
                          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 font-mono uppercase">
                            🔑 1. Environment Variables & API Credentials
                          </h4>
                          <p className="text-slate-500 leading-relaxed">
                            The AI extraction engine requires the Google Gemini model. To set this up, you must configure your API keys securely inside your Google Apps Script workspace.
                          </p>
                          <div className="bg-slate-50 p-4 rounded-lg font-mono text-[11px] text-slate-800 border border-slate-200">
                            <strong>Variable Name:</strong> <code>GEMINI_API_KEY</code><br />
                            <strong>Google Sheets Setup:</strong> Open the spreadsheet, select Extensions &gt; Apps Script &gt; Project Settings (⚙️) &gt; Script Properties &gt; Click "Add script property" and paste your Google AI Key.
                          </div>
                          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <p className="text-[11px]">
                              <strong>Never share keys:</strong> Avoid hardcoding API keys in your actual Apps Script code. Script Property variables are hidden from view, even if spreadsheet tabs are shared with colleagues.
                            </p>
                          </div>
                        </div>

                        {/* Folder Paths */}
                        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 font-mono uppercase">
                            📁 2. File Organization & Google Drive Pathway Setup
                          </h4>
                          <p className="text-slate-500 leading-relaxed">
                            To ensure attachments sync correctly, the system uses specific folder structures inside Google Drive. Maintain this hierarchy to avoid breaking file paths:
                          </p>
                          <pre className="bg-slate-950 text-slate-300 p-4 rounded-xl font-mono text-[10px] space-y-1 overflow-x-auto leading-relaxed border border-slate-800">
                            {`My Google Drive/
└── TUK_LIFE_OS_WORKSPACE/
    ├── TUK_LIFE_MAIN_DATABASE.xlsx (Workbook file)
    └── Attachments_Vault/
        ├── receipts/ (Scanned invoice PDF and image files)
        ├── meals/ (User-uploaded food snapshots)
        └── medical/ (Clinical diagnostics reports)`}
                          </pre>
                        </div>

                        {/* Admin Functions */}
                        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 font-mono uppercase">
                            🎛️ 3. AppSheet Actions & Validation Overrides
                          </h4>
                          <ul className="list-disc list-inside space-y-2 text-slate-600 leading-relaxed">
                            <li><strong>Skip Parsing Triggers:</strong> To manually add receipts without using OCR processing, toggle the item status slider from <code>PENDING_OCR</code> to <code>PARSED_READY</code> upon creation. This bypasses the Apps Script trigger.</li>
                            <li><strong>Enforcing Data Integrity:</strong> Ensure lookups contain exact code keys (e.g. <code>MTR_WEIGHT</code>). If a user edits a lookups code, AppSheet reference links will break.</li>
                            <li><strong>System Table Lockouts:</strong> Mark metadata tables (like <code>SYS_LOOKUPS_V3</code>) as <em>ReadOnly</em> in AppSheet. This prevents users from accidentally deleting system codes from mobile.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}


                  {/* SUBTAB 4: DAILY WORKFLOWS & ROUTINES */}
                  {guideSubTab === 'workflows' && (
                    <div className="space-y-6 animate-fade-in font-sans">
                      <div className="bg-blue-50 text-blue-900 p-4.5 border border-blue-105 border-blue-100 rounded-2xl">
                        <h3 className="font-bold text-xs font-mono uppercase tracking-wide">
                          🔄 Daily Workflows & Systematic Routines
                        </h3>
                        <p className="text-xs mt-1 text-slate-600">
                          Short checklists to help you maintain your data throughout the day.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-slate-700">
                        {/* Morning */}
                        <div className="bg-white border border-slate-200 p-4.5 rounded-xl space-y-2.5">
                          <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                            🌅 Morning Quick Checklist (5 Minutes)
                          </h4>
                          <ul className="space-y-2 list-none">
                            <li className="flex items-start gap-1">
                              <input type="checkbox" readOnly checked className="mt-0.5 accent-teal-600" />
                              <span>Log morning weight and sleep metrics under <strong>HEALTH &gt; Daily Metrics</strong>.</span>
                            </li>
                            <li className="flex items-start gap-1">
                              <input type="checkbox" readOnly checked className="mt-0.5 accent-teal-600" />
                              <span>Log vitamins or medications taken in the morning logs.</span>
                            </li>
                            <li className="flex items-start gap-1">
                              <input type="checkbox" readOnly checked className="mt-0.5 accent-teal-600" />
                              <span>Tap the <strong>🔄 Sync button</strong> in AppSheet to fetch updates from Google Sheets.</span>
                            </li>
                          </ul>
                        </div>

                        {/* Midday */}
                        <div className="bg-white border border-slate-200 p-4.5 rounded-xl space-y-2.5">
                          <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                            ☀️ Lunch & Midday Updates (3 Minutes)
                          </h4>
                          <ul className="space-y-2 list-none">
                            <li className="flex items-start gap-1">
                              <input type="checkbox" readOnly checked className="mt-0.5 accent-teal-600" />
                              <span>Take a photo of your lunch and upload it in the <strong>AI Intake Inbox</strong>.</span>
                            </li>
                            <li className="flex items-start gap-1">
                              <input type="checkbox" readOnly checked className="mt-0.5 accent-teal-600" />
                              <span>Log any fuel card purchases or parking fees on your mid-day commute.</span>
                            </li>
                          </ul>
                        </div>

                        {/* Evening */}
                        <div className="bg-white border border-slate-200 p-4.5 rounded-xl space-y-2.5">
                          <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                            🌌 Evening Review Routine (10 Minutes)
                          </h4>
                          <ul className="space-y-2 list-none">
                            <li className="flex items-start gap-1">
                              <input type="checkbox" readOnly checked className="mt-0.5 accent-teal-600" />
                              <span>Open your food log and review your total steps and daily calorie count.</span>
                            </li>
                            <li className="flex items-start gap-1">
                              <input type="checkbox" readOnly checked className="mt-0.5 accent-teal-600" />
                              <span>Go to the <strong>Peer-Review Inbox</strong> to approve receipts and verify transaction details.</span>
                            </li>
                            <li className="flex items-start gap-1">
                              <input type="checkbox" readOnly checked className="mt-0.5 accent-teal-600" />
                              <span>Press the sync icon to save your daily logs to your primary database spreadsheet.</span>
                            </li>
                          </ul>
                        </div>

                        {/* Weekend */}
                        <div className="bg-white border border-slate-200 p-4.5 rounded-xl space-y-2.5">
                          <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                            🎉 Weekend Administration Routine (15 Minutes)
                          </h4>
                          <ul className="space-y-2 list-none">
                            <li className="flex items-start gap-1">
                              <input type="checkbox" readOnly checked className="mt-0.5 accent-teal-600" />
                              <span>Create a copy of your main spreadsheet to back up your weekly updates.</span>
                            </li>
                            <li className="flex items-start gap-1">
                              <input type="checkbox" readOnly checked className="mt-0.5 accent-teal-600" />
                              <span>Review your weekly dashboards and budget saving trends.</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}


                  {/* SUBTAB 5: REFINED TROUBLESHOOTING MATRIX */}
                  {guideSubTab === 'troubleshoot' && (
                    <div className="space-y-6 animate-fade-in text-slate-705 text-slate-700">
                      <div className="bg-rose-50 text-rose-950 p-4.5 border border-rose-100 rounded-2xl">
                        <h3 className="font-bold text-xs font-mono uppercase tracking-wide flex items-center gap-1.5">
                          🔧 Practical Troubleshooting Matrix
                        </h3>
                        <p className="text-xs mt-1 text-slate-650 text-slate-600">
                          Quick solutions for typical system errors and synchronization issues.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                        {/* Issue 1 */}
                        <div className="bg-white border border-slate-200 p-4.5 rounded-xl space-y-2">
                          <h4 className="font-bold text-slate-800 flex items-center gap-1 text-xs">
                            ❌ 1. Photo is stuck in "PENDING_OCR" status
                          </h4>
                          <p className="text-slate-500 leading-relaxed">
                            This happens when the Apps Script fails to trigger or when Google servers experience response delays while running the Gemini API.
                          </p>
                          <div className="bg-slate-50 p-3 rounded text-slate-700 leading-relaxed border border-slate-100">
                            <strong>Step-by-step fix:</strong> Open your Google Sheet browser tab &gt; select Extensions &gt; Apps Script &gt; Click <strong>Executions</strong> to verify error codes. Ensure your API key is correctly saved in script properties.
                          </div>
                        </div>

                        {/* Issue 2 */}
                        <div className="bg-white border border-slate-200 p-4.5 rounded-xl space-y-2">
                          <h4 className="font-bold text-slate-800 flex items-center gap-1 text-xs">
                            ❌ 2. AppSheet errors: "Ref row missing target catalog"
                          </h4>
                          <p className="text-slate-500 leading-relaxed">
                            This occurs when an ID from a sub-sheet (like <code>FINANCE</code>) refers to a lookup code that was deleted or renamed in your <code>SYS_LOOKUPS_V3</code> sheet.
                          </p>
                          <div className="bg-slate-50 p-3 rounded text-slate-700 leading-relaxed border border-slate-100">
                            <strong>Step-by-step fix:</strong> Open your <code>SYS_LOOKUPS_V3</code> spreadsheet tab. Add the missing lookup code back to the list manually. Open AppSheet and press <strong>Sync</strong> to update the system references.
                          </div>
                        </div>

                        {/* Issue 3 */}
                        <div className="bg-white border border-slate-200 p-4.5 rounded-xl space-y-2">
                          <h4 className="font-bold text-slate-800 flex items-center gap-1 text-xs">
                            ❌ 3. Network timeout error during sync
                          </h4>
                          <p className="text-slate-500 leading-relaxed">
                            This is caused by an unstable network connection on your phone, or because the main Google Sheet is too large and takes too long to load.
                          </p>
                          <div className="bg-slate-50 p-3 rounded text-slate-700 leading-relaxed border border-slate-100">
                            <strong>Step-by-step fix:</strong> Find a stable Wi-Fi network and try syncing again. If the issue persists, archive old rows to clean up and reduce your spreadsheet size.
                          </div>
                        </div>

                        {/* Issue 4 */}
                        <div className="bg-white border border-slate-200 p-4.5 rounded-xl space-y-2">
                          <h4 className="font-bold text-slate-800 flex items-center gap-1 text-xs">
                            ❌ 4. Duplicate transaction entries
                          </h4>
                          <p className="text-slate-500 leading-relaxed">
                            This happens when the same receipt is approved and pushed twice from the Peer-Review Inbox.
                          </p>
                          <div className="bg-slate-50 p-3 rounded text-slate-700 leading-relaxed border border-slate-100">
                            <strong>Step-by-step fix:</strong> Find the duplicate row in your ledger, swipe left, and tap <strong>Delete Trash</strong>. Confirm the removal to correct your balance calculations.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}


                  {/* SUBTAB 6: DETAILED BACKUP & RECOVERY PLAN */}
                  {guideSubTab === 'backup' && (
                    <div className="space-y-6 animate-fade-in font-sans">
                      <div className="bg-amber-50 text-amber-955 p-4.5 border border-amber-200 rounded-2xl space-y-1">
                        <h3 className="font-bold text-xs text-amber-900 font-mono uppercase tracking-wide flex items-center gap-1.5">
                          💾 Backup Security & Disaster Recovery Guide
                        </h3>
                        <p className="text-xs pt-1 text-slate-650 text-slate-600">
                          Protocols to protect your personal data from accidental deletions or spreadsheet corruptions.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-700">
                        {/* Backup Strategies */}
                        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 font-mono uppercase">
                            📆 Backup Schedules
                          </h4>
                          
                          <div className="space-y-3">
                            <div className="border-l-2 border-teal-500 pl-3">
                              <p className="font-bold text-slate-800">1. Instant Device Sync (Hot Backup)</p>
                              <p className="text-slate-500 text-[11px] mt-0.5">
                                Your daily edits are cached on your phone storage automatically in AppSheet, and will sync back to Google Sheets once you are online.
                              </p>
                            </div>

                            <div className="border-l-2 border-teal-500 pl-3">
                              <p className="font-bold text-slate-800">2. Weekly Spreadsheet Archives (Warm Backup)</p>
                              <p className="text-slate-500 text-[11px] mt-0.5">
                                Select File &gt; Make a Copy inside Google Sheets on your desktop. Save this copy with a dated name like <code>TUK_LIFE_BACKUP_2026_06_22</code>.
                              </p>
                            </div>

                            <div className="border-l-2 border-teal-500 pl-3">
                              <p className="font-bold text-slate-800">3. Monthly Offline Downloads (Cold Backup)</p>
                              <p className="text-slate-500 text-[11px] mt-0.5">
                                Download your entire spreadsheet as a Microsoft Excel workbook (<code>.xlsx</code>) once a month, and save it on an external hard drive.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Step-by-Step Recovery steps */}
                        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5">
                          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 font-mono uppercase">
                            🔄 Disaster Recovery Step-by-Step
                          </h4>
                          <p className="text-slate-500 leading-relaxed text-[11px]">
                            If a table becomes corrupted or you accidentally delete critical database rows, follow these steps to restore your system safely:
                          </p>
                          <ol className="list-decimal list-inside space-y-2 text-slate-600 pl-1">
                            <li>Identify the exact date and time the data loss occurred.</li>
                            <li>Open your main Google Sheet workspace and choose <strong>File &gt; Version History</strong> from the menu.</li>
                            <li>Browse the saved versions sidebar on the right to select a clean version from before the data loss.</li>
                            <li>Review the preview sheet, and click <strong>Restore this version</strong>.</li>
                            <li>Open AppSheet, click top menu settings and run <strong>Regenerate Structure</strong> to refresh reference links.</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 10: NON-TECHNICAL USER HANDBOOK */}
                  {guideSubTab === 'manual' && (
                    <div className="space-y-6 animate-fade-in font-sans">
                      {/* Handbook Hero */}
                      <div className="bg-gradient-to-r from-teal-900 to-indigo-950 text-white p-6 rounded-2xl border border-teal-500/20 space-y-2">
                        <span className="text-[10px] bg-teal-400/20 text-teal-300 border border-teal-400/30 px-2.5 py-1 rounded-md font-mono uppercase tracking-wider font-semibold">
                          Layman Operating Handbook
                        </span>
                        <h3 className="font-bold text-xl text-white font-sans mt-2">
                          📖 TUK LIFE OS Complete User Manual
                        </h3>
                        <p className="text-teal-100/80 text-xs leading-relaxed max-w-2xl">
                          Welcome! This detailed manual guides you through operating your system on a daily basis. No complicated database terms, just plain and simple step-by-step instructions.
                        </p>
                      </div>

                      {/* Chapter quick filter bar */}
                      <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-3">
                        {[
                          { id: 'all', label: '🗂️ All Chapters' },
                          { id: 'daily', label: '☀️ Daily Use' },
                          { id: 'logging', label: '📝 Add, Edit & Delete' },
                          { id: 'photos', label: '📸 Photo & AI Ingestion' },
                          { id: 'dashboard', label: '📊 Reading Data' },
                          { id: 'backup', label: '💾 Safety & Backup' }
                        ].map((topic) => (
                          <button
                            key={topic.id}
                            onClick={() => setManualTopic(topic.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer font-medium transition-all ${
                              manualTopic === topic.id
                                ? 'bg-teal-50 text-teal-850 border border-teal-200 shadow-xs font-bold text-teal-800'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                          >
                            {topic.label}
                          </button>
                        ))}
                      </div>

                      {/* The Chapters */}
                      <div className="space-y-6 text-xs text-slate-700">

                        {/* CHAPTER 1: DAILY USE & ROUTINES */}
                        {(manualTopic === 'all' || manualTopic === 'daily') && (
                          <div className="bg-white border border-slate-200 rounded-xl p-5.5 space-y-4 shadow-sm">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                              <div className="bg-amber-50 p-2 rounded-lg text-amber-600 font-bold text-sm">01</div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm">☀️ Chapter 1: Daily Use & Routines</h4>
                                <p className="text-slate-500 text-[10px]">Your everyday relationship with TUK LIFE OS</p>
                              </div>
                            </div>
                            
                            <p className="text-slate-600 leading-relaxed">
                              Managing your personal metrics is all about lightweight consistency. Connecting with your app should feel like a minor reflex rather than a heavy chore. Here is your suggested <strong>3-step daily checkpoint routine</strong>:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100/65 space-y-2">
                                <span className="text-[10px] bg-amber-500/10 text-amber-700 font-bold px-2 py-0.5 rounded uppercase font-mono">1. Morning (3 Mins)</span>
                                <h5 className="font-bold text-slate-900">Health & Biometrics</h5>
                                <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px] pl-1 h-20">
                                  <li>Step on scale and input your weight.</li>
                                  <li>Log sleeping hours from your fitness tracker.</li>
                                  <li>Read your resting heart rate.</li>
                                </ul>
                              </div>
                              <div className="bg-sky-50/40 p-4 rounded-xl border border-sky-100/65 space-y-2">
                                <span className="text-[10px] bg-sky-500/10 text-sky-700 font-bold px-2 py-0.5 rounded uppercase font-mono">2. Afternoon (1 Min)</span>
                                <h5 className="font-bold text-slate-900">On-the-go Expense Logging</h5>
                                <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px] pl-1 h-20">
                                  <li>Snap a photo of your lunch receipt.</li>
                                  <li>Quickly log coffee or travel costs.</li>
                                  <li>Keep transactions current immediately.</li>
                                </ul>
                              </div>
                              <div className="bg-teal-50/40 p-4 rounded-xl border border-teal-100/65 space-y-2">
                                <span className="text-[10px] bg-teal-500/10 text-teal-700 font-bold px-2 py-0.5 rounded uppercase font-mono">3. Evening (2 Mins)</span>
                                <h5 className="font-bold text-slate-900">AI Review & Reflection</h5>
                                <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px] pl-1 h-20">
                                  <li>Open the <strong>AI Inbox</strong> on your phone.</li>
                                  <li>Approve today's food, receipts, or bills.</li>
                                  <li>Look at daily total calorie/finance counters.</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* CHAPTER 2: ADDING DATA */}
                        {(manualTopic === 'all' || manualTopic === 'logging') && (
                          <div className="bg-white border border-slate-200 rounded-xl p-5.5 space-y-4 shadow-sm">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                              <div className="bg-teal-50 p-2 rounded-lg text-teal-600 font-bold text-sm">02</div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm">📝 Chapter 2: Adding Data Instantly</h4>
                                <p className="text-slate-500 text-[10px]">How to record new items, habits, or transactions</p>
                              </div>
                            </div>
                            
                            <p className="text-slate-600 leading-relaxed">
                              You have two simple ways to write new data into your Lifespan system. Choose whichever is more convenient for where you are:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
                              <div className="border border-slate-100 p-4 rounded-xl hover:border-slate-200 transition-all space-y-3 bg-slate-50/30">
                                <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                                  <PlusCircle className="w-4 h-4 text-teal-600" /> Method A: Using your Phone App (AppSheet)
                                </h5>
                                <p className="text-slate-500 text-[11px]">Best for easy entry when you're away from home.</p>
                                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 leading-relaxed">
                                  <li>Open your AppSheet app on your mobile home screen.</li>
                                  <li>Tap the tab at the bottom representing your module (e.g. <strong>Finance</strong> or <strong>Health</strong>).</li>
                                  <li>Click the floating round blue button with a <strong>Plus (+)</strong> icon.</li>
                                  <li>Fill out the simple fields (Amount, Title, Category, Date).</li>
                                  <li>Tap the green <strong>Save</strong> button in the bottom corner of the form.</li>
                                </ol>
                              </div>
                              
                              <div className="border border-slate-100 p-4 rounded-xl hover:border-slate-200 transition-all space-y-3 bg-slate-50/30">
                                <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Method B: Typing into your Spreadsheet
                                </h5>
                                <p className="text-slate-500 text-[11px]">Best for batch listing backlog entries on your desktop browser.</p>
                                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 leading-relaxed">
                                  <li>Open Google Drive and double-click to load your main spreadsheet.</li>
                                  <li>Select the specific tab name for your table (e.g., <code>FIN_TRANSACTIONS_V3</code>).</li>
                                  <li>Scroll to the very bottom blank row level.</li>
                                  <li>Type your values cell-by-cell matching the columns (ID, Date, Type, Amount, description).</li>
                                  <li>Google Sheets automatically saves edits to the cloud instantly.</li>
                                </ol>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* CHAPTER 3: EDITING DATA */}
                        {(manualTopic === 'all' || manualTopic === 'logging') && (
                          <div className="bg-white border border-slate-200 rounded-xl p-5.5 space-y-4 shadow-sm">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                              <div className="bg-blue-50 p-2 rounded-lg text-blue-600 font-bold text-sm">03</div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm">✏️ Chapter 3: Editing Records Safely</h4>
                                <p className="text-slate-500 text-[10px]">Correcting spelling errors, dates, or values</p>
                              </div>
                            </div>
                            
                            <p className="text-slate-600 leading-relaxed">
                              Typos happen! TUK LIFE OS has safe guards preventing errors. You can correct any value at any time using these simple procedures:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
                              <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/30 space-y-3">
                                <h5 className="font-semibold text-slate-800 flex items-center gap-1.5">
                                  <Edit3 className="w-4 h-4 text-blue-600" /> In your Mobile App
                                </h5>
                                <p className="text-[11px] text-slate-500">Correct details directly through the visual phone views.</p>
                                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 leading-relaxed">
                                  <li>Navigate to the record list inside AppSheet.</li>
                                  <li>Tap on the specific row or record you need to adjust to open its detailed page.</li>
                                  <li>Tap the round <strong>Pencil icon</strong> (typically in the bottom right corner).</li>
                                  <li>Change the relevant wrong cells or text inputs inside the editing form.</li>
                                  <li>Tap <strong>Save</strong>. The change is instantly written back to the sheets!</li>
                                </ol>
                              </div>

                              <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/30 space-y-3">
                                <h5 className="font-semibold text-slate-800 flex items-center gap-1.5">
                                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> In Google Sheets (Desktop)
                                </h5>
                                <p className="text-[11px] text-slate-500">Fast inline adjustments to cells without loading standard forms.</p>
                                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 leading-relaxed">
                                  <li>Open your spreadsheet, locate the row you want to fix.</li>
                                  <li>Double-click the specific cell that contains the error.</li>
                                  <li>Type the correct text or number. Avoid changing the ID column cells as they link records together!</li>
                                  <li>Press the <strong>Enter key</strong> or click on any other cell.</li>
                                  <li>The data updates and propagates in seconds.</li>
                                </ol>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* CHAPTER 4: DELETING DATA */}
                        {(manualTopic === 'all' || manualTopic === 'logging') && (
                          <div className="bg-white border border-slate-200 rounded-xl p-5.5 space-y-4 shadow-sm">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                              <div className="bg-rose-50 p-2 rounded-lg text-rose-600 font-bold text-sm">04</div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm">🗑️ Chapter 4: Deleting Mistakes</h4>
                                <p className="text-slate-500 text-[10px]">Removing double-logs or unwanted historic entries</p>
                              </div>
                            </div>
                            
                            <p className="text-slate-600 leading-relaxed">
                              If you accidentally entered a record twice or want to completely remove a mistaken row:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
                              <div className="border border-rose-100/50 p-4 rounded-xl bg-rose-50/10 space-y-3">
                                <h5 className="font-semibold text-slate-800 flex items-center gap-1.5">
                                  <Trash2 className="w-4 h-4 text-rose-600" /> Option A: Mobile App Delete
                                </h5>
                                <p className="text-[11px] text-slate-500">The easiest and safest way to clean up records.</p>
                                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 leading-relaxed">
                                  <li>Tap the record list item to enter its details screen.</li>
                                  <li>Scroll or locate the <strong>Trash Can icon</strong> in the top-right corner.</li>
                                  <li>A confirmation popup will ask: <i>"Are you sure you want to delete this?"</i>.</li>
                                  <li>Tap <strong>Delete</strong>. AppSheet will mark the sync process and delete the row in Google Sheets automatically.</li>
                                </ol>
                              </div>

                              <div className="border border-rose-100/50 p-4 rounded-xl bg-rose-50/10 space-y-3">
                                <h5 className="font-semibold text-slate-800 flex items-center gap-1.5">
                                  <Trash2 className="w-4 h-4 text-rose-600" /> Option B: Direct Worksheet Row Delete
                                </h5>
                                <p className="text-[11px] text-slate-500">Wiping data directly from your Google Sheet workspace.</p>
                                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 leading-relaxed">
                                  <li>Open your spreadsheet on your computer web browser.</li>
                                  <li>Find the row you wish to get rid of.</li>
                                  <li><strong>Right-click</strong> the gray box number on the far left signifying the row.</li>
                                  <li>Select <strong>Delete Row</strong> from the pop-up options menu list. That's it!</li>
                                  <li className="text-[10px] text-rose-700 italic font-medium">⚠️ Warning: Click "Delete Row" instead of just hitting the Delete key, as hitting Delete only erases text cells leaving an empty blank row gap.</li>
                                </ol>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* CHAPTER 5: UPLOADING PHOTOS */}
                        {(manualTopic === 'all' || manualTopic === 'photos') && (
                          <div className="bg-white border border-slate-200 rounded-xl p-5.5 space-y-4 shadow-sm">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                              <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600 font-bold text-sm">05</div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm">📸 Chapter 5: Uploading Photos</h4>
                                <p className="text-slate-500 text-[10px]">Snapping snapshots of food, bills, invoices, receipts, and vehicle credentials</p>
                              </div>
                            </div>
                            
                            <p className="text-slate-600 leading-relaxed">
                              TUK LIFE OS includes a high-fidelity image capture workflow that leverages Google Gemini for automatic details parsing. Here's how you upload documents:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-2">
                                <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                                  <Camera className="w-4 h-4 text-emerald-600" /> Mobile Camera Workflows (Recommended)
                                </h5>
                                <p className="text-slate-600 leading-relaxed">
                                  Our AppSheet layout links direct camera assets to system storage:
                                </p>
                                <ol className="list-decimal list-inside space-y-1.5 text-slate-500 bg-white p-3 rounded-lg border border-slate-100">
                                  <li>Enter the <strong>AI Ingest</strong> module from the bottom navigation.</li>
                                  <li>Click the plus icon to add a new inbox item.</li>
                                  <li>Click on the <strong>Image Attachment</strong> container box.</li>
                                  <li>Choose your phone's <strong>Camera</strong>, crop or line up the receipt perfectly, and click capture.</li>
                                  <li>AppSheet saves the photo and automatically uploads it to your custom Google Drive storage.</li>
                                </ol>
                              </div>

                              <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-2">
                                <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                                  <Camera className="w-4 h-4 text-indigo-600" /> Desktop File Select
                                </h5>
                                <p className="text-slate-600 leading-relaxed">
                                  If your documents are already saved on your desktop as digital PDFs:
                                </p>
                                <ol className="list-decimal list-inside space-y-1.5 text-slate-500 bg-white p-3 rounded-lg border border-slate-100">
                                  <li>Double-click the <strong>AI Ingestion Queue</strong> worksheet inside Google Sheets.</li>
                                  <li>Go to the row for your pending entry, or find the image upload file cells.</li>
                                  <li>Alternatively, place files directly into the Google Drive folder named <strong>"AppSheet/data/..."</strong>.</li>
                                  <li>Paste the absolute file's shared URL inside the spreadsheet's <code>file_url</code> column.</li>
                                  <li>This tells the AI engine what PDF file to scan and read.</li>
                                </ol>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* CHAPTER 6: REVIEWING AI RECORDS */}
                        {(manualTopic === 'all' || manualTopic === 'photos') && (
                          <div className="bg-white border border-slate-200 rounded-xl p-5.5 space-y-4 shadow-sm">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                              <div className="bg-purple-50 p-2 rounded-lg text-purple-600 font-bold text-sm">06</div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm">🤖 Chapter 6: Reviewing AI Ingestion Records</h4>
                                <p className="text-slate-500 text-[10px]">Approving, amending, and routing Gemini extracted database logs</p>
                              </div>
                            </div>
                            
                            <p className="text-slate-600 leading-relaxed">
                              Once photos are uploaded, the Gemini engine parses the unorganized layout and places a structured summary inside the <strong>AI Inbox</strong>. This ensures zero data pollution in your main databases. Approve or edit them via this simple workflow:
                            </p>

                            <div className="relative rounded-xl border border-purple-100 bg-purple-50/10 p-5 space-y-4.5">
                              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                <Sparkles className="w-4.5 h-4.5 text-purple-600 animate-pulse" /> The 4-Step Validation & Approval Checklist
                              </div>
                              
                              <div className="space-y-4">
                                <div className="flex gap-3">
                                  <span className="bg-purple-100 text-purple-800 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0">1</span>
                                  <div>
                                    <p className="font-bold text-slate-800 leading-none">Examine Extracted Inputs</p>
                                    <p className="text-slate-500 text-[11px] mt-1 font-sans">Open <strong>AI Inbox</strong>. Check the extracted title, amount, and unit. Gemini will have filled variables like Calories for food photos (e.g. <code>420 kcal</code>) or cost for invoices (e.g. <code>1,250 THB</code>).</p>
                                  </div>
                                </div>
                                <div className="flex gap-3">
                                  <span className="bg-purple-100 text-purple-800 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0">2</span>
                                  <div>
                                    <p className="font-bold text-slate-800 leading-none">Correct Inaccuracies (If Any)</p>
                                    <p className="text-slate-500 text-[11px] mt-1 font-sans">If the photo was blurry and Gemini missed the exact price or item title, simply click edit on AppSheet or double-click the sheet cell to write the correct details inside the form.</p>
                                  </div>
                                </div>
                                <div className="flex gap-3">
                                  <span className="bg-purple-100 text-purple-800 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0">3</span>
                                  <div>
                                    <p className="font-bold text-slate-800 leading-none">Review Auto-Dispatched Tables</p>
                                    <p className="text-slate-500 text-[11px] mt-1 font-sans">The system automatically matches classifications: <strong>FOOD & DIET</strong> goes to weight and calorie logs; <strong>VALUED EXPENSE</strong> goes to transactions; <strong>UTILITY BILLS</strong> schedules due payments; <strong>VEHICLE SCHEDULER</strong> is mapped straight to vehicle tax trackers.</p>
                                  </div>
                                </div>
                                <div className="flex gap-3">
                                  <span className="bg-purple-100 text-purple-800 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0">4</span>
                                  <div>
                                    <p className="font-bold text-slate-800 leading-none">Tap "Approved" Slider</p>
                                    <p className="text-slate-500 text-[11px] mt-1 font-sans">Ready to finalise? Toggle the item's status from <code>PENDING_OCR</code> to <code>APPROVED</code> inside AppSheet. The script will safely write variables to targeted tables and clean your active inbox queue automatically!</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* CHAPTER 7: DASHBOARD READING */}
                        {(manualTopic === 'all' || manualTopic === 'dashboard') && (
                          <div className="bg-white border border-slate-200 rounded-xl p-5.5 space-y-4 shadow-sm">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                              <div className="bg-sky-50 p-2 rounded-lg text-sky-600 font-bold text-sm">07</div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm">📊 Chapter 7: Dashboard Reading & Analytics</h4>
                                <p className="text-slate-500 text-[10px]">How to understand visual graphs, balance indicators, and budget trackers</p>
                              </div>
                            </div>
                            
                            <p className="text-slate-600 leading-relaxed">
                              Your TUK LIFE OS dashboard interprets thousands of raw database rows and simplifies them into plain, actionable life advice cards. Here is how you read your charts:
                            </p>

                            <div className="space-y-3">
                              <div className="flex items-start gap-2.5 bg-slate-50 p-4.5 rounded-xl border border-slate-100">
                                <span className="text-lg">💰</span>
                                <div className="space-y-1">
                                  <p className="font-bold text-slate-800">Financial Net Worth & Cash Outflows</p>
                                  <p className="text-slate-600 leading-relaxed text-[11px]">
                                    Shows total savings, active investments, and monthly spending. If the monthly bar chart spikes, look at the subcategory chart to see if it was caused by Utilities/Food, or unbudgeted shopping trips.
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2.5 bg-slate-50 p-4.5 rounded-xl border border-slate-100">
                                <span className="text-lg">❤️</span>
                                <div className="space-y-1">
                                  <p className="font-bold text-slate-800">Health Sleep & Daily Calories Indicators</p>
                                  <p className="text-slate-600 leading-relaxed text-[11px]">
                                    Compares body weight trends alongside caloric consumption. A dotted red warning line indicates when your resting heart rate is higher than your average base, signaling that you might need a rest day or extra sleep.
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2.5 bg-slate-50 p-4.5 rounded-xl border border-slate-100">
                                <span className="text-lg">🚗</span>
                                <div className="space-y-1">
                                  <p className="font-bold text-slate-800">Vehicle Annual Expiration Warnings</p>
                                  <p className="text-slate-600 leading-relaxed text-[11px]">
                                    Displays tax tokens, driver permissions, and auto insurance expiration timelines. Green dots indicate valid documents, while a blinking orange alarm warns you of papers expiring in less than 30 days!
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* CHAPTER 8: BACKUP PROCESS */}
                        {(manualTopic === 'all' || manualTopic === 'backup') && (
                          <div className="bg-white border border-slate-200 rounded-xl p-5.5 space-y-4 shadow-sm font-sans">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                              <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 font-bold text-sm">08</div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm">💾 Chapter 8: Data Backup & Recovery</h4>
                                <p className="text-slate-500 text-[10px]">Restoring accidentally deleted items and saving dated snapshots</p>
                              </div>
                            </div>
                            
                            <p className="text-slate-600 leading-relaxed">
                              You have complete custody over your personal history data. There are no proprietary black-box database columns holding your entries hostage. Keep your systems safe with this <strong>simple quarterly backup recipe</strong>:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-700 leading-relaxed">
                              <div className="border border-slate-150 p-4 rounded-xl space-y-1.5 hover:border-slate-300 transition-all">
                                <h5 className="font-bold text-slate-800 font-sans">1. Instant Device Cache</h5>
                                <p className="text-slate-500 text-[11px] font-sans">You can access and add records inside AppSheet even while completely offline. Your inputs are safely queued on your phone memory, syncing automatically back to Sheets once you connect to WiFi.</p>
                              </div>
                              <div className="border border-slate-150 p-4 rounded-xl space-y-1.5 hover:border-slate-300 transition-all">
                                <h5 className="font-bold text-slate-800 font-sans">2. Making Weekly Copies</h5>
                                <p className="text-slate-500 text-[11px] font-sans">Open Google Sheets, select <strong>File &gt; Make a Copy</strong>, and save it on Drive with a timestamped label (e.g. <code>Tuk_Life_Backup_June_2026</code>). This shields you from accidental changes.</p>
                              </div>
                              <div className="border border-slate-150 p-4 rounded-xl space-y-1.5 hover:border-slate-300 transition-all">
                                <h5 className="font-bold text-slate-800 font-sans">3. Monthly Offline XLSX</h5>
                                <p className="text-slate-500 text-[11px] font-sans">Download your spreadsheet as a Microsoft Excel document (<code>.xlsx</code>) once every month and store it on an external USB key. This gives you 100% cloud-independent local data custody.</p>
                              </div>
                            </div>

                            <div className="bg-rose-50 border border-rose-150 rounded-xl p-4 space-y-2 flex items-start gap-3">
                              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <p className="font-bold text-rose-900">How to Undo an Accidental File Deletion</p>
                                <p className="text-slate-600 text-[11px] leading-relaxed">
                                  Accidentally wiped rows or deleted a whole tab? Don't panic! Open your Google Sheet browser tab, click <strong>File &gt; Version History &gt; See version history</strong>. Browse the chronological versions sidebar on the right to select previous weeks, locate your lost records, and click <strong>Restore this version</strong>!
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  )}

                  {/* SUBTAB 7: NEXT 10 YEAR ROADMAP */}
                  {guideSubTab === 'roadmap' && (
                    <div className="space-y-6 animate-fade-in font-sans">
                      <div className="bg-purple-50 text-purple-955 p-5 border border-purple-150 rounded-2xl space-y-2">
                        <h3 className="font-bold text-sm text-purple-900 font-mono uppercase tracking-wide flex items-center gap-1.5">
                          🔮 Long-Term Technical & Product Roadmap
                        </h3>
                        <p className="text-xs text-slate-600">
                          Our strategic plan to evolve TUK LIFE OS through 1-year, 3-year, and 10-year milestones as we scale our data models.
                        </p>
                      </div>

                      <div className="space-y-5 text-xs text-slate-700">
                        {/* Year 1 */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-2.5">
                          <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase font-mono border-b border-slate-100 pb-1.5">
                            🎯 Horizon 1: Immediate Scaling & Polish (Next 1 Year)
                          </h4>
                          <p className="text-slate-500 leading-relaxed">
                            Our primary focus is setting up dynamic, formula-free data archival paths to maintain fast sheets processing speeds.
                          </p>
                          <ul className="list-disc list-inside space-y-1.5 text-slate-600 text-[11px] pl-1">
                            <li><strong>Yearly Data Partitions:</strong> Automatically route old logs to a separate archive sheet (e.g., <code>Logs_2025_Archive</code>) once records exceed 50,000 cells.</li>
                            <li><strong>Asynchronous OCR Background Tasking:</strong> Process receipt scans in the background with timer triggers, instead of loading them in active AppSheet user views.</li>
                            <li><strong>Dynamic Table Address Lookups:</strong> Replace brittle cell reference addresses with dynamic column lookups in our Apps Script code to prevent layout breaks.</li>
                          </ul>
                        </div>

                        {/* Year 3 */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-2.5">
                          <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase font-mono border-b border-slate-100 pb-1.5">
                            🎯 Horizon 2: Hybrid Database Integration (Next 3 Years)
                          </h4>
                          <p className="text-slate-500 leading-relaxed">
                            Transition from simple flat spreadsheets to a relational SQL database structure to support a larger volume of transactions.
                          </p>
                          <ul className="list-disc list-inside space-y-1.5 text-slate-600 text-[11px] pl-1">
                            <li><strong>Drizzle ORM & Cloud SQL:</strong> Establish a robust PostgreSQL instance to handle core transactions securely. This keeps the dashboard fast.</li>
                            <li><strong>Two-Way Sheet Mirroring:</strong> Sync active mobile logs to a relational SQL database while exporting simple read-only summaries back to Google Sheets.</li>
                            <li><strong>Dedicated Local Food OCR:</strong> Implement pre-cached, on-device AI algorithms to identify popular local Thai dishes and estimate calories instantly without internet access.</li>
                          </ul>
                        </div>

                        {/* Year 10 */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-2.5">
                          <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase font-mono border-b border-slate-100 pb-1.5">
                            🎯 Horizon 3: Platform Expansion & Decollate (Next 10 Years)
                          </h4>
                          <p className="text-slate-500 leading-relaxed">
                            Evolve TUK LIFE OS into an independent, server-side platform that can scale to meet the needs of thousands of users.
                          </p>
                          <ul className="list-disc list-inside space-y-1.5 text-slate-600 text-[11px] pl-1">
                            <li><strong>Native App Architecture:</strong> Replace the AppSheet interface with tailored, offline-first iOS and Android applications.</li>
                            <li><strong>Zero-Spreadsheet Storage:</strong> Move our database entirely to a serverless, relational Google Cloud Spanner setup to easily store millions of active logs.</li>
                            <li><strong>Predictive System Alerts:</strong> Implement private, offline AI models to analyze logs, suggest personalized spending budgets, and alert you of health maintenance patterns dynamically.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}


                  {/* SUBTAB 8: APPSHEET IMPLEMENTATION PLAN & SETUP GUIDE */}
                  {guideSubTab === 'appsheet' && (
                    <div className="space-y-6 animate-fade-in font-sans">
                      {/* Header Summary */}
                      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-2">
                        <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/25 px-2.5 py-1 rounded-md font-mono uppercase tracking-wider font-semibold">
                          TUK LIFE OS AppSheet Deployment Blueprint
                        </span>
                        <h3 className="font-bold text-lg text-white font-sans mt-2">
                          🛠️ Complete 7-Step Mobile Implementation Plan
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed max-w-3xl">
                          This operational playbook outlines the exact step-by-step procedures to build your TUK LIFE OS mobile application using the AppSheet low-code framework. Follow these detailed steps to establish forms, dashboards, search filters, and the custom AI Inbox review system.
                        </p>
                      </div>

                      {/* Step-by-Step interactive panels */}
                      <div className="space-y-5 text-xs text-slate-705">
                        
                        {/* STEP 1 */}
                        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 font-mono uppercase">
                              <span className="bg-teal-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-bold">Step 01</span>
                              📱 Mobile App Provisioning & Ingress
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono">Time required: 2 mins</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">
                            Initialize your mobile shell container by establishing the data bridge directly from your compiled spreadsheet.
                          </p>
                          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                            <p className="font-bold text-slate-800">Deployment Action Sequences:</p>
                            <ol className="list-decimal list-inside space-y-1.5 pl-1">
                              <li>Open your newly bootstrapped Google Sheet in your web browser.</li>
                              <li>Go to the main menu bar, and click on <strong>Extensions &gt; AppSheet &gt; Create an app</strong>.</li>
                              <li>Log into your Google Cloud / AppSheet console with the same account.</li>
                              <li>AppSheet will automatically scan your spreadsheet tabs and build your secure starting mobile environment.</li>
                              <li>Once loaded, navigate to <strong>Data &gt; Tables</strong> in the AppSheet console, click <strong>+ Add Table</strong>, and add all remaining tables: <code>MASTER_LOGS_DB_V3</code>, <code>FIN_TRANSACTIONS_V3</code>, <code>HLT_WORKOUTS_V3</code>, <code>GAR_LOGS_V3</code>, and <code>AI_INBOX_V3</code>.</li>
                            </ol>
                          </div>
                          <div className="text-[10px] bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-100 font-mono">
                            💡 PRO-TIP: Mark static tables like <code>SYS_LOOKUPS_V3</code> as "Read Only" under the table settings to protect your system configurations.
                          </div>
                        </div>

                        {/* STEP 2 */}
                        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 font-mono uppercase">
                              <span className="bg-teal-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-bold">Step 02</span>
                              📝 Custom Add Record Form Views
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono">Time required: 5 mins</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">
                            Design a powerful input webform for entering entries into the chronological <code>MASTER_LOGS_DB_V3</code> data table.
                          </p>
                          
                          <div className="space-y-3">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <p className="font-bold text-slate-800 mb-2">Column Settings & Formulas Configuration Matrix:</p>
                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-[11px] font-sans">
                                  <thead>
                                    <tr className="border-b border-slate-200 text-slate-500 font-mono">
                                      <th className="pb-1.5 font-bold">Column Name</th>
                                      <th className="pb-1.5 font-bold">Type</th>
                                      <th className="pb-1.5 font-bold">Initial Value Expression</th>
                                      <th className="pb-1.5 font-bold">Required</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 text-slate-700">
                                    <tr>
                                      <td className="py-2 font-mono text-teal-600 font-semibold">event_id</td>
                                      <td className="py-2">Text</td>
                                      <td className="py-2 font-mono text-slate-805 text-slate-800">UNIQUEID()</td>
                                      <td className="py-2 font-semibold text-rose-500 font-mono">TRUE</td>
                                    </tr>
                                    <tr>
                                      <td className="py-2 font-mono text-teal-600 font-semibold">timestamp</td>
                                      <td className="py-2">DateTime</td>
                                      <td className="py-2 font-mono text-slate-805 text-slate-800">NOW()</td>
                                      <td className="py-2 font-semibold text-rose-500 font-mono">TRUE</td>
                                    </tr>
                                    <tr>
                                      <td className="py-2 font-mono text-teal-600 font-semibold">main_category</td>
                                      <td className="py-2">Enum</td>
                                      <td className="py-2 text-slate-500">Values: HEALTH, FINANCE, GARAGE, WORK, TRAVEL, MEDICAL, INVESTMENT</td>
                                      <td className="py-2 font-semibold text-rose-500 font-mono">TRUE</td>
                                    </tr>
                                    <tr>
                                      <td className="py-2 font-mono text-teal-600 font-semibold">sub_category</td>
                                      <td className="py-2">Enum</td>
                                      <td className="py-2 font-mono text-slate-500">Dependent dropdowns mapping lookups</td>
                                      <td className="py-2 font-semibold text-slate-400 font-mono">FALSE</td>
                                    </tr>
                                    <tr>
                                      <td className="py-2 font-mono text-teal-600 font-semibold">logged_by_email</td>
                                      <td className="py-2">Email</td>
                                      <td className="py-2 font-mono text-slate-805 text-slate-800">USEREMAIL()</td>
                                      <td className="py-2 font-semibold text-rose-500 font-mono">TRUE</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 leading-relaxed space-y-1.5">
                              <p className="font-bold text-slate-800">Form View Customization Assembly:</p>
                              <ul className="list-disc list-inside space-y-1 pl-1">
                                <li>Navigate to <strong>App &gt; Views</strong>, click <strong>+ Add View</strong>, name it <code>Add Log Form</code>, and connect it to table <code>MASTER_LOGS_DB_V3</code>.</li>
                                <li>Set the **View Type** to <strong>Form</strong>.</li>
                                <li>Under **Form Page Style**, select <strong>Page-at-a-time</strong> to partition fields cleanly for small screen displays.</li>
                                <li>Re-order fields to place <em>Main Category</em>, <em>Sub Category</em>, and <em>Notes</em> at the very top for effortless speed entry.</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* STEP 3 */}
                        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 font-mono uppercase">
                              <span className="bg-teal-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-bold">Step 03</span>
                              ✏️ Contextual Edit Form & Rules
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono">Time required: 4 mins</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">
                            Configure form rules to dictate strict context-aware editing permissions and conditional visual options on existing rows.
                          </p>
                          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                            <p className="font-bold text-slate-800 text-xs">Security & Visibility Settings Checklist:</p>
                            <ul className="space-y-2">
                              <li className="flex items-start gap-1 pb-1 border-b border-slate-100">
                                <span className="text-teal-600 font-bold font-mono mr-1">Editable_If Constraint:</span>
                                <div>
                                  <p className="font-semibold text-slate-800">Only creator can edit:</p>
                                  <p className="font-mono text-slate-505 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">[logged_by_email] = USEREMAIL()</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">Place this in the table column properties of <strong>Editable_If</strong>, so users cannot edit other people's records.</p>
                                </div>
                              </li>
                              <li className="flex items-start gap-1">
                                <span className="text-teal-600 font-bold font-mono mr-1">Show_If Visibility Rules:</span>
                                <div>
                                  <p className="font-semibold text-slate-800">Hide system elements conditionally:</p>
                                  <p className="font-mono text-slate-505 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">AND(ISNOTBLANK([main_category]), [status] &lt;&gt; "DELETED")</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">Determines field displays dynamically depending on their context.</p>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>

                        {/* STEP 4 */}
                        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 font-mono uppercase">
                              <span className="bg-teal-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-bold">Step 04</span>
                              🗑️ Safe Delete Action Configuration (Logical Soft-Delete)
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono">Time required: 3 mins</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">
                            Protect historical transaction records and daily logs from complete accidental destruction by implementing logical "soft-delete" markers.
                          </p>
                          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                            <p className="font-bold text-slate-800">How to Setup Soft Deletion Actions:</p>
                            <ol className="list-decimal list-inside space-y-1.5 pl-1">
                              <li>Go to <strong>Actions &gt; Actions</strong> in your AppSheet dashboard, and select <strong>+ Add Action</strong>.</li>
                              <li>Establish a new action connected to table <code>MASTER_LOGS_DB_V3</code>, and title it <code>Safe soft-delete</code>.</li>
                              <li>Set **Do this** task type to: <strong>"Set the values of some columns in this row"</strong>.</li>
                              <li>Select column: <code>status</code>, and input the string formula value: <code>"DELETED"</code> inside the formula editor box.</li>
                              <li>Configure the display properties to show a <strong>Trash Can (🗑️)</strong> icon.</li>
                              <li>Under **Behavior**, enter the display condition formula: <code>[status] &lt;&gt; "DELETED"</code> so it only displays on active records.</li>
                              <li><strong>Slice implementation:</strong> Create a table Slice connected to AppSheet called <code>Active_Logs_Slice</code> with row expression <code>[status] &lt;&gt; "DELETED"</code>. Connect all main views to this slice instead of the raw data sheet. Deleted entries vanish instantly from user view while physical archive integrity is kept!</li>
                            </ol>
                          </div>
                        </div>

                        {/* STEP 5 */}
                        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 font-mono uppercase">
                              <span className="bg-teal-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-bold">Step 05</span>
                              🔍 High-Performance Multi-Field Search
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono">Time required: 3 mins</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">
                            Enable instant, optimized client-side indexing and searching of old transactions, calorie journals, and notes directly on your phone.
                          </p>
                          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-705 text-slate-700 leading-relaxed">
                            <p className="font-bold text-slate-800">Search Configuration Steps:</p>
                            <ol className="list-decimal list-inside space-y-1.5 pl-1">
                              <li>Open <strong>Data &gt; Columns</strong> in AppSheet and view the details of <code>MASTER_LOGS_DB_V3</code>.</li>
                              <li>Tick the **Search** checkbox specifically for columns: <code>notes</code>, <code>main_category</code>, <code>sub_category</code>, and <code>outcome_value</code>.</li>
                              <li>Untick search arrays for technical UUID string columns like <code>event_id</code>, <code>logged_by_email</code>, or <code>attachment_url</code>. This boosts database search speed by 400% on older smartphones.</li>
                              <li>Configure **Search Labels**: Select <code>notes</code> as the primary presentation header in the table settings so results are readable.</li>
                            </ol>
                          </div>
                        </div>

                        {/* STEP 6 */}
                        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 font-mono uppercase">
                              <span className="bg-teal-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-bold">Step 06</span>
                              📊 Executive KPI Dashboard View Assembly
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono">Time required: 7 mins</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">
                            Construct an executive dashboard view that packs active check-in logs, transaction lists, and visual charts into one combined responsive container.
                          </p>
                          
                          <div className="space-y-3">
                            {/* Graphic Representation */}
                            <div className="border border-slate-850 bg-slate-950 rounded-xl p-4 text-white font-mono text-[10px] space-y-2.5">
                              <p className="text-teal-400 font-bold uppercase tracking-wider">// Visual Wireframe: Mobile Dashboard View Layout</p>
                              <div className="grid grid-cols-2 gap-2 text-center">
                                <div className="border border-dashed border-slate-755 p-3 rounded bg-slate-900 text-slate-405 text-slate-400">
                                  <p className="font-bold text-white text-xs">📊 CHART VIEW</p>
                                  <p className="text-[9px] mt-0.5">Sum of Expenses by Main Category</p>
                                </div>
                                <div className="border border-dashed border-slate-755 p-3 rounded bg-slate-900 text-slate-405 text-slate-400">
                                  <p className="font-bold text-white text-xs">📈 TREND VIEW</p>
                                  <p className="text-[9px] mt-0.5">Daily Calorie Metrics Plot</p>
                                </div>
                                <div className="border border-dashed border-slate-755 p-3 rounded bg-slate-900 text-slate-405 text-slate-400 col-span-2">
                                  <p className="font-bold text-white text-xs">📇 DECK SUBVIEW</p>
                                  <p className="text-[9px] mt-0.5">Active Logs Slices (Date Sorted, Filtered)</p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-705 text-slate-700 leading-relaxed">
                              <p className="font-bold text-slate-800">Dashboard Setup Guide:</p>
                              <ol className="list-decimal list-inside space-y-1.5 pl-1">
                                <li>Navigate to <strong>App &gt; Views</strong>, and tap <strong>+ Add View</strong>. Name it <code>Core Dashboard</code>.</li>
                                <li>Set **View Type** to: <strong>Dashboard</strong>.</li>
                                <li>Under **View Entries**, add three sub-views:
                                  <ul className="list-disc list-inside pl-3 space-y-1 mt-1 text-slate-600">
                                    <li><code>Monthly_Spend_Chart</code> (A custom bar chart counting column <code>txn_amount</code> grouped by <code>main_category</code>).</li>
                                    <li><code>Steps_Trend_Line</code> (A custom histogram plotting steps over dates).</li>
                                    <li><code>Recent_Log_Entries</code> (A simple deck list showing the latest 10-row slice).</li>
                                  </ul>
                                </li>
                                <li>Enable **Interactive Mode** by turning the slider to ON. This enables cross-filtering — clicking a category bar in the chart filters the logs deck below instantly!</li>
                              </ol>
                            </div>
                          </div>
                        </div>

                        {/* STEP 7 */}
                        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 font-mono uppercase">
                              <span className="bg-teal-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-bold">Step 07</span>
                              🤖 AI Inbox Review & Approve Screen (Peer-Review)
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono">Time required: 8 mins</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">
                            Create the central pipeline to peer-review, correct, and push newly scanned invoice records extracted by Gemini into your master financial sheet.
                          </p>
                          
                          <div className="space-y-3">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-705 text-slate-700 leading-relaxed">
                              <p className="font-bold text-slate-800 mb-1.5">How this Workflow Integrates:</p>
                              <p className="text-slate-500 text-[11px] mb-2.5">
                                When a receipt index arrives inside the <code>AI_INBOX_V3</code> data table, its status has a value of <code>"PENDING_REVIEW"</code>. The review view filters these, allowing you to edit values and trigger the transition.
                              </p>
                              
                              <p className="font-bold text-slate-800">Step-by-Step Implementation Guide:</p>
                              <ol className="list-decimal list-inside space-y-1.5 pl-1 font-sans">
                                <li><strong>Create Inbox Slice:</strong> Set up a data slice connected to table <code>AI_INBOX_V3</code>, name it <code>AI_Pending_Inbox</code> and apply row formula: <code>[status] = "PENDING_REVIEW"</code>.</li>
                                <li><strong>Inbox Deck View:</strong> Go to UX Views, Add a new view connected to <code>AI_Pending_Inbox</code> slice. Choose <strong>Deck</strong> as view type, set **Primary Header** to <code>vendor</code>, and **Sub-header** to <code>total_cost</code>.</li>
                                <li><strong>Configure "Push to Ledger" Action:</strong> Create a new UX Action connected to table <code>AI_INBOX_V3</code>, name it <code>Approve Data & Push</code>. Set **Do this** to: <strong>"Add a new row to another table using values from this row"</strong>. Set target table to: <code>FIN_TRANSACTIONS_V3</code>. Place these column assignment rules:
                                  <ul className="list-disc list-inside mt-1.5 pl-3.5 space-y-1 font-mono text-[10.5px] text-slate-805 text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200">
                                    <li>f_transaction_id = UNIQUEID()</li>
                                    <li>amount_thb = [total_cost]</li>
                                    <li>notes = CONCATENATE("AI Approved OCR Match / Vendor: ", [vendor])</li>
                                    <li>status = "ACTIVE"</li>
                                    <li>ref_attachment = [receipt_image_path]</li>
                                  </ul>
                                </li>
                                <li><strong>Status Transition trigger:</strong> Under the same action, add a secondary sequence step to set this invoice status to <code>"APPROVED"</code>. This automatically removes it from the pending review queue deck instantly!</li>
                              </ol>
                            </div>

                            <div className="bg-emerald-50 text-emerald-950 border border-emerald-100 p-3.5 rounded-lg flex items-center gap-2 font-mono">
                              🛡️ SECURITY: Connect AppSheet image storage pathway with Google Drive's "Attachments_Vault" to restrict private image file access to authenticated app users only.
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            ) : (
              /* CORE DATABASE SCHEMA VIEWER CASE */
              activeModule && (
                <motion.div
                  key={`module-${activeModule.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* MODULE INFO GENERAL */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center gap-5 justify-between relative overflow-hidden">
                    <div className="flex items-start gap-4">
                      <div className="bg-slate-900 text-white p-3.5 rounded-xl">
                        {getIcon(activeModule.icon, 'w-6 h-6 text-teal-400')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl font-bold text-slate-800">{activeModule.name} Roster</h2>
                          {activeModule.isMain && (
                            <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded uppercase">
                              Primary Core Backbone
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-xs mt-1 max-w-2xl leading-relaxed">
                          {activeModule.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE SHEETS SELECTIONS (If Module has multiple sheets) */}
                  {activeModule.sheets.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                      {activeModule.sheets.map((sh, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedSheetIndex(idx)}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider font-mono uppercase cursor-pointer transition-all border ${
                            selectedSheetIndex === idx
                              ? 'bg-teal-500 text-slate-950 border-teal-500 font-bold shadow-md shadow-teal-500/10'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          {sh.displayName}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* DETAILED ACTIVE SHEET PROFILE */}
                  {activeSheet && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                              TAB NAME: {activeSheet.sheetName}
                            </span>
                            <span className="text-xs font-mono font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded">
                              PK: {activeSheet.primaryKey}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                            <strong>Sheet Purpose:</strong> {activeSheet.purpose}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs text-slate-400 font-mono block">Columns count</span>
                          <span className="text-lg font-bold text-slate-700 font-mono">
                            {activeSheet.columns.length} Header Fields
                          </span>
                        </div>
                      </div>

                      {/* TABLE OF SCHEMA COLUMNS */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-900 text-white font-mono uppercase tracking-wider text-[10px] border-b border-slate-800">
                              <th className="p-3.5 pl-5 font-semibold">Column Code</th>
                              <th className="p-3.5 font-semibold">Thai Alias</th>
                              <th className="p-3.5 font-semibold">Data Type</th>
                              <th className="p-3.5 font-semibold">Validation Rule</th>
                              <th className="p-3.5 font-semibold">Example Value</th>
                              <th className="p-3.5 pr-5 font-semibold">Ref / Purpose Details</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-sans">
                            {activeSheet.columns.map((col, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                {/* Column name */}
                                <td className="p-3.5 pl-5 font-mono font-bold text-slate-900">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span>{col.name}</span>
                                    {col.primaryKey && (
                                      <span className="text-[8px] bg-amber-500 text-slate-900 font-mono font-bold px-1.5 py-0.5 rounded border border-amber-600/10 uppercase tracking-widest leading-none">
                                        PK
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Thai Alias */}
                                <td className="p-3.5 font-semibold text-slate-700 font-sans">
                                  {col.thaiName ? (
                                    <span className="bg-indigo-50 text-indigo-800 border border-indigo-100 px-2 py-0.5 rounded">
                                      {col.thaiName}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>

                                {/* Data Type */}
                                <td className="p-3.5 font-mono text-slate-600 italic">
                                  {col.type}
                                </td>

                                {/* Validation Rule */}
                                <td className="p-3.5 font-mono text-slate-500">
                                  <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded text-[11px] font-semibold border border-slate-200">
                                    {col.validation}
                                  </span>
                                </td>

                                {/* Example value */}
                                <td className="p-3.5">
                                  <code className="bg-slate-100 border border-slate-200/60 text-slate-700 px-2.5 py-1 rounded font-mono text-[11px]">
                                    {col.example}
                                  </code>
                                </td>

                                {/* Ref / Purpose Details */}
                                <td className="p-3.5 pr-5 text-slate-600 leading-relaxed max-w-sm">
                                  <div>{col.description}</div>
                                  {col.foreignKeyRef && (
                                    <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded w-max">
                                      <Network className="w-3.5 h-3.5 shrink-0" /> Link to {col.foreignKeyRef}
                                    </div>
                                  )}
                                  {col.dropdownValues && col.dropdownValues.length > 0 && (
                                    <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                                      <span className="text-[10px] font-mono text-indigo-500 font-bold bg-indigo-50/50 border border-indigo-100 px-1 py-0.5 rounded shrink-0">Dropdowns:</span>
                                      {col.dropdownValues.map((v, i) => (
                                        <span key={i} className="text-[9px] font-mono text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">{v}</span>
                                      ))}
                                    </div>
                                  )}
                                  {col.formula && (
                                    <div className="mt-1.5 flex items-start gap-1.5 text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded max-w-full overflow-x-auto">
                                      <span className="font-bold shrink-0 text-amber-800">Formula:</span> 
                                      <code className="text-amber-900 break-all">{col.formula}</code>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* APPSHEET INTEGRATION SUMMARY CHIPS */}
                      <div className="p-5 bg-slate-50 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider mb-3">
                          AppSheet Column Configurations
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-white border border-slate-200 rounded-xl p-4">
                          <div>
                            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Key Field</span>
                            <span className="font-bold text-slate-700 mt-1 block">
                              <code>{activeSheet.primaryKey}</code>
                            </span>
                            <p className="text-slate-400 text-[10px] mt-0.5">Uniquely maps row updates with zero row displacement.</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Label Field</span>
                            <span className="font-bold text-slate-700 mt-1 block">
                              <code>
                                {activeSheet.columns.find((c) => c.name.includes('name') || c.name.includes('title') || c.name.includes('subject'))?.name || activeSheet.primaryKey}
                              </code>
                            </span>
                            <p className="text-slate-400 text-[10px] mt-0.5">Title parameter rendered by Appsheet user menus.</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold block uppercase text-[10px]">Relational Status</span>
                            <span className="font-bold text-teal-600 mt-1 block flex items-center gap-1.5 leading-none">
                              <span className="inline-block w-2 h-2 rounded-full bg-teal-500"></span> Standard relational mapping ready
                            </span>
                            <p className="text-slate-400 text-[10px] mt-0.5">Guarantees pristine nested form logic structures.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* COMPACT FOOTER - HIDDEN AS REQUESTED */}
      <footer className="hidden bg-slate-900 text-slate-400 text-xs py-5 border-t border-slate-800 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {isSimplifiedMode ? (
            <span className="text-slate-500 font-sans mx-auto">&copy; 2026 TUK LIFE OS.</span>
          ) : (
            <>
              <span>&copy; 2026 TUK LIFE OS Database Architect. Under guidance of Senior Database Architect.</span>
              <span className="text-slate-500 font-mono">
                Optimized for AppSheet v2, Google Sheets SDK, Google Apps Script V8, & AI prompts.
              </span>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}

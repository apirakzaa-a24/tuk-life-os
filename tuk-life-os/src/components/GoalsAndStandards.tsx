import React, { useState, useEffect } from 'react';
import { Heart, Car, PiggyBank, Briefcase, Check, Save } from 'lucide-react';
import { safeLocalStorage } from '../utils/storage';
import { logAudit } from '../utils/audit';

interface GoalsAndStandardsProps {
  language: 'th' | 'en';
}

interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
  currentOdometer: string;
  nextServiceKm: string;
  insuranceExpiryDate: string;
  taxExpiryDate: string;
  remarks: string;
  status: 'ACTIVE' | 'DELETED';
}

interface GoalsState {
  // Health Standards
  targetWeight: string;
  targetSleepHours: string;
  dailyCaloriesGoal: string;
  exerciseGoal: string;

  // Vehicle Standards
  vehicles: Vehicle[];

  // Finance Standards
  monthlySpendingLimit: string;
  emergencyFundGoal: string;
  savingGoal: string;
  debtReductionGoal: string;

  // Work Standards
  monthlyWorkTarget: string;
  englishStudyGoal: string;
  importantWorkGoals: string;
}

const DEFAULT_GOALS: GoalsState = {
  targetWeight: '59.0',
  targetSleepHours: '8',
  dailyCaloriesGoal: '2000',
  exerciseGoal: '30 mins/day',

  vehicles: [
    {
      id: 'vehicle-1',
      name: 'BYD Seal 7',
      licensePlate: '',
      currentOdometer: '',
      nextServiceKm: '',
      insuranceExpiryDate: '',
      taxExpiryDate: '',
      remarks: 'Fuel Type: EV',
      status: 'ACTIVE',
    },
    {
      id: 'vehicle-2',
      name: 'Honda City 2010',
      licensePlate: '',
      currentOdometer: '',
      nextServiceKm: '',
      insuranceExpiryDate: '',
      taxExpiryDate: '',
      remarks: 'Fuel Type: Gasoline',
      status: 'ACTIVE',
    }
  ],

  monthlySpendingLimit: '30,000',
  emergencyFundGoal: '100,000',
  savingGoal: '10,000',
  debtReductionGoal: '0',

  monthlyWorkTarget: '140',
  englishStudyGoal: '30 hours/month',
  importantWorkGoals: 'Complete active system migration and master the sheets synchronization pipeline.'
};

export default function GoalsAndStandards({ language }: GoalsAndStandardsProps) {
  const [goals, setGoals] = useState<GoalsState>(DEFAULT_GOALS);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    const savedData = safeLocalStorage.getItem('tuk_life_goals_standards');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setGoals((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Error parsing goals and standards:', e);
      }
    }
  }, []);

  const handleChange = (key: keyof GoalsState, value: any) => {
    setIsSaved(false);
    const updated = { ...goals, [key]: value };
    setGoals(updated);
    safeLocalStorage.setItem('tuk_life_goals_standards', JSON.stringify(updated));
  };

  const handleSave = async () => {
    safeLocalStorage.setItem('tuk_life_goals_standards', JSON.stringify(goals));
    logAudit('Updated', 'Goals', 'all', 'SUCCESS', 'Action: Updated goals and standards');
    
    // Sync to Sheets
    const url = safeLocalStorage.getItem('webAppUrl');
    let syncSuccess = true;
    if (url) {
      try {
        const response = await fetch(url + '?sheet=GARAGE', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update_vehicles', vehicles: goals.vehicles }),
        });
        if (!response.ok) throw new Error('Sync failed');
      } catch (e) {
        console.error("Sync failed, queued.", e);
        syncSuccess = false;
      }
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>🎯</span>
            <span>{language === 'th' ? 'เป้าหมายและมาตรฐานส่วนตัว' : 'Goals & Personal Standards'}</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1 leading-relaxed">
            {language === 'th' 
              ? 'กำหนดค่ามาตรฐาน เป้าหมายชีวิต และเงื่อนไขอ้างอิงเพื่อใช้ควบคุมวินัยและการดำเนินกิจกรรม'
              : 'Set personal baseline benchmarks, life goals, and standards to drive focus and track operations.'}
          </p>
        </div>
        
        <button
          onClick={handleSave}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 ${
            isSaved 
              ? 'bg-emerald-500 text-white' 
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
          id="btn-save-goals-standards"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 animate-bounce" />
              <span>{language === 'th' ? 'บันทึกสำเร็จ' : 'Saved Successfully'}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{language === 'th' ? 'บันทึกทั้งหมด' : 'Save All Standards'}</span>
            </>
          )}
        </button>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Group 1: Health Standards */}
        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/80 hover:border-slate-305 transition-all space-y-4 shadow-2xs">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200/60 text-slate-800">
            <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
              <Heart className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{language === 'th' ? '1. มาตรฐานสุขภาพ' : '1. Health Standards'}</h3>
              <p className="text-[10px] text-slate-400 font-medium">Weight, sleep, nutrition and fitness goals</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10.5px] font-bold text-slate-500 mb-1.5">
                {language === 'th' ? 'น้ำหนักเป้าหมาย (กก.)' : 'Target Weight (KG)'}
              </label>
              <input
                type="text"
                value={goals.targetWeight}
                onChange={(e) => handleChange('targetWeight', e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-rose-450 focus:border-rose-450 font-mono"
                placeholder="70.0"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-slate-500 mb-1.5">
                {language === 'th' ? 'ชั่วโมงนอนเป้าหมาย' : 'Target Sleep Hours'}
              </label>
              <input
                type="text"
                value={goals.targetSleepHours}
                onChange={(e) => handleChange('targetSleepHours', e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-rose-450 focus:border-rose-450 font-mono"
                placeholder="8"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-slate-500 mb-1.5">
                {language === 'th' ? 'เป้าหมายแคลอรีต่อวัน' : 'Daily Calories Goal'}
              </label>
              <input
                type="text"
                value={goals.dailyCaloriesGoal}
                onChange={(e) => handleChange('dailyCaloriesGoal', e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-rose-450 focus:border-rose-450 font-mono"
                placeholder="2000"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-slate-500 mb-1.5">
                {language === 'th' ? 'เป้าหมายการออกกำลังกาย' : 'Exercise Goal'}
              </label>
              <input
                type="text"
                value={goals.exerciseGoal}
                onChange={(e) => handleChange('exerciseGoal', e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-rose-450 focus:border-rose-450"
                placeholder="30 mins/day"
              />
            </div>
          </div>
        </div>

        {/* Group 2: Vehicle Standards */}
        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/80 hover:border-slate-305 transition-all space-y-4 shadow-2xs col-span-1 md:col-span-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 text-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><Car className="w-4.5 h-4.5" /></div>
              <div>
                <h3 className="text-sm font-bold">{language === 'th' ? '2. มาตรฐานยานพาหนะ' : '2. Vehicle Standards'}</h3>
                <p className="text-[10px] text-slate-400 font-medium">Car metrics, maintenance, taxes & insurance</p>
              </div>
            </div>
            <button 
              onClick={() => {
                const newVehicle: Vehicle = {id: Date.now().toString(), name: '', licensePlate: '', currentOdometer: '', nextServiceKm: '', insuranceExpiryDate: '', taxExpiryDate: '', remarks: '', status: 'ACTIVE'};
                handleChange('vehicles', [...goals.vehicles, newVehicle]);
              }}
              className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] rounded-lg font-bold"
            >
              + {language === 'th' ? 'เพิ่มรถ' : 'Add Vehicle'}
            </button>
          </div>

          {goals.vehicles.filter(v => v.status === 'ACTIVE').map((v, i) => (
            <div key={v.id} className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 p-3 bg-white rounded-xl border border-indigo-100 relative">
                <button 
                  onClick={() => {
                    const updatedVehicles = goals.vehicles.map(veh => veh.id === v.id ? { ...veh, status: 'DELETED' } : veh);
                    handleChange('vehicles', updatedVehicles);
                  }} 
                  className="absolute top-2 right-2 text-red-400 hover:text-red-600 font-bold text-[10px]"
                >
                  ✕
                </button>
              {[
                { label: language === 'th' ? 'ชื่อรถ' : 'Vehicle Name', key: 'name', type: 'text' },
                { label: language === 'th' ? 'ทะเบียน' : 'License Plate', key: 'licensePlate', type: 'text' },
                { label: language === 'th' ? 'เลขไมล์ ปัจจุบัน' : 'Curr. Odometer', key: 'currentOdometer', type: 'text' },
                { label: language === 'th' ? 'ระยะเช็คถัดไป' : 'Next Service KM', key: 'nextServiceKm', type: 'text' },
                { label: language === 'th' ? 'วันหมดประกัน' : 'Insurance Expiry', key: 'insuranceExpiryDate', type: 'date' },
                { label: language === 'th' ? 'วันหมดภาษี' : 'Tax Expiry', key: 'taxExpiryDate', type: 'date' },
                { label: language === 'th' ? 'หมายเหตุ' : 'Remarks', key: 'remarks', type: 'text' }
              ].map(field => (
                <div key={field.key} className={field.key === 'remarks' ? 'col-span-2 lg:col-span-4' : ''}>
                  <label className="block text-[9px] font-bold text-slate-500 mb-0.5">{field.label}</label>
                  <input
                    type={field.type}
                    value={v[field.key as keyof Vehicle]}
                    onChange={(e) => {
                        const updatedVehicles = goals.vehicles.map(veh => veh.id === v.id ? { ...veh, [field.key]: e.target.value } : veh);
                        handleChange('vehicles', updatedVehicles);
                    }}
                    className="w-full text-[11px] font-semibold px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Group 3: Finance Standards */}
        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/80 hover:border-slate-305 transition-all space-y-4 shadow-2xs">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200/60 text-slate-800">
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl">
              <PiggyBank className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{language === 'th' ? '3. มาตรฐานการเงิน' : '3. Finance Standards'}</h3>
              <p className="text-[10px] text-slate-400 font-medium">Spending limits, emergency fund & savings goals</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10.5px] font-bold text-slate-500 mb-1.5">
                {language === 'th' ? 'วงเงินใช้จ่ายต่อเดือน' : 'Monthly Spending Limit'}
              </label>
              <input
                type="text"
                value={goals.monthlySpendingLimit}
                onChange={(e) => handleChange('monthlySpendingLimit', e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-450 focus:border-emerald-450 font-mono"
                placeholder="30,000"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-slate-500 mb-1.5">
                {language === 'th' ? 'เป้าเงินสำรองฉุกเฉิน' : 'Emergency Fund Goal'}
              </label>
              <input
                type="text"
                value={goals.emergencyFundGoal}
                onChange={(e) => handleChange('emergencyFundGoal', e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-450 focus:border-emerald-450 font-mono"
                placeholder="100,005"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-slate-500 mb-1.5">
                {language === 'th' ? 'เป้าหมายเงินออมต่อเดือน' : 'Saving Goal'}
              </label>
              <input
                type="text"
                value={goals.savingGoal}
                onChange={(e) => handleChange('savingGoal', e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-450 focus:border-emerald-450 font-mono"
                placeholder="10,000"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-slate-500 mb-1.5">
                {language === 'th' ? 'เป้าลดหนี้ / ชำระหนี้' : 'Debt Reduction Goal'}
              </label>
              <input
                type="text"
                value={goals.debtReductionGoal}
                onChange={(e) => handleChange('debtReductionGoal', e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-450 focus:border-emerald-450 font-mono"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Group 4: Work Standards */}
        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/80 hover:border-slate-305 transition-all space-y-4 shadow-2xs">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200/60 text-slate-800">
            <div className="p-2 bg-indigo-50 text-indigo-500 rounded-xl">
              <Briefcase className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{language === 'th' ? '4. มาตรฐานงานและการเรียน' : '4. Work Standards'}</h3>
              <p className="text-[10px] text-slate-400 font-medium">Work hours, language goals, and milestones</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10.5px] font-bold text-slate-500 mb-1.5">
                {language === 'th' ? 'เป้าหมายชั่วโมงงาน / เดือน' : 'Monthly Work Target'}
              </label>
              <input
                type="text"
                value={goals.monthlyWorkTarget}
                onChange={(e) => handleChange('monthlyWorkTarget', e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-450 focus:border-indigo-450 font-mono"
                placeholder="140"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-slate-500 mb-1.5">
                {language === 'th' ? 'เป้าเรียนภาษาอังกฤษ' : 'English Study Goal'}
              </label>
              <input
                type="text"
                value={goals.englishStudyGoal}
                onChange={(e) => handleChange('englishStudyGoal', e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-450 focus:border-indigo-450"
                placeholder="30 mins/day"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[10.5px] font-bold text-slate-500 mb-1.5">
                {language === 'th' ? 'เป้าหมายการทำงานสำคัญ' : 'Important Work Goals'}
              </label>
              <textarea
                value={goals.importantWorkGoals}
                rows={2}
                onChange={(e) => handleChange('importantWorkGoals', e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-450 focus:border-indigo-450 resize-y leading-relaxed"
                placeholder="Important goals..."
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { safeLocalStorage } from '../utils/storage';
import { logAudit } from '../utils/audit';
import { getOptimizedActions, toggleFavorite } from '../utils/optimization';

interface QuickActionsGridProps {
  onActionSelect: (category: string, subject: string, type: string) => void;
  language: 'th' | 'en';
}

export const QuickActionsGrid = ({ onActionSelect, language }: QuickActionsGridProps) => {
  const getLabel = (en: string, th: string) => language === 'th' ? th : en;
  const [favorites, setFavorites] = useState<string[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('daily');

  useEffect(() => {
    setFavorites(JSON.parse(safeLocalStorage.getItem('tuk_favorites') || '[]'));
    setActions(getOptimizedActions(allActions));
  }, []);

  const allActions = [
    { label: 'Expense', labelTH: 'ค่าใช้จ่าย', emoji: '💸', category: 'finance', type: 'expense' },
    { label: 'Income', labelTH: 'รายรับ', emoji: '💰', category: 'finance', type: 'income' },
    { label: 'Food', labelTH: 'อาหาร', emoji: '🍜', category: 'health', type: 'calories' },
    { label: 'Weight', labelTH: 'น้ำหนัก', emoji: '⚖️', category: 'health', type: 'weight' },
    { label: 'Exercise', labelTH: 'ออกกำลังกาย', emoji: '🏃', category: 'health', type: 'exercise' },
    { label: 'Odometer', labelTH: 'เลขไมล์', emoji: '📍', category: 'garage', type: 'odometer' },
    { label: 'Sleep', labelTH: 'การนอน', emoji: '😴', category: 'health', type: 'sleep' },
    { label: 'Health', labelTH: 'สุขภาพ', emoji: '❤️', category: 'health', type: 'health_check' },
    { label: 'English', labelTH: 'ภาษาอังกฤษ', emoji: '📚', category: 'work', type: 'english_study' },
    { label: 'Work', labelTH: 'งาน', emoji: '💼', category: 'work', type: 'work_hours' },
    { label: 'Machine', labelTH: 'เครื่องจักร', emoji: '🏭', category: 'garage', type: 'maintenance' },
    { label: 'Purchase', labelTH: 'จัดซื้อ', emoji: '📦', category: 'finance', type: 'expense' },
    { label: 'Project', labelTH: 'โปรเจกต์', emoji: '🎯', category: 'work', type: 'task' },
    { label: 'Vehicle', labelTH: 'รถยนต์', emoji: '🚗', category: 'garage', type: 'maintenance' },
    { label: 'Fuel', labelTH: 'เติมน้ำมัน', emoji: '⛽', category: 'garage', type: 'fuel' },
    { label: 'Maintenance', labelTH: 'ซ่อมบำรุง', emoji: '🔧', category: 'garage', type: 'maintenance' },
    { label: 'Lifestyle', labelTH: 'ไลฟ์สไตล์', emoji: '📸', category: 'lifestyle', type: 'memory' },
    { label: 'Event', labelTH: 'เหตุการณ์', emoji: '📅', category: 'lifestyle', type: 'event' },
    { label: 'Mood', labelTH: 'อารมณ์', emoji: '😊', category: 'lifestyle', type: 'mood' },
    { label: 'Travel', labelTH: 'ท่องเที่ยว', emoji: '✈️', category: 'travel', type: 'travel' },
  ];

  const handleToggleFavorite = (e: React.MouseEvent, type: string) => {
    e.stopPropagation();
    toggleFavorite(type);
    setFavorites(JSON.parse(safeLocalStorage.getItem('tuk_favorites') || '[]'));
    setActions(getOptimizedActions(allActions));
  };

  const renderAction = (a: any) => (
    <button key={a.label} onClick={() => onActionSelect(a.category, getLabel(a.label, a.labelTH), a.type)} className="flex flex-col items-center p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <span className="text-xl mb-1">{a.emoji}</span>
      <span className="text-[10px] font-medium text-slate-700 text-center truncate w-full">{getLabel(a.label, a.labelTH)}</span>
    </button>
  );

  const favActions = actions.filter(a => favorites.includes(a.type));
  const workActions = actions.filter(a => a.category === 'work');
  const vehicleActions = actions.filter(a => a.category === 'garage');
  const dailyActions = actions.filter(a => a.category === 'health' || a.category === 'finance' || a.category === 'lifestyle' || a.category === 'travel');

  const tabs = [
      { id: 'daily', label: getLabel('Daily', '⭐ ประจำวัน'), items: dailyActions },
      { id: 'work', label: getLabel('Work', '💼 งาน'), items: workActions },
      { id: 'vehicle', label: getLabel('Vehicle', '🚗 รถ'), items: vehicleActions },
  ];

  return (
    <div className="space-y-4 mb-6">
      <div className="space-y-2">
        <h3 className="font-bold text-xs text-slate-500 uppercase">🔥 {getLabel('Recent', 'ใช้ล่าสุด')}</h3>
        <div className="grid grid-cols-4 gap-2">
            {actions.slice(0, 4).map(renderAction)}
        </div>
      </div>

      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
          {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-2 text-[10px] font-bold rounded-lg ${activeTab === tab.id ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
                  {tab.label}
              </button>
          ))}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {tabs.find(t => t.id === activeTab)?.items.map(renderAction)}
      </div>
    </div>
  );
};

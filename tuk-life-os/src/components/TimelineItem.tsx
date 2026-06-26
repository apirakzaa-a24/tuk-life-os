import React from 'react';

interface TimelineEvent {
  id: string;
  timestamp: string;
  timeLabel: string;
  category: 'finance' | 'health' | 'garage' | 'work' | 'travel' | 'lifestyle';
  subject: string;
  value: string;
  unit: string;
  details: string;
  tags: string[];
  status: 'sent' | 'failed' | 'simulated' | 'DELETED' | 'resolved' | 'ignored';
  sheetTarget: string;
}

export const TimelineItem = ({ 
  event, 
  onEdit, 
  onDelete, 
  onSelect 
}: { 
  event: TimelineEvent; 
  onEdit: (e: TimelineEvent) => void; 
  onDelete: (e: TimelineEvent) => void;
  onSelect: (e: TimelineEvent) => void;
}) => {
  return (
    <div key={event.id} onClick={() => onSelect(event)} className="border rounded-lg p-3 text-xs flex justify-between items-start cursor-pointer hover:bg-slate-50">
      <div>
        <div className="font-bold text-slate-900">{event.subject}</div>
        <div className="text-slate-500 mt-1">
          {event.timeLabel} • {event.category} • {event.value} {event.unit}
        </div>
        <div className="mt-1 text-[10px] font-bold">
          {event.status === 'sent' ? '🟢 ซิงก์แล้ว' :
           event.status === 'failed' ? '🔴 ซิงก์ล้มเหลว' :
           '🟡 รอซิงก์'}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={(e) => { e.stopPropagation(); onEdit(event); }} className="text-teal-600 font-bold">แก้ไข</button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(event); }} className="text-rose-600 font-bold">ลบ</button>
      </div>
    </div>
  );
};

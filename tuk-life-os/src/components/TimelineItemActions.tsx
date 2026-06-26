import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';

interface Props {
  event: any; // TimelineEvent
  onDelete: (event: any) => void;
  onEdit: (event: any) => void;
}

export const TimelineItemActions: React.FC<Props> = ({ event, onDelete, onEdit }) => {
  return (
    <div className="flex gap-1 ml-auto shrink-0">
      <button
        onClick={(e) => { e.stopPropagation(); onEdit(event); }}
        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(event); }}
        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

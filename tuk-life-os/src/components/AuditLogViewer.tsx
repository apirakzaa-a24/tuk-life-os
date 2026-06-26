import React, { useState, useMemo } from 'react';
import { Trash2, Filter } from 'lucide-react';
import { AuditLogEntry } from '../utils/audit';

export default function AuditLogViewer({ language }: { language: 'th' | 'en' }) {
  const [logs, setLogs] = useState<AuditLogEntry[]>(() => 
    JSON.parse(localStorage.getItem('tuk_life_audit_logs') || '[]')
  );
  const [filter, setFilter] = useState<string>('All');

  const filteredLogs = useMemo(() => {
    let l = [...logs].reverse();
    if (filter !== 'All') l = l.filter(log => log.module === filter);
    return l.slice(0, 20);
  }, [logs, filter]);

  const clearLogs = () => {
    if (confirm(language === 'th' ? 'ล้างประวัติการทำงาน?' : 'Clear audit log?')) {
        localStorage.setItem('tuk_life_audit_logs', '[]');
        setLogs([]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-sm flex items-center gap-2">📜 ประวัติการทำงาน</h3>
        <button onClick={clearLogs} className="text-red-500"><Trash2 size={16}/></button>
      </div>
      <select onChange={e => setFilter(e.target.value)} className="w-full text-xs p-2 rounded-lg border">
        <option value="All">All Modules</option>
        <option value="Timeline">Timeline</option>
        <option value="Goals">Goals</option>
        <option value="Vehicle">Vehicle</option>
        <option value="Backup">Backup</option>
        <option value="Sync">Sync</option>
      </select>
      <div className="space-y-2 max-h-60 overflow-y-auto text-[10px]">
        {filteredLogs.map((log, i) => (
            <div key={i} className="border-b pb-1">
                <div className="flex justify-between font-bold">
                    <span>{log.module} - {log.action}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div>{log.description} ({log.recordId})</div>
            </div>
        ))}
      </div>
    </div>
  );
}

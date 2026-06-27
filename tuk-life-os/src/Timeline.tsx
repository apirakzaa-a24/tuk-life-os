import React, { useMemo, useState } from 'react';
import { useAppData } from './context/AppDataProvider';
import { MODULE_MAP, MODULES } from './data/modules';
import type { LifeRecord, ModuleKey, Status } from './types/database';
import './timelineStyles.css';

type TimelineFilter = 'all' | 'today' | 'week' | 'upcoming' | 'overdue' | 'done';

const dateOnly = (value?: string) => (value || '').slice(0, 10);
const today = () => new Date().toISOString().slice(0, 10);

function addDays(base: string, days: number) {
  const d = new Date(`${base}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function recordTimelineDate(record: LifeRecord) {
  return dateOnly(record.dueDate) || dateOnly(record.date) || dateOnly(record.updatedAt) || dateOnly(record.createdAt);
}

function classify(record: LifeRecord, nowDate: string): TimelineFilter[] {
  const d = recordTimelineDate(record);
  const weekEnd = addDays(nowDate, 7);
  const result: TimelineFilter[] = ['all'];
  if (d === nowDate) result.push('today');
  if (d >= nowDate && d <= weekEnd) result.push('week');
  if (d > nowDate && record.status !== 'done') result.push('upcoming');
  if (d < nowDate && record.status !== 'done' && record.status !== 'archived') result.push('overdue');
  if (record.status === 'done') result.push('done');
  return result;
}

function formatDate(value: string) {
  if (!value) return '-';
  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return value;
  }
}

function statusLabel(status: Status) {
  const labels: Record<Status, string> = {
    planned: 'Planned',
    active: 'Active',
    waiting: 'Waiting',
    done: 'Done',
    paused: 'Paused',
    archived: 'Archived'
  };
  return labels[status] || status;
}

function TimelineRecord({ record }: { record: LifeRecord }) {
  const module = MODULE_MAP[record.module];
  const sub = module?.subModules.find(s => s.key === record.subModule);
  const d = recordTimelineDate(record);

  return (
    <article className={`timelineItem status-${record.status}`}>
      <div className="timelineDate">
        <b>{formatDate(d)}</b>
        <span>{record.dueDate ? 'Due Date' : 'Record Date'}</span>
      </div>

      <div className="timelineDot" style={{ background: module?.color || '#60a5fa' }} />

      <div className="timelineCard">
        <div className="timelineTop">
          <div>
            <div className="timelineModule">{module?.icon} {module?.label || record.module}</div>
            <h3>{record.title || '(ไม่มีชื่อ)'}</h3>
          </div>
          <span className="timelineStatus">{statusLabel(record.status)}</span>
        </div>

        <p>{record.detail || '-'}</p>

        <div className="timelineChips">
          <i>{sub?.label || record.subModule}</i>
          <i>{record.kind}</i>
          <i>{record.priority}</i>
          {record.amount !== undefined && <i>{record.amount.toLocaleString()} {record.unit || record.currency || ''}</i>}
          {record.targetAmount !== undefined && <i>Target {record.targetAmount.toLocaleString()} {record.unit || ''}</i>}
          {record.tags.map(tag => <i key={tag}>#{tag}</i>)}
          {record.linkedTo?.map(link => <i key={`${link.module}-${link.recordId || link.note || ''}`}>↔ {MODULE_MAP[link.module]?.label || link.module}</i>)}
        </div>

        {typeof record.progress === 'number' && (
          <div className="timelineProgress">
            <em style={{ width: `${Math.max(0, Math.min(100, record.progress))}%` }} />
          </div>
        )}
      </div>
    </article>
  );
}

export default function Timeline() {
  const { records } = useAppData();
  const [filter, setFilter] = useState<TimelineFilter>('all');
  const [moduleFilter, setModuleFilter] = useState<ModuleKey | 'all'>('all');
  const [q, setQ] = useState('');
  const nowDate = today();

  const filtered = useMemo(() => {
    return records
      .filter(record => moduleFilter === 'all' || record.module === moduleFilter)
      .filter(record => classify(record, nowDate).includes(filter))
      .filter(record => (`${record.title} ${record.detail} ${record.tags.join(' ')} ${record.subModule}`).toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => {
        const da = recordTimelineDate(a) || '9999-99-99';
        const db = recordTimelineDate(b) || '9999-99-99';
        if (filter === 'overdue') return da.localeCompare(db);
        return db.localeCompare(da) || b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [records, filter, moduleFilter, q, nowDate]);

  const totals = useMemo(() => ({
    all: records.length,
    today: records.filter(r => classify(r, nowDate).includes('today')).length,
    week: records.filter(r => classify(r, nowDate).includes('week')).length,
    upcoming: records.filter(r => classify(r, nowDate).includes('upcoming')).length,
    overdue: records.filter(r => classify(r, nowDate).includes('overdue')).length,
    done: records.filter(r => r.status === 'done').length
  }), [records, nowDate]);

  const filters: { key: TimelineFilter; label: string }[] = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'today', label: 'วันนี้' },
    { key: 'week', label: '7 วัน' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'done', label: 'Done' }
  ];

  return (
    <div className="space timelinePage">
      <section className="timelineHero">
        <div>
          <div className="eyebrow">📅 Timeline</div>
          <h1>ไทม์ไลน์รวมทุกโมดูล</h1>
          <p>ดึงข้อมูลจาก Finance, Health, Travel, Vehicle, Fitness, Work, Goals, Reminders และทุกหมวดมาเรียงตามเวลาในที่เดียว</p>
        </div>
        <div className="timelineHeroStats">
          <b>{filtered.length}</b>
          <span>รายการที่แสดง</span>
          <small>Today: {totals.today} · Overdue: {totals.overdue}</small>
        </div>
      </section>

      <div className="timelineControls">
        <input className="search" value={q} onChange={e => setQ(e.target.value)} placeholder="ค้นหา Timeline..." />
        <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value as ModuleKey | 'all')}>
          <option value="all">ทุกโมดูล</option>
          {MODULES.map(module => <option key={module.key} value={module.key}>{module.icon} {module.label}</option>)}
        </select>
      </div>

      <div className="timelineTabs">
        {filters.map(item => (
          <button key={item.key} className={filter === item.key ? 'active' : ''} onClick={() => setFilter(item.key)}>
            {item.label} <span>{totals[item.key]}</span>
          </button>
        ))}
      </div>

      <div className="timelineList">
        {filtered.length ? filtered.map(record => <TimelineRecord key={record.id} record={record} />) : <div className="empty">ยังไม่มีข้อมูลใน Timeline นี้</div>}
      </div>
    </div>
  );
}

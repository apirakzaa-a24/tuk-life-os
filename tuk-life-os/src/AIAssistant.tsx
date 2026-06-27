import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { AIEntry, AIModuleTarget } from './aiTypes';
import { calculateExpression, clearAIEntries, createAIEntry, deleteAIEntry, getAIEntries, saveAIEntry } from './aiService';
import './aiStyles.css';

type Props = {
  onSendToModule?: (entry: AIEntry) => void;
};

const modules: AIModuleTarget[] = [
  'finance',
  'health',
  'fitness',
  'travel',
  'vehicle',
  'work',
  'machine',
  'learning',
  'home',
  'family',
  'goals',
  'habits',
  'winfile',
  'notes',
  'shopping',
  'documents',
  'reminders',
];

export default function AIAssistant({ onSendToModule }: Props) {
  const [text, setText] = useState('');
  const [target, setTarget] = useState<AIModuleTarget>('notes');
  const [entries, setEntries] = useState<AIEntry[]>([]);
  const [calculator, setCalculator] = useState('');
  const [calculatorResult, setCalculatorResult] = useState('');
  const [listening, setListening] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setEntries(getAIEntries());
  }, []);

  const latest = useMemo(() => entries.slice(0, 6), [entries]);

  function handleSave(inputType: AIEntry['inputType'], overrideText?: string, file?: { name: string; preview?: string }) {
    const value = (overrideText || text).trim();
    if (!value) return;
    const entry = createAIEntry({ inputType, text: value, targetModule: target, attachmentName: file?.name, attachmentPreview: file?.preview });
    const next = saveAIEntry(entry);
    setEntries(next);
    setText('');
    onSendToModule?.(entry);
  }

  function handleCalculate() {
    const result = calculateExpression(calculator);
    setCalculatorResult(result);
    const entry = createAIEntry({ inputType: 'calculator', text: `${calculator} = ${result}`, targetModule: target });
    setEntries(saveAIEntry(entry));
    onSendToModule?.(entry);
  }

  function handlePhoto(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const preview = typeof reader.result === 'string' ? reader.result : undefined;
      handleSave('photo', `วิเคราะห์ไฟล์/รูป: ${file.name}`, { name: file.name, preview });
    };
    reader.readAsDataURL(file);
  }

  function handleVoice() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser นี้ยังไม่รองรับ Voice Recognition ให้ใช้ Chrome/Edge รุ่นล่าสุด');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'th-TH';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListening(true);
    recognition.onresult = (event: any) => {
      const voiceText = event.results?.[0]?.[0]?.transcript || '';
      setListening(false);
      setText(voiceText);
      handleSave('voice', voiceText);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  return (
    <div className="ai-shell">
      <section className="ai-hero">
        <div>
          <p className="ai-kicker">TUK OS AI Core</p>
          <h1>AI Assistant</h1>
          <p>ถาม AI, พูด, แนบรูป/ไฟล์, คำนวณ และส่งข้อมูลไปยังโมดูลหลักได้จากจุดเดียว</p>
        </div>
        <div className="ai-badge">Local-first</div>
      </section>

      <section className="ai-grid">
        <div className="ai-card ai-span-2">
          <h2>AI Chat / Command</h2>
          <label>ส่งเข้าโมดูล</label>
          <select value={target} onChange={(event) => setTarget(event.target.value as AIModuleTarget)}>
            {modules.map((module) => (
              <option key={module} value={module}>{module}</option>
            ))}
          </select>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="ตัวอย่าง: วันนี้น้ำหนัก 62.2 kg / จ่ายค่าผ่อน BYD 17,796 บาท / วางแผนเที่ยว Beijing"
          />
          <div className="ai-actions">
            <button onClick={() => handleSave('chat')}>บันทึกจากข้อความ</button>
            <button onClick={handleVoice}>{listening ? 'กำลังฟัง...' : 'พูดกับ AI'}</button>
            <button onClick={() => fileRef.current?.click()}>แนบรูป/ไฟล์</button>
          </div>
          <input ref={fileRef} type="file" accept="image/*,.pdf,.txt" hidden onChange={(event) => handlePhoto(event.target.files?.[0])} />
        </div>

        <div className="ai-card">
          <h2>AI Calculator</h2>
          <input value={calculator} onChange={(event) => setCalculator(event.target.value)} placeholder="เช่น 17796*12" />
          <button onClick={handleCalculate}>คำนวณและบันทึก</button>
          {calculatorResult && <div className="ai-result">ผลลัพธ์: {calculatorResult}</div>}
        </div>
      </section>

      <section className="ai-card">
        <div className="ai-list-head">
          <h2>AI Logs ล่าสุด</h2>
          <button className="ai-danger" onClick={() => { clearAIEntries(); setEntries([]); }}>ล้าง AI Logs</button>
        </div>
        <div className="ai-list">
          {latest.length === 0 && <p className="ai-empty">ยังไม่มี AI Log</p>}
          {latest.map((entry) => (
            <article key={entry.id} className="ai-entry">
              <div>
                <strong>{entry.title}</strong>
                <p>{entry.aiSummary}</p>
                <small>{entry.targetModule} • {entry.kind} • {new Date(entry.createdAt).toLocaleString('th-TH')}</small>
                {entry.attachmentPreview && <img src={entry.attachmentPreview} alt={entry.attachmentName} className="ai-preview" />}
              </div>
              <button onClick={() => setEntries(deleteAIEntry(entry.id))}>ลบ</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

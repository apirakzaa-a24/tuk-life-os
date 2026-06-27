import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { AIAttachment, AIEntry, AIInputType, AIModuleTarget } from './aiTypes';
import {
  analyzeText,
  calculateExpression,
  clearAIEntries,
  createAIEntry,
  createAttachmentId,
  deleteAIEntry,
  getAIEntries,
  saveAIEntry,
} from './aiService';
import './aiStyles.css';

type Props = {
  onSendToModule?: (entry: AIEntry) => void;
};

type Mode = 'text' | 'camera' | 'gallery' | 'voice' | 'scan' | 'vision';

type ReviewDraft = {
  inputType: AIInputType;
  text: string;
  target: AIModuleTarget;
  attachments: AIAttachment[];
  analysis: ReturnType<typeof analyzeText>;
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

const moduleLabels: Record<AIModuleTarget, string> = {
  finance: '💰 Finance ERP',
  health: '💙 Health System',
  fitness: '🏃 Fitness ERP',
  travel: '✈️ Travel',
  vehicle: '🚗 Vehicle',
  work: '🏭 Work / Satys',
  machine: '⚙️ Machine',
  learning: '📚 Learning',
  home: '🏠 Home',
  family: '👶 Family',
  goals: '🎯 Goals',
  habits: '✅ Habits',
  winfile: '🏆 Win File',
  notes: '📝 Notes',
  shopping: '🛒 Shopping',
  documents: '📄 Documents',
  reminders: '⏰ Reminders',
};

const quickPrompts = [
  'บันทึกรายจ่าย 250 บาท ค่าอาหาร',
  'วันนี้น้ำหนัก 62.2 kg',
  'นัดประชุมลูกค้า พรุ่งนี้ 10:00',
  'วางแผนเที่ยวปักกิ่ง 4 วัน',
];

function fileKind(file: File): AIAttachment['kind'] {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('text/')) return 'text';
  if (/pdf|word|excel|sheet|document|csv/i.test(file.type) || /\.(pdf|docx?|xlsx?|csv)$/i.test(file.name)) return 'document';
  return 'other';
}

function dataUrlSize(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] || '';
  return Math.round((base64.length * 3) / 4);
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || '').slice(0, 6000));
    reader.onerror = () => resolve('');
    reader.readAsText(file);
  });
}

async function compressImageDataUrl(dataUrl: string, name: string, type = 'image/webp'): Promise<AIAttachment> {
  const image = await loadImage(dataUrl);
  const maxWidth = 1280;
  const ratio = Math.min(1, maxWidth / image.width);
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx?.drawImage(image, 0, 0, width, height);
  const compressed = canvas.toDataURL(type, 0.62);

  const thumbMax = 360;
  const thumbRatio = Math.min(1, thumbMax / image.width);
  const thumb = document.createElement('canvas');
  thumb.width = Math.max(1, Math.round(image.width * thumbRatio));
  thumb.height = Math.max(1, Math.round(image.height * thumbRatio));
  thumb.getContext('2d')?.drawImage(image, 0, 0, thumb.width, thumb.height);
  const thumbnail = thumb.toDataURL('image/webp', 0.5);
  const originalSize = dataUrlSize(dataUrl);
  const compressedSize = dataUrlSize(compressed);

  return {
    id: createAttachmentId(),
    name: name.replace(/\.[^.]+$/, '') + '.webp',
    type: 'image/webp',
    kind: 'image',
    size: compressedSize,
    originalSize,
    compressedSize,
    compressionRatio: originalSize ? Math.round((1 - compressedSize / originalSize) * 100) : 0,
    dataUrl: compressed,
    thumbnail,
    createdAt: new Date().toISOString(),
  };
}

async function fileToAttachment(file: File): Promise<AIAttachment> {
  const kind = fileKind(file);
  if (kind === 'image') {
    const dataUrl = await readAsDataUrl(file);
    return compressImageDataUrl(dataUrl, file.name);
  }

  const textContent = kind === 'text' || /\.(txt|csv|md|json)$/i.test(file.name) ? await readAsText(file) : '';
  return {
    id: createAttachmentId(),
    name: file.name,
    type: file.type || 'application/octet-stream',
    kind,
    size: file.size,
    originalSize: file.size,
    compressedSize: file.size,
    compressionRatio: 0,
    textContent,
    createdAt: new Date().toISOString(),
  };
}

export default function AIAssistant({ onSendToModule }: Props) {
  const [mode, setMode] = useState<Mode>('text');
  const [text, setText] = useState('');
  const [target, setTarget] = useState<AIModuleTarget>('notes');
  const [attachments, setAttachments] = useState<AIAttachment[]>([]);
  const [entries, setEntries] = useState<AIEntry[]>([]);
  const [calculator, setCalculator] = useState('');
  const [calculatorResult, setCalculatorResult] = useState('');
  const [listening, setListening] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState<ReviewDraft | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const cameraRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setEntries(getAIEntries());
    return () => stopCamera();
  }, []);

  const latest = useMemo(() => entries.slice(0, 8), [entries]);
  const totalCompressed = useMemo(() => attachments.reduce((sum, file) => sum + (file.compressionRatio || 0), 0), [attachments]);

  function resetInput() {
    setText('');
    setAttachments([]);
    setReview(null);
    setCalculatorResult('');
  }

  function makeReview(inputType: AIInputType, overrideText?: string, overrideAttachments = attachments) {
    const value = (overrideText ?? text).trim();
    if (!value && overrideAttachments.length === 0) {
      alert('กรุณาพิมพ์ข้อความ ถ่ายรูป หรือแนบไฟล์ก่อน');
      return;
    }
    const analysis = analyzeText(value || `วิเคราะห์ไฟล์ ${overrideAttachments.map((file) => file.name).join(', ')}`, inputType, overrideAttachments, target);
    setTarget(analysis.targetModule);
    setReview({ inputType, text: value, target: analysis.targetModule, attachments: overrideAttachments, analysis });
  }

  function confirmSave() {
    if (!review) return;
    const entry = createAIEntry({
      inputType: review.inputType,
      text: review.text || review.analysis.title,
      targetModule: review.target,
      attachments: review.attachments,
    });
    const next = saveAIEntry(entry);
    setEntries(next);
    onSendToModule?.(entry);
    resetInput();
  }

  async function handleFiles(fileList?: FileList | null, inputType: AIInputType = 'file') {
    if (!fileList?.length) return;
    setBusy(true);
    try {
      const converted = await Promise.all(Array.from(fileList).map(fileToAttachment));
      const next = [...attachments, ...converted].slice(0, 8);
      setAttachments(next);
      const textHint = converted.map((file) => `${file.kind}: ${file.name}`).join(', ');
      makeReview(inputType, text || `วิเคราะห์ไฟล์/รูป: ${textHint}`, next);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
      if (cameraRef.current) cameraRef.current.value = '';
    }
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraRef.current?.click();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      setCameraOn(true);
      setMode('camera');
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 50);
    } catch {
      cameraRef.current?.click();
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  async function capturePhoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const raw = canvas.toDataURL('image/jpeg', 0.92);
    setBusy(true);
    try {
      const photo = await compressImageDataUrl(raw, `camera_${Date.now()}.jpg`);
      const next = [...attachments, photo];
      setAttachments(next);
      makeReview('camera', text || 'ถ่ายรูปและให้ AI วิเคราะห์', next);
    } finally {
      setBusy(false);
    }
  }

  function removeAttachment(id: string) {
    const next = attachments.filter((file) => file.id !== id);
    setAttachments(next);
    if (review) setReview({ ...review, attachments: next, analysis: analyzeText(review.text, review.inputType, next, target) });
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
      makeReview('voice', voiceText);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  function handleCalculate() {
    const result = calculateExpression(calculator);
    setCalculatorResult(result);
    const calcText = `${calculator} = ${result}`;
    const calcTarget: AIModuleTarget = /kg|bmi|kcal|cal/i.test(calculator) ? 'health' : 'finance';
    const analysis = analyzeText(calcText, 'calculator', [], calcTarget);
    setReview({ inputType: 'calculator', text: calcText, target: calcTarget, attachments: [], analysis });
  }

  function quickSave(prompt: string) {
    setText(prompt);
    makeReview('quick-action', prompt, []);
  }

  const currentAnalysis = review?.analysis || analyzeText(text, mode === 'camera' ? 'camera' : 'chat', attachments, target);

  return (
    <div className="ai-os-shell">
      <section className="ai-os-hero">
        <div>
          <p className="ai-kicker">TUK OS AI Core v2</p>
          <h1>AI Assistant</h1>
          <p>ศูนย์รับข้อมูลทุกอย่าง: ถ่ายรูป แนบไฟล์ พูด พิมพ์ คำนวณ วิเคราะห์ และบันทึกเข้าระบบหลักพร้อม Timeline</p>
        </div>
        <div className="ai-status-grid">
          <span>AI Status <b>Local</b></span>
          <span>Memory <b>Active</b></span>
          <span>Image <b>WebP</b></span>
        </div>
      </section>

      <div className="ai-mode-tabs">
        <button className={mode === 'camera' ? 'active' : ''} onClick={startCamera}>📷 Camera</button>
        <button className={mode === 'gallery' ? 'active' : ''} onClick={() => { setMode('gallery'); fileRef.current?.click(); }}>🖼 Gallery / File</button>
        <button className={mode === 'voice' ? 'active' : ''} onClick={() => { setMode('voice'); handleVoice(); }}>🎤 Voice</button>
        <button className={mode === 'text' ? 'active' : ''} onClick={() => setMode('text')}>⌨ Text</button>
        <button className={mode === 'scan' ? 'active' : ''} onClick={() => { setMode('scan'); cameraRef.current?.click(); }}>📄 Scan</button>
        <button className={mode === 'vision' ? 'active' : ''} onClick={() => { setMode('vision'); fileRef.current?.click(); }}>🧠 Vision</button>
      </div>

      <section className="ai-os-grid">
        <div className="ai-panel ai-camera-panel">
          <div className="ai-panel-head">
            <h2>📷 AI Camera / Input</h2>
            <span>{busy ? 'กำลังบีบอัด...' : 'Auto Compress WebP'}</span>
          </div>
          {cameraOn ? (
            <div className="camera-box">
              <video ref={videoRef} autoPlay playsInline muted />
              <div className="camera-controls">
                <button onClick={capturePhoto}>ถ่ายรูป</button>
                <button className="ghost" onClick={stopCamera}>ปิดกล้อง</button>
              </div>
            </div>
          ) : (
            <div className="camera-placeholder">
              <div>📷</div>
              <strong>Camera Ready</strong>
              <p>เปิดกล้องเพื่อถ่ายรูป แล้วระบบจะบีบอัดเป็น WebP และสร้าง thumbnail อัตโนมัติ</p>
              <button onClick={startCamera}>เปิดกล้อง</button>
            </div>
          )}

          <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(event) => handleFiles(event.target.files, 'camera')} />
          <input ref={fileRef} type="file" accept="image/*,.pdf,.txt,.csv,.json,.md,.doc,.docx,.xls,.xlsx" multiple hidden onChange={(event) => handleFiles(event.target.files, mode === 'vision' ? 'vision' : 'file')} />

          <div className="attachment-strip">
            {attachments.length === 0 && <div className="drop-card" onClick={() => fileRef.current?.click()}>+ เพิ่มรูป/ไฟล์</div>}
            {attachments.map((file) => (
              <article key={file.id} className="attachment-card">
                {file.thumbnail || file.dataUrl ? <img src={file.thumbnail || file.dataUrl} alt={file.name} /> : <div className="file-icon">📄</div>}
                <div>
                  <b>{file.name}</b>
                  <small>{Math.round(file.size / 1024)} KB {file.compressionRatio ? `• ลด ${file.compressionRatio}%` : ''}</small>
                </div>
                <button onClick={() => removeAttachment(file.id)}>ลบ</button>
              </article>
            ))}
          </div>
        </div>

        <div className="ai-panel ai-command-panel">
          <div className="ai-panel-head">
            <h2>🤖 AI Chat / Command</h2>
            <span>Confidence {currentAnalysis.confidence}%</span>
          </div>
          <label>ส่งเข้าโมดูล</label>
          <select value={target} onChange={(event) => setTarget(event.target.value as AIModuleTarget)}>
            {modules.map((module) => <option key={module} value={module}>{moduleLabels[module]}</option>)}
          </select>
          <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="ตัวอย่าง: วันนี้น้ำหนัก 62.2 kg / จ่ายค่าผ่อน BYD 17,796 บาท / ถ่ายใบเสร็จแล้วบันทึก" />
          <div className="ai-actions">
            <button onClick={() => makeReview('chat')}>วิเคราะห์ก่อนบันทึก</button>
            <button onClick={confirmSave} disabled={!review}>บันทึกข้อมูล</button>
            <button className="ghost" onClick={resetInput}>ล้าง</button>
          </div>
          <div className="quick-prompt-row">
            {quickPrompts.map((prompt) => <button key={prompt} onClick={() => quickSave(prompt)}>{prompt}</button>)}
          </div>
        </div>

        <div className="ai-panel ai-calc-panel">
          <h2>🧮 AI Calculator</h2>
          <input value={calculator} onChange={(event) => setCalculator(event.target.value)} placeholder="เช่น 17796*12" />
          <button onClick={handleCalculate}>คำนวณ + เตรียมบันทึก</button>
          {calculatorResult && <div className="big-result">{calculatorResult}</div>}
          <div className="calc-examples">
            <span>17796*12</span>
            <span>81000-17796</span>
            <span>62.2/(1.68*1.68)</span>
          </div>
        </div>
      </section>

      {review && (
        <section className="ai-review-panel">
          <div className="ai-review-main">
            <h2>✅ Review Before Save</h2>
            <p>{review.analysis.summary}</p>
            <div className="review-grid">
              <div><span>Module</span><b>{moduleLabels[review.target]}</b></div>
              <div><span>Kind</span><b>{review.analysis.kind}</b></div>
              <div><span>Amount</span><b>{review.analysis.amount ?? '-'} {review.analysis.unit || ''}</b></div>
              <div><span>Confidence</span><b>{review.analysis.confidence}%</b></div>
            </div>
            <div className="chips">{review.analysis.tags.map((tag) => <i key={tag}>#{tag}</i>)}</div>
            {review.analysis.extractedFields.length > 0 && <div className="extracted-list">{review.analysis.extractedFields.map((field) => <span key={field.key}>{field.label}: <b>{field.value}</b></span>)}</div>}
          </div>
          <div className="review-actions">
            <button onClick={confirmSave}>บันทึกเข้าระบบหลัก</button>
            <button className="ghost" onClick={() => setReview(null)}>กลับไปแก้</button>
          </div>
        </section>
      )}

      <section className="ai-panel">
        <div className="ai-list-head">
          <h2>📚 AI Logs ล่าสุด</h2>
          <div className="ai-actions compact">
            <button className="ghost" onClick={() => setEntries(getAIEntries())}>รีเฟรช</button>
            <button className="ai-danger" onClick={() => { clearAIEntries(); setEntries([]); }}>ล้าง AI Logs</button>
          </div>
        </div>
        <div className="ai-log-list">
          {latest.length === 0 && <p className="ai-empty">ยังไม่มี AI Log</p>}
          {latest.map((entry) => (
            <article key={entry.id} className="ai-log-entry">
              <div className="log-icon">{entry.inputType === 'camera' || entry.inputType === 'photo' ? '📷' : entry.inputType === 'voice' ? '🎤' : entry.inputType === 'calculator' ? '🧮' : '🤖'}</div>
              <div>
                <strong>{entry.title}</strong>
                <p>{entry.aiSummary}</p>
                <small>{moduleLabels[entry.targetModule]} • {entry.kind} • {new Date(entry.createdAt).toLocaleString('th-TH')} • {entry.confidence}%</small>
              </div>
              {entry.attachmentPreview && <img src={entry.attachmentPreview} alt={entry.attachmentName} />}
              <button onClick={() => setEntries(deleteAIEntry(entry.id))}>ลบ</button>
            </article>
          ))}
        </div>
      </section>

      <section className="ai-bottom-bar">
        <div>📅 วันนี้</div>
        <div>📎 ไฟล์แนบ {attachments.length}</div>
        <div>🗜 บีบอัดเฉลี่ย {attachments.length ? Math.round(totalCompressed / attachments.length) : 0}%</div>
        <div>🧠 Logs {entries.length}</div>
      </section>
    </div>
  );
}

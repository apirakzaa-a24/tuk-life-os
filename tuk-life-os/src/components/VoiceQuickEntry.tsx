import React, { useState, useRef, useEffect } from 'react';
import { Mic, Check, X, Send, AlertCircle, Edit3 } from 'lucide-react';

export const VoiceQuickEntry = ({ onSave, language }: { onSave: (data: any) => void, language: 'th' | 'en' }) => {
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<any>(null);
  const [manualInput, setManualInput] = useState('');
  const [showManualFallback, setShowManualFallback] = useState(false);
  const recognitionRef = useRef<any>(null);

  const getThaiError = (error: string) => {
    switch (error) {
      case 'not-allowed': return "ไมโครโฟนถูกปฏิเสธ กรุณาอนุญาตไมโครโฟนในเบราว์เซอร์";
      case 'audio-capture': return "ไม่พบไมโครโฟนในอุปกรณ์นี้";
      case 'no-speech': return "ไม่ได้ยินเสียง กรุณาลองพูดอีกครั้ง";
      case 'not-supported': return "เบราว์เซอร์นี้ยังไม่รองรับการบันทึกด้วยเสียง";
      case 'iframe': return "ระบบ Preview อาจไม่อนุญาตไมโครโฟน กรุณาทดสอบบนหน้าเว็บจริงหรือเปิดสิทธิ์ Microphone";
      default: return `เกิดข้อผิดพลาด: ${error}`;
    }
  };

  const parseText = (text: string) => {
    if (text.includes('น้ำหนัก')) {
       const val = text.match(/\d+(\.\d+)?/)?.[0];
       return { category: 'health', type: 'weight', value: val, unit: 'kg', subject: 'Weight' };
    } else if (text.includes('กิน') || text.includes('บาท')) {
        const cost = text.match(/\d+/)?.[0];
        return { category: 'health', type: 'food', subject: text, value: cost, unit: 'baht' };
    } else if (text.includes('เรียน')) {
        const time = text.match(/\d+/)?.[0];
        return { category: 'work', type: 'english_study', value: time, unit: 'min' };
    }
    return null;
  };

  const startListening = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('not-supported');
      setStatus('error');
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err: any) {
      if (err.name === 'NotAllowedError') setError('not-allowed');
      else if (err.name === 'NotFoundError') setError('audio-capture');
      else setError('iframe');
      setStatus('error');
      return;
    }

    setStatus('listening');
    setError(null);
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'th-TH';
    recognition.onstart = () => setStatus('listening');
    recognition.onend = () => setStatus('idle');
    recognition.onerror = (event: any) => {
      setError(event.error);
      setStatus('error');
    };
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      const result = parseText(text);
      if (result) setParsed(result);
      setStatus('idle');
    };
    recognition.start();
  };

  return (
    <div className="bg-white border p-4 rounded-xl shadow-sm mt-4">
      <h3 className="font-bold text-xs uppercase text-slate-800 mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5"><Mic className="w-3.5 h-3.5 text-red-500" /> 🎙️ {language === 'th' ? 'บันทึกด้วยเสียง' : 'Voice Input'}</span>
        <button onClick={() => setShowManualFallback(!showManualFallback)} className="text-indigo-600 hover:text-indigo-800">
          <Edit3 size={14} />
        </button>
      </h3>
      
      {showManualFallback ? (
        <div className="flex gap-2">
            <input type="text" value={manualInput} onChange={(e) => setManualInput(e.target.value)} className="flex-1 border p-2 rounded-lg text-xs" placeholder={language === 'th' ? 'น้ำหนัก 64.5 กิโล' : 'Weight 64.5 kg'} />
            <button onClick={() => setParsed(parseText(manualInput))} className="bg-indigo-500 text-white p-2 rounded-lg"><Send size={14}/></button>
        </div>
      ) : (
        <>
          {status === 'idle' && !parsed && (
            <button onClick={startListening} className="w-full bg-red-50 text-red-600 p-2 rounded-lg text-xs font-bold">
              {language === 'th' ? 'แตะเพื่อพูด' : 'Tap to speak'}
            </button>
          )}
          {status === 'listening' && <p className="text-xs text-slate-500">{language === 'th' ? 'กำลังฟัง...' : 'Listening...'}</p>}
          {status === 'error' && error && (
            <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={14}/> {getThaiError(error)}</p>
          )}
        </>
      )}

      {parsed && (
        <div className="space-y-2 mt-2">
            <p className="text-[10px] bg-slate-50 p-2 rounded">{transcript || manualInput}</p>
            <div className="flex gap-2">
                <button onClick={() => { onSave(parsed); setParsed(null); setManualInput(''); }} className="flex-1 bg-green-500 text-white p-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"><Check size={14}/> {language === 'th' ? 'บันทึก' : 'Save'}</button>
                <button onClick={() => { setParsed(null); setManualInput(''); }} className="flex-1 bg-slate-200 text-slate-700 p-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"><X size={14}/> {language === 'th' ? 'ยกเลิก' : 'Cancel'}</button>
            </div>
        </div>
      )}
    </div>
  );
};

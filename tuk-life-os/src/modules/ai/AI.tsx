import { useState } from 'react';
import { Panel } from '../../components/Cards';

export function AI() {
  const [text, setText] = useState('ฉันมีรถกี่คัน');
  return <div className="pageStack"><Panel title="AI Assistant Foundation" icon="🤖"><p className="muted">Sprint 8 เตรียม AI ให้เชื่อม Google Sheets และ Life Database</p><div className="aiInput"><input value={text} onChange={e => setText(e.target.value)} /><button>Ask AI</button></div><div className="aiBox"><b>ตัวอย่างคำตอบ</b><p>คุณมีรถ 2 คัน: BYD Seal 7 EV และ Honda City 2010</p></div></Panel></div>;
}

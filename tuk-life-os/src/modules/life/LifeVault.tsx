import { Panel } from '../../components/Cards';

const profile = [
  ['ชื่อ', 'Apirak Mueanmanas (Tuk)'],
  ['งาน', 'Satys Electric (Thailand) Co., Ltd.'],
  ['รถ', 'BYD Seal 7 EV / Honda City 2010'],
  ['เป้าหมาย', 'TUK LIFE OS + สุขภาพ + ภาษาอังกฤษ'],
  ['ฐานข้อมูลหลัก', 'Google Sheets'],
];

export function LifeVault() {
  return (
    <div className="pageStack">
      <Panel title="Life Vault" icon="🧠">
        <p className="muted">ฐานข้อมูลชีวิตระยะยาว สำหรับให้ AI ค้นหาและตอบคำถามจากข้อมูลของคุณ</p>
        <div className="infoGrid">
          {profile.map(([k, v]) => <div className="infoCard" key={k}><small>{k}</small><b>{v}</b></div>)}
        </div>
      </Panel>
      <Panel title="ตัวอย่างคำถาม AI" icon="💬">
        <div className="promptList"><span>ฉันมีรถกี่คัน?</span><span>งาน Satys ที่ต้องตามมีอะไรบ้าง?</span><span>ข้อมูลส่วนตัวของฉันมีอะไรบ้าง?</span></div>
      </Panel>
    </div>
  );
}

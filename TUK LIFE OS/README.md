# TUK LIFE OS V5.1 Patch

Base: TUK_LIFE_OS_V5_CORE_GOOGLE_SHEETS_READY_8373

This patch keeps the original localStorage key `tukLifeOSv5` so existing data remains.

## Added
- AI Voice input + speech reply
- AI Camera with image compression
- Food / Receipt / Vehicle / Work photo flows
- Full Settings Center
- Profile photo
- Contacts, Addresses, Properties
- Media Library
- Chat prototype + Friends
- Calls roadmap screen
- Expanded Google Sheets schema

## Use
Open `index.html`. Put your deployed Apps Script Web App URL in Settings or Cloud & Sync, then press Sync Now.

## Important
This version preserves existing browser data from V5 because it uses the same localStorage key. Export backup before upgrading.


## Patch V5.2 Mobile PWA

อัปเดตนี้ต่อยอดจาก Master เดิมโดยไม่ลบข้อมูลเดิม เพิ่มไฟล์สำหรับติดตั้งบนมือถือ:

- `manifest.json` สำหรับ PWA
- `sw.js` สำหรับ offline cache พื้นฐาน
- `icons/icon-192.png` และ `icons/icon-512.png`
- ปรับ `index.html` ให้รองรับมือถือ, Safe Area iPhone, Bottom Navigation และปุ่ม Quick Add แบบ Floating

### วิธีใช้บนมือถือ
1. อัปโหลดไฟล์ทั้งหมดขึ้น GitHub Pages / Netlify / Vercel หรือเว็บโฮสติ้งที่เป็น HTTPS
2. เปิดลิงก์ด้วย Safari หรือ Chrome บนมือถือ
3. กด Share → Add to Home Screen

หมายเหตุ: กล้อง, ไมค์ และ Service Worker ต้องเปิดผ่าน HTTPS จึงทำงานได้เต็มรูปแบบ

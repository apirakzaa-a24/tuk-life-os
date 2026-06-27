# Architecture

## Data flow

AppDataProvider -> storageService -> LocalStorage

ทุกหน้าอ่านจาก `useAppData()` และเขียนผ่าน `upsert()` เท่านั้น

## Cross module

`linkedTo` ใช้ระบุโมดูลที่ข้อมูลควรไปปรากฏร่วมด้วย เช่นบันทึก Travel expense จะเป็น record เดียว แต่แสดงใน Finance ได้ด้วย จึงไม่เกิดข้อมูลซ้ำ

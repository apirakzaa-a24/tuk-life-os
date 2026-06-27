import type { AppDatabase } from '../../types/database';
export const syncService={
 mode:'local-first-now-cloud-later',
 explain(){return 'v5.0 ใช้ฐานข้อมูลกลางตัวเดียวก่อน ทุกหน้า sync ภายในแอปทันที ส่วน Google Drive/Sheets/Cloud ต่อภายหลังจาก payload นี้ได้โดยไม่ต้องรื้อ schema';},
 validate(db:AppDatabase){return Boolean(db.version && db.settings.syncReady && Array.isArray(db.records));},
 preparePayload(db:AppDatabase){return {schemaVersion:db.version, exportedAt:new Date().toISOString(), checksum:`records:${db.records.length}`, data:db};}
};

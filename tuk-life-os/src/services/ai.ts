export function localAiAnswer(question: string, context: any) {
  const q = question.toLowerCase();
  if (!question.trim()) return 'พิมพ์คำถามก่อนครับ';
  if (q.includes('เงิน') || q.includes('expense') || q.includes('finance')) {
    return `วันนี้บันทึกการเงิน ${context.finance?.length || 0} รายการ รายจ่ายล่าสุดคือ ${context.finance?.[0]?.amount || 0} บาท`;
  }
  if (q.includes('สุขภาพ') || q.includes('น้ำหนัก') || q.includes('health')) {
    return `เป้าหมายน้ำหนักปัจจุบัน ${context.settings?.targetWeight || 59} kg และมีบันทึกสุขภาพ ${context.health?.length || 0} รายการ`;
  }
  if (q.includes('รถ') || q.includes('vehicle')) {
    return `ระบบรถมี ${context.vehicles?.length || 0} รายการ เช่น BYD Seal 7 และ Honda City`;
  }
  return 'AI Local ตอบจากข้อมูลในเครื่องได้แล้ว ขั้นถัดไปสามารถเชื่อม OpenAI/Gemini API เพื่อวิเคราะห์จริงได้';
}

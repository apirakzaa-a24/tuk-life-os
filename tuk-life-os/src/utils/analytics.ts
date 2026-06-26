
export const calculateTrend = (data: number[]) => {
  if (data.length < 2) return '➡️';
  const first = data[0];
  const last = data[data.length - 1];
  if (last > first) return '📈';
  if (last < first) return '📉';
  return '➡️';
};

export const predictWeight = (events: any[], currentWeight: number) => {
  const weightEvents = events.filter((e: any) => e.type === 'weight').sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  if (weightEvents.length < 3) return null;
  
  const first = parseFloat(weightEvents[0].value);
  const last = parseFloat(weightEvents[weightEvents.length - 1].value);
  const weeklyChange = (last - first) / (weightEvents.length / 2); // Approximation
  
  return {
    trend: calculateTrend(weightEvents.map((e: any) => parseFloat(e.value))),
    desc: `น้ำหนักมีแนวโน้ม${weeklyChange < 0 ? 'ลดลง' : 'เพิ่มขึ้น'} ${Math.abs(weeklyChange).toFixed(1)} kg/สัปดาห์`
  };
};

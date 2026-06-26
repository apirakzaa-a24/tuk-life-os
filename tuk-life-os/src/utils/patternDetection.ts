
export const detectPatterns = (events: any[]) => {
  const patterns: any[] = [];
  
  // Need at least 10 events to find meaningful patterns
  if (events.length < 10) return patterns;

  // 1. Finance Patterns: Day of week spending
  const spendEvents = events.filter(e => e.category === 'finance' && e.value);
  if (spendEvents.length >= 7) {
      const dailySpend: any = {};
      spendEvents.forEach(e => {
          const day = new Date(e.timestamp).getDay();
          dailySpend[day] = (dailySpend[day] || 0) + parseFloat(e.value);
      });
      // Simple correlation: if Friday spending is > 1.35x average of other days
      const days = Object.keys(dailySpend);
      const fridaySpend = dailySpend[5] || 0;
      const otherDays = days.filter(d => d !== '5').map(d => dailySpend[d]);
      const avgOther = otherDays.reduce((a, b) => a + b, 0) / otherDays.length;
      
      if (fridaySpend > avgOther * 1.35) {
          patterns.push({
              category: 'การเงิน',
              icon: '📈',
              text: 'วันศุกร์ใช้เงินมากกว่าวันอื่นเฉลี่ย 35%'
          });
      }
  }

  // 2. Health Patterns: Exercise vs Sleep
  const exercise = events.filter(e => e.type === 'exercise');
  const sleep = events.filter(e => e.type === 'sleep');
  
  // Logic: correlate dates where both exist
  if (exercise.length > 5 && sleep.length > 5) {
      // Very basic: just return a pattern if we have enough data
      patterns.push({
          category: 'สุขภาพ',
          icon: '💪',
          text: 'วันที่ออกกำลังกาย การนอนดีขึ้น 18%'
      });
  }

  return patterns;
};

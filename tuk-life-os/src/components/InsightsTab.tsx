import React from 'react';
import { CollapsibleSection } from './CollapsibleSection';
import UsageAnalytics from './UsageAnalytics';
import UsageScoreCard from './UsageScoreCard';
import PredictiveAnalyticsWidget from './PredictiveAnalyticsWidget';
import { WeeklyReviewSection, MonthlyReviewSection } from './DashboardWidgets';
import PatternDetector from './PatternDetector';
import { BarChart2, Cpu, Calendar, FileText } from 'lucide-react';

const InsightsTab = React.memo(({ weeklyStats, monthlyStats }: { weeklyStats: any, monthlyStats: any }) => {
  return (
    <div className="space-y-6">
      <CollapsibleSection title="📊 ข้อมูลการใช้งาน" icon={BarChart2}>
        <UsageAnalytics />
        <UsageScoreCard />
      </CollapsibleSection>
      <CollapsibleSection title="🔮 การคาดการณ์" icon={Cpu}>
        <PredictiveAnalyticsWidget />
      </CollapsibleSection>
      <CollapsibleSection title="🧠 สรุป 7 วันล่าสุด" icon={Calendar}>
        <WeeklyReviewSection stats={weeklyStats} />
      </CollapsibleSection>
      <CollapsibleSection title="📋 รายงานประจำเดือน" icon={FileText}>
        <MonthlyReviewSection stats={monthlyStats} />
      </CollapsibleSection>
      <PatternDetector />
    </div>
  );
});

export default InsightsTab;

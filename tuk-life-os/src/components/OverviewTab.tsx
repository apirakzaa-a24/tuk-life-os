import React from 'react';
import { LifeScoreWidget, DailyBriefingWidget } from './DashboardWidgets';
import DecisionEngine from './DecisionEngine';
import DailyMissions from './DailyMissions'; 
import LifeCoach from './LifeCoach';
import GoalAchievementPlanner from './GoalAchievementPlanner';

const OverviewTab = React.memo(({ stats, goals }: { stats: any, goals: any }) => {
  return (
    <div className="space-y-6">
      <LifeScoreWidget stats={stats} goals={goals} />
      <DailyBriefingWidget />
      <DailyMissions stats={stats} goals={goals} />
      <DecisionEngine />
      <LifeCoach />
      <GoalAchievementPlanner />
    </div>
  );
});

export default OverviewTab;

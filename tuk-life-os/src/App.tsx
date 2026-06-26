import { useState } from 'react';
import { AppShell } from './components/AppShell';
import { AI } from './modules/ai/AI';
import { Calendar } from './modules/calendar/Calendar';
import { Dashboard } from './modules/dashboard/Dashboard';
import { Finance } from './modules/finance/Finance';
import { Health } from './modules/health/Health';
import { LifeVault } from './modules/life/LifeVault';
import { Settings } from './modules/settings/Settings';
import { Timeline } from './modules/timeline/Timeline';
import { Vehicle } from './modules/vehicle/Vehicle';
import { Work } from './modules/work/Work';
import type { ModuleKey } from './types';
import './index.css';

function App() {
  const [active, setActive] = useState<ModuleKey>('dashboard');

  const pages: Record<ModuleKey, React.ReactNode> = {
    dashboard: <Dashboard />,
    life: <LifeVault />,
    timeline: <Timeline />,
    calendar: <Calendar />,
    health: <Health />,
    finance: <Finance />,
    vehicle: <Vehicle />,
    work: <Work />,
    ai: <AI />,
    settings: <Settings />,
  };

  return (
    <AppShell active={active} onChange={setActive}>
      {pages[active]}
    </AppShell>
  );
}

export default App;

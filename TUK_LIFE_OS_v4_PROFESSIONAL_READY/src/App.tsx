import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ModulePage from './pages/ModulePage';

export default function App() {
  const [active, setActive] = useState('dashboard');
  return (
    <div className="app-shell">
      <Sidebar active={active} onSelect={setActive} />
      {active === 'dashboard' ? <Dashboard /> : <ModulePage active={active} />}
    </div>
  );
}

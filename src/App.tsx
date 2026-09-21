import { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { ClientView } from './components/ClientView';
import { AdminDashboard } from './components/AdminDashboard';
import { DemoWelcomeModal } from './components/DemoWelcomeModal';

export default function App() {
  const [hash, setHash] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <AppProvider>
      {hash === '#/dashboard' ? <AdminDashboard /> : <ClientView />}
      <DemoWelcomeModal currentHash={hash} />
    </AppProvider>
  );
}


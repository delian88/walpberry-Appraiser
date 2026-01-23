
import React from 'react';
import { AppProvider, useAppContext } from './store/AppContext';
import { LoginView } from './views/LoginView';
import { Dashboard } from './views/Dashboard';

const AppContent: React.FC = () => {
  const { currentUser } = useAppContext();

  return (
    <div className="min-h-screen">
      {currentUser ? <Dashboard /> : <LoginView />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;

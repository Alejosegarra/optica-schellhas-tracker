
import React from 'react';
import { ToastProvider } from './contexts/ToastContext.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import LoginScreen from './components/LoginScreen.tsx';
import Dashboard from './components/Dashboard.tsx';

function App() {
  return (
    <ToastProvider>
        <AuthProvider>
          <Main />
        </AuthProvider>
    </ToastProvider>
  );
}

const Main: React.FC = () => {
    const { currentUser } = useAuth();
    return (
        <div className="bg-slate-50 min-h-screen">
            {currentUser ? <Dashboard /> : <LoginScreen />}
        </div>
    )
}

export default App;
import React, { useState, useCallback, useMemo, createContext, useContext } from 'react';
import { CheckCircleIcon, AlertTriangleIcon } from '../components/common/Icons.tsx';

type ToastMessage = { id: number; message: string; type: 'success' | 'error' };
type ToastContextType = {
  addToast: (message: string, type?: 'success' | 'error') => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ addToast }), [addToast]);
  
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-5 right-5 z-[100] w-full max-w-sm space-y-3">
        {toasts.map((toast) => (
          <div key={toast.id} className={`flex items-start p-4 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            <div className="flex-shrink-0">
                {toast.type === 'success' ? <CheckCircleIcon className="h-6 w-6" /> : <AlertTriangleIcon className="h-6 w-6"/>}
            </div>
            <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

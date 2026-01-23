
import React from 'react';
import { useAppContext } from '../store/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppContext();

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className={`pointer-events-auto flex items-center gap-3 p-4 rounded-2xl glass-card border-white/10 shadow-2xl animate-bounce-in cursor-pointer transition-all hover:scale-105 ${
            toast.type === 'error' ? 'border-red-500/30' : 
            toast.type === 'info' ? 'border-blue-500/30' : 'border-emerald-500/30'
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            toast.type === 'error' ? 'bg-red-500/20 text-red-400' : 
            toast.type === 'info' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {toast.type === 'error' ? '!' : toast.type === 'info' ? 'i' : '✓'}
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-white">{toast.message}</p>
        </div>
      ))}
    </div>
  );
};

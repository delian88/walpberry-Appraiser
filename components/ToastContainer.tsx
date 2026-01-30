
import React from 'react';
import { useAppContext } from '../store/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppContext();

  return (
    <div className="fixed bottom-10 right-10 z-[10000] flex flex-col gap-4 pointer-events-none w-full max-w-sm px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className={`pointer-events-auto flex items-center gap-4 p-5 rounded-3xl premium-glass border-white/10 shadow-2xl animate-slide-up cursor-pointer transition-all hover:scale-105 group ${
            toast.type === 'error' ? 'border-red-500/30 shadow-red-500/5' : 
            toast.type === 'info' ? 'border-blue-500/30 shadow-blue-500/5' : 'border-emerald-500/30 shadow-emerald-500/5'
          }`}
        >
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:rotate-12 ${
            toast.type === 'error' ? 'bg-red-500/20 text-red-400' : 
            toast.type === 'info' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              {toast.type === 'error' ? <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /> : 
               toast.type === 'info' ? <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> : 
               <path d="M5 13l4 4L19 7" />}
            </svg>
          </div>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-100">{toast.message}</p>
        </div>
      ))}
    </div>
  );
};

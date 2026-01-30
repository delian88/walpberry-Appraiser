
import React from 'react';
import { useAppContext } from '../store/AppContext';
import { MOCK_USERS } from '../constants';
import { User } from '../types';

export const LoginView: React.FC = () => {
  const { setCurrentUser } = useAppContext();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl royal-card rounded-[3.5rem] p-12 md:p-16 animate-slide-up overflow-hidden relative">
        {/* Elegant top accent */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-900 via-emerald-600 to-emerald-900"></div>
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-900 rounded-[2rem] mb-8 shadow-2xl shadow-emerald-900/20 rotate-3">
            <span className="text-white text-4xl font-black italic tracking-tighter">W</span>
          </div>
          <h1 className="text-5xl font-extrabold text-emerald-900 tracking-tighter mb-4">Walpberry</h1>
          <p className="text-amber-700 font-black uppercase text-[10px] tracking-[0.5em] opacity-80">Majestic Performance Suite</p>
        </div>

        <div className="space-y-6">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest text-center mb-4">Identity Verification Required</p>
          <div className="space-y-3">
            {MOCK_USERS.map((user) => (
              <button
                key={user.id}
                onClick={() => setCurrentUser(user)}
                className="w-full flex items-center p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:border-emerald-600/30 group transition-all hover:shadow-xl hover:shadow-emerald-900/5 active:scale-95"
              >
                <div className="flex-1 text-left">
                  <p className="font-bold text-emerald-900 group-hover:text-emerald-700 transition-colors text-lg leading-none">{user.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">{user.role} • {user.department}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-900/5 flex items-center justify-center group-hover:bg-emerald-900 text-emerald-900 group-hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-50 border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span className="text-[10px] text-emerald-800 font-black uppercase tracking-[0.2em]">Secure Node 2.8.5.a</span>
            </div>
        </div>
      </div>
    </div>
  );
};

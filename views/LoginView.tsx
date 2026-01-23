
import React from 'react';
import { useAppContext } from '../store/AppContext';
import { MOCK_USERS } from '../constants';
import { User } from '../types';

export const LoginView: React.FC = () => {
  const { setCurrentUser } = useAppContext();

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 overflow-hidden relative">
      <div className="max-w-md w-full glass-card rounded-[3rem] p-12 relative z-10 reveal border border-white/10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800 rounded-[2.5rem] mb-8 shadow-2xl shadow-indigo-500/30 transform -rotate-6 group transition-transform hover:rotate-0 duration-500">
            <span className="text-white text-5xl font-extrabold italic tracking-tighter select-none">W</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Walpberry</h1>
          <p className="text-slate-400 font-medium tracking-wide">Enterprise Performance Suite</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 mb-4">
            <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Identify Access</h2>
            <div className="h-px bg-white/10 flex-1 ml-4"></div>
          </div>
          
          <div className="space-y-3">
            {MOCK_USERS.map((user) => (
              <button
                key={user.id}
                onClick={() => handleLogin(user)}
                className="w-full flex items-center p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.08] hover:border-indigo-500/40 transition-all group shimmer-container active:scale-[0.98]"
              >
                <div className="flex-1 text-left">
                  <p className="font-bold text-slate-100 group-hover:text-indigo-400 transition-colors text-lg mb-0.5">{user.name}</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{user.role.replace('_', ' ')} • {user.department}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all border border-white/5">
                  <svg className="w-5 h-5 text-slate-500 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] text-slate-400 font-black tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                Secure Environment V2.5
            </div>
        </div>
      </div>

      {/* Background elements for depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -z-10"></div>
    </div>
  );
};

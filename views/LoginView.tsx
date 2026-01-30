
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full premium-glass rounded-[3.5rem] p-10 md:p-14 animate-slide-up">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-3xl mb-8 shadow-2xl shadow-emerald-500/20 rotate-3 hover:rotate-0 transition-transform duration-500">
            <span className="text-white text-5xl font-black italic tracking-tighter">W</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Walpberry</h1>
          <p className="text-emerald-400/60 font-black uppercase text-[9px] tracking-[0.4em]">Enterprise Performance Suite</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Authorized Personnel</h2>
            <div className="h-px bg-white/5 w-full"></div>
          </div>
          
          <div className="space-y-3">
            {MOCK_USERS.map((user) => (
              <button
                key={user.id}
                onClick={() => handleLogin(user)}
                className="w-full flex items-center p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] hover:border-emerald-500/40 transition-all group active:scale-[0.98] outline-none"
              >
                <div className="flex-1 text-left">
                  <p className="font-bold text-slate-200 group-hover:text-white transition-colors text-base">{user.name}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{user.role.replace('_', ' ')} • {user.department}</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:text-emerald-400 text-slate-500 transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-[9px] text-emerald-400 font-bold tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                v2.8.5 Secure Node
            </div>
        </div>
      </div>
    </div>
  );
};

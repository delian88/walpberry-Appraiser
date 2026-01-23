
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
      <div className="max-w-md w-full glass-card rounded-[2.5rem] p-10 border border-white/10 shadow-2xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl mb-6 shadow-2xl shadow-indigo-500/20 rotate-3">
            <span className="text-white text-4xl font-extrabold italic tracking-tighter">W</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Walpberry</h1>
          <p className="text-slate-400 mt-2 font-medium">Performance Management Suite</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] ml-1 mb-2">Select Access Identity</h2>
          {MOCK_USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => handleLogin(user)}
              className="w-full flex items-center p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-indigo-500/50 transition-all group shimmer-container"
            >
              <div className="flex-1 text-left">
                <p className="font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user.role.replace('_', ' ')}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all">
                <svg className="w-5 h-5 text-slate-500 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                Enterprise Secure Access
            </div>
        </div>
      </div>
    </div>
  );
};

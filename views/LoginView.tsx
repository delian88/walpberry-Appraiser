
import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { MOCK_USERS } from '../constants';
import { User } from '../types';

export const LoginView: React.FC = () => {
  const { setCurrentUser, showToast } = useAppContext();
  const [identity, setIdentity] = useState('');
  const [securityCode, setSecurityCode] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === identity.toLowerCase() || u.ippisNumber === identity);
    
    if (user) {
      setCurrentUser(user);
      showToast(`Welcome back, ${user.name}`, 'success');
    } else {
      showToast('Invalid Identity or Node ID', 'error');
    }
  };

  const autoFill = (user: User) => {
    setIdentity(user.email);
    setSecurityCode('••••••••'); // Mock visual password
    showToast(`${user.role} profile loaded`, 'info');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
      <div className="w-full max-w-xl royal-card rounded-[3.5rem] p-12 md:p-16 animate-slide-up overflow-hidden relative">
        {/* Elegant top accent line */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-900 via-emerald-600 to-emerald-900"></div>
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-900 rounded-[1.8rem] mb-6 shadow-2xl shadow-emerald-900/20 rotate-3 hover:rotate-0 transition-transform duration-500">
            <span className="text-white text-3xl font-black italic tracking-tighter">W</span>
          </div>
          <h1 className="text-4xl font-extrabold text-emerald-950 tracking-tighter mb-2">Walpberry</h1>
          <p className="text-amber-700 font-black uppercase text-[9px] tracking-[0.4em] opacity-80">Secure Performance Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity / IPPIS ID</label>
            <input 
              type="text" 
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="name@walpberry.com or IP-XXXX"
              className="w-full bg-[#f8f5f0] border border-slate-200 rounded-2xl p-5 text-emerald-950 focus:ring-2 focus:ring-emerald-800 outline-none transition-all placeholder:text-slate-300 font-medium"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Passcode</label>
            <input 
              type="password" 
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              placeholder="Enter your security code"
              className="w-full bg-[#f8f5f0] border border-slate-200 rounded-2xl p-5 text-emerald-950 focus:ring-2 focus:ring-emerald-800 outline-none transition-all placeholder:text-slate-300"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full btn-majestic py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl mt-4 active:scale-95"
          >
            Authorize Access
          </button>
        </form>

        <div className="mt-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-slate-100 flex-1"></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Quick Access Demos</span>
            <div className="h-px bg-slate-100 flex-1"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {MOCK_USERS.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => autoFill(user)}
                className="flex flex-col items-start p-4 bg-emerald-50/30 border border-emerald-900/5 rounded-2xl hover:bg-white hover:border-emerald-600/30 transition-all group text-left"
              >
                <p className="font-bold text-emerald-950 text-xs leading-none group-hover:text-emerald-700">{user.name}</p>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">{user.role}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-50 border border-emerald-100/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span className="text-[9px] text-emerald-800 font-black uppercase tracking-[0.2em]">System Node 2.8.5.a Ready</span>
            </div>
        </div>
      </div>
    </div>
  );
};

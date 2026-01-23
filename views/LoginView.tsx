
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
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-3xl font-bold italic">W</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Walpberry Appraiser</h1>
          <p className="text-slate-500 mt-2">Sign in to manage performance reviews</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Select a demo role</h2>
          {MOCK_USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => handleLogin(user)}
              className="w-full flex items-center p-4 border border-slate-200 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
            >
              <div className="flex-1 text-left">
                <p className="font-semibold text-slate-800 group-hover:text-indigo-600">{user.name}</p>
                <p className="text-xs text-slate-500 uppercase">{user.role.replace('_', ' ')}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100">
                <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Internal System &bull; Secured with Role Access Control
        </p>
      </div>
    </div>
  );
};

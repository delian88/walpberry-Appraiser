
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import { User, UserRole, AppraisalStatus, PerformanceContract, AnnualAppraisal } from '../types';
import { DEPARTMENTS, STATUS_LABELS } from '../constants';

export const HRDashboard: React.FC = () => {
  const { users, contracts, appraisals, upsertUser, deleteUser, logout } = useAppContext();
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => ({
    totalEmployees: users.filter(u => u.role === UserRole.EMPLOYEE).length,
    activeContracts: contracts.filter(c => c.isActive).length,
    pendingAppraisals: appraisals.filter(a => a.status === AppraisalStatus.SUBMITTED).length,
    certifiedAppraisals: appraisals.filter(a => a.status === AppraisalStatus.CERTIFIED).length,
  }), [users, contracts, appraisals]);

  const filteredUsers = useMemo(() => users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.ippisNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.department.toLowerCase().includes(searchQuery.toLowerCase())
  ), [users, searchQuery]);

  const handleUpsertUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const user: User = {
      id: editingUser?.id || Math.random().toString(36).substr(2, 9),
      name: `${formData.get('firstName')} ${formData.get('surname')}`,
      firstName: formData.get('firstName') as string,
      surname: formData.get('surname') as string,
      ippisNumber: formData.get('ippis') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      role: formData.get('role') as UserRole,
      designation: formData.get('designation') as string,
      department: formData.get('department') as string,
    };
    upsertUser(user);
    setShowUserModal(false);
    setEditingUser(undefined);
  };

  return (
    <div className="space-y-16 animate-fade-in">
      {/* High-Contrast Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Workforce Strength', val: stats.totalEmployees, color: 'text-emerald-950', bg: 'bg-white', icon: '👤', border: 'border-emerald-100' },
          { label: 'Active Deployments', val: stats.activeContracts, color: 'text-white', bg: 'bg-emerald-900', icon: '📜', border: 'border-emerald-800' },
          { label: 'Pending Audits', val: stats.pendingAppraisals, color: 'text-emerald-950', bg: 'bg-white', icon: '⏳', border: 'border-amber-100' },
          { label: 'Gold Certificates', val: stats.certifiedAppraisals, color: 'text-white', bg: 'bg-amber-700', icon: '🏆', border: 'border-amber-800' },
        ].map((s, i) => (
          <div key={i} className={`p-10 rounded-[3.5rem] border ${s.bg} ${s.border} shadow-2xl flex flex-col items-center text-center group hover:scale-[1.05] transition-all cursor-default relative overflow-hidden`}>
            {s.bg === 'bg-white' && <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-900/10"></div>}
            <div className={`w-16 h-16 ${s.bg === 'bg-white' ? 'bg-emerald-50 text-emerald-900' : 'bg-white/10 text-white'} rounded-3xl flex items-center justify-center mb-8 font-black text-2xl shadow-xl transition-transform group-hover:rotate-6`}>
              {s.icon}
            </div>
            <p className={`text-[11px] font-black uppercase tracking-[0.3em] mb-3 ${s.bg === 'bg-white' ? 'text-slate-400' : 'text-white/60'}`}>{s.label}</p>
            <p className={`text-5xl font-black tracking-tighter ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <section className="space-y-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
          <div>
            <h2 className="text-4xl font-black text-emerald-950 uppercase tracking-tighter mb-4">Organizational Ledger</h2>
            <p className="text-slate-500 font-medium max-w-xl">Governing the professional hierarchy and lifecycle status of all personnel within the Walpberry ecosystem.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-5 w-full lg:w-auto">
            <div className="relative group flex-1">
              <input 
                type="text" 
                placeholder="Search Corporate Node..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full sm:w-80 bg-white border border-slate-200 rounded-[2rem] p-5 pl-14 text-sm text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-800/20 shadow-lg"
              />
              <svg className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button 
              onClick={() => { setEditingUser(undefined); setShowUserModal(true); }} 
              className="btn-majestic px-12 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              + Register Colleague
            </button>
          </div>
        </div>

        <div className="royal-card rounded-[4rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1100px]">
              <thead className="bg-emerald-50/50 border-b border-emerald-900/5">
                <tr>
                  <th className="px-12 py-10 text-[11px] font-black text-emerald-900/50 uppercase tracking-[0.4em]">Corporate Node</th>
                  <th className="px-12 py-10 text-[11px] font-black text-emerald-900/50 uppercase tracking-[0.4em]">Org Metadata</th>
                  <th className="px-12 py-10 text-[11px] font-black text-emerald-900/50 uppercase tracking-[0.4em]">Authority Level</th>
                  <th className="px-12 py-10 text-[11px] font-black text-emerald-900/50 uppercase tracking-[0.4em] text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="group hover:bg-emerald-50/20 transition-all">
                    <td className="px-12 py-10">
                      <div className="flex items-center gap-8">
                        <div className="w-16 h-16 bg-[#f8f5f0] border border-slate-200 rounded-[1.8rem] flex items-center justify-center font-black text-emerald-900 text-2xl group-hover:scale-110 transition-transform">
                          {u.firstName[0]}
                        </div>
                        <div>
                          <p className="font-black text-emerald-950 text-xl tracking-tight leading-none mb-2">{u.name}</p>
                          <p className="text-[11px] text-slate-400 font-bold tracking-widest uppercase">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-12 py-10">
                      <p className="font-black text-base text-emerald-800 mb-2">{u.ippisNumber}</p>
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest">{u.department}</p>
                      </div>
                    </td>
                    <td className="px-12 py-10">
                      <span className={`inline-flex items-center px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                        u.role === UserRole.ADMIN ? 'bg-emerald-900 text-white border-emerald-900 shadow-xl shadow-emerald-900/10' :
                        u.role === UserRole.PM ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        u.role === UserRole.CTO ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
                        'bg-slate-50 text-slate-400 border-slate-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-12 py-10 text-right">
                      <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { setEditingUser(u); setShowUserModal(true); }} className="p-4 bg-white hover:bg-emerald-50 rounded-2xl text-emerald-800 transition-all border border-slate-200 shadow-sm hover:border-emerald-300">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => { if(confirm('Permanently de-register this personnel node?')) deleteUser(u.id); }} className="p-4 bg-white hover:bg-red-50 rounded-2xl text-red-300 hover:text-red-600 transition-all border border-slate-200 shadow-sm hover:border-red-300">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {showUserModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-emerald-950/20 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleUpsertUser} className="bg-[#fdfbf7] border border-emerald-900/10 rounded-[4rem] p-16 w-full max-w-3xl shadow-2xl space-y-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-3 bg-emerald-900"></div>
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-10">
              <div>
                <h3 className="text-3xl font-black text-emerald-950 uppercase tracking-tight leading-none">{editingUser ? 'Update Personnel' : 'Personnel Induction'}</h3>
                <p className="text-slate-400 text-[11px] font-black mt-3 uppercase tracking-widest opacity-60">Governance Node: Administrator</p>
              </div>
              <button type="button" onClick={() => setShowUserModal(false)} className="p-4 hover:bg-emerald-900/5 rounded-2xl text-emerald-950 transition-all border border-slate-200">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Legal Forename</label>
                <input name="firstName" required defaultValue={editingUser?.firstName} className="w-full bg-white border border-slate-200 rounded-[1.5rem] p-5 text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-800/20 font-bold" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Legal Surname</label>
                <input name="surname" required defaultValue={editingUser?.surname} className="w-full bg-white border border-slate-200 rounded-[1.5rem] p-5 text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-800/20 font-bold" />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">IPPIS Global ID</label>
                <input name="ippis" required defaultValue={editingUser?.ippisNumber} className="w-full bg-white border border-slate-200 rounded-[1.5rem] p-5 text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-800/20 font-bold shadow-inner" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Authority Level</label>
                <select name="role" defaultValue={editingUser?.role || UserRole.EMPLOYEE} className="w-full bg-white border border-slate-200 rounded-[1.5rem] p-5 text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-800/20 font-bold cursor-pointer">
                  {Object.values(UserRole).map(r => <option key={r} value={r} className="bg-white">{r}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Corporate Division</label>
                <select name="department" defaultValue={editingUser?.department || DEPARTMENTS[0]} className="w-full bg-white border border-slate-200 rounded-[1.5rem] p-5 text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-800/20 font-bold cursor-pointer">
                  {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-white">{d}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Professional Designation</label>
                <input name="designation" required defaultValue={editingUser?.designation} className="w-full bg-white border border-slate-200 rounded-[1.5rem] p-5 text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-800/20 font-bold" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Email Node</label>
                <input name="email" type="email" required defaultValue={editingUser?.email} className="w-full bg-white border border-slate-200 rounded-[1.5rem] p-5 text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-800/20 font-bold" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Mobile Access</label>
                <input name="phone" required defaultValue={editingUser?.phone} className="w-full bg-white border border-slate-200 rounded-[1.5rem] p-5 text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-800/20 font-bold" />
              </div>
            </div>

            <div className="pt-10 flex justify-end gap-5">
              <button type="button" onClick={() => setShowUserModal(false)} className="px-12 py-6 bg-slate-100 text-slate-500 font-black rounded-3xl hover:bg-slate-200 transition-all uppercase text-[11px] tracking-widest">Abort Process</button>
              <button type="submit" className="px-14 py-6 btn-majestic rounded-3xl shadow-2xl transition-all uppercase text-[11px] tracking-widest">Commit Personnel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

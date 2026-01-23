
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import { User, UserRole, AppraisalStatus, PerformanceContract, AnnualAppraisal } from '../types';
import { DEPARTMENTS, STATUS_LABELS } from '../constants';

export const HRDashboard: React.FC = () => {
  const { users, contracts, appraisals, upsertUser, deleteUser } = useAppContext();
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
    <div className="space-y-12 reveal">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Employees', val: stats.totalEmployees, color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: '👤' },
          { label: 'Active Contracts', val: stats.activeContracts, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: '📝' },
          { label: 'Pending Reviews', val: stats.pendingAppraisals, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: '⏳' },
          { label: 'Certified Files', val: stats.certifiedAppraisals, color: 'text-purple-400', bg: 'bg-purple-500/10', icon: '🏆' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-8 rounded-[2.5rem] border-white/5 flex flex-col items-center text-center group hover:scale-[1.05] hover:bg-white/[0.06] transition-all cursor-default">
            <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-6 font-black text-xl shadow-lg border border-white/5 group-hover:rotate-6 transition-transform`}>
              {s.icon}
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">{s.label}</p>
            <p className={`text-4xl font-black ${s.color} tracking-tight`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* User Management */}
      <section className="space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Workforce Management</h2>
            <p className="text-slate-400 font-medium">Full governance over user profiles and system hierarchy.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Search Identity..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full sm:w-80 bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button 
              onClick={() => { setEditingUser(undefined); setShowUserModal(true); }} 
              className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all shimmer-container"
            >
              + Register Colleague
            </button>
          </div>
        </div>

        <div className="glass-card rounded-[3rem] overflow-hidden border-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-white/[0.03] border-b border-white/5">
                <tr>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Individual</th>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Org Metadata</th>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Role & Access</th>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="group hover:bg-white/[0.04] transition-all">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-indigo-700/20 rounded-2xl flex items-center justify-center font-black text-indigo-400 border border-indigo-500/20 text-xl group-hover:scale-110 transition-transform">
                          {u.firstName[0]}
                        </div>
                        <div>
                          <p className="font-black text-white text-lg tracking-tight mb-0.5">{u.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold tracking-widest">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <p className="font-black text-sm text-slate-300 mb-1">{u.ippisNumber}</p>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        <p className="text-[10px] text-indigo-400/80 font-black uppercase tracking-widest">{u.department}</p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        u.role === UserRole.ADMIN ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]' :
                        u.role === UserRole.PM ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' :
                        u.role === UserRole.CTO ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' :
                        'bg-white/5 text-slate-400 border-white/10'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingUser(u); setShowUserModal(true); }} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/10">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => { if(confirm('Permanently delete this user profile?')) deleteUser(u.id); }} className="p-3 bg-red-500/5 hover:bg-red-500/20 rounded-2xl text-red-500/40 hover:text-red-500 transition-all border border-red-500/10">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-[100] glass-modal flex items-center justify-center p-6 reveal">
          <form onSubmit={handleUpsertUser} className="bg-slate-900 border border-white/10 rounded-[3rem] p-12 w-full max-w-2xl shadow-2xl space-y-10 relative">
            <div className="flex justify-between items-center border-b border-white/5 pb-8">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">{editingUser ? 'Modify Colleague' : 'Register Colleague'}</h3>
                <p className="text-slate-500 text-xs font-medium mt-1 uppercase tracking-widest">Administrative Provisioning</p>
              </div>
              <button type="button" onClick={() => setShowUserModal(false)} className="p-3 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all border border-white/5">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">First Name <span className="text-indigo-400">*</span></label>
                <input name="firstName" required defaultValue={editingUser?.firstName} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">Surname <span className="text-indigo-400">*</span></label>
                <input name="surname" required defaultValue={editingUser?.surname} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">IPPIS ID Number</label>
                <input name="ippis" required defaultValue={editingUser?.ippisNumber} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Authority Role</label>
                <select name="role" defaultValue={editingUser?.role || UserRole.EMPLOYEE} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer">
                  {Object.values(UserRole).map(r => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Primary Department</label>
                <select name="department" defaultValue={editingUser?.department || DEPARTMENTS[0]} className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer">
                  {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Official Designation</label>
                <input name="designation" required defaultValue={editingUser?.designation} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Work Email</label>
                <input name="email" type="email" required defaultValue={editingUser?.email} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Mobile Contact</label>
                <input name="phone" required defaultValue={editingUser?.phone} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50" />
              </div>
            </div>

            <div className="pt-10 flex justify-end gap-4">
              <button type="button" onClick={() => setShowUserModal(false)} className="px-10 py-4 bg-white/5 text-slate-500 font-black rounded-2xl hover:bg-white/10 hover:text-white transition-all uppercase text-[10px] tracking-widest">Discard Changes</button>
              <button type="submit" className="px-12 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all uppercase text-[10px] tracking-widest shadow-2xl shadow-indigo-600/30 shimmer-container">Confirm & Persist</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

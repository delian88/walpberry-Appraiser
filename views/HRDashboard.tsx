
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
    <div className="space-y-12">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Employees', val: stats.totalEmployees, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Active Contracts', val: stats.activeContracts, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Pending Reviews', val: stats.pendingAppraisals, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Certified Files', val: stats.certifiedAppraisals, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-6 rounded-[2rem] border-white/5 flex flex-col items-center text-center group hover:scale-105 transition-all">
            <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-4 font-black`}>#</div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* User Management */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Workforce Management</h2>
            <p className="text-slate-400 text-sm">Create, edit and manage system user access.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Search IPPIS, Name..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 md:w-64 bg-white/5 border border-white/10 rounded-2xl p-3 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button onClick={() => { setEditingUser(undefined); setShowUserModal(true); }} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-500/20 hover:scale-[1.02] transition-all">+ Add User</button>
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/10 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Employee</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">IPPIS / Dept</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Role</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="group hover:bg-white/5 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center font-black text-indigo-400">{u.firstName[0]}</div>
                        <div>
                          <p className="font-bold text-white text-sm">{u.name}</p>
                          <p className="text-[10px] text-slate-500 italic">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-xs text-slate-300">{u.ippisNumber}</p>
                      <p className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-wider">{u.department}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        u.role === UserRole.ADMIN ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        u.role === UserRole.PM ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        u.role === UserRole.CTO ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-white/5 text-slate-400 border-white/10'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingUser(u); setShowUserModal(true); }} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 transition-all"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button onClick={() => { if(confirm('Delete user?')) deleteUser(u.id); }} className="p-2 hover:bg-red-500/10 rounded-xl text-red-500/50 hover:text-red-500 transition-all"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
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
        <div className="fixed inset-0 z-[100] glass-modal flex items-center justify-center p-4">
          <form onSubmit={handleUpsertUser} className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl space-y-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">{editingUser ? 'Edit User' : 'Register New User'}</h3>
              <button type="button" onClick={() => setShowUserModal(false)} className="text-slate-500 hover:text-white"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">First Name</label>
                <input name="firstName" required defaultValue={editingUser?.firstName} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Surname</label>
                <input name="surname" required defaultValue={editingUser?.surname} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">IPPIS Number</label>
                <input name="ippis" required defaultValue={editingUser?.ippisNumber} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Role</label>
                <select name="role" defaultValue={editingUser?.role || UserRole.EMPLOYEE} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500">
                  {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Department</label>
                <select name="department" defaultValue={editingUser?.department || DEPARTMENTS[0]} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500">
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Designation</label>
                <input name="designation" required defaultValue={editingUser?.designation} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Email</label>
                <input name="email" type="email" required defaultValue={editingUser?.email} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Phone</label>
                <input name="phone" required defaultValue={editingUser?.phone} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div className="pt-8 flex justify-end gap-4">
              <button type="button" onClick={() => setShowUserModal(false)} className="px-8 py-3 bg-white/5 text-slate-400 font-bold rounded-xl hover:bg-white/10 transition-all uppercase text-[10px] tracking-widest">Cancel</button>
              <button type="submit" className="px-10 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/20">Save Profile</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

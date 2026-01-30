
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import { UserRole, PerformanceContract, AnnualAppraisal, MonthlyReview, User } from '../types';

interface Props {
  onViewContract: (c: PerformanceContract) => void;
  onViewAppraisal: (a: AnnualAppraisal) => void;
  onViewMonthly: (m: MonthlyReview) => void;
  onViewCert: (a: AnnualAppraisal) => void;
}

export const HistoryView: React.FC<Props> = ({ onViewContract, onViewAppraisal, onViewMonthly, onViewCert }) => {
  const { currentUser, contracts, appraisals, monthlyReviews, users } = useAppContext();
  const [selectedUserId, setSelectedUserId] = useState(currentUser?.id || '');
  const [filter, setFilter] = useState<'ALL' | 'CONTRACT' | 'MONTHLY' | 'ANNUAL'>('ALL');

  const isManagement = currentUser?.role !== UserRole.EMPLOYEE;

  const historyItems = useMemo(() => {
    const userContracts = contracts.filter(c => c.employeeId === selectedUserId);
    const userAppraisals = appraisals.filter(a => a.employeeId === selectedUserId);
    const userMonthly = monthlyReviews.filter(m => m.employeeId === selectedUserId);

    const items = [
      ...userContracts.map(c => ({ type: 'CONTRACT', data: c, date: c.updatedAt })),
      ...userAppraisals.map(a => ({ type: 'ANNUAL', data: a, date: a.certifiedAt || Date.now() })),
      ...userMonthly.map(m => ({ type: 'MONTHLY', data: m, date: m.updatedAt }))
    ];

    return items
      .filter(item => filter === 'ALL' || item.type === filter)
      .sort((a, b) => b.date - a.date);
  }, [selectedUserId, contracts, appraisals, monthlyReviews, filter]);

  const targetUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Search & Management Tools */}
      <div className="bg-white p-10 rounded-[3.5rem] border border-emerald-900/5 shadow-2xl flex flex-col md:flex-row gap-8 items-center justify-between">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="w-14 h-14 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <div>
            <h3 className="text-xl font-black text-emerald-950 uppercase tracking-tighter">Professional Archive</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Viewing records for: {targetUser?.name}</p>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {['ALL', 'CONTRACT', 'MONTHLY', 'ANNUAL'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${filter === f ? 'bg-emerald-900 text-white border-emerald-900 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-white hover:border-emerald-200'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {isManagement && (
          <select 
            value={selectedUserId} 
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-4 text-emerald-950 font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-800 transition-all w-full md:w-64"
          >
            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
          </select>
        )}
      </div>

      {/* Ledger Timeline */}
      <div className="relative pl-12 md:pl-20 border-l-2 border-emerald-900/10 space-y-10 py-4">
        {historyItems.length === 0 && (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-emerald-900/5">
            <p className="text-slate-300 font-black uppercase text-xs tracking-widest">No archival records found for this node.</p>
          </div>
        )}

        {historyItems.map((item, idx) => {
          const dateStr = new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          
          return (
            <div key={idx} className="relative group animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
              {/* Timeline Node */}
              <div className="absolute -left-[54px] md:-left-[88px] top-6 w-10 h-10 bg-[#fdfbf7] border-4 border-emerald-900 rounded-full flex items-center justify-center text-emerald-900 font-black text-[10px] shadow-lg z-10 group-hover:scale-125 transition-transform">
                {idx + 1}
              </div>

              <div className={`royal-card p-8 md:p-12 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-10 border-l-[12px] ${
                item.type === 'CONTRACT' ? 'border-l-emerald-700' :
                item.type === 'ANNUAL' ? 'border-l-amber-600' : 'border-l-slate-400'
              }`}>
                <div className="flex items-center gap-8 flex-1">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl shadow-inner ${
                    item.type === 'CONTRACT' ? 'bg-emerald-50 text-emerald-800' :
                    item.type === 'ANNUAL' ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-500'
                  }`}>
                    {item.type === 'CONTRACT' ? '📜' : item.type === 'ANNUAL' ? '⚖️' : '⏱️'}
                  </div>
                  <div>
                    <div className="flex items-center gap-4">
                       <h4 className="text-2xl font-black text-emerald-950 tracking-tighter leading-none">
                         {item.type === 'CONTRACT' ? 'Performance Covenant' :
                          item.type === 'ANNUAL' ? 'Merit Appraisal' : 'Progress Audit'}
                       </h4>
                       <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-400 px-3 py-1 rounded-lg">{dateStr}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-2">
                       {item.type === 'CONTRACT' ? `Period: ${(item.data as PerformanceContract).periodFrom} — ${(item.data as PerformanceContract).periodTo}` :
                        item.type === 'ANNUAL' ? `Final Rating: ${(item.data as AnnualAppraisal).finalRating} (${(item.data as AnnualAppraisal).totalScore.toFixed(1)}%)` :
                        `Monthly Tasks Logged: ${(item.data as MonthlyReview).tasks.length} Nodes`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                   <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      (item.data as any).status === 'CERTIFIED' ? 'bg-amber-100 text-amber-800 border-amber-200 shadow-lg shadow-amber-700/10' :
                      (item.data as any).status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                      'bg-slate-50 text-slate-400 border-slate-100'
                   }`}>{(item.data as any).status}</span>

                   <button 
                     onClick={() => {
                       if(item.type === 'CONTRACT') onViewContract(item.data as any);
                       if(item.type === 'ANNUAL') onViewAppraisal(item.data as any);
                       if(item.type === 'MONTHLY') onViewMonthly(item.data as any);
                     }}
                     className="p-5 bg-white border border-slate-200 text-emerald-900 rounded-2xl hover:bg-emerald-950 hover:text-white hover:scale-110 transition-all shadow-lg"
                   >
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                   </button>

                   {item.type === 'ANNUAL' && (item.data as any).status === 'CERTIFIED' && (
                     <button 
                       onClick={() => onViewCert(item.data as any)}
                       className="p-5 bg-amber-700 text-white rounded-2xl hover:bg-amber-800 hover:scale-110 transition-all shadow-xl shadow-amber-700/20"
                     >
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                     </button>
                   )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


import React, { useState, useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import { AnnualAppraisal, FormStatus, AppraisalKRA, UserRole } from '../types';
import { getRating } from '../constants';

export const AppraisalForm: React.FC<{ onClose: () => void, initialData?: AnnualAppraisal }> = ({ onClose, initialData }) => {
  const { currentUser, contracts, upsertAppraisal } = useAppContext();
  
  // Fixed: Specifically find the single Active & Approved contract
  const activeContract = useMemo(() => 
    contracts.find(c => c.employeeId === currentUser?.id && c.isActive && c.status === FormStatus.APPROVED), 
    [contracts, currentUser]
  );
  
  const [kraScoring, setKraScoring] = useState<AppraisalKRA[]>(initialData?.kraScoring || activeContract?.kraEntries.map(k => ({ ...k, achievement: 0, rawScore: 0, weightedRawScore: 0 })) || []);
  const [employeeComments, setEmployeeComments] = useState(initialData?.employeeComments || '');
  const [pmComments, setPmComments] = useState(initialData?.pmComments || '');

  const totalScore = useMemo(() => kraScoring.reduce((sum, k) => sum + k.weightedRawScore, 0), [kraScoring]);
  const rating = getRating(totalScore);

  const updateAchievement = (id: string, val: number) => {
    setKraScoring(kraScoring.map(k => {
      if (k.id === id) {
        const rawScore = k.target > 0 ? (val / k.target) * 100 : 0;
        const weightedRawScore = (val / k.target) * k.weight;
        return { ...k, achievement: val, rawScore, weightedRawScore };
      }
      return k;
    }));
  };

  const handleAction = (status: FormStatus) => {
    const appraisal: AnnualAppraisal = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      employeeId: currentUser?.id || '',
      contractId: activeContract?.id || '',
      periodFrom: activeContract?.periodFrom || '',
      periodTo: activeContract?.periodTo || '',
      kraScoring,
      totalScore,
      finalRating: rating,
      employeeComments,
      pmComments,
      ctoComments: initialData?.ctoComments || '',
      status,
      certifiedAt: status === FormStatus.CERTIFIED ? Date.now() : initialData?.certifiedAt,
    };
    upsertAppraisal(appraisal);
    onClose();
  };

  const isCTO = currentUser?.role === UserRole.CTO;
  const isPM = currentUser?.role === UserRole.PM;

  if (!activeContract && !initialData) {
    return (
      <div className="fixed inset-0 z-50 glass-modal flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-white/10 p-10 rounded-[2.5rem] text-center max-w-md">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-xl font-black text-white mb-2">No Active Contract Found</h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">You must have an <b>Approved</b> and <b>Active</b> Performance Contract before you can initiate the Annual Appraisal phase.</p>
            <button onClick={onClose} className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Dismiss</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 glass-modal flex items-center justify-center p-4">
      <div className="bg-slate-900/95 border border-white/10 rounded-[2.5rem] w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Annual Appraisal</h2>
            <p className="text-[10px] text-emerald-400 uppercase tracking-[0.4em] font-black mt-1">Final Performance Scoring</p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
                <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Composite Score</p>
                <p className="text-xl font-black text-emerald-400">{totalScore.toFixed(1)}% ({rating})</p>
            </div>
            <button onClick={onClose} className="hover:bg-white/10 p-3 rounded-2xl transition-all border border-white/5">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-12">
          <section className="bg-white/5 p-8 rounded-[2rem] border border-white/5 flex flex-wrap gap-12">
             <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Employee</p><p className="font-bold text-slate-100">{currentUser?.name}</p></div>
             <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">IPPIS</p><p className="font-bold text-slate-100">{currentUser?.ippisNumber}</p></div>
             <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Cycle</p><p className="font-bold text-indigo-400">{activeContract?.periodFrom} — {activeContract?.periodTo}</p></div>
          </section>

          <section className="space-y-6">
            <h3 className="font-black text-slate-500 uppercase text-[10px] tracking-[0.3em]">KPI Performance Matrix</h3>
            <div className="overflow-x-auto border border-white/10 rounded-[2rem] bg-white/5 shadow-2xl shadow-emerald-500/5">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-5 font-black text-slate-500 uppercase tracking-widest">KRA / Objective</th>
                    <th className="px-6 py-5 font-black text-slate-500 uppercase tracking-widest text-center">Wt%</th>
                    <th className="px-6 py-5 font-black text-slate-500 uppercase tracking-widest text-center">Target</th>
                    <th className="px-6 py-5 font-black text-slate-500 uppercase tracking-widest text-center">Achievement</th>
                    <th className="px-6 py-5 font-black text-slate-500 uppercase tracking-widest text-center">W. Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-white/0">
                  {kraScoring.map(k => (
                    <tr key={k.id} className="hover:bg-white/5 transition-colors group">
                      <td className="p-6">
                        <p className="font-bold text-slate-200">{k.area}</p>
                        <p className="text-slate-500 text-[10px] italic mt-1 leading-relaxed">{k.kpis}</p>
                      </td>
                      <td className="p-6 text-center text-slate-500 font-bold">{k.weight}%</td>
                      <td className="p-6 text-center text-slate-300 font-black">{k.target}</td>
                      <td className="p-6 text-center">
                        <input 
                          type="number" 
                          value={k.achievement} 
                          onChange={e => updateAchievement(k.id, Number(e.target.value))} 
                          className="w-24 bg-slate-900 border border-white/10 rounded-xl p-3 text-center font-black text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                        />
                      </td>
                      <td className="p-6 text-center font-black text-emerald-400 group-hover:scale-110 transition-transform">{k.weightedRawScore.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-white/5 font-black">
                    <td colSpan={4} className="p-8 text-right text-slate-500 uppercase tracking-[0.2em] text-[10px]">Total Combined Appraisal Score:</td>
                    <td className="p-8 text-center text-xl text-emerald-400 shadow-inner">{totalScore.toFixed(1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Employee Narrative</label>
                <textarea value={employeeComments} onChange={e => setEmployeeComments(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 h-40 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-300 text-sm" placeholder="Provide your perspective on the year..." />
             </div>
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Management Review</label>
                <textarea value={pmComments} onChange={e => setPmComments(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 h-40 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-300 text-sm" placeholder="Supervisory feedback..." disabled={!isPM && !isCTO} />
             </div>
          </section>
        </div>

        <div className="p-10 bg-white/5 border-t border-white/5 flex justify-end gap-4">
          <button onClick={() => handleAction(FormStatus.DRAFT)} className="px-10 py-4 bg-white/5 border border-white/10 text-slate-400 font-black rounded-2xl hover:bg-white/10 transition-all text-[10px] uppercase tracking-[0.2em]">Save as Draft</button>
          
          {isCTO ? (
            <button onClick={() => handleAction(FormStatus.CERTIFIED)} className="px-12 py-4 bg-amber-600 text-white font-black rounded-2xl hover:bg-amber-500 shadow-2xl shadow-amber-600/20 transition-all text-[10px] uppercase tracking-[0.2em] shimmer-container">Final Certify & Lock</button>
          ) : (
            <button onClick={() => handleAction(FormStatus.SUBMITTED)} className="px-12 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 shadow-2xl shadow-emerald-600/20 transition-all text-[10px] uppercase tracking-[0.2em] shimmer-container">Submit for Approval</button>
          )}
        </div>
      </div>
    </div>
  );
};

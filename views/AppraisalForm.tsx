
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import { AnnualAppraisal, FormStatus, AppraisalKRA, UserRole } from '../types';
import { getRating } from '../constants';

export const AppraisalForm: React.FC<{ onClose: () => void, initialData?: AnnualAppraisal }> = ({ onClose, initialData }) => {
  const { currentUser, contracts, upsertAppraisal } = useAppContext();
  
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
        const weightedRawScore = k.target > 0 ? (val / k.target) * k.weight : 0;
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
  const isEmployee = currentUser?.role === UserRole.EMPLOYEE;

  if (!activeContract && !initialData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/20 backdrop-blur-sm">
        <div className="bg-[#fdfbf7] border border-emerald-900/10 p-12 rounded-[3.5rem] text-center max-w-lg shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-3 bg-amber-600"></div>
            <div className="w-20 h-20 bg-amber-50 text-amber-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-3xl font-black text-emerald-950 mb-4 tracking-tight">Active Deployment Missing</h2>
            <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">An <b>Approved</b> and <b>Active</b> Performance Contract is required to initiate the Annual Appraisal cycle.</p>
            <button onClick={onClose} className="w-full btn-majestic py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl">Return to Fleet</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-fade-in bg-emerald-950/20 backdrop-blur-sm">
      <div className="bg-[#fdfbf7] border border-emerald-900/10 rounded-[4rem] w-full max-w-[95vw] h-[95vh] flex flex-col shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-4 bg-emerald-900"></div>

        <header className="p-10 md:p-14 border-b border-emerald-900/5 flex justify-between items-center bg-white/40">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-emerald-950 uppercase tracking-tighter">Annual Performance Audit</h2>
            <div className="flex items-center gap-4 mt-2">
                <span className="text-[11px] text-amber-700 uppercase tracking-[0.3em] font-black">Cycle Conclusion</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{activeContract?.periodFrom} — {activeContract?.periodTo}</span>
            </div>
          </div>
          <div className="flex items-center gap-10">
            <div className="text-right hidden sm:block">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Composite Performance</p>
                <div className="flex items-center gap-3 justify-end">
                    <span className="text-3xl font-black text-emerald-900 leading-none">{totalScore.toFixed(1)}%</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black uppercase tracking-widest">{rating}</span>
                </div>
            </div>
            <button onClick={onClose} className="p-4 hover:bg-emerald-900/5 rounded-2xl transition-all border border-slate-200">
              <svg className="w-7 h-7 text-emerald-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 md:p-20 space-y-16">
          <section className="bg-white p-10 rounded-[3rem] border border-emerald-900/5 shadow-xl flex flex-wrap gap-16">
             <div className="flex items-center gap-5">
               <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-white flex items-center justify-center font-black text-xs shadow-lg">01</div>
               <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Professional Identity</p><p className="font-bold text-emerald-950 text-xl">{currentUser?.name}</p></div>
             </div>
             <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">IPPIS Protocol</p><p className="font-bold text-emerald-950 text-xl">{currentUser?.ippisNumber}</p></div>
             <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deployment Phase</p><p className="font-bold text-emerald-800 text-xl uppercase tracking-tighter">Annual Review</p></div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-white flex items-center justify-center font-black text-xs shadow-lg">02</div>
              <h3 className="font-black text-emerald-950 uppercase text-[12px] tracking-[0.4em]">KPI Achievement Matrix</h3>
            </div>
            <div className="overflow-x-auto bg-white rounded-[3.5rem] p-10 shadow-2xl border border-emerald-900/5">
              <table className="w-full text-left text-sm min-w-[1000px] border-separate border-spacing-y-3">
                <thead className="bg-emerald-50/50">
                  <tr>
                    <th className="p-8 rounded-l-2xl font-black text-emerald-900 uppercase tracking-widest">Responsibility Node</th>
                    <th className="p-8 font-black text-emerald-900 uppercase tracking-widest text-center w-32">Weight %</th>
                    <th className="p-8 font-black text-emerald-900 uppercase tracking-widest text-center w-32">Target</th>
                    <th className="p-8 font-black text-emerald-900 uppercase tracking-widest text-center w-40">Actual</th>
                    <th className="p-8 rounded-r-2xl font-black text-emerald-900 uppercase tracking-widest text-center w-40">Weighted Score</th>
                  </tr>
                </thead>
                <tbody>
                  {kraScoring.map(k => (
                    <tr key={k.id} className="bg-[#fcfbf9] hover:bg-white transition-all group border border-slate-100">
                      <td className="p-8">
                        <p className="font-black text-emerald-950 text-base">{k.area}</p>
                        <p className="text-slate-400 text-[11px] font-medium mt-2 leading-relaxed opacity-70">{k.kpis}</p>
                      </td>
                      <td className="p-8 text-center text-slate-400 font-bold">{k.weight}%</td>
                      <td className="p-8 text-center text-emerald-950 font-black text-xl">{k.target}</td>
                      <td className="p-6 text-center">
                        <input 
                          type="number" 
                          value={k.achievement} 
                          onChange={e => updateAchievement(k.id, Number(e.target.value))} 
                          disabled={!isEmployee}
                          className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-center font-black text-emerald-900 focus:ring-2 focus:ring-emerald-800 outline-none text-xl shadow-inner" 
                        />
                      </td>
                      <td className="p-8 text-center font-black text-emerald-700 text-2xl group-hover:scale-110 transition-transform">{k.weightedRawScore.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-900 text-white shadow-2xl rounded-3xl">
                    <td colSpan={4} className="p-10 text-right text-emerald-100/50 uppercase tracking-[0.4em] font-black text-[11px]">Cumulative Corporate Merit:</td>
                    <td className="p-10 text-center text-4xl font-black text-white">{totalScore.toFixed(1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-10">
             <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-white flex items-center justify-center font-black text-xs shadow-lg">03</div>
                  <label className="text-[12px] font-black text-emerald-950 uppercase tracking-[0.4em]">Individual Narrative</label>
                </div>
                <textarea 
                  value={employeeComments} 
                  onChange={e => setEmployeeComments(e.target.value)} 
                  disabled={!isEmployee}
                  className="w-full bg-white border border-emerald-900/5 rounded-[3rem] p-10 h-56 focus:ring-2 focus:ring-emerald-800 outline-none text-emerald-950 text-base leading-relaxed shadow-xl placeholder:text-slate-200" 
                  placeholder="Summarize your performance, achievements, and professional growth during this cycle..." 
                />
             </div>
             <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-white flex items-center justify-center font-black text-xs shadow-lg">04</div>
                  <label className="text-[12px] font-black text-emerald-950 uppercase tracking-[0.4em]">Executive Feedback</label>
                </div>
                <textarea 
                  value={pmComments} 
                  onChange={e => setPmComments(e.target.value)} 
                  disabled={!isPM && !isCTO}
                  className="w-full bg-white border border-emerald-900/5 rounded-[3rem] p-10 h-56 focus:ring-2 focus:ring-emerald-800 outline-none text-emerald-950 text-base leading-relaxed shadow-xl placeholder:text-slate-200" 
                  placeholder="Executive commentary on the individual's performance and future objectives..." 
                />
             </div>
          </section>
        </div>

        <footer className="p-12 md:p-16 bg-white border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-6">
          <button onClick={() => handleAction(FormStatus.DRAFT)} className="px-14 py-6 bg-slate-100 text-slate-500 font-black rounded-3xl hover:bg-slate-200 transition-all text-[11px] uppercase tracking-widest">Discard Session</button>
          {isCTO ? (
            <button onClick={() => handleAction(FormStatus.CERTIFIED)} className="px-20 py-6 bg-amber-700 text-white font-black rounded-3xl shadow-2xl hover:bg-amber-800 transition-all text-[11px] uppercase tracking-[0.3em]">Finalize & Issue Certificate</button>
          ) : (
            <button onClick={() => handleAction(FormStatus.SUBMITTED)} className="px-20 py-6 btn-majestic rounded-3xl shadow-2xl transition-all text-[11px] uppercase tracking-[0.3em]">Submit for Board Review</button>
          )}
        </footer>
      </div>
    </div>
  );
};

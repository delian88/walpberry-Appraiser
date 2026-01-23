
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import { AnnualAppraisal, FormStatus, AppraisalKRA, UserRole } from '../types';
import { getRating } from '../constants';

export const AppraisalForm: React.FC<{ onClose: () => void, initialData?: AnnualAppraisal }> = ({ onClose, initialData }) => {
  const { currentUser, contracts, upsertAppraisal } = useAppContext();
  const activeContract = useMemo(() => contracts.find(c => c.employeeId === currentUser?.id && c.status === FormStatus.APPROVED), [contracts, currentUser]);
  
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-emerald-600 text-white">
          <h2 className="text-xl font-bold uppercase tracking-widest">Annual Performance Appraisal</h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-[10px] opacity-70 uppercase">Overall Rating</p>
                <p className="text-lg font-bold">{rating} ({totalScore.toFixed(1)}%)</p>
            </div>
            <button onClick={onClose} className="hover:bg-emerald-700 p-2 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          <section className="bg-slate-50 p-6 rounded-2xl border flex flex-wrap gap-10">
             <div><p className="text-xs font-bold text-slate-400 uppercase mb-1">Employee</p><p className="font-bold">{currentUser?.name}</p></div>
             <div><p className="text-xs font-bold text-slate-400 uppercase mb-1">IPPIS</p><p className="font-bold">{currentUser?.ippisNumber}</p></div>
             <div><p className="text-xs font-bold text-slate-400 uppercase mb-1">Period</p><p className="font-bold">{activeContract?.periodFrom} to {activeContract?.periodTo}</p></div>
          </section>

          <section className="space-y-4">
            <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wider">KPI Scoring Table</h3>
            <div className="overflow-x-auto border rounded-xl shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-bold border-b">Key Result Area / KPI</th>
                    <th className="px-4 py-3 font-bold border-b text-center">Weight</th>
                    <th className="px-4 py-3 font-bold border-b text-center">Target</th>
                    <th className="px-4 py-3 font-bold border-b text-center">Achievement</th>
                    <th className="px-4 py-3 font-bold border-b text-center">Raw Score</th>
                    <th className="px-4 py-3 font-bold border-b text-center">Weighted Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white">
                  {kraScoring.map(k => (
                    <tr key={k.id}>
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{k.area}</p>
                        <p className="text-slate-500 italic mt-1">{k.kpis}</p>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-400">{k.weight}%</td>
                      <td className="p-4 text-center font-bold">{k.target}</td>
                      <td className="p-4 text-center">
                        <input 
                          type="number" 
                          value={k.achievement} 
                          onChange={e => updateAchievement(k.id, Number(e.target.value))} 
                          className="w-20 p-2 border rounded-lg text-center font-bold focus:ring-2 focus:ring-emerald-500 outline-none" 
                        />
                      </td>
                      <td className="p-4 text-center text-slate-400">{k.rawScore.toFixed(1)}</td>
                      <td className="p-4 text-center font-bold text-emerald-600">{k.weightedRawScore.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold text-base">
                    <td colSpan={5} className="p-4 text-right">TOTAL COMPOSITE SCORE:</td>
                    <td className="p-4 text-center text-emerald-700">{totalScore.toFixed(1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Employee Comments</label>
                <textarea value={employeeComments} onChange={e => setEmployeeComments(e.target.value)} className="w-full border rounded-xl p-4 h-32 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Provide self-reflection..." />
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Manager Feedback</label>
                <textarea value={pmComments} onChange={e => setPmComments(e.target.value)} className="w-full border rounded-xl p-4 h-32 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Manager review notes..." disabled={!isPM && !isCTO} />
             </div>
          </section>
        </div>

        <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
          <button onClick={() => handleAction(FormStatus.DRAFT)} className="px-6 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300">Save Draft</button>
          
          {isCTO ? (
            <button onClick={() => handleAction(FormStatus.CERTIFIED)} className="px-6 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 shadow-lg shadow-amber-100">Final Certify & Lock</button>
          ) : (
            <button onClick={() => handleAction(FormStatus.SUBMITTED)} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-100">Submit for Approval</button>
          )}
        </div>
      </div>
    </div>
  );
};

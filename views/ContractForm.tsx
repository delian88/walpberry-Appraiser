
import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { PerformanceContract, FormStatus, KRAEntry } from '../types';

export const ContractForm: React.FC<{ onClose: () => void, initialData?: PerformanceContract }> = ({ onClose, initialData }) => {
  const { currentUser, upsertContract } = useAppContext();
  const [periodFrom, setPeriodFrom] = useState(initialData?.periodFrom || '');
  const [periodTo, setPeriodTo] = useState(initialData?.periodTo || '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [kraEntries, setKraEntries] = useState<KRAEntry[]>(initialData?.kraEntries || []);

  const addKra = () => {
    setKraEntries([...kraEntries, { 
      id: Math.random().toString(36).substr(2, 9), 
      area: '', objectives: '', weight: 0, kpis: '', target: 0, unit: 'Percentage' 
    }]);
  };

  const updateKra = (id: string, field: keyof KRAEntry, value: any) => {
    setKraEntries(kraEntries.map(k => k.id === id ? { ...k, [field]: value } : k));
  };

  const handleSubmit = (status: FormStatus) => {
    const contract: PerformanceContract = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      employeeId: currentUser?.id || '',
      periodFrom,
      periodTo,
      kraEntries,
      status,
      isActive,
      updatedAt: Date.now(),
    };
    upsertContract(contract);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 glass-modal flex items-center justify-center p-2 md:p-4">
      <div className="bg-slate-900/90 border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] w-[96vw] md:w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-5 md:p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Performance Contract</h2>
            <p className="text-[8px] md:text-[10px] text-indigo-400 uppercase tracking-[0.4em] font-black mt-1">Agreement Phase</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 md:p-3 rounded-xl md:rounded-2xl transition-all border border-white/5">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:p-10 space-y-8 md:space-y-10">
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
            <div className="space-y-4 md:space-y-6">
              <h3 className="font-black text-slate-500 uppercase text-[9px] md:text-[10px] tracking-[0.3em]">Contract Period & Status</h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1 md:mb-2">From</label>
                  <input type="date" value={periodFrom} onChange={e => setPeriodFrom(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-lg md:rounded-xl p-2.5 md:p-3 text-xs md:text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1 md:mb-2">To</label>
                  <input type="date" value={periodTo} onChange={e => setPeriodTo(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-lg md:rounded-xl p-2.5 md:p-3 text-xs md:text-sm text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/10">
                <div className="pr-4">
                    <p className="text-[11px] md:text-xs font-bold text-white uppercase tracking-wider">Active Status</p>
                    <p className="text-[8px] md:text-[10px] text-slate-500 leading-tight">Enable as primary tracking contract.</p>
                </div>
                <button 
                  onClick={() => setIsActive(!isActive)}
                  className={`w-10 md:w-12 h-5 md:h-6 rounded-full transition-all relative flex-shrink-0 ${isActive ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${isActive ? 'left-5.5 md:left-7' : 'left-0.5 md:left-1'}`} />
                </button>
              </div>
            </div>
            <div className="space-y-4 md:space-y-6">
              <h3 className="font-black text-slate-500 uppercase text-[9px] md:text-[10px] tracking-[0.3em]">Employee Snapshot</h3>
              <div className="bg-white/5 p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
                <p className="text-xs md:text-sm text-slate-300 font-medium truncate"><span className="text-slate-500 font-bold uppercase text-[9px] mr-2 tracking-widest">Name:</span> {currentUser?.name}</p>
                <p className="text-xs md:text-sm text-slate-300 font-medium"><span className="text-slate-500 font-bold uppercase text-[9px] mr-2 tracking-widest">IPPIS:</span> {currentUser?.ippisNumber}</p>
                <p className="text-xs md:text-sm text-slate-300 font-medium truncate"><span className="text-slate-500 font-bold uppercase text-[9px] mr-2 tracking-widest">Dept:</span> {currentUser?.department}</p>
              </div>
            </div>
          </section>

          <section className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="font-black text-slate-500 uppercase text-[9px] md:text-[10px] tracking-[0.3em]">Key Result Areas (KRAs)</h3>
              <button onClick={addKra} className="w-full sm:w-auto text-indigo-400 font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 bg-white/5 px-5 py-2.5 rounded-full border border-white/10 hover:bg-white/10 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                Add Row
              </button>
            </div>
            <div className="overflow-x-auto border border-white/10 rounded-2xl md:rounded-[2rem] bg-white/5">
              <table className="w-full text-left text-[11px] md:text-xs min-w-[800px]">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-5 md:px-6 py-3 md:py-4 font-black text-slate-500 uppercase tracking-widest">Area</th>
                    <th className="px-5 md:px-6 py-3 md:py-4 font-black text-slate-500 uppercase tracking-widest">Objectives</th>
                    <th className="px-5 md:px-6 py-3 md:py-4 font-black text-slate-500 uppercase tracking-widest w-24">Wt %</th>
                    <th className="px-5 md:px-6 py-3 md:py-4 font-black text-slate-500 uppercase tracking-widest">KPIs</th>
                    <th className="px-5 md:px-6 py-3 md:py-4 font-black text-slate-500 uppercase tracking-widest w-24">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {kraEntries.length === 0 && (
                    <tr><td colSpan={5} className="p-10 md:p-12 text-center text-slate-600 italic font-medium">No objectives defined yet.</td></tr>
                  )}
                  {kraEntries.map(k => (
                    <tr key={k.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-2"><input value={k.area} onChange={e => updateKra(k.id, 'area', e.target.value)} className="w-full bg-transparent border-none p-2.5 md:p-3 text-slate-200 focus:ring-0" placeholder="Area..." /></td>
                      <td className="p-2"><textarea value={k.objectives} onChange={e => updateKra(k.id, 'objectives', e.target.value)} className="w-full bg-transparent border-none p-2.5 md:p-3 text-slate-200 focus:ring-0 resize-none" rows={2} placeholder="Description..." /></td>
                      <td className="p-2"><input type="number" value={k.weight} onChange={e => updateKra(k.id, 'weight', Number(e.target.value))} className="w-full bg-transparent border-none p-2.5 md:p-3 text-slate-200 font-bold focus:ring-0 text-center" /></td>
                      <td className="p-2"><textarea value={k.kpis} onChange={e => updateKra(k.id, 'kpis', e.target.value)} className="w-full bg-transparent border-none p-2.5 md:p-3 text-slate-200 focus:ring-0 resize-none" rows={2} placeholder="KPIs..." /></td>
                      <td className="p-2"><input type="number" value={k.target} onChange={e => updateKra(k.id, 'target', Number(e.target.value))} className="w-full bg-transparent border-none p-2.5 md:p-3 text-slate-200 font-bold focus:ring-0 text-center" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="p-5 md:p-10 bg-white/5 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
          <button onClick={() => handleSubmit(FormStatus.DRAFT)} className="w-full sm:w-auto px-8 py-3.5 md:px-10 md:py-4 bg-white/5 border border-white/10 text-slate-400 font-black rounded-xl md:rounded-2xl hover:bg-white/10 transition-all text-[9px] md:text-[10px] uppercase tracking-[0.2em]">Draft</button>
          <button onClick={() => handleSubmit(FormStatus.SUBMITTED)} className="w-full sm:w-auto px-8 py-3.5 md:px-10 md:py-4 bg-indigo-600 text-white font-black rounded-xl md:rounded-2xl hover:bg-indigo-500 shadow-2xl transition-all text-[9px] md:text-[10px] uppercase tracking-[0.2em] shimmer-container">Confirm</button>
        </div>
      </div>
    </div>
  );
};

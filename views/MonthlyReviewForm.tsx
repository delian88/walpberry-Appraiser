
import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { MonthlyReview, MonthlyTask, FormStatus, UserRole } from '../types';

export const MonthlyReviewForm: React.FC<{ onClose: () => void, initialData?: MonthlyReview }> = ({ onClose, initialData }) => {
  const { currentUser, upsertMonthly } = useAppContext();
  
  const [lastReviewDate, setLastReviewDate] = useState(initialData?.lastReviewDate || '');
  const [todayDate, setTodayDate] = useState(initialData?.todayDate || new Date().toISOString().split('T')[0]);
  const [appraiserName, setAppraiserName] = useState(initialData?.appraiserName || 'John Adewale');
  const [appraiserRank, setAppraiserRank] = useState(initialData?.appraiserRank || 'Senior Project Manager');
  const [responsibilities, setResponsibilities] = useState(initialData?.responsibilities || '');
  const [tasks, setTasks] = useState<MonthlyTask[]>(initialData?.tasks || []);

  const addTask = () => {
    setTasks([...tasks, {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      expectation: '',
      weight: 0,
      unitOfMeasure: 'Percentage',
      startDate: '',
      dueDate: '',
      status: 'In Progress',
      challenges: ''
    }]);
  };

  const updateTask = (id: string, field: keyof MonthlyTask, value: any) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleAction = (status: FormStatus) => {
    const review: MonthlyReview = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      employeeId: currentUser?.id || '',
      lastReviewDate,
      todayDate,
      appraiserName,
      appraiserRank,
      responsibilities,
      tasks,
      appraiserComments: initialData?.appraiserComments || '',
      status,
      updatedAt: Date.now()
    };
    upsertMonthly(review);
    onClose();
  };

  const isViewOnly = currentUser?.role !== UserRole.EMPLOYEE && initialData?.status === FormStatus.SUBMITTED;

  return (
    <div className="fixed inset-0 z-50 glass-modal flex items-center justify-center p-2 md:p-4">
      <div className="bg-slate-900/90 border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] w-[96vw] md:w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-5 md:p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Monthly Review</h2>
            <p className="text-[8px] md:text-[10px] text-indigo-400 uppercase tracking-[0.4em] font-black mt-1">Activity Log & Expectations</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 md:p-3 rounded-xl md:rounded-2xl transition-all border border-white/5">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:p-10 space-y-8 md:space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
            <section className="bg-white/5 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 space-y-4 md:space-y-6">
              <h3 className="font-black text-slate-500 uppercase text-[9px] md:text-[10px] tracking-[0.3em] mb-2 md:mb-4">Identity</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div><label className="text-[9px] text-slate-500 uppercase font-black block mb-1">Employee</label><p className="font-bold text-slate-100 text-xs md:text-sm">{currentUser?.name}</p></div>
                <div><label className="text-[9px] text-slate-500 uppercase font-black block mb-1">IPPIS</label><p className="font-bold text-slate-100 text-xs md:text-sm">{currentUser?.ippisNumber}</p></div>
              </div>
            </section>

            <section className="bg-white/5 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 space-y-4 md:space-y-6">
              <h3 className="font-black text-slate-500 uppercase text-[9px] md:text-[10px] tracking-[0.3em] mb-2 md:mb-4">Cycle Progress</h3>
              <div className="grid grid-cols-2 gap-3 md:gap-6">
                <div>
                  <label className="text-[9px] text-slate-500 uppercase font-black block mb-1.5 md:mb-2">Last Review</label>
                  <input type="date" value={lastReviewDate} onChange={e => setLastReviewDate(e.target.value)} disabled={isViewOnly} className="w-full bg-slate-900 border border-white/10 rounded-lg md:rounded-xl p-2 md:p-3 text-[11px] md:text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 uppercase font-black block mb-1.5 md:mb-2">Today</label>
                  <input type="date" value={todayDate} onChange={e => setTodayDate(e.target.value)} disabled={isViewOnly} className="w-full bg-slate-900 border border-white/10 rounded-lg md:rounded-xl p-2 md:p-3 text-[11px] md:text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
            </section>
          </div>

          <section className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
              <h3 className="font-black text-slate-500 uppercase text-[9px] md:text-[10px] tracking-[0.3em]">Activity Breakdown</h3>
              {!isViewOnly && (
                <button onClick={addTask} className="w-full sm:w-auto bg-white/5 border border-white/10 text-indigo-400 px-5 md:px-6 py-2 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">+ Add Activity</button>
              )}
            </div>
            <div className="overflow-x-auto border border-white/5 rounded-2xl md:rounded-[2rem] bg-white/5">
              <table className="w-full text-left text-[11px] md:text-xs min-w-[1000px]">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-5 md:px-6 py-3 md:py-4 font-black text-slate-500 uppercase tracking-widest w-12">SN</th>
                    <th className="px-5 md:px-6 py-3 md:py-4 font-black text-slate-500 uppercase tracking-widest">Description</th>
                    <th className="px-5 md:px-6 py-3 md:py-4 font-black text-slate-500 uppercase tracking-widest w-24 text-center">Weight %</th>
                    <th className="px-5 md:px-6 py-3 md:py-4 font-black text-slate-500 uppercase tracking-widest w-40">UoM</th>
                    <th className="px-5 md:px-6 py-3 md:py-4 font-black text-slate-500 uppercase tracking-widest">Expectation</th>
                    <th className="px-5 md:px-6 py-3 md:py-4 font-black text-slate-500 uppercase tracking-widest w-40 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tasks.length === 0 && (
                    <tr><td colSpan={6} className="p-10 text-center text-slate-600 uppercase tracking-widest font-black text-[10px]">No activities logged for this period.</td></tr>
                  )}
                  {tasks.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 md:px-6 py-4 md:py-6 font-black text-slate-700">{idx + 1}</td>
                      <td className="p-2">
                        <textarea value={t.description} onChange={e => updateTask(t.id, 'description', e.target.value)} disabled={isViewOnly} className="w-full bg-transparent border-none focus:ring-0 p-3 md:p-4 text-slate-200 resize-none min-h-[70px]" placeholder="Activity description..." />
                      </td>
                      <td className="p-2">
                        <input type="number" value={t.weight} onChange={e => updateTask(t.id, 'weight', Number(e.target.value))} disabled={isViewOnly} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-center font-black text-white outline-none focus:ring-2 focus:ring-indigo-500" />
                      </td>
                      <td className="p-2">
                         <select value={t.unitOfMeasure} onChange={e => updateTask(t.id, 'unitOfMeasure', e.target.value)} disabled={isViewOnly} className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-[10px] font-bold uppercase text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500">
                           <option className="bg-slate-900">Percentage</option>
                           <option className="bg-slate-900">Units/Count</option>
                           <option className="bg-slate-900">Man-Hours</option>
                           <option className="bg-slate-900">Rating (1-5)</option>
                           <option className="bg-slate-900">Binary (Yes/No)</option>
                         </select>
                      </td>
                      <td className="p-2">
                        <textarea value={t.expectation} onChange={e => updateTask(t.id, 'expectation', e.target.value)} disabled={isViewOnly} className="w-full bg-transparent border-none focus:ring-0 p-3 md:p-4 text-slate-200 resize-none min-h-[70px]" placeholder="Specific expectation..." />
                      </td>
                      <td className="px-5 md:px-6 py-4 md:py-6">
                        <select 
                          value={t.status} 
                          onChange={e => updateTask(t.id, 'status', e.target.value)} 
                          disabled={isViewOnly}
                          className={`w-full bg-white/5 border border-white/10 rounded-lg md:rounded-xl p-2.5 md:p-3 font-bold text-[9px] md:text-[10px] uppercase text-center transition-all ${
                            t.status === 'Completed' ? 'text-emerald-400' : 
                            t.status === 'In Progress' ? 'text-amber-400' : 'text-red-400'
                          }`}
                        >
                          <option className="bg-slate-900">Completed</option>
                          <option className="bg-slate-900">In Progress</option>
                          <option className="bg-slate-900">Delayed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="p-5 md:p-10 bg-white/5 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
          {!isViewOnly && (
            <>
              <button onClick={() => handleAction(FormStatus.DRAFT)} className="w-full sm:w-auto px-8 py-3.5 md:px-10 md:py-4 bg-white/5 border border-white/10 text-slate-400 font-black rounded-xl md:rounded-2xl hover:bg-white/10 transition-all text-[9px] md:text-[10px] uppercase tracking-[0.2em]">Save as Draft</button>
              <button onClick={() => handleAction(FormStatus.SUBMITTED)} className="w-full sm:w-auto px-8 py-3.5 md:px-10 md:py-4 bg-indigo-600 text-white font-black rounded-xl md:rounded-2xl hover:bg-indigo-500 shadow-2xl transition-all text-[9px] md:text-[10px] uppercase tracking-[0.2em] shimmer-container">Commit for Review</button>
            </>
          )}
          {isViewOnly && (
            <button onClick={onClose} className="w-full sm:w-auto px-10 py-3.5 md:px-12 md:py-4 bg-slate-100 text-slate-900 font-black rounded-xl md:rounded-2xl transition-all text-[9px] md:text-[10px] uppercase tracking-[0.2em]">Exit Review</button>
          )}
        </div>
      </div>
    </div>
  );
};

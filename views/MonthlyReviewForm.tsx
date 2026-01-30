
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
  const isEmployee = currentUser?.role === UserRole.EMPLOYEE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-fade-in bg-emerald-950/20 backdrop-blur-sm">
      <div className="bg-[#fdfbf7] border border-emerald-900/10 rounded-[4rem] w-full max-w-[95vw] h-[95vh] flex flex-col shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-4 bg-emerald-900"></div>

        <header className="p-10 md:p-14 border-b border-emerald-900/5 flex justify-between items-center bg-white/40">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-emerald-950 uppercase tracking-tighter">Progress Tracker</h2>
            <div className="flex items-center gap-4 mt-2">
                <span className="text-[11px] text-amber-700 uppercase tracking-[0.3em] font-black">Monthly Alignment</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Protocol Node: {currentUser?.ippisNumber}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-5 hover:bg-emerald-900/5 rounded-3xl transition-all border border-slate-200">
            <svg className="w-7 h-7 text-emerald-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-10 md:p-20 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <section className="bg-white p-12 rounded-[3rem] border border-emerald-900/5 shadow-xl space-y-8">
              <div className="flex items-center gap-5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-white flex items-center justify-center font-black text-xs">01</div>
                <h3 className="font-black text-emerald-950 uppercase text-[12px] tracking-[0.4em]">Review Personnel</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div><label className="text-[10px] text-slate-400 uppercase font-black block mb-2">Subject</label><p className="font-bold text-emerald-950 text-xl">{currentUser?.name}</p></div>
                <div><label className="text-[10px] text-slate-400 uppercase font-black block mb-2">Lead Auditor</label><p className="font-bold text-emerald-950 text-xl">{appraiserName}</p></div>
              </div>
            </section>

            <section className="bg-white p-12 rounded-[3rem] border border-emerald-900/5 shadow-xl space-y-8">
              <div className="flex items-center gap-5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-white flex items-center justify-center font-black text-xs">02</div>
                <h3 className="font-black text-emerald-950 uppercase text-[12px] tracking-[0.4em]">Audit Timeline</h3>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-black block mb-2">From</label>
                  <input type="date" value={lastReviewDate} onChange={e => setLastReviewDate(e.target.value)} disabled={isViewOnly} className="w-full bg-[#f8f5f0] border border-slate-200 rounded-2xl p-4 text-emerald-950 focus:ring-2 focus:ring-emerald-800 outline-none font-bold shadow-inner" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-black block mb-2">To (Today)</label>
                  <input type="date" value={todayDate} onChange={e => setTodayDate(e.target.value)} disabled={isViewOnly} className="w-full bg-[#f8f5f0] border border-slate-200 rounded-2xl p-4 text-emerald-950 focus:ring-2 focus:ring-emerald-800 outline-none font-bold shadow-inner" />
                </div>
              </div>
            </section>
          </div>

          <section className="space-y-8">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-white flex items-center justify-center font-black text-xs shadow-lg">03</div>
                <h3 className="font-black text-emerald-950 uppercase text-[12px] tracking-[0.4em]">Activity & Milestone Log</h3>
              </div>
              {!isViewOnly && isEmployee && (
                <button onClick={addTask} className="bg-emerald-900 text-white px-10 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-emerald-800">+ Record Activity</button>
              )}
            </div>
            
            <div className="overflow-x-auto bg-white rounded-[3.5rem] p-10 shadow-2xl border border-emerald-900/5">
              <table className="w-full text-left text-[13px] min-w-[1200px] border-separate border-spacing-y-4">
                <thead className="bg-emerald-50/50">
                  <tr>
                    <th className="p-8 rounded-l-2xl font-black text-emerald-900 uppercase tracking-widest w-20">ID</th>
                    <th className="p-8 font-black text-emerald-900 uppercase tracking-widest">Responsibility / Task</th>
                    <th className="p-8 font-black text-emerald-900 uppercase tracking-widest text-center w-32">Weight %</th>
                    <th className="p-8 font-black text-emerald-900 uppercase tracking-widest">Expectation</th>
                    <th className="p-8 rounded-r-2xl font-black text-emerald-900 uppercase tracking-widest text-center w-48">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 && (
                    <tr><td colSpan={5} className="p-20 text-center text-slate-300 uppercase tracking-widest font-black text-[12px]">No activity nodes generated for this period.</td></tr>
                  )}
                  {tasks.map((t, idx) => (
                    <tr key={t.id} className="bg-[#fcfbf9] hover:bg-white transition-all group">
                      <td className="p-8 text-center text-slate-300 font-black text-2xl">{idx + 1}</td>
                      <td className="p-4">
                        <textarea value={t.description} onChange={e => updateTask(t.id, 'description', e.target.value)} disabled={isViewOnly} className="w-full bg-white border border-slate-100 rounded-2xl p-6 text-emerald-950 outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm min-h-[100px]" placeholder="Activity node description..." />
                      </td>
                      <td className="p-4">
                        <input type="number" value={t.weight} onChange={e => updateTask(t.id, 'weight', Number(e.target.value))} disabled={isViewOnly} className="w-full bg-white border border-slate-100 rounded-2xl p-6 text-center font-black text-emerald-900 outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm" />
                      </td>
                      <td className="p-4">
                        <textarea value={t.expectation} onChange={e => updateTask(t.id, 'expectation', e.target.value)} disabled={isViewOnly} className="w-full bg-white border border-slate-100 rounded-2xl p-6 text-emerald-950 outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm min-h-[100px]" placeholder="Specific expectation..." />
                      </td>
                      <td className="p-8">
                        <select 
                          value={t.status} 
                          onChange={e => updateTask(t.id, 'status', e.target.value)} 
                          disabled={isViewOnly}
                          className={`w-full bg-white border border-slate-200 rounded-2xl p-5 font-black text-[10px] uppercase text-center shadow-lg cursor-pointer transition-all ${
                            t.status === 'Completed' ? 'text-emerald-700 bg-emerald-50' : 
                            t.status === 'In Progress' ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'
                          }`}
                        >
                          <option className="bg-white">Completed</option>
                          <option className="bg-white">In Progress</option>
                          <option className="bg-white">Delayed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <footer className="p-12 md:p-16 bg-white border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-6">
          <button onClick={onClose} className="px-14 py-6 bg-slate-100 text-slate-500 font-black rounded-3xl hover:bg-slate-200 transition-all text-[11px] uppercase tracking-widest">Abort Review</button>
          {!isViewOnly && isEmployee && (
            <button onClick={() => handleAction(FormStatus.SUBMITTED)} className="px-24 py-6 btn-majestic rounded-3xl shadow-2xl transition-all text-[11px] uppercase tracking-[0.3em]">Log and Commit</button>
          )}
        </footer>
      </div>
    </div>
  );
};


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
    <div className="fixed inset-0 z-50 glass-modal flex items-center justify-center p-4">
      <div className="bg-slate-900/90 border border-white/10 rounded-[2.5rem] w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Monthly Review</h2>
            <p className="text-[10px] text-indigo-400 uppercase tracking-[0.4em] font-black mt-1">Continuous Progress Tracking</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-3 rounded-2xl transition-all border border-white/5">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <section className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-6">
              <h3 className="font-black text-slate-500 uppercase text-[10px] tracking-[0.3em] mb-4">Profile Identity</h3>
              <div className="grid grid-cols-2 gap-6">
                <div><label className="text-[10px] text-slate-500 uppercase font-black block mb-1">Employee</label><p className="font-bold text-slate-100">{currentUser?.name}</p></div>
                <div><label className="text-[10px] text-slate-500 uppercase font-black block mb-1">IPPIS</label><p className="font-bold text-slate-100">{currentUser?.ippisNumber}</p></div>
                <div><label className="text-[10px] text-slate-500 uppercase font-black block mb-1">Department</label><p className="font-bold text-slate-100">{currentUser?.department}</p></div>
              </div>
            </section>

            <section className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-6">
              <h3 className="font-black text-slate-500 uppercase text-[10px] tracking-[0.3em] mb-4">Review Metadata</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-black block mb-2">Last Review</label>
                  <input type="date" value={lastReviewDate} onChange={e => setLastReviewDate(e.target.value)} disabled={isViewOnly} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-black block mb-2">Today's Date</label>
                  <input type="date" value={todayDate} onChange={e => setTodayDate(e.target.value)} disabled={isViewOnly} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
            </section>
          </div>

          <section className="space-y-4">
             <h3 className="font-black text-slate-500 uppercase text-[10px] tracking-[0.3em]">Core Focus</h3>
             <textarea 
                value={responsibilities} 
                onChange={e => setResponsibilities(e.target.value)} 
                disabled={isViewOnly}
                rows={3}
                placeholder="Briefly summarize your primary focus area for this month..."
                className="w-full p-6 bg-white/5 border border-white/10 rounded-[2rem] focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-300 placeholder:text-slate-600"
             />
          </section>

          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-500 uppercase text-[10px] tracking-[0.3em]">Task Progression</h3>
              {!isViewOnly && (
                <button onClick={addTask} className="bg-white/5 border border-white/10 text-indigo-400 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Add Task Row</button>
              )}
            </div>
            <div className="overflow-x-auto border border-white/5 rounded-[2rem]">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest w-12">SN</th>
                    <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest">Description</th>
                    <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest">Expectation</th>
                    <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest w-40 text-center">Status</th>
                    <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest">Challenges</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tasks.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-6 font-black text-slate-700">{idx + 1}</td>
                      <td className="p-2">
                        <textarea value={t.description} onChange={e => updateTask(t.id, 'description', e.target.value)} disabled={isViewOnly} className="w-full bg-transparent border-none focus:ring-0 p-4 text-slate-200 resize-none min-h-[80px]" placeholder="Define task..." />
                      </td>
                      <td className="p-2">
                        <textarea value={t.expectation} onChange={e => updateTask(t.id, 'expectation', e.target.value)} disabled={isViewOnly} className="w-full bg-transparent border-none focus:ring-0 p-4 text-slate-200 resize-none min-h-[80px]" placeholder="Expected output..." />
                      </td>
                      <td className="px-6 py-6">
                        <select 
                          value={t.status} 
                          onChange={e => updateTask(t.id, 'status', e.target.value)} 
                          disabled={isViewOnly}
                          className={`w-full bg-white/5 border border-white/10 rounded-xl p-3 font-bold text-[10px] uppercase text-center transition-all ${
                            t.status === 'Completed' ? 'text-emerald-400' : 
                            t.status === 'In Progress' ? 'text-amber-400' : 'text-red-400'
                          }`}
                        >
                          <option className="bg-slate-900">Completed</option>
                          <option className="bg-slate-900">In Progress</option>
                          <option className="bg-slate-900">Delayed</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <textarea value={t.challenges} onChange={e => updateTask(t.id, 'challenges', e.target.value)} disabled={isViewOnly} className="w-full bg-transparent border-none focus:ring-0 p-4 text-slate-500 italic resize-none min-h-[80px]" placeholder="Blockers..." />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="p-10 bg-white/5 border-t border-white/5 flex justify-end gap-4">
          {!isViewOnly && (
            <>
              <button onClick={() => handleAction(FormStatus.DRAFT)} className="px-10 py-4 bg-white/5 border border-white/10 text-slate-400 font-black rounded-2xl hover:bg-white/10 transition-all text-[10px] uppercase tracking-[0.2em]">Save as Draft</button>
              <button onClick={() => handleAction(FormStatus.SUBMITTED)} className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 shadow-2xl shadow-indigo-600/20 transition-all text-[10px] uppercase tracking-[0.2em] shimmer-container">Commit Review</button>
            </>
          )}
          {isViewOnly && (
            <button onClick={onClose} className="px-12 py-4 bg-slate-100 text-slate-900 font-black rounded-2xl transition-all text-[10px] uppercase tracking-[0.2em]">Dismiss View</button>
          )}
        </div>
      </div>
    </div>
  );
};


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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-6 border-b flex justify-between items-center bg-indigo-700 text-white">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider">Monthly Performance Review</h2>
            <p className="text-[10px] opacity-70 uppercase tracking-widest font-bold">Progress Tracking & Monitoring</p>
          </div>
          <button onClick={onClose} className="hover:bg-indigo-800 p-2 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* Section A & B: Employee & Metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-slate-50 p-6 rounded-2xl border space-y-4">
              <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-[0.2em] mb-4">Section A: Employee Information</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div><label className="text-[10px] text-slate-500 uppercase font-bold">Surname</label><p className="font-semibold text-sm">{currentUser?.surname}</p></div>
                <div><label className="text-[10px] text-slate-500 uppercase font-bold">First Name</label><p className="font-semibold text-sm">{currentUser?.firstName}</p></div>
                <div><label className="text-[10px] text-slate-500 uppercase font-bold">IPPIS Number</label><p className="font-semibold text-sm">{currentUser?.ippisNumber}</p></div>
                <div><label className="text-[10px] text-slate-500 uppercase font-bold">Department</label><p className="font-semibold text-sm">{currentUser?.department}</p></div>
              </div>
            </section>

            <section className="bg-slate-50 p-6 rounded-2xl border space-y-4">
              <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-[0.2em] mb-4">Section B: Review Metadata</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Last Review Date</label>
                  <input type="date" value={lastReviewDate} onChange={e => setLastReviewDate(e.target.value)} disabled={isViewOnly} className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Today's Date</label>
                  <input type="date" value={todayDate} onChange={e => setTodayDate(e.target.value)} disabled={isViewOnly} className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Appraiser Information</label>
                  <div className="flex gap-4">
                    <input value={appraiserName} onChange={e => setAppraiserName(e.target.value)} disabled={isViewOnly} className="flex-1 p-2 text-sm border rounded-lg" placeholder="Appraiser Name" />
                    <input value={appraiserRank} onChange={e => setAppraiserRank(e.target.value)} disabled={isViewOnly} className="flex-1 p-2 text-sm border rounded-lg" placeholder="Appraiser Rank" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Section C: Responsibilities */}
          <section className="space-y-3">
             <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-[0.2em]">Section C: Current Responsibilities</h3>
             <textarea 
                value={responsibilities} 
                onChange={e => setResponsibilities(e.target.value)} 
                disabled={isViewOnly}
                rows={3}
                placeholder="Briefly summarize your primary focus area for this month..."
                className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-slate-50/30"
             />
          </section>

          {/* Section D: Task Review */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-[0.2em]">Section D: Monthly Task Review</h3>
              {!isViewOnly && (
                <button onClick={addTask} className="text-indigo-600 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 transition-all">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Task
                </button>
              )}
            </div>
            <div className="overflow-x-auto border rounded-2xl shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-bold border-b text-slate-500 uppercase tracking-tighter w-12">S/N</th>
                    <th className="px-4 py-3 font-bold border-b text-slate-500 uppercase tracking-tighter min-w-[200px]">Description</th>
                    <th className="px-4 py-3 font-bold border-b text-slate-500 uppercase tracking-tighter min-w-[150px]">Expectation</th>
                    <th className="px-4 py-3 font-bold border-b text-slate-500 uppercase tracking-tighter w-32">Dates</th>
                    <th className="px-4 py-3 font-bold border-b text-slate-500 uppercase tracking-tighter w-36 text-center">Output Status</th>
                    <th className="px-4 py-3 font-bold border-b text-slate-500 uppercase tracking-tighter min-w-[200px]">Issues / Challenges</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-slate-400 italic">No tasks added yet. Click 'Add Task' to begin tracking progress.</td>
                    </tr>
                  )}
                  {tasks.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-300">{idx + 1}</td>
                      <td className="p-2">
                        <textarea value={t.description} onChange={e => updateTask(t.id, 'description', e.target.value)} disabled={isViewOnly} className="w-full p-2 border rounded-lg bg-transparent focus:bg-white resize-none" rows={2} placeholder="What was the task?" />
                      </td>
                      <td className="p-2">
                        <textarea value={t.expectation} onChange={e => updateTask(t.id, 'expectation', e.target.value)} disabled={isViewOnly} className="w-full p-2 border rounded-lg bg-transparent focus:bg-white resize-none" rows={2} placeholder="Performance target..." />
                      </td>
                      <td className="p-2">
                        <div className="space-y-1">
                          <input type="date" value={t.startDate} onChange={e => updateTask(t.id, 'startDate', e.target.value)} disabled={isViewOnly} className="w-full p-1 border rounded text-[10px]" />
                          <input type="date" value={t.dueDate} onChange={e => updateTask(t.id, 'dueDate', e.target.value)} disabled={isViewOnly} className="w-full p-1 border rounded text-[10px]" />
                        </div>
                      </td>
                      <td className="p-4">
                        <select 
                          value={t.status} 
                          onChange={e => updateTask(t.id, 'status', e.target.value)} 
                          disabled={isViewOnly}
                          className={`w-full p-2 rounded-lg font-bold border-none text-[10px] text-center shadow-sm ${
                            t.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                            t.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          <option>Completed</option>
                          <option>In Progress</option>
                          <option>Delayed</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <textarea value={t.challenges} onChange={e => updateTask(t.id, 'challenges', e.target.value)} disabled={isViewOnly} className="w-full p-2 border rounded-lg bg-transparent focus:bg-white resize-none" rows={2} placeholder="Any blockers encountered?" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="p-6 bg-slate-50 border-t flex justify-end gap-3 sticky bottom-0 z-10">
          {!isViewOnly && (
            <>
              <button onClick={() => handleAction(FormStatus.DRAFT)} className="px-6 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-all text-sm uppercase tracking-widest">Save Draft</button>
              <button onClick={() => handleAction(FormStatus.SUBMITTED)} className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all text-sm uppercase tracking-widest">Submit Monthly Review</button>
            </>
          )}
          {isViewOnly && (
            <button onClick={onClose} className="px-8 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all text-sm uppercase tracking-widest">Close Review</button>
          )}
        </div>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { useAppContext } from '../store/AppContext';
import { AppraisalStatus, TaskEntry, UserRole, Appraisal } from '../types';
import { MOCK_USERS, DEPARTMENTS } from '../constants';

interface Props {
  onClose: () => void;
  initialData?: Appraisal;
}

export const AppraisalForm: React.FC<Props> = ({ onClose, initialData }) => {
  const { currentUser, addAppraisal, updateAppraisal } = useAppContext();
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear());
  const [department, setDepartment] = useState(initialData?.department || currentUser?.department || '');
  const [pmId, setPmId] = useState(initialData?.pmId || '');
  const [tasks, setTasks] = useState<TaskEntry[]>(initialData?.tasks || []);
  const [achievements, setAchievements] = useState(initialData?.achievements || '');
  const [challenges, setChallenges] = useState(initialData?.challenges || '');
  const [selfRating, setSelfRating] = useState(initialData?.selfRating || 3);

  const projectManagers = MOCK_USERS.filter(u => u.role === UserRole.PM);

  const addTask = () => {
    const newTask: TaskEntry = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      description: '',
      duration: ''
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, field: keyof TaskEntry, value: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleSubmit = (status: AppraisalStatus) => {
    const pm = projectManagers.find(p => p.id === pmId);
    
    if (initialData) {
      updateAppraisal(initialData.id, {
        year, department, pmId, pmName: pm?.name || '', tasks, achievements, challenges, selfRating, status, version: initialData.version + 1
      });
    } else {
      const newAppraisal: Appraisal = {
        id: Math.random().toString(36).substr(2, 9),
        employeeId: currentUser?.id || '',
        employeeName: currentUser?.name || '',
        year,
        department,
        pmId,
        pmName: pm?.name || '',
        tasks,
        achievements,
        challenges,
        selfRating,
        status,
        pmComments: [],
        ctoComments: [],
        updatedAt: Date.now(),
        version: 1
      };
      addAppraisal(newAppraisal);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? `Edit Appraisal - ${initialData.year}` : 'New Performance Appraisal'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Appraisal Year</label>
              <input 
                type="number" 
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select 
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project Manager</label>
              <select 
                value={pmId}
                onChange={e => setPmId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select Manager</option>
                {projectManagers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Tasks Performed</h3>
              <button 
                onClick={addTask}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Task
              </button>
            </div>
            
            <div className="space-y-3">
              {tasks.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-400">No tasks added yet.</p>
                </div>
              )}
              {tasks.map((task) => (
                <div key={task.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative group">
                  <button 
                    onClick={() => removeTask(task.id)}
                    className="absolute -top-2 -right-2 bg-white text-red-500 p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity border border-red-100"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                      <input 
                        placeholder="Task Name"
                        value={task.name}
                        onChange={e => updateTask(task.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input 
                        placeholder="Short Description"
                        value={task.description}
                        onChange={e => updateTask(task.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <input 
                        placeholder="Duration (e.g. 3m)"
                        value={task.duration}
                        onChange={e => updateTask(task.id, 'duration', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Narrative sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Key Achievements</label>
              <textarea 
                rows={4}
                value={achievements}
                onChange={e => setAchievements(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="List your main wins for the year..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Challenges Faced</label>
              <textarea 
                rows={4}
                value={challenges}
                onChange={e => setChallenges(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="What obstacles did you overcome?"
              />
            </div>
          </div>

          {/* Rating */}
          <div className="flex flex-col items-center py-6 border-y border-slate-100">
            <label className="block text-sm font-semibold text-slate-800 mb-4 uppercase tracking-wider">Self Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star}
                  onClick={() => setSelfRating(star)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    selfRating >= star ? 'bg-amber-100 text-amber-600 shadow-sm scale-110' : 'bg-slate-100 text-slate-400 grayscale'
                  }`}
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-500 font-medium">
              {['Poor', 'Fair', 'Good', 'Very Good', 'Exceptional'][selfRating - 1]} Performance
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-end sticky bottom-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => handleSubmit(AppraisalStatus.DRAFT)}
            className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors font-semibold"
          >
            Save as Draft
          </button>
          <button 
            onClick={() => handleSubmit(AppraisalStatus.SUBMITTED)}
            disabled={!pmId || tasks.length === 0}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-md shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
};

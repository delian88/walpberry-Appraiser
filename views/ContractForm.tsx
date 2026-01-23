
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../store/AppContext';
import { PerformanceContract, FormStatus, KRAEntry, UserRole, CriteriaValues, CompetencyEntry, User } from '../types';
import { DEPT_SUPERVISOR_MAP } from '../constants';

export const ContractForm: React.FC<{ onClose: () => void, initialData?: PerformanceContract }> = ({ onClose, initialData }) => {
  const { currentUser, users, upsertContract } = useAppContext();

  const supervisors = useMemo(() => users.filter(u => u.role === UserRole.PM || u.role === UserRole.CTO), [users]);
  const ctos = useMemo(() => users.filter(u => u.role === UserRole.CTO), [users]);

  // Expanded initial competencies
  const defaultCompetencies: CompetencyEntry[] = [
    { id: 'c1', category: 'Generic', name: 'Leadership Skills', description: 'Ability to guide, inspire and direct team members towards goals.', score: 0 },
    { id: 'c2', category: 'Generic', name: 'Communication', description: 'Effectiveness in verbal and written information exchange.', score: 0 },
    { id: 'c3', category: 'Generic', name: 'Professionalism', description: 'Adherence to corporate ethics, punctuality and conduct.', score: 0 },
    { id: 'c4', category: 'Generic', name: 'Technical Proficiency', description: 'Depth of knowledge and skill in assigned technical domain.', score: 0 },
    
    { id: 'f1', category: 'Functional', name: 'Strategic Thinking', description: 'Formulating long-term objectives and aligning resources to achieve them.', score: 0 },
    { id: 'f2', category: 'Functional', name: 'Drive for Result', description: 'Persistent focus on high-quality output and meeting milestones.', score: 0 },
    { id: 'f3', category: 'Functional', name: 'Transparency and Accountability', description: 'Taking responsibility for actions and being open about processes.', score: 0 },
    
    { id: 'e1', category: 'Ethics', name: 'Integrity', description: 'Consistency in actions, values, methods, and principles.', score: 0 },
    { id: 'e2', category: 'Ethics', name: 'Citizen Focus', description: 'Prioritizing the needs and service of the public/users.', score: 0 },
    { id: 'e3', category: 'Ethics', name: 'Courage', description: 'Standing by principles despite pressure or difficulty.', score: 0 },
    
    { id: 'o1', category: 'Operations', name: 'Punctuality/Attendance', description: 'Consistent and timely presence at the workplace.', score: 0 },
    { id: 'o2', category: 'Operations', name: 'Work Turn Around Time', description: 'Efficiency in completing tasks within expected timeframes.', score: 0 },
    { id: 'o3', category: 'Operations', name: 'Innovation on the Job', description: 'Applying creative solutions to improve workplace efficiency.', score: 0 }
  ];

  // Initialization logic
  const [contract, setContract] = useState<PerformanceContract>(initialData || {
    id: Math.random().toString(36).substr(2, 9),
    employeeId: currentUser?.id || '',
    periodFrom: '',
    periodTo: '',
    employeeFirstName: currentUser?.firstName || '',
    employeeSurname: currentUser?.surname || '',
    employeeOtherNames: currentUser?.otherNames || '',
    employeeIppis: currentUser?.ippisNumber || '',
    employeeEmail: currentUser?.email || '',
    employeePhone: currentUser?.phone || '',
    employeeDesignation: currentUser?.designation || '',
    employeeDepartment: currentUser?.department || '',
    
    supervisorFirstName: '',
    supervisorSurname: '',
    supervisorIppis: '',
    supervisorEmail: '',
    supervisorDesignation: '',
    supervisorDepartment: '',
    
    officerFirstName: '',
    officerSurname: '',
    officerIppis: '',
    officerDesignation: '',
    
    kraEntries: [],
    competencyEntries: defaultCompetencies,
    employeeSigned: false,
    supervisorSigned: false,
    officerSigned: false,
    status: FormStatus.DRAFT,
    isActive: true,
    updatedAt: Date.now()
  });

  // Auto-assign supervisor based on department if not already set
  useEffect(() => {
    if (!initialData && contract.employeeDepartment) {
      const supId = DEPT_SUPERVISOR_MAP[contract.employeeDepartment];
      if (supId) {
        handleSupervisorChange(supId);
      }
      if (ctos.length > 0) {
        handleOfficerChange(ctos[0].id);
      }
    }
  }, []);

  const handleSupervisorChange = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      setContract(prev => ({
        ...prev,
        supervisorId: user.id,
        supervisorFirstName: user.firstName,
        supervisorSurname: user.surname,
        supervisorOtherNames: user.otherNames,
        supervisorIppis: user.ippisNumber,
        supervisorEmail: user.email,
        supervisorDesignation: user.designation,
        supervisorDepartment: user.department
      }));
    }
  };

  const handleOfficerChange = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      setContract(prev => ({
        ...prev,
        officerId: user.id,
        officerFirstName: user.firstName,
        officerSurname: user.surname,
        officerOtherNames: user.otherNames,
        officerIppis: user.ippisNumber,
        officerDesignation: user.designation
      }));
    }
  };

  const isEmployee = currentUser?.role === UserRole.EMPLOYEE;
  const isDraft = contract.status === FormStatus.DRAFT;
  const canEditMain = isEmployee && isDraft;

  const totalWeight = useMemo(() => 
    (contract.kraEntries || []).reduce((sum, k) => sum + (Number(k.weight) || 0), 0),
    [contract.kraEntries]
  );

  const updateKra = (id: string, field: keyof KRAEntry, value: any) => {
    if (!canEditMain) return;
    setContract(prev => ({
      ...prev,
      // Fixed: Casting to avoid unknown error
      kraEntries: (prev.kraEntries as KRAEntry[] || []).map(k => k.id === id ? { ...k, [field]: value } : k)
    }));
  };

  const updateCriteria = (id: string, key: keyof CriteriaValues, value: string) => {
    if (!canEditMain) return;
    setContract(prev => ({
      ...prev,
      // Fixed: Casting to avoid unknown error
      kraEntries: (prev.kraEntries as KRAEntry[] || []).map(k => 
        k.id === id ? { ...k, criteria: { ...k.criteria, [key]: value } } : k
      )
    }));
  };

  const updateCompetency = (id: string, score: number) => {
    if (!canEditMain) return;
    setContract(prev => ({
      ...prev,
      competencyEntries: prev.competencyEntries.map(c => c.id === id ? { ...c, score } : c)
    }));
  };

  const addKra = () => {
    if (!canEditMain) return;
    const newKra: KRAEntry = {
      id: Math.random().toString(36).substr(2, 9),
      area: '',
      objectives: '',
      weight: 0,
      objWeight: 0,
      gradedWeight: 0,
      kpis: '',
      target: 0,
      unit: 'Percentage',
      criteria: { o: '', e: '', vg: '', g: '', f: '', p: '' }
    };
    // Fixed: Casting to avoid unknown error
    setContract(prev => ({ ...prev, kraEntries: [...(prev.kraEntries as KRAEntry[] || []), newKra] }));
  };

  const handleSubmit = (nextStatus: FormStatus) => {
    if (nextStatus === FormStatus.SUBMITTED) {
      if (!contract.periodFrom || !contract.periodTo) { alert("Please define the appraisal start and end dates."); return; }
      if (!contract.supervisorId) { alert("Please select a Supervisor."); return; }
      if (contract.kraEntries.length === 0) { alert("At least one Employee Task (KRA) is required."); return; }
      if (totalWeight !== 100) { alert(`Total weight sum for Employee Tasks must be 100%. Current: ${totalWeight}%`); return; }
      if (!contract.employeeSigned) { alert("Please check the Employee Declaration before submitting."); return; }
    }
    const now = Date.now();
    const payload: PerformanceContract = { ...contract, status: nextStatus, updatedAt: now, employeeSignedDate: contract.employeeSigned && !contract.employeeSignedDate ? now : contract.employeeSignedDate };
    upsertContract(payload);
    onClose();
  };

  // Group competencies for rendering
  const competencyGroups = useMemo(() => {
    const groups: Record<string, CompetencyEntry[]> = {
      'Generic': contract.competencyEntries.filter(c => c.category === 'Generic'),
      'Functional': contract.competencyEntries.filter(c => c.category === 'Functional'),
      'Ethics': contract.competencyEntries.filter(c => c.category === 'Ethics'),
      'Operations': contract.competencyEntries.filter(c => c.category === 'Operations'),
    };
    return groups;
  }, [contract.competencyEntries]);

  return (
    <div className="fixed inset-0 z-50 glass-modal flex items-center justify-center p-2 md:p-4">
      <div className="bg-slate-900 border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] w-[96vw] md:w-full max-w-[95vw] max-h-[96vh] flex flex-col shadow-2xl overflow-hidden reveal">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Performance Contract Form</h2>
            <p className="text-[9px] text-indigo-400 uppercase tracking-[0.3em] font-black mt-1">Lifecycle: {contract.status}</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 md:p-3 rounded-xl transition-all border border-white/5">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-16">
          
          {/* SECTION A & B: Periods & Employee */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3"><span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono">A</span> Appraisal Period</h3>
                <div className="grid grid-cols-2 gap-6 bg-white/5 p-6 rounded-3xl border border-white/5">
                    <div><label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Start Date</label><input type="date" value={contract.periodFrom || ''} onChange={e => setContract({...contract, periodFrom: e.target.value})} disabled={!canEditMain} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                    <div><label className="block text-[10px] font-black text-slate-500 uppercase mb-2">End Date</label><input type="date" value={contract.periodTo || ''} onChange={e => setContract({...contract, periodTo: e.target.value})} disabled={!canEditMain} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                </div>
            </div>
            <div className="space-y-6">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3"><span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono">B</span> Employee Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                    <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-0.5">Name</label><p className="font-bold text-white text-sm truncate uppercase">{contract.employeeFirstName} {contract.employeeSurname}</p></div>
                    <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-0.5">IPPIS</label><p className="font-bold text-white text-sm">{contract.employeeIppis}</p></div>
                    <div className="col-span-2"><label className="text-[9px] text-slate-500 font-bold uppercase block mb-0.5">Department</label><p className="font-bold text-indigo-400 text-sm uppercase">{contract.employeeDepartment}</p></div>
                </div>
            </div>
          </section>

          {/* SECTION C & D: Supervisor & Officer */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3"><span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono">C</span> Supervisor Information</h3>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                    <select value={contract.supervisorId || ''} onChange={e => handleSupervisorChange(e.target.value)} disabled={!canEditMain} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">-- Select Supervisor --</option>
                      {supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    {contract.supervisorId && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div><label className="text-[9px] text-slate-500 font-bold uppercase block">IPPIS</label><p className="font-bold text-white text-xs">{contract.supervisorIppis}</p></div>
                            <div><label className="text-[9px] text-slate-500 font-bold uppercase block">Designation</label><p className="font-bold text-white text-xs truncate uppercase">{contract.supervisorDesignation}</p></div>
                        </div>
                    )}
                </div>
            </div>
            <div className="space-y-6">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3"><span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono">D</span> Counter-Signing Officer</h3>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                    <select value={contract.officerId || ''} onChange={e => handleOfficerChange(e.target.value)} disabled={!canEditMain} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">-- Select Officer --</option>
                      {ctos.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                    {contract.officerId && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div><label className="text-[9px] text-slate-500 font-bold uppercase block">IPPIS</label><p className="font-bold text-white text-xs">{contract.officerIppis}</p></div>
                            <div><label className="text-[9px] text-slate-500 font-bold uppercase block">Designation</label><p className="font-bold text-white text-xs truncate uppercase">{contract.officerDesignation}</p></div>
                        </div>
                    )}
                </div>
            </div>
          </section>

          {/* SECTION E: EMPLOYEE TASK */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3"><span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono">E</span> Employee Task Matrix</h3>
              {canEditMain && <button onClick={addKra} className="bg-indigo-600/20 text-indigo-400 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 hover:bg-indigo-600/30 transition-all">+ Add Task</button>}
            </div>
            <div className="overflow-x-auto glass-card rounded-3xl">
              <table className="w-full text-left text-[10px] min-w-[1400px]">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th rowSpan={2} className="px-4 py-4 font-black text-center w-10">S/N</th>
                    <th rowSpan={2} className="px-4 py-4 font-black w-56">Key Result Areas</th>
                    <th rowSpan={2} className="px-2 py-4 font-black text-center w-16">Weight</th>
                    <th rowSpan={2} className="px-4 py-4 font-black w-64">Objectives</th>
                    <th colSpan={6} className="px-4 py-2 font-black text-center border-b border-white/10">Criteria Values</th>
                    <th rowSpan={2} className="px-2 py-4 font-black text-center w-20">Graded Weight</th>
                    <th rowSpan={2} className="px-4 py-4 font-black w-64">KPIs</th>
                    <th rowSpan={2} className="px-4 py-4 font-black text-center w-24">Unit</th>
                  </tr>
                  <tr className="bg-indigo-500/50">
                    {['O','E','VG','G','F','P'].map(l => <th key={l} className="px-1 py-2 font-black text-center w-12">{l}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {/* Fixed typing for map call to avoid unknown error on line 349 (approx) */}
                  {(contract.kraEntries as KRAEntry[] || []).map((k, idx) => (
                    <tr key={k.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-4 py-3 text-center text-slate-500 font-black">{idx + 1}</td>
                      <td className="p-2"><textarea value={k.area} onChange={e => updateKra(k.id, 'area', e.target.value)} disabled={!canEditMain} className="w-full bg-transparent p-2 text-slate-200 focus:ring-1 focus:ring-indigo-500 rounded outline-none h-20 resize-none text-[10px]" /></td>
                      <td className="p-2"><input type="number" value={k.weight} onChange={e => updateKra(k.id, 'weight', Number(e.target.value))} disabled={!canEditMain} className="w-full bg-transparent p-2 text-center font-black text-white outline-none" /></td>
                      <td className="p-2"><textarea value={k.objectives} onChange={e => updateKra(k.id, 'objectives', e.target.value)} disabled={!canEditMain} className="w-full bg-transparent p-2 text-slate-200 focus:ring-1 focus:ring-indigo-500 rounded outline-none h-20 resize-none text-[10px]" /></td>
                      {['o','e','vg','g','f','p'].map(key => (
                        <td key={key} className="p-0 border-r border-white/5"><input value={(k.criteria as any)[key]} onChange={e => updateCriteria(k.id, key as any, e.target.value)} disabled={!canEditMain} className="w-full bg-transparent p-2 text-center text-slate-300 outline-none" placeholder={key.toUpperCase()} /></td>
                      ))}
                      <td className="p-2 text-center font-black text-emerald-400">{k.gradedWeight}%</td>
                      <td className="p-2"><textarea value={k.kpis} onChange={e => updateKra(k.id, 'kpis', e.target.value)} disabled={!canEditMain} className="w-full bg-transparent p-2 text-slate-200 focus:ring-1 focus:ring-indigo-500 rounded outline-none h-20 resize-none text-[10px]" /></td>
                      <td className="p-2 text-center"><span className="text-[9px] font-black uppercase text-indigo-400">{k.unit}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION F: COMPETENCIES */}
          <section className="space-y-8">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3"><span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono">F</span> Competency Assessment</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Legend Panel */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
                        <h4 className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-6">Rating Scale</h4>
                        <div className="space-y-4">
                            {[
                                { s: 5, t: 'Exceptional', c: 'bg-emerald-500 shadow-emerald-500/20' },
                                { s: 4, t: 'Commendable', c: 'bg-indigo-500 shadow-indigo-500/20' },
                                { s: 3, t: 'Satisfactory', c: 'bg-blue-500 shadow-blue-500/20' },
                                { s: 2, t: 'Needs Impr.', c: 'bg-amber-500 shadow-amber-500/20' },
                                { s: 1, t: 'Unsatisfactory', c: 'bg-red-500 shadow-red-500/20' },
                            ].map(l => (
                                <div key={l.s} className="flex items-center gap-4">
                                    <span className={`w-8 h-8 rounded-xl ${l.c} text-white flex items-center justify-center font-black text-[11px] shadow-lg`}>{l.s}</span>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{l.t}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Categories Panels */}
                <div className="lg:col-span-3 space-y-10">
                    {Object.entries(competencyGroups).map(([groupName, items], gIdx) => (
                        <div key={groupName} className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">{gIdx + 1}. {groupName === 'Operations' ? 'Section 6: ' + groupName : groupName} Competencies</span>
                                <div className="h-px bg-white/10 flex-1"></div>
                            </div>
                            <div className="overflow-hidden border border-white/10 rounded-3xl bg-white/[0.02]">
                                <table className="w-full text-left text-[10px]">
                                    <thead className="bg-white/[0.03]">
                                        <tr>
                                            <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest">Description</th>
                                            <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-center w-32">Rating (1-5)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {(items as CompetencyEntry[] || []).map(c => (
                                            <tr key={c.id} className="hover:bg-white/[0.03] transition-colors">
                                                <td className="px-6 py-5">
                                                    <p className="font-black text-slate-200 mb-1">{c.name}</p>
                                                    <p className="text-[9px] text-slate-500 leading-relaxed italic">{c.description}</p>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <select 
                                                        value={c.score} 
                                                        onChange={e => updateCompetency(c.id, Number(e.target.value))}
                                                        disabled={!canEditMain}
                                                        className="bg-slate-900 border border-white/10 rounded-xl p-3 text-center text-indigo-400 font-black outline-none w-20 cursor-pointer hover:border-indigo-500/50"
                                                    >
                                                        <option value={0}>-</option>
                                                        <option value={5}>5</option>
                                                        <option value={4}>4</option>
                                                        <option value={3}>3</option>
                                                        <option value={2}>2</option>
                                                        <option value={1}>1</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </section>

          {/* SECTION G: EMPLOYEE DECLARATION */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3"><span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono">G</span> Declaration</h3>
            <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/5 space-y-8 flex flex-col items-center text-center">
              <div className="max-w-2xl space-y-6">
                <div className="inline-flex items-center gap-4 bg-indigo-500/10 px-8 py-3 rounded-full border border-indigo-500/20">
                    <input type="checkbox" checked={contract.employeeSigned} onChange={e => setContract({...contract, employeeSigned: e.target.checked})} disabled={!isEmployee || !isDraft} className="w-6 h-6 rounded-lg bg-slate-900 border-white/20 text-indigo-600 focus:ring-0 focus:ring-offset-0" />
                    <span className="text-xs text-indigo-400 font-black uppercase tracking-widest">I Agree to the Defined Terms</span>
                </div>
                <p className="text-sm text-slate-400 leading-[1.8] italic">
                  I, <span className="text-white font-black uppercase tracking-wider">{contract.employeeFirstName} {contract.employeeSurname}</span>, hereby declare that I have discussed and agreed on the performance tasks, level of assessment and targets defined in this contract for the specified period.
                </p>
                {contract.employeeSignedDate && <p className="text-[10px] text-emerald-400 uppercase font-black tracking-[0.3em]">Authenticated Trace: {new Date(contract.employeeSignedDate).toLocaleString()}</p>}
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-8 md:p-12 bg-white/5 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-6">
          {isEmployee && isDraft && (
            <>
              <button onClick={() => handleSubmit(FormStatus.DRAFT)} className="px-10 py-5 bg-white/5 border border-white/10 text-slate-400 font-black rounded-2xl hover:bg-white/10 transition-all text-[10px] uppercase tracking-[0.3em]">Save Progress</button>
              <button onClick={() => handleSubmit(FormStatus.SUBMITTED)} disabled={!contract.employeeSigned} className={`px-14 py-5 font-black rounded-2xl shadow-2xl transition-all text-[10px] uppercase tracking-[0.3em] shimmer-container ${contract.employeeSigned ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/30' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}>Confirm & Submit Contract</button>
            </>
          )}
          {!isDraft && <button onClick={onClose} className="px-12 py-5 bg-white/5 border border-white/10 text-slate-400 font-black rounded-2xl hover:bg-white/10 transition-all text-[10px] uppercase tracking-[0.3em]">Exit View</button>}
        </div>
      </div>
    </div>
  );
};

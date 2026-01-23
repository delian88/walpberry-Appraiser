
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../store/AppContext';
import { PerformanceContract, FormStatus, KRAEntry, UserRole, CriteriaValues, CompetencyEntry, User } from '../types';
import { DEPT_SUPERVISOR_MAP } from '../constants';

export const ContractForm: React.FC<{ onClose: () => void, initialData?: PerformanceContract }> = ({ onClose, initialData }) => {
  const { currentUser, users, upsertContract } = useAppContext();

  const supervisors = useMemo(() => users.filter(u => u.role === UserRole.PM || u.role === UserRole.CTO), [users]);
  const ctos = useMemo(() => users.filter(u => u.role === UserRole.CTO), [users]);

  // Comprehensive competency list based on requirements
  const defaultCompetencies: CompetencyEntry[] = [
    { id: 'c1', category: 'Generic', name: 'Leadership Skills', description: 'Ability to guide, inspire and direct team members towards goals.', score: 0, expectation: '' },
    { id: 'c2', category: 'Generic', name: 'Communication', description: 'Effectiveness in verbal and written information exchange.', score: 0, expectation: '' },
    { id: 'c3', category: 'Generic', name: 'Professionalism', description: 'Adherence to corporate ethics, punctuality and conduct.', score: 0, expectation: '' },
    
    { id: 'f1', category: 'Functional', name: 'Strategic Thinking', description: 'Formulating long-term objectives and aligning resources to achieve them.', score: 0, expectation: '' },
    { id: 'f2', category: 'Functional', name: 'Drive for Result', description: 'Persistent focus on high-quality output and meeting milestones.', score: 0, expectation: '' },
    { id: 'f3', category: 'Functional', name: 'Transparency and Accountability', description: 'Taking responsibility for actions and being open about processes.', score: 0, expectation: '' },
    
    { id: 'e1', category: 'Ethics', name: 'Integrity', description: 'Consistency in actions, values, methods, and principles.', score: 0, expectation: '' },
    { id: 'e2', category: 'Ethics', name: 'Citizen Focus', description: 'Prioritizing the needs and service of the public/users.', score: 0, expectation: '' },
    { id: 'e3', category: 'Ethics', name: 'Courage', description: 'Standing by principles despite pressure or difficulty.', score: 0, expectation: '' },
    
    { id: 'o1', category: 'Operations', name: 'Punctuality/Attendance', description: 'Consistent and timely presence at the workplace.', score: 0, expectation: '' },
    { id: 'o2', category: 'Operations', name: 'Work Turn Around Time', description: 'Efficiency in completing tasks within expected timeframes.', score: 0, expectation: '' },
    { id: 'o3', category: 'Operations', name: 'Innovation on the Job', description: 'Applying creative solutions to improve workplace efficiency.', score: 0, expectation: '' }
  ];

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
    
    employeeComment: '',
    supervisorComment: '',
    officerComment: '',

    employeeSigned: false,
    supervisorSigned: false,
    officerSigned: false,
    status: FormStatus.DRAFT,
    isActive: true,
    updatedAt: Date.now()
  });

  useEffect(() => {
    if (!initialData && contract.employeeDepartment) {
      const supId = DEPT_SUPERVISOR_MAP[contract.employeeDepartment];
      if (supId) handleSupervisorChange(supId);
      if (ctos.length > 0) handleOfficerChange(ctos[0].id);
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
  const isPM = currentUser?.role === UserRole.PM;
  const isCTO = currentUser?.role === UserRole.CTO;

  const isDraft = contract.status === FormStatus.DRAFT;
  const isSubmitted = contract.status === FormStatus.SUBMITTED;
  const isPMApproved = contract.status === FormStatus.APPROVED_BY_PM;

  const canEditEmployee = isEmployee && isDraft;
  const canEditSupervisor = isPM && isSubmitted;
  const canEditOfficer = isCTO && isPMApproved;

  const totalWeight = useMemo(() => 
    (contract.kraEntries || []).reduce((sum, k) => sum + (Number(k.weight) || 0), 0),
    [contract.kraEntries]
  );

  const updateKra = (id: string, field: keyof KRAEntry, value: any) => {
    if (!canEditEmployee) return;
    setContract(prev => ({
      ...prev,
      kraEntries: (prev.kraEntries as KRAEntry[]).map(k => k.id === id ? { ...k, [field]: value } : k)
    }));
  };

  const updateCriteria = (id: string, key: keyof CriteriaValues, value: string) => {
    if (!canEditEmployee) return;
    setContract(prev => ({
      ...prev,
      kraEntries: (prev.kraEntries as KRAEntry[]).map(k => 
        k.id === id ? { ...k, criteria: { ...k.criteria, [key]: value } } : k
      )
    }));
  };

  const updateCompetency = (id: string, field: keyof CompetencyEntry, value: any) => {
    if (!canEditEmployee) return;
    setContract(prev => ({
      ...prev,
      competencyEntries: prev.competencyEntries.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const addKra = () => {
    if (!canEditEmployee) return;
    const newKra: KRAEntry = {
      id: Math.random().toString(36).substr(2, 9),
      area: '',
      objectives: '',
      expectation: '',
      weight: 0,
      objWeight: 0,
      gradedWeight: 0,
      kpis: '',
      target: 0,
      unit: 'Percentage',
      criteria: { o: '', e: '', vg: '', g: '', f: '', p: '' }
    };
    setContract(prev => ({ ...prev, kraEntries: [...(prev.kraEntries as KRAEntry[]), newKra] }));
  };

  const handleSubmit = (nextStatus: FormStatus) => {
    const now = Date.now();
    let finalContract = { ...contract, updatedAt: now };

    if (nextStatus === FormStatus.SUBMITTED) {
      if (!contract.periodFrom || !contract.periodTo) { alert("Please define the appraisal start and end dates."); return; }
      if (!contract.supervisorId) { alert("Please select a Supervisor."); return; }
      if (contract.kraEntries.length === 0) { alert("At least one Employee Task (KRA) is required."); return; }
      if (totalWeight !== 100) { alert(`Total weight sum for Employee Tasks must be 100%. Current: ${totalWeight}%`); return; }
      if (!contract.employeeSigned) { alert("Please sign the Appraisee section before submitting."); return; }
      finalContract.employeeSignedDate = now;
    } else if (nextStatus === FormStatus.APPROVED_BY_PM) {
      if (!contract.supervisorSigned) { alert("Please sign the Supervisor section before approving."); return; }
      finalContract.supervisorSignedDate = now;
    } else if (nextStatus === FormStatus.APPROVED) {
      if (!contract.officerSigned) { alert("Please sign the Officer section before final approval."); return; }
      finalContract.officerSignedDate = now;
    }

    finalContract.status = nextStatus;
    upsertContract(finalContract);
    onClose();
  };

  const competencyGroups: Record<string, CompetencyEntry[]> = useMemo(() => ({
    'Generic': contract.competencyEntries.filter(c => c.category === 'Generic'),
    'Functional': contract.competencyEntries.filter(c => c.category === 'Functional'),
    'Ethics': contract.competencyEntries.filter(c => c.category === 'Ethics'),
    'Operations': contract.competencyEntries.filter(c => c.category === 'Operations'),
  }), [contract.competencyEntries]);

  const categoryLabels: Record<string, string> = {
    'Generic': 'Generic Competencies',
    'Functional': 'Functional Competencies',
    'Ethics': 'Ethics and Value',
    'Operations': 'Operations and Processes'
  };

  return (
    <div className="fixed inset-0 z-50 glass-modal flex items-center justify-center p-2 md:p-4">
      <div className="bg-slate-900 border border-white/10 rounded-[2rem] w-full max-w-[95vw] max-h-[96vh] flex flex-col shadow-2xl overflow-hidden reveal">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight text-transition">Performance Contract Form</h2>
            <p className="text-[9px] text-emerald-400 uppercase tracking-[0.3em] font-black mt-1">Lifecycle: {contract.status}</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-xl transition-all border border-white/5">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-16">
          {/* SECTION 1: Appraisal Period */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] flex items-center gap-3"><span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono">SECTION 1</span> Appraisal Period</h3>
                <div className="grid grid-cols-2 gap-6 bg-white/5 p-6 rounded-3xl border border-white/5">
                    <div><label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Start Date</label><input type="date" value={contract.periodFrom || ''} onChange={e => setContract({...contract, periodFrom: e.target.value})} disabled={!canEditEmployee} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                    <div><label className="block text-[10px] font-black text-slate-500 uppercase mb-2">End Date</label><input type="date" value={contract.periodTo || ''} onChange={e => setContract({...contract, periodTo: e.target.value})} disabled={!canEditEmployee} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                </div>
            </div>
            {/* SECTION 2: Employee Information */}
            <div className="space-y-6">
                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] flex items-center gap-3"><span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono">SECTION 2</span> Employee Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                    <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-0.5">Name</label><p className="font-bold text-white text-sm truncate uppercase">{contract.employeeFirstName} {contract.employeeSurname}</p></div>
                    <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-0.5">IPPIS</label><p className="font-bold text-white text-sm">{contract.employeeIppis}</p></div>
                    <div className="col-span-2"><label className="text-[9px] text-slate-500 font-bold uppercase block mb-0.5">Department</label><p className="font-bold text-emerald-400 text-sm uppercase">{contract.employeeDepartment}</p></div>
                </div>
            </div>
          </section>

          {/* SECTION 3 & 4: Authorities */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] flex items-center gap-3"><span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono">SECTION 3</span> Supervisor Information</h3>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                    <select value={contract.supervisorId || ''} onChange={e => handleSupervisorChange(e.target.value)} disabled={!canEditEmployee} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="">-- Select Supervisor --</option>
                      {supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="space-y-6">
                <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] flex items-center gap-3"><span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono">SECTION 4</span> Counter-Signing Officer</h3>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                    <select value={contract.officerId || ''} onChange={e => handleOfficerChange(e.target.value)} disabled={!canEditEmployee} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500">
                      <option value="">-- Select Officer --</option>
                      {ctos.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                </div>
            </div>
          </section>

          {/* SECTION 5: Task Matrix */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] flex items-center gap-3"><span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono">SECTION 5</span> Employee Task Matrix</h3>
              {canEditEmployee && <button onClick={addKra} className="bg-emerald-600/20 text-emerald-400 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-600/30 transition-all">+ Add Task</button>}
            </div>
            <div className="overflow-x-auto glass-card rounded-3xl">
              <table className="w-full text-left text-[10px] min-w-[1700px]">
                <thead className="bg-emerald-600 text-white">
                  <tr>
                    <th rowSpan={2} className="px-4 py-4 font-black text-center w-10">S/N</th>
                    <th rowSpan={2} className="px-4 py-4 font-black w-56">Key Result Areas</th>
                    <th rowSpan={2} className="px-2 py-4 font-black text-center w-16">Weight</th>
                    <th rowSpan={2} className="px-4 py-4 font-black w-64">Objectives</th>
                    <th rowSpan={2} className="px-4 py-4 font-black w-64">End Expectation</th>
                    <th colSpan={6} className="px-4 py-2 font-black text-center border-b border-white/10">Criteria Values</th>
                    <th rowSpan={2} className="px-2 py-4 font-black text-center w-20">Graded Weight</th>
                    <th rowSpan={2} className="px-4 py-4 font-black w-64">KPIs</th>
                    <th rowSpan={2} className="px-4 py-4 font-black text-center w-24">Unit</th>
                  </tr>
                  <tr className="bg-emerald-500/50">
                    {['O','E','VG','G','F','P'].map(l => <th key={l} className="px-1 py-2 font-black text-center w-12">{l}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(contract.kraEntries as KRAEntry[]).map((k, idx) => (
                    <tr key={k.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-4 py-3 text-center text-slate-500 font-black">{idx + 1}</td>
                      <td className="p-2"><textarea value={k.area} onChange={e => updateKra(k.id, 'area', e.target.value)} disabled={!canEditEmployee} className="w-full bg-transparent p-2 text-slate-200 focus:ring-1 focus:ring-emerald-500 rounded outline-none h-20 resize-none text-[10px]" /></td>
                      <td className="p-2"><input type="number" value={k.weight} onChange={e => updateKra(k.id, 'weight', Number(e.target.value))} disabled={!canEditEmployee} className="w-full bg-transparent p-2 text-center font-black text-white outline-none" /></td>
                      <td className="p-2"><textarea value={k.objectives} onChange={e => updateKra(k.id, 'objectives', e.target.value)} disabled={!canEditEmployee} className="w-full bg-transparent p-2 text-slate-200 focus:ring-1 focus:ring-emerald-500 rounded outline-none h-20 resize-none text-[10px]" /></td>
                      <td className="p-2"><textarea value={k.expectation || ''} onChange={e => updateKra(k.id, 'expectation', e.target.value)} disabled={!canEditEmployee} className="w-full bg-emerald-900/40 border border-white/5 rounded-xl p-2 text-slate-200 focus:ring-1 focus:ring-emerald-500 rounded outline-none h-20 resize-none text-[10px]" placeholder="Describe end expectation..." /></td>
                      {['o','e','vg','g','f','p'].map(key => (
                        <td key={key} className="p-0 border-r border-white/5"><input value={(k.criteria as any)[key]} onChange={e => updateCriteria(k.id, key as any, e.target.value)} disabled={!canEditEmployee} className="w-full bg-transparent p-2 text-center text-slate-300 outline-none" placeholder={key.toUpperCase()} /></td>
                      ))}
                      <td className="p-2 text-center font-black text-emerald-400">{k.gradedWeight}%</td>
                      <td className="p-2"><textarea value={k.kpis} onChange={e => updateKra(k.id, 'kpis', e.target.value)} disabled={!canEditEmployee} className="w-full bg-transparent p-2 text-slate-200 focus:ring-1 focus:ring-emerald-500 rounded outline-none h-20 resize-none text-[10px]" /></td>
                      <td className="p-2 text-center"><span className="text-[9px] font-black uppercase text-emerald-400">{k.unit}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 6: Competency Assessment */}
          <section className="space-y-8">
            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] flex items-center gap-3"><span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono">SECTION 6</span> Competency Assessment</h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Scale Legend */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
                        <h4 className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-6">Rating Scale</h4>
                        <div className="space-y-4">
                            {[
                                { s: 5, t: 'Exceptional', c: 'bg-emerald-500' },
                                { s: 4, t: 'Commendable', c: 'bg-emerald-600' },
                                { s: 3, t: 'Satisfactory', c: 'bg-teal-500' },
                                { s: 2, t: 'Needs Impr.', c: 'bg-amber-500' },
                                { s: 1, t: 'Unsatisfactory', c: 'bg-red-500' },
                            ].map(l => (
                                <div key={l.s} className="flex items-center gap-4">
                                    <span className={`w-8 h-8 rounded-xl ${l.c} text-white flex items-center justify-center font-black text-[11px] shadow-lg`}>{l.s}</span>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{l.t}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sub-sections with Expectation Fields */}
                <div className="lg:col-span-3 space-y-10">
                    {Object.entries(competencyGroups).map(([groupName, items], gIdx) => (
                        <div key={groupName} className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">6.{gIdx + 1}: {categoryLabels[groupName]}</span>
                                <div className="h-px bg-white/10 flex-1"></div>
                            </div>
                            <div className="overflow-hidden border border-white/10 rounded-3xl bg-white/[0.02]">
                                <table className="w-full text-left text-[10px]">
                                    <thead className="bg-white/[0.03]">
                                        <tr>
                                            <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest">Description</th>
                                            <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest w-72">Describe End Expectation</th>
                                            <th className="px-6 py-4 font-black text-slate-500 uppercase tracking-widest text-center w-32">Rating (1-5)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {items.map((c, cIdx) => (
                                            <tr key={c.id} className="hover:bg-white/[0.03] transition-colors">
                                                <td className="px-6 py-5">
                                                    <p className="font-black text-slate-200 mb-1">{cIdx + 1}. {c.name}</p>
                                                    <p className="text-[9px] text-slate-500 leading-relaxed italic">{c.description}</p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <textarea 
                                                      value={c.expectation || ''} 
                                                      onChange={e => updateCompetency(c.id, 'expectation', e.target.value)} 
                                                      disabled={!canEditEmployee}
                                                      className="w-full bg-emerald-900/50 border border-white/5 rounded-xl p-3 text-slate-200 text-[10px] outline-none h-20 resize-none focus:ring-1 focus:ring-emerald-500" 
                                                      placeholder="End expectation..."
                                                    />
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <select 
                                                        value={c.score} 
                                                        onChange={e => updateCompetency(c.id, 'score', Number(e.target.value))}
                                                        disabled={!canEditEmployee}
                                                        className="bg-slate-900 border border-white/10 rounded-xl p-3 text-center text-emerald-400 font-black outline-none w-20 cursor-pointer hover:border-emerald-500/50"
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

          {/* SECTION 7: Comments & Final Signatures */}
          <section className="space-y-10">
            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] flex items-center gap-3"><span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono">SECTION 7</span> Comments</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* i. Appraisee (Employee) */}
              <div className={`p-8 rounded-[2.5rem] border space-y-6 flex flex-col transition-all ${isEmployee ? 'bg-emerald-600/5 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]' : 'bg-white/5 border-white/10'}`}>
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">i. Appraisee's Comment</h4>
                  {contract.employeeSignedDate && <span className="text-[8px] text-emerald-400 font-black uppercase tracking-widest border border-emerald-500/30 px-2 py-0.5 rounded-full">Finalized</span>}
                </div>
                <div className="flex-1">
                  <label className="text-[9px] text-slate-500 font-black uppercase mb-2 block">Reflection on Targets</label>
                  <textarea 
                    value={contract.employeeComment} 
                    onChange={e => setContract({...contract, employeeComment: e.target.value})} 
                    disabled={!canEditEmployee}
                    className="w-full h-32 bg-slate-900/40 border border-white/5 rounded-2xl p-4 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-700"
                    placeholder="Provide your feedback on the defined contract period..."
                  />
                </div>
                <div className="pt-6 border-t border-white/5 space-y-4">
                  <div className="flex items-center gap-3 group/sig">
                    <input 
                      type="checkbox" 
                      id="employee-sig"
                      checked={contract.employeeSigned} 
                      onChange={e => setContract({...contract, employeeSigned: e.target.checked})} 
                      disabled={!canEditEmployee}
                      className="w-6 h-6 rounded-lg bg-slate-900 border-white/20 text-emerald-600 focus:ring-0 cursor-pointer disabled:cursor-not-allowed" 
                    />
                    <label htmlFor="employee-sig" className="text-[10px] text-slate-400 font-black uppercase tracking-widest cursor-pointer">ii. Signature (Appraisee)</label>
                  </div>
                  {contract.employeeSignedDate ? (
                    <div>
                        <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Date Signed</p>
                        <p className="text-[10px] text-white font-mono bg-white/5 inline-block px-3 py-1 rounded-lg border border-white/5">{new Date(contract.employeeSignedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                  ) : (
                    <div className="h-10 border border-dashed border-white/5 rounded-xl flex items-center justify-center"><span className="text-[8px] text-slate-700 uppercase font-black tracking-widest">Pending Signature</span></div>
                  )}
                </div>
              </div>

              {/* ii. Supervisor */}
              <div className={`p-8 rounded-[2.5rem] border space-y-6 flex flex-col transition-all ${isPM ? 'bg-emerald-600/5 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]' : 'bg-white/5 border-white/10'}`}>
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">i. Supervisor's Comment</h4>
                  {contract.supervisorSignedDate && <span className="text-[8px] text-emerald-400 font-black uppercase tracking-widest border border-emerald-500/30 px-2 py-0.5 rounded-full">Finalized</span>}
                </div>
                <div className="flex-1">
                  <label className="text-[9px] text-slate-500 font-black uppercase mb-2 block">Assessment Remarks</label>
                  <textarea 
                    value={contract.supervisorComment} 
                    onChange={e => setContract({...contract, supervisorComment: e.target.value})} 
                    disabled={!canEditSupervisor}
                    className="w-full h-32 bg-slate-900/40 border border-white/5 rounded-2xl p-4 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-700"
                    placeholder="Official supervisor feedback..."
                  />
                </div>
                <div className="pt-6 border-t border-white/5 space-y-4">
                  <div className="flex items-center gap-3 group/sig">
                    <input 
                      type="checkbox" 
                      id="supervisor-sig"
                      checked={contract.supervisorSigned} 
                      onChange={e => setContract({...contract, supervisorSigned: e.target.checked})} 
                      disabled={!canEditSupervisor}
                      className="w-6 h-6 rounded-lg bg-slate-900 border-white/20 text-emerald-600 focus:ring-0 cursor-pointer disabled:cursor-not-allowed" 
                    />
                    <label htmlFor="supervisor-sig" className="text-[10px] text-slate-400 font-black uppercase tracking-widest cursor-pointer">ii. Signature (Supervisor)</label>
                  </div>
                  {contract.supervisorSignedDate ? (
                    <div>
                        <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Date Signed</p>
                        <p className="text-[10px] text-white font-mono bg-white/5 inline-block px-3 py-1 rounded-lg border border-white/5">{new Date(contract.supervisorSignedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                  ) : (
                    <div className="h-10 border border-dashed border-white/5 rounded-xl flex items-center justify-center"><span className="text-[8px] text-slate-700 uppercase font-black tracking-widest">Pending Signature</span></div>
                  )}
                </div>
              </div>

              {/* iii. Counter-signing Officer */}
              <div className={`p-8 rounded-[2.5rem] border space-y-6 flex flex-col transition-all ${isCTO ? 'bg-emerald-600/5 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]' : 'bg-white/5 border-white/10'}`}>
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">i. Counter signing officer's Comment</h4>
                  {contract.officerSignedDate && <span className="text-[8px] text-emerald-400 font-black uppercase tracking-widest border border-emerald-500/30 px-2 py-0.5 rounded-full">Finalized</span>}
                </div>
                <div className="flex-1">
                  <label className="text-[9px] text-slate-500 font-black uppercase mb-2 block">Oversight Remarks</label>
                  <textarea 
                    value={contract.officerComment} 
                    onChange={e => setContract({...contract, officerComment: e.target.value})} 
                    disabled={!canEditOfficer}
                    className="w-full h-32 bg-slate-900/40 border border-white/5 rounded-2xl p-4 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-700"
                    placeholder="Management oversight remarks..."
                  />
                </div>
                <div className="pt-6 border-t border-white/5 space-y-4">
                  <div className="flex items-center gap-3 group/sig">
                    <input 
                      type="checkbox" 
                      id="officer-sig"
                      checked={contract.officerSigned} 
                      onChange={e => setContract({...contract, officerSigned: e.target.checked})} 
                      disabled={!canEditOfficer}
                      className="w-6 h-6 rounded-lg bg-slate-900 border-white/20 text-emerald-600 focus:ring-0 cursor-pointer disabled:cursor-not-allowed" 
                    />
                    <label htmlFor="officer-sig" className="text-[10px] text-slate-400 font-black uppercase tracking-widest cursor-pointer">ii. Signature (Officer)</label>
                  </div>
                  {contract.officerSignedDate ? (
                    <div>
                        <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Date Signed</p>
                        <p className="text-[10px] text-white font-mono bg-white/5 inline-block px-3 py-1 rounded-lg border border-white/5">{new Date(contract.officerSignedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                  ) : (
                    <div className="h-10 border border-dashed border-white/5 rounded-xl flex items-center justify-center"><span className="text-[8px] text-slate-700 uppercase font-black tracking-widest">Pending Signature</span></div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Action Bar */}
        <div className="p-8 md:p-12 bg-white/5 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-6">
          {isEmployee && isDraft && (
            <>
              <button onClick={() => handleSubmit(FormStatus.DRAFT)} className="px-10 py-5 bg-white/5 border border-white/10 text-slate-400 font-black rounded-2xl hover:bg-white/10 transition-all text-[10px] uppercase tracking-[0.3em]">Save Progress</button>
              <button onClick={() => handleSubmit(FormStatus.SUBMITTED)} className={`px-14 py-5 font-black rounded-2xl shadow-2xl transition-all text-[10px] uppercase tracking-[0.3em] shimmer-container ${contract.employeeSigned ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}>Confirm & Submit Contract</button>
            </>
          )}

          {isPM && isSubmitted && (
             <button onClick={() => handleSubmit(FormStatus.APPROVED_BY_PM)} className="px-14 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 shadow-2xl transition-all text-[10px] uppercase tracking-[0.3em] shimmer-container">Supervisor Approval</button>
          )}

          {isCTO && isPMApproved && (
             <button onClick={() => handleSubmit(FormStatus.APPROVED)} className="px-14 py-5 bg-teal-600 text-white font-black rounded-2xl hover:bg-teal-500 shadow-2xl transition-all text-[10px] uppercase tracking-[0.3em] shimmer-container">Finalize & Activate Contract</button>
          )}

          <button onClick={onClose} className="px-12 py-5 bg-white/5 border border-white/10 text-slate-400 font-black rounded-2xl hover:bg-white/10 transition-all text-[10px] uppercase tracking-[0.3em]">Exit View</button>
        </div>
      </div>
    </div>
  );
};

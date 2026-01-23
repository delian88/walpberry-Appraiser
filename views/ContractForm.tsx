
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../store/AppContext';
import { PerformanceContract, FormStatus, KRAEntry, UserRole, CriteriaValues, CompetencyEntry, User } from '../types';
import { DEPT_SUPERVISOR_MAP } from '../constants';

export const ContractForm: React.FC<{ onClose: () => void, initialData?: PerformanceContract }> = ({ onClose, initialData }) => {
  const { currentUser, users, upsertContract } = useAppContext();

  const supervisors = useMemo(() => users.filter(u => u.role === UserRole.PM || u.role === UserRole.CTO), [users]);
  const ctos = useMemo(() => users.filter(u => u.role === UserRole.CTO), [users]);

  // Initial competencies
  const defaultCompetencies: CompetencyEntry[] = [
    { id: 'c1', name: 'Leadership Skills', description: 'Ability to guide, inspire and direct team members towards goals.', score: 0 },
    { id: 'c2', name: 'Communication', description: 'Effectiveness in verbal and written information exchange.', score: 0 },
    { id: 'c3', name: 'Professionalism', description: 'Adherence to corporate ethics, punctuality and conduct.', score: 0 },
    { id: 'c4', name: 'Technical Proficiency', description: 'Depth of knowledge and skill in assigned technical domain.', score: 0 }
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
      // Auto-assign first CTO as counter-signing officer
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
    setContract(prev => ({ ...prev, kraEntries: [...(prev.kraEntries || []), newKra] }));
  };

  const updateKra = (id: string, field: keyof KRAEntry, value: any) => {
    if (!canEditMain) return;
    setContract(prev => ({
      ...prev,
      kraEntries: (prev.kraEntries || []).map(k => k.id === id ? { ...k, [field]: value } : k)
    }));
  };

  const updateCriteria = (id: string, key: keyof CriteriaValues, value: string) => {
    if (!canEditMain) return;
    setContract(prev => ({
      ...prev,
      kraEntries: (prev.kraEntries || []).map(k => 
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

  const handleSubmit = (nextStatus: FormStatus) => {
    if (nextStatus === FormStatus.SUBMITTED) {
      if (!contract.periodFrom || !contract.periodTo) {
        alert("Please define the appraisal start and end dates.");
        return;
      }
      if (!contract.supervisorId) {
        alert("Please select a Supervisor.");
        return;
      }
      if (contract.kraEntries.length === 0) {
        alert("At least one Employee Task (KRA) is required.");
        return;
      }
      if (totalWeight !== 100) {
        alert(`Total weight sum for Employee Tasks must be 100%. Current: ${totalWeight}%`);
        return;
      }
      if (!contract.employeeSigned) {
        alert("Please check the Employee Declaration before submitting.");
        return;
      }
    }

    const now = Date.now();
    const payload: PerformanceContract = {
      ...contract,
      status: nextStatus,
      updatedAt: now,
      employeeSignedDate: contract.employeeSigned && !contract.employeeSignedDate ? now : contract.employeeSignedDate,
    };
    
    upsertContract(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 glass-modal flex items-center justify-center p-2 md:p-4">
      <div className="bg-slate-900 border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] w-[96vw] md:w-full max-w-[95vw] max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
        
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
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-12">
          
          {/* SECTION A: APPRAISAL / CONTRACT PERIOD */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono">A</span>
              Appraisal / Contract Period
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-6 rounded-3xl border border-white/5">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Start Date</label>
                <input 
                  type="date" 
                  value={contract.periodFrom || ''} 
                  onChange={e => setContract({...contract, periodFrom: e.target.value})}
                  disabled={!canEditMain}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">End Date</label>
                <input 
                  type="date" 
                  value={contract.periodTo || ''} 
                  onChange={e => setContract({...contract, periodTo: e.target.value})}
                  disabled={!canEditMain}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </section>

          {/* SECTION B: EMPLOYEE INFORMATION */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono">B</span>
              Employee Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-white/5 p-6 rounded-3xl border border-white/5">
              <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Surname</label><p className="font-bold text-white uppercase">{contract.employeeSurname}</p></div>
              <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">First Name</label><p className="font-bold text-white uppercase">{contract.employeeFirstName}</p></div>
              <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Other Names</label><p className="font-bold text-white uppercase">{contract.employeeOtherNames || 'N/A'}</p></div>
              <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">IPPIS Number</label><p className="font-bold text-white">{contract.employeeIppis}</p></div>
              <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Designation</label><p className="font-bold text-white uppercase">{contract.employeeDesignation}</p></div>
              <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Department</label><p className="font-bold text-white uppercase">{contract.employeeDepartment}</p></div>
            </div>
          </section>

          {/* SECTION C: SUPERVISOR INFORMATION */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono">C</span>
              Supervisor Information
            </h3>
            <div className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/5">
              <div className="max-w-md">
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Select Supervisor</label>
                <select 
                  value={contract.supervisorId || ''} 
                  onChange={e => handleSupervisorChange(e.target.value)}
                  disabled={!canEditMain}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose Supervisor --</option>
                  {supervisors.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.department})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
                <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Surname</label><p className="font-bold text-white uppercase">{contract.supervisorSurname || '...'}</p></div>
                <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">First Name</label><p className="font-bold text-white uppercase">{contract.supervisorFirstName || '...'}</p></div>
                <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">IPPIS Number</label><p className="font-bold text-white">{contract.supervisorIppis || '...'}</p></div>
                <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Email</label><p className="font-bold text-white italic">{contract.supervisorEmail || '...'}</p></div>
                <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Designation</label><p className="font-bold text-white uppercase">{contract.supervisorDesignation || '...'}</p></div>
                <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Department</label><p className="font-bold text-white uppercase">{contract.supervisorDepartment || '...'}</p></div>
              </div>
            </div>
          </section>

          {/* SECTION D: COUNTER-SIGNING OFFICERS INFORMATION */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono">D</span>
              Counter-Signing Officers Information
            </h3>
            <div className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/5">
              <div className="max-w-md">
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Select Officer</label>
                <select 
                  value={contract.officerId || ''} 
                  onChange={e => handleOfficerChange(e.target.value)}
                  disabled={!canEditMain}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose Officer --</option>
                  {ctos.map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.designation})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
                <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Surname</label><p className="font-bold text-white uppercase">{contract.officerSurname || '...'}</p></div>
                <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">First Name</label><p className="font-bold text-white uppercase">{contract.officerFirstName || '...'}</p></div>
                <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">IPPIS Number</label><p className="font-bold text-white">{contract.officerIppis || '...'}</p></div>
                <div className="md:col-span-2"><label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Designation</label><p className="font-bold text-white uppercase">{contract.officerDesignation || '...'}</p></div>
              </div>
            </div>
          </section>

          {/* SECTION E: EMPLOYEE TASK (Matrix) */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono">E</span>
                Employee Task (KRA Matrix)
              </h3>
              {canEditMain && (
                <button onClick={addKra} className="bg-indigo-600/20 text-indigo-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 hover:bg-indigo-600/30 transition-all">+ Add Task</button>
              )}
            </div>
            
            <div className="overflow-x-auto border border-white/10 rounded-3xl bg-slate-950 shadow-2xl">
              <table className="w-full text-left text-[10px] min-w-[1400px] border-collapse">
                <thead className="bg-amber-500 text-slate-900">
                  <tr>
                    <th rowSpan={2} className="px-3 py-4 font-black uppercase tracking-tighter text-center border-r border-slate-900/10 w-10">S/N</th>
                    <th rowSpan={2} className="px-4 py-4 font-black uppercase tracking-tighter border-r border-slate-900/10 w-48">Key Result Areas</th>
                    <th rowSpan={2} className="px-2 py-4 font-black uppercase tracking-tighter text-center border-r border-slate-900/10 w-16">Weight</th>
                    <th rowSpan={2} className="px-4 py-4 font-black uppercase tracking-tighter border-r border-slate-900/10 w-56">Objectives</th>
                    <th colSpan={6} className="px-4 py-2 font-black uppercase tracking-widest text-center border-b border-slate-900/10 border-r border-slate-900/10">Criteria Values</th>
                    <th rowSpan={2} className="px-2 py-4 font-black uppercase tracking-tighter text-center border-r border-slate-900/10 w-16">Weight</th>
                    <th rowSpan={2} className="px-2 py-4 font-black uppercase tracking-tighter text-center border-r border-slate-900/10 w-20">Graded Weight</th>
                    <th rowSpan={2} className="px-4 py-4 font-black uppercase tracking-tighter border-r border-slate-900/10 w-48">KPIs</th>
                    <th rowSpan={2} className="px-2 py-4 font-black uppercase tracking-tighter text-center border-r border-slate-900/10 w-16">Target Set</th>
                    <th rowSpan={2} className="px-4 py-4 font-black uppercase tracking-tighter w-24">Unit of Measurement</th>
                  </tr>
                  <tr className="bg-amber-400/90">
                    <th className="px-1 py-2 font-black text-center border-r border-slate-900/10 w-12">O</th>
                    <th className="px-1 py-2 font-black text-center border-r border-slate-900/10 w-12">E</th>
                    <th className="px-1 py-2 font-black text-center border-r border-slate-900/10 w-12">VG</th>
                    <th className="px-1 py-2 font-black text-center border-r border-slate-900/10 w-12">G</th>
                    <th className="px-1 py-2 font-black text-center border-r border-slate-900/10 w-12">F</th>
                    <th className="px-1 py-2 font-black text-center border-r border-slate-900/10 w-12">P</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {contract.kraEntries.length === 0 && (
                    <tr><td colSpan={16} className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest">No matrix entries added yet.</td></tr>
                  )}
                  {contract.kraEntries.map((k, idx) => (
                    <tr key={k.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-3 py-2 text-center text-slate-500 font-black border-r border-white/5">{idx + 1}</td>
                      <td className="p-1 border-r border-white/5"><textarea value={k.area} onChange={e => updateKra(k.id, 'area', e.target.value)} disabled={!canEditMain} className="w-full bg-transparent p-2 text-slate-200 focus:ring-1 focus:ring-indigo-500 rounded outline-none h-20 resize-none text-[10px]" /></td>
                      <td className="p-1 border-r border-white/5"><input type="number" value={k.weight} onChange={e => updateKra(k.id, 'weight', Number(e.target.value))} disabled={!canEditMain} className="w-full bg-transparent p-2 text-center font-black text-white focus:ring-1 focus:ring-indigo-500 rounded outline-none" /></td>
                      <td className="p-1 border-r border-white/5"><textarea value={k.objectives} onChange={e => updateKra(k.id, 'objectives', e.target.value)} disabled={!canEditMain} className="w-full bg-transparent p-2 text-slate-200 focus:ring-1 focus:ring-indigo-500 rounded outline-none h-20 resize-none text-[10px]" /></td>
                      
                      <td className="p-0 border-r border-white/5"><input value={k.criteria.o} onChange={e => updateCriteria(k.id, 'o', e.target.value)} disabled={!canEditMain} className="w-full bg-transparent p-2 text-center text-slate-300 outline-none" placeholder="O" /></td>
                      <td className="p-0 border-r border-white/5"><input value={k.criteria.e} onChange={e => updateCriteria(k.id, 'e', e.target.value)} disabled={!canEditMain} className="w-full bg-transparent p-2 text-center text-slate-300 outline-none" placeholder="E" /></td>
                      <td className="p-0 border-r border-white/5"><input value={k.criteria.vg} onChange={e => updateCriteria(k.id, 'vg', e.target.value)} disabled={!canEditMain} className="w-full bg-transparent p-2 text-center text-slate-300 outline-none" placeholder="VG" /></td>
                      <td className="p-0 border-r border-white/5"><input value={k.criteria.g} onChange={e => updateCriteria(k.id, 'g', e.target.value)} disabled={!canEditMain} className="w-full bg-transparent p-2 text-center text-slate-300 outline-none" placeholder="G" /></td>
                      <td className="p-0 border-r border-white/5"><input value={k.criteria.f} onChange={e => updateCriteria(k.id, 'f', e.target.value)} disabled={!canEditMain} className="w-full bg-transparent p-2 text-center text-slate-300 outline-none" placeholder="F" /></td>
                      <td className="p-0 border-r border-white/5"><input value={k.criteria.p} onChange={e => updateCriteria(k.id, 'p', e.target.value)} disabled={!canEditMain} className="w-full bg-transparent p-2 text-center text-slate-300 outline-none" placeholder="P" /></td>

                      <td className="p-1 border-r border-white/5"><input type="number" value={k.objWeight} onChange={e => updateKra(k.id, 'objWeight', Number(e.target.value))} disabled={!canEditMain} className="w-full bg-transparent p-2 text-center font-black text-white outline-none" /></td>
                      <td className="p-1 border-r border-white/5"><input type="number" value={k.gradedWeight} onChange={e => updateKra(k.id, 'gradedWeight', Number(e.target.value))} disabled={!canEditMain} className="w-full bg-transparent p-2 text-center font-black text-emerald-400 outline-none" /></td>
                      
                      <td className="p-1 border-r border-white/5"><textarea value={k.kpis} onChange={e => updateKra(k.id, 'kpis', e.target.value)} disabled={!canEditMain} className="w-full bg-transparent p-2 text-slate-200 focus:ring-1 focus:ring-indigo-500 rounded outline-none h-20 resize-none text-[10px]" /></td>
                      <td className="p-1 border-r border-white/5"><input type="number" value={k.target} onChange={e => updateKra(k.id, 'target', Number(e.target.value))} disabled={!canEditMain} className="w-full bg-transparent p-2 text-center font-black text-white outline-none" /></td>
                      <td className="p-1">
                        <select value={k.unit} onChange={e => updateKra(k.id, 'unit', e.target.value)} disabled={!canEditMain} className="w-full bg-slate-900/50 p-2 text-slate-300 focus:ring-1 focus:ring-indigo-500 rounded outline-none border-none text-[9px] font-bold uppercase">
                          <option>Percentage</option>
                          <option>Quantity</option>
                          <option>Rating</option>
                          <option>Time-based</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-white/5">
                    <td colSpan={2} className="px-4 py-4 text-right font-black text-slate-500 uppercase">KRA Total:</td>
                    <td className={`px-2 py-4 text-center font-black text-sm ${totalWeight === 100 ? 'text-emerald-400' : 'text-red-400'}`}>{totalWeight}%</td>
                    <td colSpan={7}></td>
                    <td className="px-2 py-4 text-right font-black text-slate-500 uppercase">Obj Total:</td>
                    <td className="px-2 py-4 text-center font-black text-slate-200">
                      {contract.kraEntries.reduce((sum, k) => sum + (k.objWeight || 0), 0)}%
                    </td>
                    <td colSpan={4}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* SECTION F: GENERIC COMPETENCE */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono">F</span>
              Generic Competence Assessment
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Legend */}
              <div className="lg:col-span-1 bg-white/5 p-6 rounded-3xl border border-white/5">
                <h4 className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-4">Rating Legend</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3"><span className="w-6 h-6 rounded bg-emerald-500 text-slate-900 flex items-center justify-center font-black text-[10px]">5</span> <p className="text-[10px] text-slate-300">Exceptional Performance</p></div>
                  <div className="flex items-center gap-3"><span className="w-6 h-6 rounded bg-indigo-500 text-white flex items-center justify-center font-black text-[10px]">4</span> <p className="text-[10px] text-slate-300">Commendable Achievement</p></div>
                  <div className="flex items-center gap-3"><span className="w-6 h-6 rounded bg-blue-500 text-white flex items-center justify-center font-black text-[10px]">3</span> <p className="text-[10px] text-slate-300">Satisfactory Standing</p></div>
                  <div className="flex items-center gap-3"><span className="w-6 h-6 rounded bg-amber-500 text-slate-900 flex items-center justify-center font-black text-[10px]">2</span> <p className="text-[10px] text-slate-300">Improvement Needed</p></div>
                  <div className="flex items-center gap-3"><span className="w-6 h-6 rounded bg-red-500 text-white flex items-center justify-center font-black text-[10px]">1</span> <p className="text-[10px] text-slate-300">Unsatisfactory Level</p></div>
                </div>
              </div>

              {/* Assessment Table */}
              <div className="lg:col-span-2 overflow-hidden border border-white/10 rounded-3xl bg-white/5">
                <table className="w-full text-left text-[10px]">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-5 py-4 font-black text-slate-500 uppercase tracking-widest">Competency Area</th>
                      <th className="px-5 py-4 font-black text-slate-500 uppercase tracking-widest text-center w-32">Rating (1-5)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {contract.competencyEntries.map(c => (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-200">{c.name}</p>
                          <p className="text-[9px] text-slate-500 mt-0.5">{c.description}</p>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <select 
                            value={c.score} 
                            onChange={e => updateCompetency(c.id, Number(e.target.value))}
                            disabled={!canEditMain}
                            className="bg-slate-900 border border-white/10 rounded-lg p-2 text-center text-indigo-400 font-black outline-none w-20"
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
          </section>

          {/* SECTION G: EMPLOYEE DECLARATION */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono">G</span>
              Employee Declaration
            </h3>
            <div className="bg-white/5 p-8 rounded-3xl border border-white/5 space-y-6">
              <div className="flex items-start gap-4">
                <input 
                  type="checkbox" 
                  checked={contract.employeeSigned} 
                  onChange={e => setContract({...contract, employeeSigned: e.target.checked})}
                  disabled={!isEmployee || !isDraft}
                  className="w-6 h-6 rounded-lg mt-1 bg-slate-900 border-white/10 text-indigo-600 focus:ring-offset-slate-900"
                />
                <p className="text-sm text-slate-400 leading-relaxed italic">
                  I, <span className="text-white font-bold uppercase">{contract.employeeFirstName} {contract.employeeSurname}</span>, hereby declare that I have discussed and agreed on the performance tasks, level of assessment and targets defined in this contract.
                </p>
              </div>
              {contract.employeeSignedDate && (
                <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest">Signed on: {new Date(contract.employeeSignedDate).toLocaleDateString()}</p>
              )}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-6 md:p-10 bg-white/5 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
          {isEmployee && isDraft && (
            <>
              <button onClick={() => handleSubmit(FormStatus.DRAFT)} className="px-10 py-4 bg-white/5 border border-white/10 text-slate-400 font-black rounded-2xl hover:bg-white/10 transition-all text-[10px] uppercase tracking-[0.2em]">Save as Draft</button>
              <button 
                onClick={() => handleSubmit(FormStatus.SUBMITTED)} 
                disabled={!contract.employeeSigned}
                className={`px-12 py-4 font-black rounded-2xl shadow-2xl transition-all text-[10px] uppercase tracking-[0.2em] shimmer-container ${contract.employeeSigned ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
              >
                Agree & Submit
              </button>
            </>
          )}
          {!isDraft && (
            <button onClick={onClose} className="px-10 py-4 bg-white/5 border border-white/10 text-slate-400 font-black rounded-2xl hover:bg-white/10 transition-all text-[10px] uppercase tracking-[0.2em]">Exit View</button>
          )}
        </div>
      </div>
    </div>
  );
};

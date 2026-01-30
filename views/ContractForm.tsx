
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../store/AppContext';
import { PerformanceContract, FormStatus, KRAEntry, UserRole, CriteriaValues, CompetencyEntry, User } from '../types';
import { DEPT_SUPERVISOR_MAP } from '../constants';
import { SignaturePad } from '../components/SignaturePad';

export const ContractForm: React.FC<{ onClose: () => void, initialData?: PerformanceContract }> = ({ onClose, initialData }) => {
  const { currentUser, users, upsertContract, showToast } = useAppContext();

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
      if (contract.kraEntries.length === 0) { alert("At least one Employee Task is required."); return; }
      if (totalWeight !== 100) { alert(`Total weight must be 100%. Current: ${totalWeight}%`); return; }
      if (!contract.employeeSigned || !contract.employeeSignature) { alert("Please provide your signature."); return; }
      finalContract.employeeSignedDate = now;
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

  return (
    <div className="fixed inset-0 z-50 glass-modal flex items-center justify-center p-2 md:p-6 animate-fade-in">
      <div className="bg-slate-900 border border-white/10 rounded-[3rem] w-full max-w-[98vw] h-[95vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Modal Header */}
        <header className="p-8 md:p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div>
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Performance Contract</h2>
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">{contract.status}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Official Document ID: {contract.id.toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-white/5 rounded-3xl transition-all border border-white/5 group">
            <svg className="w-6 h-6 text-slate-500 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-14 space-y-20">
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-xs">01</span>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Effective Period</h3>
                </div>
                <div className="grid grid-cols-2 gap-6 bg-white/[0.02] p-8 rounded-[2rem] border border-white/5">
                    <div><label className="text-[9px] font-black text-slate-600 uppercase mb-2 block">Start Date</label><input type="date" value={contract.periodFrom || ''} onChange={e => setContract(prev => ({...prev, periodFrom: e.target.value}))} disabled={!canEditEmployee} className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
                    <div><label className="text-[9px] font-black text-slate-600 uppercase mb-2 block">End Date</label><input type="date" value={contract.periodTo || ''} onChange={e => setContract(prev => ({...prev, periodTo: e.target.value}))} disabled={!canEditEmployee} className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none" /></div>
                </div>
            </div>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-xs">02</span>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Personnel Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-6 bg-white/[0.02] p-8 rounded-[2rem] border border-white/5">
                    <div><p className="text-[9px] text-slate-600 font-black uppercase mb-1">Name</p><p className="font-bold text-white uppercase text-base">{contract.employeeFirstName} {contract.employeeSurname}</p></div>
                    <div><p className="text-[9px] text-slate-600 font-black uppercase mb-1">IPPIS</p><p className="font-bold text-white text-base">{contract.employeeIppis}</p></div>
                    <div className="col-span-2"><p className="text-[9px] text-slate-600 font-black uppercase mb-1">Department</p><p className="font-bold text-emerald-400 uppercase text-base tracking-tight">{contract.employeeDepartment}</p></div>
                </div>
            </div>
          </section>

          <section className="space-y-10">
            <div className="flex justify-between items-end">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-xs">03</span>
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Task Performance Matrix</h3>
                </div>
              </div>
              {canEditEmployee && <button onClick={addKra} className="btn-tactile bg-emerald-600/10 text-emerald-400 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">+ Add Row</button>}
            </div>

            <div className="overflow-x-auto premium-glass rounded-[2.5rem] p-4">
              <table className="w-full text-left text-[11px] min-w-[1600px] border-separate border-spacing-y-2">
                <thead>
                  <tr className="bg-emerald-600 text-white">
                    <th className="p-6 rounded-l-3xl w-14 text-center font-black">#</th>
                    <th className="p-6 font-black uppercase tracking-widest">Key Result Area</th>
                    <th className="p-6 font-black uppercase tracking-widest text-center w-24">Weight</th>
                    <th className="p-6 font-black uppercase tracking-widest">Objectives</th>
                    <th className="p-6 font-black uppercase tracking-widest">Expectation</th>
                    {['O','E','VG','G','F','P'].map(l => <th key={l} className="p-6 font-black text-center w-16">{l}</th>)}
                    <th className="p-6 rounded-r-3xl font-black uppercase tracking-widest">KPIs</th>
                  </tr>
                </thead>
                <tbody>
                  {contract.kraEntries.map((k, idx) => (
                    <tr key={k.id} className="bg-white/[0.01] hover:bg-white/[0.04] transition-all">
                      <td className="p-6 text-center text-slate-600 font-black">{idx + 1}</td>
                      <td className="p-4"><textarea value={k.area} onChange={e => updateKra(k.id, 'area', e.target.value)} disabled={!canEditEmployee} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none h-24 text-[11px] resize-none" placeholder="Primary responsibility area..." /></td>
                      <td className="p-4"><input type="number" value={k.weight} onChange={e => updateKra(k.id, 'weight', Number(e.target.value))} disabled={!canEditEmployee} className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-center font-black text-white focus:ring-2 focus:ring-emerald-500 outline-none" /></td>
                      <td className="p-4"><textarea value={k.objectives} onChange={e => updateKra(k.id, 'objectives', e.target.value)} disabled={!canEditEmployee} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-slate-200 outline-none h-24 resize-none" /></td>
                      <td className="p-4"><textarea value={k.expectation || ''} onChange={e => updateKra(k.id, 'expectation', e.target.value)} disabled={!canEditEmployee} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-slate-200 outline-none h-24 resize-none" /></td>
                      {['o','e','vg','g','f','p'].map(key => (
                        <td key={key} className="p-2 text-center"><input value={(k.criteria as any)[key]} onChange={e => updateCriteria(k.id, key as any, e.target.value)} disabled={!canEditEmployee} className="w-12 bg-transparent border-b border-white/10 text-center text-slate-400 hover:text-white focus:text-white transition-colors" /></td>
                      ))}
                      <td className="p-4"><textarea value={k.kpis} onChange={e => updateKra(k.id, 'kpis', e.target.value)} disabled={!canEditEmployee} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-slate-200 outline-none h-24 resize-none" /></td>
                    </tr>
                  ))}
                  <tr className="bg-white/5">
                    <td colSpan={2} className="p-8 text-right font-black uppercase text-slate-500 text-[10px] tracking-widest">Cumulative Weight Total:</td>
                    <td className={`p-8 text-center text-lg font-black ${totalWeight === 100 ? 'text-emerald-400' : 'text-red-400 animate-pulse'}`}>{totalWeight}%</td>
                    <td colSpan={8} className="p-8 italic text-slate-600 text-[10px]">Ensure the total weight equals 100% to enable final submission.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Action Bar */}
        <footer className="p-10 md:p-14 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row justify-end gap-6">
          <button onClick={onClose} className="px-12 py-5 bg-white/5 border border-white/10 text-slate-500 font-black rounded-3xl hover:bg-white/10 hover:text-white transition-all text-[10px] uppercase tracking-widest">Discard & Exit</button>
          {isEmployee && isDraft && (
            <>
              <button onClick={() => handleSubmit(FormStatus.DRAFT)} className="px-10 py-5 bg-white/5 border border-white/10 text-slate-400 font-black rounded-3xl hover:bg-white/10 transition-all text-[10px] uppercase tracking-widest">Save Draft State</button>
              <button onClick={() => handleSubmit(FormStatus.SUBMITTED)} disabled={totalWeight !== 100} className={`px-16 py-5 font-black rounded-3xl shadow-2xl transition-all text-[10px] uppercase tracking-widest ${contract.employeeSigned && totalWeight === 100 ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-slate-800 text-slate-600 border border-white/5 cursor-not-allowed'}`}>Finalize & Submit Contract</button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
};

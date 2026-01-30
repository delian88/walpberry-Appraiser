
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../store/AppContext';
import { PerformanceContract, FormStatus, KRAEntry, UserRole, CriteriaValues, CompetencyEntry, User } from '../types';
import { DEPT_SUPERVISOR_MAP } from '../constants';
import { SignaturePad } from '../components/SignaturePad';

export const ContractForm: React.FC<{ onClose: () => void, initialData?: PerformanceContract }> = ({ onClose, initialData }) => {
  const { currentUser, users, upsertContract, showToast } = useAppContext();

  const supervisors = useMemo(() => users.filter(u => u.role === UserRole.PM || u.role === UserRole.CTO), [users]);
  const ctos = useMemo(() => users.filter(u => u.role === UserRole.CTO), [users]);

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

  const isEmployee = currentUser?.role === UserRole.EMPLOYEE;
  const isDraft = contract.status === FormStatus.DRAFT;
  const canEditEmployee = isEmployee && isDraft;

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
      if (!contract.periodFrom || !contract.periodTo) { alert("Please define dates."); return; }
      if (totalWeight !== 100) { alert(`Total weight must be 100%. Current: ${totalWeight}%`); return; }
      if (!contract.employeeSigned) { alert("Signature required."); return; }
      finalContract.employeeSignedDate = now;
    }
    finalContract.status = nextStatus;
    upsertContract(finalContract);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-fade-in bg-emerald-950/20 backdrop-blur-sm">
      <div className="bg-[#fdfbf7] border border-emerald-900/10 rounded-[4rem] w-full max-w-[95vw] h-[95vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Elegant top line */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-emerald-900"></div>

        <header className="p-12 md:p-16 border-b border-emerald-900/5 flex justify-between items-center bg-white/40">
          <div>
            <div className="flex items-center gap-6">
              <h2 className="text-4xl font-black text-emerald-950 uppercase tracking-tighter">Performance Contract</h2>
              <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                 isDraft ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}>{contract.status}</span>
            </div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2 opacity-60">Provisioned for Cycle {new Date().getFullYear()}</p>
          </div>
          <button onClick={onClose} className="p-5 hover:bg-emerald-900/5 rounded-3xl transition-all border border-slate-200 group">
            <svg className="w-8 h-8 text-emerald-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-12 md:p-24 space-y-24">
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-10">
                <div className="flex items-center gap-6">
                    <span className="w-12 h-12 rounded-2xl bg-emerald-900 text-white flex items-center justify-center font-black text-sm shadow-xl">01</span>
                    <h3 className="text-[12px] font-black text-emerald-950 uppercase tracking-[0.4em]">Timeline Governance</h3>
                </div>
                <div className="grid grid-cols-2 gap-8 bg-white p-12 rounded-[3rem] border border-emerald-900/5 shadow-xl">
                    <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Effective Date</label><input type="date" value={contract.periodFrom || ''} onChange={e => setContract(prev => ({...prev, periodFrom: e.target.value}))} disabled={!canEditEmployee} className="w-full bg-[#f8f5f0] border border-slate-200 rounded-2xl p-5 text-emerald-950 focus:ring-2 focus:ring-emerald-800 outline-none transition-all" /></div>
                    <div className="space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Terminating Date</label><input type="date" value={contract.periodTo || ''} onChange={e => setContract(prev => ({...prev, periodTo: e.target.value}))} disabled={!canEditEmployee} className="w-full bg-[#f8f5f0] border border-slate-200 rounded-2xl p-5 text-emerald-950 focus:ring-2 focus:ring-emerald-800 outline-none transition-all" /></div>
                </div>
            </div>
            <div className="space-y-10">
                <div className="flex items-center gap-6">
                    <span className="w-12 h-12 rounded-2xl bg-emerald-900 text-white flex items-center justify-center font-black text-sm shadow-xl">02</span>
                    <h3 className="text-[12px] font-black text-emerald-950 uppercase tracking-[0.4em]">Individual Context</h3>
                </div>
                <div className="grid grid-cols-2 gap-10 bg-white p-12 rounded-[3rem] border border-emerald-900/5 shadow-xl">
                    <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Individual</p><p className="font-bold text-emerald-950 uppercase text-2xl">{contract.employeeFirstName} {contract.employeeSurname}</p></div>
                    <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">IPPIS Node</p><p className="font-bold text-emerald-950 text-2xl">{contract.employeeIppis}</p></div>
                    <div className="col-span-2 pt-6 border-t border-slate-100"><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Sector / Division</p><p className="font-bold text-emerald-800 uppercase text-2xl tracking-tighter">{contract.employeeDepartment}</p></div>
                </div>
            </div>
          </section>

          <section className="space-y-12">
            <div className="flex justify-between items-end">
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <span className="w-12 h-12 rounded-2xl bg-emerald-900 text-white flex items-center justify-center font-black text-sm shadow-xl">03</span>
                  <h3 className="text-[12px] font-black text-emerald-950 uppercase tracking-[0.4em]">Performance Matrix</h3>
                </div>
              </div>
              {canEditEmployee && <button onClick={addKra} className="bg-emerald-900 text-white px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-emerald-800">+ Add Row</button>}
            </div>

            <div className="overflow-x-auto bg-white rounded-[3.5rem] p-10 shadow-2xl border border-emerald-900/5">
              <table className="w-full text-left text-[13px] min-w-[1700px] border-separate border-spacing-y-4">
                <thead>
                  <tr className="bg-emerald-950 text-white shadow-xl">
                    <th className="p-8 rounded-l-[2rem] w-20 text-center font-black">ID</th>
                    <th className="p-8 font-black uppercase tracking-widest">Responsibility Focus</th>
                    <th className="p-8 font-black uppercase tracking-widest text-center w-32">Weight %</th>
                    <th className="p-8 font-black uppercase tracking-widest">Objectives</th>
                    <th className="p-8 font-black uppercase tracking-widest">Expectations</th>
                    {['O','E','VG','G','F','P'].map(l => <th key={l} className="p-8 font-black text-center w-20">{l}</th>)}
                    <th className="p-8 rounded-r-[2rem] font-black uppercase tracking-widest">Evidence Node</th>
                  </tr>
                </thead>
                <tbody>
                  {contract.kraEntries.map((k, idx) => (
                    <tr key={k.id} className="bg-[#fcfbf9] hover:bg-white transition-all group border border-slate-100">
                      <td className="p-8 text-center text-slate-300 font-black text-2xl">{idx + 1}</td>
                      <td className="p-6"><textarea value={k.area} onChange={e => updateKra(k.id, 'area', e.target.value)} disabled={!canEditEmployee} className="w-full bg-white border border-slate-200 rounded-2xl p-6 text-emerald-950 focus:ring-1 focus:ring-emerald-500 outline-none h-32 text-sm leading-relaxed" placeholder="Define KRA..." /></td>
                      <td className="p-6"><input type="number" value={k.weight} onChange={e => updateKra(k.id, 'weight', Number(e.target.value))} disabled={!canEditEmployee} className="w-full bg-white border border-slate-200 rounded-2xl p-6 text-center font-black text-2xl text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none" /></td>
                      <td className="p-6"><textarea value={k.objectives} onChange={e => updateKra(k.id, 'objectives', e.target.value)} disabled={!canEditEmployee} className="w-full bg-white border border-slate-200 rounded-2xl p-6 text-emerald-900 outline-none h-32 text-sm resize-none" /></td>
                      <td className="p-6"><textarea value={k.expectation || ''} onChange={e => updateKra(k.id, 'expectation', e.target.value)} disabled={!canEditEmployee} className="w-full bg-white border border-slate-200 rounded-2xl p-6 text-emerald-900 outline-none h-32 text-sm resize-none" /></td>
                      {['o','e','vg','g','f','p'].map(key => (
                        <td key={key} className="p-2 text-center"><input value={(k.criteria as any)[key]} onChange={e => updateCriteria(k.id, key as any, e.target.value)} disabled={!canEditEmployee} className="w-14 bg-transparent border-b-2 border-slate-100 text-center text-emerald-900 hover:border-emerald-500 transition-colors uppercase font-bold" /></td>
                      ))}
                      <td className="p-6"><textarea value={k.kpis} onChange={e => updateKra(k.id, 'kpis', e.target.value)} disabled={!canEditEmployee} className="w-full bg-white border border-slate-200 rounded-2xl p-6 text-emerald-900 outline-none h-32 text-sm resize-none" /></td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50 shadow-inner">
                    <td colSpan={2} className="p-12 text-right font-black uppercase text-emerald-900/50 text-[11px] tracking-[0.4em]">Total Aggregated Weight:</td>
                    <td className={`p-12 text-center text-4xl font-black ${totalWeight === 100 ? 'text-emerald-900' : 'text-red-600 animate-pulse'}`}>{totalWeight}%</td>
                    <td colSpan={8} className="p-12">
                       {totalWeight === 100 ? (
                         <p className="text-emerald-800 font-bold uppercase text-[10px] tracking-widest flex items-center gap-3"><span className="w-6 h-6 bg-emerald-800 text-white rounded-full flex items-center justify-center text-[10px]">✓</span> Validation Passed</p>
                       ) : (
                         <p className="text-red-700 font-bold uppercase text-[10px] tracking-widest flex items-center gap-3">! Rebalance to 100% to Finalize</p>
                       )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <footer className="p-16 bg-white border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-6">
          <button onClick={onClose} className="px-14 py-6 bg-slate-100 text-slate-500 font-black rounded-3xl hover:bg-slate-200 transition-all text-[11px] uppercase tracking-widest">Cancel Session</button>
          {isEmployee && isDraft && (
            <>
              <button onClick={() => handleSubmit(FormStatus.DRAFT)} className="px-14 py-6 bg-white border border-slate-200 text-emerald-900 font-black rounded-3xl hover:bg-slate-50 transition-all text-[11px] uppercase tracking-widest">Sync Progress</button>
              <button onClick={() => handleSubmit(FormStatus.SUBMITTED)} disabled={totalWeight !== 100} className={`px-24 py-6 font-black rounded-3xl shadow-2xl transition-all text-[11px] uppercase tracking-[0.3em] ${totalWeight === 100 ? 'btn-majestic' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>Finalize Contract</button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
};

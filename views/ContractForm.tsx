
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import { PerformanceContract, FormStatus, KRAEntry, UserRole } from '../types';

export const ContractForm: React.FC<{ onClose: () => void, initialData?: PerformanceContract }> = ({ onClose, initialData }) => {
  const { currentUser, upsertContract } = useAppContext();

  // Initialization logic
  const [contract, setContract] = useState<Partial<PerformanceContract>>(initialData || {
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
    supervisorFirstName: 'John',
    supervisorSurname: 'Adewale',
    supervisorIppis: 'IP-2001',
    supervisorEmail: 'john.adewale@walpberry.com',
    supervisorDesignation: 'Senior Project Manager',
    supervisorDepartment: 'Engineering',
    officerFirstName: 'Victor',
    officerSurname: 'Idowu',
    officerIppis: 'IP-1001',
    officerDesignation: 'Chief Technology Officer',
    kraEntries: [],
    employeeSigned: false,
    supervisorSigned: false,
    officerSigned: false,
    status: FormStatus.DRAFT,
    isActive: true,
  });

  const isEmployee = currentUser?.role === UserRole.EMPLOYEE;
  const isPM = currentUser?.role === UserRole.PM;
  const isCTO = currentUser?.role === UserRole.CTO;
  
  const isDraft = contract.status === FormStatus.DRAFT;
  const isSubmitted = contract.status === FormStatus.SUBMITTED;
  const isApproved = contract.status === FormStatus.APPROVED;

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
      kpis: '',
      target: 0,
      unit: 'Percentage'
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

  const handleSubmit = (nextStatus: FormStatus) => {
    if (nextStatus === FormStatus.SUBMITTED && totalWeight !== 100) {
      alert(`Total weight must be 100%. Current total: ${totalWeight}%`);
      return;
    }

    const payload: PerformanceContract = {
      ...contract as PerformanceContract,
      status: nextStatus,
      updatedAt: Date.now(),
      employeeSignedDate: contract.employeeSigned && !contract.employeeSignedDate ? Date.now() : contract.employeeSignedDate,
      supervisorSignedDate: contract.supervisorSigned && !contract.supervisorSignedDate ? Date.now() : contract.supervisorSignedDate,
      officerSignedDate: contract.officerSigned && !contract.officerSignedDate ? Date.now() : contract.officerSignedDate,
    };
    upsertContract(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 glass-modal flex items-center justify-center p-2 md:p-4">
      <div className="bg-slate-900 border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] w-[96vw] md:w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
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
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">A</span>
              Appraisal / Contract Period
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-6 rounded-3xl border border-white/5">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Start Date</label>
                <input 
                  type="date" 
                  value={contract.periodFrom} 
                  onChange={e => setContract({...contract, periodFrom: e.target.value})}
                  disabled={!canEditMain}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">End Date</label>
                <input 
                  type="date" 
                  value={contract.periodTo} 
                  onChange={e => setContract({...contract, periodTo: e.target.value})}
                  disabled={!canEditMain}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
              </div>
            </div>
          </section>

          {/* SECTION B: EMPLOYEE IDENTIFICATION */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">B</span>
              Employee Identification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-white/5 p-6 rounded-3xl border border-white/5">
              <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Surname</label><p className="font-bold text-white">{contract.employeeSurname}</p></div>
              <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">First Name</label><p className="font-bold text-white">{contract.employeeFirstName}</p></div>
              <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Other Names</label><p className="font-bold text-white">{contract.employeeOtherNames || 'N/A'}</p></div>
              <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">IPPIS Number</label><p className="font-bold text-white">{contract.employeeIppis}</p></div>
              <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Designation</label><p className="font-bold text-white">{contract.employeeDesignation}</p></div>
              <div><label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Department</label><p className="font-bold text-white">{contract.employeeDepartment}</p></div>
            </div>
          </section>

          {/* SECTION C & D: SUPERVISOR & OFFICER */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="space-y-6">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">C</span>
                Supervisor Details
              </h3>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                <p className="text-sm font-bold text-slate-100">{contract.supervisorFirstName} {contract.supervisorSurname}</p>
                <p className="text-xs text-slate-400">{contract.supervisorDesignation} • {contract.supervisorDepartment}</p>
                <p className="text-[10px] text-slate-500">ID: {contract.supervisorIppis}</p>
              </div>
            </section>
            <section className="space-y-6">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">D</span>
                Counter-Signing Officer
              </h3>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
                <p className="text-sm font-bold text-slate-100">{contract.officerFirstName} {contract.officerSurname}</p>
                <p className="text-xs text-slate-400">{contract.officerDesignation}</p>
                <p className="text-[10px] text-slate-500">ID: {contract.officerIppis}</p>
              </div>
            </section>
          </div>

          {/* SECTION E: KEY RESULT AREAS (KRAs) & OBJECTIVES */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">E</span>
                KRAs & Objectives
              </h3>
              {canEditMain && (
                <button onClick={addKra} className="bg-indigo-600/20 text-indigo-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 hover:bg-indigo-600/30 transition-all">+ Add Row</button>
              )}
            </div>
            
            <div className="overflow-x-auto border border-white/10 rounded-3xl bg-white/5">
              <table className="w-full text-left text-xs min-w-[1000px]">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-5 py-4 font-black text-slate-500 uppercase tracking-widest w-12 text-center">S/N</th>
                    <th className="px-5 py-4 font-black text-slate-500 uppercase tracking-widest w-48">KRA</th>
                    <th className="px-5 py-4 font-black text-slate-500 uppercase tracking-widest">Objectives</th>
                    <th className="px-5 py-4 font-black text-slate-500 uppercase tracking-widest w-24 text-center">Weight%</th>
                    <th className="px-5 py-4 font-black text-slate-500 uppercase tracking-widest">KPIs</th>
                    <th className="px-5 py-4 font-black text-slate-500 uppercase tracking-widest w-24 text-center">Target</th>
                    <th className="px-5 py-4 font-black text-slate-500 uppercase tracking-widest w-36">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(contract.kraEntries || []).map((k, idx) => (
                    <tr key={k.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 text-center text-slate-500 font-black">{idx + 1}</td>
                      <td className="p-2"><input value={k.area} onChange={e => updateKra(k.id, 'area', e.target.value)} disabled={!canEditMain} className="w-full bg-transparent p-3 text-slate-200 focus:ring-1 focus:ring-indigo-500 rounded-lg outline-none" /></td>
                      <td className="p-2"><textarea value={k.objectives} onChange={e => updateKra(k.id, 'objectives', e.target.value)} disabled={!canEditMain} className="w-full bg-transparent p-3 text-slate-200 focus:ring-1 focus:ring-indigo-500 rounded-lg outline-none resize-none h-20" /></td>
                      <td className="p-2"><input type="number" value={k.weight} onChange={e => updateKra(k.id, 'weight', Number(e.target.value))} disabled={!canEditMain} className="w-full bg-transparent p-3 text-center font-black text-white focus:ring-1 focus:ring-indigo-500 rounded-lg outline-none" /></td>
                      <td className="p-2"><textarea value={k.kpis} onChange={e => updateKra(k.id, 'kpis', e.target.value)} disabled={!canEditMain} className="w-full bg-transparent p-3 text-slate-200 focus:ring-1 focus:ring-indigo-500 rounded-lg outline-none resize-none h-20" /></td>
                      <td className="p-2"><input type="number" value={k.target} onChange={e => updateKra(k.id, 'target', Number(e.target.value))} disabled={!canEditMain} className="w-full bg-transparent p-3 text-center font-black text-white focus:ring-1 focus:ring-indigo-500 rounded-lg outline-none" /></td>
                      <td className="p-2">
                        <select value={k.unit} onChange={e => updateKra(k.id, 'unit', e.target.value)} disabled={!canEditMain} className="w-full bg-slate-900/50 p-3 text-slate-300 focus:ring-1 focus:ring-indigo-500 rounded-lg outline-none border-none">
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
                    <td colSpan={3} className="px-5 py-4 text-right font-black text-slate-500 uppercase">Total Weight Sum:</td>
                    <td className={`px-5 py-4 text-center font-black text-lg ${totalWeight === 100 ? 'text-emerald-400' : 'text-red-400'}`}>{totalWeight}%</td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* SECTION F: EMPLOYEE DECLARATION */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">F</span>
              Employee Declaration
            </h3>
            <div className="bg-white/5 p-8 rounded-3xl border border-white/5 space-y-6">
              <div className="flex items-start gap-4">
                <input 
                  type="checkbox" 
                  checked={contract.employeeSigned} 
                  onChange={e => setContract({...contract, employeeSigned: e.target.checked})}
                  disabled={!isEmployee || !isDraft}
                  className="w-6 h-6 rounded-lg mt-1 bg-slate-900 border-white/10 text-indigo-600"
                />
                <p className="text-sm text-slate-400 leading-relaxed italic">
                  I, <span className="text-white font-bold">{contract.employeeFirstName} {contract.employeeSurname}</span>, hereby declare that I have discussed and agreed on the performance objectives and targets defined in this contract for the appraisal period.
                </p>
              </div>
              {contract.employeeSignedDate && (
                <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest">Signed on: {new Date(contract.employeeSignedDate).toLocaleDateString()}</p>
              )}
            </div>
          </section>

          {/* SECTION G: SUPERVISOR DECLARATION */}
          {(isPM || isSubmitted || isApproved) && (
            <section className="space-y-6">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">G</span>
                Supervisor Declaration
              </h3>
              <div className="bg-white/5 p-8 rounded-3xl border border-white/5 space-y-6">
                <div className="flex items-start gap-4">
                  <input 
                    type="checkbox" 
                    checked={contract.supervisorSigned} 
                    onChange={e => setContract({...contract, supervisorSigned: e.target.checked})}
                    disabled={!isPM || !isSubmitted}
                    className="w-6 h-6 rounded-lg mt-1 bg-slate-900 border-white/10 text-indigo-600"
                  />
                  <p className="text-sm text-slate-400 leading-relaxed italic">
                    I, <span className="text-white font-bold">{contract.supervisorFirstName} {contract.supervisorSurname}</span>, confirm that the objectives and targets set in this contract have been reviewed and aligned with organizational goals.
                  </p>
                </div>
                {contract.supervisorSignedDate && (
                  <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest">Validated on: {new Date(contract.supervisorSignedDate).toLocaleDateString()}</p>
                )}
              </div>
            </section>
          )}

          {/* SECTION H: COUNTER-SIGNING OFFICER DECLARATION */}
          {(isCTO || isApproved) && (
            <section className="space-y-6">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">H</span>
                Counter-Signing Officer Declaration
              </h3>
              <div className="bg-white/5 p-8 rounded-3xl border border-white/5 space-y-6">
                <div className="flex items-start gap-4">
                  <input 
                    type="checkbox" 
                    checked={contract.officerSigned} 
                    onChange={e => setContract({...contract, officerSigned: e.target.checked})}
                    disabled={!isCTO || !isSubmitted}
                    className="w-6 h-6 rounded-lg mt-1 bg-slate-900 border-white/10 text-indigo-600"
                  />
                  <p className="text-sm text-slate-400 leading-relaxed italic">
                    Final confirmation provided for organizational record and compliance.
                  </p>
                </div>
                {contract.officerSignedDate && (
                  <p className="text-[10px] text-amber-400 uppercase font-bold tracking-widest">Certified on: {new Date(contract.officerSignedDate).toLocaleDateString()}</p>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 md:p-10 bg-white/5 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
          {isEmployee && isDraft && (
            <>
              <button onClick={() => handleSubmit(FormStatus.DRAFT)} className="px-10 py-4 bg-white/5 border border-white/10 text-slate-400 font-black rounded-2xl hover:bg-white/10 transition-all text-[10px] uppercase tracking-[0.2em]">Save as Draft</button>
              <button onClick={() => handleSubmit(FormStatus.SUBMITTED)} className="px-12 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 shadow-2xl transition-all text-[10px] uppercase tracking-[0.2em] shimmer-container">Agree & Submit</button>
            </>
          )}
          {isPM && isSubmitted && (
             <button onClick={() => handleSubmit(FormStatus.SUBMITTED)} className="px-12 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 shadow-2xl transition-all text-[10px] uppercase tracking-[0.2em]">Save Supervisor Review</button>
          )}
          {isCTO && isSubmitted && (
            <button onClick={() => handleSubmit(FormStatus.APPROVED)} className="px-12 py-4 bg-amber-600 text-white font-black rounded-2xl hover:bg-amber-500 shadow-2xl transition-all text-[10px] uppercase tracking-[0.2em] shimmer-container">Final Approval & Lock</button>
          )}
          {!isDraft && (isEmployee || (isPM && !isSubmitted) || (isCTO && isApproved)) && (
            <button onClick={onClose} className="px-10 py-4 bg-white/5 border border-white/10 text-slate-400 font-black rounded-2xl hover:bg-white/10 transition-all text-[10px] uppercase tracking-[0.2em]">Exit View</button>
          )}
        </div>
      </div>
    </div>
  );
};

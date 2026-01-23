
import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { PerformanceContract, FormStatus, KRAEntry } from '../types';

export const ContractForm: React.FC<{ onClose: () => void, initialData?: PerformanceContract }> = ({ onClose, initialData }) => {
  const { currentUser, upsertContract } = useAppContext();
  const [periodFrom, setPeriodFrom] = useState(initialData?.periodFrom || '');
  const [periodTo, setPeriodTo] = useState(initialData?.periodTo || '');
  const [kraEntries, setKraEntries] = useState<KRAEntry[]>(initialData?.kraEntries || []);

  const addKra = () => {
    setKraEntries([...kraEntries, { 
      id: Math.random().toString(36).substr(2, 9), 
      area: '', objectives: '', weight: 0, kpis: '', target: 0, unit: 'Percentage' 
    }]);
  };

  const updateKra = (id: string, field: keyof KRAEntry, value: any) => {
    setKraEntries(kraEntries.map(k => k.id === id ? { ...k, [field]: value } : k));
  };

  const handleSubmit = (status: FormStatus) => {
    const contract: PerformanceContract = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      employeeId: currentUser?.id || '',
      periodFrom,
      periodTo,
      kraEntries,
      status,
      updatedAt: Date.now(),
    };
    upsertContract(contract);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white">
          <h2 className="text-xl font-bold">Performance Contract Form</h2>
          <button onClick={onClose} className="hover:bg-indigo-700 p-2 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 border-b pb-2 uppercase text-sm tracking-wider">Contract Period</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">From</label>
                  <input type="date" value={periodFrom} onChange={e => setPeriodFrom(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">To</label>
                  <input type="date" value={periodTo} onChange={e => setPeriodTo(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 border-b pb-2 uppercase text-sm tracking-wider">Employee Snapshot</h3>
              <p className="text-sm text-slate-600"><span className="font-bold">Name:</span> {currentUser?.name}</p>
              <p className="text-sm text-slate-600"><span className="font-bold">IPPIS:</span> {currentUser?.ippisNumber}</p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wider">Key Result Areas (KRAs)</h3>
              <button onClick={addKra} className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:text-indigo-800">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add KRA
              </button>
            </div>
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-bold border-b">Area</th>
                    <th className="px-4 py-3 font-bold border-b">Objectives</th>
                    <th className="px-4 py-3 font-bold border-b w-24">Weight %</th>
                    <th className="px-4 py-3 font-bold border-b">KPIs</th>
                    <th className="px-4 py-3 font-bold border-b w-24">Target</th>
                    <th className="px-4 py-3 font-bold border-b w-32">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {kraEntries.map(k => (
                    <tr key={k.id}>
                      <td className="p-2"><input value={k.area} onChange={e => updateKra(k.id, 'area', e.target.value)} className="w-full p-2 border rounded" placeholder="KRA name" /></td>
                      <td className="p-2"><textarea value={k.objectives} onChange={e => updateKra(k.id, 'objectives', e.target.value)} className="w-full p-2 border rounded" rows={1} /></td>
                      <td className="p-2"><input type="number" value={k.weight} onChange={e => updateKra(k.id, 'weight', Number(e.target.value))} className="w-full p-2 border rounded" /></td>
                      <td className="p-2"><textarea value={k.kpis} onChange={e => updateKra(k.id, 'kpis', e.target.value)} className="w-full p-2 border rounded" rows={1} /></td>
                      <td className="p-2"><input type="number" value={k.target} onChange={e => updateKra(k.id, 'target', Number(e.target.value))} className="w-full p-2 border rounded" /></td>
                      <td className="p-2">
                        <select value={k.unit} onChange={e => updateKra(k.id, 'unit', e.target.value)} className="w-full p-2 border rounded">
                          <option>Percentage</option>
                          <option>Number</option>
                          <option>Rating</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
          <button onClick={() => handleSubmit(FormStatus.DRAFT)} className="px-6 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300">Save Draft</button>
          <button onClick={() => handleSubmit(FormStatus.SUBMITTED)} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100">Submit Contract</button>
        </div>
      </div>
    </div>
  );
};

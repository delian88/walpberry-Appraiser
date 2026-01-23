
import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { UserRole, FormStatus, PerformanceContract, AnnualAppraisal, MonthlyReview } from '../types';
import { ContractForm } from './ContractForm';
import { AppraisalForm } from './AppraisalForm';
import { MonthlyReviewForm } from './MonthlyReviewForm';
import { Certificate } from './Certificate';

type Tab = 'CONTRACT' | 'MONTHLY' | 'ANNUAL';

export const Dashboard: React.FC = () => {
  const { currentUser, contracts, appraisals, monthlyReviews, logout, upsertContract } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>('CONTRACT');
  const [showContractModal, setShowContractModal] = useState(false);
  const [showAppraisalModal, setShowAppraisalModal] = useState(false);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [selectedMonthly, setSelectedMonthly] = useState<MonthlyReview | undefined>(undefined);
  const [viewingCert, setViewingCert] = useState<AnnualAppraisal | null>(null);

  if (!currentUser) return null;

  const isEmployee = currentUser.role === UserRole.EMPLOYEE;
  const isPM = currentUser.role === UserRole.PM;
  const isCTO = currentUser.role === UserRole.CTO;

  const userContracts = contracts.filter(c => isEmployee ? c.employeeId === currentUser.id : true);
  const userAppraisals = appraisals.filter(a => isEmployee ? a.employeeId === currentUser.id : true);
  const userMonthly = monthlyReviews.filter(r => isEmployee ? r.employeeId === currentUser.id : true);

  const handleApproveContract = (contract: PerformanceContract) => {
    upsertContract({ ...contract, status: FormStatus.APPROVED });
  };

  const handleOpenMonthly = (review?: MonthlyReview) => {
    setSelectedMonthly(review);
    setShowMonthlyModal(true);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col border-r border-slate-800">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold italic text-2xl shadow-inner">W</div>
          <span className="font-bold text-lg tracking-tight">Walpberry <span className="text-indigo-400">Appraiser</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          {(['CONTRACT', 'MONTHLY', 'ANNUAL'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-3 ${activeTab === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <div className={`w-2 h-2 rounded-full ${activeTab === t ? 'bg-white' : 'bg-slate-700'}`}></div>
              {t.charAt(0) + t.slice(1).toLowerCase()} Phase
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-800 mt-auto">
          <div className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-700/50">
            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-widest">Signed in as</p>
            <p className="font-bold text-sm text-indigo-300 truncate">{currentUser.name}</p>
            <p className="text-[10px] text-slate-400 font-medium">{currentUser.role.replace('_', ' ')}</p>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 text-slate-500 hover:text-red-400 font-bold text-sm transition-colors px-4 py-2 rounded-lg hover:bg-red-400/10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">{activeTab} DASHBOARD</h1>
              <p className="text-slate-500 mt-1 font-medium">Manage performance {activeTab.toLowerCase()} workflows.</p>
            </div>
            <div className="flex gap-3">
              {activeTab === 'CONTRACT' && isEmployee && (
                <button onClick={() => setShowContractModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:scale-105 transition-all">+ Create Contract</button>
              )}
              {activeTab === 'MONTHLY' && isEmployee && (
                <button onClick={() => handleOpenMonthly()} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-slate-200 hover:scale-105 transition-all">+ New Monthly Review</button>
              )}
              {activeTab === 'ANNUAL' && isEmployee && (
                <button onClick={() => setShowAppraisalModal(true)} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 hover:scale-105 transition-all">+ Start Appraisal</button>
              )}
            </div>
          </div>

          {activeTab === 'CONTRACT' && (
            <div className="grid grid-cols-1 gap-4">
              {userContracts.length === 0 && <div className="text-center py-20 bg-white border border-dashed rounded-3xl text-slate-400">No active contracts found for this period.</div>}
              {userContracts.map(c => (
                <div key={c.id} className="bg-white p-6 rounded-3xl border shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                     </div>
                     <div>
                        <p className="font-black text-slate-800">Performance Contract {new Date(c.updatedAt).getFullYear()}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Valid: {c.periodFrom} to {c.periodTo}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${c.status === FormStatus.APPROVED ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{c.status}</span>
                    {isPM && c.status === FormStatus.SUBMITTED && (
                      <button onClick={() => handleApproveContract(c)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md">Approve Contract</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'MONTHLY' && (
            <div className="grid grid-cols-1 gap-4">
              {userMonthly.length === 0 && <div className="text-center py-20 bg-white border border-dashed rounded-3xl text-slate-400">No monthly progress logs found. Log your first review to track progress.</div>}
              {userMonthly.map(m => (
                <div key={m.id} className="bg-white p-6 rounded-3xl border shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                     </div>
                     <div>
                        <p className="font-black text-slate-800">Progress Log - {new Date(m.todayDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{m.tasks.length} Tasks Tracked • Last Review: {m.lastReviewDate || 'Initial'}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${m.status === FormStatus.SUBMITTED ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>{m.status}</span>
                    <button onClick={() => handleOpenMonthly(m)} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ANNUAL' && (
            <div className="grid grid-cols-1 gap-4">
               {userAppraisals.length === 0 && <div className="text-center py-20 bg-white border border-dashed rounded-3xl text-slate-400">Annual appraisal cycle has not been initiated.</div>}
               {userAppraisals.map(a => (
                <div key={a.id} className="bg-white p-6 rounded-3xl border shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     </div>
                     <div>
                        <p className="font-black text-slate-800">Score: {a.totalScore.toFixed(1)}% ({a.finalRating})</p>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Status: {a.status}</p>
                     </div>
                  </div>
                  <div>
                    {a.status === FormStatus.CERTIFIED && (
                      <button onClick={() => setViewingCert(a)} className="bg-amber-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-amber-700 shadow-md transition-all">View Certificate</button>
                    )}
                    {(isPM || isCTO) && a.status === FormStatus.SUBMITTED && (
                      <button onClick={() => setShowAppraisalModal(true)} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all">Review & Approve</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showContractModal && <ContractForm onClose={() => setShowContractModal(false)} />}
      {showAppraisalModal && <AppraisalForm onClose={() => setShowAppraisalModal(false)} />}
      {showMonthlyModal && <MonthlyReviewForm onClose={() => setShowMonthlyModal(false)} initialData={selectedMonthly} />}
      {viewingCert && <Certificate appraisal={viewingCert as any} onClose={() => setViewingCert(null)} />}
    </div>
  );
};

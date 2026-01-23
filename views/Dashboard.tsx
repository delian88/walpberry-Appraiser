
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../store/AppContext';
import { UserRole, FormStatus, PerformanceContract, AnnualAppraisal, MonthlyReview } from '../types';
import { ContractForm } from './ContractForm';
import { AppraisalForm } from './AppraisalForm';
import { MonthlyReviewForm } from './MonthlyReviewForm';
import { Certificate } from './Certificate';
import { HRDashboard } from './HRDashboard';

type Tab = 'CONTRACT' | 'MONTHLY' | 'ANNUAL' | 'HR';

export const Dashboard: React.FC = () => {
  const { currentUser, contracts, appraisals, monthlyReviews, logout, upsertContract, showToast } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>(currentUser?.role === UserRole.ADMIN ? 'HR' : 'CONTRACT');
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<PerformanceContract | undefined>(undefined);
  const [showAppraisalModal, setShowAppraisalModal] = useState(false);
  const [selectedAppraisal, setSelectedAppraisal] = useState<AnnualAppraisal | undefined>(undefined);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [selectedMonthly, setSelectedMonthly] = useState<MonthlyReview | undefined>(undefined);
  const [viewingCert, setViewingCert] = useState<AnnualAppraisal | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const phase = params.get('phase') as Tab | null;
    const id = params.get('id');

    if (phase && id) {
      setActiveTab(phase);
      if (phase === 'CONTRACT') {
        const item = contracts.find(c => c.id === id);
        if (item) {
          setSelectedContract(item);
          setShowContractModal(true);
        }
      } else if (phase === 'MONTHLY') {
        const item = monthlyReviews.find(m => m.id === id);
        if (item) {
          setSelectedMonthly(item);
          setShowMonthlyModal(true);
        }
      } else if (phase === 'ANNUAL') {
        const item = appraisals.find(a => a.id === id);
        if (item) {
          setSelectedAppraisal(item);
          setShowAppraisalModal(true);
        }
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [contracts, monthlyReviews, appraisals]);

  if (!currentUser) return null;

  const isEmployee = currentUser.role === UserRole.EMPLOYEE;
  const isPM = currentUser.role === UserRole.PM;
  const isCTO = currentUser.role === UserRole.CTO;
  const isAdmin = currentUser.role === UserRole.ADMIN;

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

  const handleShare = (phase: Tab, id: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?phase=${phase}&id=${id}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast("Deep Link Copied to Clipboard");
    });
  };

  const menuItems: Tab[] = isAdmin ? ['HR', 'CONTRACT', 'MONTHLY', 'ANNUAL'] : ['CONTRACT', 'MONTHLY', 'ANNUAL'];

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-slate-200 overflow-x-hidden">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 glass-card border-x-0 border-t-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl flex items-center justify-center font-black italic text-xl shadow-lg">W</div>
          <span className="font-black text-lg tracking-tight">Walpberry</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white/5 rounded-xl border border-white/10"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </header>

      {/* Sidebar (Desktop) */}
      <aside className="w-72 glass-card m-6 rounded-[2rem] hidden md:flex flex-col border-white/10 p-8 sticky top-6 h-[calc(100vh-3rem)]">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center font-black italic text-2xl shadow-lg shadow-emerald-500/20">W</div>
          <div>
            <span className="font-black text-xl tracking-tight block text-white">Walpberry</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-bold">Appraiser</span>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          {menuItems.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition-all text-sm flex items-center gap-4 ${activeTab === t ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              <div className={`w-2 h-2 rounded-full ${activeTab === t ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-700'}`}></div>
              {t === 'HR' ? 'HR Central' : t.charAt(0) + t.slice(1).toLowerCase() + ' Phase'}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/5 mt-auto">
          <div className="bg-white/5 rounded-2xl p-5 mb-6 border border-white/5">
            <p className="text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Active Profile</p>
            <p className="font-bold text-sm text-slate-100 truncate">{currentUser.name}</p>
            <p className="text-[10px] text-emerald-400/80 font-bold tracking-wider">{currentUser.role.replace('_', ' ')}</p>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 text-slate-500 hover:text-red-400 font-bold text-sm transition-all px-5 py-3 rounded-2xl hover:bg-red-400/10 group">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 md:mb-12">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none uppercase text-transition">{activeTab === 'HR' ? 'HR Central' : activeTab}</h1>
              <p className="text-slate-400 mt-2 font-medium text-sm md:text-base">
                {activeTab === 'HR' ? 'Complete organizational oversight and user management.' : 'Sequential performance approval workflow.'}
              </p>
            </div>
            <div className="flex w-full sm:w-auto gap-4">
              {activeTab === 'CONTRACT' && isEmployee && (
                <button onClick={() => { setSelectedContract(undefined); setShowContractModal(true); }} className="flex-1 sm:flex-none bg-emerald-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all shimmer-container text-sm md:text-base">+ Create Contract</button>
              )}
              {activeTab === 'MONTHLY' && isEmployee && (
                <button onClick={() => handleOpenMonthly()} className="flex-1 sm:flex-none bg-white text-emerald-900 px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold shadow-xl shadow-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all shimmer-container text-sm md:text-base">+ Log Progress</button>
              )}
              {activeTab === 'ANNUAL' && isEmployee && (
                <button onClick={() => { setSelectedAppraisal(undefined); setShowAppraisalModal(true); }} className="flex-1 sm:flex-none bg-emerald-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all shimmer-container text-sm md:text-base">+ Start Appraisal</button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {activeTab === 'HR' && <HRDashboard />}
            
            {activeTab === 'CONTRACT' && (
              <div className="glass-card rounded-3xl md:rounded-[2.5rem] overflow-hidden border-white/10 shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[850px]">
                    <thead className="bg-white/5 border-b border-white/5">
                      <tr>
                        <th className="px-6 md:px-8 py-4 md:py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Contract Detail</th>
                        <th className="px-6 md:px-8 py-4 md:py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Period</th>
                        <th className="px-6 md:px-8 py-4 md:py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center">Operation</th>
                        <th className="px-6 md:px-8 py-4 md:py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center">Workflow Status</th>
                        <th className="px-6 md:px-8 py-4 md:py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {userContracts.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-24 md:py-32 text-center text-slate-500 font-bold uppercase tracking-widest text-xs md:text-sm">No contracts found.</td>
                        </tr>
                      )}
                      {userContracts.map(c => (
                        <tr key={c.id} className="group hover:bg-white/5 transition-all">
                          <td className="px-6 md:px-8 py-4 md:py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-all">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              </div>
                              <div>
                                <span className="font-black text-white text-sm md:text-base block">Contract {new Date(c.updatedAt).getFullYear()}</span>
                                {!isEmployee && <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">{c.employeeFirstName} {c.employeeSurname}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 md:px-8 py-4 md:py-6">
                            <span className="text-[11px] md:text-xs text-slate-400 font-bold tracking-tight whitespace-nowrap">{c.periodFrom} — {c.periodTo}</span>
                          </td>
                          <td className="px-6 md:px-8 py-4 md:py-6 text-center">
                            <span className={`inline-block px-3 md:px-4 py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border transition-all ${
                              c.isActive 
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                                : 'bg-slate-800 text-slate-500 border-slate-700'
                            }`}>
                              {c.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 md:px-8 py-4 md:py-6 text-center">
                            <span className={`inline-block px-3 md:px-4 py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border ${
                              c.status === FormStatus.APPROVED 
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                : c.status === FormStatus.DRAFT 
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                  : 'bg-white/5 text-slate-400 border-white/10'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-6 md:px-8 py-4 md:py-6 text-right">
                            <div className="flex justify-end gap-2 md:gap-3">
                              <button onClick={() => handleShare('CONTRACT', c.id)} className="bg-white/5 text-emerald-400 p-2 rounded-xl hover:bg-emerald-500/20 transition-all border border-emerald-500/10 shadow-lg shadow-emerald-500/5">
                                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                              </button>
                              {isPM && c.status === FormStatus.SUBMITTED && (
                                <button onClick={() => handleApproveContract(c)} className="bg-emerald-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg">Approve</button>
                              )}
                              <button onClick={() => { setSelectedContract(c); setShowContractModal(true); }} className="bg-white/5 text-slate-400 p-2 rounded-xl hover:bg-white/10 hover:text-white transition-all border border-white/5">
                                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'MONTHLY' && (
              <>
                {userMonthly.length === 0 && <div className="text-center py-24 md:py-32 glass-card rounded-3xl md:rounded-[2.5rem] border-dashed border-white/10 text-slate-500 font-bold uppercase tracking-widest text-xs">No progress logs found.</div>}
                {userMonthly.map(m => (
                  <div key={m.id} className="glass-card p-5 md:p-8 rounded-3xl md:rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-emerald-500/30 transition-all hover:-translate-y-1 shimmer-container">
                    <div className="flex items-center gap-5 md:gap-8">
                       <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-emerald-400 flex-shrink-0">
                          <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                       </div>
                       <div className="min-w-0">
                          <p className="text-lg md:text-xl font-black text-white truncate">{new Date(m.todayDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} Review</p>
                          <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-[0.2em] font-bold mt-1">{m.tasks.length} Tasks Tracked • {new Date(m.updatedAt).toLocaleDateString()}</p>
                       </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-3 md:gap-6 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleShare('MONTHLY', m.id)} className="bg-white/5 text-emerald-400 p-3 rounded-xl hover:bg-emerald-500/20 transition-all border border-emerald-500/10">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        </button>
                        <span className={`px-4 py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest border ${m.status === FormStatus.SUBMITTED ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-slate-500 border-white/10'}`}>{m.status}</span>
                      </div>
                      <button onClick={() => handleOpenMonthly(m)} className="bg-white text-emerald-900 px-5 md:px-6 py-2.5 md:py-3 rounded-xl text-[10px] md:text-xs font-bold hover:bg-slate-200 transition-all">Inspect</button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'ANNUAL' && (
              <>
                {userAppraisals.length === 0 && <div className="text-center py-24 md:py-32 glass-card rounded-3xl md:rounded-[2.5rem] border-dashed border-white/10 text-slate-500 font-bold uppercase tracking-widest text-xs">Appraisal cycle not initiated.</div>}
                {userAppraisals.map(a => (
                  <div key={a.id} className="glass-card p-5 md:p-8 rounded-3xl md:rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-emerald-500/30 transition-all hover:-translate-y-1 shimmer-container">
                    <div className="flex items-center gap-5 md:gap-8">
                       <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform flex-shrink-0">
                          <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                       </div>
                       <div className="min-w-0">
                          <p className="text-lg md:text-xl font-black text-white truncate">{a.finalRating} Rating ({a.totalScore.toFixed(1)}%)</p>
                          <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-[0.2em] font-bold mt-1">Status: {a.status}</p>
                       </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-3 md:gap-6 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleShare('ANNUAL', a.id)} className="bg-white/5 text-emerald-400 p-3 rounded-xl hover:bg-emerald-500/20 transition-all border border-emerald-500/10">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        </button>
                        {a.status === FormStatus.CERTIFIED && (
                          <button onClick={() => setViewingCert(a)} className="flex-1 md:flex-none bg-gradient-to-br from-amber-500 to-orange-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl text-[10px] md:text-xs font-bold hover:shadow-lg hover:shadow-orange-500/20 transition-all">Certificate</button>
                        )}
                      </div>
                      {(isPM || isCTO || isAdmin) && a.status === FormStatus.SUBMITTED && (
                        <button onClick={() => { setSelectedAppraisal(a); setShowAppraisalModal(true); }} className="flex-1 md:flex-none bg-emerald-500 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl text-[10px] md:text-xs font-bold hover:bg-emerald-400 transition-all shadow-lg">Review</button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </main>

      {showContractModal && <ContractForm initialData={selectedContract} onClose={() => { setShowContractModal(false); setSelectedContract(undefined); }} />}
      {showAppraisalModal && <AppraisalForm initialData={selectedAppraisal} onClose={() => { setShowAppraisalModal(false); setSelectedAppraisal(undefined); }} />}
      {showMonthlyModal && <MonthlyReviewForm onClose={() => { setShowMonthlyModal(false); setSelectedMonthly(undefined); }} initialData={selectedMonthly} />}
      {viewingCert && <Certificate appraisal={viewingCert as any} onClose={() => setViewingCert(null)} />}
    </div>
  );
};

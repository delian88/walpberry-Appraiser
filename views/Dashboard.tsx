
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
  const { 
    currentUser, contracts, appraisals, monthlyReviews, logout, 
    upsertContract, showToast, isLoading, dbStatus, refreshData 
  } = useAppContext();
  
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

    if (!phase || !id) return;

    let found = false;
    const isDataLoaded = !isLoading;

    if (phase === 'CONTRACT') {
      const item = contracts.find(c => c.id === id);
      if (item) {
        setSelectedContract(item);
        setShowContractModal(true);
        setActiveTab('CONTRACT');
        found = true;
      }
    } else if (phase === 'MONTHLY') {
      const item = monthlyReviews.find(m => m.id === id);
      if (item) {
        setSelectedMonthly(item);
        setShowMonthlyModal(true);
        setActiveTab('MONTHLY');
        found = true;
      }
    } else if (phase === 'ANNUAL') {
      const item = appraisals.find(a => a.id === id);
      if (item) {
        setSelectedAppraisal(item);
        setShowAppraisalModal(true);
        setActiveTab('ANNUAL');
        found = true;
      }
    }

    if (found || isDataLoaded) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [contracts, monthlyReviews, appraisals, isLoading]);

  if (!currentUser) return null;

  const isEmployee = currentUser.role === UserRole.EMPLOYEE;
  const isPM = currentUser.role === UserRole.PM;
  const isCTO = currentUser.role === UserRole.CTO;
  const isAdmin = currentUser.role === UserRole.ADMIN;

  const userContracts = contracts.filter(c => isEmployee ? c.employeeId === currentUser.id : true);
  const userAppraisals = appraisals.filter(a => isEmployee ? a.employeeId === currentUser.id : true);
  const userMonthly = monthlyReviews.filter(r => isEmployee ? r.employeeId === currentUser.id : true);

  const handleApproveContract = async (contract: PerformanceContract) => {
    await upsertContract({ ...contract, status: FormStatus.APPROVED });
  };

  const handleOpenMonthly = (review?: MonthlyReview) => {
    setSelectedMonthly(review);
    setShowMonthlyModal(true);
  };

  const handleShare = (phase: Tab, id: string) => {
    const baseUrl = window.location.href.split('?')[0];
    const shareUrl = `${baseUrl}?phase=${phase}&id=${id}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast("Deep-link copied to clipboard!", "success");
    }).catch(err => {
      showToast("Copy failed", "error");
    });
  };

  const menuItems: Tab[] = isAdmin ? ['HR', 'CONTRACT', 'MONTHLY', 'ANNUAL'] : ['CONTRACT', 'MONTHLY', 'ANNUAL'];

  if (isLoading && contracts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6 animate-fade-in">
           <div className="w-16 h-16 border-[3px] border-emerald-500/10 border-t-emerald-400 rounded-full animate-spin mx-auto"></div>
           <p className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">Synchronizing Nodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row p-4 md:p-6 gap-6">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-80 premium-glass rounded-[2.5rem] p-8 flex flex-col shrink-0 animate-fade-in">
        <div className="flex items-center gap-4 mb-14">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center font-black italic text-2xl text-white shadow-xl shadow-emerald-500/20">W</div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white block">Walpberry</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`}></span>
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{dbStatus}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`w-full text-left px-6 py-4 rounded-2xl font-bold transition-all text-sm flex items-center gap-4 group ${activeTab === t ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full transition-all ${activeTab === t ? 'bg-emerald-400 scale-125' : 'bg-slate-700 group-hover:bg-slate-400'}`}></span>
              {t === 'HR' ? 'Organization' : t.charAt(0) + t.slice(1).toLowerCase() + ' Cycle'}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5 space-y-6">
          <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Active Profile</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold">{currentUser.name[0]}</div>
              <div className="min-w-0">
                <p className="font-bold text-white text-sm truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 font-bold truncate">{currentUser.role}</p>
              </div>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 text-slate-500 hover:text-red-400 font-bold text-xs transition-all px-6 py-4 rounded-2xl hover:bg-red-400/5 group border border-transparent hover:border-red-500/10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
            Sign Out Securely
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden pt-4 md:pt-0">
        <div className="max-w-6xl mx-auto space-y-10">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="animate-slide-up">
              <h1 className="text-4xl font-black text-white tracking-tight uppercase">{activeTab === 'HR' ? 'HR Central' : activeTab}</h1>
              <p className="text-slate-400 text-sm mt-1 font-medium">Managing the enterprise performance lifecycle.</p>
            </div>
            <div className="flex w-full sm:w-auto gap-3 animate-fade-in">
              {activeTab === 'CONTRACT' && isEmployee && (
                <button onClick={() => { setSelectedContract(undefined); setShowContractModal(true); }} className="flex-1 sm:flex-none btn-tactile bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/10">+ New Contract</button>
              )}
              {activeTab === 'MONTHLY' && isEmployee && (
                <button onClick={() => handleOpenMonthly()} className="flex-1 sm:flex-none btn-tactile bg-white text-emerald-950 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-white/5">+ Monthly Log</button>
              )}
              {activeTab === 'ANNUAL' && isEmployee && (
                <button onClick={() => { setSelectedAppraisal(undefined); setShowAppraisalModal(true); }} className="flex-1 sm:flex-none btn-tactile bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/10">+ Start Review</button>
              )}
            </div>
          </header>

          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {activeTab === 'HR' && <HRDashboard />}
            
            {activeTab === 'CONTRACT' && (
              <div className="premium-glass rounded-[2.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[900px]">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/5">
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Document</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Effective Period</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {userContracts.length === 0 && (
                        <tr><td colSpan={4} className="py-24 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">No contract data found.</td></tr>
                      )}
                      {userContracts.map(c => (
                        <tr key={c.id} className="group hover:bg-white/[0.03] transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-all">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              </div>
                              <div>
                                <span className="font-bold text-white text-base block">{new Date(c.updatedAt).getFullYear()} Contract</span>
                                {!isEmployee && <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{c.employeeFirstName} {c.employeeSurname}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 font-medium text-slate-400 text-sm">{c.periodFrom} — {c.periodTo}</td>
                          <td className="px-8 py-6 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              c.status === FormStatus.APPROVED ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/5' : 'bg-white/5 text-slate-500 border-white/10'
                            }`}>{c.status}</span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleShare('CONTRACT', c.id)} className="p-3 bg-white/5 border border-white/5 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition-all">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                              </button>
                              <button onClick={() => { setSelectedContract(c); setShowContractModal(true); }} className="p-3 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
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
              <div className="grid grid-cols-1 gap-4">
                {userMonthly.length === 0 && <div className="text-center py-20 premium-glass rounded-[2.5rem] border-dashed border-white/10 text-slate-500 font-bold text-sm">No activity logs recorded.</div>}
                {userMonthly.map(m => (
                  <div key={m.id} className="premium-card p-8 rounded-[2.5rem] flex items-center justify-between group">
                    <div className="flex items-center gap-8">
                       <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-400 border border-emerald-500/10">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                       </div>
                       <div>
                          <p className="text-xl font-black text-white">{new Date(m.todayDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} Review</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{m.tasks.length} Responsibilities Tracked</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${m.status === FormStatus.SUBMITTED ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-slate-500 border-white/10'}`}>{m.status}</span>
                      <button onClick={() => handleOpenMonthly(m)} className="bg-white text-emerald-950 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-all">Inspect</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'ANNUAL' && (
              <div className="grid grid-cols-1 gap-4">
                {userAppraisals.length === 0 && <div className="text-center py-20 premium-glass rounded-[2.5rem] border-dashed border-white/10 text-slate-500 font-bold text-sm">Appraisal cycle not initiated.</div>}
                {userAppraisals.map(a => (
                  <div key={a.id} className="premium-card p-8 rounded-[2.5rem] flex items-center justify-between group">
                    <div className="flex items-center gap-8">
                       <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-400 border border-emerald-500/10 group-hover:scale-110 transition-transform">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                       </div>
                       <div>
                          <p className="text-xl font-black text-white">{a.finalRating} Quality • {a.totalScore.toFixed(1)}%</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Lifecycle State: {a.status}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {a.status === FormStatus.CERTIFIED && (
                        <button onClick={() => setViewingCert(a)} className="bg-gradient-to-tr from-amber-500 to-orange-400 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg shadow-orange-500/20 transition-all">Certificate</button>
                      )}
                      {(isPM || isCTO || isAdmin) && a.status === FormStatus.SUBMITTED && (
                        <button onClick={() => { setSelectedAppraisal(a); setShowAppraisalModal(true); }} className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all">Review</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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

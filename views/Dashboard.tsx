
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
    upsertContract, showToast, isLoading, dbStatus 
  } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<Tab>(currentUser?.role === UserRole.ADMIN ? 'HR' : 'CONTRACT');
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<PerformanceContract | undefined>(undefined);
  const [showAppraisalModal, setShowAppraisalModal] = useState(false);
  const [selectedAppraisal, setSelectedAppraisal] = useState<AnnualAppraisal | undefined>(undefined);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [selectedMonthly, setSelectedMonthly] = useState<MonthlyReview | undefined>(undefined);
  const [viewingCert, setViewingCert] = useState<AnnualAppraisal | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const phase = params.get('phase') as Tab | null;
    const id = params.get('id');

    if (!phase || !id) return;

    let found = false;
    if (phase === 'CONTRACT') {
      const item = contracts.find(c => c.id === id);
      if (item) { setSelectedContract(item); setShowContractModal(true); setActiveTab('CONTRACT'); found = true; }
    } else if (phase === 'MONTHLY') {
      const item = monthlyReviews.find(m => m.id === id);
      if (item) { setSelectedMonthly(item); setShowMonthlyModal(true); setActiveTab('MONTHLY'); found = true; }
    } else if (phase === 'ANNUAL') {
      const item = appraisals.find(a => a.id === id);
      if (item) { setSelectedAppraisal(item); setShowAppraisalModal(true); setActiveTab('ANNUAL'); found = true; }
    }

    if (found || !isLoading) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [contracts, monthlyReviews, appraisals, isLoading]);

  if (!currentUser) return null;

  const isEmployee = currentUser.role === UserRole.EMPLOYEE;
  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isPM = currentUser.role === UserRole.PM;
  const isCTO = currentUser.role === UserRole.CTO;

  const userContracts = contracts.filter(c => isEmployee ? c.employeeId === currentUser.id : true);
  const userAppraisals = appraisals.filter(a => isEmployee ? a.employeeId === currentUser.id : true);
  const userMonthly = monthlyReviews.filter(r => isEmployee ? r.employeeId === currentUser.id : true);

  const handleShare = (phase: Tab, id: string) => {
    const baseUrl = window.location.href.split('?')[0];
    const shareUrl = `${baseUrl}?phase=${phase}&id=${id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast("Link shared successfully!", "success");
    });
  };

  const handleOpenMonthly = (review?: MonthlyReview) => {
    setSelectedMonthly(review);
    setShowMonthlyModal(true);
  };

  const menuItems: Tab[] = isAdmin ? ['HR', 'CONTRACT', 'MONTHLY', 'ANNUAL'] : ['CONTRACT', 'MONTHLY', 'ANNUAL'];

  if (isLoading && contracts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <div className="text-center space-y-8">
           <div className="w-16 h-16 border-[4px] border-emerald-100 border-t-emerald-800 rounded-full animate-spin mx-auto"></div>
           <p className="text-[11px] font-black tracking-[0.5em] text-emerald-900 uppercase">Authorizing Session</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row p-6 md:p-8 gap-8">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-80 emerald-sidebar rounded-[3rem] p-10 flex flex-col shrink-0 animate-fade-in">
        <div className="flex items-center gap-5 mb-16">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center font-black italic text-2xl text-white shadow-lg">W</div>
          <div>
            <span className="font-extrabold text-2xl tracking-tighter text-white block leading-none">Walpberry</span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`}></span>
              <span className="text-[9px] font-black uppercase text-emerald-200/50 tracking-widest">{dbStatus}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          {menuItems.map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`w-full text-left px-8 py-5 rounded-3xl font-bold transition-all text-sm flex items-center gap-5 group relative overflow-hidden ${activeTab === t ? 'text-white' : 'text-emerald-200/50 hover:text-white hover:bg-white/5'}`}
            >
              {activeTab === t && <div className="absolute inset-0 bg-white/10"></div>}
              {activeTab === t && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500"></div>}
              <span className={`w-2 h-2 rounded-full transition-all ${activeTab === t ? 'bg-amber-400 scale-150' : 'bg-emerald-800'}`}></span>
              {t === 'HR' ? 'Organization' : t.charAt(0) + t.slice(1).toLowerCase() + ' Cycle'}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-10 border-t border-white/10 space-y-8">
          <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5">
            <p className="text-[9px] font-black text-emerald-200/40 uppercase tracking-widest mb-4">Active Officer</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white font-black text-xl">{currentUser.name[0]}</div>
              <div className="min-w-0">
                <p className="font-bold text-white text-base truncate leading-none">{currentUser.name}</p>
                <p className="text-[10px] text-emerald-200/50 font-bold uppercase tracking-widest mt-1.5">{currentUser.role}</p>
              </div>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 text-emerald-200/40 hover:text-red-400 font-black text-[10px] uppercase tracking-widest transition-all px-8 py-4 rounded-2xl hover:bg-red-500/10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-12">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-8 pt-4">
            <div className="animate-slide-up">
              <h1 className="text-6xl font-black text-emerald-950 tracking-tighter uppercase leading-none">{activeTab === 'HR' ? 'Governance' : activeTab}</h1>
              <p className="text-slate-500 text-lg mt-3 font-medium tracking-tight">Managing the performance lifecycle with prestige.</p>
            </div>
            <div className="flex w-full sm:w-auto gap-4">
              {activeTab === 'CONTRACT' && isEmployee && (
                <button onClick={() => { setSelectedContract(undefined); setShowContractModal(true); }} className="flex-1 sm:flex-none btn-majestic px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl">+ Initiate Contract</button>
              )}
              {activeTab === 'MONTHLY' && isEmployee && (
                <button onClick={() => handleOpenMonthly()} className="flex-1 sm:flex-none bg-white border border-slate-200 text-emerald-900 px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:border-emerald-500 transition-all">+ Track Progress</button>
              )}
              {activeTab === 'ANNUAL' && isEmployee && (
                <button onClick={() => { setSelectedAppraisal(undefined); setShowAppraisalModal(true); }} className="flex-1 sm:flex-none btn-majestic px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl">+ Begin Review</button>
              )}
            </div>
          </header>

          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {activeTab === 'HR' && <HRDashboard />}
            
            {(activeTab === 'CONTRACT' || activeTab === 'MONTHLY' || activeTab === 'ANNUAL') && (
              <div className="grid grid-cols-1 gap-5">
                {(activeTab === 'CONTRACT' ? userContracts : activeTab === 'MONTHLY' ? userMonthly : userAppraisals).length === 0 && (
                   <div className="py-32 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-emerald-900/5 space-y-4">
                      <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">No records in this sector.</p>
                   </div>
                )}

                {activeTab === 'CONTRACT' && userContracts.map(c => (
                  <div key={c.id} className="royal-card p-10 rounded-[3rem] flex items-center justify-between group">
                    <div className="flex items-center gap-10">
                       <div className="w-20 h-20 rounded-[2.5rem] bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 group-hover:bg-emerald-900 group-hover:text-white transition-all duration-500">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                       </div>
                       <div>
                          <p className="text-2xl font-black text-emerald-950 group-hover:translate-x-1 transition-transform">{new Date(c.updatedAt).getFullYear()} Contract</p>
                          <div className="flex items-center gap-4 mt-2">
                             <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{c.periodFrom} — {c.periodTo}</span>
                             <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                             {!isEmployee && <span className="text-[11px] text-amber-700 font-bold uppercase tracking-widest">{c.employeeFirstName} {c.employeeSurname}</span>}
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-8">
                       <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          c.status === FormStatus.APPROVED ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-100'
                       }`}>{c.status}</span>
                       <div className="flex gap-3">
                          <button onClick={() => handleShare('CONTRACT', c.id)} className="p-4 bg-slate-50 hover:bg-emerald-50 rounded-2xl text-emerald-800 transition-all border border-slate-200">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                          </button>
                          <button onClick={() => { setSelectedContract(c); setShowContractModal(true); }} className="btn-majestic px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">Review</button>
                       </div>
                    </div>
                  </div>
                ))}

                {activeTab === 'MONTHLY' && userMonthly.map(m => (
                  <div key={m.id} className="royal-card p-10 rounded-[3rem] flex items-center justify-between group">
                    <div className="flex items-center gap-10">
                       <div className="w-20 h-20 rounded-[2.5rem] bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                       </div>
                       <div>
                          <p className="text-2xl font-black text-emerald-950">{new Date(m.todayDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} Cycle</p>
                          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-2">{m.tasks.length} Responsibilities Monitored</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-8">
                       <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${m.status === FormStatus.SUBMITTED ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>{m.status}</span>
                       <button onClick={() => handleOpenMonthly(m)} className="bg-emerald-950 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-800 shadow-xl transition-all">Inspect Log</button>
                    </div>
                  </div>
                ))}

                {activeTab === 'ANNUAL' && userAppraisals.map(a => (
                  <div key={a.id} className="royal-card p-10 rounded-[3rem] flex items-center justify-between group">
                    <div className="flex items-center gap-10">
                       <div className="w-20 h-20 rounded-[2.5rem] bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shadow-inner group-hover:scale-105 transition-transform">
                          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                       </div>
                       <div>
                          <p className="text-3xl font-black text-emerald-950">{a.finalRating} Quality</p>
                          <p className="text-[12px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Weighted Aggregate: {a.totalScore.toFixed(2)}%</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {a.status === FormStatus.CERTIFIED && (
                        <button onClick={() => setViewingCert(a)} className="bg-amber-700 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-amber-700/20 hover:scale-[1.05] transition-all">Gold Certificate</button>
                      )}
                      {(isPM || isCTO || isAdmin) && a.status === FormStatus.SUBMITTED && (
                        <button onClick={() => { setSelectedAppraisal(a); setShowAppraisalModal(true); }} className="btn-majestic px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Appraise Now</button>
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

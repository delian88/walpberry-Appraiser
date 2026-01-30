
import React from 'react';
import { AnnualAppraisal, User } from '../types';
import { useAppContext } from '../store/AppContext';

interface Props {
  appraisal: AnnualAppraisal;
  onClose: () => void;
}

export const Certificate: React.FC<Props> = ({ appraisal, onClose }) => {
  const { users } = useAppContext();
  const employee = users.find(u => u.id === appraisal.employeeId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-emerald-950/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-5xl relative animate-scale-in">
        <div className="no-print absolute -top-16 left-0 right-0 flex justify-between items-center text-white">
          <button onClick={onClose} className="flex items-center gap-3 font-black text-[11px] uppercase tracking-widest hover:text-amber-400 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Dismiss View
          </button>
          <button 
            onClick={handlePrint}
            className="bg-amber-600 px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:bg-amber-500 transition-all shadow-2xl"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Download Ledger / Print
          </button>
        </div>

        {/* Majestic Certificate Body */}
        <div className="bg-[#fdfbf7] p-16 md:p-32 shadow-[0_80px_160px_rgba(0,0,0,0.8)] relative border-[24px] border-white rounded-sm print:shadow-none print:border-[10px] print:border-slate-100 overflow-hidden">
          
          {/* Subtle paper texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/silk.png')]"></div>
          
          {/* Ornate Corner Accents */}
          <div className="absolute top-10 left-10 w-24 h-24 border-t-4 border-l-4 border-amber-800/20 rounded-tl-3xl"></div>
          <div className="absolute top-10 right-10 w-24 h-24 border-t-4 border-r-4 border-amber-800/20 rounded-tr-3xl"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 border-b-4 border-l-4 border-amber-800/20 rounded-bl-3xl"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 border-b-4 border-r-4 border-amber-800/20 rounded-br-3xl"></div>

          <div className="text-center space-y-12 relative z-10">
            <div className="flex flex-col items-center mb-16">
              <div className="w-28 h-28 bg-emerald-950 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-950/20 rotate-6 border-4 border-white">
                <span className="text-white text-4xl font-black italic tracking-tighter">W</span>
              </div>
              <p className="text-[12px] font-black text-amber-800 uppercase tracking-[0.6em] mb-2">Walpberry Corporate Governance</p>
              <h1 className="text-5xl md:text-7xl font-bold text-emerald-950 uppercase tracking-tighter certificate-font leading-none py-4 border-y border-emerald-900/10">
                Merit Certification
              </h1>
            </div>

            <div className="space-y-8">
              <p className="text-slate-400 font-black italic text-lg uppercase tracking-widest">This formally confirms that</p>
              <h2 className="text-5xl md:text-6xl font-extrabold text-emerald-950 uppercase tracking-tighter leading-none border-b-4 border-amber-600/30 inline-block pb-4 px-10">
                {employee?.name}
              </h2>
              <div className="max-w-2xl mx-auto space-y-6 pt-6">
                <p className="text-emerald-900/70 text-lg leading-relaxed font-medium">
                  Has successfully traversed the annual performance evaluation for the fiscal period of 
                  <span className="font-black text-emerald-950"> {appraisal.periodFrom.split('-')[0]}—{appraisal.periodTo.split('-')[0]} </span> 
                  with exceptional dedication and professional excellence.
                </p>
                <div className="flex justify-center gap-20 py-8">
                    <div className="text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Audit Score</p>
                        <p className="text-4xl font-black text-emerald-950">{appraisal.totalScore.toFixed(1)}%</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Corporate Grade</p>
                        <p className="text-4xl font-black text-amber-700">{appraisal.finalRating.toUpperCase()}</p>
                    </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-32 pt-20 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="h-px bg-emerald-900/20 mb-6"></div>
                <p className="font-black text-emerald-950 mb-1 uppercase text-sm">John Adewale</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Project Lead Auditor</p>
              </div>
              <div className="text-center">
                <div className="h-px bg-emerald-900/20 mb-6"></div>
                <p className="font-black text-emerald-950 mb-1 uppercase text-sm">Victor Idowu</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Chief Technology Officer</p>
              </div>
            </div>

            <div className="pt-24 opacity-30">
                <p className="text-[9px] font-black text-emerald-900 uppercase tracking-[0.5em] mb-4">Secured via Walpberry Ledger Protocol</p>
                <div className="flex justify-center items-center gap-6">
                    <span className="text-[9px] font-mono text-slate-400">ISSUED: {new Date(appraisal.certifiedAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                    <span className="text-[9px] font-mono text-slate-400">NODE ID: {appraisal.id.toUpperCase()}</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

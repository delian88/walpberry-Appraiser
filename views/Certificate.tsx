
import React from 'react';
import { Appraisal } from '../types';

interface Props {
  appraisal: Appraisal;
  onClose: () => void;
}

export const Certificate: React.FC<Props> = ({ appraisal, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl relative">
        <div className="no-print absolute -top-12 left-0 right-0 flex justify-between items-center text-white">
          <button onClick={onClose} className="flex items-center gap-2 hover:text-slate-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Dashboard
          </button>
          <button 
            onClick={handlePrint}
            className="bg-indigo-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Download PDF / Print
          </button>
        </div>

        {/* Certificate Body */}
        <div className="bg-white p-12 md:p-20 shadow-2xl relative border-[16px] border-amber-50 rounded-sm print:shadow-none print:border-none">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full flex items-center justify-center -mr-2 -mt-2">
            <div className="w-20 h-20 border-4 border-amber-200 rounded-full flex items-center justify-center opacity-40">
                <span className="text-2xl font-bold text-amber-600">W</span>
            </div>
          </div>

          <div className="text-center space-y-8">
            <div className="flex justify-center mb-10">
              <div className="bg-amber-100 text-amber-600 p-3 rounded-full">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.827c.097-.312.515-.312.612 0l1.264 4.059a.5.5 0 00.475.345h4.268c.328 0 .464.42.198.613l-3.453 2.508a.5.5 0 00-.181.557l1.264 4.059c.1.312-.256.571-.522.378l-3.453-2.508a.5.5 0 00-.59 0l-3.453 2.508c-.266.193-.622-.066-.522-.378l1.264-4.059a.5.5 0 00-.181-.557L3.02 7.844c-.266-.193-.13-.613.198-.613h4.268a.5.5 0 00.475-.345l1.264-4.059z" />
                </svg>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-[0.2em] text-slate-800 certificate-font">
                Certificate of Performance
            </h1>

            <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-200 to-transparent w-full"></div>

            <div className="space-y-4">
              <p className="text-slate-500 font-medium italic">This certifies that</p>
              <h2 className="text-4xl font-bold text-indigo-900 uppercase underline decoration-amber-200 decoration-2 underline-offset-8">
                {appraisal.employeeName}
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
                has successfully completed the annual performance appraisal process for the period of
                <span className="font-bold text-slate-800"> {appraisal.year} </span> 
                within the <span className="font-bold text-slate-800">{appraisal.department}</span> department, achieving an exceptional performance rating.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-20 pt-16 max-w-lg mx-auto">
              <div className="text-center border-t border-slate-200 pt-4">
                <p className="font-bold text-slate-800 mb-1">{appraisal.pmName}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Project Manager</p>
              </div>
              <div className="text-center border-t border-slate-200 pt-4">
                <p className="font-bold text-slate-800 mb-1">Victor Idowu</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Chief Technology Officer</p>
              </div>
            </div>

            <div className="pt-10 text-slate-300 text-[10px] font-mono uppercase tracking-[0.3em]">
                Issued on {new Date(appraisal.certifiedAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                <br />
                Verification ID: {appraisal.id.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

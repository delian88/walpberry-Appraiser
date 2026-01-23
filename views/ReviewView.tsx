
import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Appraisal, AppraisalStatus, UserRole, ReviewComment } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface Props {
  appraisal: Appraisal;
  onClose: () => void;
}

export const ReviewView: React.FC<Props> = ({ appraisal, onClose }) => {
  const { currentUser, updateAppraisal } = useAppContext();
  const [comment, setComment] = useState('');

  const isPM = currentUser?.role === UserRole.PM;
  const isCTO = currentUser?.role === UserRole.CTO;

  const handleAction = (nextStatus: AppraisalStatus) => {
    const newComment: ReviewComment = {
      authorId: currentUser?.id || '',
      authorName: currentUser?.name || '',
      authorRole: currentUser?.role || UserRole.EMPLOYEE,
      text: comment,
      timestamp: Date.now()
    };

    const updates: Partial<Appraisal> = { status: nextStatus };
    
    if (isPM) {
      updates.pmComments = [...appraisal.pmComments, newComment];
    } else if (isCTO) {
      updates.ctoComments = [...appraisal.ctoComments, newComment];
      if (nextStatus === AppraisalStatus.APPROVED_BY_CTO) {
          updates.status = AppraisalStatus.CERTIFIED;
          updates.certifiedAt = Date.now();
      }
    }

    updateAppraisal(appraisal.id, updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Review Appraisal: {appraisal.employeeName}</h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">{appraisal.year} • {appraisal.department}</p>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge status={appraisal.status} />
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Details (Read Only) */}
          <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Employee's Input</h3>
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-slate-800 mb-2">Self Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg key={star} className={`w-5 h-5 ${appraisal.selfRating >= star ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Achievements</h4>
                  <p className="text-slate-600 text-sm whitespace-pre-wrap">{appraisal.achievements}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Challenges</h4>
                  <p className="text-slate-600 text-sm whitespace-pre-wrap">{appraisal.challenges}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Tasks Breakdown</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-2 font-semibold">Task</th>
                        <th className="px-4 py-2 font-semibold">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {appraisal.tasks.map(task => (
                        <tr key={task.id} className="border-t border-slate-100">
                          <td className="px-4 py-2">
                            <p className="font-medium">{task.name}</p>
                            <p className="text-xs text-slate-500">{task.description}</p>
                          </td>
                          <td className="px-4 py-2">{task.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Previous Comments */}
          {(appraisal.pmComments.length > 0 || appraisal.ctoComments.length > 0) && (
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Audit Trail & Comments</h3>
              <div className="space-y-3">
                {[...appraisal.pmComments, ...appraisal.ctoComments].sort((a,b) => a.timestamp - b.timestamp).map((c, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${c.authorRole === UserRole.CTO ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      {c.authorName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-slate-800 text-sm">{c.authorName} <span className="text-xs text-slate-400 font-normal">({c.authorRole})</span></p>
                        <span className="text-[10px] text-slate-400">{new Date(c.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-600 text-sm italic">"{c.text}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* New Review Area */}
          <section className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
            <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-widest mb-4">Add Your Review</h3>
            <textarea 
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
              placeholder={`Write your feedback for ${appraisal.employeeName}...`}
            />
          </section>
        </div>

        <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-end sticky bottom-0 bg-white">
          <button 
            onClick={() => handleAction(AppraisalStatus.RETURNED)}
            className="px-6 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold border border-red-100"
          >
            Disapprove & Return
          </button>
          
          {isPM && appraisal.status === AppraisalStatus.SUBMITTED && (
            <button 
              onClick={() => handleAction(AppraisalStatus.APPROVED_BY_PM)}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold shadow-md shadow-emerald-100"
            >
              Approve (Pass to CTO)
            </button>
          )}

          {isCTO && appraisal.status === AppraisalStatus.APPROVED_BY_PM && (
            <button 
              onClick={() => handleAction(AppraisalStatus.APPROVED_BY_CTO)}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold shadow-md shadow-amber-100"
            >
              Final Approval & Certify
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

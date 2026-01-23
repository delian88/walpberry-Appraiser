
import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { UserRole, AppraisalStatus, Appraisal } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { AppraisalForm } from './AppraisalForm';
import { ReviewView } from './ReviewView';
import { Certificate } from './Certificate';

export const Dashboard: React.FC = () => {
  const { currentUser, appraisals, logout } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [selectedAppraisal, setSelectedAppraisal] = useState<Appraisal | null>(null);
  const [editingAppraisal, setEditingAppraisal] = useState<Appraisal | null>(null);
  const [reviewingAppraisal, setReviewingAppraisal] = useState<Appraisal | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<Appraisal | null>(null);

  if (!currentUser) return null;

  const isEmployee = currentUser.role === UserRole.EMPLOYEE;
  const isPM = currentUser.role === UserRole.PM;
  const isCTO = currentUser.role === UserRole.CTO;

  const filteredAppraisals = appraisals.filter(a => {
    if (isEmployee) return a.employeeId === currentUser.id;
    if (isPM) return a.pmId === currentUser.id && a.status !== AppraisalStatus.DRAFT;
    if (isCTO) return a.status === AppraisalStatus.APPROVED_BY_PM || a.status === AppraisalStatus.CERTIFIED;
    return false;
  });

  const getActionLabel = (appraisal: Appraisal) => {
    const s = appraisal.status;
    if (isEmployee) {
      if (s === AppraisalStatus.DRAFT || s === AppraisalStatus.RETURNED) return 'Edit';
      if (s === AppraisalStatus.CERTIFIED) return 'View Certificate';
      return 'View Status';
    }
    if (isPM) {
      if (s === AppraisalStatus.SUBMITTED) return 'Review';
      return 'View Detail';
    }
    if (isCTO) {
      if (s === AppraisalStatus.APPROVED_BY_PM) return 'Review';
      if (s === AppraisalStatus.CERTIFIED) return 'View Certificate';
      return 'View Detail';
    }
    return 'View';
  };

  const handleAction = (appraisal: Appraisal) => {
    const s = appraisal.status;
    if (isEmployee) {
      if (s === AppraisalStatus.DRAFT || s === AppraisalStatus.RETURNED) {
        setEditingAppraisal(appraisal);
        return;
      }
      if (s === AppraisalStatus.CERTIFIED) {
        setViewingCertificate(appraisal);
        return;
      }
      setSelectedAppraisal(appraisal);
    } else {
      if ((isPM && s === AppraisalStatus.SUBMITTED) || (isCTO && s === AppraisalStatus.APPROVED_BY_PM)) {
        setReviewingAppraisal(appraisal);
      } else if (s === AppraisalStatus.CERTIFIED) {
        setViewingCertificate(appraisal);
      } else {
        setSelectedAppraisal(appraisal);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold italic">W</span>
              </div>
              <span className="text-lg font-bold text-slate-800">Walpberry <span className="text-indigo-600">Appraiser</span></span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 leading-none">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{currentUser.role.replace('_', ' ')}</p>
              </div>
              <button 
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Sign Out"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500">Welcome back, {currentUser.name.split(' ')[0]}</p>
          </div>
          {isEmployee && (
            <button 
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-lg shadow-indigo-100 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Appraisal
            </button>
          )}
        </div>

        {/* Stats / Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Appraisals</p>
            <p className="text-3xl font-bold text-slate-800">{filteredAppraisals.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Certified</p>
            <p className="text-3xl font-bold text-emerald-600">{filteredAppraisals.filter(a => a.status === AppraisalStatus.CERTIFIED).length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Review</p>
            <p className="text-3xl font-bold text-amber-500">
              {filteredAppraisals.filter(a => 
                isPM ? a.status === AppraisalStatus.SUBMITTED : 
                isCTO ? a.status === AppraisalStatus.APPROVED_BY_PM : 
                a.status === AppraisalStatus.SUBMITTED
              ).length}
            </p>
          </div>
        </div>

        {/* List View */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">My Appraisals</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  {!isEmployee && <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Employee</th>}
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Year</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Department</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppraisals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <p className="text-slate-400">No appraisal records found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAppraisals.map((appraisal) => (
                    <tr key={appraisal.id} className="hover:bg-slate-50/50 transition-colors group">
                      {!isEmployee && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                {appraisal.employeeName.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-800">{appraisal.employeeName}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 text-slate-600 font-medium">{appraisal.year}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{appraisal.department}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={appraisal.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleAction(appraisal)}
                          className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all text-sm font-semibold border border-transparent group-hover:border-indigo-100"
                        >
                          {getActionLabel(appraisal)}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Overlays */}
      {showForm && <AppraisalForm onClose={() => setShowForm(false)} />}
      {editingAppraisal && <AppraisalForm onClose={() => setEditingAppraisal(null)} initialData={editingAppraisal} />}
      {reviewingAppraisal && <ReviewView appraisal={reviewingAppraisal} onClose={() => setReviewingAppraisal(null)} />}
      {viewingCertificate && <Certificate appraisal={viewingCertificate} onClose={() => setViewingCertificate(null)} />}
      
      {/* Simple View Only Modal */}
      {selectedAppraisal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative">
                <button onClick={() => setSelectedAppraisal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="mb-6">
                    <StatusBadge status={selectedAppraisal.status} />
                    <h2 className="text-2xl font-bold text-slate-800 mt-2">Appraisal Status Track</h2>
                </div>
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="w-px bg-slate-100 relative">
                            <div className="absolute top-0 -left-1 w-2 h-2 rounded-full bg-indigo-600"></div>
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">Submitted for Review</p>
                            <p className="text-sm text-slate-500">Awaiting Manager validation</p>
                        </div>
                    </div>
                    {/* Simplified history */}
                    <p className="text-slate-400 text-sm italic py-4">Detailed status logs are strictly for HR and Approval roles.</p>
                </div>
                <button 
                    onClick={() => setSelectedAppraisal(null)}
                    className="w-full mt-6 py-2 bg-slate-900 text-white rounded-xl font-bold"
                >
                    Close
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

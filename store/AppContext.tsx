
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, PerformanceContract, MonthlyReview, AnnualAppraisal } from '../types';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  contracts: PerformanceContract[];
  monthlyReviews: MonthlyReview[];
  appraisals: AnnualAppraisal[];
  upsertContract: (contract: PerformanceContract) => void;
  upsertMonthly: (review: MonthlyReview) => void;
  upsertAppraisal: (appraisal: AnnualAppraisal) => void;
  updateAppraisal: (id: string, updates: Partial<any>) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [contracts, setContracts] = useState<PerformanceContract[]>([]);
  const [monthlyReviews, setMonthlyReviews] = useState<MonthlyReview[]>([]);
  const [appraisals, setAppraisals] = useState<AnnualAppraisal[]>([]);

  useEffect(() => {
    const data = ['contracts', 'monthlyReviews', 'appraisals', 'currentUser'];
    const setters = [setContracts, setMonthlyReviews, setAppraisals, setCurrentUser];
    data.forEach((key, i) => {
      const saved = localStorage.getItem(`walpberry_${key}`);
      if (saved) setters[i](JSON.parse(saved));
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('walpberry_contracts', JSON.stringify(contracts));
    localStorage.setItem('walpberry_monthlyReviews', JSON.stringify(monthlyReviews));
    localStorage.setItem('walpberry_appraisals', JSON.stringify(appraisals));
    if (currentUser) localStorage.setItem('walpberry_currentUser', JSON.stringify(currentUser));
  }, [contracts, monthlyReviews, appraisals, currentUser]);

  const upsertContract = (contract: PerformanceContract) => {
    setContracts(prev => {
      // If the new/updated contract is active, deactivate all other contracts for the same employee
      let newContracts = prev;
      if (contract.isActive) {
        newContracts = prev.map(c => c.employeeId === contract.employeeId ? { ...c, isActive: false } : c);
      }
      
      const exists = newContracts.find(c => c.id === contract.id);
      return exists ? newContracts.map(c => c.id === contract.id ? contract : c) : [...newContracts, contract];
    });
  };

  const upsertMonthly = (review: MonthlyReview) => {
    setMonthlyReviews(prev => {
      const exists = prev.find(r => r.id === review.id);
      return exists ? prev.map(r => r.id === review.id ? review : r) : [...prev, review];
    });
  };

  const upsertAppraisal = (appraisal: AnnualAppraisal) => {
    setAppraisals(prev => {
      const exists = prev.find(a => a.id === appraisal.id);
      return exists ? prev.map(a => a.id === appraisal.id ? appraisal : a) : [...prev, appraisal];
    });
  };

  const updateAppraisal = (id: string, updates: Partial<any>) => {
    setAppraisals(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('walpberry_currentUser');
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, setCurrentUser, contracts, monthlyReviews, appraisals, 
      upsertContract, upsertMonthly, upsertAppraisal, updateAppraisal, logout 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

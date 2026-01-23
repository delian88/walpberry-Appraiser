
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, PerformanceContract, MonthlyReview, AnnualAppraisal } from '../types';
import { MOCK_USERS } from '../constants';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  contracts: PerformanceContract[];
  monthlyReviews: MonthlyReview[];
  appraisals: AnnualAppraisal[];
  upsertUser: (user: User) => void;
  deleteUser: (id: string) => void;
  upsertContract: (contract: PerformanceContract) => void;
  upsertMonthly: (review: MonthlyReview) => void;
  upsertAppraisal: (appraisal: AnnualAppraisal) => void;
  updateAppraisal: (id: string, updates: Partial<any>) => void;
  logout: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [contracts, setContracts] = useState<PerformanceContract[]>([]);
  const [monthlyReviews, setMonthlyReviews] = useState<MonthlyReview[]>([]);
  const [appraisals, setAppraisals] = useState<AnnualAppraisal[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  useEffect(() => {
    const data = ['contracts', 'monthlyReviews', 'appraisals', 'currentUser', 'users'];
    const setters = [setContracts, setMonthlyReviews, setAppraisals, setCurrentUser, setUsers];
    data.forEach((key, i) => {
      const saved = localStorage.getItem(`walpberry_${key}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed) setters[i](parsed);
        } catch (e) {
          console.error("Failed to parse state for", key);
        }
      }
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('walpberry_contracts', JSON.stringify(contracts));
    localStorage.setItem('walpberry_monthlyReviews', JSON.stringify(monthlyReviews));
    localStorage.setItem('walpberry_appraisals', JSON.stringify(appraisals));
    localStorage.setItem('walpberry_users', JSON.stringify(users));
    if (currentUser) localStorage.setItem('walpberry_currentUser', JSON.stringify(currentUser));
  }, [contracts, monthlyReviews, appraisals, currentUser, users]);

  const upsertUser = (user: User) => {
    // FIX: Check if the user already exists to determine toast message instead of using undefined 'editingUser'
    const isUpdate = users.some(u => u.id === user.id);
    setUsers(prev => {
      const exists = prev.find(u => u.id === user.id);
      return exists ? prev.map(u => u.id === user.id ? user : u) : [...prev, user];
    });
    showToast(isUpdate ? "Colleague updated successfully" : "New colleague registered");
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    showToast("User profile removed", "info");
  };

  const upsertContract = (contract: PerformanceContract) => {
    setContracts(prev => {
      let newContracts = prev;
      if (contract.isActive) {
        newContracts = prev.map(c => c.employeeId === contract.employeeId ? { ...c, isActive: false } : c);
      }
      const exists = newContracts.find(c => c.id === contract.id);
      return exists ? newContracts.map(c => c.id === contract.id ? contract : c) : [...newContracts, contract];
    });
    showToast(`Contract ${contract.status.toLowerCase()} successfully`);
  };

  const upsertMonthly = (review: MonthlyReview) => {
    setMonthlyReviews(prev => {
      const exists = prev.find(r => r.id === review.id);
      return exists ? prev.map(r => r.id === review.id ? review : r) : [...prev, review];
    });
    showToast("Monthly log updated");
  };

  const upsertAppraisal = (appraisal: AnnualAppraisal) => {
    setAppraisals(prev => {
      const exists = prev.find(a => a.id === appraisal.id);
      return exists ? prev.map(a => a.id === appraisal.id ? appraisal : a) : [...prev, appraisal];
    });
    showToast(`Appraisal ${appraisal.status.toLowerCase()} successfully`);
  };

  const updateAppraisal = (id: string, updates: Partial<any>) => {
    setAppraisals(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    showToast("Appraisal review saved");
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('walpberry_currentUser');
    showToast("Signed out", "info");
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, setCurrentUser, users, contracts, monthlyReviews, appraisals, 
      upsertUser, deleteUser, upsertContract, upsertMonthly, upsertAppraisal, updateAppraisal, logout,
      toasts, showToast, removeToast
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


import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, PerformanceContract, MonthlyReview, AnnualAppraisal } from '../types';
import { API } from '../api';

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
  isLoading: boolean;
  dbStatus: 'connected' | 'error' | 'connecting';
  upsertUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  upsertContract: (contract: PerformanceContract) => Promise<void>;
  upsertMonthly: (review: MonthlyReview) => Promise<void>;
  upsertAppraisal: (appraisal: AnnualAppraisal) => Promise<void>;
  updateAppraisal: (id: string, updates: Partial<any>) => Promise<void>;
  logout: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: number) => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [contracts, setContracts] = useState<PerformanceContract[]>([]);
  const [monthlyReviews, setMonthlyReviews] = useState<MonthlyReview[]>([]);
  const [appraisals, setAppraisals] = useState<AnnualAppraisal[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<'connected' | 'error' | 'connecting'>('connecting');

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [u, c, m, a] = await Promise.all([
        API.getUsers(),
        API.getContracts(),
        API.getMonthlyReviews(),
        API.getAppraisals()
      ]);
      setUsers(u);
      setContracts(c);
      setMonthlyReviews(m);
      setAppraisals(a);
      setDbStatus('connected');
    } catch (err) {
      console.error("Database connection error:", err);
      setDbStatus('error');
      showToast("Backend connection failed. Using offline mode.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const savedUser = localStorage.getItem('walpberry_currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to restore user session");
      }
    }
    refreshData();
  }, [refreshData]);

  const upsertUser = async (user: User) => {
    const isUpdate = users.some(u => u.id === user.id);
    try {
      await API.upsertUser(user);
      setUsers(prev => isUpdate ? prev.map(u => u.id === user.id ? user : u) : [...prev, user]);
      showToast(isUpdate ? "Profile updated in database" : "New user persisted to PostgreSQL");
    } catch (e) {
      showToast("Failed to save user to database", "error");
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await API.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      showToast("User removed from system", "info");
    } catch (e) {
      showToast("Database deletion error", "error");
    }
  };

  const upsertContract = async (contract: PerformanceContract) => {
    try {
      await API.upsertContract(contract);
      setContracts(prev => {
        let newContracts = prev;
        if (contract.isActive) {
          newContracts = prev.map(c => c.employeeId === contract.employeeId ? { ...c, isActive: false } : c);
        }
        const exists = newContracts.find(c => c.id === contract.id);
        return exists ? newContracts.map(c => c.id === contract.id ? contract : c) : [...newContracts, contract];
      });
      showToast(`Contract ${contract.status.toLowerCase()} synced to DB`);
    } catch (e) {
      showToast("Failed to persist contract", "error");
    }
  };

  const upsertMonthly = async (review: MonthlyReview) => {
    try {
      await API.upsertMonthly(review);
      setMonthlyReviews(prev => {
        const exists = prev.find(r => r.id === review.id);
        return exists ? prev.map(r => r.id === review.id ? review : r) : [...prev, review];
      });
      showToast("Progress log saved to cloud");
    } catch (e) {
      showToast("Sync error", "error");
    }
  };

  const upsertAppraisal = async (appraisal: AnnualAppraisal) => {
    try {
      await API.upsertAppraisal(appraisal);
      setAppraisals(prev => {
        const exists = prev.find(a => a.id === appraisal.id);
        return exists ? prev.map(a => a.id === appraisal.id ? appraisal : a) : [...prev, appraisal];
      });
      showToast(`Appraisal ${appraisal.status.toLowerCase()} finalized in DB`);
    } catch (e) {
      showToast("Database error", "error");
    }
  };

  const updateAppraisal = async (id: string, updates: Partial<any>) => {
    try {
      await API.updateAppraisal(id, updates);
      setAppraisals(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
      showToast("Review updates synced");
    } catch (e) {
      showToast("Failed to update appraisal", "error");
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('walpberry_currentUser');
    showToast("Signed out securely", "info");
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, setCurrentUser, users, contracts, monthlyReviews, appraisals, 
      isLoading, dbStatus, upsertUser, deleteUser, upsertContract, upsertMonthly, 
      upsertAppraisal, updateAppraisal, logout, toasts, showToast, removeToast, refreshData
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

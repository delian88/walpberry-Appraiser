
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Appraisal, UserRole, AppraisalStatus } from '../types';
import { MOCK_USERS } from '../constants';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  appraisals: Appraisal[];
  addAppraisal: (appraisal: Appraisal) => void;
  updateAppraisal: (id: string, updates: Partial<Appraisal>) => void;
  getAppraisal: (id: string) => Appraisal | undefined;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);

  // Load state from local storage on mount
  useEffect(() => {
    const savedAppraisals = localStorage.getItem('walpberry_appraisals');
    if (savedAppraisals) {
      setAppraisals(JSON.parse(savedAppraisals));
    }
    const savedUser = localStorage.getItem('walpberry_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Persist state to local storage
  useEffect(() => {
    localStorage.setItem('walpberry_appraisals', JSON.stringify(appraisals));
  }, [appraisals]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('walpberry_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('walpberry_user');
    }
  }, [currentUser]);

  const addAppraisal = (appraisal: Appraisal) => {
    setAppraisals(prev => [...prev, appraisal]);
  };

  const updateAppraisal = (id: string, updates: Partial<Appraisal>) => {
    setAppraisals(prev => prev.map(a => a.id === id ? { ...a, ...updates, updatedAt: Date.now() } : a));
  };

  const getAppraisal = (id: string) => appraisals.find(a => a.id === id);

  const logout = () => setCurrentUser(null);

  return (
    <AppContext.Provider value={{ currentUser, setCurrentUser, appraisals, addAppraisal, updateAppraisal, getAppraisal, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

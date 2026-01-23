
import { User, PerformanceContract, MonthlyReview, AnnualAppraisal } from './types';
import { MOCK_USERS } from './constants';

const BASE_URL = '/api';

/**
 * PRODUCTION NOTE: 
 * In a real environment, replace these mock return values with 
 * true fetch calls to your Node.js/PostgreSQL backend.
 */
export const API = {
  getUsers: async (): Promise<User[]> => {
    // const res = await fetch(`${BASE_URL}/users`);
    // return res.json();
    return JSON.parse(localStorage.getItem('walpberry_users') || JSON.stringify(MOCK_USERS));
  },

  getContracts: async (): Promise<PerformanceContract[]> => {
    // const res = await fetch(`${BASE_URL}/contracts`);
    // return res.json();
    return JSON.parse(localStorage.getItem('walpberry_contracts') || '[]');
  },

  getMonthlyReviews: async (): Promise<MonthlyReview[]> => {
    return JSON.parse(localStorage.getItem('walpberry_monthlyReviews') || '[]');
  },

  getAppraisals: async (): Promise<AnnualAppraisal[]> => {
    return JSON.parse(localStorage.getItem('walpberry_appraisals') || '[]');
  },

  upsertUser: async (user: User): Promise<void> => {
    // await fetch(`${BASE_URL}/users`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(user)
    // });
    const users = JSON.parse(localStorage.getItem('walpberry_users') || JSON.stringify(MOCK_USERS));
    const exists = users.find((u: any) => u.id === user.id);
    const newUsers = exists ? users.map((u: any) => u.id === user.id ? user : u) : [...users, user];
    localStorage.setItem('walpberry_users', JSON.stringify(newUsers));
  },

  deleteUser: async (id: string): Promise<void> => {
    const users = JSON.parse(localStorage.getItem('walpberry_users') || JSON.stringify(MOCK_USERS));
    localStorage.setItem('walpberry_users', JSON.stringify(users.filter((u: any) => u.id !== id)));
  },

  upsertContract: async (contract: PerformanceContract): Promise<void> => {
    const contracts = JSON.parse(localStorage.getItem('walpberry_contracts') || '[]');
    let newContracts = contracts;
    if (contract.isActive) {
      newContracts = contracts.map((c: any) => c.employeeId === contract.employeeId ? { ...c, isActive: false } : c);
    }
    const exists = newContracts.find((c: any) => c.id === contract.id);
    const final = exists ? newContracts.map((c: any) => c.id === contract.id ? contract : c) : [...newContracts, contract];
    localStorage.setItem('walpberry_contracts', JSON.stringify(final));
  },

  upsertMonthly: async (review: MonthlyReview): Promise<void> => {
    const items = JSON.parse(localStorage.getItem('walpberry_monthlyReviews') || '[]');
    const exists = items.find((i: any) => i.id === review.id);
    const final = exists ? items.map((i: any) => i.id === review.id ? review : i) : [...items, review];
    localStorage.setItem('walpberry_monthlyReviews', JSON.stringify(final));
  },

  upsertAppraisal: async (appraisal: AnnualAppraisal): Promise<void> => {
    const items = JSON.parse(localStorage.getItem('walpberry_appraisals') || '[]');
    const exists = items.find((i: any) => i.id === appraisal.id);
    const final = exists ? items.map((i: any) => i.id === appraisal.id ? appraisal : i) : [...items, appraisal];
    localStorage.setItem('walpberry_appraisals', JSON.stringify(final));
  },

  updateAppraisal: async (id: string, updates: Partial<any>): Promise<void> => {
    const items = JSON.parse(localStorage.getItem('walpberry_appraisals') || '[]');
    const final = items.map((i: any) => i.id === id ? { ...i, ...updates } : i);
    localStorage.setItem('walpberry_appraisals', JSON.stringify(final));
  }
};

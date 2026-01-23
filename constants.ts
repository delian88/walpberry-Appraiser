
import { User, UserRole, AppraisalStatus } from './types';

export const MOCK_USERS: User[] = [
  { 
    id: 'emp-1', 
    name: 'John Doe', 
    surname: 'Doe',
    firstName: 'John',
    ippisNumber: 'IP-9001',
    email: 'john@walpberry.com', 
    phone: '08012345678',
    role: UserRole.EMPLOYEE, 
    designation: 'Senior Engineer',
    department: 'Engineering' 
  },
  { 
    id: 'pm-1', 
    name: 'John Adewale', 
    surname: 'Adewale',
    firstName: 'John',
    ippisNumber: 'IP-2001',
    email: 'john.adewale@walpberry.com', 
    phone: '08088887777',
    role: UserRole.PM, 
    designation: 'Senior Project Manager',
    department: 'Project Management' 
  },
  { 
    id: 'cto-1', 
    name: 'Victor Idowu', 
    surname: 'Idowu',
    firstName: 'Victor',
    ippisNumber: 'IP-1001',
    email: 'victor.idowu@walpberry.com', 
    phone: '09011112222',
    role: UserRole.CTO, 
    designation: 'Chief Technology Officer',
    department: 'Executive' 
  },
];

// Fixed: Added missing STATUS_LABELS member required by StatusBadge.tsx
export const STATUS_LABELS: Record<string, { label: string, color: string }> = {
  [AppraisalStatus.DRAFT]: { label: 'Draft', color: 'bg-slate-100 text-slate-600' },
  [AppraisalStatus.SUBMITTED]: { label: 'Submitted', color: 'bg-blue-100 text-blue-600' },
  [AppraisalStatus.APPROVED]: { label: 'Approved', color: 'bg-emerald-100 text-emerald-600' },
  [AppraisalStatus.RETURNED]: { label: 'Returned', color: 'bg-red-100 text-red-600' },
  [AppraisalStatus.CERTIFIED]: { label: 'Certified', color: 'bg-amber-100 text-amber-600' },
  [AppraisalStatus.APPROVED_BY_PM]: { label: 'PM Approved', color: 'bg-indigo-100 text-indigo-600' },
  [AppraisalStatus.APPROVED_BY_CTO]: { label: 'CTO Approved', color: 'bg-purple-100 text-purple-600' },
};

export const getRating = (score: number) => {
  if (score >= 90) return 'Outstanding';
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Very Good';
  if (score >= 60) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Poor';
};

export const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR'];

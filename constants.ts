
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
    id: 'emp-2', 
    name: 'Sarah Jane', 
    surname: 'Jane',
    firstName: 'Sarah',
    ippisNumber: 'IP-9002',
    email: 'sarah@walpberry.com', 
    phone: '08022223333',
    role: UserRole.EMPLOYEE, 
    designation: 'UI Designer',
    department: 'Design' 
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
    department: 'Engineering' 
  },
  { 
    id: 'pm-2', 
    name: 'Amaka Obi', 
    surname: 'Obi',
    firstName: 'Amaka',
    ippisNumber: 'IP-2002',
    email: 'amaka.obi@walpberry.com', 
    phone: '08033334444',
    role: UserRole.PM, 
    designation: 'Design Lead',
    department: 'Design' 
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
  { 
    id: 'hr-1', 
    name: 'Admin User', 
    surname: 'Admin',
    firstName: 'System',
    ippisNumber: 'HR-0001',
    email: 'hr@walpberry.com', 
    phone: '010000000',
    role: UserRole.ADMIN, 
    designation: 'HR Director',
    department: 'Human Resources' 
  },
];

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

export const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Executive'];

// Mapping departments to default supervisors (PMs)
export const DEPT_SUPERVISOR_MAP: Record<string, string> = {
  'Engineering': 'pm-1',
  'Design': 'pm-2',
  'Product': 'pm-1',
  'Marketing': 'pm-2',
  'Sales': 'pm-1',
};


import { User, UserRole, AppraisalStatus } from './types';

export const MOCK_USERS: User[] = [
  { id: 'emp-1', name: 'John Doe', email: 'john@walpberry.com', role: UserRole.EMPLOYEE, department: 'Engineering' },
  { id: 'pm-1', name: 'John Adewale', email: 'john.adewale@walpberry.com', role: UserRole.PM, department: 'Project Management' },
  { id: 'cto-1', name: 'Victor Idowu', email: 'victor.idowu@walpberry.com', role: UserRole.CTO, department: 'Executive' },
];

export const STATUS_LABELS: Record<AppraisalStatus, { label: string; color: string }> = {
  [AppraisalStatus.DRAFT]: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  [AppraisalStatus.SUBMITTED]: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
  [AppraisalStatus.UNDER_PM_REVIEW]: { label: 'Under PM Review', color: 'bg-indigo-100 text-indigo-700' },
  [AppraisalStatus.RETURNED]: { label: 'Returned for Revision', color: 'bg-red-100 text-red-700' },
  [AppraisalStatus.APPROVED_BY_PM]: { label: 'Approved by PM', color: 'bg-emerald-100 text-emerald-700' },
  [AppraisalStatus.UNDER_CTO_REVIEW]: { label: 'Under CTO Review', color: 'bg-purple-100 text-purple-700' },
  [AppraisalStatus.APPROVED_BY_CTO]: { label: 'Approved by CTO', color: 'bg-teal-100 text-teal-700' },
  [AppraisalStatus.CERTIFIED]: { label: 'Certified (Locked)', color: 'bg-amber-100 text-amber-700 border border-amber-300' },
};

export const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR'];

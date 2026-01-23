
export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  PM = 'PM',
  CTO = 'CTO',
  ADMIN = 'ADMIN'
}

export enum AppraisalStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_PM_REVIEW = 'UNDER_PM_REVIEW',
  RETURNED = 'RETURNED',
  APPROVED_BY_PM = 'APPROVED_BY_PM',
  UNDER_CTO_REVIEW = 'UNDER_CTO_REVIEW',
  APPROVED_BY_CTO = 'APPROVED_BY_CTO',
  CERTIFIED = 'CERTIFIED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
}

export interface TaskEntry {
  id: string;
  name: string;
  description: string;
  duration: string;
}

export interface ReviewComment {
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  timestamp: number;
}

export interface Appraisal {
  id: string;
  employeeId: string;
  employeeName: string;
  year: number;
  department: string;
  pmId: string;
  pmName: string;
  tasks: TaskEntry[];
  achievements: string;
  challenges: string;
  selfRating: number;
  status: AppraisalStatus;
  pmComments: ReviewComment[];
  ctoComments: ReviewComment[];
  certifiedAt?: number;
  updatedAt: number;
  version: number;
}

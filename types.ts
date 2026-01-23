
export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  PM = 'PM',
  CTO = 'CTO',
  ADMIN = 'ADMIN'
}

export enum AppraisalStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  RETURNED = 'RETURNED',
  CERTIFIED = 'CERTIFIED',
  APPROVED_BY_PM = 'APPROVED_BY_PM',
  APPROVED_BY_CTO = 'APPROVED_BY_CTO'
}

export type FormStatus = AppraisalStatus;
export const FormStatus = AppraisalStatus;

export interface User {
  id: string;
  name: string;
  surname: string;
  firstName: string;
  otherNames?: string;
  ippisNumber: string;
  email: string;
  phone: string;
  role: UserRole;
  designation: string;
  department: string;
}

export interface KRAEntry {
  id: string;
  area: string;
  objectives: string;
  weight: number;
  kpis: string;
  target: number;
  unit: 'Percentage' | 'Number' | 'Rating';
}

export interface PerformanceContract {
  id: string;
  employeeId: string;
  periodFrom: string;
  periodTo: string;
  kraEntries: KRAEntry[];
  status: AppraisalStatus;
  isActive: boolean;
  updatedAt: number;
}

export interface MonthlyTask {
  id: string;
  description: string;
  expectation: string;
  startDate: string;
  dueDate: string;
  status: 'Completed' | 'In Progress' | 'Delayed';
  challenges: string;
}

export interface MonthlyReview {
  id: string;
  employeeId: string;
  lastReviewDate: string;
  todayDate: string;
  appraiserName: string;
  appraiserRank: string;
  responsibilities: string;
  tasks: MonthlyTask[];
  appraiserComments: string;
  status: AppraisalStatus;
  updatedAt: number;
}

export interface AppraisalKRA extends KRAEntry {
  achievement: number;
  rawScore: number;
  weightedRawScore: number;
}

export interface AnnualAppraisal {
  id: string;
  employeeId: string;
  contractId: string;
  periodFrom: string;
  periodTo: string;
  kraScoring: AppraisalKRA[];
  totalScore: number;
  finalRating: string;
  employeeComments: string;
  pmComments: string;
  ctoComments: string;
  status: AppraisalStatus;
  certifiedAt?: number;
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
  employeeName: string;
  year: string;
  department: string;
  status: AppraisalStatus;
  selfRating: number;
  achievements: string;
  challenges: string;
  tasks: Array<{id: string, name: string, description: string, duration: string}>;
  pmComments: ReviewComment[];
  ctoComments: ReviewComment[];
  certifiedAt?: number;
  pmName: string;
}

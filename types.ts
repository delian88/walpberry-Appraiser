
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

export interface CriteriaValues {
  o: string; // Outstanding
  e: string; // Excellent
  vg: string; // Very Good
  g: string; // Good
  f: string; // Fair
  p: string; // Poor
}

export interface KRAEntry {
  id: string;
  area: string;
  objectives: string;
  weight: number; // KRA Weight
  objWeight: number; // Objective Weight
  gradedWeight: number;
  criteria: CriteriaValues;
  kpis: string;
  target: number;
  unit: 'Percentage' | 'Quantity' | 'Rating' | 'Time-based';
  expectation?: string;
}

export interface CompetencyEntry {
  id: string;
  name: string;
  description: string;
  score: number;
  category: 'Generic' | 'Functional' | 'Ethics' | 'Operations';
  expectation?: string;
}

export interface PerformanceContract {
  id: string;
  employeeId: string;
  // Section A (1)
  periodFrom: string;
  periodTo: string;
  // Section B (2)
  employeeFirstName: string;
  employeeSurname: string;
  employeeOtherNames?: string;
  employeeIppis: string;
  employeeEmail: string;
  employeePhone: string;
  employeeDesignation: string;
  employeeDepartment: string;
  // Section C (3)
  supervisorId?: string;
  supervisorFirstName: string;
  supervisorSurname: string;
  supervisorOtherNames?: string;
  supervisorIppis: string;
  supervisorEmail: string;
  supervisorDesignation: string;
  supervisorDepartment: string;
  // Section D (4)
  officerId?: string;
  officerFirstName: string;
  officerSurname: string;
  officerOtherNames?: string;
  officerIppis: string;
  officerDesignation: string;
  // Section E (5)
  kraEntries: KRAEntry[];
  // Section F (6)
  competencyEntries: CompetencyEntry[];
  
  // Section G (7) - Comments & Final Signatures
  employeeComment?: string;
  supervisorComment?: string;
  officerComment?: string;

  // Signatures & Dates
  employeeSigned: boolean;
  employeeSignedDate?: number;
  supervisorSigned: boolean;
  supervisorSignedDate?: number;
  officerSigned: boolean;
  officerSignedDate?: number;
  
  status: AppraisalStatus;
  isActive: boolean;
  updatedAt: number;
}

export interface MonthlyTask {
  id: string;
  description: string;
  expectation: string;
  weight: number;
  unitOfMeasure: string;
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

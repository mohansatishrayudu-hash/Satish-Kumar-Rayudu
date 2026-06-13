/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string;
  name: string;
  fullName: string; // "ID - Name" format
  batch: string;
  classroomStatus: 'Present' | 'Absent';
  crtStatus: 'Present' | 'Absent';
  isSkipper: boolean; // Present in Classroom, Absent in CRT
  isCrtApplicant?: boolean; // True if present in the CRT attendance list
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  requiredCompliance: number; // e.g. 80
}

export interface CompanySummary {
  companyId: string;
  companyName: string;
  industry: string;
  totalApplicants: number;
  classPresentCount: number;
  crtPresentCount: number;
  skippersCount: number;
  complianceRate: number; // calculated as % of CRT present / total
  status: 'Critical' | 'Warning' | 'Healthy';
}

export interface BatchSummary {
  batchName: string;
  totalApplicants: number;
  classPresent: number;
  classAbsent: number;
  crtPresent: number;
  crtAbsent: number;
  skippersCount: number;
  skippers: Student[];
}

export interface AttendanceMetrics {
  totalApplicants: number;
  classPresentCount: number;
  classAbsentCount: number;
  crtPresentCount: number;
  crtAbsentCount: number;
  skippersCount: number;
}

export interface ColumnMapping {
  // For file 1: CRT
  crtStudentCol: string;
  crtStatusCol: string;
  crtBatchCol: string;
  crtDateCol: string;
  crtCompanyCol: string;
  // For file 2: Classroom
  classStudentCol: string;
  classDateCol: string;
  classBatchCol: string;
  classStatusCol: string;
}

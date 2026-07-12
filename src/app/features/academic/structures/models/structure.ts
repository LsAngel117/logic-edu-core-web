export interface AcademicStructureResponse {
  id: string;
  schoolId: string;
  structureType: string;
  levelsCount: number;
  periodsPerLevel: number;
  evaluationPeriodsPerPeriod: number;
  subjectsPerPeriod: number;
  hoursPerSubject: number;
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAcademicStructureRequest {
  structureType: string;
  levelsCount: number;
  periodsPerLevel: number;
  evaluationPeriodsPerPeriod: number;
  subjectsPerPeriod: number;
  hoursPerSubject: number;
}

export interface UpdateAcademicStructureRequest {
  structureType: string;
  levelsCount: number;
  periodsPerLevel: number;
  evaluationPeriodsPerPeriod: number;
  subjectsPerPeriod: number;
  hoursPerSubject: number;
}

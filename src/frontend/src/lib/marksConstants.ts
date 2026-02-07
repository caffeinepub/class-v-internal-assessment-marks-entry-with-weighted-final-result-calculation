import { Subject, AssessmentType } from '../backend';

export const SUBJECTS = [
  { value: Subject.odia, label: 'ODIA' },
  { value: Subject.maths, label: 'MATHS' },
  { value: Subject.scienceAndSocial, label: 'SCIENCE & SOCIAL SCIENCE' },
  { value: Subject.english, label: 'ENGLISH' },
  { value: Subject.drawing, label: 'DRAWING' },
];

export const ASSESSMENTS = [
  { type: AssessmentType.fa1, label: 'FA1', fullMarks: 25 },
  { type: AssessmentType.fa2, label: 'FA2', fullMarks: 25 },
  { type: AssessmentType.sa1, label: 'SA1', fullMarks: 50 },
  { type: AssessmentType.sa2, label: 'SA2', fullMarks: 50 },
  { type: AssessmentType.writtenWork1, label: 'WW1', fullMarks: 10 },
  { type: AssessmentType.writtenWork2, label: 'WW2', fullMarks: 10 },
  { type: AssessmentType.projectWork1, label: 'P1', fullMarks: 20 },
  { type: AssessmentType.projectWork2, label: 'P2', fullMarks: 20 },
];

export function getFullMarks(assessmentType: AssessmentType): number {
  const assessment = ASSESSMENTS.find((a) => a.type === assessmentType);
  return assessment?.fullMarks || 0;
}

export function getSubjectLabel(subject: Subject): string {
  const subjectData = SUBJECTS.find((s) => s.value === subject);
  return subjectData?.label || subject;
}

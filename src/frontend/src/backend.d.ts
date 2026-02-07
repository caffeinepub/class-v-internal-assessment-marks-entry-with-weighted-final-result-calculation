import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MarkEntry {
    marks: bigint;
    studentId: string;
    subject: Subject;
    assessmentType: AssessmentType;
}
export interface FinalSessionResult {
    totalMarks: bigint;
    studentId: string;
    marksEntries: Array<MarkEntry>;
}
export interface UserProfile {
    studentId?: string;
    name: string;
}
export interface FinalSubjectResult {
    totalMarks: bigint;
    subject: Subject;
}
export enum AssessmentType {
    fa1 = "fa1",
    fa2 = "fa2",
    sa1 = "sa1",
    sa2 = "sa2",
    writtenWork1 = "writtenWork1",
    writtenWork2 = "writtenWork2",
    projectWork1 = "projectWork1",
    projectWork2 = "projectWork2"
}
export enum Subject {
    maths = "maths",
    scienceAndSocial = "scienceAndSocial",
    odia = "odia",
    english = "english",
    drawing = "drawing"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFinalSubjectResults(studentId: string): Promise<Array<FinalSubjectResult>>;
    getRawMarks(studentId: string): Promise<Array<MarkEntry>>;
    getSessionReport(): Promise<Array<FinalSessionResult>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitMarks(studentId: string, subject: Subject, assessmentType: AssessmentType, marks: bigint): Promise<void>;
}

import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface MaterialPublic {
    id: bigint;
    title: string;
    description: string;
    isPaid: boolean;
    subjectId: bigint;
}
export interface QuizQuestion {
    correctOption: string;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
}
export interface QuizPublic {
    id: bigint;
    title: string;
    questions: Array<QuizQuestionPublic>;
    courseType: string;
}
export interface CounselingRequest {
    id: bigint;
    name: string;
    email: string;
    courseInterest: string;
    phone: string;
}
export interface QuizQuestionPublic {
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
}
export interface StudentAccount {
    id: bigint;
    duration: string;
    username: string;
    isActive: boolean;
    passwordHash: string;
    courseType: string;
}
export interface ContactMessage {
    id: bigint;
    name: string;
    email: string;
    message: string;
}
export interface QuizAttempt {
    id: bigint;
    username: string;
    score: bigint;
    totalQuestions: bigint;
    timestamp: bigint;
    quizId: bigint;
}
export interface VideoPublic {
    id: bigint;
    title: string;
    freeCourseTypes: Array<string>;
    subjectId: bigint;
}
export interface PaymentRequest {
    id: bigint;
    status: string;
    itemId: bigint;
    username: string;
    upiRef: string;
    itemType: string;
    amount: bigint;
}
export interface Subject {
    id: bigint;
    subjectName: string;
    courseType: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approvePayment(id: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkPaymentApproved(username: string, itemType: string, itemId: bigint): Promise<boolean>;
    createMaterial(subjectId: bigint, title: string, description: string, blob: ExternalBlob, isPaid: boolean): Promise<bigint>;
    createPaymentRequest(username: string, password: string, itemType: string, itemId: bigint, amount: bigint, upiRef: string): Promise<bigint>;
    createQuiz(title: string, courseType: string, questions: Array<QuizQuestion>): Promise<bigint>;
    createStudent(username: string, password: string, courseType: string, duration: string): Promise<bigint>;
    createSubject(courseType: string, subjectName: string): Promise<bigint>;
    createVideo(subjectId: bigint, title: string, videoUrl: string, freeCourseTypes: Array<string>): Promise<bigint>;
    deleteMaterial(id: bigint): Promise<void>;
    deleteQuiz(id: bigint): Promise<void>;
    deleteSubject(id: bigint): Promise<void>;
    deleteVideo(id: bigint): Promise<void>;
    getAllContactMessages(): Promise<Array<ContactMessage>>;
    getAllCounselingRequests(): Promise<Array<CounselingRequest>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMaterialAccess(username: string, password: string, materialId: bigint): Promise<ExternalBlob | null>;
    getStudentByUsername(username: string): Promise<StudentAccount | null>;
    getStudentQuizAttemptCount(username: string, password: string): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideoAccess(username: string, password: string, videoId: bigint): Promise<string | null>;
    isCallerAdmin(): Promise<boolean>;
    listAllPayments(): Promise<Array<PaymentRequest>>;
    listAllStudents(): Promise<Array<StudentAccount>>;
    listMaterials(subjectId: bigint): Promise<Array<MaterialPublic>>;
    listQuizzes(courseType: string): Promise<Array<QuizPublic>>;
    listSubjects(courseType: string): Promise<Array<Subject>>;
    listVideos(subjectId: bigint): Promise<Array<VideoPublic>>;
    rejectPayment(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    studentLogin(username: string, password: string): Promise<boolean>;
    submitContactMessage(name: string, email: string, message: string): Promise<void>;
    submitCounselingRequest(name: string, email: string, phone: string, courseInterest: string): Promise<void>;
    submitQuizAttempt(username: string, password: string, quizId: bigint, answers: Array<string>): Promise<QuizAttempt | null>;
    updateStudent(id: bigint, courseType: string, duration: string, isActive: boolean): Promise<void>;
    updateVideoFreeBatches(videoId: bigint, freeCourseTypes: Array<string>): Promise<void>;
}

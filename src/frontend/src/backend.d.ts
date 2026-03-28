import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ContactMessage {
    id: bigint;
    name: string;
    email: string;
    message: string;
}
export interface UserProfile {
    name: string;
}
export interface CounselingRequest {
    id: bigint;
    name: string;
    email: string;
    courseInterest: string;
    phone: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllContactMessages(): Promise<Array<ContactMessage>>;
    getAllCounselingRequests(): Promise<Array<CounselingRequest>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitContactMessage(name: string, email: string, message: string): Promise<void>;
    submitCounselingRequest(name: string, email: string, phone: string, courseInterest: string): Promise<void>;
}

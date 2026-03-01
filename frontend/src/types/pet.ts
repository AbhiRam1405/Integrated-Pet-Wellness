export const PetType = {
    DOG: 'DOG',
    CAT: 'CAT',
    BIRD: 'BIRD',
    RABBIT: 'RABBIT',
    OTHER: 'OTHER',
} as const;

export type PetType = (typeof PetType)[keyof typeof PetType];

export const Gender = {
    MALE: 'MALE',
    FEMALE: 'FEMALE',
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export interface PetRequest {
    name: string;
    type: PetType;
    breed: string;
    age: number;
    gender: Gender;
    weight: number;
    bio?: string;
    imageUrl?: string;
}

export interface PetResponse {
    id: string;
    name: string;
    type: PetType;
    breed: string;
    age: number;
    gender: Gender;
    weight: number;
    bio: string;
    imageUrl: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
}

export interface HealthRecordRequest {
    date: string;
    type: string;
    description: string;
    veterinarian: string;
    notes?: string;
    followUpDate?: string;
}

export interface HealthRecordResponse {
    id: string;
    petId: string;
    date: string;
    type: string;
    description: string;
    veterinarian: string;
    notes: string;
    followUpDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface MedicalHistoryRequest {
    petId: string;
    visitDate: string;
    doctorName: string;
    diagnosis: string;
    treatment: string;
    notes?: string;
    followUpDate?: string;
}

export interface MedicalHistoryResponse {
    id: string;
    petId: string;
    visitDate: string;
    doctorName: string;
    diagnosis: string;
    treatment: string;
    notes: string;
    followUpDate: string;
    attachmentPath: string;
    createdAt: string;
    updatedAt: string;
}

export type VaccinationStatus = 'UPCOMING' | 'COMPLETED' | 'OVERDUE';

export interface VaccinationRequest {
    petId: string;
    vaccineName: string;
    doctorName: string;
    givenDate: string;
    nextDueDate: string;
}

export interface VaccinationResponse {
    id: string;
    petId: string;
    vaccineName: string;
    doctorName: string;
    lastGivenDate: string | null;
    givenDate: string;
    nextDueDate: string;
    status: VaccinationStatus;
    doseNumber: number;
    reminderSent: boolean;
    reminderCount: number;
    attachmentPath: string | null;
    createdAt: string;
}

export interface VaccinationAudit {
    id: string;
    vaccinationId: string;
    petId: string;
    vaccineName: string;
    doctorName: string;
    lastGivenDate: string | null;
    givenDate: string;
    nextDueDate: string;
    status: VaccinationStatus;
    doseNumber: number;
    revision: number;
    revisionType: 'ADD' | 'MOD' | 'DEL';
    revisionTimestamp: string;
}


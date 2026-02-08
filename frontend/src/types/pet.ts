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

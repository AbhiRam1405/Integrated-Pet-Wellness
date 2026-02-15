export interface UserProfileResponse {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    petCount?: number;
    experienceYears?: number;
    petPreferences?: string;
    role: string;
    isEmailVerified: boolean;
    isApproved: boolean;
    profileCompletion: number;
    profileImageUrl?: string;
    dateOfBirth?: string;
    gender?: string;
    bio?: string;
    preferredLanguage?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    linkedinUrl?: string;
    createdAt: string;
}

export interface UpdateProfileRequest {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    petCount?: number;
    experienceYears?: number;
    petPreferences?: string;
    profileImageUrl?: string;
    dateOfBirth?: string;
    gender?: string;
    bio?: string;
    preferredLanguage?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    linkedinUrl?: string;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}

export interface MessageResponse {
    message: string;
    success: boolean;
}

export interface UserProfileResponse {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
    role: string;
    isEmailVerified: boolean;
    profileImageUrl?: string;
    createdAt: string;
}

export interface UpdateProfileRequest {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}

export interface MessageResponse {
    message: string;
    success: boolean;
}

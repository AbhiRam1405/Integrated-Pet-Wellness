export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
}

export interface LoginRequest {
    emailOrUsername: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    id: string;
    username: string;
    email: string;
    roles: string[];
}

export interface MessageResponse {
    message: string;
}

export interface UserProfileResponse {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
    roles: string[];
    profileCompletion: number;
    isApproved: boolean;
    createdAt: string;
}

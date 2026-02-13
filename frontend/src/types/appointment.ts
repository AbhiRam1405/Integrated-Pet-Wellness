export const ConsultationType = {
    ONLINE: 'ONLINE',
    IN_CLINIC: 'IN_CLINIC',
} as const;

export type ConsultationType = (typeof ConsultationType)[keyof typeof ConsultationType];

export const SlotStatus = {
    AVAILABLE: 'AVAILABLE',
    BOOKED: 'BOOKED',
    CANCELLED: 'CANCELLED',
} as const;

export type SlotStatus = (typeof SlotStatus)[keyof typeof SlotStatus];

export const AppointmentStatus = {
    SCHEDULED: 'SCHEDULED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
} as const;

export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export interface AppointmentSlotResponse {
    id: string;
    date: string;
    time: string;
    consultationType: ConsultationType;
    veterinarianName: string;
    status: SlotStatus;
    duration: number;
    consultationFee?: number;
    createdAt: string;
    updatedAt: string;
}

export interface BookAppointmentRequest {
    petId: string;
    slotId: string;
    notes?: string;
}

export interface AppointmentResponse {
    id: string;
    userId: string;
    petId: string;
    slotId: string;
    appointmentDate: string;
    appointmentTime: string;
    consultationType: ConsultationType;
    veterinarianName: string;
    status: AppointmentStatus;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

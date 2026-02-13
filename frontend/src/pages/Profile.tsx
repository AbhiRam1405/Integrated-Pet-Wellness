import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { userApi } from '../api/userApi';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { User, Lock, Mail, Phone, MapPin, Calendar, Shield, Loader2 } from 'lucide-react';
import type { UserProfileResponse } from '../types/user';

const updateProfileSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
});

const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

type TabType = 'overview' | 'edit' | 'security';

export default function Profile() {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [profile, setProfile] = useState<UserProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        formState: { errors: profileErrors },
        reset: resetProfile,
    } = useForm<UpdateProfileFormValues>({
        resolver: zodResolver(updateProfileSchema),
    });

    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        formState: { errors: passwordErrors },
        reset: resetPassword,
    } = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await userApi.getProfile();
            setProfile(data);
            resetProfile({
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber,
                address: data.address,
            });
        } catch (err: any) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const onUpdateProfile = async (data: UpdateProfileFormValues) => {
        try {
            setUpdateLoading(true);
            setError(null);
            setSuccess(null);
            const updated = await userApi.updateProfile(data);
            setProfile(updated);
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            const errorData = err.response?.data;
            setError(errorData?.message || 'Failed to update profile');
        } finally {
            setUpdateLoading(false);
        }
    };

    const onChangePassword = async (data: ChangePasswordFormValues) => {
        try {
            setPasswordLoading(true);
            setError(null);
            setSuccess(null);
            await userApi.changePassword({
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
            });
            setSuccess('Password changed successfully!');
            resetPassword();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            const errorData = err.response?.data;
            setError(errorData?.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const getInitials = () => {
        if (!profile) return '?';
        return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <p className="text-lg text-slate-600">Failed to load profile</p>
                    <Button onClick={fetchProfile} className="mt-4">
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                {/* Profile Header */}
                <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200">
                    <div className="flex flex-col items-center gap-6 sm:flex-row">
                        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-3xl font-bold text-white shadow-lg shadow-indigo-200">
                            {getInitials()}
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-3xl font-bold text-slate-900">
                                {profile.firstName} {profile.lastName}
                            </h1>
                            <p className="mt-1 text-lg text-slate-600">@{profile.username}</p>
                            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Calendar size={16} />
                                    <span>Member since {formatDate(profile.createdAt)}</span>
                                </div>
                                {profile.isEmailVerified && (
                                    <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-600">
                                        <Shield size={16} />
                                        <span>Verified</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-6 flex gap-2 overflow-x-auto rounded-2xl bg-white p-2 shadow-lg shadow-slate-200">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 rounded-xl px-6 py-3 text-sm font-bold transition-all ${activeTab === 'overview'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('edit')}
                        className={`flex-1 rounded-xl px-6 py-3 text-sm font-bold transition-all ${activeTab === 'edit'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Edit Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex-1 rounded-xl px-6 py-3 text-sm font-bold transition-all ${activeTab === 'security'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Security
                    </button>
                </div>

                {/* Tab Content */}
                <div className="mt-6 rounded-3xl bg-white p-8 shadow-xl shadow-slate-200">
                    {/* Success/Error Messages */}
                    {error && (
                        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-600">
                            {success}
                        </div>
                    )}

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-slate-900">Account Information</h2>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-200 p-4">
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <User size={20} />
                                        <span className="text-sm font-semibold">Username</span>
                                    </div>
                                    <p className="mt-2 text-lg font-bold text-slate-900">{profile.username}</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 p-4">
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <Mail size={20} />
                                        <span className="text-sm font-semibold">Email</span>
                                    </div>
                                    <p className="mt-2 text-lg font-bold text-slate-900">{profile.email}</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 p-4">
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <Phone size={20} />
                                        <span className="text-sm font-semibold">Phone</span>
                                    </div>
                                    <p className="mt-2 text-lg font-bold text-slate-900">{profile.phoneNumber}</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 p-4">
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <MapPin size={20} />
                                        <span className="text-sm font-semibold">Address</span>
                                    </div>
                                    <p className="mt-2 text-lg font-bold text-slate-900">{profile.address}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Profile Tab */}
                    {activeTab === 'edit' && (
                        <div>
                            <h2 className="mb-6 text-2xl font-bold text-slate-900">Edit Profile</h2>
                            <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-6">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <Input
                                        label="First Name"
                                        placeholder="John"
                                        error={profileErrors.firstName?.message}
                                        {...registerProfile('firstName')}
                                    />
                                    <Input
                                        label="Last Name"
                                        placeholder="Doe"
                                        error={profileErrors.lastName?.message}
                                        {...registerProfile('lastName')}
                                    />
                                    <Input
                                        label="Phone Number"
                                        placeholder="+1234567890"
                                        error={profileErrors.phoneNumber?.message}
                                        {...registerProfile('phoneNumber')}
                                    />
                                </div>
                                <Input
                                    label="Address"
                                    placeholder="123 Main St, City, State"
                                    error={profileErrors.address?.message}
                                    {...registerProfile('address')}
                                />
                                <div className="flex gap-4">
                                    <Button type="submit" className="flex-1" isLoading={updateLoading}>
                                        Save Changes
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => resetProfile()}
                                        disabled={updateLoading}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div>
                            <h2 className="mb-6 text-2xl font-bold text-slate-900">Change Password</h2>
                            <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-6">
                                <Input
                                    label="Current Password"
                                    type="password"
                                    placeholder="••••••••"
                                    error={passwordErrors.oldPassword?.message}
                                    {...registerPassword('oldPassword')}
                                />
                                <Input
                                    label="New Password"
                                    type="password"
                                    placeholder="••••••••"
                                    error={passwordErrors.newPassword?.message}
                                    {...registerPassword('newPassword')}
                                />
                                <Input
                                    label="Confirm New Password"
                                    type="password"
                                    placeholder="••••••••"
                                    error={passwordErrors.confirmPassword?.message}
                                    {...registerPassword('confirmPassword')}
                                />
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-700">Password Requirements:</p>
                                    <ul className="mt-2 space-y-1 text-sm text-slate-600">
                                        <li>• At least 8 characters long</li>
                                        <li>• Contains uppercase and lowercase letters</li>
                                        <li>• Contains at least one number</li>
                                        <li>• Contains at least one special character</li>
                                    </ul>
                                </div>
                                <Button type="submit" className="w-full" isLoading={passwordLoading}>
                                    <Lock size={18} />
                                    Change Password
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../features/auth/authSlice';
import { authApi } from '../api/authApi';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Dog, ArrowLeft } from 'lucide-react';
import type { RootState } from '../store';

const loginSchema = z.object({
    emailOrUsername: z.string().min(3, 'Username or Email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state: RootState) => state.auth);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            dispatch(loginStart());
            const response = await authApi.login(data);
            dispatch(loginSuccess({ user: response, token: response.token }));

            const isAdmin = response.roles?.includes('ROLE_ADMIN');
            if (isAdmin) {
                navigate('/admin/approvals');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            // Backend returns ErrorResponse { status, message, timestamp }
            const backendMessage = err.response?.data?.message;
            const httpStatus = err.response?.status;

            let displayMessage: string;
            if (backendMessage) {
                displayMessage = backendMessage;
            } else if (httpStatus === 401) {
                displayMessage = 'Invalid username/email or password. Please try again.';
            } else if (httpStatus === 403) {
                displayMessage = 'Access denied. Please contact support.';
            } else {
                displayMessage = 'Login failed. Please try again.';
            }
            dispatch(loginFailure(displayMessage));
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-xl shadow-slate-200 relative pt-16">
                <Link
                    to="/"
                    className="absolute top-6 left-8 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Home
                </Link>
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                        <Dog size={32} strokeWidth={2.5} />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Log in to manage your pets and appointments
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {error && (() => {
                        const isEmailNotVerified = error.includes('EMAIL_NOT_VERIFIED');
                        const isPendingApproval = error.includes('APPROVAL_PENDING') || error.includes('pending');
                        const isWarning = isEmailNotVerified || isPendingApproval;
                        
                        // Clean up the prefixed codes to show a readable message
                        const displayError = error
                            .replace('EMAIL_NOT_VERIFIED: ', '')
                            .replace('APPROVAL_PENDING: ', '');

                        return (
                            <div className={`rounded-xl p-4 text-sm font-medium flex gap-3 items-start ${isWarning
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                                <div className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${isWarning ? 'bg-amber-400' : 'bg-red-400'}`} />
                                <span>{displayError}</span>
                            </div>
                        );
                    })()}

                    <div className="space-y-4">
                        <Input
                            label="Username or Email"
                            type="text"
                            autoComplete="username"
                            placeholder="Enter your username or email"
                            error={errors.emailOrUsername?.message}
                            {...register('emailOrUsername')}
                        />
                        <Input
                            label="Password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            error={errors.password?.message}
                            {...register('password')}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <Link
                                to="/forgot-password"
                                className="font-semibold text-indigo-600 hover:text-indigo-500"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                        Sign in
                    </Button>

                    <p className="text-center text-sm text-slate-600">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="font-semibold text-indigo-600 hover:text-indigo-500"
                        >
                            Start for free
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../features/auth/authSlice';
import { authApi } from '../api/authApi';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Dog } from 'lucide-react';
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
            navigate('/dashboard');
        } catch (err: any) {
            dispatch(loginFailure(err.response?.data?.message || 'Login failed. Please check your credentials.'));
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-xl shadow-slate-200">
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
                    {error && (
                        <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
                            {error}
                        </div>
                    )}

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

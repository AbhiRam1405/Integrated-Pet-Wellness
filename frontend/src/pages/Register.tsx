import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Dog } from 'lucide-react';
import { useState } from 'react';

const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    phoneNumber: z.string().min(10, 'Invalid phone number'),
    address: z.string().min(5, 'Address is required'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            setLoading(true);
            setError(null);
            await authApi.register(data);
            // Navigate to OTP verification page with email
            navigate('/verify-otp', { state: { email: data.email } });
        } catch (err: any) {
            const errorData = err.response?.data;
            let msg = 'Registration failed. Please try again.';

            if (typeof errorData === 'string') {
                msg = errorData;
            } else if (errorData?.message) {
                msg = errorData.message;
            } else if (typeof errorData === 'object') {
                // Handle validation error map
                const firstError = Object.values(errorData)[0];
                if (typeof firstError === 'string') msg = firstError;
            }

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl space-y-8 rounded-3xl bg-white p-10 shadow-xl shadow-slate-200">
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                        <Dog size={32} strokeWidth={2.5} />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
                        Create an Account
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Join thousands of pet owners in the Wellness platform
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <Input
                            label="Username"
                            placeholder="johndoe"
                            error={errors.username?.message}
                            {...register('username')}
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="john@example.com"
                            error={errors.email?.message}
                            {...register('email')}
                        />
                        <Input
                            label="First Name"
                            placeholder="John"
                            error={errors.firstName?.message}
                            {...register('firstName')}
                        />
                        <Input
                            label="Last Name"
                            placeholder="Doe"
                            error={errors.lastName?.message}
                            {...register('lastName')}
                        />
                        <Input
                            label="Phone Number"
                            placeholder="1234567890"
                            error={errors.phoneNumber?.message}
                            {...register('phoneNumber')}
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            error={errors.password?.message}
                            {...register('password')}
                        />
                    </div>

                    <Input
                        label="Home Address"
                        placeholder="123 Pet Lane, Animal City"
                        error={errors.address?.message}
                        {...register('address')}
                    />

                    <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                        Create Account
                    </Button>

                    <p className="text-center text-sm text-slate-600">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="font-semibold text-indigo-600 hover:text-indigo-500"
                        >
                            Sign in instead
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

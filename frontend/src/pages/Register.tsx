import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Dog, ArrowLeft } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Country, State, City } from 'country-state-city';

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
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    country: z.string().min(2, 'Country is required'),
    zipCode: z.string().min(5, 'Zip Code is required'),
    petCount: z.preprocess((val) => (val === '' ? 0 : Number(val)), z.number().min(0, 'Must be 0 or more')),
    experienceYears: z.preprocess((val) => (val === '' ? 0 : Number(val)), z.number().min(0, 'Must be 0 or more')),
    petPreferences: z.string().optional(),
});

// Explicitly define the form values type
type RegisterFormValues = {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    petCount: number;
    experienceYears: number;
    petPreferences?: string;
};

export default function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema) as any,
        defaultValues: {
            petCount: 0,
            experienceYears: 0,
            country: '',
            state: '',
            city: '',
        }
    });

    const selectedCountry = watch('country');
    const selectedState = watch('state');

    const countries = useMemo(() =>
        Country.getAllCountries().map(c => ({ value: c.isoCode, label: c.name })),
        []);

    const states = useMemo(() =>
        selectedCountry ? State.getStatesOfCountry(selectedCountry).map(s => ({ value: s.isoCode, label: s.name })) : [],
        [selectedCountry]);

    const cities = useMemo(() =>
        (selectedCountry && selectedState) ? City.getCitiesOfState(selectedCountry, selectedState).map(c => ({ value: c.name, label: c.name })) : [],
        [selectedCountry, selectedState]);

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            setLoading(true);
            setError(null);
            await authApi.register(data);
            // Navigate to OTP verification page with email
            navigate('/verify-otp', { state: { email: data.email } });
        } catch (err: any) {
            console.error('Registration error:', err);

            let errorMessage = 'Registration failed. Please try again.';

            if (err.response) {
                // Server responded with a status code outside the 2xx range
                const errorData = err.response.data;
                if (typeof errorData === 'string') {
                    errorMessage = errorData;
                } else if (errorData?.message) {
                    errorMessage = errorData.message;
                } else if (typeof errorData === 'object' && errorData !== null) {
                    // Try to find the first validation error message
                    const values = Object.values(errorData);
                    if (values.length > 0 && typeof values[0] === 'string') {
                        errorMessage = values[0] as string;
                    }
                }
            } else if (err.request) {
                // The request was made but no response was received
                errorMessage = 'No response from server. Please check your internet connection.';
            } else {
                // Something happened in setting up the request
                errorMessage = err.message || errorMessage;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl space-y-8 rounded-3xl bg-white p-10 shadow-xl shadow-slate-200 relative pt-16">
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

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <Input
                            label="Home Address"
                            placeholder="123 Pet Lane"
                            error={errors.address?.message}
                            {...register('address')}
                        />
                        <Select
                            label="Country"
                            options={countries}
                            error={errors.country?.message}
                            {...register('country', {
                                onChange: () => {
                                    setValue('state', '');
                                    setValue('city', '');
                                }
                            })}
                        />
                        <Select
                            label="State"
                            options={states}
                            error={errors.state?.message}
                            disabled={!selectedCountry}
                            {...register('state', {
                                onChange: () => {
                                    setValue('city', '');
                                }
                            })}
                        />
                        <Select
                            label="City"
                            options={cities}
                            error={errors.city?.message}
                            disabled={!selectedState}
                            {...register('city')}
                        />
                        <Input
                            label="Zip Code"
                            placeholder="12345"
                            error={errors.zipCode?.message}
                            {...register('zipCode')}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <Input
                            label="Number of Pets"
                            type="number"
                            min="0"
                            placeholder="1"
                            error={errors.petCount?.message}
                            {...register('petCount')}
                        />
                        <Input
                            label="Years of Experience"
                            type="number"
                            min="0"
                            placeholder="2"
                            error={errors.experienceYears?.message}
                            {...register('experienceYears')}
                        />
                        <Input
                            label="Pet Preferences (Optional)"
                            placeholder="Dogs, Cats..."
                            error={errors.petPreferences?.message}
                            {...register('petPreferences')}
                        />
                    </div>

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

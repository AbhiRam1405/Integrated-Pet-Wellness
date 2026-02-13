import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Mail, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

const otpSchema = z.object({
    otp: z.string()
        .length(6, 'OTP must be exactly 6 digits')
        .regex(/^\d+$/, 'OTP must contain only numbers'),
});

type OtpFormValues = z.infer<typeof otpSchema>;

export default function VerifyOtp() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(0);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<OtpFormValues>({
        resolver: zodResolver(otpSchema),
    });

    // Redirect if no email provided
    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

    // Countdown timer for resend button
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const onSubmit = async (data: OtpFormValues) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);
            await authApi.verifyOtp(email, data.otp);
            setSuccess('Email verified successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            const errorData = err.response?.data;
            let msg = 'Invalid OTP. Please try again.';

            if (typeof errorData === 'string') {
                msg = errorData;
            } else if (errorData?.message) {
                msg = errorData.message;
            }

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            setResending(true);
            setError(null);
            setSuccess(null);
            await authApi.resendOtp(email);
            setSuccess('New OTP sent to your email!');
            setCountdown(60); // 60 second cooldown
        } catch (err: any) {
            const errorData = err.response?.data;
            let msg = 'Failed to resend OTP. Please try again.';

            if (typeof errorData === 'string') {
                msg = errorData;
            } else if (errorData?.message) {
                msg = errorData.message;
            }

            setError(msg);
        } finally {
            setResending(false);
        }
    };

    if (!email) {
        return null;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-xl shadow-slate-200">
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                        <Mail size={32} strokeWidth={2.5} />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
                        Verify Your Email
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        We've sent a 6-digit OTP to
                    </p>
                    <p className="mt-1 text-sm font-semibold text-indigo-600">
                        {email}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                        Check your email inbox (and spam folder)
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {error && (
                        <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="rounded-xl bg-green-50 p-4 text-sm font-medium text-green-600">
                            {success}
                        </div>
                    )}

                    <Input
                        label="Enter OTP"
                        placeholder="123456"
                        maxLength={6}
                        error={errors.otp?.message}
                        {...register('otp')}
                        className="text-center text-2xl font-bold tracking-widest"
                    />

                    <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                        Verify Email
                    </Button>

                    <div className="text-center">
                        <p className="text-sm text-slate-600">
                            Didn't receive the OTP?{' '}
                            {countdown > 0 ? (
                                <span className="font-semibold text-slate-400">
                                    Resend in {countdown}s
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={resending}
                                    className="font-semibold text-indigo-600 hover:text-indigo-500 disabled:text-slate-400"
                                >
                                    {resending ? 'Sending...' : 'Resend OTP'}
                                </button>
                            )}
                        </p>
                    </div>

                    <div className="text-center">
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
                        >
                            <ArrowLeft size={16} />
                            Back to Registration
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

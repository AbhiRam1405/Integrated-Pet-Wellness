import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Verification token is missing.');
            return;
        }

        const verify = async () => {
            try {
                const response = await authApi.verifyEmail(token);
                setStatus('success');
                setMessage(response.message || 'Your email has been successfully verified.');
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed. The token may be expired or invalid.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-2xl shadow-indigo-100 ring-1 ring-slate-100 text-center">
                {status === 'loading' && (
                    <div className="py-10">
                        <Loader2 className="h-16 w-16 animate-spin text-indigo-600 mx-auto mb-6" />
                        <h1 className="text-2xl font-black text-slate-900 mb-2">Verifying Email</h1>
                        <p className="text-slate-500 font-medium italic">Please wait while we confirm your identity...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="py-6">
                        <div className="h-20 w-20 bg-green-50 rounded-3xl flex items-center justify-center text-green-500 mx-auto mb-6">
                            <CheckCircle2 size={40} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 mb-2">Account Verified!</h1>
                        <p className="text-slate-500 font-medium italic mb-8">{message}</p>
                        <Button onClick={() => navigate('/login')} className="w-full">
                            Go to Login <ArrowRight size={18} className="ml-2" />
                        </Button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="py-6">
                        <div className="h-20 w-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6">
                            <XCircle size={40} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 mb-2">Verification Failed</h1>
                        <p className="text-slate-500 font-medium italic mb-8">{message}</p>
                        <div className="space-y-3">
                            <Button onClick={() => navigate('/register')} className="w-full">
                                Try Registering Again
                            </Button>
                            <Link to="/login" className="block text-sm font-bold text-indigo-600 hover:text-indigo-700">
                                Back to Login
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

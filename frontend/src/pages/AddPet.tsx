import { useNavigate } from 'react-router-dom';
import { petApi } from '../api/petApi';
import { PetForm } from '../components/PetForm';
import { ArrowLeft, Dog } from 'lucide-react';
import { useState } from 'react';

export default function AddPet() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);
            setError(null);
            await petApi.registerPet(data);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register pet. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-6"
            >
                <ArrowLeft size={18} className="mr-1.5" />
                Back to Dashboard
            </button>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 overflow-hidden ring-1 ring-slate-100">
                <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold">Register New Pet</h1>
                        <p className="text-indigo-100 mt-2 font-medium italic">Tell us about your furry, feathery, or scaly friend!</p>
                    </div>
                    <Dog className="absolute -bottom-4 -right-4 h-32 w-32 text-indigo-500 opacity-30 transform rotate-12" />
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
                            {error}
                        </div>
                    )}

                    <PetForm
                        onSubmit={onSubmit}
                        onCancel={() => navigate(-1)}
                        isLoading={loading}
                        buttonText="Complete Registration"
                    />
                </div>
            </div>
        </div>
    );
}

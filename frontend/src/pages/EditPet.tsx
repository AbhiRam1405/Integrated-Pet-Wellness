import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { petApi } from '../api/petApi';
import { PetForm } from '../components/PetForm';
import { type PetResponse } from '../types/pet';
import { ArrowLeft, Dog, Loader2 } from 'lucide-react';

export default function EditPet() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [pet, setPet] = useState<PetResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPet = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await petApi.getPetById(id);
                setPet(data);
            } catch (err) {
                console.error('Failed to fetch pet:', err);
                setError('Failed to load pet details.');
            } finally {
                setLoading(false);
            }
        };
        fetchPet();
    }, [id]);

    const onSubmit = async (data: any) => {
        if (!id) return;
        try {
            setSubmitting(true);
            setError(null);
            await petApi.updatePet(id, data);
            navigate(`/pets/${id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update pet details.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="mt-4 text-slate-600 font-medium">Loading pet details...</p>
            </div>
        );
    }

    if (!pet && !loading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <p className="text-red-600 font-medium mb-4">Pet not found</p>
                    <button onClick={() => navigate('/dashboard')} className="text-indigo-600 font-bold">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-6"
            >
                <ArrowLeft size={18} className="mr-1.5" />
                Back
            </button>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 overflow-hidden ring-1 ring-slate-100">
                <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold">Edit Pet Profile</h1>
                        <p className="text-indigo-100 mt-2 font-medium italic">Update information for {pet?.name}</p>
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
                        initialData={pet!}
                        onSubmit={onSubmit}
                        onCancel={() => navigate(-1)}
                        isLoading={submitting}
                        buttonText="Update Pet Profile"
                    />
                </div>
            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { petApi } from '../api/petApi';
import type { PetResponse, HealthRecordResponse } from '../types/pet';
import { Button } from '../components/Button';
import { ArrowLeft, Calendar, FileText, Loader2, Plus, Stethoscope, User, Dog } from 'lucide-react';

export default function PetDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [pet, setPet] = useState<PetResponse | null>(null);
    const [records, setRecords] = useState<HealthRecordResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadData(id);
        }
    }, [id]);

    const loadData = async (petId: string) => {
        try {
            setLoading(true);
            const [petData, recordsData] = await Promise.all([
                petApi.getPetById(petId),
                petApi.getHealthRecords(petId),
            ]);
            setPet(petData);
            setRecords(recordsData);
        } catch (err) {
            alert('Failed to load pet details.');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !pet) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-8"
            >
                <ArrowLeft size={18} className="mr-1.5" />
                Back to Dashboard
            </button>

            {/* Pet Header Section */}
            <div className="bg-white rounded-3xl p-8 shadow-sm ring-1 ring-slate-100 mb-10 overflow-hidden relative">
                <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                    <div className="h-32 w-32 flex items-center justify-center rounded-3xl bg-indigo-50 text-6xl shadow-inner border-4 border-white">
                        {pet.type === 'DOG' ? '🐶' : pet.type === 'CAT' ? '🐱' : '🐾'}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-4xl font-bold text-slate-900">{pet.name}</h1>
                        <p className="text-lg font-medium text-slate-500 mt-1">{pet.breed}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700">
                                <Calendar size={16} className="mr-2" />
                                {pet.age} years old
                            </span>
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700">
                                <User size={16} className="mr-2 text-indigo-500" />
                                {pet.gender}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700">
                                <FileText size={16} className="mr-2 text-amber-500" />
                                {pet.weight} kg
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <Button variant="primary">Edit Profile</Button>
                        <Button variant="outline" className="text-red-600 border-red-100 hover:bg-red-50">Delete Pet</Button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 p-8 text-indigo-100 opacity-20 pointer-events-none">
                    <Dog size={120} strokeWidth={1} />
                </div>
            </div>

            {/* Bio Section */}
            {pet.bio && (
                <div className="mb-10 bg-indigo-50 rounded-2xl p-6 border-l-4 border-indigo-500">
                    <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-2">Pet Bio</h3>
                    <p className="text-indigo-800 font-medium italic">"{pet.bio}"</p>
                </div>
            )}

            {/* Health Records Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                            <Stethoscope size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Health History</h2>
                    </div>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Plus size={18} />
                        Add Record
                    </Button>
                </div>

                {records.length === 0 ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                        <p className="text-slate-500 font-medium">No medical records found for {pet.name}.</p>
                    </div>
                ) : (
                    <div className="relative space-y-8 before:absolute before:inset-y-0 before:left-8 before:w-0.5 before:bg-slate-200">
                        {records.map((record) => (
                            <div key={record.id} className="relative pl-16 group">
                                <div className="absolute left-6 top-0 h-4 w-4 rounded-full bg-white ring-4 ring-indigo-500 animate-pulse group-hover:ring-indigo-600" />
                                <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                        <h4 className="text-lg font-bold text-slate-900">{record.type}</h4>
                                        <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                                            {new Date(record.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-slate-700 font-medium leading-relaxed">{record.description}</p>
                                    <div className="mt-4 pt-4 border-t border-slate-50 flex flex-wrap gap-4 text-sm text-slate-500">
                                        <span className="flex items-center">
                                            <Stethoscope size={16} className="mr-1.5 text-indigo-400" />
                                            {record.veterinarian}
                                        </span>
                                        {record.followUpDate && (
                                            <span className="flex items-center text-amber-600 font-bold">
                                                <Calendar size={16} className="mr-1.5" />
                                                Next: {new Date(record.followUpDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

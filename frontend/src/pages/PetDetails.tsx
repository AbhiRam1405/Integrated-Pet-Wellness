import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { petApi } from '../api/petApi';
import { reportApi } from '../api/reportApi';
import type { PetResponse } from '../types/pet';
import { ArrowLeft, Dog, Calendar, Weight, Activity, Heart, Edit2, Trash2, FileText, Syringe, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import MedicalHistory from '../components/MedicalHistory';
import VaccinationTable from '../components/VaccinationTable';
import toast from 'react-hot-toast';

type HealthTab = 'medical' | 'vaccination';

export default function PetDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [pet, setPet] = useState<PetResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<HealthTab>('medical');
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const fetchPetDetails = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await petApi.getPetById(id);
                setPet(data);
            } catch (err) {
                console.error('Failed to fetch pet details:', err);
                setError('Failed to load pet details. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchPetDetails();
    }, [id]);

    const handleDelete = () => {
        if (!pet) return;
        toast((t) => (
            <div className="flex flex-col gap-2 p-1">
                <div className="flex items-center gap-2 text-red-600 mb-1">
                    <Trash2 size={18} />
                    <span className="font-bold">Delete Pet?</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                    Are you sure you want to remove {pet.name}? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2 mt-3">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => { toast.dismiss(t.id); await processDelete(); }}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const processDelete = async () => {
        if (!pet) return;
        try {
            await petApi.deletePet(pet.id);
            toast.success('Pet deleted successfully');
            navigate('/dashboard');
        } catch (err) {
            toast.error('Failed to delete pet.');
        }
    };

    const handleDownloadReport = async () => {
        if (!pet) return;
        try {
            setIsDownloading(true);
            const data = await reportApi.getPetHealthReport(pet.id);

            // Create download link
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `health-report-${pet.name.toLowerCase()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Report downloaded successfully');
        } catch (err) {
            console.error('Failed to download report:', err);
            toast.error('Failed to download health report.');
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !pet) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <p className="text-red-600 font-medium mb-4">{error || 'Pet not found'}</p>
                    <Button onClick={() => navigate('/dashboard')} variant="outline">
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
            {/* Back */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
                <ArrowLeft size={18} className="mr-1.5" />
                Back
            </button>

            {/* ── Pet Profile Card ── */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 overflow-hidden ring-1 ring-indigo-100">
                {/* Header Banner */}
                <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">{pet.name}</h1>
                                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                                    {pet.type}
                                </span>
                            </div>
                            <p className="text-indigo-100 font-medium opacity-90">{pet.breed} • {pet.gender}</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="secondary"
                                className="bg-white text-indigo-600 hover:bg-indigo-50 flex items-center gap-2"
                                onClick={handleDownloadReport}
                                isLoading={isDownloading}
                            >
                                <Download size={18} />
                                Health Report
                            </Button>
                            <Link to={`/pets/edit/${pet.id}`}>
                                <Button variant="secondary" className="bg-indigo-500 text-white hover:bg-indigo-400 border-none flex items-center gap-2">
                                    <Edit2 size={18} />
                                    Edit
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
                                onClick={handleDelete}
                            >
                                <Trash2 size={18} />
                                Delete
                            </Button>
                        </div>
                    </div>
                    <Dog className="absolute -bottom-4 -right-4 h-48 w-48 text-indigo-500 opacity-30 transform rotate-12" />
                </div>

                {/* Stats + Bio */}
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Calendar size={24} /></div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Age</p>
                                <p className="text-lg font-bold text-slate-900">{pet.age} years</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600"><Weight size={24} /></div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Weight</p>
                                <p className="text-lg font-bold text-slate-900">{pet.weight} kg</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                            <div className="bg-purple-100 p-3 rounded-xl text-purple-600"><Activity size={24} /></div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Status</p>
                                <p className="text-lg font-bold text-slate-900">Active</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <Heart className="text-rose-500" size={20} />
                            About {pet.name}
                        </h3>
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-slate-600 leading-relaxed">
                            {pet.bio || 'No bio available for this pet yet.'}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Health Records: Tabbed Panel ── */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 ring-1 ring-indigo-100 overflow-hidden">
                {/* Tab Bar */}
                <div className="flex border-b border-slate-100 bg-slate-50/50">
                    <button
                        onClick={() => setActiveTab('medical')}
                        className={`flex items-center gap-2 px-7 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${activeTab === 'medical'
                            ? 'border-indigo-600 text-indigo-600 bg-white'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white'
                            }`}
                    >
                        <FileText size={17} />
                        Medical History
                    </button>
                    <button
                        onClick={() => setActiveTab('vaccination')}
                        className={`flex items-center gap-2 px-7 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${activeTab === 'vaccination'
                            ? 'border-indigo-600 text-indigo-600 bg-white'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white'
                            }`}
                    >
                        <Syringe size={17} />
                        Vaccinations
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-8">
                    {activeTab === 'medical' && <MedicalHistory petId={pet.id} />}
                    {activeTab === 'vaccination' && <VaccinationTable petId={pet.id} />}
                </div>
            </div>
        </div>
    );
}

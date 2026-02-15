import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { petApi } from '../api/petApi';
import { userApi } from '../api/userApi';
import { setUser } from '../features/auth/authSlice';
import type { PetResponse } from '../types/pet';
import type { RootState, AppDispatch } from '../store';
import { PetCard } from '../components/PetCard';
import { Button } from '../components/Button';
import { Plus, Loader2, Dog, AlertCircle, CheckCircle } from 'lucide-react';

export default function Dashboard() {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const [pets, setPets] = useState<PetResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initDashboard = async () => {
            await Promise.all([
                loadPets(),
                refreshProfile()
            ]);
        };
        initDashboard();
    }, []);

    const refreshProfile = async () => {
        try {
            const data = await userApi.getProfile();
            dispatch(setUser(data));
        } catch (err) {
            console.error('Failed to refresh profile', err);
        }
    };

    const loadPets = async () => {
        try {
            setLoading(true);
            const data = await petApi.getAllPets();
            setPets(data);
        } catch (err: any) {
            setError('Failed to load your pets. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to remove this pet?')) {
            try {
                await petApi.deletePet(id);
                setPets(pets.filter(p => p.id !== id));
            } catch (err) {
                alert('Failed to delete pet.');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="mt-4 text-slate-600 font-medium">Fetching your pets...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {/* Account Status Banner */}
            {user && (
                <div className={`mb-8 flex items-center gap-4 rounded-3xl p-6 ring-1 transition-all ${user.isApproved
                    ? 'bg-indigo-50/50 ring-indigo-100'
                    : 'bg-amber-50/50 ring-amber-100'
                    }`}>
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm ${user.isApproved ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-white'
                        }`}>
                        {user.isApproved ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                    </div>
                    <div>
                        <h3 className={`text-lg font-black tracking-tight ${user.isApproved ? 'text-indigo-900' : 'text-amber-900'
                            }`}>
                            {user.isApproved ? 'Account Fully Approved' : 'Account Pending Approval'}
                        </h3>
                        <p className={`text-sm font-medium ${user.isApproved ? 'text-indigo-600/70' : 'text-amber-700/70'
                            }`}>
                            {user.isApproved
                                ? 'Your account has been verified by our administrators. You have full access to all platform features.'
                                : 'An administrator is currently reviewing your registration. Some features may be restricted until approval.'}
                        </p>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="mt-1 text-slate-500 font-medium">Welcome back! Manage your pet family here.</p>
                </div>
                <Link to="/pets/add">
                    <Button className="flex items-center gap-2" size="lg">
                        <Plus size={20} />
                        Register New Pet
                    </Button>
                </Link>
            </div>

            {error && (
                <div className="mb-8 rounded-2xl bg-red-50 p-4 text-red-700 font-medium border border-red-100 italic">
                    {error}
                </div>
            )}

            {pets.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-16 shadow-inner ring-1 ring-slate-100 text-center">
                    <div className="h-24 w-24 flex items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 mb-6">
                        <Dog size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">No pets registered yet</h2>
                    <p className="text-slate-500 max-w-sm mb-8">
                        Start by adding your first pet to track their health records and appointments.
                    </p>
                    <Link to="/pets/add">
                        <Button size="lg" variant="primary">Add Your First Pet</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {pets.map((pet) => (
                        <PetCard key={pet.id} pet={pet} onDelete={handleDelete} />
                    ))}
                </div>
            )}
        </div>
    );
}

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { petApi } from '../api/petApi';
import { userApi } from '../api/userApi';
import { appointmentApi } from '../api/appointmentApi';
import { marketplaceApi } from '../api/marketplaceApi';
import { setUser } from '../features/auth/authSlice';
import type { PetResponse } from '../types/pet';
import type { AppointmentResponse } from '../types/appointment';
import type { OrderResponse } from '../types/marketplace';
import type { RootState, AppDispatch } from '../store';
import { Button } from '../components/Button';
import { Plus, Loader2, Dog, AlertCircle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
    PetProfileWidget, 
    AppointmentsWidget, 
    OrdersWidget, 
    QuickActionsWidget 
} from '../components/PetDashboardWidgets';

export default function Dashboard() {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    
    // State
    const [pets, setPets] = useState<PetResponse[]>([]);
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [selectedPet, setSelectedPet] = useState<PetResponse | null>(null);
    
    // Loading States
    const [loadingPets, setLoadingPets] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial Load - Pets & Profile
    useEffect(() => {
        const initDashboard = async () => {
            await Promise.all([
                loadPets(),
                refreshProfile()
            ]);
        };
        initDashboard();
    }, []);

    // Load Data When User / Pet changes
    useEffect(() => {
        if (pets.length > 0) {
            loadDashboardData();
        }
    }, [pets.length]);

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
            setLoadingPets(true);
            const data = await petApi.getAllPets();
            setPets(data);
            
            // 1️⃣ Add Default Selected Pet
            if (data.length > 0) {
                setSelectedPet(data[0]);
            }
        } catch (err: any) {
            setError('Failed to load your pets. Please try again.');
        } finally {
            setLoadingPets(false);
        }
    };

    const loadDashboardData = async () => {
        try {
            setLoadingData(true);
            const [appts, userOrders] = await Promise.all([
                appointmentApi.getMyAppointments(),
                marketplaceApi.getMyOrders()
            ]);
            setAppointments(appts);
            setOrders(userOrders);
        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
            // Non-critical error, don't block UI entirely
            toast.error("Some dashboard data couldn't be loaded.");
        } finally {
            setLoadingData(false);
        }
    };

    // 2️⃣ Add Loading State
    if (loadingPets) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
                <p className="text-slate-600 font-medium">Loading your pet family...</p>
            </div>
        );
    }

    // 3️⃣ Handle No Pet Case
    if (pets.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-16 shadow-inner ring-1 ring-slate-100 text-center min-h-[60vh]">
                    <div className="h-24 w-24 flex items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 mb-6">
                        <Dog size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">You haven't registered any pets yet.</h2>
                    <p className="text-slate-500 max-w-sm mb-8 text-lg">
                        Register your first pet to start managing appointments and health records.
                    </p>
                    <Link to="/pets/add">
                        <Button size="lg" className="flex items-center gap-2 px-8 py-4 text-lg">
                            <Plus size={24} /> Register New Pet
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {/* Account Status Banner */}
            {user && !user.isApproved && (
                <div className="mb-8 flex items-center gap-4 rounded-3xl p-6 ring-1 transition-all bg-amber-50/50 ring-amber-100">
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm bg-amber-500 text-white">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black tracking-tight text-amber-900">
                            Account Pending Approval
                        </h3>
                        <p className="text-sm font-medium text-amber-700/70">
                            An administrator is currently reviewing your registration. Some features may be restricted until approval.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
                        <p className="mt-1 text-slate-500 font-medium">Welcome back, {user?.firstName || user?.username}!</p>
                    </div>
                    
                    <div className="hidden lg:block h-12 w-px bg-slate-200" />
                    
                    <div className="flex-grow sm:flex-initial min-w-[280px] group">
                        <div className="relative">
                            <label htmlFor="pet-selector" className="absolute -top-2 left-4 bg-white px-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest z-10 transition-colors group-focus-within:text-indigo-700">
                                Current Selection
                            </label>
                            <div className="relative flex items-center">
                                <select
                                    id="pet-selector"
                                    value={selectedPet?.id || ''}
                                    onChange={(e) => {
                                        const pet = pets.find(p => p.id === e.target.value);
                                        if (pet) setSelectedPet(pet);
                                    }}
                                    className="appearance-none w-full h-14 bg-white border-2 border-slate-100 ring-1 ring-slate-100 rounded-2xl px-5 pr-12 font-bold text-slate-800 shadow-md focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 transition-all cursor-pointer hover:border-slate-300 hover:shadow-lg"
                                >
                                    {pets.map(pet => (
                                        <option key={pet.id} value={pet.id}>
                                            {pet.type === 'DOG' ? '🐶' : pet.type === 'CAT' ? '🐱' : '🐾'} {pet.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 pointer-events-none text-slate-400">
                                    <ChevronRight size={20} className="rotate-90" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <Link to="/pets/add">
                        <Button className="flex items-center gap-2 h-12 px-6 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all hover:-translate-y-0.5" size="lg">
                            <Plus size={20} strokeWidth={3} /> 
                            <span className="font-bold">Add New Pet</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Mobile Pet Selector (only visible on small screens) */}
            <div className="sm:hidden mb-10 group">
                <div className="relative">
                    <label className="absolute -top-2 left-4 bg-white px-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest z-10">
                        Current Selection
                    </label>
                    <div className="relative flex items-center">
                        <select
                            value={selectedPet?.id || ''}
                            onChange={(e) => {
                                const pet = pets.find(p => p.id === e.target.value);
                                if (pet) setSelectedPet(pet);
                            }}
                            className="appearance-none w-full h-14 bg-white border-2 border-slate-100 ring-1 ring-slate-100 rounded-2xl px-5 pr-12 font-bold text-slate-800 shadow-md focus:border-indigo-500 transition-all font-sans"
                        >
                            {pets.map(pet => (
                                <option key={pet.id} value={pet.id}>
                                    {pet.type === 'DOG' ? '🐶' : pet.type === 'CAT' ? '🐱' : '🐾'} {pet.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 pointer-events-none text-slate-400">
                            <ChevronRight size={20} className="rotate-90" />
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-8 rounded-2xl bg-red-50 p-4 text-red-700 font-medium border border-red-100 flex items-center gap-3">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="w-full">
                {loadingData ? (
                    <div className="flex h-full min-h-[400px] flex-col items-center justify-center bg-white rounded-3xl ring-1 ring-slate-100 shadow-sm">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-400 mb-4" />
                        <p className="text-slate-500 font-semibold">Gearing up {selectedPet?.name}'s dashboard...</p>
                    </div>
                ) : selectedPet ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Top Row: Full width profile and appointments */}
                            <div className="lg:col-span-2">
                                <PetProfileWidget pet={selectedPet} />
                            </div>
                            <div className="lg:col-span-1">
                                <AppointmentsWidget appointments={appointments} petId={selectedPet.id} />
                            </div>
                            
                            {/* Bottom Row */}
                            <div className="lg:col-span-2">
                                <OrdersWidget orders={orders} />
                            </div>
                            <div className="lg:col-span-1">
                                <QuickActionsWidget petId={selectedPet.id} />
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { appointmentApi } from '../api/appointmentApi';
import { petApi } from '../api/petApi';
import type { AppointmentSlotResponse } from '../types/appointment';
import type { PetResponse } from '../types/pet';
import { Button } from '../components/Button';
import { BookingModal } from '../components/BookingModal';
import { Calendar, Clock, Loader2, Stethoscope, MapPin, Video, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatTime12h } from '../utils/dateUtils';

export default function SlotBrowser() {
    const [slots, setSlots] = useState<AppointmentSlotResponse[]>([]);
    const [pets, setPets] = useState<PetResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<AppointmentSlotResponse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter states
    const [filterType, setFilterType] = useState<string>('ALL');
    const [filterDate, setFilterDate] = useState<string>('');
    const [filterName, setFilterName] = useState<string>('');

    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [slotsData, petsData] = await Promise.all([
                appointmentApi.getAvailableSlots(),
                petApi.getAllPets(),
            ]);
            const sortedSlots = [...slotsData].sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return dateA.getTime() - dateB.getTime();
            });
            setSlots(sortedSlots);
            setPets(petsData);
        } catch (err) {
            console.error('Failed to load data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBookingClick = (slot: AppointmentSlotResponse) => {
        if (pets.length === 0) {
            toast((t) => (
                <div className="flex flex-col gap-2 p-1">
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Info size={18} />
                        <span className="font-bold">No Pets Found</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        You need to register a pet before booking an appointment. Add one now?
                    </p>
                    <div className="flex justify-end gap-2 mt-3">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 rounded-lg transition-colors"
                        >
                            Later
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                navigate('/pets/add');
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-md"
                        >
                            Register Pet
                        </button>
                    </div>
                </div>
            ), { duration: 8000 });
            return;
        }
        setSelectedSlot(slot);
        setIsModalOpen(true);
    };

    const handleConfirmBooking = async (data: { petId: string; notes?: string }) => {
        if (!selectedSlot) return;
        try {
            setBookingLoading(true);
            await appointmentApi.bookAppointment({
                slotId: selectedSlot.id,
                petId: data.petId,
                notes: data.notes,
            });
            toast.success('Appointment booked successfully!');
            setIsModalOpen(false);
            navigate('/appointments');
        } catch (err) {
            toast.error('Failed to book appointment. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="mt-4 text-slate-600 font-medium">Scanning for available specialists...</p>
            </div>
        );
    }

    const filteredSlots = slots.filter((slot) => {
        // Filter out past slots
        const slotDateTime = new Date(`${slot.date}T${slot.time}`);
        if (slotDateTime < new Date()) return false;

        // Name filter
        if (filterName && !slot.veterinarianName.toLowerCase().includes(filterName.toLowerCase())) return false;
        
        // Type filter
        if (filterType !== 'ALL' && slot.consultationType !== filterType) return false;
        
        // Date filter
        if (filterDate && slot.date !== filterDate) return false;

        return true;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900 italic">Book a Consultation</h1>
                <p className="mt-2 text-slate-500 font-medium">Choose from our top-rated veterinarians for your pet's needs.</p>
            </div>

            {/* Filters Section */}
            <div className="mb-8 p-6 bg-white rounded-3xl shadow-sm ring-1 ring-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    {/* Consultation Type Filter */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="ALL">All Consultation Types</option>
                        <option value="IN_CLINIC">In-Clinic</option>
                        <option value="ONLINE">Video Call</option>
                    </select>

                    {/* Date Filter */}
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    {/* Name Filter */}
                    <input
                        type="text"
                        placeholder="Search Veterinarian..."
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        className="py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[250px]"
                    />
                </div>
                
                {/* Clear Filters Button */}
                {(filterType !== 'ALL' || filterDate || filterName) && (
                    <Button 
                        variant="ghost" 
                        onClick={() => {
                            setFilterType('ALL');
                            setFilterDate('');
                            setFilterName('');
                        }}
                        className="text-slate-500 hover:text-slate-700 font-bold ml-auto"
                    >
                        Clear Filters
                    </Button>
                )}
            </div>

            {filteredSlots.length === 0 ? (
                <div className="rounded-3xl bg-amber-50 p-12 text-center border-2 border-dashed border-amber-200">
                    <Info className="mx-auto h-12 w-12 text-amber-500 mb-4" />
                    <h2 className="text-xl font-bold text-amber-900">
                        {slots.length === 0 ? "No slots available right now" : "No slots match your filters"}
                    </h2>
                    <p className="mt-2 text-amber-700 max-w-sm mx-auto font-medium italic">
                        {slots.length === 0 
                            ? "Our specialists are currently fully booked. Please check back later for new availability."
                            : "Try adjusting your search criteria or clearing filters to see more options."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSlots.map((slot) => (
                        <div
                            key={slot.id}
                            className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-xl hover:shadow-indigo-100 hover:-translate-y-1"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                    <Stethoscope size={24} />
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${slot.consultationType === 'ONLINE' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {slot.consultationType === 'ONLINE' ? (
                                        <span className="flex items-center gap-1.5"><Video size={14} /> Video Call</span>
                                    ) : (
                                        <span className="flex items-center gap-1.5"><MapPin size={14} /> In-Clinic</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{slot.veterinarianName}</h3>
                                <p className="text-sm font-bold text-indigo-600 mt-1">₹{(slot.consultationFee || 500).toFixed(2)}</p>
                            </div>

                            <div className="mt-6 space-y-3">
                                <div className="flex items-center text-slate-600 text-sm font-semibold">
                                    <Calendar size={18} className="mr-3 text-indigo-400" />
                                    {new Date(slot.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                </div>
                                    <div className="flex items-center gap-1">
                                        <Clock size={14} className="text-indigo-400" />
                                        <span className="text-slate-600 font-bold text-xs">{formatTime12h(slot.time)}</span>
                                    </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50">
                                <Button
                                    onClick={() => handleBookingClick(slot)}
                                    className="w-full shadow-lg shadow-indigo-100"
                                >
                                    Book Appointment
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                slot={selectedSlot}
                pets={pets}
                onConfirm={handleConfirmBooking}
                loading={bookingLoading}
            />
        </div>
    );
}

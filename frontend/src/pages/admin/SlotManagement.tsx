import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { appointmentApi } from '../../api/appointmentApi';
import type { AppointmentSlotResponse, AppointmentResponse } from '../../types/appointment';
import { ConsultationType } from '../../types/appointment';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Loader2, Calendar, Clock, Plus, Trash2, Video, MapPin, Stethoscope, X, Save, User as UserIcon, Mail, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatTime12h } from '../../utils/dateUtils';

export default function SlotManagement() {
    const [slots, setSlots] = useState<AppointmentSlotResponse[]>([]);
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [activeView, setActiveView] = useState<'slots' | 'bookings'>('slots');

    const [formData, setFormData] = useState({
        date: '',
        time: '',
        consultationType: 'IN_CLINIC' as ConsultationType,
        veterinarianName: '',
        duration: 30
    });
    const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

    useEffect(() => {
        if (activeView === 'slots') {
            loadSlots();
        } else {
            loadAppointments();
        }
    }, [activeView]);

    const loadSlots = async () => {
        try {
            setLoading(true);
            const data = await appointmentApi.getAvailableSlots(); // Gets all available slots
            setSlots(data);
        } catch (err) {
            console.error('Failed to load slots', err);
        } finally {
            setLoading(false);
        }
    };

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getAllAppointments();
            setAppointments(data);
        } catch (err) {
            console.error('Failed to load appointments', err);
            toast.error('Failed to load booked appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            await adminApi.createSlot(formData);
            toast.success('Slot published successfully!');
            resetForm();
            loadSlots();
        } catch (err) {
            toast.error('Failed to create slot.');
        }
    };

    const handleUpdate = async () => {
        if (!editingSlotId) return;
        try {
            await adminApi.updateSlot(editingSlotId, formData);
            toast.success('Slot updated successfully!');
            resetForm();
            loadSlots();
        } catch (err) {
            toast.error('Failed to update slot.');
        }
    };

    const handleEdit = (slot: AppointmentSlotResponse) => {
        setFormData({
            date: slot.date,
            time: slot.time.substring(0, 5),
            consultationType: slot.consultationType,
            veterinarianName: slot.veterinarianName,
            duration: slot.duration || 30
        });
        setEditingSlotId(slot.id);
        setIsAdding(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setFormData({
            date: '',
            time: '',
            consultationType: 'IN_CLINIC' as ConsultationType,
            veterinarianName: '',
            duration: 30
        });
        setIsAdding(false);
        setEditingSlotId(null);
    };

    const handleDelete = (id: string) => {
        toast((t) => (
            <div className="flex flex-col gap-2 p-1">
                <div className="flex items-center gap-2 text-red-600 mb-1">
                    <Trash2 size={18} />
                    <span className="font-bold">Delete Slot?</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                    Delete this appointment slot?
                </p>
                <div className="flex justify-end gap-2 mt-3">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await processDelete(id);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const processDelete = async (id: string) => {
        try {
            await adminApi.deleteSlot(id);
            setSlots(prev => prev.filter(s => s.id !== id));
            toast.success('Slot deleted successfully');
        } catch (err) {
            toast.error('Delete failed.');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Calendar className="text-indigo-600" />
                        {activeView === 'slots' ? 'Slot Management' : 'Booked Appointments'}
                    </h1>
                    <p className="mt-1 text-slate-500 font-medium italic">
                        {activeView === 'slots'
                            ? 'Schedule and manage availability for veterinary consultants.'
                            : 'Monitor and manage all scheduled consultations across the platform.'}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex p-1 bg-slate-100 rounded-2xl">
                        <button
                            onClick={() => setActiveView('slots')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'slots'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Active Slots
                        </button>
                        <button
                            onClick={() => setActiveView('bookings')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === 'bookings'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Bookings
                        </button>
                    </div>
                    {activeView === 'slots' && (
                        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
                            <Plus size={20} />
                            Open New Slot
                        </Button>
                    )}
                </div>
            </div>

            {isAdding && activeView === 'slots' && (
                <div className="bg-white rounded-3xl p-8 shadow-2xl ring-1 ring-slate-100 mb-10 border-2 border-indigo-100">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900">
                            {editingSlotId ? 'Edit Appointment Slot' : 'Configure Appointment Slot'}
                        </h2>
                        <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Veterinarian Name</label>
                            <Input value={formData.veterinarianName} onChange={(e) => setFormData({ ...formData, veterinarianName: e.target.value })} placeholder="Dr. Sarah Jenkins" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Consultation Type</label>
                            <select
                                value={formData.consultationType}
                                onChange={(e) => setFormData({ ...formData, consultationType: e.target.value as any })}
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            >
                                {Object.values(ConsultationType).map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Date</label>
                            <Input
                                type="date"
                                value={formData.date}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Start Time</label>
                            <Input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Duration (mins)</label>
                            <Input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })} />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                        <Button variant="ghost" className="font-bold" onClick={resetForm}>Cancel</Button>
                        <Button onClick={editingSlotId ? handleUpdate : handleCreate} className="px-10 shadow-lg shadow-indigo-100">
                            <Save size={18} className="mr-2" />
                            {editingSlotId ? 'Save Changes' : 'Publish Slot'}
                        </Button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {activeView === 'slots' ? (
                    slots.length === 0 ? (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center text-slate-400 italic font-medium">
                            No active slots found. Create some to start accepting bookings.
                        </div>
                    ) : (
                        slots.map((slot) => (
                            <div key={slot.id} className="bg-white p-6 rounded-3xl shadow-sm ring-1 ring-slate-100 flex flex-wrap items-center justify-between gap-6 transition-all hover:shadow-md">
                                <div className="flex items-center gap-6">
                                    <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                        <Stethoscope size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{slot.veterinarianName}</h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                {slot.consultationType === 'ONLINE' ? <Video size={14} /> : <MapPin size={14} />}
                                                {slot.consultationType}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-10">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Schedule</p>
                                        <div className="flex items-center gap-4 text-slate-700 font-bold text-sm">
                                            <span className="flex items-center gap-2"><Calendar size={16} className="text-indigo-400" /> {slot.date}</span>
                                            <span className="flex items-center gap-2"><Clock size={16} className="text-indigo-400" /> {formatTime12h(slot.time)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Status</p>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${slot.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {slot.status}
                                            </span>
                                            {slot.status === 'AVAILABLE' && new Date(`${slot.date}T${slot.time}`) < new Date() && (
                                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-200">
                                                    EXPIRED
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {slot.status === 'AVAILABLE' && (
                                        <button
                                            onClick={() => handleDelete(slot.id)}
                                            className="p-3 text-slate-300 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-2xl transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="font-bold"
                                        onClick={() => handleEdit(slot)}
                                    >
                                        Edit Details
                                    </Button>
                                </div>
                            </div>
                        ))
                    )
                ) : (
                    appointments.length === 0 ? (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center text-slate-400 italic font-medium">
                            No booked appointments found in the system.
                        </div>
                    ) : (
                        appointments.map((app) => (
                            <div key={app.id} className="bg-white p-6 rounded-[2rem] shadow-sm ring-1 ring-slate-100 grid grid-cols-1 lg:grid-cols-4 items-center gap-8 transition-all hover:shadow-md">
                                <div className="flex items-center gap-5">
                                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${app.status === 'SCHEDULED' ? 'bg-indigo-50 text-indigo-600' :
                                            app.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                        }`}>
                                        <Stethoscope size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 leading-tight mb-1">{app.veterinarianName}</h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${app.status === 'SCHEDULED' ? 'bg-indigo-100 text-indigo-700' :
                                                app.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {app.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Owner & Pet</p>
                                        <p className="text-sm font-bold text-slate-800 flex items-center gap-2"><UserIcon size={14} className="text-slate-400" /> {app.ownerName}</p>
                                        <p className="text-xs font-medium text-slate-500 ml-5 italic">pet: {app.petName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Contact</p>
                                        <p className="text-xs font-bold text-slate-600 flex items-center gap-2 truncate"><Mail size={14} className="text-slate-400" /> {app.ownerEmail}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Schedule</p>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-slate-700 flex items-center gap-2"><Calendar size={14} className="text-indigo-400" /> {app.appointmentDate}</p>
                                            <p className="text-xs font-bold text-slate-700 flex items-center gap-2"><Clock size={14} className="text-indigo-400" /> {app.appointmentTime.substring(0, 5)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Type</p>
                                        <span className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
                                            {app.consultationType === 'ONLINE' ? <Video size={14} className="text-slate-400" /> : <MapPin size={14} className="text-slate-400" />}
                                            {app.consultationType}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl" title="View Details">
                                        <Info size={20} className="text-slate-400 hover:text-indigo-600 transition-colors" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>
    );
}

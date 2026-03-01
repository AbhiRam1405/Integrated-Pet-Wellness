import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { appointmentApi } from '../../api/appointmentApi';
import type { AppointmentSlotResponse } from '../../types/appointment';
import { ConsultationType } from '../../types/appointment';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Loader2, Calendar, Clock, Plus, Trash2, Video, MapPin, Stethoscope, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SlotManagement() {
    const [slots, setSlots] = useState<AppointmentSlotResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    const [formData, setFormData] = useState({
        date: '',
        time: '',
        consultationType: 'IN_CLINIC' as ConsultationType,
        veterinarianName: '',
        duration: 30
    });

    useEffect(() => {
        loadSlots();
    }, []);

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

    const handleCreate = async () => {
        try {
            await adminApi.createSlot(formData);
            toast.success('Slot published successfully!');
            setIsAdding(false);
            loadSlots();
        } catch (err) {
            toast.error('Failed to create slot.');
        }
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
                        Slot Management
                    </h1>
                    <p className="mt-1 text-slate-500 font-medium italic">Schedule and manage availability for veterinary consultants.</p>
                </div>
                <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
                    <Plus size={20} />
                    Open New Slot
                </Button>
            </div>

            {isAdding && (
                <div className="bg-white rounded-3xl p-8 shadow-2xl ring-1 ring-slate-100 mb-10 border-2 border-indigo-100">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-900">Configure Appointment Slot</h2>
                        <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
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
                        <Button variant="ghost" className="font-bold" onClick={() => setIsAdding(false)}>Cancel</Button>
                        <Button onClick={handleCreate} className="px-10 shadow-lg shadow-indigo-100">
                            <Save size={18} className="mr-2" />
                            Publish Slot
                        </Button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {slots.length === 0 ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center text-slate-400 italic font-medium">
                        No active slots found. Create some to start accepting bookings.
                    </div>
                ) : (
                    slots.map((slot) => (
                        <div key={slot.id} className="bg-white p-6 rounded-3xl shadow-sm ring-1 ring-slate-100 flex flex-wrap items-center justify-between gap-6">
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
                                        <span className="flex items-center gap-2"><Clock size={16} className="text-indigo-400" /> {slot.time.substring(0, 5)} PM</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Status</p>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${slot.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {slot.status}
                                    </span>
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
                                <Button variant="ghost" size="sm" className="font-bold">Edit Details</Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { appointmentApi } from '../api/appointmentApi';
import type { AppointmentResponse } from '../types/appointment';
import { Button } from '../components/Button';
import { Calendar, Clock, Loader2, Stethoscope, Video, MapPin, ChevronRight, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Appointments() {
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const data = await appointmentApi.getMyAppointments();
            setAppointments(data);
        } catch (err) {
            console.error('Failed to load appointments', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequest = (id: string) => {
        toast((t) => (
            <div className="flex flex-col gap-2 p-1">
                <div className="flex items-center gap-2 text-red-600 mb-1">
                    <XCircle size={18} />
                    <span className="font-bold">Cancel Appointment?</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                    Are you sure you want to cancel this appointment?
                </p>
                <div className="flex justify-end gap-2 mt-3">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 rounded-lg transition-colors"
                    >
                        No, Keep it
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await processCancel(id);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                    >
                        Yes, Cancel
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    const processCancel = async (id: string) => {
        try {
            await appointmentApi.cancelAppointment(id);
            setAppointments(prev => prev.map(app =>
                app.id === id ? { ...app, status: 'CANCELLED' as any } : app
            ));
            toast.success('Appointment cancelled successfully');
        } catch (err) {
            toast.error('Failed to cancel appointment.');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Appointments</h1>
                    <p className="mt-1 text-slate-500 font-medium">Keep track of your pet's upcoming visits and past history.</p>
                </div>
                <Link to="/appointments/book">
                    <Button size="lg" className="flex items-center gap-2">
                        Schedule New Visit
                        <ChevronRight size={18} />
                    </Button>
                </Link>
            </div>

            {appointments.length === 0 ? (
                <div className="rounded-3xl bg-white p-20 text-center shadow-sm ring-1 ring-slate-100">
                    <div className="h-20 w-20 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-2xl mx-auto mb-6">
                        <Calendar size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">No appointments found</h2>
                    <p className="mt-3 text-slate-500 max-w-sm mx-auto font-medium italic mb-8">
                        You haven't scheduled any consultations yet. Stay on top of your pet's wellness!
                    </p>
                    <Link to="/appointments/book">
                        <Button size="lg">Book Your First Appointment</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {appointments.map((app) => (
                        <div
                            key={app.id}
                            className={`rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md ${app.status === 'CANCELLED' ? 'grayscale opacity-75' : ''
                                }`}
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className={`p-4 rounded-2xl ${app.status === 'SCHEDULED' ? 'bg-indigo-50 text-indigo-600' :
                                        app.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'
                                        }`}>
                                        <Stethoscope size={32} />
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3 mb-1.5">
                                            <h3 className="text-xl font-bold text-slate-900">{app.veterinarianName}</h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${app.status === 'SCHEDULED' ? 'bg-indigo-100 text-indigo-700' :
                                                app.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-slate-500 font-bold text-sm">
                                            <span className="flex items-center gap-1.5 mr-4">
                                                {app.consultationType === 'ONLINE' ? <Video size={16} /> : <MapPin size={16} />}
                                                {app.consultationType}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-8 lg:gap-12">
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date & Time</p>
                                        <div className="flex items-center gap-4 text-slate-700 font-bold">
                                            <span className="flex items-center gap-2"><Calendar size={18} className="text-indigo-400" /> {new Date(app.appointmentDate).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-2"><Clock size={18} className="text-indigo-400" /> {app.appointmentTime.substring(0, 5)} PM</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pet ID</p>
                                        <p className="text-slate-700 font-bold italic">#{app.petId.substring(0, 8)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {app.status === 'SCHEDULED' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-500 border-red-100 hover:bg-red-50 font-bold"
                                            onClick={() => handleCancelRequest(app.id)}
                                        >
                                            <XCircle size={18} className="mr-2" />
                                            Cancel Appointment
                                        </Button>
                                    )}
                                    <Link to={`/appointments/${app.id}`}>
                                        <Button variant="ghost" size="sm" className="font-bold">View Details</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

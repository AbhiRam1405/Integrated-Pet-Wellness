import { Link } from 'react-router-dom';
import { Calendar, Weight, Activity, Clock, Package, FileText, ChevronRight, Syringe, ExternalLink } from 'lucide-react';
import type { PetResponse } from '../types/pet';
import type { AppointmentResponse } from '../types/appointment';
import type { OrderResponse } from '../types/marketplace';
import { Button } from './Button';
import { format } from 'date-fns';
import { formatTime12h } from '../utils/dateUtils';

interface PetProfileWidgetProps {
    pet: PetResponse;
}

export function PetProfileWidget({ pet }: PetProfileWidgetProps) {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-md ring-1 ring-slate-200 flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 opacity-50"></div>
            
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">{pet.name}</h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                        {pet.type}
                    </span>
                    <p className="mt-2 text-sm text-slate-500 font-medium">{pet.breed} • {pet.gender}</p>
                </div>
                <Link to={`/pets/edit/${pet.id}`}>
                    <Button variant="outline" size="sm" className="text-xs h-8">Edit Profile</Button>
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 flex-grow">
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><Calendar size={20} /></div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Age</p>
                        <p className="text-sm font-bold text-slate-900">{pet.age} yrs</p>
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><Weight size={20} /></div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Weight</p>
                        <p className="text-sm font-bold text-slate-900">{pet.weight} kg</p>
                    </div>
                </div>
            </div>

            {pet.bio && (
                <div className="mt-auto">
                    <p className="text-sm text-slate-600 italic line-clamp-2">"{pet.bio}"</p>
                </div>
            )}
        </div>
    );
}

interface AppointmentsWidgetProps {
    appointments: AppointmentResponse[];
    petId: string;
}

export function AppointmentsWidget({ appointments, petId }: AppointmentsWidgetProps) {
    const petAppointments = appointments.filter(a => a.petId === petId);
    
    // Sort by date/time ascending
    const sortedAppts = [...petAppointments].sort((a, b) => {
        const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
        const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
        return dateA.getTime() - dateB.getTime();
    });

    const upcoming = sortedAppts.filter(a => {
        if (a.status !== 'SCHEDULED') return false;
        
        const apptDate = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
        const now = new Date();
        return apptDate > now;
    });
    const nextAppt = upcoming.length > 0 ? upcoming[0] : null;

    return (
        <div className="bg-white rounded-3xl p-6 shadow-md ring-1 ring-slate-200 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                        <Clock size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Appointments</h3>
                </div>
                <Link to="/appointments" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center bg-indigo-50/50 px-3 py-1 rounded-full transition-colors">
                    Book <ChevronRight size={16} className="ml-1" />
                </Link>
            </div>

            {nextAppt ? (
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 mb-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-100 px-2 py-0.5 rounded-md">
                            Upcoming
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                            {format(new Date(nextAppt.appointmentDate), 'MMM d, yyyy')}
                        </span>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">{nextAppt.consultationType}</h4>
                    <p className="text-sm text-slate-600 mb-3">with Dr. {nextAppt.veterinarianName}</p>
                    
                    <div className="flex items-center text-sm font-semibold text-indigo-600 bg-white rounded-xl px-3 py-2 w-max shadow-sm border border-indigo-50">
                        <Clock size={16} className="mr-2" />
                        {formatTime12h(nextAppt.appointmentTime)}
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center mb-4 flex-grow flex flex-col items-center justify-center">
                    <div className="bg-slate-200 text-slate-400 p-3 rounded-full mb-3">
                        <Calendar size={24} />
                    </div>
                    <p className="text-slate-500 font-medium text-sm mb-4">No upcoming appointments</p>
                    <Link to="/appointments">
                        <Button variant="outline" size="sm">Schedule Now</Button>
                    </Link>
                </div>
            )}

            {upcoming.length > 1 && (
                <p className="text-xs text-slate-500 font-medium text-center mt-auto">
                    + {upcoming.length - 1} more scheduled
                </p>
            )}
        </div>
    );
}

interface OrdersWidgetProps {
    orders: OrderResponse[];
}

export function OrdersWidget({ orders }: OrdersWidgetProps) {
    // Sort orders by most recent
    const sortedOrders = [...orders].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const recentOrders = sortedOrders.slice(0, 3);
    const hasPending = recentOrders.some(o => ['PENDING', 'PROCESSING', 'SHIPPED'].includes(o.status));

    return (
        <div className="bg-white rounded-3xl p-6 shadow-md ring-1 ring-slate-200 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                <div className="flex items-center gap-2">
                    <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
                        <Package size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
                    {hasPending && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                    )}
                </div>
                <Link to="/marketplace/orders" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center bg-emerald-50/50 px-3 py-1 rounded-full transition-colors">
                    View All <ChevronRight size={16} className="ml-1" />
                </Link>
            </div>

            {recentOrders.length > 0 ? (
                <div className="space-y-4 flex-grow">
                    {recentOrders.map(order => {
                        const isPending = ['PENDING', 'PROCESSING', 'SHIPPED'].includes(order.status);
                        return (
                            <Link key={order.id} to={`/order-history`} className={`block border rounded-2xl p-4 transition-colors ${isPending ? 'border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50' : 'border-slate-100 hover:bg-slate-50'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase">
                                        #{order.id.slice(-6).toUpperCase()}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                                        order.status === 'DELIVERED' ? 'bg-slate-100 text-slate-600' :
                                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                                        'bg-emerald-100 text-emerald-700'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                                <p className="text-sm font-semibold text-slate-900 mb-1 truncate">
                                    {order.items.length === 1 
                                        ? order.items[0].productName 
                                        : `${order.items[0].productName} +${order.items.length - 1} more`
                                    }
                                </p>
                                <div className="flex justify-between items-center text-xs text-slate-500">
                                    <span>{format(new Date(order.createdAt), 'MMM d')}</span>
                                    <span className="font-bold text-slate-700 bg-white px-2 py-1 rounded border border-slate-100">
                                        ₹{order.totalAmount.toFixed(2)}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center flex-grow flex flex-col items-center justify-center">
                    <div className="bg-slate-200 text-slate-400 p-3 rounded-full mb-3">
                        <Package size={24} />
                    </div>
                    <p className="text-slate-500 font-medium text-sm mb-4">No recent purchases</p>
                    <Link to="/marketplace">
                        <Button variant="outline" size="sm">Shop Now</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}

interface QuickActionsWidgetProps {
    petId: string;
}

export function QuickActionsWidget({ petId }: QuickActionsWidgetProps) {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-md ring-1 ring-slate-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                <div className="flex items-center gap-2">
                    <div className="bg-rose-50 p-2 rounded-xl text-rose-600">
                        <Activity size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <Link to={`/pets/${petId}`} className="group relative overflow-hidden bg-rose-50 border border-rose-100 rounded-2xl p-4 transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="absolute top-2 right-2 text-rose-200 group-hover:text-rose-300 transition-colors">
                        <ExternalLink size={18} />
                    </div>
                    <div className="bg-white text-rose-600 p-2.5 rounded-xl inline-block mb-3 shadow-sm">
                        <FileText size={20} />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Health Records</h4>
                    <p className="text-xs text-slate-500 font-medium tracking-tight">View medical history</p>
                </Link>
                
                <Link to={`/pets/${petId}#vaccinations`} className="group relative overflow-hidden bg-orange-50 border border-orange-100 rounded-2xl p-4 transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="absolute top-2 right-2 text-orange-200 group-hover:text-orange-300 transition-colors">
                        <ExternalLink size={18} />
                    </div>
                    <div className="bg-white text-orange-600 p-2.5 rounded-xl inline-block mb-3 shadow-sm">
                        <Syringe size={20} />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Vaccinations</h4>
                    <p className="text-xs text-slate-500 font-medium tracking-tight">Track immunizations</p>
                </Link>
            </div>
        </div>
    );
}

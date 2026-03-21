import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XCircle, Truck, Package, CheckCircle2, MapPin, Clock } from 'lucide-react';
import type { OrderResponse } from '../types/marketplace';

interface TrackingModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: OrderResponse | null;
}

export const TrackingModal = ({ isOpen, onClose, order }: TrackingModalProps) => {
    if (!order) return null;

    const events = order.trackingHistory || [];

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[60]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-[2.5rem] bg-white p-8 text-left align-middle shadow-2xl transition-all ring-1 ring-slate-100">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                            <Truck size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Track Shipment</h3>
                                            <p className="text-xs font-bold text-slate-400 font-mono">#{order.id.substring(0, 12).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                                        <XCircle size={24} />
                                    </button>
                                </div>

                                {order.carrier && (
                                    <div className="bg-slate-50 rounded-2xl p-4 mb-8 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Carrier</p>
                                            <p className="text-sm font-black text-slate-700">{order.carrier}</p>
                                        </div>
                                        {order.trackingId && (
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tracking ID</p>
                                                <p className="text-sm font-black text-indigo-600 font-mono">{order.trackingId}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-8 relative before:absolute before:inset-0 before:left-[11px] before:w-0.5 before:bg-slate-100 before:h-full pb-4">
                                    {events.length === 0 ? (
                                        <div className="pl-10 py-4">
                                            <div className="absolute left-0 h-6 w-6 bg-amber-50 rounded-full border-4 border-white ring-1 ring-amber-100 flex items-center justify-center text-amber-500 z-10">
                                                <Clock size={12} />
                                            </div>
                                            <h4 className="text-sm font-black text-slate-800">No updates yet</h4>
                                            <p className="text-xs text-slate-500 mt-1">We'll update the tracking information as soon as your package is on its way.</p>
                                        </div>
                                    ) : (
                                        [...events].reverse().map((event, idx) => (
                                            <div key={idx} className="relative pl-10 group">
                                                <div className={`absolute left-0 h-6 w-6 rounded-full border-4 border-white ring-1 ring-slate-100 flex items-center justify-center z-10 transition-colors ${idx === 0 ? 'bg-indigo-600 text-white ring-indigo-100' : 'bg-white text-slate-400'
                                                    }`}>
                                                    {idx === 0 ? <Package size={12} /> : <CheckCircle2 size={12} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className={`text-sm font-black ${idx === 0 ? 'text-slate-900 text-base' : 'text-slate-700'}`}>
                                                            {event.status}
                                                        </h4>
                                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                                                            {new Date(event.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{event.message}</p>
                                                    {event.location && (
                                                        <div className="flex items-center gap-1 mt-2 text-indigo-600">
                                                            <MapPin size={10} />
                                                            <span className="text-[10px] font-black uppercase tracking-wider">{event.location}</span>
                                                        </div>
                                                    )}
                                                    <p className="text-[9px] font-bold text-slate-300 mt-2">
                                                        {new Date(event.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="mt-8">
                                    <button
                                        onClick={onClose}
                                        className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-sm font-black transition-all"
                                    >
                                        Close
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

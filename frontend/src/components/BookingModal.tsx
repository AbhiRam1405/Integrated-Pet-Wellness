import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './Button';
import { X, Calendar, Clock, Stethoscope } from 'lucide-react';
import type { AppointmentSlotResponse } from '../types/appointment';
import type { PetResponse } from '../types/pet';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const bookingSchema = z.object({
    petId: z.string().min(1, 'Please select a pet'),
    notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    slot: AppointmentSlotResponse | null;
    pets: PetResponse[];
    onConfirm: (data: BookingFormValues) => Promise<void>;
    loading: boolean;
}

export function BookingModal({ isOpen, onClose, slot, pets, onConfirm, loading }: BookingModalProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<BookingFormValues>({
        resolver: zodResolver(bookingSchema),
    });

    const onSubmit = async (data: BookingFormValues) => {
        await onConfirm(data);
        reset();
    };

    if (!slot) return null;

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 text-left align-middle shadow-2xl transition-all ring-1 ring-slate-100">
                                <div className="flex items-center justify-between mb-6">
                                    <Dialog.Title as="h3" className="text-2xl font-bold text-slate-900">
                                        Confirm Booking
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="mb-8 space-y-4 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                                    <div className="flex items-center text-slate-700">
                                        <Calendar size={18} className="mr-3 text-indigo-600" />
                                        <span className="font-bold">{new Date(slot.date).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                                    </div>
                                    <div className="flex items-center text-slate-700">
                                        <Clock size={18} className="mr-3 text-indigo-600" />
                                        <span className="font-bold">{slot.time.substring(0, 5)} PM</span>
                                    </div>
                                    <div className="flex items-center text-slate-700">
                                        <Stethoscope size={18} className="mr-3 text-indigo-600" />
                                        <span className="font-bold">{slot.veterinarianName} ({slot.consultationType})</span>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700">Select Pet</label>
                                        <select
                                            {...register('petId')}
                                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        >
                                            <option value="">Choose a pet...</option>
                                            {pets.map((pet) => (
                                                <option key={pet.id} value={pet.id}>
                                                    {pet.name} ({pet.breed})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.petId && <p className="text-xs font-bold text-red-500">{errors.petId.message}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700">Notes (Optional)</label>
                                        <textarea
                                            {...register('notes')}
                                            rows={3}
                                            placeholder="Symptoms, previous history, or concerns..."
                                            className="flex w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                                        />
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <Button type="submit" className="flex-1" size="lg" isLoading={loading}>
                                            Finalize Appointment
                                        </Button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

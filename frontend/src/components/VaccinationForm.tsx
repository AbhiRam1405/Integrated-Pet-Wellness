import React, { useState } from 'react';
import { vaccinationApi } from '../api/vaccinationApi';
import { Syringe, X, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import toast from 'react-hot-toast';

interface VaccinationFormProps {
    petId: string;
    onSuccess: () => void;
    onClose: () => void;
}

export default function VaccinationForm({ petId, onSuccess, onClose }: VaccinationFormProps) {
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        vaccineName: '',
        doctorName: '',
        givenDate: today,
        nextDueDate: '',
    });
    const [attachment, setAttachment] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ nextDueDate?: string }>({});

    const validate = (): boolean => {
        const newErrors: { nextDueDate?: string } = {};
        if (!formData.nextDueDate) {
            newErrors.nextDueDate = 'Next due date is required';
        } else if (formData.nextDueDate <= formData.givenDate) {
            newErrors.nextDueDate = 'Next due date must be after the given date';
        } else if (formData.nextDueDate <= today) {
            newErrors.nextDueDate = 'Next due date must be in the future';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('petId', petId);
            data.append('vaccineName', formData.vaccineName.trim());
            data.append('doctorName', formData.doctorName.trim());
            data.append('givenDate', formData.givenDate);
            data.append('nextDueDate', formData.nextDueDate);
            if (attachment) {
                data.append('file', attachment);
            }

            await vaccinationApi.addVaccination(data);
            toast.success('Vaccination record added successfully');
            onSuccess();
        } catch (err: any) {
            const message = err.response?.data?.message || err.response?.data || 'Failed to add vaccination';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-8 ring-1 ring-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Syringe className="text-indigo-600" size={24} />
                        Add Vaccination
                    </h4>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Vaccine Name"
                        placeholder="e.g. Rabies, Distemper, Parvovirus"
                        value={formData.vaccineName}
                        onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
                        required
                    />

                    <Input
                        label="Veterinarian / Doctor"
                        placeholder="Enter doctor's name"
                        value={formData.doctorName}
                        onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Input
                            label="Date Given"
                            type="date"
                            value={formData.givenDate}
                            min={today}
                            onChange={(e) => setFormData({ ...formData, givenDate: e.target.value })}
                            required
                        />
                        <div>
                            <Input
                                label="Next Due Date"
                                type="date"
                                value={formData.nextDueDate}
                                min={today}
                                onChange={(e) => {
                                    setFormData({ ...formData, nextDueDate: e.target.value });
                                    setErrors({});
                                }}
                                required
                            />
                            {errors.nextDueDate && (
                                <p className="text-xs text-red-500 mt-1">{errors.nextDueDate}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Prescription / Report (PDF, JPG, PNG — max 5MB)
                        </label>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting} className="min-w-[130px]">
                            {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Save Vaccination'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

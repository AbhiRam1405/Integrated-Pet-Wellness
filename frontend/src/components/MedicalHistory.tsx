import React, { useState, useEffect } from 'react';
import { medicalHistoryApi } from '../api/medicalHistoryApi';
import type { MedicalHistoryResponse } from '../types/pet';
import { FileText, Plus, Calendar, User, Stethoscope, Clipboard, File, X, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import toast from 'react-hot-toast';

interface MedicalHistoryProps {
    petId: string;
}

export default function MedicalHistory({ petId }: MedicalHistoryProps) {
    const [history, setHistory] = useState<MedicalHistoryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        visitDate: new Date().toISOString().split('T')[0],
        doctorName: '',
        diagnosis: '',
        treatment: '',
        notes: '',
        followUpDate: '',
    });
    const [attachment, setAttachment] = useState<File | null>(null);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await medicalHistoryApi.getMedicalHistory(petId);
            setHistory(data);
        } catch (err) {
            console.error('Failed to fetch medical history:', err);
            toast.error('Failed to load medical history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [petId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        data.append('petId', petId);
        data.append('visitDate', formData.visitDate);
        data.append('doctorName', formData.doctorName);
        data.append('diagnosis', formData.diagnosis);
        data.append('treatment', formData.treatment);
        data.append('notes', formData.notes);
        if (formData.followUpDate) {
            data.append('followUpDate', formData.followUpDate);
        }
        if (attachment) {
            data.append('attachment', attachment);
        }

        try {
            await medicalHistoryApi.addMedicalHistory(data);
            toast.success('Medical history added successfully');
            setShowForm(false);
            setFormData({
                visitDate: new Date().toISOString().split('T')[0],
                doctorName: '',
                diagnosis: '',
                treatment: '',
                notes: '',
                followUpDate: '',
            });
            setAttachment(null);
            fetchHistory();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to add medical history');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    return (
        <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="text-indigo-600" size={24} />
                    Medical History
                </h3>
                <Button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add History
                </Button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-8 ring-1 ring-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-2xl font-bold text-slate-900">Add Medical History</h4>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Visit Date"
                                    type="date"
                                    value={formData.visitDate}
                                    onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Doctor Name"
                                    placeholder="Enter veterinarian name"
                                    value={formData.doctorName}
                                    onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                                    required
                                />
                            </div>

                            <Input
                                label="Diagnosis"
                                placeholder="What was the pet diagnosed with?"
                                value={formData.diagnosis}
                                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                required
                            />

                            <Input
                                label="Treatment"
                                placeholder="What treatment was provided?"
                                value={formData.treatment}
                                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Follow-up Date"
                                    type="date"
                                    value={formData.followUpDate}
                                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                                />
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Prescription Attachment (PDF/Image)
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[100px]"
                                    placeholder="Any additional notes..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                                <Button type="submit" disabled={submitting} className="min-w-[120px]">
                                    {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Save Record'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {history.length === 0 ? (
                    <div className="bg-slate-50 rounded-2xl p-8 border border-dashed border-slate-300 text-center">
                        <p className="text-slate-500">No medical history found for this pet.</p>
                    </div>
                ) : (
                    history.map((record) => (
                        <div key={record.id} className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow ring-1 ring-indigo-50">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(record.visitDate).toLocaleDateString()}
                                        </span>
                                        <h4 className="font-bold text-slate-900 text-lg">{record.diagnosis}</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 mt-4">
                                        <p className="text-sm text-slate-600 flex items-center gap-2">
                                            <User size={16} className="text-slate-400" />
                                            <span className="font-medium">Doctor:</span> {record.doctorName}
                                        </p>
                                        <p className="text-sm text-slate-600 flex items-center gap-2">
                                            <Stethoscope size={16} className="text-slate-400" />
                                            <span className="font-medium">Treatment:</span> {record.treatment}
                                        </p>
                                        {record.followUpDate && (
                                            <p className="text-sm text-rose-600 flex items-center gap-2">
                                                <Calendar size={16} />
                                                <span className="font-medium">Follow-up:</span> {new Date(record.followUpDate).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    {record.notes && (
                                        <div className="mt-4 p-3 bg-slate-50 rounded-xl text-sm text-slate-600 flex gap-2">
                                            <Clipboard size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                            <p>{record.notes}</p>
                                        </div>
                                    )}
                                </div>
                                {record.attachmentPath && (
                                    <div className="md:ml-4 flex items-start">
                                        <a
                                            href={`http://localhost:8080/${record.attachmentPath}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors border border-emerald-100"
                                        >
                                            <File size={16} />
                                            View Attachment
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { medicalHistoryApi } from '../api/medicalHistoryApi';
import type { MedicalHistoryResponse } from '../types/pet';
import { FileText, Plus, Calendar, User, Stethoscope, Clipboard, File, X, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import toast from 'react-hot-toast';
import { Pagination } from './Pagination';


interface MedicalHistoryProps {
    petId: string;
}

export default function MedicalHistory({ petId }: MedicalHistoryProps) {
    const [history, setHistory] = useState<MedicalHistoryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedRecord, setSelectedRecord] = useState<MedicalHistoryResponse | null>(null);

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

    const fetchHistory = async (page: number = 0) => {
        try {
            setLoading(true);
            const response = await medicalHistoryApi.getMedicalHistory(petId, page);
            setHistory(response.content);
            setTotalPages(response.totalPages);
            setCurrentPage(response.number);
        } catch (err) {
            console.error('Failed to fetch medical history:', err);
            toast.error('Failed to load medical history');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        fetchHistory(page);
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
        <div>
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

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Diagnosis</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Doctor</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Follow-up</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                    </table>
                </div>
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                    {history.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                                <FileText size={32} className="text-slate-300" />
                            </div>
                            <p className="text-slate-500 font-medium">No medical history records found</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <tbody className="divide-y divide-slate-100">
                                {history.map((record) => (
                                    <tr
                                        key={record.id}
                                        onClick={() => setSelectedRecord(record)}
                                        className="group hover:bg-indigo-50/30 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-400" />
                                                <span className="text-sm font-medium text-slate-700">
                                                    {new Date(record.visitDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-slate-900 line-clamp-1">{record.diagnosis}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-slate-400" />
                                                <span className="text-sm text-slate-600">{record.doctorName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {record.followUpDate ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[11px] font-bold">
                                                    <Calendar size={12} />
                                                    {new Date(record.followUpDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">None</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-indigo-600 hover:text-indigo-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-100 bg-indigo-50/50 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Pagination remains the same */}
            <div className="mt-6">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    isLoading={loading}
                />
            </div>

            {/* Details Modal */}
            {selectedRecord && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[60] flex items-center justify-center p-4 transition-all"
                    onClick={() => setSelectedRecord(null)}
                >
                    <div
                        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 ring-1 ring-white/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-indigo-600 px-8 py-6 text-white relative">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2 opacity-90">
                                        <Calendar size={16} />
                                        <span className="text-sm font-medium">Record from {new Date(selectedRecord.visitDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                    <h4 className="text-3xl font-black">{selectedRecord.diagnosis}</h4>
                                </div>
                                <button
                                    onClick={() => setSelectedRecord(null)}
                                    className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <User size={12} className="text-indigo-500" /> Attending Doctor
                                    </p>
                                    <p className="text-lg font-bold text-slate-800">{selectedRecord.doctorName}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar size={12} className="text-rose-500" /> Follow-up Date
                                    </p>
                                    <p className={`text-lg font-bold ${selectedRecord.followUpDate ? 'text-rose-600' : 'text-slate-400'}`}>
                                        {selectedRecord.followUpDate
                                            ? new Date(selectedRecord.followUpDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                                            : 'Not Scheduled'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Stethoscope size={14} className="text-emerald-500" /> Prescribed Treatment
                                </p>
                                <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-5">
                                    <p className="text-slate-700 leading-relaxed font-medium">{selectedRecord.treatment}</p>
                                </div>
                            </div>

                            {selectedRecord.notes && (
                                <div className="space-y-3">
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Clipboard size={14} className="text-amber-500" /> Additional Notes
                                    </p>
                                    <div className="bg-amber-50/30 border border-amber-100/50 rounded-2xl p-5 italic">
                                        <p className="text-slate-600 leading-relaxed capitalize">{selectedRecord.notes}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100">
                                <div className="text-xs text-slate-400 font-medium">
                                    Created on {new Date(selectedRecord.createdAt).toLocaleString()}
                                </div>
                                {selectedRecord.attachmentPath && (
                                    <a
                                        href={`http://localhost:8080/${selectedRecord.attachmentPath}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                    >
                                        <File size={18} />
                                        Download Report
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setSelectedRecord(null)} className="rounded-xl">Close</Button>
                            {/* Optional Edit/Delete could go here */}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

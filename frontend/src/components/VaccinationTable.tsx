import { useState, useEffect } from 'react';
import { vaccinationApi } from '../api/vaccinationApi';
import type { VaccinationResponse, VaccinationAudit } from '../types/pet';
import {
    Syringe, Plus, Calendar, CheckCircle,
    Clock, AlertTriangle, Loader2, ExternalLink, User, X
} from 'lucide-react';
import { Button } from './Button';
import VaccinationForm from './VaccinationForm';
import { Pagination } from './Pagination';
import toast from 'react-hot-toast';


interface VaccinationTableProps {
    petId: string;
}


const STATUS = {
    UPCOMING: {
        label: 'Upcoming',
        icon: Clock,
        textColor: 'text-emerald-700',
        bgColor: 'bg-emerald-50',
        badgeCls: 'bg-emerald-100 text-emerald-700',
        dotColor: 'bg-emerald-500',
    },
    COMPLETED: {
        label: 'Completed',
        icon: CheckCircle,
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
        badgeCls: 'bg-blue-100 text-blue-700',
        dotColor: 'bg-blue-500',
    },
    OVERDUE: {
        label: 'Overdue',
        icon: AlertTriangle,
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        badgeCls: 'bg-red-100 text-red-700',
        dotColor: 'bg-red-500',
    },
};

function fmt(d: string | null) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function VaccinationTable({ petId }: VaccinationTableProps) {
    const [vaccinations, setVaccinations] = useState<VaccinationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedRecord, setSelectedRecord] = useState<VaccinationResponse | null>(null);
    const [history, setHistory] = useState<VaccinationAudit[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [nextDoseDate, setNextDoseDate] = useState('');
    const [editDueDate, setEditDueDate] = useState('');

    const fetchVaccinations = async (page: number = 0) => {
        try {
            setLoading(true);
            const response = await vaccinationApi.getVaccinations(petId, page);
            setVaccinations(response.content);
            setTotalPages(response.totalPages);
            setCurrentPage(response.number);
        } catch {
            toast.error('Failed to load vaccination records');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchVaccinations(page);
    };

    const fetchHistory = async (id: string) => {
        setHistoryLoading(true);
        try {
            const data = await vaccinationApi.getHistory(id);
            setHistory(data);
        } catch (err) {
            console.error('Failed to fetch history:', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleSelectRecord = (record: VaccinationResponse) => {
        setSelectedRecord(record);
        setNextDoseDate('');
        setEditDueDate(record.nextDueDate);
        fetchHistory(record.id);
    };

    const handleMarkAsDone = async () => {
        if (!selectedRecord) return;

        setActionLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const updated = await vaccinationApi.updateVaccination(selectedRecord.id, today);
            toast.success('Vaccination marked as completed');
            setSelectedRecord(updated);
            fetchVaccinations(currentPage);
            fetchHistory(updated.id);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update record');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddNextDose = async () => {
        if (!selectedRecord || !nextDoseDate) return;

        setActionLoading(true);
        try {
            await vaccinationApi.addNextDose(selectedRecord.id, nextDoseDate);
            toast.success('Next dose scheduled successfully');
            setSelectedRecord(null); // Close modal
            fetchVaccinations(0); // Refresh list
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to schedule next dose');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateDueDate = async () => {
        if (!selectedRecord || !editDueDate) return;

        setActionLoading(true);
        try {
            const updated = await vaccinationApi.updateVaccination(selectedRecord.id, undefined, editDueDate);
            toast.success('Schedule updated');
            setSelectedRecord(updated);
            fetchVaccinations(currentPage);
            fetchHistory(updated.id);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update schedule');
        } finally {
            setActionLoading(false);
        }
    };


    useEffect(() => { fetchVaccinations(); }, [petId]);


    if (loading) return (
        <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-indigo-500" size={30} />
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Syringe size={20} className="text-indigo-500" />
                        Vaccination Records
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{vaccinations.length} vaccination{vaccinations.length !== 1 ? 's' : ''} recorded</p>
                </div>
                <Button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-1.5 text-sm"
                    disabled={vaccinations.length > 0 && vaccinations[0].status !== 'COMPLETED'}
                    title={vaccinations.length > 0 && vaccinations[0].status !== 'COMPLETED' ? "Complete the current vaccination tracking before adding a new one" : ""}
                >
                    <Plus size={16} /> Add Vaccination
                </Button>
            </div>

            {showForm && (
                <VaccinationForm
                    petId={petId}
                    onSuccess={() => { setShowForm(false); fetchVaccinations(); }}
                    onClose={() => setShowForm(false)}
                />
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vaccine Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Doctor</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Next Due</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
                            </tr>
                        </thead>
                    </table>
                </div>
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                    {vaccinations.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                                <Syringe size={32} className="text-slate-300" />
                            </div>
                            <p className="text-slate-500 font-medium">No vaccination records found</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <tbody className="divide-y divide-slate-100">
                                {vaccinations.map((v) => {
                                    const s = STATUS[v.status as keyof typeof STATUS];
                                    const Icon = s.icon;
                                    return (
                                        <tr
                                            key={v.id}
                                            onClick={() => handleSelectRecord(v)}
                                            className="group hover:bg-indigo-50/30 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    <span className="text-sm font-medium text-slate-700">{fmt(v.givenDate)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-slate-900 line-clamp-1">{v.vaccineName}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <User size={14} className="text-slate-400" />
                                                    <span className="text-sm text-slate-600 truncate max-w-[120px]">{v.doctorName || 'Not specified'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
                                                {fmt(v.nextDueDate)}
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.badgeCls}`}>
                                                    <Icon size={10} />
                                                    {s.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div className="mt-6">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    isLoading={loading}
                />
            </div>

            {/* Vaccination Detail Modal */}
            {selectedRecord && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[60] flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setSelectedRecord(null)}
                >
                    <div
                        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Status Header Strip */}
                        <div className={`${STATUS[selectedRecord.status as keyof typeof STATUS].bgColor} px-8 py-4 flex justify-between items-center border-b border-black/5`}>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${STATUS[selectedRecord.status as keyof typeof STATUS].badgeCls}`}>
                                {selectedRecord.status}
                            </span>
                            <button
                                onClick={() => setSelectedRecord(null)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                    <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl w-fit mb-3">
                                        <Syringe size={28} />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-3xl font-black text-slate-900 leading-tight">{selectedRecord.vaccineName}</h4>
                                        <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter">
                                            Dose #{selectedRecord.doseNumber}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 font-medium flex items-center gap-2">
                                        <User size={16} className="text-indigo-400" /> Administered by {selectedRecord.doctorName || 'Unknown Veterinarian'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Created Date</p>
                                    <p className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg inline-block border border-slate-100">
                                        {new Date(selectedRecord.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <Calendar size={12} className="text-slate-400" /> Given Date
                                    </p>
                                    <p className="text-sm font-bold text-slate-800">{fmt(selectedRecord.givenDate)}</p>
                                </div>
                                <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <Calendar size={12} className="text-indigo-500" /> Next Due
                                    </p>
                                    <p className="text-sm font-bold text-indigo-700">{fmt(selectedRecord.nextDueDate)}</p>
                                </div>
                                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 opacity-60">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <Calendar size={12} className="text-slate-400" /> Last Dose
                                    </p>
                                    <p className="text-sm font-bold text-slate-800">{fmt(selectedRecord.lastGivenDate)}</p>
                                </div>
                            </div>

                            {/* Status-Based Actions */}
                            <div className="border-y border-slate-100 py-6">
                                {selectedRecord.status === 'UPCOMING' && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">Ready to mark as done?</p>
                                            <p className="text-xs text-slate-500">This will lock the record and preserve history.</p>
                                        </div>
                                        <Button
                                            onClick={handleMarkAsDone}
                                            isLoading={actionLoading}
                                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                                        >
                                            <CheckCircle size={18} /> Mark as Completed
                                        </Button>
                                    </div>
                                )}

                                {selectedRecord.status === 'OVERDUE' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-amber-600">
                                            <AlertTriangle size={18} />
                                            <p className="text-sm font-bold">Vaccination is Overdue</p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-end gap-3">
                                            <div className="flex-1 space-y-1.5 w-full">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">New Next Due Date</label>
                                                <input
                                                    type="date"
                                                    value={editDueDate}
                                                    onChange={(e) => setEditDueDate(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleUpdateDueDate}
                                                isLoading={actionLoading}
                                                disabled={!editDueDate}
                                                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white"
                                            >
                                                Update Schedule
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {selectedRecord.status === 'COMPLETED' && (
                                    <div className="space-y-4">
                                        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                                            <p className="text-sm font-black text-indigo-900 mb-4 flex items-center gap-2">
                                                <Plus size={18} /> Schedule Next Dose
                                            </p>
                                            <div className="flex flex-col sm:flex-row items-end gap-3">
                                                <div className="flex-1 space-y-1.5 w-full">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Future Appointment Date</label>
                                                    <input
                                                        type="date"
                                                        value={nextDoseDate}
                                                        onChange={(e) => setNextDoseDate(e.target.value)}
                                                        className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                    />
                                                </div>
                                                <Button
                                                    onClick={handleAddNextDose}
                                                    isLoading={actionLoading}
                                                    disabled={!nextDoseDate}
                                                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                                                >
                                                    Add Dose #{selectedRecord.doseNumber + 1}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Vaccination History Timeline */}
                            <div className="space-y-4">
                                <h5 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <Clock size={16} className="text-indigo-500" /> Vaccination History
                                </h5>

                                {historyLoading ? (
                                    <div className="flex items-center justify-center p-8 bg-slate-50/50 rounded-[1.5rem] border border-slate-100">
                                        <Loader2 size={24} className="text-indigo-500 animate-spin" />
                                    </div>
                                ) : history.length === 0 ? (
                                    <div className="p-8 text-center bg-slate-50/50 rounded-[1.5rem] border border-slate-100 italic text-slate-400 text-sm">
                                        No historical records found
                                    </div>
                                ) : (
                                    <div className="space-y-3 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                                        {history.map((rev) => (
                                            <div key={rev.id} className="relative pl-8 group">
                                                <div className={`absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full border-4 border-white shadow-sm z-10 flex items-center justify-center ${rev.revisionType === 'ADD' ? 'bg-emerald-500' : 'bg-indigo-500'
                                                    }`}>
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                </div>
                                                <div className="bg-slate-50/50 hover:bg-white hover:shadow-md transition-all p-4 rounded-2xl border border-slate-100">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                                                                {rev.revisionType === 'ADD' ? 'Initial Record' : `Dose Revision #${rev.revision}`}
                                                            </span>
                                                            <p className="text-xs font-bold text-slate-700">
                                                                Administered on {fmt(rev.givenDate)}
                                                            </p>
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            {new Date(rev.revisionTimestamp).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-2 opacity-70">
                                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                                                            <User size={10} /> {rev.doctorName || 'Unknown'}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                                                            <Calendar size={10} /> Next Due: {fmt(rev.nextDueDate)}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                                                            Dose #{rev.doseNumber}
                                                        </div>
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${STATUS[rev.status as keyof typeof STATUS].badgeCls}`}>
                                                            {rev.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Attachments Section */}
                            {selectedRecord.attachmentPath && (
                                <div className="pt-6 border-t border-slate-100">
                                    <a
                                        href={`http://localhost:8080/${selectedRecord.attachmentPath}`}
                                        target="_blank" rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                    >
                                        <ExternalLink size={18} />
                                        View Vaccination Report
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-slate-50 px-8 py-5 flex justify-end gap-3 border-t border-slate-100">
                            <Button variant="outline" onClick={() => setSelectedRecord(null)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

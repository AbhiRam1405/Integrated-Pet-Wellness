import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import type { UserProfileResponse } from '../../types/auth';
import { Button } from '../../components/Button';
import { Loader2, CheckCircle, UserCheck, Mail, Calendar, User } from 'lucide-react';

export default function UserApprovals() {
    const [users, setUsers] = useState<UserProfileResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        loadPendingUsers();
    }, []);

    const loadPendingUsers = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getPendingUsers();
            setUsers(data);
        } catch (err) {
            console.error('Failed to load pending users', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (username: string) => {
        try {
            setActionLoading(username);
            await adminApi.approveUser(username);
            setUsers(users.filter(u => u.username !== username));
            alert('User approved successfully!');
        } catch (err) {
            alert('Failed to approve user.');
        } finally {
            setActionLoading(null);
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
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                        <UserCheck size={24} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Approvals</h1>
                </div>
                <p className="text-slate-500 font-medium italic">Review and verify new account registrations for the platform.</p>
            </div>

            {users.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center shadow-sm ring-1 ring-slate-100 border-2 border-dashed border-slate-100">
                    <CheckCircle size={48} className="mx-auto text-green-500 mb-4 opacity-20" />
                    <h2 className="text-xl font-bold text-slate-900">All caught up!</h2>
                    <p className="text-slate-400 font-medium italic">There are no pending user approvals at this time.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((user) => (
                        <div key={user.username} className="bg-white rounded-3xl p-6 shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-xl hover:shadow-indigo-50">
                            <div className="flex items-start justify-between mb-6">
                                <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                                    <User size={32} />
                                </div>
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    Pending Verification
                                </span>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        {user.firstName} {user.lastName}
                                    </h3>
                                    <p className="text-sm font-bold text-slate-400">@{user.username}</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center text-sm text-slate-600 font-medium gap-3">
                                        <Mail size={16} className="text-indigo-400" />
                                        {user.email}
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600 font-medium gap-3">
                                        <Calendar size={16} className="text-indigo-400" />
                                        Joined {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <Button
                                    onClick={() => handleApprove(user.username)}
                                    isLoading={actionLoading === user.username}
                                    className="w-full shadow-lg shadow-indigo-100"
                                >
                                    Confirm Approval
                                </Button>
                                <Button variant="outline" className="w-full border-slate-100 text-slate-400 font-bold hover:bg-slate-50">
                                    View Full Profile
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import type { UserProfileResponse } from '../../types/auth';
import { Button } from '../../components/Button';
import { Loader2, CheckCircle, UserCheck, Mail, Calendar, User, X, Phone, MapPin, Shield } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function UserApprovals() {
    const [users, setUsers] = useState<UserProfileResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserProfileResponse | null>(null);

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
            // Show a smoother toast or notification if available, but keeping alert for now as per original code
            alert('User approved successfully!');
        } catch (err) {
            alert('Failed to approve user.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (username: string) => {
        const reason = window.prompt(`Please provide a reason for rejecting @${username}:`);

        if (reason === null) return; // User cancelled the prompt

        if (!reason.trim()) {
            alert('A rejection reason is required.');
            return;
        }

        if (!window.confirm(`Are you sure you want to reject and delete @${username}? This action cannot be undone.`)) {
            return;
        }

        try {
            setActionLoading(username);
            await adminApi.rejectUser(username, reason);
            setUsers(users.filter(u => u.username !== username));
            alert('User rejected and notified successfully.');
        } catch (err) {
            alert('Failed to reject user.');
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
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedUser(user)}
                                        className="w-full border-slate-100 text-slate-600 font-bold hover:bg-slate-50"
                                    >
                                        View Details
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleReject(user.username)}
                                        className="w-full border-red-50 text-red-400 font-bold hover:bg-red-50 hover:border-red-100"
                                    >
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Profile Detail Modal */}
            <Transition show={!!selectedUser} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setSelectedUser(null)}>
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
                                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-[2.5rem] bg-white p-10 text-left align-middle shadow-2xl transition-all ring-1 ring-slate-100">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                                <User size={30} />
                                            </div>
                                            <div>
                                                <Dialog.Title as="h3" className="text-2xl font-black text-slate-900">
                                                    User Profile
                                                </Dialog.Title>
                                                <p className="text-slate-400 text-sm font-bold tracking-tight">Full account verification details</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedUser(null)}
                                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    {selectedUser && (
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">First Name</p>
                                                    <p className="text-slate-900 font-bold">{selectedUser.firstName || 'Not provided'}</p>
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Last Name</p>
                                                    <p className="text-slate-900 font-bold">{selectedUser.lastName || 'Not provided'}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4 p-4 rounded-2xl ring-1 ring-slate-100 bg-white shadow-sm">
                                                    <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                                                        <Mail size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</p>
                                                        <p className="text-slate-900 font-bold">{selectedUser.email}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 p-4 rounded-2xl ring-1 ring-slate-100 bg-white shadow-sm">
                                                    <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                                                        <Phone size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</p>
                                                        <p className="text-slate-900 font-bold">{selectedUser.phoneNumber || 'Not provided'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 p-4 rounded-2xl ring-1 ring-slate-100 bg-white shadow-sm">
                                                    <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                                                        <MapPin size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Address</p>
                                                        <p className="text-slate-900 font-bold">{selectedUser.address || 'Not provided'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 p-4 rounded-2xl ring-1 ring-slate-100 bg-white shadow-sm">
                                                    <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                                                        <Shield size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profile Completion</p>
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                                                    style={{ width: `${selectedUser.profileCompletion}%` }}
                                                                />
                                                            </div>
                                                            <p className="text-slate-900 font-black text-sm">{selectedUser.profileCompletion}%</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4 flex gap-3">
                                                <Button
                                                    className="flex-1 shadow-xl shadow-indigo-100"
                                                    onClick={() => {
                                                        handleApprove(selectedUser.username);
                                                        setSelectedUser(null);
                                                    }}
                                                >
                                                    Approve User
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 border-red-50 text-red-400 font-bold hover:bg-red-50 hover:border-red-100"
                                                    onClick={() => {
                                                        handleReject(selectedUser.username);
                                                        setSelectedUser(null);
                                                    }}
                                                >
                                                    Reject & Delete
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}

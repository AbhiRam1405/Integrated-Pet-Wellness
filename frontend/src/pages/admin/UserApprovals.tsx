import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import type { UserProfileResponse } from '../../types/user';
import { Button } from '../../components/Button';
import {
    Loader2, CheckCircle, UserCheck, Mail, Calendar, User, X,
    Phone, MapPin, Shield, Users, Clock, Facebook, Instagram, Twitter, Linkedin,
    Briefcase, Heart, Globe
} from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import toast from 'react-hot-toast';

export default function UserApprovals() {
    const [allUsers, setAllUsers] = useState<UserProfileResponse[]>([]);
    const [displayUsers, setDisplayUsers] = useState<UserProfileResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserProfileResponse | null>(null);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [userToReject, setUserToReject] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [allUsers, activeTab, searchQuery]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getAllUsers();
            setAllUsers(data);
        } catch (err) {
            console.error('Failed to load users', err);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        total: allUsers.length,
        pending: allUsers.filter(u => !u.isApproved).length,
        active: allUsers.filter(u => u.isApproved).length
    };

    const filterUsers = () => {
        let filtered = [...allUsers];

        // Filter by tab
        if (activeTab === 'pending') {
            filtered = filtered.filter(u => !u.isApproved);
        } else if (activeTab === 'approved') {
            filtered = filtered.filter(u => u.isApproved);
        }

        // Filter by search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(u =>
                u.username.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query) ||
                `${u.firstName} ${u.lastName}`.toLowerCase().includes(query)
            );
        }

        setDisplayUsers(filtered);
    };

    const handleApprove = async (username: string) => {
        try {
            setActionLoading(username);
            await adminApi.approveUser(username);

            // Update local state
            setAllUsers(prev => prev.map(u =>
                u.username === username ? { ...u, isApproved: true } : u
            ));

            toast.success(`User @${username} approved successfully!`);
        } catch (err) {
            toast.error('Failed to approve user.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectClick = (username: string) => {
        setUserToReject(username);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    const confirmReject = async () => {
        if (!userToReject || !rejectReason.trim()) {
            toast.error('A rejection reason is required.');
            return;
        }

        setIsRejectModalOpen(false);

        toast((t) => (
            <div className="flex flex-col gap-2 p-1">
                <div className="flex items-center gap-2 text-red-600 mb-1">
                    <Shield size={18} />
                    <span className="font-bold">Confirm Rejection</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                    Are you sure you want to reject and delete <strong>@{userToReject}</strong>?
                </p>
                <div className="flex justify-end gap-2 mt-3">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await processReject(userToReject, rejectReason);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        ), { duration: 6000 });
    };

    const processReject = async (username: string, reason: string) => {
        try {
            setActionLoading(username);
            await adminApi.rejectUser(username, reason);

            // Remove from local state
            setAllUsers(prev => prev.filter(u => u.username !== username));

            toast.success(`User @${username} rejected and notified.`);
        } catch (err) {
            toast.error('Failed to reject user.');
        } finally {
            setActionLoading(null);
            setUserToReject(null);
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
            <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                            <UserCheck size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
                    </div>
                    <p className="text-slate-500 font-medium italic">Manage registrations, verify accounts, and monitor platform users.</p>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Tab Switcher */}
                    <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
                        {(['pending', 'approved', 'all'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <User size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="block w-full pl-10 pr-3 py-2 border-2 border-slate-100 rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 sm:text-sm transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
                    <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Users</p>
                        <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
                    <div className="h-14 w-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <Clock size={28} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Pending</p>
                        <p className="text-2xl font-black text-slate-900">{stats.pending}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
                    <div className="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <CheckCircle size={28} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Approved</p>
                        <p className="text-2xl font-black text-slate-900">{stats.active}</p>
                    </div>
                </div>
            </div>

            {displayUsers.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center shadow-sm ring-1 ring-slate-100 border-2 border-dashed border-slate-100">
                    <CheckCircle size={48} className="mx-auto text-green-500 mb-4 opacity-20" />
                    <h2 className="text-xl font-bold text-slate-900">
                        {searchQuery ? 'No users found matching your search' : 'All caught up!'}
                    </h2>
                    <p className="text-slate-400 font-medium italic">
                        {searchQuery
                            ? 'Try refining your filters or search keywords.'
                            : `There are no ${activeTab === 'all' ? '' : activeTab} user accounts at this time.`}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayUsers.map((user) => (
                        <div key={user.username} className={`bg-white rounded-3xl p-6 shadow-sm ring-1 transition-all hover:shadow-xl hover:shadow-indigo-50 ${user.isApproved ? 'ring-slate-100' : 'ring-amber-200 bg-amber-50/10'
                            }`}>
                            <div className="flex items-start justify-between mb-6">
                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm ${user.isApproved ? 'bg-slate-50 text-slate-400' : 'bg-amber-100 text-amber-600'
                                    }`}>
                                    <User size={32} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.isApproved
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {user.isApproved ? 'Approved & Active' : 'Pending Verification'}
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
                                {!user.isApproved && (
                                    <Button
                                        onClick={() => handleApprove(user.username)}
                                        isLoading={actionLoading === user.username}
                                        className="w-full shadow-lg shadow-indigo-100"
                                    >
                                        Confirm Approval
                                    </Button>
                                )}
                                <div className={`grid gap-3 ${user.isApproved ? 'grid-cols-2' : 'grid-cols-2'}`}>
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedUser(user)}
                                        className="w-full border-slate-100 text-slate-600 font-bold hover:bg-slate-50"
                                    >
                                        View Details
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleRejectClick(user.username)}
                                        className="w-full border-red-50 text-red-400 font-bold hover:bg-red-50 hover:border-red-100"
                                    >
                                        Delete
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
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-[2.5rem] bg-white p-0 text-left align-middle shadow-2xl transition-all ring-1 ring-slate-100">
                                    {selectedUser && (
                                        <>
                                            {/* Modal Header */}
                                            <div className="bg-indigo-600 p-8 text-white">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-inner">
                                                            <User size={36} />
                                                        </div>
                                                        <div>
                                                            <Dialog.Title as="h3" className="text-3xl font-black">
                                                                {selectedUser.firstName} {selectedUser.lastName}
                                                            </Dialog.Title>
                                                            <p className="text-indigo-100 text-sm font-bold tracking-tight flex items-center gap-2">
                                                                <Shield size={14} /> @{selectedUser.username} • {selectedUser.role}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedUser(null)}
                                                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-indigo-100">
                                                        <span>Profile Completion</span>
                                                        <span>{selectedUser.profileCompletion}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-indigo-900/30 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-white rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                                            style={{ width: `${selectedUser.profileCompletion}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Modal Body */}
                                            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                                {/* Contact & Personal */}
                                                <section>
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                                                        <Mail size={12} className="text-indigo-500" /> Basic Information
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Email Address</p>
                                                            <p className="text-slate-900 font-bold truncate">{selectedUser.email}</p>
                                                        </div>
                                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Phone Number</p>
                                                            <p className="text-slate-900 font-bold">{selectedUser.phoneNumber || 'Not provided'}</p>
                                                        </div>
                                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Date of Birth</p>
                                                            <p className="text-slate-900 font-bold">{selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                                                        </div>
                                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Gender</p>
                                                            <p className="text-slate-900 font-bold capitalize">{selectedUser.gender || 'Not specified'}</p>
                                                        </div>
                                                    </div>
                                                </section>

                                                {/* Address */}
                                                <section>
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                                                        <MapPin size={12} className="text-indigo-500" /> Location Details
                                                    </h4>
                                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Street Address</p>
                                                            <p className="text-slate-900 font-bold">{selectedUser.address || 'Not provided'}</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">City</p>
                                                                <p className="text-slate-700 font-bold text-sm">{selectedUser.city || '—'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">State</p>
                                                                <p className="text-slate-700 font-bold text-sm">{selectedUser.state || '—'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Country</p>
                                                                <p className="text-slate-700 font-bold text-sm">{selectedUser.country || '—'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Zip</p>
                                                                <p className="text-slate-700 font-bold text-sm">{selectedUser.zipCode || '—'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </section>

                                                {/* Pet Details */}
                                                <section>
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                                                        <Heart size={12} className="text-indigo-500" /> Professional & Pet Care
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                                        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center gap-3">
                                                            <Briefcase size={20} className="text-indigo-600" />
                                                            <div>
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Experience</p>
                                                                <p className="text-sm font-black text-indigo-900">{selectedUser.experienceYears || 0} Years</p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex items-center gap-3">
                                                            <User size={20} className="text-emerald-600" />
                                                            <div>
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Total Pets</p>
                                                                <p className="text-sm font-black text-emerald-900">{selectedUser.petCount || 0} Registered</p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex items-center gap-3">
                                                            <Globe size={20} className="text-amber-600" />
                                                            <div>
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-amber-400">Language</p>
                                                                <p className="text-sm font-black text-amber-900">{selectedUser.preferredLanguage || 'English'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pet Preferences</p>
                                                        <p className="text-sm font-medium text-slate-700 italic leading-relaxed">
                                                            {selectedUser.petPreferences || 'No preferences specified.'}
                                                        </p>
                                                    </div>
                                                </section>

                                                {/* Social Links */}
                                                <section>
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                                                        <Globe size={12} className="text-indigo-500" /> Online Presence
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                            <Facebook size={16} className="text-blue-600" />
                                                            <span className="text-xs font-bold text-slate-600 truncate">{selectedUser.facebookUrl ? 'Connected' : 'Not linked'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                            <Instagram size={16} className="text-pink-600" />
                                                            <span className="text-xs font-bold text-slate-600 truncate">{selectedUser.instagramUrl ? 'Connected' : 'Not linked'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                            <Twitter size={16} className="text-sky-500" />
                                                            <span className="text-xs font-bold text-slate-600 truncate">{selectedUser.twitterUrl ? 'Connected' : 'Not linked'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                            <Linkedin size={16} className="text-blue-700" />
                                                            <span className="text-xs font-bold text-slate-600 truncate">{selectedUser.linkedinUrl ? 'Connected' : 'Not linked'}</span>
                                                        </div>
                                                    </div>
                                                </section>

                                                {/* Emergency Contact */}
                                                <section className="bg-rose-50/30 p-6 rounded-[2.5rem] border border-rose-100">
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-4 flex items-center gap-2">
                                                        <Phone size={12} className="text-rose-500 animate-pulse" /> Emergency Contact
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Contact Name</p>
                                                            <p className="text-slate-900 font-bold">{selectedUser.emergencyContactName || '—'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Relationship</p>
                                                            <p className="text-slate-900 font-bold">{selectedUser.emergencyContactRelationship || '—'}</p>
                                                        </div>
                                                        <div className="sm:col-span-2">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Phone Number</p>
                                                            <p className="text-slate-900 font-bold flex items-center gap-2">
                                                                <Phone size={14} className="text-slate-300" />
                                                                {selectedUser.emergencyContactPhone || 'Not provided'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </section>
                                            </div>

                                            {/* Modal Footer */}
                                            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                                                {!selectedUser.isApproved && (
                                                    <Button
                                                        className="flex-1 shadow-xl shadow-indigo-100 bg-indigo-600 hover:bg-indigo-700 h-12 rounded-2xl"
                                                        onClick={() => {
                                                            handleApprove(selectedUser.username);
                                                            setSelectedUser(null);
                                                        }}
                                                    >
                                                        Confirm Approval
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 border-slate-200 text-slate-600 font-bold hover:bg-white h-12 rounded-2xl"
                                                    onClick={() => {
                                                        handleRejectClick(selectedUser.username);
                                                        setSelectedUser(null);
                                                    }}
                                                >
                                                    Reject & Delete
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            {/* Rejection Modal */}
            <Transition appear show={isRejectModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[60]" onClose={() => setIsRejectModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
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
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[32px] bg-white p-8 text-left align-middle shadow-2xl transition-all border border-slate-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <Dialog.Title as="h3" className="text-xl font-black text-slate-900 flex items-center gap-3">
                                            <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                                                <X size={20} />
                                            </div>
                                            Reject User Registration
                                        </Dialog.Title>
                                        <button onClick={() => setIsRejectModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-sm font-medium text-slate-500 italic">
                                            Please provide a reason why <strong>@{userToReject}</strong> is being rejected. This will be sent to their email.
                                        </p>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Rejection Reason</label>
                                            <textarea
                                                autoFocus
                                                rows={4}
                                                className="w-full rounded-2xl bg-slate-50 border-2 border-slate-100 p-4 text-sm font-medium focus:outline-none focus:border-red-500 transition-all resize-none"
                                                placeholder="e.g. Incomplete profile details, invalid documents..."
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8 flex gap-3">
                                        <Button variant="ghost" className="flex-1 font-bold" onClick={() => setIsRejectModalOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button
                                            className="flex-1 shadow-lg shadow-red-100 bg-red-600 hover:bg-red-700 text-white border-none"
                                            onClick={confirmReject}
                                            disabled={!rejectReason.trim()}
                                        >
                                            Next Step
                                        </Button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}

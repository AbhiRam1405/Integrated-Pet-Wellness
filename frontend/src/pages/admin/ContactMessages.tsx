import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { Loader2, Mail, User, MessageSquare, Clock, Search, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '../../components/Button';
import toast from 'react-hot-toast';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
}

export default function ContactMessages() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getContactMessages();
            setMessages(data);
        } catch (err) {
            console.error('Failed to load messages', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        toast((t) => (
            <div className="flex flex-col gap-2 p-1">
                <div className="flex items-center gap-2 text-red-600 mb-1">
                    <Trash2 size={18} />
                    <span className="font-bold">Delete Inquiry?</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                    This action cannot be undone. Are you sure?
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
                            await processDelete(id);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                    >
                        Confirm Delete
                    </button>
                </div>
            </div>
        ), { duration: 6000, position: 'top-center' });
    };

    const processDelete = async (id: string) => {
        try {
            setIsDeleting(id);
            await adminApi.deleteContactMessage(id);
            setMessages(prev => prev.filter(msg => msg.id !== id));
            toast.success('Inquiry deleted successfully');
        } catch (err) {
            console.error('Failed to delete message', err);
            toast.error('Failed to delete message. Please try again.');
        } finally {
            setIsDeleting(null);
        }
    };

    const filteredMessages = messages.filter(msg => {
        const query = searchQuery.toLowerCase();
        return (
            (msg.name?.toLowerCase().includes(query)) ||
            (msg.email?.toLowerCase().includes(query)) ||
            (msg.subject?.toLowerCase().includes(query)) ||
            (msg.message?.toLowerCase().includes(query))
        );
    });

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
                            <MessageSquare size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Contact Inquiries</h1>
                    </div>
                    <p className="text-slate-500 font-medium italic">Monitor and respond to messages from the landing page.</p>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Search Bar */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="block w-full pl-10 pr-3 py-2 border-2 border-slate-100 rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 sm:text-sm transition-all shadow-sm min-w-[300px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {filteredMessages.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center shadow-sm ring-1 ring-slate-100 border-2 border-dashed border-slate-100">
                    <CheckCircle size={48} className="mx-auto text-green-500 mb-4 opacity-20" />
                    <h2 className="text-xl font-bold text-slate-900">
                        {searchQuery ? 'No messages found matching your search' : 'No inquiries yet!'}
                    </h2>
                    <p className="text-slate-400 font-medium italic">
                        {searchQuery
                            ? 'Try refining your search keywords.'
                            : 'All clear! No new messages from the landing page.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredMessages.map((msg) => (
                        <div key={msg.id} className="bg-white rounded-3xl p-6 shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-xl hover:shadow-indigo-50/50">
                            <div className="flex flex-col lg:flex-row gap-6">
                                <div className="lg:w-1/3">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{msg.name}</h3>
                                            <p className="text-sm font-bold text-indigo-600">{msg.email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center text-xs text-slate-500 font-bold uppercase tracking-widest gap-2">
                                            <Clock size={14} className="text-slate-300" />
                                            Received {new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:w-2/3 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
                                    <div className="mb-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Subject</span>
                                        <h4 className="text-xl font-black text-slate-900">{msg.subject}</h4>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Message</span>
                                        <p className="text-slate-600 font-medium leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                            {msg.message}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => window.location.href = `mailto:${msg.email}?subject=Re: ${msg.subject}`}
                                            className="font-bold border-slate-100 text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                        >
                                            <Mail size={16} />
                                            Reply via Email
                                        </Button>

                                        <Button
                                            variant="outline"
                                            isLoading={isDeleting === msg.id}
                                            onClick={() => handleDelete(msg.id)}
                                            className="font-bold border-red-50 text-red-500 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
    ShieldCheck,
    Calendar,
    Bell,
    Scissors,
    Activity,
    Heart,
    CheckCircle2,
    ArrowRight,
    Instagram,
    Twitter,
    Github
} from 'lucide-react';

const LandingPage = () => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const features = [
        {
            title: "Pet Health Records",
            description: "Securely store and manage your pet's medical history, prescriptions, and health milestones in one place.",
            icon: Activity,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            title: "Appointment Booking",
            description: "Easily book veterinary consultations, check-ups, and specialty services with real-time slot availability.",
            icon: Calendar,
            color: "text-orange-500",
            bg: "bg-orange-50"
        },
        {
            title: "Vaccination Reminders",
            description: "Never miss a shot. Automatic alerts ensure your pets stay protected with timely vaccination schedules.",
            icon: ShieldCheck,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            title: "Grooming & Services",
            description: "Professional grooming, boarding, and training services just a few clicks away from your dashboard.",
            icon: Scissors,
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            title: "Smart Notifications",
            description: "Stay informed with instant alerts for medications appointments and health tips tailored for your pet.",
            icon: Bell,
            color: "text-amber-500",
            bg: "bg-amber-50"
        }
    ];

    const steps = [
        {
            number: "01",
            title: "Register & Add Your Pet",
            description: "Create your account and build detailed profiles for all your furry (or scaly!) friends."
        },
        {
            number: "02",
            title: "Book Services",
            description: "Browse available slots for vet visits, grooming, or reminders and book instantly."
        },
        {
            number: "03",
            title: "Track & Receive",
            description: "Monitor health records and get helpful notifications when it's time for care."
        }
    ];

    return (
        <div className="bg-white selection:bg-orange-100 min-h-screen">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-200">
                            🐾
                        </div>
                        <span className="text-2xl font-black text-slate-800 tracking-tight">
                            PET<span className="text-indigo-600">WELLNESS</span>
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                        <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</a>
                        <a href="#about" className="hover:text-indigo-600 transition-colors">About Us</a>
                    </div>
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2">
                                Go to Dashboard <ArrowRight size={16} />
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-slate-50 rounded-l-[100px]" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span>
                                </span>
                                Smart Pet Care Platform
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-6">
                                Smart Pet Care, <br />
                                <span className="text-indigo-600 italic">Simplified.</span>
                            </h1>
                            <p className="text-xl text-slate-600 leading-relaxed mb-8 max-w-lg">
                                The ultimate all-in-one platform to manage your pet's wellness. From medical records to grooming appointments, we've got your furry friends covered.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                {isAuthenticated ? (
                                    <Link to="/dashboard" className="bg-orange-500 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 flex items-center gap-2 group">
                                        Go to Dashboard <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link to="/register" className="bg-orange-500 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 flex items-center gap-2 group">
                                            Get Started <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                        <Link to="/login" className="bg-white text-slate-900 border-2 border-slate-100 px-8 py-4 rounded-2xl text-lg font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center gap-2">
                                            Login
                                        </Link>
                                    </>
                                )}
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative z-10 bg-white p-4 rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-50">
                                <img
                                    src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071&auto=format&fit=crop"
                                    alt="Happy pets"
                                    className="rounded-[32px] w-full h-[500px] object-cover shadow-inner"
                                />
                                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl flex items-center gap-4 animate-bounce">
                                    <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                                        <CheckCircle2 />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Health Verified</h4>
                                        <p className="text-xs text-slate-500">All vaccines up to date</p>
                                    </div>
                                </div>
                                <div className="absolute -top-6 -right-6 bg-white p-6 rounded-3xl shadow-xl flex items-center gap-4">
                                    <div className="h-12 w-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                                        <Heart size={24} fill="currentColor" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Pet Wellness</h4>
                                        <p className="text-xs text-slate-500">Best care platform</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-slate-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-indigo-600 font-black uppercase tracking-widest text-sm mb-4">Core Features</h2>
                        <h3 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">Everything your pet needs, in one place.</h3>
                        <p className="text-lg text-slate-600">We provide a comprehensive suite of tools designed to make pet management effortless and rewarding.</p>
                    </div>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all group"
                            >
                                <div className={`${feature.bg} ${feature.color} h-14 w-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <feature.icon size={28} />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h4>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How it Works Section */}
            <section id="how-it-works" className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-orange-600 font-black uppercase tracking-widest text-sm mb-4">The Process</h2>
                        <h3 className="text-4xl font-black text-slate-900">How it works</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12">
                        {steps.map((step, idx) => (
                            <div key={idx} className="relative group">
                                <div className="mb-8 relative">
                                    <span className="text-8xl font-black text-slate-50 absolute -top-10 -left-4 group-hover:text-indigo-50 transition-colors">{step.number}</span>
                                    <div className="relative z-10 h-16 w-16 bg-white border-4 border-white shadow-xl rounded-2xl flex items-center justify-center text-indigo-600 font-black text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        {idx + 1}
                                    </div>
                                </div>
                                <h4 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h4>
                                <p className="text-slate-600 leading-relaxed font-medium">{step.description}</p>
                                {idx < 2 && (
                                    <div className="hidden lg:block absolute top-8 left-full w-1/2 border-t-2 border-dashed border-slate-200 -z-10" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 bg-indigo-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-800 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <h2 className="text-orange-400 font-black uppercase tracking-widest text-sm mb-6">Our Mission</h2>
                            <h3 className="text-4xl lg:text-5xl font-black mb-8 leading-tight">Elevating Pet Wellness through Technology.</h3>
                            <p className="text-lg text-indigo-100 leading-relaxed mb-6">
                                Managing multiple pets, keeping track of their health records, and staying on top of appointments can be overwhelming. We started Integrated Pet Wellness to solve this gap.
                            </p>
                            <p className="text-lg text-indigo-100 leading-relaxed mb-8">
                                Our platform bridges the gap between pet owners and service providers, ensuring that your pet receives consistent, high-quality care that's documented and accessible anytime, anywhere.
                            </p>
                            <div className="flex items-center gap-12">
                                <div>
                                    <div className="text-4xl font-black text-orange-400">98%</div>
                                    <div className="text-sm font-medium text-indigo-200">Owner Satisfaction</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-black text-orange-400">15k+</div>
                                    <div className="text-sm font-medium text-indigo-200">Pets Managed</div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-white/10 backdrop-blur-md p-10 rounded-[40px] border border-white/10">
                                <Activity className="text-orange-400 mb-6" size={48} />
                                <blockquote className="text-2xl font-medium leading-relaxed italic mb-8">
                                    "This application has completely transformed how I manage my three dogs. I no longer forget vet visits and having all their records in my pocket is a lifesaver."
                                </blockquote>
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden">
                                        <img src="https://i.pravatar.cc/100?img=32" alt="Sarah J." />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white uppercase text-sm tracking-wider">Sarah Johnson</div>
                                        <div className="text-xs text-indigo-300">Golden Retriever Owner</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-orange-500 rounded-[48px] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-orange-200">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-400 via-orange-500 to-orange-600 -z-10" />
                        <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 leading-tight">
                            Ready to give your pet the best care?
                        </h2>
                        <p className="text-xl text-orange-50 leading-relaxed mb-12 max-w-2xl mx-auto font-medium">
                            Join thousands of pet owners who are already managing their pet's wellness the smart way.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6">
                            {isAuthenticated ? (
                                <Link to="/dashboard" className="bg-white text-orange-600 px-10 py-5 rounded-2xl text-xl font-black hover:bg-slate-50 transition-all shadow-xl active:scale-95">
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/register" className="bg-white text-orange-600 px-10 py-5 rounded-2xl text-xl font-black hover:bg-slate-50 transition-all shadow-xl active:scale-95">
                                        Create Free Account
                                    </Link>
                                    <Link to="/about" className="bg-orange-600/20 text-white border-2 border-white/20 px-10 py-5 rounded-2xl text-xl font-black hover:bg-orange-600/40 transition-all active:scale-95">
                                        Learn More
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 pt-20 pb-10 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12 mb-20">
                        <div className="col-span-1 lg:col-span-2">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                                    🐾
                                </div>
                                <span className="text-xl font-black text-slate-800 tracking-tight">
                                    PETWELLNESS
                                </span>
                            </div>
                            <p className="text-slate-500 font-medium leading-relaxed max-w-xs mb-8">
                                Simplifying pet care management for owners and providers worldwide.
                            </p>
                            <div className="flex items-center gap-4">
                                <a href="#" className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all">
                                    <Twitter size={20} />
                                </a>
                                <a href="#" className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all">
                                    <Instagram size={20} />
                                </a>
                                <a href="#" className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all">
                                    <Github size={20} />
                                </a>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 mb-8 uppercase text-xs tracking-widest">Company</h4>
                            <ul className="space-y-4 text-slate-500 font-bold text-sm">
                                <li><a href="#" className="hover:text-indigo-600 transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-indigo-600 transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 mb-8 uppercase text-xs tracking-widest">Contact</h4>
                            <ul className="space-y-4 text-slate-500 font-bold text-sm">
                                <li>support@petwellness.com</li>
                                <li>+1 (555) 000-1234</li>
                                <li>123 Pet Lane, Care City</li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-slate-200 text-sm font-bold text-slate-400">
                        <p>© 2026 Integrated Pet Wellness. All rights reserved.</p>
                        <div className="flex gap-8 mt-4 md:mt-0">
                            <span>English (US)</span>
                            <span>Made with ❤️ for Pets</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

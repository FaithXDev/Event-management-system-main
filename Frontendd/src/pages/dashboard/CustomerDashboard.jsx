import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Ticket, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function CustomerDashboard() {
    const { user } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/registrations/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    // API returns { registrations: [...] }
                    setRegistrations(data.registrations || []);
                }
            } catch (error) {
                console.error("Failed to fetch registrations", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRegistrations();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen">
            {/* Background Effects */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-500/10 via-background to-background" />
                <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-3xl" />
            </div>

            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] opacity-10 -z-10" />

            <div className="relative z-10 max-w-5xl mx-auto">
                {/* User Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-6 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl relative overflow-hidden"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-50" />
                    <div className="relative flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl shadow-lg shadow-rose-500/25">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                Welcome back, {user?.name || 'User'}!
                            </h2>
                            <p className="text-muted-foreground">{user?.email} • {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</p>
                        </div>
                    </div>
                </motion.div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold">My Tickets</h1>
                    <p className="text-muted-foreground mt-2">Manage your upcoming event registrations</p>
                </div>

                {registrations.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-500/10 rounded-full mb-4">
                            <Ticket className="w-8 h-8 text-rose-500" />
                        </div>
                        <h3 className="text-xl font-semibold">No tickets yet</h3>
                        <p className="text-muted-foreground mt-2">Browse the homepage to find cool events!</p>
                    </motion.div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {registrations.map((reg, idx) => (
                            <motion.div
                                key={reg._id || idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative"
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/20 to-orange-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                                <div className="relative bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300">
                                    <div className="h-40 bg-muted/50 relative overflow-hidden">
                                        {reg.event?.posterUrl ? (
                                            <img
                                                src={reg.event.posterUrl}
                                                alt={reg.event.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                                <Calendar className="w-12 h-12 text-gray-600" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                                            <span className="px-3 py-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold rounded-full">
                                                {reg.status === 'attended' ? '✓ Attended' : 'Confirmed'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-lg mb-2 line-clamp-1">{reg.event?.title || 'Event Name'}</h3>
                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2 text-rose-500" />
                                                <span>{reg.event?.date ? new Date(reg.event.date).toLocaleDateString() : 'TBA'}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                                                <span>{reg.event?.location || 'TBA'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

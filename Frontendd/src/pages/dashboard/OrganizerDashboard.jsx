import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, Plus, Upload, Tag, Search, TrendingUp, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';

export default function OrganizerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [activeTab, setActiveTab] = useState('My Events');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        category: 'General',
        price: '',
        capacity: '',
        poster: null
    });

    const [stats, setStats] = useState({
        approved: 0,
        pending: 0,
        rejected: 0,
        totalEvents: 0,
        totalRegistrations: 0,
        byCategory: {}
    });

    useEffect(() => {
        if (user) {
            fetchMyEvents();
        }
    }, [user]);

    const fetchMyEvents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/events', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Filter events where the organizer matches the current user
                // Adjust logic based on how your backend returns data (populated organizer object vs id)
                const myEvents = (data.events || []).filter(
                    e => e.organizer?._id === user?.id || e.organizer === user?.id
                );

                setEvents(myEvents);
                calculateStats(myEvents);
            }
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (events) => {
        const newStats = {
            approved: events.filter(e => e.status === 'approved').length,
            pending: events.filter(e => e.status === 'pending').length,
            rejected: events.filter(e => e.status === 'rejected').length,
            totalEvents: events.length,
            totalRegistrations: events.reduce((acc, curr) => acc + (curr.registrations || 0), 0),
            byCategory: {}
        };
        events.forEach(e => {
            const cat = e.category || 'Uncategorized';
            newStats.byCategory[cat] = (newStats.byCategory[cat] || 0) + 1;
        });
        setStats(newStats);
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'poster') {
            setFormData({ ...formData, poster: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {
            const data = new FormData();
            // Combine date and time
            const fullDate = new Date(`${formData.date}T${formData.time}`);

            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('date', fullDate.toISOString());
            data.append('location', formData.location);
            data.append('category', formData.category);
            data.append('price', formData.price);
            data.append('capacity', formData.capacity);
            if (formData.poster) {
                data.append('poster', formData.poster);
            }

            const token = localStorage.getItem('token');
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data
            });

            if (res.ok) {
                setFormData({
                    title: '', description: '', date: '', time: '', location: '',
                    category: 'General', price: '', capacity: '', poster: null
                });
                alert('Event Created Successfully!');
                fetchMyEvents();
                setActiveTab('My Events'); // Switch back to list view
            } else {
                const err = await res.json();
                alert(`Error: ${err.message}`);
            }
        } catch (error) {
            console.error("Failed to create event", error);
            alert("Something went wrong");
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#09090b]">
                <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pt-32 px-4 sm:px-6 lg:px-8 font-sans selection:bg-purple-500/30 relative overflow-hidden">
            {/* Background gradient from Admin/Hero */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="from-primary/20 via-background to-background absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]"></div>
                <div className="bg-primary/5 absolute top-0 left-1/2 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full blur-3xl"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:16px_16px] opacity-15"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-12">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                            Welcome back, <span className="text-purple-500">{user?.name || 'Organizer'}</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 text-base">
                            Access your dashboard to manage your events and view analytics.
                        </p>
                    </div>
                    <div>
                        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-500 text-xs font-semibold tracking-wider uppercase">
                            Organizer Dashboard
                        </span>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="mb-8 border-b border-border">
                    <div className="flex space-x-8 overflow-x-auto no-scrollbar">
                        {['My Events', 'Create New Event', 'Analytics'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab
                                    ? 'text-orange-500' // Keeping orange accent for Organizer distinction
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 md:p-8 min-h-[500px] border border-border shadow-sm">
                    {/* Content Header based on Tab */}
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-semibold text-foreground">
                            {activeTab === 'My Events' && 'Your Events'}
                            {activeTab === 'Create New Event' && 'Create a New Event'}
                            {activeTab === 'Analytics' && 'Performance Overview'}
                        </h2>
                        {activeTab === 'My Events' && (
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-purple-500/10 text-purple-500 text-xs font-medium rounded-full border border-purple-500/20">
                                    {events.length} Total
                                </span>
                                <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-medium rounded-full border border-green-500/20">
                                    {stats.approved} Active
                                </span>
                            </div>
                        )}
                    </div>

                    <AnimatePresence mode="popLayout">
                        {/* MY EVENTS TAB */}
                        {activeTab === 'My Events' && (
                            <div className="space-y-6">
                                {events.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center w-full h-80 border border-dashed border-border rounded-2xl"
                                    >
                                        <div className="p-4 bg-muted rounded-full mb-4">
                                            <Calendar className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground font-medium mb-2">No events found</p>
                                        <Button
                                            variant="outline"
                                            onClick={() => setActiveTab('Create New Event')}
                                        >
                                            Create your first event
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-6">
                                        {events.map((event, idx) => (
                                            <motion.div
                                                key={event._id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="group relative bg-card border border-border rounded-2xl p-4 hover:border-purple-500/50 transition-colors shadow-sm"
                                            >
                                                <div className="flex flex-col md:flex-row gap-6">
                                                    {/* Poster */}
                                                    <div className="w-full md:w-56 h-36 rounded-xl overflow-hidden shrink-0 bg-muted relative">
                                                        {event.posterUrl ? (
                                                            <img
                                                                src={event.posterUrl}
                                                                alt={event.title}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                                                <Calendar className="w-8 h-8" />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-2 right-2">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide backdrop-blur-md border ${event.status === 'approved' ? 'bg-green-500/20 border-green-500/30 text-green-100' :
                                                                    event.status === 'rejected' ? 'bg-red-500/20 border-red-500/30 text-red-100' :
                                                                        'bg-yellow-500/20 border-yellow-500/30 text-yellow-100'
                                                                }`}>
                                                                {event.status}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Details */}
                                                    <div className="flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex justify-between items-start">
                                                                <h3 className="text-lg font-semibold text-foreground group-hover:text-purple-500 transition-colors">
                                                                    {event.title}
                                                                </h3>
                                                                <span className="flex items-center text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                                                                    <Tag className="w-3 h-3 mr-1" />
                                                                    {event.category}
                                                                </span>
                                                            </div>
                                                            <p className="text-muted-foreground text-sm mt-2 line-clamp-2 max-w-2xl">
                                                                {event.description}
                                                            </p>
                                                            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                                                                <span className="flex items-center">
                                                                    <Calendar className="w-3 h-3 mr-1.5" />
                                                                    {new Date(event.date).toLocaleDateString()}
                                                                </span>
                                                                <span className="flex items-center">
                                                                    <MapPin className="w-3 h-3 mr-1.5" />
                                                                    {event.location}
                                                                </span>
                                                                <span className="flex items-center">
                                                                    <Users className="w-3 h-3 mr-1.5" />
                                                                    {event.registrations || 0} / {event.capacity}
                                                                </span>
                                                                <span className="flex items-center">
                                                                    <DollarSign className="w-3 h-3 mr-1.5" />
                                                                    {event.price > 0 ? `$${event.price}` : 'Free'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CREATE EVENT TAB */}
                        {activeTab === 'Create New Event' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="max-w-3xl mx-auto"
                            >
                                <form onSubmit={handleCreateSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Event Title</Label>
                                                <Input
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter event name"
                                                    required
                                                    className="bg-secondary/50 border-border"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Date</Label>
                                                    <Input
                                                        type="date"
                                                        name="date"
                                                        value={formData.date}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="bg-secondary/50 border-border"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Time</Label>
                                                    <Input
                                                        type="time"
                                                        name="time"
                                                        value={formData.time}
                                                        onChange={handleInputChange}
                                                        required
                                                        className="bg-secondary/50 border-border"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Category</Label>
                                                <select
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleInputChange}
                                                    className="flex h-10 w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="General">General</option>
                                                    <option value="Tech">Tech</option>
                                                    <option value="Workshop">Workshop</option>
                                                    <option value="Sports">Sports</option>
                                                    <option value="Cultural">Cultural</option>
                                                    <option value="Arts">Arts</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Location</Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                        name="location"
                                                        value={formData.location}
                                                        onChange={handleInputChange}
                                                        placeholder="Venue address"
                                                        className="pl-9 bg-secondary/50 border-border"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Price ($)</Label>
                                                    <Input
                                                        type="number"
                                                        name="price"
                                                        value={formData.price}
                                                        onChange={handleInputChange}
                                                        placeholder="0.00"
                                                        min="0"
                                                        className="bg-secondary/50 border-border"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Capacity</Label>
                                                    <Input
                                                        type="number"
                                                        name="capacity"
                                                        value={formData.capacity}
                                                        onChange={handleInputChange}
                                                        placeholder="Max attendees"
                                                        min="1"
                                                        className="bg-secondary/50 border-border"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Event Poster</Label>
                                                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-secondary/50 transition-colors cursor-pointer relative">
                                                    <input
                                                        type="file"
                                                        name="poster"
                                                        onChange={handleInputChange}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        accept="image/*"
                                                    />
                                                    <div className="flex flex-col items-center">
                                                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                                        <span className="text-sm text-muted-foreground">
                                                            {formData.poster ? formData.poster.name : "Click or drag to upload"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    placeholder="Describe your event..."
                                                    className="bg-secondary/50 border-border min-h-[120px]"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button
                                            type="submit"
                                            className="w-full md:w-auto min-w-[200px]"
                                            disabled={creating}
                                        >
                                            {creating ? (
                                                <>Processing...</>
                                            ) : (
                                                <>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Publish Event
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* ANALYTICS TAB */}
                        {activeTab === 'Analytics' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-card border border-border rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-medium text-muted-foreground">Total Events</h3>
                                            <Calendar className="w-4 h-4 text-purple-500" />
                                        </div>
                                        <div className="text-2xl font-bold">{stats.totalEvents}</div>
                                    </div>
                                    <div className="bg-card border border-border rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-medium text-muted-foreground">Approved</h3>
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        </div>
                                        <div className="text-2xl font-bold text-green-500">{stats.approved}</div>
                                    </div>
                                    <div className="bg-card border border-border rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
                                            <Clock className="w-4 h-4 text-yellow-500" />
                                        </div>
                                        <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
                                    </div>
                                    <div className="bg-card border border-border rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-medium text-muted-foreground">Total Registrations</h3>
                                            <Users className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-card border border-border rounded-xl p-6">
                                        <h3 className="font-semibold mb-6 flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-purple-500" />
                                            Events by Category
                                        </h3>
                                        <div className="space-y-4">
                                            {Object.entries(stats.byCategory).map(([cat, count]) => (
                                                <div key={cat} className="flex items-center justify-between">
                                                    <span className="text-sm text-muted-foreground">{cat}</span>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-2 w-32 bg-secondary rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-purple-500"
                                                                style={{ width: `${(count / stats.totalEvents) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-medium w-6 text-right">{count}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {Object.keys(stats.byCategory).length === 0 && (
                                                <p className="text-muted-foreground text-sm italic">No data available yet.</p>
                                            )}
                                        </div>
                                    </div>


                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

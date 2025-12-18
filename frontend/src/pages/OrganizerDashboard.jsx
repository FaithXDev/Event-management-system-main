import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { Calendar, MapPin, Tag, Image as ImageIcon, Plus, Download, Users, Mail } from 'lucide-react';

export default function OrganizerDashboard() {
    const { user } = useAuth();
    const [mine, setMine] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('Tech');
    const [description, setDescription] = useState('');
    const [poster, setPoster] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ open: false, type: 'info', message: '' });

    const showToast = (type, message) => {
        setToast({ open: true, type, message });
        setTimeout(() => setToast({ open: false, type: 'info', message: '' }), 3000);
    };

    useEffect(() => {
        loadMyEvents();
    }, []);

    async function loadMyEvents() {
        try {
            const res = await axios.get('/api/events', { params: { organizer: user.id } });
            setMine(res.data.events || []);
        } catch (e) {
            showToast('error', 'Failed to load events');
        }
    }

    async function loadParticipants(eventId) {
        try {
            const res = await axios.get(`/api/registrations/${eventId}/participants`);
            setParticipants(res.data.participants || []);
        } catch (e) {
            showToast('error', 'Failed to load participants');
        }
    }

    async function exportCsv(eventId) {
        try {
            const check = await axios.get(`/api/registrations/${eventId}/participants`);
            if (!check.data.participants?.length) {
                showToast('error', 'No participants available.');
                return;
            }
            const res = await axios.get(`/api/registrations/${eventId}/participants.csv`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a'); a.href = url; a.download = `participants-${eventId}.csv`; a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            showToast('error', 'Export failed.');
        }
    }

    async function sendReminders(eventId) {
        // Optional: Confirm with user before sending
        if (!confirm("Are you sure you want to send ticket emails to all registered participants?")) return;

        try {
            const res = await axios.post(`/api/events/${eventId}/remind`);
            showToast('success', res.data.message);
        } catch (e) {
            showToast('error', e.response?.data?.message || 'Failed to send reminders');
        }
    }

    async function createEvent(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('title', title);
            fd.append('date', date);
            fd.append('location', location);
            fd.append('category', category);
            fd.append('description', description);
            if (poster) fd.append('poster', poster);
            await axios.post('/api/events', fd);
            showToast('success', 'Event created successfully');
            setTitle(''); setDate(''); setLocation(''); setDescription(''); setPoster(null);
            await loadMyEvents();
        } catch (err) {
            showToast('error', 'Failed to create event');
        } finally {
            setLoading(false);
        }
    }

    const analytics = useMemo(() => {
        const byStatus = mine.reduce((acc, e) => { acc[e.status] = (acc[e.status] || 0) + 1; return acc; }, {});
        const byCategory = mine.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + 1; return acc; }, {});
        return { byStatus, byCategory };
    }, [mine]);

    return (
        <div className="space-y-6">
            {toast.open && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white font-medium ${toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-rose-600' : 'bg-blue-600'}`}>
                    {toast.message}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 w-full">
                {/* Create Event Form - Height dictated by content, parent grid stretches both cols to equal height */}
                <form onSubmit={createEvent} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-2 shrink-0">
                        <div className="bg-orange-950/30 p-2 rounded-lg border border-orange-500/20"><Plus className="w-5 h-5 text-orange-500" /></div>
                        <h2 className="font-bold text-lg text-white">Create New Event</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Title</label>
                            <input className="input w-full bg-slate-950 border-slate-800 text-slate-200" placeholder="Event Name" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Date & Time</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                    <input className="input w-full pl-10 bg-slate-950 border-slate-800 text-slate-200" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Category</label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                    <select className="input w-full pl-10 bg-slate-950 border-slate-800 text-slate-200" value={category} onChange={(e) => setCategory(e.target.value)}>
                                        <option>Tech</option><option>Sports</option><option>Cultural</option><option>Workshop</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                <input className="input w-full pl-10 bg-slate-950 border-slate-800 text-slate-200" placeholder="Venue Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Description</label>
                            <textarea className="input w-full min-h-[100px] bg-slate-950 border-slate-800 text-slate-200" rows="4" placeholder="Event details..." value={description} onChange={(e) => setDescription(e.target.value)} required />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Cover Image</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                <input className="input w-full pl-10 bg-slate-950 border-slate-800 text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700" type="file" onChange={(e) => setPoster(e.target.files[0])} accept="image/*" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1"></div> {/* Spacer to push only if needed, but actually we want button 'attached'. Removing flex-1 from above div fixes the 'pushed to bottom' behavior. But if the container is taller, we might want the button to just sit below fields. */}
                    {/* Actually, simply removing flex-1 from the input container is enough. The grid cell height is dictated by the LARGEST column. If Right Col > Left Col, Left Col background stretches. By removing flex-1, the content stacks at top. */}

                    <button className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 shrink-0" disabled={loading}>
                        {loading ? 'Publishing...' : 'Publish Event'}
                    </button>
                </form>

                <div className="flex flex-col gap-6 h-full">
                    {/* Analytics */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shrink-0">
                        <h2 className="font-bold text-lg text-white mb-4">Quick Stats</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                                <div className="text-xs text-slate-500 uppercase font-semibold mb-2">By Status</div>
                                <ul className="space-y-2 text-sm">
                                    {Object.entries(analytics.byStatus).map(([k, v]) => (
                                        <li key={k} className="flex justify-between items-center text-slate-300">
                                            <span className="capitalize">{k}</span>
                                            <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-white">{v}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                                <div className="text-xs text-slate-500 uppercase font-semibold mb-2">By Category</div>
                                <ul className="space-y-2 text-sm">
                                    {Object.entries(analytics.byCategory).map(([k, v]) => (
                                        <li key={k} className="flex justify-between items-center text-slate-300">
                                            <span>{k}</span>
                                            <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-white">{v}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* My Events List - Stretches to fill remaining height to match Form */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 flex-1 flex flex-col min-h-0">
                        <h2 className="font-bold text-lg text-white mb-4 shrink-0">My Events ({mine.length})</h2>
                        <ul className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                            {mine.map((e) => (
                                <li key={e._id} className="p-4 border border-slate-800 rounded-xl bg-slate-950/50 hover:bg-slate-950 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-semibold text-white group-hover:text-orange-500 transition-colors">{e.title}</div>
                                        <span className={`text-xs px-2 py-0.5 rounded border ${e.status === 'approved' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900' : e.status === 'pending' ? 'bg-amber-950/30 text-amber-400 border-amber-900' : 'bg-rose-950/30 text-rose-400 border-rose-900'}`}>{e.status}</span>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700" onClick={() => { setSelectedEvent(e._id); loadParticipants(e._id); }}>
                                            <Users className="w-3 h-3" /> Manage
                                        </button>
                                        <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700" onClick={() => exportCsv(e._id)}>
                                            <Download className="w-3 h-3" /> CSV
                                        </button>
                                        <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700" onClick={() => sendReminders(e._id)}>
                                            <Mail className="w-3 h-3" /> Mail
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Participants Modal/Section */}
                    {selectedEvent && (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shrink-0 h-[300px] flex flex-col">
                            <div className="flex justify-between items-center mb-4 shrink-0">
                                <h2 className="font-bold text-lg text-white">Participants</h2>
                                <button onClick={() => setSelectedEvent('')} className="text-slate-500 hover:text-slate-300 text-sm">Close</button>
                            </div>

                            {participants.length === 0 ? (
                                <div className="text-sm text-slate-500 italic p-6 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/30 shrink-0">
                                    No participants found
                                </div>
                            ) : (
                                <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                    {participants.map(a => (
                                        <div key={a._id} className="flex items-center justify-between p-3 border border-slate-800 rounded-lg bg-slate-950/50">
                                            <div>
                                                <div className="text-sm font-medium text-slate-200">{a.user?.name}</div>
                                                <div className="text-xs text-slate-500">{a.user?.email}</div>
                                            </div>
                                            <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-400 border border-slate-800">{a.status}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

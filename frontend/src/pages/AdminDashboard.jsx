import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
    const [tab, setTab] = useState('pending'); // 'pending' | 'all'
    const [pending, setPending] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [users, setUsers] = useState([]);
    const [toast, setToast] = useState({ open: false, type: 'info', message: '' });

    const showToast = (type, message) => {
        setToast({ open: true, type, message });
        setTimeout(() => setToast({ open: false, type: 'info', message: '' }), 3000);
    };

    useEffect(() => {
        if (tab === 'pending') loadPending();
        else if (tab === 'all') loadAllEvents();
        else if (tab === 'users') loadUsers();
    }, [tab]);

    async function loadPending() {
        try {
            const res = await axios.get('/api/events', { params: { status: 'pending' } });
            setPending(res.data.events || []);
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to load pending events');
        }
    }

    async function loadAllEvents() {
        try {
            // Load all events regardless of status
            const res = await axios.get('/api/events');
            setAllEvents(res.data.events || []);
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to load all events');
        }
    }

    async function loadUsers() {
        try {
            const res = await axios.get('/api/admin/users');
            setUsers(res.data.users || []);
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to load users');
        }
    }

    async function changeRole(userId, newRole) {
        try {
            await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
            showToast('success', 'User role updated');
            loadUsers();
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to update user role');
        }
    }

    async function approve(id) {
        try {
            await axios.post(`/api/admin/events/${id}/approve`);
            showToast('success', 'Event approved');
            await loadPending();
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to approve event');
        }
    }

    async function reject(id) {
        try {
            await axios.post(`/api/admin/events/${id}/reject`);
            showToast('success', 'Event rejected');
            await loadPending();
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to reject event');
        }
    }

    async function openParticipants(event) {
        setSelectedEvent(event);
        try {
            const res = await axios.get(`/api/registrations/${event._id}/participants`);
            setParticipants(res.data.participants || []);
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to load participants');
        }
    }

    async function updateStatus(userId, newStatus) {
        try {
            await axios.post(`/api/registrations/${selectedEvent._id}/checkin`, { userId, status: newStatus });
            showToast('success', `User marked as ${newStatus}`);
            // Refresh participants
            const res = await axios.get(`/api/registrations/${selectedEvent._id}/participants`);
            setParticipants(res.data.participants || []);
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to update status');
        }
    }

    async function exportCsv(eventId) {
        try {
            const res = await axios.get(`/api/registrations/${eventId}/participants.csv`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url; a.download = `participants-${eventId}.csv`; a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to export CSV');
        }
    }

    return (
        <div className="space-y-8">
            {toast.open && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white shadow-lg ${toast.type === 'error' ? 'bg-red-600' : toast.type === 'success' ? 'bg-green-600' : 'bg-blue-600'}`}>
                    {toast.message}
                </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-8 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
                <button
                    className={`pb-3 px-2 font-medium text-sm transition-all relative whitespace-nowrap ${tab === 'pending' ? 'text-orange-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    onClick={() => setTab('pending')}
                >
                    Pending Reviews
                    {tab === 'pending' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 rounded-t-full"></span>}
                </button>
                <button
                    className={`pb-3 px-2 font-medium text-sm transition-all relative whitespace-nowrap ${tab === 'all' ? 'text-orange-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    onClick={() => setTab('all')}
                >
                    All Events & Management
                    {tab === 'all' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 rounded-t-full"></span>}
                </button>
                <button
                    className={`pb-3 px-2 font-medium text-sm transition-all relative whitespace-nowrap ${tab === 'users' ? 'text-orange-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    onClick={() => setTab('users')}
                >
                    User Management
                    {tab === 'users' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 rounded-t-full"></span>}
                </button>
            </div>

            {/* Content */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 w-full shadow-sm">
                {tab === 'pending' ? (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Pending Events</h2>
                            <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full dark:bg-amber-900/40 dark:text-amber-300">
                                {pending.length} Pending
                            </span>
                        </div>
                        {pending.length === 0 ? (
                            <div className="py-12 px-6 text-center text-slate-500 italic border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                                No pending events to review at the moment.
                            </div>
                        ) : (
                            <ul className="space-y-4">
                                {pending.map((e) => (
                                    <li key={e._id} className="p-5 border border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 hover:shadow-md transition-shadow grid md:grid-cols-12 gap-6 items-start group">
                                        <div className="md:col-span-9 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">{e.title}</div>
                                                <span className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md text-slate-500">{e.category}</span>
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                                By <span className="font-medium text-slate-900 dark:text-slate-200">{e.organizer?.name}</span> • {new Date(e.date).toLocaleString()}
                                            </div>
                                            <div className="text-sm text-slate-500 py-3 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800/50 italic">
                                                "{e.description}"
                                            </div>
                                            <div className="text-xs text-slate-400 flex items-center gap-1">
                                                📍 {e.location}
                                            </div>
                                        </div>
                                        <div className="md:col-span-3 flex md:flex-col gap-3 justify-end md:items-end h-full">
                                            <button
                                                className="inline-flex items-center justify-center rounded-xl px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors w-full md:w-32 shadow-sm font-medium text-sm"
                                                onClick={() => approve(e._id)}
                                            >
                                                ✓ Approve
                                            </button>
                                            <button
                                                className="inline-flex items-center justify-center rounded-xl px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 transition-colors w-full md:w-32 shadow-sm font-medium text-sm border border-transparent"
                                                onClick={() => reject(e._id)}
                                            >
                                                ✕ Reject
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ) : tab === 'all' ? (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">All Events Directory</h2>
                            <div className="text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{allEvents.length} total events</div>
                        </div>
                        {allEvents.length === 0 ? (
                            <div className="py-12 text-center text-slate-500 italic border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                No events found in the system.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {allEvents.map((e) => (
                                    <div key={e._id} className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 hover:border-orange-200/50 dark:hover:border-orange-900/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <div className="font-bold text-lg truncate text-slate-800 dark:text-slate-100">{e.title}</div>
                                                <span className={`text-xs px-2.5 py-0.5 rounded-full border capitalize font-medium whitespace-nowrap ${e.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' :
                                                    e.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' :
                                                        'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800'
                                                    }`}>
                                                    {e.status}
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 truncate">
                                                <span><span className="font-medium text-slate-900 dark:text-slate-300">{e.organizer?.name}</span></span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                <span>{e.category}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                <span>{new Date(e.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                                            <button
                                                className="btn-outline text-xs px-4 py-2 flex-1 md:flex-none justify-center bg-white dark:bg-slate-900"
                                                onClick={() => exportCsv(e._id)}
                                            >
                                                Download CSV
                                            </button>
                                            <button
                                                className="btn text-xs px-4 py-2 flex-1 md:flex-none justify-center bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                                                onClick={() => openParticipants(e)}
                                            >
                                                Manage & Check-in
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">User Management</h2>
                            <div className="text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{users.length} users</div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">User</th>
                                        <th className="px-6 py-4 font-semibold">Email</th>
                                        <th className="px-6 py-4 font-semibold">Current Role</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {users.map((u) => (
                                        <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{u.name}</td>
                                            <td className="px-6 py-4 text-slate-500">{u.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${u.role === 'admin' ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' :
                                                        u.role === 'organizer' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' :
                                                            'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                    }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <select
                                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2 ml-auto"
                                                    value={u.role}
                                                    onChange={(e) => changeRole(u._id, e.target.value)}
                                                >
                                                    <option value="customer">Customer</option>
                                                    <option value="organizer">Organizer</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Check-in Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl ring-1 ring-slate-900/5 transform transition-all">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-800/50">
                            <div>
                                <h3 className="font-bold text-xl text-slate-900 dark:text-white">Participants Management</h3>
                                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                    Running event: <span className="font-medium text-slate-700 dark:text-slate-300">{selectedEvent.title}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-black/20">
                            {participants.length === 0 ? (
                                <div className="text-center py-16 text-slate-500 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-2xl mb-4">👥</div>
                                    <h4 className="font-medium text-slate-900 dark:text-white">No participants yet</h4>
                                    <p className="text-sm mt-1">Wait for users to register for this event.</p>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold">Participant</th>
                                                <th className="px-6 py-4 font-semibold">Contact</th>
                                                <th className="px-6 py-4 font-semibold">Status</th>
                                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {participants.map((p) => (
                                                <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{p.user?.name}</td>
                                                    <td className="px-6 py-4 text-slate-500">{p.user?.email}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.status === 'attended'
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                            : p.status === 'left'
                                                                ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                                                                : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                            }`}>
                                                            {p.status === 'attended' ? '● Present' : p.status === 'left' ? '○ Checked Out' : 'Registered'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {p.status !== 'attended' && (
                                                                <button
                                                                    onClick={() => updateStatus(p.user?._id, 'attended')}
                                                                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition-all"
                                                                >
                                                                    Check In
                                                                </button>
                                                            )}
                                                            {p.status === 'attended' && (
                                                                <button
                                                                    onClick={() => updateStatus(p.user?._id, 'left')}
                                                                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg transition-all"
                                                                >
                                                                    Check Out
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3">
                            <button onClick={() => exportCsv(selectedEvent._id)} className="btn-outline text-sm">Download List CSV</button>
                            <button onClick={() => setSelectedEvent(null)} className="btn text-sm px-6">Done</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

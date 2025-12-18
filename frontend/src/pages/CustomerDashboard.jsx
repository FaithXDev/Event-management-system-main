import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import EventTicket from '../components/EventTicket.jsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Ticket, Download, Eye, Calendar, MapPin } from 'lucide-react';

export default function CustomerDashboard() {
    const { user } = useAuth();
    const [mine, setMine] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [downloadAction, setDownloadAction] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [toast, setToast] = useState({ open: false, type: 'info', message: '' });

    const showToast = (type, message) => {
        setToast({ open: true, type, message });
        setTimeout(() => setToast({ open: false, type: 'info', message: '' }), 3000);
    };

    useEffect(() => {
        loadMyRegs();
    }, []);

    async function loadMyRegs() {
        try {
            const res = await axios.get('/api/registrations/me');
            setMine(res.data.registrations || []);
        } catch (e) {
            showToast('error', 'Failed to load registrations');
        }
    }

    const downloadTicketDirect = async (registration) => {
        try {
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '-9999px';
            tempDiv.style.width = '980px';
            tempDiv.style.padding = '20px';
            document.body.appendChild(tempDiv);
            const event = registration.event;
            const eventDate = new Date(event?.date);
            tempDiv.innerHTML = `
              <div style="width: 980px; padding: 20px;">
                <div style="display: flex; min-height: 360px; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                  <div style="flex: 1; padding: 32px; color: white; background: linear-gradient(135deg, #c2410c, #ea580c, #c2410c);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
                      <div><div style="font-size: 14px; letter-spacing: 0.1em; color: #fdba74;">EVENT MANAGER</div><div style="font-size: 12px; color: #fed7aa;">Official Event Ticket</div></div>
                    </div>
                    <div style="margin-bottom: 24px;">
                      <div style="font-size: 36px; font-weight: 800; letter-spacing: 0.025em;">${event?.title}</div>
                      <div style="color: #fed7aa; font-weight: 600; margin-top: 4px;">${event?.category} EVENT</div>
                    </div>
                    <div style="display: flex; align-items: end; gap: 32px; margin-bottom: 24px;">
                      <div style="font-size: 30px; font-weight: 800; letter-spacing: 0.025em;">${eventDate.toLocaleDateString('en-GB')}</div>
                      <div style="font-size: 30px; font-weight: 800; letter-spacing: 0.025em;">${eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div style="text-transform: uppercase; letter-spacing: 0.1em; color: #fed7aa; margin-bottom: 24px;">${event?.location}</div>
                  </div>
                  <div style="width: 2px; background: rgba(255,255,255,0.4); position: relative;"><div style="position: absolute; top: 24px; bottom: 24px; left: 0; right: 0; border-left: 2px dashed rgba(255,255,255,0.7);"></div></div>
                  <div style="width: 256px; padding: 24px; color: white; background: linear-gradient(to bottom, #9a3412, #7c2d12); display: flex; flex-direction: column;">
                    <div style="color: #fed7aa; font-size: 16px; font-weight: 700; margin-bottom: 20px; writing-mode: vertical-rl; text-orientation: mixed; letter-spacing: 2px;">${eventDate.getDate()} • ${eventDate.getHours()}:${eventDate.getMinutes()}</div>
                    <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; margin-bottom: 16px; text-align: center;">
                      <div style="color: #fed7aa; font-size: 14px; margin-bottom: 8px;">ENTRY QR</div>
                      ${registration.qrCodeDataUrl ? `<img src="${registration.qrCodeDataUrl}" style="margin: 0 auto; width: 144px; height: 144px; border-radius: 6px; background: white; padding: 4px;" />` : ''}
                    </div>
                  </div>
                </div>
              </div>`;
            await new Promise(resolve => setTimeout(resolve, 1000));
            const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true, backgroundColor: '#ffffff', padding: 20 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const width = pdf.internal.pageSize.getWidth();
            const height = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'PNG', 10, 10, width - 20, (canvas.height * (width - 20)) / canvas.width);
            pdf.save(`${event?.title?.replace(/[^a-zA-Z0-9]/g, '_')}_ticket.pdf`);
            document.body.removeChild(tempDiv);
        } catch (error) {
            showToast('error', 'Failed to generate ticket PDF');
        }
    };

    const filtered = activeTab === 'all' ? mine : mine.filter(m => m.status === activeTab);

    return (
        <div className="space-y-6">
            {toast.open && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white font-medium ${toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-rose-600' : 'bg-blue-600'}`}>
                    {toast.message}
                </div>
            )}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="font-bold text-lg text-white">My Registrations</h2>
                    <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800">
                        <button onClick={() => setActiveTab('all')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>All</button>
                        <button onClick={() => setActiveTab('registered')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'registered' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Active</button>
                        <button onClick={() => setActiveTab('pending')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'pending' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Pending</button>
                    </div>
                </div>

                {mine.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-950/30">
                        <Ticket className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-300">No events found</h3>
                        <p className="text-slate-500 mt-2 max-w-sm mx-auto">You haven't registered for any events yet. Explore events to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((r) => (
                            <div key={r._id} className="group relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all hover:shadow-xl hover:shadow-orange-500/10">
                                <div className="p-1 absolute top-3 right-3 z-10">
                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase backdrop-blur-md border ${r.status === 'registered' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                            r.status === 'attended' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                                'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                        }`}>
                                        {r.status}
                                    </span>
                                </div>

                                <div className="h-32 bg-slate-900 border-b border-slate-800 relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                                    {r.event?.poster ? <img src={r.event.poster} className="w-full h-full object-cover opacity-60" /> : <div className="w-full h-full bg-slate-900" />}
                                </div>

                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-white mb-1 line-clamp-1">{r.event?.title}</h3>
                                    <div className="space-y-2 mt-3">
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <Calendar className="w-4 h-4 text-orange-600" />
                                            <span>{new Date(r.event?.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                            <MapPin className="w-4 h-4 text-orange-600" />
                                            <span className="truncate">{r.event?.location}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <button onClick={() => setSelectedTicket(r)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium text-sm transition-all shadow-lg shadow-orange-500/20">
                                            <Eye className="w-4 h-4" /> View
                                        </button>
                                        <button onClick={() => downloadTicketDirect(r)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors text-sm">
                                            <Download className="w-4 h-4" /> PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Ticket Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-800 shadow-2xl">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Ticket className="w-5 h-5 text-orange-500" /> Event Ticket
                                </h3>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => downloadAction && downloadAction()} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 transition-all">
                                        <Download className="w-4 h-4" /> Download
                                    </button>
                                    <button onClick={() => setSelectedTicket(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors">
                                        ×
                                    </button>
                                </div>
                            </div>
                            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 flex justify-center">
                                <EventTicket
                                    registration={selectedTicket}
                                    user={user}
                                    onReady={(fn) => setDownloadAction(() => fn)}
                                    onDownload={() => { }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

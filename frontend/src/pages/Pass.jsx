import { useEffect, useState } from 'react';
import axios from 'axios';
import { Ticket, Calendar, MapPin, WifiOff, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Pass() {
  const [regs, setRegs] = useState([]);
  const [downloading, setDownloading] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await axios.get('/api/registrations/me');
        setRegs(r.data.registrations || []);
      } catch (e) {
        console.error("Failed to load passes");
      }
    })();
  }, []);

  async function downloadPdf(regId, eventTitle) {
    const element = document.getElementById(`ticket-${regId}`);
    if (!element) return;

    setDownloading(regId);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: null,
        ignoreElements: (el) => el.classList.contains('no-print'),
      });

      const imgData = canvas.toDataURL('image/png');
      // Landscape A5
      const pdf = new jsPDF('l', 'mm', 'a5');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${eventTitle.replace(/\s+/g, '_')}_Ticket.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setDownloading('');
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">My Event Passes</h1>
          <p className="text-slate-400 mt-1">Access your tickets and QR codes for upcoming events.</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-900/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <WifiOff className="w-3 h-3" />
          Offline Ready
        </div>
      </div>

      {regs.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
          <Ticket className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300">No active passes</h3>
          <p className="text-slate-500 mt-2">Register for an event to see your pass here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {regs.map(r => (
            <div key={r._id} id={`ticket-${r._id}`} className="group relative w-full max-w-4xl mx-auto flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.01]">

              {/* Left Section - Event Details */}
              <div className="flex-1 bg-[#cf4509] p-8 text-white relative">
                <div className="flex flex-col h-full justify-between gap-6">
                  <div>
                    <div className="opacity-80 text-xs font-medium tracking-wider uppercase mb-1">Event Manager</div>
                    <div className="opacity-60 text-[10px] uppercase tracking-widest">Official Event Ticket</div>
                  </div>

                  <div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none mb-2">{r.event?.title}</h2>
                    <div className="text-orange-200 font-medium tracking-wide uppercase text-sm">{r.event?.category || 'General Event'}</div>
                  </div>

                  <div className="flex flex-wrap items-end justify-between font-mono gap-4">
                    <div className="flex items-center gap-6">
                      <span className="text-2xl md:text-3xl font-bold">{new Date(r.event?.date || Date.now()).toLocaleDateString('en-GB')}</span>
                      <span className="text-2xl md:text-3xl font-bold">{new Date(r.event?.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-orange-200 font-bold uppercase tracking-wider text-sm">{r.event?.location}</div>
                  </div>
                </div>
              </div>

              {/* Dotted Divider & Connector */}
              <div className="hidden md:block w-[0px] border-l-2 border-dashed border-white/40 absolute left-[70%] top-0 bottom-0 z-10"></div>

              {/* Right Section - QR & Entry */}
              <div className="md:w-[30%] bg-[#5c200b] p-6 flex flex-col items-center justify-center text-center relative border-t-2 border-dashed border-white/20 md:border-t-0 md:border-l-0">
                {/* Vertical text decoration */}
                <div className="absolute right-3 top-4 text-[#cf4509] font-mono text-xs font-bold writing-vertical-rl tracking-widest rotate-180 hidden md:block opacity-60">
                  {r._id.slice(-6).toUpperCase()} • 2025
                </div>

                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm mb-4">
                  <div className="text-white/60 text-[10px] font-bold tracking-widest uppercase mb-2">Entry QR</div>
                  <div className="bg-white p-2 rounded-lg">
                    {r.qrCodeDataUrl ? (
                      <img src={r.qrCodeDataUrl} alt="QR" className="w-32 h-32 md:w-36 md:h-36 object-contain" />
                    ) : (
                      <div className="w-32 h-32 bg-slate-200 rounded flex items-center justify-center text-xs text-slate-400">Loading...</div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => downloadPdf(r._id, r.event?.title)}
                  disabled={downloading === r._id}
                  className="no-print mt-auto flex items-center gap-2 px-4 py-2 bg-[#cf4509] hover:bg-[#b03a08] text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-lg"
                >
                  <Download className="w-3 h-3" />
                  {downloading === r._id ? 'Saving...' : 'Download Ticket'}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

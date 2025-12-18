import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { Calendar, MapPin, Share2, Download, Star } from 'lucide-react';

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => setToast({ open: false, type: 'info', message: '' }), 5000);
  };

  useEffect(() => {
    load();
  }, [id, user]);

  async function load() {
    try {
      const promises = [
        axios.get(`/api/events/${id}`),
        axios.get(`/api/reviews/${id}`),
      ];

      if (user) {
        promises.push(axios.get(`/api/registrations/${id}/status`));
      }

      const results = await Promise.all(promises);
      const e = results[0];
      const r = results[1];

      setEvent(e.data.event);
      setReviews(r.data.reviews || []);

      if (user) {
        const userReview = r.data.reviews?.find(review => review.user?._id === user.id);
        setHasReviewed(!!userReview);

        if (results[2]) {
          setIsRegistered(results[2].data.isRegistered);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function register() {
    try {
      await axios.post(`/api/registrations/${id}/register`);
      setIsRegistered(true);
      showToast('success', 'Registered! Check your email for confirmation.');
    } catch (e) {
      showToast('error', 'Registration failed.');
    }
  }

  function shareEvent() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: event.title, text: event.description, url }).catch(() => { });
    } else {
      navigator.clipboard.writeText(url);
      showToast('success', 'Event link copied!');
    }
  }

  function downloadIcs() {
    const start = new Date(event.date);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CampusEvents//EN\nBEGIN:VEVENT\nUID:${event._id}@campus\nDTSTAMP:${start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nDTSTART:${start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nDTEND:${end.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nSUMMARY:${event.title}\nDESCRIPTION:${event.description}\nLOCATION:${event.location}\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${event.title}.ics`; a.click(); URL.revokeObjectURL(url);
  }

  async function submitReview() {
    try {
      await axios.post(`/api/reviews/${id}`, { rating, comment });
      showToast('success', 'Review posted successfully!');
      setComment('');
      await load();
    } catch (error) {
      if (error.response?.status === 401) {
        showToast('warning', 'Please log in to post a review.');
      } else {
        showToast('error', error.response?.data?.message || 'Failed to post review.');
      }
    }
  }

  if (!event) return <div className="p-10 text-center text-slate-500 animate-pulse">Loading event details...</div>;

  return (
    <div className="space-y-8 pb-10">
      {/* Toast */}
      {toast.open && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white font-medium ${toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'warning' ? 'bg-orange-600' : toast.type === 'error' ? 'bg-rose-600' : 'bg-blue-600'}`}>
          {toast.message}
        </div>
      )}

      {/* Hero Header */}
      <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 group">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
        <img
          src={event.posterUrl || '/placeholder.svg'}
          className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
          alt={event.title}
        />
        <div className="absolute bottom-0 left-0 p-6 md:p-8 z-20 w-full">
          <span className="inline-block px-3 py-1 rounded-full bg-orange-600/90 text-white text-xs font-semibold mb-3 border border-orange-500/50 backdrop-blur-sm">
            {event.category || 'Event'}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-slate-300 text-sm md:text-base">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-orange-500" /> {new Date(event.date).toLocaleString()}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-orange-500" /> {event.location}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Description */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About this Event</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>

          {/* Reviews */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reviews</h2>
              <div className="flex items-center gap-1 text-orange-500 font-bold bg-orange-950/30 px-3 py-1 rounded-lg border border-orange-500/20">
                <Star className="w-4 h-4 fill-current" />
                <span>{event.averageRating?.toFixed(1) || 'N/A'}</span>
              </div>
            </div>

            {user && !hasReviewed && (
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Write a review</h3>
                <div className="flex gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setRating(star)} className={`transition-colors ${rating >= star ? 'text-orange-500' : 'text-slate-300 dark:text-slate-700'}`}>
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="input flex-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience..."
                  />
                  <button className="btn bg-orange-600 hover:bg-orange-500 text-white" onClick={submitReview} disabled={!comment.trim()}>Post</button>
                </div>
              </div>
            )}

            <ul className="space-y-4">
              {reviews.length === 0 ? (
                <li className="text-slate-500 italic">No reviews yet. Be the first!</li>
              ) : reviews.map((r) => (
                <li key={r._id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{r.user?.name || 'Anonymous'}</span>
                    <div className="flex text-orange-500 text-xs">
                      {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{r.comment}</p>
                  <div className="text-xs text-slate-600 mt-2">{new Date(r.createdAt).toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sticky top-24 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Registration</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">Secure your spot for this event.</p>

            <button
              className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg mb-3 ${isRegistered ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-500/50 cursor-default' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed'}`}
              onClick={register}
              disabled={!user || isRegistered}
            >
              {isRegistered ? 'Registered' : user ? 'Register Now' : 'Sign In to Register'}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors text-sm" onClick={shareEvent}>
                <Share2 className="w-4 h-4" /> Share
              </button>
              <button className="flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors text-sm" onClick={downloadIcs}>
                <Download className="w-4 h-4" /> Save .ics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import EventDetails from './pages/EventDetails.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import OrganizerDashboard from './pages/OrganizerDashboard.jsx';
import CustomerDashboard from './pages/CustomerDashboard.jsx';
import Pass from './pages/Pass.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Footer from './components/Footer.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { useEffect, useState } from 'react';

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function useTheme() {
  useEffect(() => {
    // Enforce dark mode
    document.documentElement.classList.add('dark');
    if (document.body) document.body.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  return 'dark'; // Always dark
}

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  // useTheme(); // Just call it to enforce effect if needed, but it's called in App/Layout structure or just here.
  // Actually, let's keep it simple. Layout uses Navbar. We can just call useTheme inside Layout or App to be safe, but Navbar is fine.
  useTheme();

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          EventOne
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link to="/" className={`transition-colors ${location.pathname === '/' ? 'text-orange-500 font-semibold' : 'hover:text-orange-500'}`}>Home</Link>
          <Link to="/events" className={`transition-colors ${location.pathname === '/events' ? 'text-orange-500 font-semibold' : 'hover:text-orange-500'}`}>Events</Link>
          {user && (
            <>
              <Link to="/pass" className={`transition-colors ${location.pathname === '/pass' ? 'text-orange-500 font-semibold' : 'hover:text-orange-500'}`}>My Pass</Link>
              <Link to="/dashboard" className={`transition-colors ${location.pathname.startsWith('/dashboard') ? 'text-orange-500 font-semibold' : 'hover:text-orange-500'}`}>Dashboard</Link>
            </>
          )}

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-2" />

          {user ? (
            <button onClick={logout} className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Logout</button>
          ) : (
            <>
              <Link to="/login" className="btn-outline px-6">Sign In</Link>
              <Link to="/signup" className="btn px-6">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function Layout({ children }) {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      <Navbar />
      {!isLanding && (
        <section className="animated-hero-bg border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">Discover and Manage Events</h1>
            <p className="text-slate-600 dark:text-slate-300">Register, organize, review, and track your event participation.</p>
          </div>
        </section>
      )}
      <main className={`flex-1 ${isLanding ? '' : 'max-w-6xl mx-auto p-4 w-full'}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

function DashboardDispatcher() {
  const { user } = useAuth();
  if (!user) return null;

  let DashboardComponent;
  if (user.role === 'admin') DashboardComponent = AdminDashboard;
  else if (user.role === 'organizer') DashboardComponent = OrganizerDashboard;
  else DashboardComponent = CustomerDashboard;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 w-full border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400">{user?.name || 'User'}</span>
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Access your dashboard to manage events and account settings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-100 dark:border-orange-800 uppercase tracking-wide">
            {user?.role} Dashboard
          </span>
        </div>
      </div>
      <DashboardComponent />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/events" element={<Home />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pass" element={<PrivateRoute roles={["customer", "organizer", "admin"]}><Pass /></PrivateRoute>} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute roles={["customer", "organizer", "admin"]}>
                  <DashboardDispatcher />
                </PrivateRoute>
              }
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

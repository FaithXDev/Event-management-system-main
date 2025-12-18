import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, BarChart3, Shield, Award, MessageSquare, CheckCircle2, Star } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-orange-500/30 transition-colors duration-300">

            {/* Hero Section */}
            <section className="relative pt-24 pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/10 via-slate-950/0 to-slate-950/0" />
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-950/30 border border-orange-500/20 text-orange-400 text-sm font-medium mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                        v2.0 is live
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-slate-900 dark:text-white">
                        EventOne – One Platform to <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                            Host Seamless Events
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Plan, manage, and host events effortlessly with EventOne. From registration to post-event analytics, we provide everything needed for seamless and successful events.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/events" className="w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
                            Explore Events
                        </Link>
                        <Link to="/pass" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/50 rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                            Documentation
                        </Link>
                    </div>

                    <div className="mt-20 relative rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
                        <img
                            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2070"
                            alt="Event Dashboard"
                            className="w-full h-auto opacity-80"
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white dark:bg-slate-950">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-orange-500 font-semibold mb-2 tracking-wide uppercase text-sm">Features</h2>
                        <h3 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Powerful Platform <br /> For seamless event management</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Calendar className="w-6 h-6 text-orange-400" />}
                            title="Event Management"
                            desc="Create, manage, and track events effortlessly. Set dates, venues, and schedules anytime."
                        />
                        <FeatureCard
                            icon={<Users className="w-6 h-6 text-orange-400" />}
                            title="Event Registration"
                            desc="Seamless registration for participants with instant confirmation emails and QR codes."
                        />
                        <FeatureCard
                            icon={<Shield className="w-6 h-6 text-orange-400" />}
                            title="Team & Role Management"
                            desc="Assign roles to team members and manage permissions for secure access."
                        />
                        <FeatureCard
                            icon={<Award className="w-6 h-6 text-orange-400" />}
                            title="Certificate Distribution"
                            desc="Automatically generate and distribute certificates to attendees after the event."
                        />
                        <FeatureCard
                            icon={<MessageSquare className="w-6 h-6 text-orange-400" />}
                            title="Real-time Collaboration"
                            desc="Collaborate with your team in real-time to ensure everything runs smoothly."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="w-6 h-6 text-orange-400" />}
                            title="Analytics Dashboard"
                            desc="Get detailed insights into event performance, attendee engagement, and more."
                        />
                    </div>
                </div>
            </section>

            {/* Community Section */}
            <section className="py-24 bg-slate-50 dark:bg-slate-900/30 border-y border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-orange-500/20 blur-2xl rounded-full" />
                            <img
                                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1632"
                                alt="Community"
                                className="relative rounded-2xl shadow-2xl border border-slate-700"
                            />
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Empowering Communities <span className="text-orange-500">Through Technology.</span></h2>
                            <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">We provide a comprehensive ecosystem for communities to grow, engage, and succeed in their missions.</p>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="mt-1 bg-orange-500/10 p-2 rounded-lg h-fit">
                                        <CheckCircle2 className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 dark:text-white text-lg">Hosted 5k+ Successful Events</h4>
                                        <p className="text-slate-600 dark:text-slate-400 mt-1">Join thousands of organizations that trust EventOne for their event management needs.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="mt-1 bg-orange-500/10 p-2 rounded-lg h-fit">
                                        <Users className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 dark:text-white text-lg">Trusted by Tech Communities</h4>
                                        <p className="text-slate-600 dark:text-slate-400 mt-1">Our platform is tailored to meet the specific needs of tech communities and developer groups.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Pricing</h2>
                        <p className="text-slate-600 dark:text-slate-400">Choose the plan that fits your needs</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <PricingCard
                            name="Starter"
                            price="Free"
                            period="/month"
                            features={['Create and manage up to 3 events', 'Basic event registration', 'Email notifications', 'Certificate distribution']}
                        />
                        <PricingCard
                            name="Community"
                            price="₹499"
                            period="/year"
                            features={['Unlimited events creation', 'Team role management', 'Secure certificate templates', 'Custom analytics dashboard']}
                            highlighted
                        />
                        <PricingCard
                            name="Organization"
                            price="Custom"
                            period="/month"
                            features={['Dedicated admin dashboard', 'Advanced analytics & insights', 'Priority support', 'Custom integrations & branding']}
                        />
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-slate-50 dark:bg-slate-900/30 border-y border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">What People <span className="text-orange-500">are saying</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <TestimonialCard
                            name="Simarpreet Singh"
                            role="Head of Developer Students Club"
                            text="EventOne has completely transformed how we manage our community events. The platform is intuitive, and the features are exactly what we needed."
                        />
                        <TestimonialCard
                            name="Tracy Wang"
                            role="Tech Event Organize"
                            text="I love the simplicity of registering users and the dashboard analytics. It makes my life so much easier when planning large scale hackathons."
                        />
                        <TestimonialCard
                            name="Ayush Kumar Tiwari"
                            role="Community Lead"
                            text="The customer support is exceptional, and the platform is rock solid. We've hosted 20+ events with zero issues. Highly recommended!"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 transition-colors group shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-lg bg-orange-950/30 border border-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{desc}</p>
        </div>
    );
}

function PricingCard({ name, price, period, features, highlighted }) {
    return (
        <div className={`p-8 rounded-3xl border ${highlighted ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'} flex flex-col shadow-sm`}>
            <h3 className="text-xl font-medium text-slate-900 dark:text-slate-300 mb-2">{name}</h3>
            <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">{price}</span>
                <span className="text-slate-500 text-sm ml-1">{period}</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
                {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                        <CheckCircle2 className={`w-5 h-5 ${highlighted ? 'text-orange-500' : 'text-slate-400 dark:text-slate-600'}`} />
                        {f}
                    </li>
                ))}
            </ul>
            <button className={`w-full py-3 rounded-xl font-semibold transition-all ${highlighted ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-500/25' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                Subscribe
            </button>
        </div>
    );
}

function TestimonialCard({ name, role, text }) {
    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-4 shadow-sm">
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-orange-500 fill-orange-500" />)}
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">"{text}"</p>
            <div className="flex items-center gap-4 mt-auto">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-500">
                    {name[0]}
                </div>
                <div>
                    <h4 className="text-slate-900 dark:text-white font-medium text-sm">{name}</h4>
                    <p className="text-slate-500 text-xs">{role}</p>
                </div>
            </div>
        </div>
    );
}

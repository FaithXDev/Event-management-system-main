import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 text-slate-600 dark:text-slate-400 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                <div>
                    <h4 className="text-slate-900 dark:text-white font-semibold mb-6">Resources</h4>
                    <ul className="space-y-4 text-sm">
                        <li><Link to="#" className="hover:text-orange-500 transition-colors">Getting started</Link></li>
                        <li><Link to="#" className="hover:text-orange-500 transition-colors">Documentation</Link></li>
                        <li><Link to="#" className="hover:text-orange-500 transition-colors">Tutorials</Link></li>
                        <li><Link to="#" className="hover:text-orange-500 transition-colors">API Reference</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-slate-900 dark:text-white font-semibold mb-6">Platform</h4>
                    <ul className="space-y-4 text-sm">
                        <li><Link to="#" className="hover:text-orange-500 transition-colors">Features</Link></li>
                        <li><Link to="#" className="hover:text-orange-500 transition-colors">Supported Devices</Link></li>
                        <li><Link to="#" className="hover:text-orange-500 transition-colors">System Requirements</Link></li>
                        <li><Link to="#" className="hover:text-orange-500 transition-colors">Downloads</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-slate-900 dark:text-white font-semibold mb-6">Community</h4>
                    <ul className="space-y-4 text-sm">
                        <li><Link to="#" className="hover:text-orange-500 transition-colors">Forums</Link></li>
                        <li><Link to="#" className="hover:text-orange-500 transition-colors">Meetups</Link></li>
                        <li><Link to="#" className="hover:text-orange-500 transition-colors">Events</Link></li>
                        <li><Link to="#" className="hover:text-orange-500 transition-colors">Discord</Link></li>
                    </ul>
                </div>
                <div className="col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">EventOne</span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        One platform to host seamless events. Join us today and transform your event management experience.
                    </p>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                <p>© 2025 EventOne. All rights reserved.</p>
                <div className="flex gap-6">
                    <Link to="#" className="hover:text-slate-300">Privacy Policy</Link>
                    <Link to="#" className="hover:text-slate-300">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
}

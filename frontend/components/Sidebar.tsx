'use client';

import { Users, Megaphone, BarChart3, Calendar, MessageCircle, Settings, BookOpen, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';

export default function Sidebar() {
    return (
        <div className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 flex flex-col h-screen shadow-2xl">
            {/* Branding Section */}
            <div className="p-6 border-b border-slate-700/50 bg-slate-900/50">
                <div className="flex items-center space-x-2 mb-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Sparkles size={18} className="text-white" />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Lead Nurturing
                    </h1>
                </div>
                <p className="text-xs text-slate-400 ml-10 font-medium">CRM Platform</p>
            </div>

            <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
                <a href="/" className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-800/60 hover:text-white rounded-xl transition-all duration-200 group">
                    <LayoutDashboard size={20} className="text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Dashboard</span>
                </a>
                <a href="/leads" className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-800/60 hover:text-white rounded-xl transition-all duration-200 group">
                    <Users size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Leads</span>
                </a>
                <a href="/campaigns" className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-800/60 hover:text-white rounded-xl transition-all duration-200 group">
                    <Megaphone size={20} className="text-purple-400 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Create Campaign</span>
                </a>
                <a href="/campaigns/list" className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-800/60 hover:text-white rounded-xl transition-all duration-200 group">
                    <BarChart3 size={20} className="text-amber-400 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">All Campaigns</span>
                </a>
                <a href="/analytics" className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-800/60 hover:text-white rounded-xl transition-all duration-200 group">
                    <BarChart3 size={20} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Campaign Analytics</span>
                </a>
                <a href="/scheduled" className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-800/60 hover:text-white rounded-xl transition-all duration-200 group">
                    <Calendar size={20} className="text-rose-400 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-sm">Property Visit/Call Scheduled</span>
                </a>
                <a href="/followups" className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-800/60 hover:text-white rounded-xl transition-all duration-200 group">
                    <MessageCircle size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">AI Agent Follow-ups</span>
                </a>
                <a href="/settings" className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-800/60 hover:text-white rounded-xl transition-all duration-200 group">
                    <Settings size={20} className="text-slate-400 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">AI Agent Settings</span>
                </a>
                <a href="/knowledge" className="flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-800/60 hover:text-white rounded-xl transition-all duration-200 group">
                    <BookOpen size={20} className="text-teal-400 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Knowledge Base</span>
                </a>
            </nav>

            {/* Footer Section */}
            <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('username');
                        localStorage.removeItem('email');
                        localStorage.removeItem('chatMessages');
                        sessionStorage.clear();
                        window.location.href = '/login';
                    }}
                    className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200 w-full group"
                >
                    <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Calendar, BarChart2, Users, Settings, HelpCircle, LogOut, Train, X, Sun, Moon, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
    darkMode?: boolean;
    toggleDarkMode?: () => void;
}

const Sidebar = ({ darkMode, toggleDarkMode }: SidebarProps) => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [modal, setModal] = useState<'settings' | 'help' | null>(null);

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: CheckSquare, label: 'Daily Logs', path: '/tasks' },
        { icon: Calendar, label: 'Calendar', path: '/calendar' },
        { icon: BarChart2, label: 'Analytics', path: '/analytics' },
        { icon: Users, label: 'Team', path: '/team' },
    ];

    return (
        <>
            <aside className="w-64 h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors duration-200">
                {/* Brand */}
                <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-100 dark:border-slate-800">
                    <div className="bg-dmrc-navy text-white p-2 rounded-xl shadow-lg">
                        <Train size={24} />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                        DMRC <span className="text-dmrc-cobalt">HK</span>
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-6 px-4">
                    {/* Role Badge */}
                    {user && (
                        <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Logged in as</p>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user.full_name}</p>
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${isAdmin
                                    ? 'bg-dmrc-cobalt/10 text-dmrc-cobalt'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                }`}>
                                {isAdmin ? 'ADMINISTRATOR' : `STAFF · ${user.station_name || 'Unassigned'}`}
                            </span>
                        </div>
                    )}

                    {/* Menu */}
                    <div>
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-3">Menu</p>
                        <nav className="space-y-1">
                            {menuItems.map((item) => (
                                <NavLink
                                    key={item.label}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive
                                            ? 'bg-dmrc-navy text-white shadow-md'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`
                                    }
                                >
                                    <item.icon size={20} className="shrink-0" />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    {/* General */}
                    <div>
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-3">General</p>
                        <nav className="space-y-1">
                            {/* Settings — opens modal, no page reload */}
                            <button
                                onClick={() => setModal('settings')}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <Settings size={20} className="shrink-0" />
                                <span className="font-medium text-sm">Settings</span>
                            </button>

                            {/* Help — opens modal, no page reload */}
                            <button
                                onClick={() => setModal('help')}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <HelpCircle size={20} className="shrink-0" />
                                <span className="font-medium text-sm">Help</span>
                            </button>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <LogOut size={20} className="shrink-0" />
                                <span className="font-medium text-sm">Logout</span>
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Bottom DMRC Card */}
                <div className="px-4 pb-6 mt-auto">
                    <div className="bg-gradient-to-br from-dmrc-navy to-dmrc-cobalt rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                        <div className="flex items-center gap-2 mb-3">
                            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm"><Train size={16} /></div>
                        </div>
                        <h4 className="font-bold text-sm mb-1">DMRC Connect</h4>
                        <p className="text-xs text-blue-100/80 mb-4 leading-relaxed">Manage operations on the field.</p>
                        <button className="w-full bg-white/10 hover:bg-white/20 transition-colors text-white text-xs font-semibold py-2 px-4 rounded-lg">
                            Download App
                        </button>
                    </div>
                </div>
            </aside>

            {/* Settings Modal */}
            {modal === 'settings' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 w-80 m-4" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="font-bold text-slate-800 dark:text-white">Settings</h2>
                            <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {darkMode ? <Moon size={16} /> : <Sun size={16} />} Appearance
                                </div>
                                <button onClick={toggleDarkMode}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-dmrc-cobalt' : 'bg-slate-200'}`}>
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-6' : ''}`} />
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{darkMode ? 'Dark mode is on.' : 'Light mode is on.'} The preference is saved in your browser.</p>
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    <strong className="text-slate-700 dark:text-slate-300">Account:</strong> {user?.full_name}<br />
                                    <strong className="text-slate-700 dark:text-slate-300">Role:</strong> {user?.role}<br />
                                    {user?.station_name && <><strong className="text-slate-700 dark:text-slate-300">Station:</strong> {user.station_name}</>}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Help Modal */}
            {modal === 'help' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setModal(null)}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 w-96 m-4" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><Info size={18} className="text-dmrc-cobalt" /> Help & Usage</h2>
                            <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
                        </div>
                        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 space-y-1.5">
                                <p className="font-semibold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wide">Quick Guide</p>
                                <p>• <strong>Dashboard</strong>: Overview of station stats and operational modules.</p>
                                <p>• <strong>Daily Logs</strong>: Record staff attendance for the day.</p>
                                <p>• <strong>Analytics</strong>: Visual charts for waste, machinery, and manpower.</p>
                                <p>• <strong>Calendar</strong>: View activity by date (read-only).</p>
                                <p>• <strong>Team</strong>: Admin-only user management.</p>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                                <p className="font-semibold text-amber-700 dark:text-amber-400 text-xs uppercase tracking-wide mb-1">Demo Accounts</p>
                                <p className="text-xs text-amber-600 dark:text-amber-500">Admin: <span className="font-mono">admin / admin123</span></p>
                                <p className="text-xs text-amber-600 dark:text-amber-500">Staff: <span className="font-mono">staff_rajiv_chowk / staff123</span></p>
                            </div>
                            <p className="text-xs text-slate-400">Admin roles are created via database access only and cannot be self-registered.</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;

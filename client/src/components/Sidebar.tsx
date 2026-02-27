import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Calendar, BarChart2, Users, Settings, HelpCircle, LogOut, Train } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
        { icon: Calendar, label: 'Calendar', path: '/calendar' },
        { icon: BarChart2, label: 'Analytics', path: '/analytics' },
        { icon: Users, label: 'Team', path: '/team' },
    ];

    const generalItems = [
        { icon: Settings, label: 'Settings', path: '/settings' },
        { icon: HelpCircle, label: 'Help', path: '/help' },
    ];

    return (
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

                {/* Menu Section */}
                <div>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-3">
                        Menu
                    </p>
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

                {/* General Section */}
                <div>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-3">
                        General
                    </p>
                    <nav className="space-y-1">
                        {generalItems.map((item) => (
                            <NavLink
                                key={item.label}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                                        ? 'bg-dmrc-navy text-white'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`
                                }
                            >
                                <item.icon size={20} className="shrink-0" />
                                <span className="font-medium text-sm">{item.label}</span>
                            </NavLink>
                        ))}

                        {/* Logout Button */}
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
                        <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                            <Train size={16} />
                        </div>
                    </div>
                    <h4 className="font-bold text-sm mb-1">DMRC Connect</h4>
                    <p className="text-xs text-blue-100/80 mb-4 leading-relaxed">
                        Manage operations easily on the field.
                    </p>
                    <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors text-white text-xs font-semibold py-2 px-4 rounded-lg">
                        Download App
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

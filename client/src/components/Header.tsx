import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, ChevronDown, MapPin, Building2 } from 'lucide-react';
import { useAuth, AuthUser } from '../context/AuthContext';
import api from '../api';

interface Station {
    id: number;
    name: string;
    line: string;
}

interface HeaderProps {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode }) => {
    const { user, isAdmin, selectedStationId, setSelectedStation } = useAuth();
    const [stations, setStations] = useState<Station[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch stations for admin dropdown (max 10)
    useEffect(() => {
        if (isAdmin) {
            api.get('/stations?limit=10')
                .then(res => setStations(res.data?.slice(0, 10) || []))
                .catch(() => setStations([]));
        }
    }, [isAdmin]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selectedStation = stations.find(s => s.id === selectedStationId);

    return (
        <header className="h-20 px-8 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200 shrink-0">

            {/* Station Selector (Admin) or Station Name (Staff) */}
            <div className="flex-1 max-w-sm">
                {isAdmin ? (
                    /* Admin: Station dropdown */
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(prev => !prev)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-dmrc-cobalt focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt/30 transition w-full"
                        >
                            <MapPin size={16} className="text-dmrc-cobalt shrink-0" />
                            <span className="flex-1 text-left truncate">
                                {selectedStation ? selectedStation.name : 'All Stations (Overview)'}
                            </span>
                            <ChevronDown size={16} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {dropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                                {/* All stations option */}
                                <button
                                    onClick={() => { setSelectedStation(null); setDropdownOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition hover:bg-slate-50 dark:hover:bg-slate-700 ${!selectedStationId ? 'text-dmrc-cobalt font-semibold' : 'text-slate-700 dark:text-slate-300'}`}
                                >
                                    <Building2 size={14} />
                                    All Stations (Overview)
                                </button>
                                <div className="border-t border-slate-100 dark:border-slate-700" />
                                {stations.length === 0 && (
                                    <p className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500">No stations found.</p>
                                )}
                                {stations.map(station => (
                                    <button
                                        key={station.id}
                                        onClick={() => { setSelectedStation(station.id); setDropdownOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition hover:bg-slate-50 dark:hover:bg-slate-700 ${selectedStationId === station.id ? 'text-dmrc-cobalt font-semibold' : 'text-slate-700 dark:text-slate-300'}`}
                                    >
                                        <MapPin size={14} className="shrink-0 text-slate-400" />
                                        <span className="flex-1 truncate">{station.name}</span>
                                        <span className="text-xs text-slate-400 shrink-0">{station.line}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Staff: Locked station */
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                        <MapPin size={16} className="text-amber-600 shrink-0" />
                        <div>
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium leading-none">Your Station</p>
                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 leading-tight mt-0.5">
                                {user?.station_name || 'Unassigned'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 ml-8">
                <div className="flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-slate-700">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-dmrc-navy to-dmrc-cobalt p-[2px] shadow-sm">
                        <div className="h-full w-full rounded-full border-2 border-white dark:border-slate-800 overflow-hidden bg-white">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}&backgroundColor=f0f9ff`}
                                alt="User avatar"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">{user?.full_name || 'Guest'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight capitalize">{user?.role || ''}</p>
                    </div>
                </div>
            </div>

        </header>
    );
};

export default Header;

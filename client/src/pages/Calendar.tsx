import React, { useState, useEffect } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

// Calendar is read-only, derived from existing entries.
// No scheduling or future planning is implemented.

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const Calendar = () => {
    const { selectedStationId, user } = useAuth();
    const stationId = selectedStationId ?? user?.station_id ?? null;

    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [entryCounts, setEntryCounts] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const params = stationId ? `?station_id=${stationId}` : '';
        // Fetch manpower logs to populate calendar dots
        api.get(`/manpower${params}`)
            .then(res => {
                const counts: Record<string, number> = {};
                (res.data || []).forEach((log: any) => {
                    if (log.date) {
                        const d = log.date.split('T')[0];
                        counts[d] = (counts[d] || 0) + 1;
                    }
                });
                setEntryCounts(counts);
            })
            .catch(() => setEntryCounts({}))
            .finally(() => setIsLoading(false));
    }, [stationId]);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

    const dateKey = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = (d: number) => today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Calendar</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Read-only view of daily operational entries. Dots indicate logged activity.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                {/* Navigation */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400">
                        <ChevronLeft size={18} />
                    </button>
                    <h2 className="font-bold text-slate-800 dark:text-white">
                        {MONTHS[month]} {year}
                    </h2>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-400">
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
                    {DAYS.map(d => (
                        <div key={d} className="py-2.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                {isLoading ? (
                    <div className="p-8 text-center text-slate-400 dark:text-slate-500 animate-pulse">Loading entries…</div>
                ) : (
                    <div className="grid grid-cols-7">
                        {cells.map((day, idx) => {
                            if (!day) return <div key={idx} className="h-16 border-b border-r border-slate-50 dark:border-slate-800/50" />;
                            const count = entryCounts[dateKey(day)] ?? 0;
                            return (
                                <div key={idx} className={`h-16 p-2 border-b border-r border-slate-50 dark:border-slate-800/50 flex flex-col ${isToday(day) ? 'bg-dmrc-cobalt/5 dark:bg-dmrc-cobalt/10' : ''}`}>
                                    <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-dmrc-navy text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {day}
                                    </span>
                                    {count > 0 && (
                                        <div className="mt-auto flex items-center gap-1">
                                            <span className="block w-1.5 h-1.5 rounded-full bg-dmrc-cobalt" />
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400">{count}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Legend */}
                <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <span className="block w-3 h-3 rounded-full bg-dmrc-navy" />
                        Today
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="block w-1.5 h-1.5 rounded-full bg-dmrc-cobalt" />
                        Activity logged
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calendar;

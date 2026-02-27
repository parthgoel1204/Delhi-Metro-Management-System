import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';

const AlertsWidget = () => {
    const alerts = [
        {
            title: 'Water Leakage at Platform 2',
            station: 'Rajiv Chowk',
            time: '10 mins ago',
            type: 'critical'
        },
        {
            title: 'Scrubber Machine Maintenance',
            station: 'Kashmere Gate',
            time: '1 hour ago',
            type: 'warning'
        },
        {
            title: 'Deep Clean Scheduled',
            station: 'HUDA City Centre',
            time: '02:00 AM - 04:00 AM',
            type: 'info'
        }
    ];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Urgent Alerts</h3>
                <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full dark:bg-red-900/30 dark:text-red-400">
                    2 New
                </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {alerts.map((alert, i) => (
                    <div key={i} className="flex gap-4 items-start p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800 group">
                        <div className={`
              mt-0.5 p-2 rounded-lg flex-shrink-0
              ${alert.type === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : ''}
              ${alert.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' : ''}
              ${alert.type === 'info' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : ''}
            `}>
                            <AlertCircle size={18} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{alert.title}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                <span className="font-medium text-slate-600 dark:text-slate-300">{alert.station}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Clock size={12} />{alert.time}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 bg-dmrc-navy hover:bg-dmrc-cobalt text-white rounded-xl py-2.5 text-sm font-semibold transition-colors shadow-sm">
                Dispatch Response Team
            </button>
        </div>
    );
};

export default AlertsWidget;

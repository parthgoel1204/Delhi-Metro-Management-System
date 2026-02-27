import React from 'react';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    trend: string;
    isPositive: boolean;
    isActive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, isPositive, isActive }) => {
    return (
        <div className={`p-6 rounded-2xl shadow-sm border transition-all duration-300 relative overflow-hidden group hover:shadow-md
      ${isActive
                ? 'bg-dmrc-navy text-white border-dmrc-navy dark:border-slate-800'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
            }
    `}>
            {/* Decorative Blur Background for active card */}
            {isActive && (
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 blur-3xl rounded-full pointer-events-none"></div>
            )}

            <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className={`text-sm font-medium ${isActive ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {title}
                </h3>
                <button className={`p-1.5 rounded-full backdrop-blur-md transition-colors
          ${isActive
                        ? 'bg-white/20 text-white hover:bg-white/30'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                    }
        `}>
                    <ArrowUpRight size={16} className="rotate-45" />
                </button>
            </div>

            <div className="mb-4 relative z-10">
                <span className="text-4xl font-bold tracking-tight">{value}</span>
            </div>

            <div className="flex items-center gap-2 relative z-10">
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded
          ${isActive
                        ? 'bg-white/20 text-white'
                        : isPositive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                    }
        `}>
                    {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    <span>{trend}</span>
                </div>
                <span className={`text-xs ${isActive ? 'text-blue-100/90' : 'text-slate-500 dark:text-slate-400'}`}>
                    Increased from last month
                </span>
            </div>
        </div>
    );
};

export default StatCard;

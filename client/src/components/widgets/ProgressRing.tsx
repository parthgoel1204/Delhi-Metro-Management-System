import React from 'react';

interface ProgressRingProps {
    progress: number; // 0 to 100
    title: string;
    subtitle: string;
    statusText: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ progress, title, subtitle, statusText }) => {
    const radius = 60;
    const strokeWidth = 14;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center relative overflow-hidden h-full">
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-dmrc-surface to-white dark:from-slate-800 dark:to-slate-900 z-0"></div>

            <div className="w-full relative z-10">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
            </div>

            <div className="relative mt-4 mb-2 flex items-center justify-center z-10">
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="transform -rotate-90"
                >
                    {/* Background Ring */}
                    <circle
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={strokeWidth}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className="text-slate-100 dark:text-slate-800"
                    />
                    {/* Foreground Ring */}
                    <circle
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset }}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className="text-dmrc-navy dark:text-dmrc-cobalt drop-shadow-md transition-all duration-1000 ease-in-out"
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-800 dark:text-white">{progress}%</span>
                    <span className="text-[10px] text-slate-500 font-medium dark:text-slate-400">{subtitle}</span>
                </div>
            </div>

            {/* Legend */}
            <div className="flex w-full justify-between items-center mt-auto pt-4 relative z-10 w-4/5">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-dmrc-navy dark:bg-dmrc-cobalt"></span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700"></span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Pending</span>
                </div>
            </div>
        </div>
    );
};

export default ProgressRing;

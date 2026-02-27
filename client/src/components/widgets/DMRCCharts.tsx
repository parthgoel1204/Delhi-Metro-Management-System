import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const data = [
    { name: 'S', weight: 45 },
    { name: 'M', weight: 75, active: true },
    { name: 'T', weight: 60 },
    { name: 'W', weight: 50 },
    { name: 'T', weight: 80 },
    { name: 'F', weight: 65 },
    { name: 'S', weight: 55 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 shadow-xl rounded-xl">
                <p className="font-semibold text-slate-800 dark:text-slate-200">{`${label}: ${payload[0].value} kg`}</p>
                <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">Waste Collected</p>
            </div>
        );
    }
    return null;
};

const DMRCCharts = () => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Waste Collection Trend</h3>
                    <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">Daily tonnage limit tracked</p>
                </div>
            </div>

            <div className="flex-1 w-full mt-2 relative min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        {/* Custom SVG Gradient for active bars */}
                        <defs>
                            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2B6CB0" stopOpacity={1} />
                                <stop offset="95%" stopColor="#1A365D" stopOpacity={1} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-700/50" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />

                        <Bar dataKey="weight" radius={[6, 6, 6, 6]} barSize={32}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.active ? 'url(#colorActive)' : 'currentColor'}
                                    className={entry.active ? '' : 'text-slate-200 dark:text-slate-800'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default DMRCCharts;

import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#1A365D', '#2B6CB0', '#f59e0b', '#ef4444', '#10b981'];

const Analytics = () => {
    const { selectedStationId, user } = useAuth();
    const stationId = selectedStationId ?? user?.station_id ?? null;
    const params = stationId ? `?station_id=${stationId}` : '';

    const [wasteData, setWasteData] = useState<any[]>([]);
    const [machineryData, setMachineryData] = useState<any[]>([]);
    const [manpowerData, setManpowerData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            api.get(`/waste${params}`).then(r => r.data).catch(() => []),
            api.get(`/machinery${params}`).then(r => r.data).catch(() => []),
            api.get(`/manpower${params}`).then(r => r.data).catch(() => []),
        ]).then(([waste, machinery, manpower]) => {
            // Waste trend (last 7 logs grouped by date)
            const grouped: Record<string, any> = {};
            (waste as any[]).slice(-7).forEach((log: any) => {
                const day = new Date(log.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                if (!grouped[day]) grouped[day] = { day, wet: 0, dry: 0, hazardous: 0 };
                grouped[day].wet += log.wet_waste ?? 0;
                grouped[day].dry += log.dry_waste ?? 0;
                grouped[day].hazardous += log.hazardous_waste ?? 0;
            });
            setWasteData(Object.values(grouped));

            // Machinery status distribution
            const statusCount: Record<string, number> = { free: 0, occupied: 0, maintenance: 0 };
            (machinery as any[]).forEach((m: any) => { statusCount[m.status] = (statusCount[m.status] || 0) + 1; });
            setMachineryData([
                { name: 'Free', value: statusCount.free },
                { name: 'Occupied', value: statusCount.occupied },
                { name: 'Maintenance', value: statusCount.maintenance },
            ].filter(d => d.value > 0));

            // Manpower presence per day (based on date field)
            const mpGrouped: Record<string, { day: string; present: number; absent: number }> = {};
            (manpower as any[]).forEach((m: any) => {
                const day = m.date ? new Date(m.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Today';
                if (!mpGrouped[day]) mpGrouped[day] = { day, present: 0, absent: 0 };
                if (m.status === 'present') mpGrouped[day].present++;
                else mpGrouped[day].absent++;
            });
            setManpowerData(Object.values(mpGrouped).slice(-7));
        }).finally(() => setIsLoading(false));
    }, [stationId]);

    const chartCard = (title: string, subtitle: string, children: React.ReactNode) => (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-0.5">{title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{subtitle}</p>
            {isLoading ? <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" /> : children}
        </div>
    );

    const emptyChart = (label: string) => (
        <div className="h-48 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <div className="text-center"><BarChart2 size={28} className="mx-auto mb-2 opacity-30" /><p className="text-sm">{label}</p></div>
        </div>
    );

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Analytics</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Operational insights across your station data</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Waste Trend */}
                {chartCard('Waste Collection Trend', 'Weekly breakdown (kg)', wasteData.length === 0 ? emptyChart('No waste data logged yet.') : (
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={wasteData} margin={{ left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                            <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: 12 }} />
                            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="wet" name="Wet" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="dry" name="Dry" stackId="a" fill="#1A365D" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="hazardous" name="Hazardous" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ))}

                {/* Machinery Status Pie */}
                {chartCard('Machinery Status', 'Current distribution across station', machineryData.length === 0 ? emptyChart('No machinery records found.') : (
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={machineryData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                                {machineryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                ))}

                {/* Manpower Trend */}
                {chartCard('Daily Manpower Presence', 'Present vs Absent over time', manpowerData.length === 0 ? emptyChart('No manpower logs found.') : (
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={manpowerData} margin={{ left: -10 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                            <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: 12 }} />
                            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                            <Line type="monotone" dataKey="present" name="Present" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="absent" name="Absent" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                ))}

                {/* Summary card */}
                <div className="bg-gradient-to-br from-dmrc-navy to-dmrc-cobalt rounded-2xl p-5 text-white shadow-sm flex flex-col justify-between">
                    <div>
                        <TrendingUp size={24} className="mb-3 opacity-80" />
                        <h3 className="font-bold text-lg mb-1">Quick Summary</h3>
                        <p className="text-blue-100/80 text-sm mb-4">All charts are derived from daily-based operational entries. Shift-wise breakdown is future scope.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Waste Logs', val: wasteData.length },
                            { label: 'Machines', val: machineryData.reduce((a, d) => a + d.value, 0) },
                            { label: 'Staff Logs', val: manpowerData.reduce((a, d) => a + d.present + d.absent, 0) },
                        ].map(({ label, val }) => (
                            <div key={label} className="bg-white/10 rounded-xl p-3 text-center">
                                <p className="text-2xl font-bold">{val}</p>
                                <p className="text-xs text-blue-100/70 mt-0.5">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;

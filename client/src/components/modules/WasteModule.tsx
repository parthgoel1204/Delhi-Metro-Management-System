import React, { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

interface WasteLog {
    id: number;
    date: string;
    wet_waste: number;
    dry_waste: number;
    hazardous_waste: number;
    treatment_method: string;
}

interface ChartData {
    day: string;
    wet: number;
    dry: number;
    hazardous: number;
}

const WasteModule = ({ stationId }: { stationId: number | null }) => {
    const { isAdmin } = useAuth();
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [form, setForm] = useState({
        wet_waste: '', dry_waste: '', hazardous_waste: '', treatment_method: 'Composting',
    });

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const loadData = () => {
        const params = stationId ? `?station_id=${stationId}` : '';
        setIsLoading(true);
        api.get(`/waste${params}`)
            .then(res => {
                const logs: WasteLog[] = res.data || [];
                // Group the last 7 entries by date for the chart
                const grouped: Record<string, ChartData> = {};
                logs.slice(-7).forEach(log => {
                    const day = new Date(log.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
                    if (!grouped[day]) grouped[day] = { day, wet: 0, dry: 0, hazardous: 0 };
                    grouped[day].wet += log.wet_waste;
                    grouped[day].dry += log.dry_waste;
                    grouped[day].hazardous += log.hazardous_waste;
                });
                setChartData(Object.values(grouped));
            })
            .catch(() => setChartData([]))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => { loadData(); }, [stationId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stationId) return showToast('❌ No station selected.');
        try {
            await api.post('/waste', {
                station_id: stationId,
                wet_waste: parseFloat(form.wet_waste) || 0,
                dry_waste: parseFloat(form.dry_waste) || 0,
                hazardous_waste: parseFloat(form.hazardous_waste) || 0,
                treatment_method: form.treatment_method,
                date: new Date().toISOString().split('T')[0],
            });
            setForm({ wet_waste: '', dry_waste: '', hazardous_waste: '', treatment_method: 'Composting' });
            setShowForm(false);
            showToast('✅ Waste log submitted successfully.');
            loadData();
        } catch {
            showToast('❌ Submission failed. Please try again.');
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 h-full flex flex-col shadow-sm relative">
            {toast && (
                <div className="absolute top-4 right-4 left-4 bg-slate-800 text-white text-xs px-4 py-2.5 rounded-xl z-10 shadow-lg">{toast}</div>
            )}

            <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                    <div className="bg-teal-50 dark:bg-teal-900/20 p-2 rounded-lg">
                        <Trash2 size={18} className="text-teal-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Waste Collection</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Weekly Trend (kg)</p>
                    </div>
                </div>
                {!isAdmin && (
                    <button onClick={() => setShowForm(p => !p)} className="flex items-center gap-1 text-xs bg-dmrc-navy text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-dmrc-cobalt transition-colors">
                        <Plus size={13} /> Log Today
                    </button>
                )}
            </div>

            {/* Staff Entry Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-5 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Log Today's Waste (kg)</p>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                        {(['wet_waste', 'dry_waste', 'hazardous_waste'] as const).map(key => (
                            <div key={key}>
                                <label className="text-xs text-slate-500 dark:text-slate-400 capitalize">{key.replace('_waste', '').replace('_', ' ')}</label>
                                <input
                                    type="number" min="0" step="0.1" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                    placeholder="0"
                                    className="w-full mt-0.5 text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt/30"
                                />
                            </div>
                        ))}
                    </div>
                    <select
                        value={form.treatment_method} onChange={e => setForm(f => ({ ...f, treatment_method: e.target.value }))}
                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt/30 mb-2"
                    >
                        <option>Composting</option>
                        <option>Incineration</option>
                        <option>Landfill</option>
                        <option>Recycling</option>
                    </select>
                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-dmrc-navy text-white text-xs font-semibold py-2 rounded-lg hover:bg-dmrc-cobalt transition-colors">Submit Log</button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Cancel</button>
                    </div>
                </form>
            )}

            {/* Chart or Empty State */}
            <div className="flex-1 min-h-[200px]">
                {isLoading ? (
                    <div className="h-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                ) : chartData.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                        <Trash2 size={36} className="mb-3 opacity-30" />
                        <p className="text-sm font-medium">No waste logs this week</p>
                        <p className="text-xs mt-1">
                            {isAdmin ? 'No data reported by staff yet.' : 'Click "Log Today" to submit your first entry.'}
                        </p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                            <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)', fontSize: 12 }}
                                formatter={(value, name) => [
                                    `${Number(value ?? 0)} kg`,
                                    typeof name === 'string' ? name[0].toUpperCase() + name.slice(1) : '',
                                ]}
                            />
                            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="wet" name="Wet" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="dry" name="Dry" stackId="a" fill="#1A365D" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="hazardous" name="Hazardous" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default WasteModule;

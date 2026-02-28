import React, { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

interface WasteRecord {
    id: number;
    date: string;
    waste_type: 'wet' | 'dry' | 'hazardous';
    quantity_kg: number;
    treatment_method: string;
    station_name?: string;
}

interface ChartData {
    day: string;
    wet: number;
    dry: number;
    hazardous: number;
}

const TREATMENT_METHODS = ['Composting', 'Incineration', 'Landfill', 'Recycling'];
const WASTE_TYPES = ['wet', 'dry', 'hazardous'] as const;

const WasteModule = ({ stationId }: { stationId: number | null }) => {
    const { isAdmin } = useAuth();
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [form, setForm] = useState({ waste_type: 'wet' as typeof WASTE_TYPES[number], quantity_kg: '', treatment_method: 'Composting' });

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const load = () => {
        const params = stationId ? `?station_id=${stationId}` : '';
        setIsLoading(true);
        api.get(`/waste${params}`)
            .then(res => {
                const records: WasteRecord[] = res.data || [];
                // Group last 7 entries by date for chart
                const grouped: Record<string, ChartData> = {};
                records.slice(-21).forEach(r => {
                    const day = new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
                    if (!grouped[day]) grouped[day] = { day, wet: 0, dry: 0, hazardous: 0 };
                    grouped[day][r.waste_type] += r.quantity_kg;
                });
                setChartData(Object.values(grouped).slice(-7));
            })
            .catch(() => setChartData([]))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => { load(); }, [stationId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stationId) return showToast('❌ No station selected.');
        const qty = parseFloat(form.quantity_kg);
        if (!qty || qty <= 0) return showToast('❌ Please enter a valid quantity.');
        try {
            await api.post('/waste', {
                station_id: stationId,
                date: new Date().toISOString().split('T')[0],
                waste_type: form.waste_type,
                quantity_kg: qty,
                treatment_method: form.treatment_method,
            });
            setForm({ waste_type: 'wet', quantity_kg: '', treatment_method: 'Composting' });
            setShowForm(false);
            showToast('✅ Waste entry submitted.');
            load();
        } catch (err: any) {
            showToast(`❌ ${err.response?.data?.error || 'Submission failed.'}`);
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
                    <button onClick={() => setShowForm(p => !p)}
                        className="flex items-center gap-1 text-xs bg-dmrc-navy text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-dmrc-cobalt transition-colors">
                        <Plus size={13} /> Log Today
                    </button>
                )}
            </div>

            {/* Staff Entry Form — one entry per waste type */}
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-5 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Log Today's Waste</p>
                    <div className="grid grid-cols-2 gap-2">
                        <select value={form.waste_type} onChange={e => setForm(f => ({ ...f, waste_type: e.target.value as any }))}
                            className="text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt/30">
                            <option value="wet">Wet Waste</option>
                            <option value="dry">Dry Waste</option>
                            <option value="hazardous">Hazardous</option>
                        </select>
                        <input type="number" min="0.1" step="0.1" required value={form.quantity_kg}
                            onChange={e => setForm(f => ({ ...f, quantity_kg: e.target.value }))}
                            placeholder="Quantity (kg)"
                            className="text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt/30" />
                    </div>
                    <select value={form.treatment_method} onChange={e => setForm(f => ({ ...f, treatment_method: e.target.value }))}
                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt/30">
                        {TREATMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                    </select>
                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-dmrc-navy text-white text-xs font-semibold py-2 rounded-lg hover:bg-dmrc-cobalt transition-colors">Submit Entry</button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 text-xs text-slate-500">Cancel</button>
                    </div>
                </form>
            )}

            {/* Chart or Empty State */}
            <div className="flex-1 min-h-[180px]">
                {isLoading ? (
                    <div className="h-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                ) : chartData.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                        <Trash2 size={36} className="mb-3 opacity-30" />
                        <p className="text-sm font-medium">No waste logs this week</p>
                        <p className="text-xs mt-1">{isAdmin ? 'No data reported yet.' : 'Click "Log Today" to add your first entry.'}</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                            <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)', fontSize: 12 }}
                                formatter={(value, name) => [`${Number(value ?? 0)} kg`, typeof name === 'string' ? name[0].toUpperCase() + name.slice(1) : '']}
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

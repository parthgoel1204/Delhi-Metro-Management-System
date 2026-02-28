import React, { useState, useEffect } from 'react';
import { Users, Plus } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

interface ManpowerRecord {
    id: number;
    station_id: number;
    date: string;
    shift: string;
    staff_count: number;
    remarks: string | null;
    station_name: string;
    created_by_name: string;
}

const SHIFTS = ['morning', 'afternoon', 'night'] as const;
type Shift = typeof SHIFTS[number];

const ManpowerModule = ({ stationId }: { stationId: number | null }) => {
    const { isAdmin } = useAuth();
    const [records, setRecords] = useState<ManpowerRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [form, setForm] = useState({ shift: 'morning' as Shift, staff_count: '', remarks: '' });

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const load = () => {
        setIsLoading(true);
        const params = stationId ? `?station_id=${stationId}` : '';
        api.get(`/manpower${params}`)
            .then(res => setRecords(res.data || []))
            .catch(() => setRecords([]))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => { load(); }, [stationId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stationId) return showToast('❌ No station selected.');
        if (!form.staff_count || parseInt(form.staff_count) < 0) return showToast('❌ Please enter a valid staff count.');
        try {
            await api.post('/manpower', {
                station_id: stationId,
                date: new Date().toISOString().split('T')[0],
                shift: form.shift,
                staff_count: parseInt(form.staff_count),
                remarks: form.remarks || null,
            });
            setForm({ shift: 'morning', staff_count: '', remarks: '' });
            setShowForm(false);
            showToast('✅ Manpower entry submitted.');
            load();
        } catch (err: any) {
            showToast(`❌ ${err.response?.data?.error || 'Submission failed.'}`);
        }
    };

    const totalStaff = records.reduce((sum, r) => sum + r.staff_count, 0);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 h-full flex flex-col shadow-sm relative">
            {toast && (
                <div className="absolute top-4 right-4 left-4 bg-slate-800 text-white text-xs px-4 py-2.5 rounded-xl z-10 shadow-lg">{toast}</div>
            )}

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                        <Users size={18} className="text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Manpower</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Daily Staff Count</p>
                    </div>
                </div>
                {!isAdmin && (
                    <button onClick={() => setShowForm(p => !p)}
                        className="flex items-center gap-1 text-xs bg-dmrc-navy text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-dmrc-cobalt transition-colors">
                        <Plus size={13} /> Log
                    </button>
                )}
            </div>

            {/* Total badge */}
            <div className="mb-3 flex gap-2 text-xs">
                <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full font-semibold">
                    {totalStaff} Total Staff Today
                </span>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full">
                    {records.length} Entries
                </span>
            </div>

            {/* Submit Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Log Shift Attendance</p>
                    <div className="grid grid-cols-2 gap-2">
                        <select value={form.shift} onChange={e => setForm(f => ({ ...f, shift: e.target.value as Shift }))}
                            className="text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt/30">
                            {SHIFTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                        <input type="number" min="0" required value={form.staff_count}
                            onChange={e => setForm(f => ({ ...f, staff_count: e.target.value }))}
                            placeholder="Staff count"
                            className="text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt/30" />
                    </div>
                    <input value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                        placeholder="Remarks (optional)"
                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt/30" />
                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-dmrc-navy text-white text-xs font-semibold py-2 rounded-lg hover:bg-dmrc-cobalt transition-colors">Submit</button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 text-xs text-slate-500">Cancel</button>
                    </div>
                </form>
            )}

            {/* Records list */}
            <div className="flex-1 overflow-y-auto space-y-2">
                {isLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />)
                ) : records.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 py-6">
                        <Users size={32} className="mb-2 opacity-30" />
                        <p className="text-sm">No entries today.</p>
                        {!isAdmin && <p className="text-xs mt-1">Click "Log" to add a shift entry.</p>}
                    </div>
                ) : (
                    records.map(r => (
                        <div key={r.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                            <div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{r.shift.charAt(0).toUpperCase() + r.shift.slice(1)} Shift</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{r.remarks || new Date(r.date).toLocaleDateString('en-IN')}</p>
                            </div>
                            <span className="text-sm font-bold text-dmrc-cobalt dark:text-blue-400">{r.staff_count} staff</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManpowerModule;

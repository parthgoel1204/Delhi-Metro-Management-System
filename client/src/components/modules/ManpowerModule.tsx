import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Plus, CheckCircle } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

interface ManpowerEntry {
    id: number;
    worker_name: string;
    role: string;
    status: 'present' | 'absent';
}

const ManpowerModule = ({ stationId }: { stationId: number | null }) => {
    const { isAdmin } = useAuth();
    const [entries, setEntries] = useState<ManpowerEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [form, setForm] = useState({ worker_name: '', role: '', status: 'present' as const });

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const params = stationId ? `?station_id=${stationId}` : '';
        api.get(`/manpower${params}`)
            .then(res => setEntries(res.data?.slice(0, 8) || []))
            .catch(() => setEntries([]))
            .finally(() => setIsLoading(false));
    }, [stationId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stationId) return;
        try {
            const res = await api.post('/manpower', { ...form, station_id: stationId, date: new Date().toISOString().split('T')[0] });
            setEntries(prev => [res.data, ...prev].slice(0, 8));
            setForm({ worker_name: '', role: '', status: 'present' });
            setShowForm(false);
            showToast('✅ Manpower record added successfully.');
        } catch {
            showToast('❌ Failed to add record. Please try again.');
        }
    };

    const presentCount = entries.filter(e => e.status === 'present').length;
    const absentCount = entries.filter(e => e.status === 'absent').length;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 h-full flex flex-col shadow-sm relative">
            {/* Toast */}
            {toast && (
                <div className="absolute top-4 right-4 left-4 bg-slate-800 text-white text-xs px-4 py-2.5 rounded-xl z-10 flex items-center gap-2 shadow-lg">
                    {toast}
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                        <Users size={18} className="text-dmrc-cobalt" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Manpower</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Today's Attendance</p>
                    </div>
                </div>
                {!isAdmin && (
                    <button onClick={() => setShowForm(prev => !prev)} className="flex items-center gap-1 text-xs bg-dmrc-navy text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-dmrc-cobalt transition-colors">
                        <Plus size={13} />
                        Log
                    </button>
                )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                        <UserCheck size={16} className="text-emerald-600" />
                        <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Present</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{presentCount}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                        <UserX size={16} className="text-red-600" />
                        <span className="text-xs text-red-700 dark:text-red-400 font-medium">Absent</span>
                    </div>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-400 mt-1">{absentCount}</p>
                </div>
            </div>

            {/* Entry Form (Staff only) */}
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <input
                        required value={form.worker_name} onChange={e => setForm(f => ({ ...f, worker_name: e.target.value }))}
                        placeholder="Worker Name"
                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt/30"
                    />
                    <input
                        required value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                        placeholder="Role (e.g., Sweeper, Supervisor)"
                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt/30"
                    />
                    <select
                        value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'present' | 'absent' }))}
                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt/30"
                    >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                    </select>
                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-dmrc-navy text-white text-xs font-semibold py-2 rounded-lg hover:bg-dmrc-cobalt transition-colors">Submit</button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Cancel</button>
                    </div>
                </form>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2">
                {isLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />)}
                    </div>
                ) : entries.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 dark:text-slate-500">
                        <Users size={28} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No attendance logs for today.</p>
                        {!isAdmin && <p className="text-xs mt-1">Click "Log" to add a record.</p>}
                    </div>
                ) : (
                    entries.map(entry => (
                        <div key={entry.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                            <div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{entry.worker_name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{entry.role}</p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${entry.status === 'present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                {entry.status}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManpowerModule;

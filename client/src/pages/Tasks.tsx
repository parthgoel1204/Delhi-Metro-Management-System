import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

// Staff view: individual worker name + present/absent
// Admin view: shift-based aggregate summary

interface ManpowerRecord {
    id: number;
    shift: string;
    staff_count: number;
    remarks: string | null;
    date: string;
    station_name?: string;
    created_by_name?: string;
}

// Parse worker name and status from remarks field (format: "WorkerName | Role | present/absent")
const parseWorkerRemarks = (remarks: string | null) => {
    if (!remarks || !remarks.includes(' | ')) return { name: '', role: '', status: '' };
    const parts = remarks.split(' | ');
    return { name: parts[0] || '', role: parts[1] || '', status: parts[2] || '' };
};

const Tasks = () => {
    const { isAdmin, user, selectedStationId } = useAuth();
    const [records, setRecords] = useState<ManpowerRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    // Staff form: individual worker
    const [form, setForm] = useState({ worker_name: '', role: '', status: 'present' as 'present' | 'absent' });

    // Admin form: aggregate shift count
    const [adminForm, setAdminForm] = useState({ shift: 'morning', staff_count: '', remarks: '' });

    const stationId = selectedStationId ?? user?.station_id ?? null;
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

    // Staff: submit individual worker as one record (shift=general, count=1 for present, 0 for absent)
    const handleStaffSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stationId) return showToast('❌ No station selected.');
        if (!form.worker_name.trim()) return showToast('❌ Enter worker name.');
        try {
            await api.post('/manpower', {
                station_id: stationId,
                date: new Date().toISOString().split('T')[0],
                shift: 'general',
                staff_count: form.status === 'present' ? 1 : 0,
                remarks: `${form.worker_name.trim()} | ${form.role.trim() || 'Staff'} | ${form.status}`,
            });
            setForm({ worker_name: '', role: '', status: 'present' });
            setShowForm(false);
            showToast('✅ Worker log submitted.');
            load();
        } catch (err: any) {
            showToast(`❌ ${err.response?.data?.error || 'Submission failed.'}`);
        }
    };

    // Admin: submit aggregate shift count
    const handleAdminSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const count = parseInt(adminForm.staff_count);
        if (!count || count < 0) return showToast('❌ Enter a valid staff count.');
        try {
            await api.post('/manpower', {
                station_id: stationId,
                date: new Date().toISOString().split('T')[0],
                shift: adminForm.shift,
                staff_count: count,
                remarks: adminForm.remarks || null,
            });
            setAdminForm({ shift: 'morning', staff_count: '', remarks: '' });
            setShowForm(false);
            showToast('✅ Shift log submitted.');
            load();
        } catch (err: any) {
            showToast(`❌ ${err.response?.data?.error || 'Submission failed.'}`);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this log entry?')) return;
        try {
            await api.delete(`/manpower/${id}`);
            showToast('✅ Log entry deleted.');
            load();
        } catch {
            showToast('❌ Failed to delete entry.');
        }
    };

    // Split records: individual (general shift) vs aggregate (morning/afternoon/night)
    const individualRecords = records.filter(r => r.shift === 'general');
    const shiftRecords = records.filter(r => r.shift !== 'general');
    const presentCount = individualRecords.filter(r => r.staff_count === 1).length;
    const absentCount = individualRecords.filter(r => r.staff_count === 0).length;
    const totalShiftStaff = shiftRecords.reduce((s, r) => s + r.staff_count, 0);

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Daily Work Logs</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {isAdmin ? 'All station manpower records' : 'Log attendance for your station today'}
                    </p>
                </div>
                <button onClick={() => setShowForm(p => !p)} className="flex items-center gap-2 bg-dmrc-navy hover:bg-dmrc-cobalt text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                    <Plus size={16} /> {isAdmin ? 'Add Shift Log' : 'Add Worker'}
                </button>
            </div>

            {toast && <div className="mb-4 bg-slate-800 text-white text-sm px-4 py-2.5 rounded-xl">{toast}</div>}

            {/* Stat summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {isAdmin ? (
                    <>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                            <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">Shift Records</p>
                            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{shiftRecords.length}</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">Total Shift Staff</p>
                            <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{totalShiftStaff}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Individual Logs</p>
                            <p className="text-3xl font-bold text-slate-700 dark:text-white">{individualRecords.length}</p>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                            <p className="text-xs text-amber-700 dark:text-amber-400 mb-1">Present (Individual)</p>
                            <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">{presentCount}</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">Present</p>
                            <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{presentCount}</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                            <p className="text-xs text-red-700 dark:text-red-400 mb-1">Absent</p>
                            <p className="text-3xl font-bold text-red-700 dark:text-red-400">{absentCount}</p>
                        </div>
                    </>
                )}
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6">
                    {!isAdmin ? (
                        // Staff form: individual worker
                        <form onSubmit={handleStaffSubmit} className="space-y-3">
                            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Log Worker Attendance</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input required value={form.worker_name} onChange={e => setForm(f => ({ ...f, worker_name: e.target.value }))}
                                    placeholder="Worker Full Name"
                                    className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt/30" />
                                <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                    placeholder="Role (e.g. Sweeper)"
                                    className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt/30" />
                            </div>
                            <div className="flex gap-3">
                                {(['present', 'absent'] as const).map(s => (
                                    <label key={s} className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-colors ${form.status === s ? (s === 'present' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20') : 'border-slate-200 dark:border-slate-700'}`}>
                                        <input type="radio" name="status" value={s} checked={form.status === s} onChange={() => setForm(f => ({ ...f, status: s }))} className="hidden" />
                                        {s === 'present' ? <CheckCircle size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-red-500" />}
                                        <span className="text-sm font-semibold capitalize text-slate-700 dark:text-slate-300">{s}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="bg-dmrc-navy text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-dmrc-cobalt transition-colors">Submit</button>
                                <button type="button" onClick={() => setShowForm(false)} className="text-sm text-slate-500 px-4 py-2">Cancel</button>
                            </div>
                        </form>
                    ) : (
                        // Admin form: shift aggregate
                        <form onSubmit={handleAdminSubmit} className="space-y-3">
                            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Log Shift Attendance</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <select value={adminForm.shift} onChange={e => setAdminForm(f => ({ ...f, shift: e.target.value }))}
                                    className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt/30">
                                    {['morning', 'afternoon', 'night'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                </select>
                                <input required type="number" min="0" value={adminForm.staff_count} onChange={e => setAdminForm(f => ({ ...f, staff_count: e.target.value }))}
                                    placeholder="Total staff count"
                                    className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt/30" />
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="bg-dmrc-navy text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-dmrc-cobalt transition-colors">Submit</button>
                                <button type="button" onClick={() => setShowForm(false)} className="text-sm text-slate-500 px-4 py-2">Cancel</button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Results Tables */}
            {isLoading ? (
                <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}</div>
            ) : (
                <>
                    {/* Individual attendance (staff-submitted) */}
                    {(isAdmin ? individualRecords.length > 0 : true) && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden mb-4">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                                <ClipboardList size={18} className="text-dmrc-cobalt" />
                                <span className="font-semibold text-slate-700 dark:text-white text-sm">Individual Attendance</span>
                            </div>
                            {individualRecords.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                                    <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No attendance logged today.</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800">
                                        <tr>
                                            {['Worker', 'Role', isAdmin ? 'Station' : null, 'Status', 'Date', isAdmin ? 'Actions' : null].filter(Boolean).map(h =>
                                                <th key={h!} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {individualRecords.map(r => {
                                            const { name, role, status } = parseWorkerRemarks(r.remarks);
                                            return (
                                                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-3 font-medium text-slate-800 dark:text-white">{name || '—'}</td>
                                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{role || '—'}</td>
                                                    {isAdmin && <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{r.station_name || '—'}</td>}
                                                    <td className="px-6 py-3">
                                                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${status === 'present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                            {status === 'present' ? <CheckCircle size={12} /> : <XCircle size={12} />} {status || '—'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 text-slate-400 dark:text-slate-500 text-xs">{new Date(r.date).toLocaleDateString('en-IN')}</td>
                                                    {isAdmin && (
                                                        <td className="px-6 py-3">
                                                            <button onClick={() => handleDelete(r.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete Log">
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* Shift aggregate (admin view) */}
                    {isAdmin && shiftRecords.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                                <ClipboardList size={18} className="text-amber-500" />
                                <span className="font-semibold text-slate-700 dark:text-white text-sm">Shift Summary</span>
                            </div>
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800">
                                    <tr>
                                        {['Date', 'Shift', 'Staff Count', 'Station', 'Remarks', 'Actions'].map(h =>
                                            <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {shiftRecords.map(r => (
                                        <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{new Date(r.date).toLocaleDateString('en-IN')}</td>
                                            <td className="px-6 py-3 font-medium text-slate-800 dark:text-white capitalize">{r.shift}</td>
                                            <td className="px-6 py-3">
                                                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{r.staff_count} staff</span>
                                            </td>
                                            <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{r.station_name || '—'}</td>
                                            <td className="px-6 py-3 text-slate-400 dark:text-slate-500 text-xs">{r.remarks || '—'}</td>
                                            <td className="px-6 py-3">
                                                <button onClick={() => handleDelete(r.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete Shift Log">
                                                    <Trash2 size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Tasks;

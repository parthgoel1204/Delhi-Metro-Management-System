import React, { useState, useEffect } from 'react';
import { Users, Plus, ShieldAlert, Trash2 } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

interface Station { id: number; name: string; line: string; }
interface TeamUser { id: number; username: string; full_name: string; role: string; station_id: number | null; station_name: string | null; created_at: string; }

const Team = () => {
    const { isAdmin } = useAuth();

    // Guard: Staff cannot access this page
    if (!isAdmin) {
        return (
            <div className="p-8 flex flex-col items-center justify-center h-full gap-4">
                <ShieldAlert size={48} className="text-red-400" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Access Denied</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Only administrators can view the Team page.</p>
            </div>
        );
    }

    const [users, setUsers] = useState<TeamUser[]>([]);
    const [stations, setStations] = useState<Station[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [form, setForm] = useState({ username: '', full_name: '', password: '', station_id: '', role: 'staff' });

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

    const load = () => {
        setIsLoading(true);
        Promise.all([
            api.get('/users').then(r => r.data).catch(() => []),
            api.get('/stations').then(r => r.data).catch(() => []),
        ]).then(([u, s]) => { setUsers(u); setStations(s); }).finally(() => setIsLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/users', { ...form, station_id: form.station_id ? parseInt(form.station_id) : null });
            setForm({ username: '', full_name: '', password: '', station_id: '', role: 'staff' });
            setShowForm(false);
            showToast('✅ Staff member added.');
            load();
        } catch (err: any) {
            showToast(`❌ ${err.response?.data?.error || 'Failed to add member.'}`);
        }
    };

    const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(f => ({ ...f, [key]: e.target.value }));

    const roleColor = (role: string) => role === 'admin'
        ? 'bg-dmrc-cobalt/10 text-dmrc-cobalt'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';

    const handleDelete = async (id: number, username: string) => {
        if (!window.confirm(`Are you sure you want to delete staff member "${username}"?`)) return;
        try {
            await api.delete(`/users/${id}`);
            showToast('✅ Staff member deleted.');
            load();
        } catch (err: any) {
            showToast(`❌ ${err.response?.data?.error || 'Failed to delete.'}`);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {toast && <div className="mb-4 bg-slate-800 text-white text-sm px-4 py-2.5 rounded-xl">{toast}</div>}

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Team Management</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage staff accounts across all stations</p>
                </div>
                <button onClick={() => setShowForm(p => !p)} className="flex items-center gap-2 bg-dmrc-navy hover:bg-dmrc-cobalt text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                    <Plus size={16} /> Add Staff
                </button>
            </div>

            {/* Add Staff Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6 space-y-3">
                    <h3 className="font-semibold text-slate-800 dark:text-white text-sm">New Staff Member</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[{ k: 'full_name', p: 'Full Name', t: 'text' }, { k: 'username', p: 'Username', t: 'text' }, { k: 'password', p: 'Password (min 6 chars)', t: 'password' }].map(({ k, p, t }) => (
                            <input key={k} required type={t} value={form[k as keyof typeof form]} onChange={set(k as keyof typeof form)} placeholder={p}
                                className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt/30" />
                        ))}
                        <select value={form.station_id} onChange={set('station_id')} required
                            className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt/30">
                            <option value="">Select Station...</option>
                            {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-2 mt-1">
                        <button type="submit" className="bg-dmrc-navy text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-dmrc-cobalt transition-colors">Add Member</button>
                        <button type="button" onClick={() => setShowForm(false)} className="text-sm text-slate-500 px-4 py-2">Cancel</button>
                    </div>
                </form>
            )}

            {/* Note about admin creation */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 mb-6 text-xs text-amber-700 dark:text-amber-400">
                <strong>Note:</strong> Admin accounts can only be created via database seeding or direct DB access. All accounts added here are Staff by default.
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <Users size={18} className="text-dmrc-cobalt" />
                    <span className="font-semibold text-slate-700 dark:text-white text-sm">{users.length} Members</span>
                </div>
                {isLoading ? (
                    <div className="p-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />)}</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>{['Full Name', 'Username', 'Role', 'Station', 'Joined', 'Actions'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-3 font-medium text-slate-800 dark:text-white">{u.full_name}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{u.username}</td>
                                    <td className="px-6 py-3">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${roleColor(u.role)}`}>{u.role.toUpperCase()}</span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{u.station_name || '—'}</td>
                                    <td className="px-6 py-3 text-slate-400 dark:text-slate-500 text-xs">{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                                    <td className="px-6 py-3">
                                        {u.role !== 'admin' && (
                                            <button onClick={() => handleDelete(u.id, u.username)} title="Delete Staff" className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Team;

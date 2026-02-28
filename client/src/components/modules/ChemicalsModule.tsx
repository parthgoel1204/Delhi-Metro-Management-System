import React, { useState, useEffect } from 'react';
import { FlaskConical, Plus } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

interface ChemicalEntry {
    id: number;
    chemical_name: string;
    quantity: number;
    unit: string;
    date: string;
}

const ChemicalsModule = ({ stationId }: { stationId: number | null }) => {
    const { isAdmin } = useAuth();
    const [entries, setEntries] = useState<ChemicalEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [form, setForm] = useState({ chemical_name: '', quantity: '', unit: 'L' });

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    useEffect(() => {
        const params = stationId ? `?station_id=${stationId}` : '';
        api.get(`/chemicals${params}`)
            .then(res => setEntries(res.data?.slice(0, 6) || []))
            .catch(() => setEntries([]))
            .finally(() => setIsLoading(false));
    }, [stationId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stationId) return showToast('❌ No station selected.');
        try {
            const res = await api.post('/chemicals', {
                ...form,
                quantity: parseFloat(form.quantity),
                station_id: stationId,
                date: new Date().toISOString().split('T')[0],
            });
            setEntries(prev => [res.data, ...prev].slice(0, 6));
            setForm({ chemical_name: '', quantity: '', unit: 'L' });
            setShowForm(false);
            showToast('✅ Chemical usage recorded.');
        } catch {
            showToast('❌ Failed to submit. Please try again.');
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 h-full flex flex-col shadow-sm relative">
            {toast && (
                <div className="absolute top-4 right-4 left-4 bg-slate-800 text-white text-xs px-4 py-2.5 rounded-xl z-10 shadow-lg">{toast}</div>
            )}

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg">
                        <FlaskConical size={18} className="text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Chemicals</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Usage Log</p>
                    </div>
                </div>
                {!isAdmin && (
                    <button onClick={() => setShowForm(p => !p)} className="flex items-center gap-1 text-xs bg-dmrc-navy text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-dmrc-cobalt transition-colors">
                        <Plus size={13} /> Log
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <input
                        required value={form.chemical_name} onChange={e => setForm(f => ({ ...f, chemical_name: e.target.value }))}
                        placeholder="Chemical Name (e.g., Floor Cleaner)"
                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt/30"
                    />
                    <div className="flex gap-2">
                        <input
                            required type="number" min="0" step="0.1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                            placeholder="Quantity"
                            className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt/30"
                        />
                        <select
                            value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                            className="text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-dmrc-cobalt/30"
                        >
                            <option value="L">L</option>
                            <option value="Kg">Kg</option>
                            <option value="ml">ml</option>
                            <option value="g">g</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-dmrc-navy text-white text-xs font-semibold py-2 rounded-lg hover:bg-dmrc-cobalt transition-colors">Submit</button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Cancel</button>
                    </div>
                </form>
            )}

            <div className="flex-1 overflow-y-auto space-y-2">
                {isLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />)
                ) : entries.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 dark:text-slate-500">
                        <FlaskConical size={28} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No chemical usage logs today.</p>
                        {!isAdmin && <p className="text-xs mt-1">Click "Log" to add an entry.</p>}
                    </div>
                ) : (
                    entries.map(entry => (
                        <div key={entry.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{entry.chemical_name}</p>
                            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full">
                                {entry.quantity} {entry.unit}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChemicalsModule;

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsInN0YXRpb25faWQiOm51bGwsImZ1bGxfbmFtZSI6IlN5c3RlbSBBZG1pbmlzdHJhdG9yIiwiaWF0IjoxNzcyMjY0ODA3LCJleHAiOjE3NzIzNTEyMDd9.ggEazNDRKWDKc3fqN_wr2EPBlhlVD4ZoflnFNLvW74k
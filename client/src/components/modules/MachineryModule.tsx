import React, { useState, useEffect } from 'react';
import { Wrench, Plus } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

interface Machine {
    id: number;
    name: string;
    type: string;
    status: 'free' | 'occupied' | 'maintenance';
}

const statusConfig: Record<Machine['status'], { label: string; cls: string }> = {
    free: { label: 'Free', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    occupied: { label: 'Occupied', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    maintenance: { label: 'Maintenance', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

const MachineryModule = ({ stationId }: { stationId: number | null }) => {
    const { isAdmin } = useAuth();
    const [machines, setMachines] = useState<Machine[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    useEffect(() => {
        const params = stationId ? `?station_id=${stationId}` : '';
        api.get(`/machinery${params}`)
            .then(res => setMachines(res.data?.slice(0, 8) || []))
            .catch(() => setMachines([]))
            .finally(() => setIsLoading(false));
    }, [stationId]);

    const updateStatus = async (machine: Machine, newStatus: Machine['status']) => {
        if (isAdmin) return; // Admins view only
        const prev = machines;
        setMachines(ms => ms.map(m => m.id === machine.id ? { ...m, status: newStatus } : m));
        try {
            await api.put(`/machinery/${machine.id}`, { status: newStatus });
            showToast(`✅ ${machine.name} marked as ${newStatus}.`);
        } catch {
            setMachines(prev);
            showToast('❌ Update failed. Please try again.');
        }
    };

    const freeCount = machines.filter(m => m.status === 'free').length;
    const occupiedCount = machines.filter(m => m.status === 'occupied').length;
    const maintenanceCount = machines.filter(m => m.status === 'maintenance').length;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 h-full flex flex-col shadow-sm relative">
            {toast && (
                <div className="absolute top-4 right-4 left-4 bg-slate-800 text-white text-xs px-4 py-2.5 rounded-xl z-10 shadow-lg">{toast}</div>
            )}

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                        <Wrench size={18} className="text-orange-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Machinery</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Live Status</p>
                    </div>
                </div>
            </div>

            {/* Summary Chips */}
            <div className="flex gap-2 mb-4 flex-wrap">
                <span className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full font-medium">{freeCount} Free</span>
                <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full font-medium">{occupiedCount} Occupied</span>
                <span className="text-xs bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-2.5 py-1 rounded-full font-medium">{maintenanceCount} Maintenance</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
                {isLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />)
                ) : machines.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 dark:text-slate-500">
                        <Wrench size={28} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No machinery records found.</p>
                    </div>
                ) : (
                    machines.map(machine => (
                        <div key={machine.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                            <div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{machine.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{machine.type}</p>
                            </div>
                            {isAdmin ? (
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[machine.status]?.cls}`}>
                                    {statusConfig[machine.status]?.label}
                                </span>
                            ) : (
                                <select
                                    value={machine.status}
                                    onChange={e => updateStatus(machine, e.target.value as Machine['status'])}
                                    className="text-xs px-2 py-1 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-dmrc-cobalt"
                                >
                                    <option value="free">Free</option>
                                    <option value="occupied">Occupied</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MachineryModule;

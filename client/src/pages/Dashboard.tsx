import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/widgets/StatCard';
import ProgressRing from '../components/widgets/ProgressRing';
import ManpowerModule from '../components/modules/ManpowerModule';
import ChemicalsModule from '../components/modules/ChemicalsModule';
import MachineryModule from '../components/modules/MachineryModule';
import WasteModule from '../components/modules/WasteModule';

interface DashboardStats {
    totalStations: number;
    activeStations: number;
    occupiedMachines: number;
    criticalAlerts: number;
    complianceStatus: 'compliant' | 'partial' | 'non-compliant' | null;
}

const ComplianceBadge = ({ status }: { status: DashboardStats['complianceStatus'] }) => {
    if (!status) return null;
    const config = {
        'compliant': { label: '✅ Compliant', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' },
        'partial': { label: '⚠️ Partial Compliance', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' },
        'non-compliant': { label: '❌ Non-Compliant', cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' },
    };
    const { label, cls } = config[status];
    return (
        <span className={`inline-flex items-center border text-xs font-semibold px-3 py-1 rounded-full ${cls}`}>
            {label}
        </span>
    );
};

const Dashboard = () => {
    const { user, selectedStationId, isAdmin } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalStations: 0,
        activeStations: 0,
        occupiedMachines: 0,
        criticalAlerts: 0,
        complianceStatus: null,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<{ code: number; msg: string } | null>(null);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = selectedStationId ? `?station_id=${selectedStationId}` : '';

            const [stationsRes, machineryRes] = await Promise.all([
                api.get(`/stations${params}`),
                api.get(`/machinery/summary${params}`).catch(() => ({ data: {} })),
            ]);

            const allStations: any[] = stationsRes.data || [];
            const machineryData = machineryRes.data || {};

            const occupiedMachines = machineryData.occupied ?? 0;
            const criticalAlerts = machineryData.under_maintenance ?? 0;

            // Derive a simple compliance status
            let complianceStatus: DashboardStats['complianceStatus'] = 'compliant';
            if (criticalAlerts > 2) complianceStatus = 'non-compliant';
            else if (criticalAlerts > 0) complianceStatus = 'partial';

            setStats({
                totalStations: allStations.length,
                activeStations: isAdmin ? allStations.length : (selectedStationId ? 1 : 0),
                occupiedMachines,
                criticalAlerts,
                complianceStatus,
            });
        } catch (err: any) {
            const code = err.response?.status || 500;
            if (code === 401) {
                setError({ code: 401, msg: 'Session expired. Please log in again.' });
            } else if (code === 403) {
                setError({ code: 403, msg: 'Access denied. You do not have permission to view this data.' });
            } else {
                setError({ code: 500, msg: 'Failed to load dashboard data. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    }, [selectedStationId, isAdmin]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const stationLabel = selectedStationId
        ? 'Selected Station'
        : isAdmin ? 'All Stations' : user?.station_name || 'Your Station';

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-full flex flex-col">

            {/* Page Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Dashboard</h1>
                    <div className="flex items-center gap-3">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Viewing: <span className="font-semibold text-slate-700 dark:text-slate-200">{stationLabel}</span>
                        </p>
                        <ComplianceBadge status={stats.complianceStatus} />
                    </div>
                </div>
                {/* Only admins see the add button at the top level */}
                {isAdmin && (
                    <div className="flex gap-3">
                        <button className="bg-dmrc-navy hover:bg-dmrc-cobalt text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold transition-colors shadow-sm text-sm">
                            <Plus size={16} />
                            Add Task
                        </button>
                        <button className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-xl font-semibold transition-colors shadow-sm text-sm">
                            Generate Report
                        </button>
                    </div>
                )}
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-xl mb-6 flex justify-between items-center">
                    <p className="text-sm font-medium">{error.msg}</p>
                    {error.code !== 403 && (
                        <button onClick={fetchStats} className="text-sm font-bold underline ml-4 shrink-0">Retry</button>
                    )}
                </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-6 flex-1">

                {/* Top Stats */}
                <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Stations" value={isLoading ? '…' : stats.totalStations} trend="0" isPositive={true} isActive={true} />
                    <StatCard title="Active Today" value={isLoading ? '…' : stats.activeStations} trend="0" isPositive={true} />
                    <StatCard title="Occupied Machines" value={isLoading ? '…' : stats.occupiedMachines} trend="0" isPositive={true} />
                    <StatCard title="Critical Alerts" value={isLoading ? '…' : stats.criticalAlerts} trend="0" isPositive={stats.criticalAlerts === 0} />
                </div>

                {/* Waste Chart + Progress Ring */}
                <div className="col-span-12 xl:col-span-8">
                    <WasteModule stationId={selectedStationId ?? user?.station_id ?? null} />
                </div>

                <div className="col-span-12 xl:col-span-4">
                    <ProgressRing
                        progress={stats.activeStations > 0 ? Math.round((stats.activeStations / Math.max(stats.totalStations, 1)) * 100) : 0}
                        title="Station Coverage"
                        subtitle="Reporting Today"
                        statusText={stats.complianceStatus === 'compliant' ? 'On Track' : 'Review Needed'}
                    />
                </div>

                {/* Data Entry Modules */}
                <div className="col-span-12 lg:col-span-4">
                    <ManpowerModule stationId={selectedStationId ?? user?.station_id ?? null} />
                </div>
                <div className="col-span-12 lg:col-span-4">
                    <ChemicalsModule stationId={selectedStationId ?? user?.station_id ?? null} />
                </div>
                <div className="col-span-12 lg:col-span-4">
                    <MachineryModule stationId={selectedStationId ?? user?.station_id ?? null} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

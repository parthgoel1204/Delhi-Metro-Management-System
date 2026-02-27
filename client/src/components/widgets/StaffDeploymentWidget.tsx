import React from 'react';

const StaffDeploymentWidget = () => {
    const staff = [
        {
            name: 'Ramesh Kumar',
            station: 'Rajiv Chowk',
            task: 'Deep Clean',
            status: 'InProgress'
        },
        {
            name: 'Sunil Singh',
            station: 'Kashmere Gate',
            task: 'Platform Scrub',
            status: 'Completed'
        },
        {
            name: 'Amit Sharma',
            station: 'HUDA City Centre',
            task: 'Waste Disposal',
            status: 'Pending'
        },
        {
            name: 'Deepak Verma',
            station: 'Chandni Chowk',
            task: 'Sanitization',
            status: 'InProgress'
        }
    ];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Live Staff Deployment</h3>
                <button className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    + Add Member
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {staff.map((member, i) => (
                    <div key={i} className="flex justify-between items-center group p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}&backgroundColor=e2e8f0`}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{member.name}</p>
                                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                                    <span>{member.task}</span>
                                    <span>•</span>
                                    <span className="font-medium">{member.station}</span>
                                </div>
                            </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded border
              ${member.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                : member.status === 'InProgress'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                            }
            `}>
                            {member.status === 'InProgress' ? 'In Progress' : member.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StaffDeploymentWidget;

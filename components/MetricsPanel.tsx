import React, { useMemo } from 'react';
import type { Job, User, JobStatus } from '../types';
import { ALL_STATUSES } from '../constants';
import { ChartBarIcon, ClockIcon, ClipboardCheckIcon } from './Icons';

interface MetricsPanelProps {
  jobs: Job[];
  users: User[];
}

const MetricCard: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-3">
            <Icon className="w-6 h-6 text-sky-600" />
            <span>{title}</span>
        </h3>
        <div className="mt-4">
            {children}
        </div>
    </div>
);

const formatDuration = (ms: number): string => {
    if (ms < 0) return "N/A";
    const totalSeconds = ms / 1000;
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0 && days === 0) result += `${minutes}m`;
    return result.trim() || 'Menos de 1m';
};


export const MetricsPanel: React.FC<MetricsPanelProps> = ({ jobs, users }) => {

    const metrics = useMemo(() => {
        // 1. Jobs by Status
        const jobsByStatus = ALL_STATUSES.map(status => ({
            status,
            count: jobs.filter(j => j.status === status).length,
        }));

        // 2. Jobs per Branch
        const branches = users.filter(u => u.role === 'branch');
        const jobsPerBranch = branches.map(branch => ({
            branchName: branch.branchName || 'N/A',
            count: jobs.filter(j => j.branch === branch.branchName && j.status !== 'Listo para Retirar').length,
        })).sort((a,b) => b.count - a.count);

        // 3. Average Lab Time
        const labTimes: number[] = [];
        jobs.forEach(job => {
            const history = job.history.map(h => ({...h, timestamp: new Date(h.timestamp)}));
            const labEntry = history.find(h => h.action === 'Estado cambiado a "En Laboratorio"');
            const labExit = history.find(h => h.action === 'Estado cambiado a "En camino a Sucursal"');
            if (labEntry && labExit) {
                const timeDiff = labExit.timestamp.getTime() - labEntry.timestamp.getTime();
                labTimes.push(timeDiff);
            }
        });
        const averageLabTime = labTimes.length > 0 ? labTimes.reduce((a, b) => a + b, 0) / labTimes.length : 0;


        return { jobsByStatus, jobsPerBranch, averageLabTime };
    }, [jobs, users]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title="Trabajos por Estado" icon={ClipboardCheckIcon}>
                <ul className="space-y-2">
                    {metrics.jobsByStatus.map(({ status, count }) => (
                        <li key={status} className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">{status}</span>
                            <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
                        </li>
                    ))}
                </ul>
            </MetricCard>

            <MetricCard title="Carga de Trabajo por Sucursal (Activos)" icon={ChartBarIcon}>
                {metrics.jobsPerBranch.length > 0 ? (
                    <ul className="space-y-2">
                        {metrics.jobsPerBranch.map(({ branchName, count }) => (
                            <li key={branchName} className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">{branchName}</span>
                                <span className="font-bold text-slate-800">{count}</span>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-slate-500 text-sm">No hay sucursales para mostrar.</p>
                }
            </MetricCard>

             <MetricCard title="Eficiencia del Laboratorio" icon={ClockIcon}>
                <div className="text-center">
                    <p className="text-sm text-slate-500">Tiempo Promedio de Proceso</p>
                    <p className="text-4xl font-bold text-sky-600 mt-2">
                        {formatDuration(metrics.averageLabTime)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                        (Desde 'En Laboratorio' hasta 'En camino a Sucursal')
                    </p>
                </div>
            </MetricCard>
        </div>
    );
};
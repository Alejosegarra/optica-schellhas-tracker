import React, { useState, useRef, useEffect } from 'react';
import type { Job, JobStatus, User, JobFlag } from '../types';
import { StatusBadge } from './StatusBadge';
import { WorkflowProgressBar } from './WorkflowProgressBar';
import { getNextAction, ALL_STATUSES } from '../constants';
import { ChevronDownIcon, CalendarIcon, LocationMarkerIcon, ArrowRightIcon, FlagIcon, FireIcon, ExclamationTriangleIcon, ArchiveBoxArrowDownIcon, ArrowUturnLeftIcon } from './Icons';

interface JobCardProps {
  job: Job;
  onRequestStatusUpdate: (jobId: string, newStatus: JobStatus) => void;
  updateJobFlag: (jobId: string, newFlag: JobFlag) => void;
  user: User;
  isSelected: boolean;
  onToggleSelection: (jobId: string) => void;
  onArchiveJob: (jobId: string) => void;
  onRestoreJob: (jobId: string) => void;
  isArchivedView: boolean;
}

const FlagIndicator: React.FC<{ flag: JobFlag }> = ({ flag }) => {
    if (flag === 'none') return null;
    
    const config = {
        urgent: { icon: FireIcon, color: 'bg-red-500', text: 'URG.' },
        delayed: { icon: ExclamationTriangleIcon, color: 'bg-amber-500', text: 'DEM.' },
    };

    const current = config[flag];
    if (!current) return null;
    const Icon = current.icon;

    return (
        <div className={`absolute top-0 right-4 -mt-3 px-2 py-1 text-xs font-bold text-white rounded-full shadow-lg ${current.color} flex items-center gap-1 z-10`}>
            <Icon className="w-4 h-4" />
            <span>{current.text}</span>
        </div>
    );
};


export const JobCard: React.FC<JobCardProps> = ({ 
    job, 
    onRequestStatusUpdate, 
    updateJobFlag, 
    user, 
    isSelected, 
    onToggleSelection,
    onArchiveJob,
    onRestoreJob,
    isArchivedView
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFlagMenuOpen, setIsFlagMenuOpen] = useState(false);
  const flagMenuRef = useRef<HTMLDivElement>(null);

  const nextAction = getNextAction(job.status, user.role);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (flagMenuRef.current && !flagMenuRef.current.contains(event.target as Node)) {
        setIsFlagMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFlagChange = (flag: JobFlag) => {
    updateJobFlag(job.id, flag);
    setIsFlagMenuOpen(false);
  }
  
  const canSetUrgent = user.role === 'branch' || user.role === 'admin';
  const canSetDelayed = user.role === 'lab' || user.role === 'admin';
  const canRemoveFlag = user.role === 'admin' || (user.role === 'branch' && job.flag === 'urgent') || (user.role === 'lab' && job.flag === 'delayed');

  return (
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col relative ${job.flag !== 'none' ? 'ring-2 ring-amber-400' : ''} ${isSelected ? 'ring-2 ring-sky-500' : ''}`}>
      <FlagIndicator flag={job.flag} />

      {/* Checkbox for bulk actions */}
      <div className="absolute top-2 left-2 z-10">
          <input 
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(job.id)}
              className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              aria-label={`Seleccionar trabajo ${job.orderNumber}`}
          />
      </div>

      <div className="p-5 pl-10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-sky-600">{job.id}</p>
            <p className="text-lg font-bold text-slate-800">Trabajo: {job.orderNumber}</p>
          </div>
          <StatusBadge status={job.status} />
        </div>
         <div className="flex items-center mt-3 text-sm text-slate-500">
             <CalendarIcon className="w-4 h-4 mr-1.5 text-slate-400" />
             <span>{new Date(job.creationDate).toLocaleDateString('es-AR')}</span>
         </div>
        {(user.role === 'lab' || user.role === 'admin') && (
            <div className="flex items-center mt-2 text-sm text-slate-500">
                <LocationMarkerIcon className="w-4 h-4 mr-1.5 text-slate-400" />
                <span>De: {job.branch}</span>
            </div>
        )}
      </div>
      
      {isExpanded && (
        <div className="p-5 border-t border-slate-100 bg-slate-50">
           <div className="mb-4">
              <h4 className="font-semibold text-sm mb-3 text-slate-600">Progreso del Trabajo</h4>
              <WorkflowProgressBar status={job.status} />
           </div>
           <h4 className="font-semibold text-sm mb-2 text-slate-600">Línea de Tiempo de Actividad</h4>
            <ul className="space-y-2.5">
              {job.history.map(h => ({...h, timestamp: new Date(h.timestamp)})).slice().reverse().map((h, index) => (
                <li key={index} className="flex items-start text-xs text-slate-600">
                  <div className={`w-2 h-2 rounded-full mr-3 mt-1.5 flex-shrink-0 ${index === 0 ? 'bg-sky-500 ring-2 ring-sky-200' : 'bg-slate-300'}`}></div>
                  <div>
                    <p className="font-medium">
                        <span className="font-bold text-slate-800">{h.user}</span> {h.action.replace('Estado cambiado a', 'cambió el estado a').replace('Alerta cambiada a', 'cambió la alerta a')}
                    </p>
                    <p className="text-slate-400">{h.timestamp.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}</p>
                  </div>
                </li>
              ))}
            </ul>

          {job.notes && job.notes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
                <h4 className="font-semibold text-sm mb-2 text-slate-600">Notas</h4>
                <ul className="space-y-2">
                    {job.notes.map((note, index) => ({...note, timestamp: new Date(note.timestamp)})).slice().reverse().map((note, index) => (
                        <li key={index} className="text-xs p-2 bg-sky-50/70 rounded-md border border-sky-100">
                            <p className="text-slate-700 whitespace-pre-wrap">{note.text}</p>
                            <p className="text-slate-500 text-right mt-1 font-medium">
                                - {note.author} ({note.timestamp.toLocaleDateString('es-AR')})
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        )}
        </div>
      )}

      <div className="p-3 mt-auto bg-slate-50 rounded-b-xl border-t border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
            {user.role === 'admin' && job.status !== 'Listo para Retirar' && !isArchivedView && (
                <select 
                    onChange={(e) => onRequestStatusUpdate(job.id, e.target.value as JobStatus)}
                    value={job.status}
                    aria-label="Actualizar estado del trabajo (Admin)"
                    className="text-xs bg-white border border-slate-300 rounded-md pl-3 pr-8 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500 transition-colors"
                >
                    {ALL_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            )}
            {nextAction && user.role !== 'admin' && !isArchivedView && (
              <button
                onClick={() => onRequestStatusUpdate(job.id, nextAction.nextStatus)}
                className="flex items-center gap-1.5 text-xs bg-sky-600 text-white rounded-md px-3 py-1.5 font-semibold hover:bg-sky-700 transition-colors"
              >
                <span>{nextAction.label}</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            )}
            {job.status === 'Listo para Retirar' && !isArchivedView && (
                <button
                    onClick={() => onArchiveJob(job.id)}
                    className="flex items-center gap-1.5 text-xs bg-slate-500 text-white rounded-md px-3 py-1.5 font-semibold hover:bg-slate-600 transition-colors"
                >
                    <ArchiveBoxArrowDownIcon className="w-4 h-4" />
                    <span>Archivar</span>
                </button>
            )}
            {isArchivedView && (
                 <button
                    onClick={() => onRestoreJob(job.id)}
                    className="flex items-center gap-1.5 text-xs bg-green-600 text-white rounded-md px-3 py-1.5 font-semibold hover:bg-green-700 transition-colors"
                >
                    <ArrowUturnLeftIcon className="w-4 h-4" />
                    <span>Restaurar</span>
                </button>
            )}
        </div>
        <div className="flex items-center gap-1">
             <div className="relative" ref={flagMenuRef}>
                <button
                    onClick={() => setIsFlagMenuOpen(prev => !prev)}
                    className="p-2 text-slate-500 hover:bg-slate-200 rounded-md transition-colors"
                    aria-label="Cambiar alerta del trabajo"
                >
                    <FlagIcon className="w-5 h-5" />
                </button>

                {isFlagMenuOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 z-20">
                       <ul className="text-sm text-slate-700 p-1">
                           {canSetUrgent && <li className="px-3 py-1.5 hover:bg-slate-100 rounded-md cursor-pointer" onClick={() => handleFlagChange('urgent')}>Marcar Urgente</li>}
                           {canSetDelayed && <li className="px-3 py-1.5 hover:bg-slate-100 rounded-md cursor-pointer" onClick={() => handleFlagChange('delayed')}>Marcar Demorado</li>}
                           {canRemoveFlag && job.flag !== 'none' && <li className="px-3 py-1.5 hover:bg-slate-100 rounded-md cursor-pointer" onClick={() => handleFlagChange('none')}>Quitar Alerta</li>}
                           {job.flag === 'none' && !canSetDelayed && !canSetUrgent && <li className="px-3 py-1.5 text-slate-400">Sin acciones</li>}
                       </ul>
                    </div>
                )}
            </div>

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-slate-500 hover:bg-slate-200 rounded-md transition-colors"
                aria-expanded={isExpanded}
                aria-label={isExpanded ? 'Contraer detalles del trabajo' : 'Expandir detalles del trabajo'}
            >
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
        </div>
      </div>
    </div>
  );
};

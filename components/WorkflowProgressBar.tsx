
import React from 'react';
import type { JobStatus } from '../types.ts';
import { CheckIcon } from './Icons.tsx';

interface WorkflowProgressBarProps {
  status: JobStatus;
}

const STAGES = ['Sucursal', 'Laboratorio', 'Sucursal'];

const statusToStageIndex: Record<JobStatus, number> = {
  'En Sucursal': 0,
  'En camino al Laboratorio': 0,
  'En Laboratorio': 1,
  'En camino a Sucursal': 2,
  'Listo para Retirar': 2,
};

export const WorkflowProgressBar: React.FC<WorkflowProgressBarProps> = ({ status }) => {
  const currentStageIndex = statusToStageIndex[status];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {STAGES.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isActive = index === currentStageIndex;

          let nodeClasses = 'bg-slate-300';
          if (isActive) nodeClasses = 'bg-sky-500 ring-4 ring-sky-200';
          if (isCompleted) nodeClasses = 'bg-sky-600';

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 ${nodeClasses}`}>
                  {isCompleted && <CheckIcon className="w-4 h-4 text-white" />}
                </div>
                <p className={`mt-2 text-xs font-semibold ${isActive ? 'text-sky-600' : 'text-slate-500'}`}>
                    {stage}
                </p>
              </div>
              {index < STAGES.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded ${isCompleted ? 'bg-sky-600' : 'bg-slate-300'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
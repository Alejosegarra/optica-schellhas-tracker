
import React from 'react';
import type { JobStatus } from '../types.ts';

interface StatusBadgeProps {
  status: JobStatus;
}

const statusColors: Record<JobStatus, string> = {
  'En Sucursal': 'bg-gray-100 text-gray-800',
  'En camino al Laboratorio': 'bg-amber-100 text-amber-800',
  'En Laboratorio': 'bg-blue-100 text-blue-800',
  'En camino a Sucursal': 'bg-amber-100 text-amber-800',
  'Listo para Retirar': 'bg-teal-100 text-teal-800',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold leading-5 rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}
    >
      {status}
    </span>
  );
};
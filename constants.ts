import type { Job, JobStatus, User, UserRole, Action, JobFlag, ActivityLog } from './types';

export const USERS: User[] = [
  { id: 'admin', name: 'Administrador', role: 'admin', password: '123' },
  { id: 'lab', name: 'Laboratorio', role: 'lab', password: '123' },
  { id: 'casacentral', name: 'Casa Central', role: 'branch', branchName: 'Casa Central', password: '123' },
  { id: 'paraguay', name: 'Paraguay', role: 'branch', branchName: 'Paraguay', password: '123' },
  { id: 'espana', name: 'Espana', role: 'branch', branchName: 'Espana', password: '123' },
  { id: 'libertad', name: 'Libertad', role: 'branch', branchName: 'Libertad', password: '123' },
  { id: 'balcarce', name: 'Balcarce', role: 'branch', branchName: 'Balcarce', password: '123' },
  { id: 'pasodelbosque', name: 'Paso del Bosque', role: 'branch', branchName: 'Paso del Bosque', password: '123' },
  { id: 'qvision', name: 'Qvision', role: 'branch', branchName: 'Qvision', password: '123' },
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'OS-17001',
    orderNumber: 'A-101',
    branch: 'Casa Central',
    creationDate: new Date('2024-07-10T09:00:00Z'),
    status: 'En Laboratorio',
    history: [
      { action: 'Trabajo Creado', user: 'Casa Central', timestamp: new Date('2024-07-10T09:00:00Z') },
      { action: 'Nota añadida', user: 'Casa Central', timestamp: new Date('2024-07-10T09:01:00Z') },
      { action: 'Alerta cambiada a "urgent"', user: 'Casa Central', timestamp: new Date('2024-07-10T09:01:15Z') },
      { action: 'Estado cambiado a "En camino al Laboratorio"', user: 'Casa Central', timestamp: new Date('2024-07-10T17:00:00Z') },
      { action: 'Estado cambiado a "En Laboratorio"', user: 'Laboratorio', timestamp: new Date('2024-07-11T08:30:00Z') },
    ],
    flag: 'urgent',
    notes: [
      { text: 'Cliente espera con urgencia para un viaje.', author: 'Casa Central', timestamp: new Date('2024-07-10T09:01:00Z') }
    ],
    isArchived: false,
  },
  {
    id: 'OS-17002',
    orderNumber: 'A-102',
    branch: 'Paraguay',
    creationDate: new Date('2024-07-09T14:20:00Z'),
    status: 'Listo para Retirar',
    history: [
      { action: 'Trabajo Creado', user: 'Paraguay', timestamp: new Date('2024-07-09T14:20:00Z') },
      { action: 'Estado cambiado a "En camino al Laboratorio"', user: 'Paraguay', timestamp: new Date('2024-07-09T17:00:00Z') },
      { action: 'Estado cambiado a "En Laboratorio"', user: 'Laboratorio', timestamp: new Date('2024-07-10T09:15:00Z') },
      { action: 'Estado cambiado a "En camino a Sucursal"', user: 'Laboratorio', timestamp: new Date('2024-07-10T18:30:00Z') },
      { action: 'Estado cambiado a "Listo para Retirar"', user: 'Paraguay', timestamp: new Date('2024-07-11T10:00:00Z') },
    ],
    flag: 'none',
    notes: [],
    isArchived: false,
  },
  {
    id: 'OS-17003',
    orderNumber: 'B-201',
    branch: 'Espana',
    creationDate: new Date('2024-07-10T11:30:00Z'),
    status: 'Listo para Retirar',
     history: [
      { action: 'Trabajo Creado', user: 'Espana', timestamp: new Date('2024-07-08T11:30:00Z') },
      { action: 'Estado cambiado a "En camino al Laboratorio"', user: 'Espana', timestamp: new Date('2024-07-08T18:00:00Z') },
      { action: 'Estado cambiado a "En Laboratorio"', user: 'Laboratorio', timestamp: new Date('2024--07-09T09:00:00Z') },
      { action: 'Nota añadida', user: 'Laboratorio', timestamp: new Date('2024-07-09T10:00:00Z') },
      { action: 'Alerta cambiada a "delayed"', user: 'Laboratorio', timestamp: new Date('2024-07-09T10:00:10Z') },
      { action: 'Estado cambiado a "En camino a Sucursal"', user: 'Laboratorio', timestamp: new Date('2024-07-09T18:30:00Z') },
      { action: 'Estado cambiado a "Listo para Retirar"', user: 'Espana', timestamp: new Date('2024-07-10T11:00:00Z') },
    ],
    flag: 'delayed',
    notes: [
      { text: 'Falta un tornillo específico, pedido a proveedor.', author: 'Laboratorio', timestamp: new Date('2024-07-09T10:00:00Z') }
    ],
    isArchived: false,
  },
  {
    id: 'OS-17004',
    orderNumber: 'C-301',
    branch: 'Libertad',
    creationDate: new Date('2024-07-11T12:00:00Z'),
    status: 'En Sucursal',
    history: [{ action: 'Trabajo Creado', user: 'Libertad', timestamp: new Date('2024-07-11T12:00:00Z') }],
    flag: 'none',
    notes: [],
    isArchived: false,
  },
];

export const ALL_STATUSES: JobStatus[] = [
  'En Sucursal',
  'En camino al Laboratorio',
  'En Laboratorio',
  'En camino a Sucursal',
  'Listo para Retirar',
];

export const ALL_FLAGS: JobFlag[] = ['urgent', 'delayed', 'none'];

const branchActions: Partial<Record<JobStatus, Action>> = {
  'En Sucursal': { label: 'Enviar al Laboratorio', nextStatus: 'En camino al Laboratorio' },
  'En camino a Sucursal': { label: 'Recibido en Sucursal', nextStatus: 'Listo para Retirar' },
};

const labActions: Partial<Record<JobStatus, Action>> = {
  'En camino al Laboratorio': { label: 'Recibir en Laboratorio', nextStatus: 'En Laboratorio' },
  'En Laboratorio': { label: 'Enviar a Sucursal', nextStatus: 'En camino a Sucursal' },
};


export const getNextAction = (currentStatus: JobStatus, role: UserRole): Action | null => {
  if (role === 'admin' || currentStatus === 'Listo para Retirar') {
      return null;
  }
  
  if (role === 'branch') {
      return branchActions[currentStatus] || null;
  }

  if (role === 'lab') {
      return labActions[currentStatus] || null;
  }

  return null;
};
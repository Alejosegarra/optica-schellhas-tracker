export type JobStatus = 
  | 'En Sucursal'
  | 'En camino al Laboratorio'
  | 'En Laboratorio'
  | 'En camino a Sucursal'
  | 'Listo para Retirar';

export interface ActivityLog {
  action: string;
  user: string;
  timestamp: Date;
}

export type JobFlag = 'urgent' | 'delayed' | 'none';

export interface Note {
  text: string;
  author: string; // Will store user's name
  timestamp: Date;
}

export interface Job {
  id: string;
  orderNumber: string;
  branch: string;
  creationDate: Date;
  status: JobStatus;
  history: ActivityLog[];
  flag: JobFlag;
  notes: Note[];
  isArchived?: boolean;
}

export type UserRole = 'branch' | 'lab' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  password?: string;
  branchName?: string;
}

export interface Branch {
  id: string;
  name: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface Action {
    label: string;
    nextStatus: JobStatus;
}

export interface ConfirmationState {
  title: string;
  message: string;
  onConfirm: () => void;
}
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export enum Role {
  Admin = 'ADMIN',
  Branch = 'SUCURSAL',
  Lab = 'LABORATORIO',
}

export enum JobStatus {
  PendingInBranch = 'PENDIENTE EN SUCURSAL',
  SentToLab = 'ENVIADO A LABORATORIO',
  ReceivedByLab = 'RECIBIDO EN LABORATORIO',
  Completed = 'TERMINADO',
  SentToBranch = 'ENVIADO A SUCURSAL',
}

export enum JobPriority {
    Normal = 'NORMAL',
    Urgente = 'URGENTE',
    Repeticion = 'REPETICION',
}

export interface JobHistoryEntry {
    timestamp: string;
    status: JobStatus | string;
    updatedBy: string;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: Role;
}

export interface Job {
  id: string; // This is the job number
  description: string;
  status: JobStatus;
  branch_id: string;
  branch_name: string;
  priority: JobPriority;
  priority_message: string;
  created_at: string;
  updated_at: string;
  history: JobHistoryEntry[];
}

export interface Announcement {
    id: string;
    message: string;
    created_at: string;
}


export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: {
            username: string;
            password?: string;
            role: Role;
        };
        Update: {
            username?: string;
            password?: string;
            role?: Role;
        };
      };
      jobs: {
        Row: Job;
        Insert: {
            id: string;
            description: string;
            status: JobStatus;
            branch_id: string;
            branch_name: string;
            priority: JobPriority;
            priority_message: string;
            history: JobHistoryEntry[];
            created_at?: string;
            updated_at?: string;
        };
        Update: {
            description?: string;
            status?: JobStatus;
            priority?: JobPriority;
            priority_message?: string;
            updated_at?: string;
            history?: JobHistoryEntry[];
        };
      };
      announcements: {
        Row: Announcement;
        Insert: {
            message: string;
        };
        Update: {
            message?: string;
        };
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      [_ in never]: never
    };
    Enums: {
      [_ in never]: never
    };
    CompositeTypes: {
      [_ in never]: never
    };
  }
}

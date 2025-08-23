export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | any[]

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

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          password?: string;
          role: Role;
        };
        Insert: {
            id?: string;
            username: string;
            password?: string;
            role: Role;
        };
        Update: {
            id?: string;
            username?: string;
            password?: string;
            role?: Role;
        };
        Relationships: []
      };
      jobs: {
        Row: {
          id: string; // This is the job number
          description: string;
          status: JobStatus;
          branch_id: string;
          branch_name: string;
          priority: JobPriority;
          priority_message: string;
          created_at: string;
          updated_at: string;
          history: Json;
        };
        Insert: {
            id: string;
            description: string;
            status: JobStatus;
            branch_id: string;
            branch_name: string;
            priority: JobPriority;
            priority_message: string;
            history: Json;
            created_at?: string;
            updated_at?: string;
        };
        Update: {
            id?: string;
            description?: string;
            status?: JobStatus;
            priority?: JobPriority;
            priority_message?: string;
            updated_at?: string;
            history?: Json;
        };
        Relationships: []
      };
      announcements: {
        Row: {
            id: string;
            message: string;
            created_at: string;
        };
        Insert: {
            id?: string;
            message: string;
            created_at?: string;
        };
        Update: {
            id?: string;
            message?: string;
            created_at?: string;
        };
        Relationships: []
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

export type User = Database['public']['Tables']['users']['Row'];
export type Job = Database['public']['Tables']['jobs']['Row'];
export type Announcement = Database['public']['Tables']['announcements']['Row'];
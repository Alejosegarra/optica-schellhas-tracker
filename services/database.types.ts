export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      jobs: {
        Row: {
          branch: string
          creationDate: string
          flag: string
          history: Json
          id: string
          isArchived: boolean
          notes: Json
          orderNumber: string
          status: string
        }
        Insert: {
          branch: string
          creationDate?: string
          flag: string
          history: Json
          id?: string
          isArchived?: boolean
          notes: Json
          orderNumber: string
          status: string
        }
        Update: {
          branch?: string
          creationDate?: string
          flag?: string
          history?: Json
          id?: string
          isArchived?: boolean
          notes?: Json
          orderNumber?: string
          status?: string
        }
      }
      users: {
        Row: {
          branchName?: string | null
          id: string
          name: string
          password?: string | null
          role: string
        }
        Insert: {
          branchName?: string | null
          id: string
          name: string
          password?: string | null
          role: string
        }
        Update: {
          branchName?: string | null
          id?: string
          name?: string
          password?: string | null
          role?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

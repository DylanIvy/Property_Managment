// Hand-written to match supabase/migrations/0001_init_schema.sql.
// Once the Supabase project is linked, regenerate with:
//   npx supabase gen types typescript --linked > src/types/database.types.ts

export type UserRole = "owner" | "staff";
export type TaskStatus = "open" | "done";
export type RecurrenceInterval = "daily" | "weekly" | "biweekly" | "monthly";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          phone: string | null;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          role: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          address?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      property_staff: {
        Row: {
          id: string;
          property_id: string;
          staff_id: string;
          service_type: string | null;
          notes: string | null;
          staff_nickname: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          staff_id: string;
          service_type?: string | null;
          notes?: string | null;
          staff_nickname?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          staff_id?: string;
          service_type?: string | null;
          notes?: string | null;
          staff_nickname?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_staff_property_id_fkey";
            columns: ["property_id"];
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "property_staff_staff_id_fkey";
            columns: ["staff_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          id: string;
          property_id: string;
          title: string;
          description: string | null;
          assigned_staff_id: string | null;
          status: TaskStatus;
          recurring: boolean;
          recurrence_interval: RecurrenceInterval | null;
          due_date: string | null;
          photo_proof_url: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          title: string;
          description?: string | null;
          assigned_staff_id?: string | null;
          status?: TaskStatus;
          recurring?: boolean;
          recurrence_interval?: RecurrenceInterval | null;
          due_date?: string | null;
          photo_proof_url?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          title?: string;
          description?: string | null;
          assigned_staff_id?: string | null;
          status?: TaskStatus;
          recurring?: boolean;
          recurrence_interval?: RecurrenceInterval | null;
          due_date?: string | null;
          photo_proof_url?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_staff_id_fkey";
            columns: ["assigned_staff_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_property_id_fkey";
            columns: ["property_id"];
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          property_id: string;
          sender_id: string;
          recipient_id: string | null;
          content: string | null;
          attachment_url: string | null;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          property_id: string;
          sender_id: string;
          recipient_id?: string | null;
          content?: string | null;
          attachment_url?: string | null;
          created_at?: string;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          property_id?: string;
          sender_id?: string;
          recipient_id?: string | null;
          content?: string | null;
          attachment_url?: string | null;
          created_at?: string;
          read_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

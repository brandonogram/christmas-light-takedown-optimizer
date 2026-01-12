export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          service_regions: string[] | null
          storage_addresses: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          service_regions?: string[] | null
          storage_addresses?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          service_regions?: string[] | null
          storage_addresses?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      completion_reports: {
        Row: {
          created_at: string | null
          id: string
          job_id: string | null
          pdf_url: string | null
          sent_at: string | null
          sent_to_customer: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          sent_to_customer?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          sent_to_customer?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "completion_reports_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      crews: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          member_names: Json | null
          name: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          member_names?: Json | null
          name: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          member_names?: Json | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_videos: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          provider_video_id: string | null
          status: string | null
          thumbnail_url: string | null
          updated_at: string | null
          video_type: string
          video_url: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          provider_video_id?: string | null
          status?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          video_type: string
          video_url?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          provider_video_id?: string | null
          status?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          video_type?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_videos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      job_inventory: {
        Row: {
          checked_off: boolean | null
          condition: string | null
          created_at: string | null
          description: string | null
          id: string
          item_type: string
          job_id: string | null
          qr_code: string | null
          quantity: number | null
          storage_bin: string | null
          storage_location: string | null
          updated_at: string | null
        }
        Insert: {
          checked_off?: boolean | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          item_type: string
          job_id?: string | null
          qr_code?: string | null
          quantity?: number | null
          storage_bin?: string | null
          storage_location?: string | null
          updated_at?: string | null
        }
        Update: {
          checked_off?: boolean | null
          condition?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          item_type?: string
          job_id?: string | null
          qr_code?: string | null
          quantity?: number | null
          storage_bin?: string | null
          storage_location?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_inventory_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_photos: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          job_id: string | null
          photo_type: string
          photo_url: string
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          photo_type: string
          photo_url: string
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          job_id?: string | null
          photo_type?: string
          photo_url?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      jobber_connections: {
        Row: {
          access_token: string
          company_id: string | null
          created_at: string | null
          expires_at: string
          id: string
          refresh_token: string
          scope: string | null
          updated_at: string | null
        }
        Insert: {
          access_token: string
          company_id?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          refresh_token: string
          scope?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          company_id?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          refresh_token?: string
          scope?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobber_connections_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          address: string
          city: string | null
          company_id: string | null
          created_at: string | null
          crew_id: string | null
          customer_email: string | null
          customer_name: string
          customer_phone: string | null
          estimated_duration_minutes: number | null
          id: string
          jobber_id: string | null
          notes: string | null
          payment_status: string | null
          property_access_notes: string | null
          scheduled_date: string | null
          scheduled_time_end: string | null
          scheduled_time_start: string | null
          state: string | null
          status: string
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          address: string
          city?: string | null
          company_id?: string | null
          created_at?: string | null
          crew_id?: string | null
          customer_email?: string | null
          customer_name: string
          customer_phone?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          jobber_id?: string | null
          notes?: string | null
          payment_status?: string | null
          property_access_notes?: string | null
          scheduled_date?: string | null
          scheduled_time_end?: string | null
          scheduled_time_start?: string | null
          state?: string | null
          status?: string
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          address?: string
          city?: string | null
          company_id?: string | null
          created_at?: string | null
          crew_id?: string | null
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          jobber_id?: string | null
          notes?: string | null
          payment_status?: string | null
          property_access_notes?: string | null
          scheduled_date?: string | null
          scheduled_time_end?: string | null
          scheduled_time_start?: string | null
          state?: string | null
          status?: string
          updated_at?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          company_id: string | null
          created_at: string | null
          crew_id: string | null
          date: string
          end_location: string | null
          id: string
          job_ids: string[] | null
          optimized_order: number[] | null
          start_location: string | null
          status: string | null
          total_estimated_time_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          crew_id?: string | null
          date: string
          end_location?: string | null
          id?: string
          job_ids?: string[] | null
          optimized_order?: number[] | null
          start_location?: string | null
          status?: string | null
          total_estimated_time_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          crew_id?: string | null
          date?: string
          end_location?: string | null
          id?: string
          job_ids?: string[] | null
          optimized_order?: number[] | null
          start_location?: string | null
          status?: string | null
          total_estimated_time_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "crews"
            referencedColumns: ["id"]
          },
        ]
      }
      status_updates: {
        Row: {
          created_at: string | null
          id: string
          job_id: string | null
          latitude: number | null
          longitude: number | null
          notes: string | null
          previous_status: string | null
          status: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          previous_status?: string | null
          status: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          previous_status?: string | null
          status?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_updates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_updates_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          role: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      automation_log: {
        Row: {
          created_at: string
          id: string
          minutes_saved: number
          mother_id: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          minutes_saved?: number
          mother_id?: string | null
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          minutes_saved?: number
          mother_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_log_mother_id_fkey"
            columns: ["mother_id"]
            isOneToOne: false
            referencedRelation: "mothers"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_attempts: {
        Row: {
          created_at: string
          email: string
          id: string
          ip: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip?: string
        }
        Relationships: []
      }
      calls: {
        Row: {
          blocked_until: string
          clock_note: string | null
          coach_move_pending: boolean
          coach_moves_used: number
          created_at: string
          ends_at: string
          id: string
          keep_spot_confirmed_at: string | null
          keep_spot_sent_at: string | null
          kind: string
          mother_id: string
          moves_used: number
          plan_id: string | null
          reminder_sent_at: string | null
          replaces_call_id: string | null
          small_step: string | null
          starts_at: string
          status: string
          thanks_sent_at: string | null
          updated_at: string
          week: number | null
        }
        Insert: {
          blocked_until: string
          clock_note?: string | null
          coach_move_pending?: boolean
          coach_moves_used?: number
          created_at?: string
          ends_at: string
          id?: string
          keep_spot_confirmed_at?: string | null
          keep_spot_sent_at?: string | null
          kind: string
          mother_id: string
          moves_used?: number
          plan_id?: string | null
          reminder_sent_at?: string | null
          replaces_call_id?: string | null
          small_step?: string | null
          starts_at: string
          status?: string
          thanks_sent_at?: string | null
          updated_at?: string
          week?: number | null
        }
        Update: {
          blocked_until?: string
          clock_note?: string | null
          coach_move_pending?: boolean
          coach_moves_used?: number
          created_at?: string
          ends_at?: string
          id?: string
          keep_spot_confirmed_at?: string | null
          keep_spot_sent_at?: string | null
          kind?: string
          mother_id?: string
          moves_used?: number
          plan_id?: string | null
          reminder_sent_at?: string | null
          replaces_call_id?: string | null
          small_step?: string | null
          starts_at?: string
          status?: string
          thanks_sent_at?: string | null
          updated_at?: string
          week?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_mother_id_fkey"
            columns: ["mother_id"]
            isOneToOne: false
            referencedRelation: "mothers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_replaces_call_id_fkey"
            columns: ["replaces_call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      cron_keys: {
        Row: {
          id: number
          key: string
        }
        Insert: {
          id?: number
          key?: string
        }
        Update: {
          id?: number
          key?: string
        }
        Relationships: []
      }
      email_outbox: {
        Row: {
          action_label: string | null
          action_url: string | null
          body: string
          created_at: string
          ics: string | null
          id: string
          kind: string
          mother_id: string | null
          subject: string
          to_email: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          body: string
          created_at?: string
          ics?: string | null
          id?: string
          kind: string
          mother_id?: string | null
          subject: string
          to_email: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          body?: string
          created_at?: string
          ics?: string | null
          id?: string
          kind?: string
          mother_id?: string | null
          subject?: string
          to_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_outbox_mother_id_fkey"
            columns: ["mother_id"]
            isOneToOne: false
            referencedRelation: "mothers"
            referencedColumns: ["id"]
          },
        ]
      }
      helplines: {
        Row: {
          country: string
          created_at: string
          hours: string | null
          id: string
          name: string
          number: string
          sort: number
          zones: string[]
        }
        Insert: {
          country: string
          created_at?: string
          hours?: string | null
          id?: string
          name: string
          number: string
          sort?: number
          zones?: string[]
        }
        Update: {
          country?: string
          created_at?: string
          hours?: string | null
          id?: string
          name?: string
          number?: string
          sort?: number
          zones?: string[]
        }
        Relationships: []
      }
      mother_links: {
        Row: {
          created_at: string
          mother_id: string
          token: string
        }
        Insert: {
          created_at?: string
          mother_id: string
          token: string
        }
        Update: {
          created_at?: string
          mother_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "mother_links_mother_id_fkey"
            columns: ["mother_id"]
            isOneToOne: true
            referencedRelation: "mothers"
            referencedColumns: ["id"]
          },
        ]
      }
      mothers: {
        Row: {
          city: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          moment_days: number[]
          moment_not_after: string | null
          moment_not_before: string | null
          phone: string | null
          status: string
          token_hash: string
          updated_at: string
          zone: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          moment_days?: number[]
          moment_not_after?: string | null
          moment_not_before?: string | null
          phone?: string | null
          status?: string
          token_hash: string
          updated_at?: string
          zone: string
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          moment_days?: number[]
          moment_not_after?: string | null
          moment_not_before?: string | null
          phone?: string | null
          status?: string
          token_hash?: string
          updated_at?: string
          zone?: string
        }
        Relationships: []
      }
      move_log: {
        Row: {
          call_id: string
          created_at: string
          from_at: string
          id: string
          moved_by: string
          to_at: string | null
        }
        Insert: {
          call_id: string
          created_at?: string
          from_at: string
          id?: string
          moved_by: string
          to_at?: string | null
        }
        Update: {
          call_id?: string
          created_at?: string
          from_at?: string
          id?: string
          moved_by?: string
          to_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "move_log_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      needs_you: {
        Row: {
          call_id: string | null
          created_at: string
          id: string
          kind: string
          mother_id: string | null
          plan_id: string | null
          resolved_at: string | null
        }
        Insert: {
          call_id?: string | null
          created_at?: string
          id?: string
          kind: string
          mother_id?: string | null
          plan_id?: string | null
          resolved_at?: string | null
        }
        Update: {
          call_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          mother_id?: string | null
          plan_id?: string | null
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "needs_you_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "needs_you_mother_id_fkey"
            columns: ["mother_id"]
            isOneToOne: false
            referencedRelation: "mothers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "needs_you_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          amount: number
          confirmed_at: string | null
          created_at: string
          currency: string
          founding: boolean
          hold_expires_at: string
          id: string
          mother_id: string | null
          paid_at: string | null
          paid_reference: string | null
          reference: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          confirmed_at?: string | null
          created_at?: string
          currency: string
          founding?: boolean
          hold_expires_at: string
          id?: string
          mother_id?: string | null
          paid_at?: string | null
          paid_reference?: string | null
          reference: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          founding?: boolean
          hold_expires_at?: string
          id?: string
          mother_id?: string | null
          paid_at?: string | null
          paid_reference?: string | null
          reference?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plans_mother_id_fkey"
            columns: ["mother_id"]
            isOneToOne: false
            referencedRelation: "mothers"
            referencedColumns: ["id"]
          },
        ]
      }
      private_notes: {
        Row: {
          body: string
          created_at: string
          id: string
          mother_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          mother_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          mother_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "private_notes_mother_id_fkey"
            columns: ["mother_id"]
            isOneToOne: false
            referencedRelation: "mothers"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          buffer_min: number
          coach_email: string
          coach_zone: string
          id: number
          max_per_day: number
          meet_link: string
          minutes: Json
          not_a_fit_note: string
          notice_move_h: number
          notice_new_h: number
          payment: Json
          prices: Json
          updated_at: string
          weeks_ahead: number
          windows: Json
        }
        Insert: {
          buffer_min?: number
          coach_email?: string
          coach_zone?: string
          id?: number
          max_per_day?: number
          meet_link?: string
          minutes?: Json
          not_a_fit_note?: string
          notice_move_h?: number
          notice_new_h?: number
          payment?: Json
          prices?: Json
          updated_at?: string
          weeks_ahead?: number
          windows?: Json
        }
        Update: {
          buffer_min?: number
          coach_email?: string
          coach_zone?: string
          id?: number
          max_per_day?: number
          meet_link?: string
          minutes?: Json
          not_a_fit_note?: string
          notice_move_h?: number
          notice_new_h?: number
          payment?: Json
          prices?: Json
          updated_at?: string
          weeks_ahead?: number
          windows?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          city: string | null
          created_at: string
          days: number[]
          email: string
          first_name: string
          id: string
          not_after: string | null
          not_before: string | null
          status: string
          zone: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          days?: number[]
          email: string
          first_name: string
          id?: string
          not_after?: string | null
          not_before?: string | null
          status?: string
          zone: string
        }
        Update: {
          city?: string | null
          created_at?: string
          days?: number[]
          email?: string
          first_name?: string
          id?: string
          not_after?: string | null
          not_before?: string | null
          status?: string
          zone?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      next_payment_ref: { Args: never; Returns: string }
    }
    Enums: {
      app_role: "coach"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["coach"],
    },
  },
} as const

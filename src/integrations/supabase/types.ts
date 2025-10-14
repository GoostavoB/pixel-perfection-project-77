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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bill_analyses: {
        Row: {
          analysis_result: Json | null
          created_at: string
          critical_issues: number | null
          estimated_savings: number | null
          expires_at: string | null
          extracted_text: string | null
          file_name: string
          file_type: string
          file_url: string
          id: string
          issues: Json | null
          moderate_issues: number | null
          session_id: string
          status: string
          total_overcharges: number | null
          updated_at: string
          user_email: string | null
          user_id: string | null
          user_name: string | null
          user_phone: string | null
        }
        Insert: {
          analysis_result?: Json | null
          created_at?: string
          critical_issues?: number | null
          estimated_savings?: number | null
          expires_at?: string | null
          extracted_text?: string | null
          file_name: string
          file_type: string
          file_url: string
          id?: string
          issues?: Json | null
          moderate_issues?: number | null
          session_id: string
          status?: string
          total_overcharges?: number | null
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Update: {
          analysis_result?: Json | null
          created_at?: string
          critical_issues?: number | null
          estimated_savings?: number | null
          expires_at?: string | null
          extracted_text?: string | null
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          issues?: Json | null
          moderate_issues?: number | null
          session_id?: string
          status?: string
          total_overcharges?: number | null
          updated_at?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          user_phone?: string | null
        }
        Relationships: []
      }
      dispute_letters: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          pdf_url: string | null
          session_id: string
          template_text: string
          updated_at: string
          user_address: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          pdf_url?: string | null
          session_id: string
          template_text: string
          updated_at?: string
          user_address?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          pdf_url?: string | null
          session_id?: string
          template_text?: string
          updated_at?: string
          user_address?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispute_letters_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "bill_analyses"
            referencedColumns: ["session_id"]
          },
        ]
      }
      user_form_data: {
        Row: {
          birth_year: number | null
          created_at: string
          email: string
          expires_at: string | null
          hospital_city: string | null
          hospital_state: string | null
          id: string
          name: string | null
          session_id: string
          terms_accepted: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          birth_year?: number | null
          created_at?: string
          email: string
          expires_at?: string | null
          hospital_city?: string | null
          hospital_state?: string | null
          id?: string
          name?: string | null
          session_id: string
          terms_accepted?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          birth_year?: number | null
          created_at?: string
          email?: string
          expires_at?: string | null
          hospital_city?: string | null
          hospital_state?: string | null
          id?: string
          name?: string | null
          session_id?: string
          terms_accepted?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_form_data_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "bill_analyses"
            referencedColumns: ["session_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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

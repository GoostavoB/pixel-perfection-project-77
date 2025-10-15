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
      analysis_results: {
        Row: {
          cpt_codes: Json | null
          cpt_count: number | null
          created_at: string
          dispute_letter_html: string | null
          findings: Json | null
          full_analysis: Json
          hospital_name: string | null
          id: string
          job_id: string | null
          pdf_report_html: string | null
          raw_text: string | null
          ui_summary: Json
        }
        Insert: {
          cpt_codes?: Json | null
          cpt_count?: number | null
          created_at?: string
          dispute_letter_html?: string | null
          findings?: Json | null
          full_analysis: Json
          hospital_name?: string | null
          id?: string
          job_id?: string | null
          pdf_report_html?: string | null
          raw_text?: string | null
          ui_summary: Json
        }
        Update: {
          cpt_codes?: Json | null
          cpt_count?: number | null
          created_at?: string
          dispute_letter_html?: string | null
          findings?: Json | null
          full_analysis?: Json
          hospital_name?: string | null
          id?: string
          job_id?: string | null
          pdf_report_html?: string | null
          raw_text?: string | null
          ui_summary?: Json
        }
        Relationships: [
          {
            foreignKeyName: "analysis_results_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["job_id"]
          },
        ]
      }
      api_tokens: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          last_used_at: string | null
          name: string
          token: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name: string
          token: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name?: string
          token?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          job_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          job_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          job_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["job_id"]
          },
        ]
      }
      bill_analyses: {
        Row: {
          analysis_result: Json | null
          created_at: string
          critical_issues: number | null
          dispute_letter_generated_at: string | null
          dispute_letter_url: string | null
          estimated_savings: number | null
          expires_at: string | null
          extracted_text: string | null
          file_name: string
          file_type: string
          file_url: string
          id: string
          issues: Json | null
          moderate_issues: number | null
          pdf_generated_at: string | null
          pdf_report_url: string | null
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
          dispute_letter_generated_at?: string | null
          dispute_letter_url?: string | null
          estimated_savings?: number | null
          expires_at?: string | null
          extracted_text?: string | null
          file_name: string
          file_type: string
          file_url: string
          id?: string
          issues?: Json | null
          moderate_issues?: number | null
          pdf_generated_at?: string | null
          pdf_report_url?: string | null
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
          dispute_letter_generated_at?: string | null
          dispute_letter_url?: string | null
          estimated_savings?: number | null
          expires_at?: string | null
          extracted_text?: string | null
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          issues?: Json | null
          moderate_issues?: number | null
          pdf_generated_at?: string | null
          pdf_report_url?: string | null
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
      custom_pricing_data: {
        Row: {
          cpt_code: string
          created_at: string | null
          custom_rate: number | null
          description: string | null
          id: string
          region: string | null
          source: string | null
        }
        Insert: {
          cpt_code: string
          created_at?: string | null
          custom_rate?: number | null
          description?: string | null
          id?: string
          region?: string | null
          source?: string | null
        }
        Update: {
          cpt_code?: string
          created_at?: string | null
          custom_rate?: number | null
          description?: string | null
          id?: string
          region?: string | null
          source?: string | null
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
      jobs: {
        Row: {
          analysis_id: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          file_name: string
          file_size: number
          file_type: string
          job_id: string
          progress: number
          session_id: string
          started_at: string
          status: string
        }
        Insert: {
          analysis_id: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_name: string
          file_size: number
          file_type: string
          job_id?: string
          progress?: number
          session_id: string
          started_at?: string
          status?: string
        }
        Update: {
          analysis_id?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          job_id?: string
          progress?: number
          session_id?: string
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      medicare_prices: {
        Row: {
          cpt_code: string
          created_at: string
          description: string | null
          id: string
          medicare_facility_rate: number | null
        }
        Insert: {
          cpt_code: string
          created_at?: string
          description?: string | null
          id?: string
          medicare_facility_rate?: number | null
        }
        Update: {
          cpt_code?: string
          created_at?: string
          description?: string | null
          id?: string
          medicare_facility_rate?: number | null
        }
        Relationships: []
      }
      pricing_api_configs: {
        Row: {
          api_endpoint: string
          api_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          rate_limit: number | null
          updated_at: string | null
        }
        Insert: {
          api_endpoint: string
          api_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          rate_limit?: number | null
          updated_at?: string | null
        }
        Update: {
          api_endpoint?: string
          api_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          rate_limit?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      regional_pricing: {
        Row: {
          adjustment_factor: number
          created_at: string | null
          id: string
          region_name: string
          state_code: string
        }
        Insert: {
          adjustment_factor?: number
          created_at?: string | null
          id?: string
          region_name: string
          state_code: string
        }
        Update: {
          adjustment_factor?: number
          created_at?: string | null
          id?: string
          region_name?: string
          state_code?: string
        }
        Relationships: []
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
      validate_api_token: {
        Args: { token_value: string }
        Returns: string
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

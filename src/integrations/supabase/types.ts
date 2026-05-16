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
      admin_actions: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          notes: string | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          notes?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      athlete_profiles: {
        Row: {
          achievements: string | null
          audience_demographics: Json | null
          availability: string | null
          brand_categories: Json
          causes: string[] | null
          certifications: string | null
          competition_history: string | null
          created_at: string
          discipline: string | null
          favorite_brands: string[]
          favorite_products: string | null
          geographic_preferences: string[] | null
          material_preferences: string[]
          media: Json | null
          partnership_types: string[] | null
          personality: string | null
          pricing_max: number | null
          pricing_min: number | null
          professional_level: string | null
          profile_completeness: number
          profile_image: string | null
          rankings: string | null
          sizing: Json
          social_links: Json | null
          sponsorship_categories: string[] | null
          sport: string | null
          story: string | null
          team_federation: string | null
          updated_at: string
          user_id: string
          values: string[] | null
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          achievements?: string | null
          audience_demographics?: Json | null
          availability?: string | null
          brand_categories?: Json
          causes?: string[] | null
          certifications?: string | null
          competition_history?: string | null
          created_at?: string
          discipline?: string | null
          favorite_brands?: string[]
          favorite_products?: string | null
          geographic_preferences?: string[] | null
          material_preferences?: string[]
          media?: Json | null
          partnership_types?: string[] | null
          personality?: string | null
          pricing_max?: number | null
          pricing_min?: number | null
          professional_level?: string | null
          profile_completeness?: number
          profile_image?: string | null
          rankings?: string | null
          sizing?: Json
          social_links?: Json | null
          sponsorship_categories?: string[] | null
          sport?: string | null
          story?: string | null
          team_federation?: string | null
          updated_at?: string
          user_id: string
          values?: string[] | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          achievements?: string | null
          audience_demographics?: Json | null
          availability?: string | null
          brand_categories?: Json
          causes?: string[] | null
          certifications?: string | null
          competition_history?: string | null
          created_at?: string
          discipline?: string | null
          favorite_brands?: string[]
          favorite_products?: string | null
          geographic_preferences?: string[] | null
          material_preferences?: string[]
          media?: Json | null
          partnership_types?: string[] | null
          personality?: string | null
          pricing_max?: number | null
          pricing_min?: number | null
          professional_level?: string | null
          profile_completeness?: number
          profile_image?: string | null
          rankings?: string | null
          sizing?: Json
          social_links?: Json | null
          sponsorship_categories?: string[] | null
          sport?: string | null
          story?: string | null
          team_federation?: string | null
          updated_at?: string
          user_id?: string
          values?: string[] | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: []
      }
      brand_profiles: {
        Row: {
          brand_name: string | null
          consumer_demographics: Json | null
          contact_role: string | null
          created_at: string
          esg_priorities: string[] | null
          industry: string | null
          mission: string | null
          positioning: string | null
          revenue_stage: string | null
          updated_at: string
          user_id: string
          values: string[] | null
          verification_status: Database["public"]["Enums"]["verification_status"]
          website: string | null
        }
        Insert: {
          brand_name?: string | null
          consumer_demographics?: Json | null
          contact_role?: string | null
          created_at?: string
          esg_priorities?: string[] | null
          industry?: string | null
          mission?: string | null
          positioning?: string | null
          revenue_stage?: string | null
          updated_at?: string
          user_id: string
          values?: string[] | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          website?: string | null
        }
        Update: {
          brand_name?: string | null
          consumer_demographics?: Json | null
          contact_role?: string | null
          created_at?: string
          esg_priorities?: string[] | null
          industry?: string | null
          mission?: string | null
          positioning?: string | null
          revenue_stage?: string | null
          updated_at?: string
          user_id?: string
          values?: string[] | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          website?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          brand_id: string
          budget_max: number | null
          budget_min: number | null
          content_deliverables: string | null
          created_at: string
          description: string | null
          geographic_reach: string[] | null
          goals: string | null
          id: string
          name: string
          notes: string | null
          partnership_structure: string | null
          preferred_athlete_types: string[] | null
          product_category: string | null
          sports: string[] | null
          status: Database["public"]["Enums"]["campaign_status"]
          timeline: string | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          budget_max?: number | null
          budget_min?: number | null
          content_deliverables?: string | null
          created_at?: string
          description?: string | null
          geographic_reach?: string[] | null
          goals?: string | null
          id?: string
          name: string
          notes?: string | null
          partnership_structure?: string | null
          preferred_athlete_types?: string[] | null
          product_category?: string | null
          sports?: string[] | null
          status?: Database["public"]["Enums"]["campaign_status"]
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          budget_max?: number | null
          budget_min?: number | null
          content_deliverables?: string | null
          created_at?: string
          description?: string | null
          geographic_reach?: string[] | null
          goals?: string | null
          id?: string
          name?: string
          notes?: string | null
          partnership_structure?: string | null
          preferred_athlete_types?: string[] | null
          product_category?: string | null
          sports?: string[] | null
          status?: Database["public"]["Enums"]["campaign_status"]
          timeline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          athlete_id: string
          brand_id: string
          campaign_id: string | null
          cancellation_terms: string | null
          compensation_amount: number
          created_at: string
          deliverables: string | null
          ethical_notes: string | null
          exclusivity: string | null
          id: string
          legal_notes: string | null
          payment_schedule: string | null
          plain_summary: string | null
          platform_fee_pct: number
          post_deal_strategies: string | null
          proposal_id: string | null
          signed_by_athlete_at: string | null
          signed_by_brand_at: string | null
          status: Database["public"]["Enums"]["contract_status"]
          timeline: string | null
          title: string
          updated_at: string
          usage_rights: string | null
        }
        Insert: {
          athlete_id: string
          brand_id: string
          campaign_id?: string | null
          cancellation_terms?: string | null
          compensation_amount?: number
          created_at?: string
          deliverables?: string | null
          ethical_notes?: string | null
          exclusivity?: string | null
          id?: string
          legal_notes?: string | null
          payment_schedule?: string | null
          plain_summary?: string | null
          platform_fee_pct?: number
          post_deal_strategies?: string | null
          proposal_id?: string | null
          signed_by_athlete_at?: string | null
          signed_by_brand_at?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          timeline?: string | null
          title: string
          updated_at?: string
          usage_rights?: string | null
        }
        Update: {
          athlete_id?: string
          brand_id?: string
          campaign_id?: string | null
          cancellation_terms?: string | null
          compensation_amount?: number
          created_at?: string
          deliverables?: string | null
          ethical_notes?: string | null
          exclusivity?: string | null
          id?: string
          legal_notes?: string | null
          payment_schedule?: string | null
          plain_summary?: string | null
          platform_fee_pct?: number
          post_deal_strategies?: string | null
          proposal_id?: string | null
          signed_by_athlete_at?: string | null
          signed_by_brand_at?: string | null
          status?: Database["public"]["Enums"]["contract_status"]
          timeline?: string | null
          title?: string
          updated_at?: string
          usage_rights?: string | null
        }
        Relationships: []
      }
      disputes: {
        Row: {
          admin_notes: string | null
          contract_id: string | null
          created_at: string
          details: string | null
          id: string
          proposal_id: string | null
          reason: string
          reporter_id: string
          status: Database["public"]["Enums"]["dispute_status"]
          target_user_id: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          contract_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          proposal_id?: string | null
          reason: string
          reporter_id: string
          status?: Database["public"]["Enums"]["dispute_status"]
          target_user_id?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          contract_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          proposal_id?: string | null
          reason?: string
          reporter_id?: string
          status?: Database["public"]["Enums"]["dispute_status"]
          target_user_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          athlete_id: string
          audience_score: number | null
          brand_id: string
          budget_score: number | null
          campaign_id: string | null
          campaign_score: number | null
          created_at: string
          explanation: string | null
          id: string
          saved_by_brand: boolean
          score: number
          sport_score: number | null
          values_score: number | null
        }
        Insert: {
          athlete_id: string
          audience_score?: number | null
          brand_id: string
          budget_score?: number | null
          campaign_id?: string | null
          campaign_score?: number | null
          created_at?: string
          explanation?: string | null
          id?: string
          saved_by_brand?: boolean
          score?: number
          sport_score?: number | null
          values_score?: number | null
        }
        Update: {
          athlete_id?: string
          audience_score?: number | null
          brand_id?: string
          budget_score?: number | null
          campaign_id?: string | null
          campaign_score?: number | null
          created_at?: string
          explanation?: string | null
          id?: string
          saved_by_brand?: boolean
          score?: number
          sport_score?: number | null
          values_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_url: string | null
          body: string
          contract_id: string | null
          created_at: string
          id: string
          proposal_id: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          system_event: string | null
        }
        Insert: {
          attachment_url?: string | null
          body: string
          contract_id?: string | null
          created_at?: string
          id?: string
          proposal_id?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          system_event?: string | null
        }
        Update: {
          attachment_url?: string | null
          body?: string
          contract_id?: string | null
          created_at?: string
          id?: string
          proposal_id?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          system_event?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          athlete_id: string
          athlete_payout: number
          brand_id: string
          contract_id: string
          created_at: string
          due_date: string | null
          id: string
          milestone_label: string | null
          platform_fee: number
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          athlete_id: string
          athlete_payout?: number
          brand_id: string
          contract_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          milestone_label?: string | null
          platform_fee?: number
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          athlete_id?: string
          athlete_payout?: number
          brand_id?: string
          contract_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          milestone_label?: string | null
          platform_fee?: number
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: []
      }
      pricing_profiles: {
        Row: {
          athlete_id: string
          created_at: string
          description: string | null
          id: string
          package_type: string
          price_max: number | null
          price_min: number | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          athlete_id: string
          created_at?: string
          description?: string | null
          id?: string
          package_type: string
          price_max?: number | null
          price_min?: number | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          athlete_id?: string
          created_at?: string
          description?: string | null
          id?: string
          package_type?: string
          price_max?: number | null
          price_min?: number | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean
          primary_role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean
          primary_role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          primary_role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          athlete_id: string
          athlete_response: string | null
          body: string | null
          brand_id: string
          campaign_id: string | null
          created_at: string
          deliverables: string | null
          id: string
          partnership_type: string | null
          proposed_amount: number | null
          status: Database["public"]["Enums"]["proposal_status"]
          timeline: string | null
        }
        Insert: {
          athlete_id: string
          athlete_response?: string | null
          body?: string | null
          brand_id: string
          campaign_id?: string | null
          created_at?: string
          deliverables?: string | null
          id?: string
          partnership_type?: string | null
          proposed_amount?: number | null
          status?: Database["public"]["Enums"]["proposal_status"]
          timeline?: string | null
        }
        Update: {
          athlete_id?: string
          athlete_response?: string | null
          body?: string | null
          brand_id?: string
          campaign_id?: string | null
          created_at?: string
          deliverables?: string | null
          id?: string
          partnership_type?: string | null
          proposed_amount?: number | null
          status?: Database["public"]["Enums"]["proposal_status"]
          timeline?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          campaign_success: number
          comment: string | null
          communication: number
          contract_id: string
          created_at: string
          id: string
          professionalism: number
          reliability: number
          reviewee_id: string
          reviewer_id: string
          reviewer_role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          campaign_success: number
          comment?: string | null
          communication: number
          contract_id: string
          created_at?: string
          id?: string
          professionalism: number
          reliability: number
          reviewee_id: string
          reviewer_id: string
          reviewer_role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          campaign_success?: number
          comment?: string | null
          communication?: number
          contract_id?: string
          created_at?: string
          id?: string
          professionalism?: number
          reliability?: number
          reviewee_id?: string
          reviewer_id?: string
          reviewer_role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      saved_athletes: {
        Row: {
          athlete_id: string
          brand_id: string
          created_at: string
          id: string
          notes: string | null
        }
        Insert: {
          athlete_id: string
          brand_id: string
          created_at?: string
          id?: string
          notes?: string | null
        }
        Update: {
          athlete_id?: string
          brand_id?: string
          created_at?: string
          id?: string
          notes?: string | null
        }
        Relationships: []
      }
      trust_flags: {
        Row: {
          created_at: string
          created_by: string | null
          flag_type: string
          id: string
          notes: string | null
          target_user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          flag_type: string
          id?: string
          notes?: string | null
          target_user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          flag_type?: string
          id?: string
          notes?: string | null
          target_user_id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_primary_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "athlete" | "brand" | "admin"
      campaign_status: "draft" | "active" | "paused" | "closed"
      contract_status:
        | "draft"
        | "pending_signature"
        | "signed"
        | "active"
        | "completed"
        | "cancelled"
      dispute_status: "open" | "in_review" | "resolved" | "rejected"
      payment_status: "pending" | "escrow" | "released" | "refunded" | "failed"
      proposal_status:
        | "sent"
        | "viewed"
        | "accepted"
        | "declined"
        | "negotiating"
        | "counter_offered"
        | "completed"
      verification_status: "pending" | "in_review" | "verified" | "rejected"
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
    Enums: {
      app_role: ["athlete", "brand", "admin"],
      campaign_status: ["draft", "active", "paused", "closed"],
      contract_status: [
        "draft",
        "pending_signature",
        "signed",
        "active",
        "completed",
        "cancelled",
      ],
      dispute_status: ["open", "in_review", "resolved", "rejected"],
      payment_status: ["pending", "escrow", "released", "refunded", "failed"],
      proposal_status: [
        "sent",
        "viewed",
        "accepted",
        "declined",
        "negotiating",
        "counter_offered",
        "completed",
      ],
      verification_status: ["pending", "in_review", "verified", "rejected"],
    },
  },
} as const

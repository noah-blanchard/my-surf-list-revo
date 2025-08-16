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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      map_mappers: {
        Row: {
          id: number
          map_id: number
          mapper_id: string | null
          mapper_name: string
          steam_id: string | null
          type_id: number | null
          type_id_key: number | null
          type_name: string | null
        }
        Insert: {
          id?: number
          map_id: number
          mapper_id?: string | null
          mapper_name: string
          steam_id?: string | null
          type_id?: number | null
          type_id_key?: number | null
          type_name?: string | null
        }
        Update: {
          id?: number
          map_id?: number
          mapper_id?: string | null
          mapper_name?: string
          steam_id?: string | null
          type_id?: number | null
          type_id_key?: number | null
          type_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "map_mappers_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "maps"
            referencedColumns: ["id"]
          },
        ]
      }
      maps: {
        Row: {
          b_count: number
          cheats: boolean
          cp_count: number
          created_at: string
          id: number
          is_linear: boolean
          lastplayed_at: string
          leniency: number | null
          max_velocity: number
          name: string
          stages_count: number | null
          tier: number
          zones_count: number | null
        }
        Insert: {
          b_count: number
          cheats: boolean
          cp_count: number
          created_at: string
          id?: number
          is_linear: boolean
          lastplayed_at: string
          leniency?: number | null
          max_velocity: number
          name: string
          stages_count?: number | null
          tier: number
          zones_count?: number | null
        }
        Update: {
          b_count?: number
          cheats?: boolean
          cp_count?: number
          created_at?: string
          id?: number
          is_linear?: boolean
          lastplayed_at?: string
          leniency?: number | null
          max_velocity?: number
          name?: string
          stages_count?: number | null
          tier?: number
          zones_count?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          steam_id64: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          steam_id64?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          steam_id64?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_maps: {
        Row: {
          bonuses_completed: number[]
          completed_at: string | null
          created_at: string
          id: number
          map_id: number
          stages_completed: number[]
          status: Database["public"]["Enums"]["map_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          bonuses_completed?: number[]
          completed_at?: string | null
          created_at?: string
          id?: number
          map_id: number
          stages_completed?: number[]
          status?: Database["public"]["Enums"]["map_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          bonuses_completed?: number[]
          completed_at?: string | null
          created_at?: string
          id?: number
          map_id?: number
          stages_completed?: number[]
          status?: Database["public"]["Enums"]["map_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_maps_map_id_fkey"
            columns: ["map_id"]
            isOneToOne: false
            referencedRelation: "maps"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _add_map: {
        Args: {
          p_bonuses?: number[]
          p_map_id: number
          p_stages?: number[]
          p_status?: Database["public"]["Enums"]["map_status"]
          p_user_id: string
        }
        Returns: undefined
      }
      add_map_self: {
        Args: {
          p_bonuses?: number[]
          p_map_id: number
          p_stages?: number[]
          p_status?: Database["public"]["Enums"]["map_status"]
        }
        Returns: undefined
      }
      append_bonus_completed: {
        Args: { p_bonus: number; p_map_id: number; p_user_id: string }
        Returns: undefined
      }
      append_bonus_completed_self: {
        Args: { p_bonus: number; p_map_id: number }
        Returns: undefined
      }
      append_stage_completed: {
        Args: { p_map_id: number; p_stage: number; p_user_id: string }
        Returns: undefined
      }
      append_stage_completed_self: {
        Args: { p_map_id: number; p_stage: number }
        Returns: undefined
      }
      distinct_sorted_int_array: {
        Args: { a: number[] }
        Returns: number[]
      }
      edit_profile: {
        Args: {
          p_display_name: string
          p_steam_id64: string
          p_user_id: string
        }
        Returns: undefined
      }
      edit_profile_self: {
        Args: { p_display_name: string; p_steam_id64: string }
        Returns: undefined
      }
      set_map_status: {
        Args: {
          p_map_id: number
          p_status: Database["public"]["Enums"]["map_status"]
          p_user_id: string
        }
        Returns: undefined
      }
      set_map_status_self: {
        Args: {
          p_map_id: number
          p_status: Database["public"]["Enums"]["map_status"]
        }
        Returns: undefined
      }
    }
    Enums: {
      map_status: "Planned" | "On hold" | "Dropped" | "Completed" | "Ongoing"
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
      map_status: ["Planned", "On hold", "Dropped", "Completed", "Ongoing"],
    },
  },
} as const

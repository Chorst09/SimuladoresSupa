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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      atividades: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          oportunidade_id: string
          tipo: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          oportunidade_id: string
          tipo: string
          titulo: string
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          oportunidade_id?: string
          tipo?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "atividades_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          cnpj_cpf: string | null
          created_at: string | null
          created_by: string | null
          email_contato: string
          endereco_completo: string | null
          id: string
          nome_contato: string
          nome_razao_social: string
          status: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          cnpj_cpf?: string | null
          created_at?: string | null
          created_by?: string | null
          email_contato: string
          endereco_completo?: string | null
          id?: string
          nome_contato: string
          nome_razao_social: string
          status?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          cnpj_cpf?: string | null
          created_at?: string | null
          created_by?: string | null
          email_contato?: string
          endereco_completo?: string | null
          id?: string
          nome_contato?: string
          nome_razao_social?: string
          status?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_channel_director: {
        Row: {
          created_at: string | null
          id: string
          months_12: number
          months_24: number
          months_36: number
          months_48: number
          months_60: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          months_12?: number
          months_24?: number
          months_36?: number
          months_48?: number
          months_60?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          months_12?: number
          months_24?: number
          months_36?: number
          months_48?: number
          months_60?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      commission_channel_indicator: {
        Row: {
          created_at: string | null
          id: string
          months_12: number
          months_24: number
          months_36: number
          months_48: number
          months_60: number
          revenue_max: number
          revenue_min: number
          revenue_range: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          months_12?: number
          months_24?: number
          months_36?: number
          months_48?: number
          months_60?: number
          revenue_max: number
          revenue_min: number
          revenue_range: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          months_12?: number
          months_24?: number
          months_36?: number
          months_48?: number
          months_60?: number
          revenue_max?: number
          revenue_min?: number
          revenue_range?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      commission_channel_influencer: {
        Row: {
          created_at: string | null
          id: string
          months_12: number
          months_24: number
          months_36: number
          months_48: number
          months_60: number
          revenue_max: number
          revenue_min: number
          revenue_range: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          months_12?: number
          months_24?: number
          months_36?: number
          months_48?: number
          months_60?: number
          revenue_max: number
          revenue_min: number
          revenue_range: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          months_12?: number
          months_24?: number
          months_36?: number
          months_48?: number
          months_60?: number
          revenue_max?: number
          revenue_min?: number
          revenue_range?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      commission_channel_seller: {
        Row: {
          created_at: string | null
          id: string
          months_12: number
          months_24: number
          months_36: number
          months_48: number
          months_60: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          months_12?: number
          months_24?: number
          months_36?: number
          months_48?: number
          months_60?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          months_12?: number
          months_24?: number
          months_36?: number
          months_48?: number
          months_60?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      commission_seller: {
        Row: {
          created_at: string | null
          id: string
          months_12: number
          months_24: number
          months_36: number
          months_48: number
          months_60: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          months_12?: number
          months_24?: number
          months_36?: number
          months_48?: number
          months_60?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          months_12?: number
          months_24?: number
          months_36?: number
          months_48?: number
          months_60?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fornecedores: {
        Row: {
          area_atuacao: string | null
          cnpj: string
          contato_principal_email: string
          contato_principal_nome: string
          contato_principal_telefone: string | null
          created_at: string | null
          created_by: string | null
          id: string
          nome_razao_social: string
          observacoes: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          area_atuacao?: string | null
          cnpj: string
          contato_principal_email: string
          contato_principal_nome: string
          contato_principal_telefone?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          nome_razao_social: string
          observacoes?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          area_atuacao?: string | null
          cnpj?: string
          contato_principal_email?: string
          contato_principal_nome?: string
          contato_principal_telefone?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          nome_razao_social?: string
          observacoes?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fornecedores_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string | null
          enviada_email: boolean | null
          id: string
          lida: boolean | null
          mensagem: string
          oportunidade_id: string | null
          tipo: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          enviada_email?: boolean | null
          id?: string
          lida?: boolean | null
          mensagem: string
          oportunidade_id?: string | null
          tipo: string
          titulo: string
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          enviada_email?: boolean | null
          id?: string
          lida?: boolean | null
          mensagem?: string
          oportunidade_id?: string | null
          tipo?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      oportunidade_fornecedores: {
        Row: {
          created_at: string | null
          fornecedor_id: string
          id: string
          oportunidade_id: string
        }
        Insert: {
          created_at?: string | null
          fornecedor_id: string
          id?: string
          oportunidade_id: string
        }
        Update: {
          created_at?: string | null
          fornecedor_id?: string
          id?: string
          oportunidade_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oportunidade_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidade_fornecedores_oportunidade_id_fkey"
            columns: ["oportunidade_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
        ]
      }
      oportunidades: {
        Row: {
          cliente_id: string
          created_at: string | null
          created_by: string | null
          data_fechamento_prevista: string
          descricao: string | null
          fase: string
          id: string
          probabilidade_fechamento: number | null
          responsavel_id: string
          titulo: string
          updated_at: string | null
          valor_estimado: number
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          created_by?: string | null
          data_fechamento_prevista: string
          descricao?: string | null
          fase?: string
          id?: string
          probabilidade_fechamento?: number | null
          responsavel_id: string
          titulo: string
          updated_at?: string | null
          valor_estimado: number
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          created_by?: string | null
          data_fechamento_prevista?: string
          descricao?: string | null
          fase?: string
          id?: string
          probabilidade_fechamento?: number | null
          responsavel_id?: string
          titulo?: string
          updated_at?: string | null
          valor_estimado?: number
        }
        Relationships: [
          {
            foreignKeyName: "oportunidades_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pabx_prices: {
        Row: {
          category: string
          created_at: string | null
          id: string
          price: number
          price_type: string
          range_key: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          price: number
          price_type: string
          range_key: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          price?: number
          price_type?: string
          range_key?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          contact: string | null
          created_at: string | null
          id: number
          login: string | null
          main_contact: string | null
          name: string
          password: string | null
          phone: string | null
          procedimento_ro: string | null
          products: string | null
          site: string | null
          site_partner: string | null
          site_ro: string | null
          status: string | null
          template_ro: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          contact?: string | null
          created_at?: string | null
          id?: number
          login?: string | null
          main_contact?: string | null
          name: string
          password?: string | null
          phone?: string | null
          procedimento_ro?: string | null
          products?: string | null
          site?: string | null
          site_partner?: string | null
          site_ro?: string | null
          status?: string | null
          template_ro?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          contact?: string | null
          created_at?: string | null
          id?: number
          login?: string | null
          main_contact?: string | null
          name?: string
          password?: string | null
          phone?: string | null
          procedimento_ro?: string | null
          products?: string | null
          site?: string | null
          site_partner?: string | null
          site_ro?: string | null
          status?: string | null
          template_ro?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          role: string
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id: string
          role: string
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          role?: string
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          account_manager: string | null
          base_id: string
          client: string
          client_data: Json | null
          contract_period: number | null
          created_at: string | null
          created_by: string
          date: string | null
          distributor_id: string | null
          expiry_date: string | null
          id: string
          items: Json | null
          products: Json | null
          status: string | null
          title: string
          total_monthly: number | null
          total_setup: number | null
          type: string
          updated_at: string | null
          updated_by: string | null
          user_id: string | null
          value: number | null
          version: number | null
        }
        Insert: {
          account_manager?: string | null
          base_id: string
          client: string
          client_data?: Json | null
          contract_period?: number | null
          created_at?: string | null
          created_by: string
          date?: string | null
          distributor_id?: string | null
          expiry_date?: string | null
          id?: string
          items?: Json | null
          products?: Json | null
          status?: string | null
          title: string
          total_monthly?: number | null
          total_setup?: number | null
          type: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
          value?: number | null
          version?: number | null
        }
        Update: {
          account_manager?: string | null
          base_id?: string
          client?: string
          client_data?: Json | null
          contract_period?: number | null
          created_at?: string | null
          created_by?: string
          date?: string | null
          distributor_id?: string | null
          expiry_date?: string | null
          id?: string
          items?: Json | null
          products?: Json | null
          status?: string | null
          title?: string
          total_monthly?: number | null
          total_setup?: number | null
          type?: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
          value?: number | null
          version?: number | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: string
      }
      is_same_team: {
        Args: { target_user_id: string; user_id: string }
        Returns: boolean
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

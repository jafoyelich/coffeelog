export interface PourStep {
  step: number;
  time_s: number;
  weight_g: number;
  phase: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          updated_at: string | null;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
        };
        Insert: {
          id: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
        };
      };
      coffees: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          origin: string | null;
          roaster: string | null;
          farm: string | null;
          variety: string | null;
          roast_level: string | null;
          process: string | null;
          tasting_notes: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          origin?: string | null;
          roaster?: string | null;
          farm?: string | null;
          variety?: string | null;
          roast_level?: string | null;
          process?: string | null;
          tasting_notes: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          origin?: string | null;
          roaster?: string | null;
          farm?: string | null;
          variety?: string | null;
          roast_level?: string | null;
          process?: string | null;
          tasting_notes?: string[];
          created_at?: string;
        };
      };
      methods: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          description: string | null;
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          description?: string | null;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          description?: string | null;
          category?: string | null;
          created_at?: string;
        };
      };
      extractions: {
        Row: {
          id: string;
          user_id: string | null;
          coffee_id: string;
          method_id: string;
          grind_setting: string | null;
          temperature_c: number | null;
          coffee_weight_g: number;
          water_weight_g: number;
          extraction_time_s: number | null;
          rating: number | null;
          tasting_notes: string | null;
          pours: PourStep[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          coffee_id: string;
          method_id: string;
          grind_setting?: string | null;
          temperature_c?: number | null;
          coffee_weight_g: number;
          water_weight_g: number;
          extraction_time_s?: number | null;
          rating?: number | null;
          tasting_notes?: string | null;
          pours: PourStep[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          coffee_id?: string;
          method_id?: string;
          grind_setting?: string | null;
          temperature_c?: number | null;
          coffee_weight_g?: number;
          water_weight_g?: number;
          extraction_time_s?: number | null;
          rating?: number | null;
          notes?: string | null;
          pours?: PourStep[];
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Coffee = Database['public']['Tables']['coffees']['Row'];
export type Method = Database['public']['Tables']['methods']['Row'];
export type Extraction = Database['public']['Tables']['extractions']['Row'];

export interface PopulatedExtraction extends Extraction {
  coffees: Coffee | null;
  methods: Method | null;
}

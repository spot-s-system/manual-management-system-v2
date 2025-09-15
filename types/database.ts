export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      manuals: {
        Row: {
          id: string;
          title: string;
          url: string;
          main_category: string;
          sub_category: string | null;
          tags: string[] | null;
          reference_links: { title: string; url: string }[] | null;
          created_at: string;
          updated_at: string;
          is_published: boolean;
          order_index: number;
          step_number: number | null;
          step_name: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          url: string;
          main_category: string;
          sub_category?: string | null;
          tags?: string[] | null;
          reference_links?: { title: string; url: string }[] | null;
          created_at?: string;
          updated_at?: string;
          is_published?: boolean;
          order_index?: number;
          step_number?: number | null;
          step_name?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          url?: string;
          main_category?: string;
          sub_category?: string | null;
          tags?: string[] | null;
          reference_links?: { title: string; url: string }[] | null;
          created_at?: string;
          updated_at?: string;
          is_published?: boolean;
          order_index?: number;
          step_number?: number | null;
          step_name?: string | null;
        };
      };
      manual_requests: {
        Row: {
          id: string;
          requester_name: string;
          requester_email: string;
          department: string | null;
          manual_title: string;
          manual_description: string;
          urgency: "low" | "medium" | "high";
          use_case: string | null;
          expected_users: string | null;
          additional_notes: string | null;
          status: "pending" | "in_progress" | "completed" | "rejected";
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
          manual_id: string | null;
        };
        Insert: {
          id?: string;
          requester_name: string;
          requester_email: string;
          department?: string | null;
          manual_title: string;
          manual_description: string;
          urgency: "low" | "medium" | "high";
          use_case?: string | null;
          expected_users?: string | null;
          additional_notes?: string | null;
          status?: "pending" | "in_progress" | "completed" | "rejected";
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          manual_id?: string | null;
        };
        Update: {
          id?: string;
          requester_name?: string;
          requester_email?: string;
          department?: string | null;
          manual_title?: string;
          manual_description?: string;
          urgency?: "low" | "medium" | "high";
          use_case?: string | null;
          expected_users?: string | null;
          additional_notes?: string | null;
          status?: "pending" | "in_progress" | "completed" | "rejected";
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          manual_id?: string | null;
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
  };
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库类型定义 - 只包含社区留言相关的表
export interface Database {
  public: {
    Tables: {
      messages: {
        Row: {
          id: string
          username: string
          content: string
          timestamp: string
          likes: number
          replies: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          content: string
          timestamp?: string
          likes?: number
          replies?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          content?: string
          timestamp?: string
          likes?: number
          replies?: number
          created_at?: string
          updated_at?: string
        }
      }
      topics: {
        Row: {
          id: string
          title: string
          description: string
          messages: number
          participants: number
          last_activity: string
          trending: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          messages?: number
          participants?: number
          last_activity?: string
          trending?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          messages?: number
          participants?: number
          last_activity?: string
          trending?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      message_likes: {
        Row: {
          id: string
          message_id: string
          username: string
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          username: string
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          username?: string
          created_at?: string
        }
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
  }
}
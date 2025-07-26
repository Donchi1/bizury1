import { create } from "zustand"
import { supabase } from "../supabase"

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  data?: {
    target?: string;
    [key: string]: any;
  };
}

interface NotificationState {
  notifications: Notification[]
  loading: boolean
  fetchNotifications: (user_id: string) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: (user_id: string) => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  createNotification: (n: Omit<Notification, "id" | "is_read" | "created_at">) => Promise<void>
  subscribeToNotifications: (user_id: string) => void
  unsubscribe: () => void
}

let subscription: any = null

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  loading: false,

  fetchNotifications: async (user_id) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
    if (!error && data) {
      set({ notifications: data as Notification[], loading: false })
    } else {
      set({ loading: false })
    }
  },

  markAsRead: async (id) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id)
    set({ notifications: get().notifications.map(n => n.id === id ? { ...n, is_read: true } : n) })
  },

  markAllAsRead: async (user_id) => {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user_id)
    set({ notifications: get().notifications.map(n => ({ ...n, is_read: true })) })
  },

  deleteNotification: async (id) => {
    await supabase.from("notifications").delete().eq("id", id)
    set({ notifications: get().notifications.filter(n => n.id !== id) })
  },

  createNotification: async (n) => {
    const { data, error } = await supabase
      .from("notifications")
      .insert({ ...n, is_read: false })
      .select()
      .single()
    if (!error && data) {
      set({ notifications: [data as Notification, ...get().notifications] })
    }
  },

  subscribeToNotifications: (user_id) => {
    if (subscription) subscription.unsubscribe()
    subscription = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const n = payload.new as Notification
          if (n.user_id === user_id) {
            set({ notifications: [n, ...get().notifications] })
          }
        }
      )
      .subscribe()
  },

  unsubscribe: () => {
    if (subscription) subscription.unsubscribe()
    subscription = null
  },
})) 
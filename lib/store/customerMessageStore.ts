import { create } from "zustand";
import { supabase } from "../supabase";
import { useNotificationStore } from "./notificationStore"

export interface CustomerMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_role: "customer" | "merchant";
  receiver_role: "customer" | "merchant";
  order_id?: string;
  store_id?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface CustomerMessageState {
  messages: CustomerMessage[];
  loading: boolean;
  fetchMessages: (user_id: string) => Promise<void>;
  sendMessage: (msg: Omit<CustomerMessage, "id" | "created_at" | "is_read">) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  subscribeToMessages: (user_id: string) => void;
  unsubscribe: () => void;
}

let subscription: any = null;

export const useCustomerMessageStore = create<CustomerMessageState>()((set, get) => ({
  messages: [],
  loading: false,

  fetchMessages: async (user_id) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user_id},receiver_id.eq.${user_id}`)
      .order("created_at", { ascending: true });
    if (!error && data) {
      set({ messages: data as CustomerMessage[], loading: false });
    } else {
      set({ loading: false });
    }
  },

  sendMessage: async (msg) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("messages")
      .insert({ ...msg, is_read: false })
      .select()
      .single();
    if (!error && data) {
      set({ messages: [...get().messages, data as CustomerMessage], loading: false });
      // Send notification to receiver
      if (msg.receiver_id) {
        const { createNotification } = useNotificationStore.getState()
        await createNotification({
          user_id: msg.receiver_id,
          type: "message",
          title: "New Message",
          message: msg.message,
          data: { messageId: data.id },
        })
      }
    } else {
      set({ loading: false });
    }
  },

  markAsRead: async (messageId) => {
    await supabase.from("messages").update({ is_read: true }).eq("id", messageId);
    set({ messages: get().messages.map(m => m.id === messageId ? { ...m, is_read: true } : m) });
  },

  subscribeToMessages: (user_id) => {
    if (subscription) subscription.unsubscribe();
    subscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as CustomerMessage;
          if (msg.sender_id === user_id || msg.receiver_id === user_id) {
            set({ messages: [...get().messages, msg] });
          }
        }
      )
      .subscribe();
  },

  unsubscribe: () => {
    if (subscription) subscription.unsubscribe();
    subscription = null;
  },
})); 
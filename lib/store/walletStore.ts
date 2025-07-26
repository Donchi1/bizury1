import { create } from "zustand";
import { supabase } from "../supabase";
import { Wallet } from "../types";



interface WalletState {
  wallets: Wallet[];
  loading: boolean;
  createWallet: (wallet: Omit<Wallet, "id">) => Promise<void>;
  updateWallet: (id: string, updates: Partial<Wallet>) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  fetchWalletsByUser: (user_id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useWalletStore = create<WalletState>()((set, get) => ({
  wallets: [],
  loading: false,
  setLoading: (loading) => set({ loading }),

  createWallet: async (wallet) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.from("wallets").insert(wallet).select().single();
      if (error) throw error;
      set({ wallets: [data, ...get().wallets], loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  updateWallet: async (id, updates) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.from("wallets").update(updates).eq("id", id).select().single();
      if (error) throw error;
      set({ wallets: get().wallets.map((w) => (w.id === id ? { ...w, ...data } : w)), loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  deleteWallet: async (id) => {
    set({ loading: true });
    try {
      const { error } = await supabase.from("wallets").delete().eq("id", id);
      if (error) throw error;
      set({ wallets: get().wallets.filter((w) => w.id !== id), loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchWalletsByUser: async (user_id) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.from("wallets").select().eq("user_id", user_id).order("created_at", { ascending: false });
      if (error) throw error;
      set({ wallets: data, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
})); 
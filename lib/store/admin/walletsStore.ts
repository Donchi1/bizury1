import { supabase } from "@/lib/supabase";
import { Wallet } from "@/lib/types";
import { create } from "zustand";

interface WalletsStore {
    wallets: Array<Wallet>;
    isLoading: boolean;
    error: string | null;
    fetchWallets: () => Promise<void>;
    createWallet: (wallet: Wallet) => Promise<void>;
    updateWallet: (id: string, wallet: Partial<Wallet>) => Promise<void>;
    deleteWallet: (id: string) => Promise<void>;
    bulkDeleteWallets: (ids: string[]) => Promise<void>;
    setWalletDefault: (id: string) => Promise<void>;
}

export const useAdminWalletsStore = create<WalletsStore>((set, get) => ({
    wallets: [],
    isLoading: false,
    error: null,
    fetchWallets: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('wallets').select('*');
            if (error) throw error;
            set({ wallets: data || [] });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch wallets';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
    createWallet: async (wallet: Wallet) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('wallets').insert(wallet).select().single();
            if (error) throw error;
            set({ wallets: [data, ...get().wallets], isLoading: false });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create wallet';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
    updateWallet: async (id, wallet) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('wallets').update(wallet).eq('id', id).select().single();
            if (error) throw error;
            set({ wallets: get().wallets.map(w => w.id === wallet.id ? data : w), isLoading: false });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update wallet';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
    deleteWallet: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase.from('wallets').delete().eq('id', id);
            if (error) throw error;
            set({ wallets: get().wallets.filter(w => w.id !== id), isLoading: false });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete wallet';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
    bulkDeleteWallets: async (ids) => {
        set({ isLoading: true, error: null })
        try {
          const { error } = await supabase.from('wallets').delete().in('id', ids)
          if (error) throw error
          set(state => ({ wallets: state.wallets.filter(w => !ids.includes(w.id)) }))
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete wallets'
          set({ error: message })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },
      setWalletDefault: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { error: error1 } = await supabase.from('wallets').update({ is_default: false }).eq('is_default', true);
          if (error1) throw error1;
          const { error } = await supabase.from('wallets').update({ is_default: true }).eq('id', id);
          if (error) throw error;

          set({ wallets: get().wallets.map(w => w.id === id ? { ...w, is_default: true } : w), isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to set wallet as default';
          set({ error: message });
          throw error
        } finally {
          set({ isLoading: false });
        }
      }
}))    

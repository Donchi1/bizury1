import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { Recharge } from "@/lib/types";

interface RechargesStore {
    isLoading: boolean;
    error: string | null;
    recharges: Recharge[];

    // Actions
    fetchRecharges: () => Promise<Recharge[] | null>;
    createRecharge: (recharge: Recharge) => Promise<void>;
    updateRecharge: (id: Recharge["id"],recharge: Partial<Recharge>) => Promise<void>;
    deleteRecharge: (id: Recharge["id"]) => Promise<void>;
}

export const useAdminRechargesStore = create<RechargesStore>((set, get) => ({
    isLoading: false,
    error: null,
    recharges: [],

    // Actions
    fetchRecharges: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('recharges').select('*, user:profiles(*)');
            if (error) throw error;
            set({ recharges: data || [] });
            return data || null;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch recharges';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
    createRecharge: async (recharge: Recharge) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('recharges').insert(recharge).select().single();
            if (error) throw error;
            set({ recharges: [data, ...get().recharges], isLoading: false });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create recharge';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },        
    updateRecharge: async (id, recharge) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('recharges').update(recharge).eq('id',id).select().single();
            if (error) throw error;
            await get().fetchRecharges();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update recharge';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    }, 
    deleteRecharge: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase.from('recharges').delete().eq('id', id);
            if (error) throw error;
            set({ recharges: get().recharges.filter(r => r.id !== id), isLoading: false });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete recharge';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    }
}))      
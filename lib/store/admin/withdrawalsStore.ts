import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { Withdrawal } from "@/lib/types";



interface WithdrawalsStore {
    isLoading: boolean;
    error: string | null;
    withdrawals: Withdrawal[];
    fetchWithdrawals: () => Promise<Withdrawal[] | null>;
    createWithdrawal: (withdrawal: Withdrawal) => Promise<void>;
    updateWithdrawal: (id: string, withdrawal: Partial<Withdrawal>) => Promise<void>;
    deleteWithdrawal: (id: string) => Promise<void>;
}



export const useAdminWithdrawalsStore = create<WithdrawalsStore>((set, get) => ({
    isLoading: false,
    error: null,
    withdrawals: [],
    fetchWithdrawals: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('withdrawals').select('*, user:profiles(*)');
            if (error) throw error;
            set({ withdrawals: data });
            return data || null;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch withdrawals';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
    createWithdrawal: async (withdrawal: Withdrawal) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('withdrawals').insert(withdrawal).select().single();
            if (error) throw error;
            set({ withdrawals: [data, ...get().withdrawals], isLoading: false });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create withdrawal';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
    updateWithdrawal: async (id,withdrawal) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('withdrawals').update(withdrawal).eq('id',id).select().single();
            if (error) throw error;
            await get().fetchWithdrawals();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update withdrawal';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
    deleteWithdrawal: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase.from('withdrawals').delete().eq('id', id);
            if (error) throw error;
            set({ withdrawals: get().withdrawals.filter(w => w.id !== id), isLoading: false });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete withdrawal';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
}))
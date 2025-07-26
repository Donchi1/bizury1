import { supabase } from "@/lib/supabase";
import { Order, Product, Store } from "@/lib/types";
import { create } from "zustand";

interface SellingStore {
    isLoading: boolean;
    error: string | null;
    sellingStores: Store[] | null;
    storeOrders: Order[] | null;

    // Actions
    fetchSellingStores: () => Promise<Store[] | null>;
    fetchStoreOrders: () => Promise<void>;
    updateSellingStore: (data: Record<keyof Store, any>) => Promise<void>;
    deleteSellingStore: (id: string) => Promise<void>;
    createSellingStore: (data: any) => Promise<void>;
    updateStoreOrder: (data: Record<keyof Order, any>) => Promise<void>;
    deleteStoreOrder: (id: string) => Promise<void>;
    fetchStoreProducts: (store_id: string) => Promise<void>;
    deleteStoreProduct: (id: string) => Promise<void>;

}



export const useAdminSellingStore = create<SellingStore>((set, get) => ({
    isLoading: false,
    error: null,
    sellingStores: [],
    storeOrders: [],
    fetchSellingStores: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('stores')
            .select("*, products(*), followers(*)")
            if (error) throw error;
            set({ sellingStores: data || [] });
            return data || null;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch selling stores';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
        
    fetchStoreOrders: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('orders').select('*');
            if (error) throw error;
            set({ storeOrders: data || [] });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch store orders';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
        
    updateSellingStore: async (updates) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('stores').update(updates).eq('id', updates.id).select().single();
            if (error) throw error;
            set({ sellingStores: get().sellingStores?.map(s => s.id === data.id ? data : s), isLoading: false });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update selling store';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
        
    deleteSellingStore: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase.from('stores').delete().eq('id', id);
            if (error) throw error;
            set({ sellingStores: get().sellingStores?.filter(s => s.id !== id), isLoading: false });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete selling store';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
    createSellingStore: async (data: any) => {
        set({ isLoading: true, error: null });
        try {
            const { data: newData, error } = await supabase.from('stores').insert(data).select().single();
            if (error) throw error;
            set({ sellingStores: [newData, ...get().sellingStores!], isLoading: false });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create selling store';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
        
    updateStoreOrder: async (updates: Record<keyof Order, any>) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('orders').update(updates).eq('id', updates.id).select().single();
            if (error) throw error;
            set({ storeOrders: get().storeOrders?.map(o => o.id === data.id ? data : o), isLoading: false });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update store order';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
        
    deleteStoreOrder: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase.from('orders').delete().eq('id', id);
            if (error) throw error;
            set({ storeOrders: get().storeOrders?.filter(o => o.id !== id), isLoading: false });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete store order';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },
    
    fetchStoreProducts: async (store_id: string) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase.from('products').select('*').eq('store_id', store_id);
            if (error) throw error;
            set((state) => ({
                ...state,
                sellingStores: state.sellingStores?.map(s => s.id === store_id ? { ...s, products: data || [] } : s),
                isLoading: false
            }));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch store products';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    },

    deleteStoreProduct: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            set(state => ({ 
                ...state, 
                sellingStores: state.sellingStores?.map(s => s.id === id ? { ...s, products: s.products?.filter(p => p.id !== id) } : s), 
                isLoading: false
            }));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete store product';
            set({ error: message });
            throw error
        } finally {
            set({ isLoading: false });
        }
    }
}))